#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Optional MinerU compatibility proxy for xqksh-zxxq.

The web app now talks to MinerU cloud directly first. This server is only a
fallback for browsers/networks that block cross-origin requests.

Run:
    python -m pip install -r requirements-mineru.txt
    python mineru_server.py
"""
from __future__ import annotations

import base64
import io
import mimetypes
import os
import re
import time
import zipfile
from urllib.parse import urljoin

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)
AGENT = "https://mineru.net/api/v1/agent"
V4 = "https://mineru.net/api/v4"
TIMEOUT = 60


@app.after_request
def add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    return jsonify(ok=True, service="xqksh-mineru-proxy")


def fail(message, status=500):
    return jsonify(ok=False, error=str(message)), status


def poll_agent(task_id, timeout=240):
    started = time.time()
    while time.time() - started < timeout:
        r = requests.get(f"{AGENT}/parse/{task_id}", timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        if data.get("code") != 0:
            raise RuntimeError(data.get("msg") or "MinerU Agent query failed")
        item = data.get("data") or {}
        state = item.get("state")
        if state == "done":
            return item
        if state == "failed":
            raise RuntimeError(item.get("err_msg") or "MinerU Agent parse failed")
        time.sleep(1.8)
    raise TimeoutError("MinerU Agent parse timeout")


def poll_precise(batch_id, token, file_name, data_id, timeout=480):
    headers = {"Authorization": f"Bearer {token}"}
    started = time.time()
    while time.time() - started < timeout:
        r = requests.get(f"{V4}/extract-results/batch/{batch_id}", headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        if data.get("code") != 0:
            raise RuntimeError(data.get("msg") or "MinerU precise query failed")
        rows = (data.get("data") or {}).get("extract_result") or []
        row = next((x for x in rows if x.get("data_id") == data_id), None)
        if row is None:
            row = next((x for x in rows if x.get("file_name") == file_name), None)
        if row is None and rows:
            row = rows[0]
        if row:
            state = row.get("state")
            if state == "done":
                return row
            if state == "failed":
                raise RuntimeError(row.get("err_msg") or "MinerU precise parse failed")
        time.sleep(2.2)
    raise TimeoutError("MinerU precise parse timeout")


def normalize_remote_markdown_assets(markdown, markdown_url):
    base = urljoin(markdown_url, ".")
    def md_repl(m):
        src = m.group(2).strip()
        if re.match(r"^(?:data:|https?:|blob:)", src, re.I):
            return m.group(0)
        return f"![{m.group(1)}]({urljoin(base, src)})"
    markdown = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", md_repl, markdown)

    def html_repl(m):
        src = m.group(2).strip()
        if re.match(r"^(?:data:|https?:|blob:)", src, re.I):
            return m.group(0)
        return m.group(1) + urljoin(base, src) + m.group(3)
    return re.sub(r"(<img\b[^>]*\bsrc=[\"'])([^\"']+)([\"'][^>]*>)", html_repl, markdown, flags=re.I)


def zip_find(zf, md_name, rel):
    rel = rel.split("#", 1)[0].split("?", 1)[0].lstrip("./")
    md_dir = md_name.rsplit("/", 1)[0] + "/" if "/" in md_name else ""
    candidates = [md_dir + rel, rel]
    names = zf.namelist()
    for name in candidates:
        if name in names:
            return name
    base = rel.rsplit("/", 1)[-1]
    matches = [n for n in names if not n.endswith("/") and n.rsplit("/", 1)[-1] == base]
    return matches[0] if len(matches) == 1 else None


def embed_zip_assets(markdown, zf, md_name):
    refs = []
    for m in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)|<img\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*>", markdown, re.I):
        src = (m.group(1) or m.group(2) or "").strip()
        if src and not re.match(r"^(?:data:|https?:|blob:)", src, re.I) and src not in refs:
            refs.append(src)
    for src in refs:
        name = zip_find(zf, md_name, src)
        if not name:
            continue
        raw = zf.read(name)
        mime = mimetypes.guess_type(name)[0] or "image/png"
        data_uri = f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")
        markdown = markdown.replace(src, data_uri)
    return markdown


@app.route("/mineru/parse-file", methods=["POST", "OPTIONS"])
def parse_file_light():
    if request.method == "OPTIONS":
        return ("", 204)
    try:
        f = request.files.get("file")
        if not f:
            return fail("missing file", 400)
        content = f.read()
        if len(content) > 10 * 1024 * 1024:
            return fail("MinerU light mode file must be <= 10MB", 400)

        create = requests.post(
            f"{AGENT}/parse/file",
            json={
                "file_name": f.filename,
                "language": request.form.get("language", "ch"),
                "enable_table": True,
                "is_ocr": False,
                "enable_formula": True,
            },
            timeout=TIMEOUT,
        )
        create.raise_for_status()
        payload = create.json()
        if payload.get("code") != 0:
            raise RuntimeError(payload.get("msg") or "MinerU upload request failed")
        data = payload["data"]
        task_id, upload_url = data["task_id"], data["file_url"]

        put = requests.put(upload_url, data=content, timeout=TIMEOUT)
        put.raise_for_status()
        result = poll_agent(task_id)
        md_url = result.get("markdown_url")
        if not md_url:
            raise RuntimeError("MinerU did not return markdown_url")
        md_resp = requests.get(md_url, timeout=TIMEOUT)
        md_resp.raise_for_status()
        markdown = normalize_remote_markdown_assets(md_resp.text, md_url)
        return jsonify(ok=True, markdown=markdown, task_id=task_id, markdown_url=md_url)
    except Exception as exc:
        return fail(exc)


@app.route("/mineru/parse-file-precise", methods=["POST", "OPTIONS"])
def parse_file_precise():
    if request.method == "OPTIONS":
        return ("", 204)
    try:
        f = request.files.get("file")
        if not f:
            return fail("missing file", 400)
        content = f.read()
        if len(content) > 200 * 1024 * 1024:
            return fail("MinerU precise mode file must be <= 200MB", 400)

        token = (request.form.get("mineru_token") or os.environ.get("MINERU_TOKEN") or "").strip()
        if not token:
            return fail("MinerU precise mode requires mineru_token or MINERU_TOKEN", 400)
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        data_id = f"xq_{int(time.time()*1000)}"
        apply = requests.post(
            f"{V4}/file-urls/batch",
            headers=headers,
            json={
                "files": [{"name": f.filename, "data_id": data_id}],
                "model_version": "vlm",
                "language": request.form.get("language", "ch"),
                "enable_table": True,
                "enable_formula": True,
            },
            timeout=TIMEOUT,
        )
        apply.raise_for_status()
        payload = apply.json()
        if payload.get("code") != 0:
            raise RuntimeError(payload.get("msg") or "MinerU precise upload request failed")
        batch_id = payload["data"]["batch_id"]
        upload_url = payload["data"]["file_urls"][0]

        put = requests.put(upload_url, data=content, timeout=TIMEOUT)
        put.raise_for_status()
        result = poll_precise(batch_id, token, f.filename, data_id)
        zip_url = result.get("full_zip_url")
        if not zip_url:
            raise RuntimeError("MinerU did not return full_zip_url")

        zr = requests.get(zip_url, timeout=TIMEOUT)
        zr.raise_for_status()
        with zipfile.ZipFile(io.BytesIO(zr.content)) as zf:
            md_names = [n for n in zf.namelist() if re.search(r"(^|/)full\.md$", n, re.I)]
            if not md_names:
                md_names = [n for n in zf.namelist() if n.lower().endswith(".md")]
            if not md_names:
                raise RuntimeError("No Markdown file found in MinerU result ZIP")
            md_name = md_names[0]
            markdown = zf.read(md_name).decode("utf-8", errors="replace")
            markdown = embed_zip_assets(markdown, zf, md_name)

        return jsonify(ok=True, markdown=markdown, batch_id=batch_id, full_zip_url=zip_url)
    except Exception as exc:
        return fail(exc)


if __name__ == "__main__":
    print("MinerU compatibility proxy: http://127.0.0.1:8765")
    print("Health check: http://127.0.0.1:8765/health")
    app.run(host="127.0.0.1", port=8765, debug=False, threaded=True)
