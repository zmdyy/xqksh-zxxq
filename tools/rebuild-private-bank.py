#!/usr/bin/env python3
"""Rebuild a PRIVATE candidate in a new output directory; never edit input files.

Only uniquely aligned source text is applied. Teacher edits, ambiguous alignment,
unsupported OMML and missing sources are retained for review. No question is deleted.
Requires lxml. Formula and original-file provenance remain in the private outputs.
"""
import argparse
import collections
import copy
import hashlib
import json
import posixpath
import re
import unicodedata
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from lxml import etree

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
M = 'http://schemas.openxmlformats.org/officeDocument/2006/math'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'w': W, 'm': M, 'r': R}
SUB = '₀₁₂₃₄₅₆₇₈₉'
SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def local(n):
    return etree.QName(n).localname if isinstance(n.tag, str) else ''

def child(n, k):
    return next((c for c in n if local(c) == k), None) if n is not None else None

def val(n, default=''):
    if n is None:
        return default
    return n.get('{'+M+'}val', n.get('{'+W+'}val', default))

def tex_text(s):
    s = s.replace('−', '-').replace('﹣', '-').replace('∆', 'Δ')
    greek = {'ρ': r'\rho ', 'Δ': r'\Delta ', 'π': r'\pi ', 'η': r'\eta ', 'θ': r'\theta ', 'λ': r'\lambda ', 'α': r'\alpha ', 'β': r'\beta ', 'μ': r'\mu ', 'Ω': r'\Omega '}
    s = re.sub(r'[ρΔπηθλαβμΩ]', lambda m: greek[m[0]], s)
    s = s.replace('×', r'\times ').replace('÷', r'\div ').replace('·', r'\cdot ').replace('≤', r'\leq ').replace('≥', r'\geq ').replace('≠', r'\neq ')
    s = re.sub(r'[%&#$]', lambda m: '\\'+m[0], s)
    s = re.sub(r'[\u4e00-\u9fff℃]+', lambda m: r'\text{'+m[0]+'}', s)
    return s

def omml(n):
    if n is None:
        return ''
    k = local(n)
    if k.endswith('Pr'):
        return ''
    if k == 't':
        return tex_text(n.text or '')
    if k == 'f':
        return r'\frac{'+omml(child(n, 'num'))+'}{'+omml(child(n, 'den'))+'}'
    if k in ('sSub', 'sSup', 'sSubSup'):
        return '{'+omml(child(n, 'e'))+'}'+('_{'+omml(child(n, 'sub'))+'}' if child(n, 'sub') is not None else '')+('^{'+omml(child(n, 'sup'))+'}' if child(n, 'sup') is not None else '')
    if k == 'rad':
        deg = omml(child(n, 'deg'))
        return r'\sqrt'+('['+deg+']' if deg else '')+'{'+omml(child(n, 'e'))+'}'
    if k == 'd':
        pr = child(n, 'dPr')
        delim = lambda x: {'': '.', '{': r'\{', '}': r'\}'}.get(x, x)
        beg, end = val(child(pr, 'begChr'), '('), val(child(pr, 'endChr'), ')')
        sep = val(child(pr, 'sepChr'), '|')
        return r'\left'+delim(beg)+sep.join(omml(c) for c in n if local(c) == 'e')+r'\right'+delim(end)
    if k == 'acc':
        a = val(child(child(n, 'accPr'), 'chr'), '̂')
        cmd = {'̂': 'hat', '̄': 'bar', '⃗': 'vec', '̃': 'tilde', '̇': 'dot', '̈': 'ddot'}.get(a)
        if not cmd:
            raise ValueError('Unsupported math accent: '+a)
        return '\\'+cmd+'{'+omml(child(n, 'e'))+'}'
    if k == 'bar':
        return ('\\underline' if val(child(child(n, 'barPr'), 'pos')) == 'bot' else '\\overline')+'{'+omml(child(n, 'e'))+'}'
    if k == 'func':
        return omml(child(n, 'fName'))+' '+omml(child(n, 'e'))
    if k in ('limLow', 'limUpp'):
        return '{'+omml(child(n, 'e'))+'}'+('_{' if k == 'limLow' else '^{')+omml(child(n, 'lim'))+'}'
    if k in ('nary', 'm', 'eqArr', 'groupChr'):
        raise ValueError('Unsupported OMML structure: '+k)
    return ''.join(omml(c) for c in n)

def walk(n, math=True):
    k = local(n)
    if k in ('oMath', 'oMathPara'):
        if math == 'flat':
            return ''.join(n.xpath('.//m:t/text()', namespaces=NS))
        return r'\('+omml(n)+r'\)' if math else ''
    if k == 't':
        return n.text or ''
    if k == 'tab':
        return ' '
    if k in ('br', 'cr'):
        return '\n'
    if k in ('rPr', 'pPr', 'drawing', 'object', 'pict'):
        return ''
    if k == 'r':
        t = ''.join(walk(c, math) for c in n if local(c) != 'rPr')
        align = val(child(child(n, 'rPr'), 'vertAlign'))
        if math is True and align in ('subscript', 'superscript') and t:
            if t.isdigit():
                return ''.join((SUB if align == 'subscript' else SUP)[int(c)] for c in t)
            return r'\({}'+('_' if align == 'subscript' else '^')+'{'+tex_text(t)+r'}\)'
        return t
    if k == 'tbl':
        rows = []
        for row in n:
            if local(row) != 'tr':
                continue
            rows.append(' | '.join('；'.join(walk(c, math).strip() for c in cell if local(c) == 'p') for cell in row if local(cell) == 'tc'))
        return '\n'.join(rows)
    return ''.join(walk(c, math) for c in n)

def source_no_strip(text):
    # Never treat a decimal such as 1.0 N as a question number.
    return re.sub(r'^\s*\d{1,3}(?:[．、]|\.(?!\d))\s*(?:【答案】)?', '', text)

def normalize(text):
    text = unicodedata.normalize('NFKC', source_no_strip(str(text)))
    text = re.sub(r'\u200b|\u00ad', '', text)
    return re.sub(r'[\s|；;]+', '', text)

def skeleton(text):
    return normalize(re.sub(r'\\\([\s\S]*?\\\)', '', text))

def normalized_span(text, needle):
    """Return a unique exact-normalized span; preserve math and surrounding prose."""
    normalized, positions = [], []
    for i, char in enumerate(text):
        for c in unicodedata.normalize('NFKC', char):
            if not re.match(r'[\s\u200b\u00ad]', c):
                normalized.append(c)
                positions.append(i)
    hay = ''.join(normalized)
    key = re.sub(r'[\s\u200b\u00ad]', '', unicodedata.normalize('NFKC', needle))
    if len(key) < 20 or hay.count(key) != 1:
        return None
    start = hay.index(key)
    return positions[start], positions[start+len(key)-1]+1

def protected(q, field):
    return q.get('review') == 'approved' or any(field in h.get('changes', {}) for h in q.get('qualityEditHistory', []))

def extract_doc(entry):
    f = Path(entry['local_path'])
    raw = f.read_bytes()
    if sha(raw) != entry['sha256']:
        raise ValueError('Source hash mismatch: '+entry['name'])
    z = zipfile.ZipFile(f)
    root = etree.fromstring(z.read('word/document.xml'))
    body = root.find('w:body', NS)
    blocks = []
    for index, n in enumerate(body):
        if local(n) not in ('p', 'tbl'):
            continue
        plain = walk(n, False).strip()
        flat = walk(n, 'flat').strip()
        error = None
        try:
            rendered = walk(n).strip()
        except ValueError as e:
            rendered, error = plain, str(e)
        blocks.append({'index': index, 'plain': plain, 'flat': flat, 'text': rendered, 'kind': local(n), 'error': error,
                       'mathCount': len(n.xpath('.//m:oMath', namespaces=NS)),
                       'scriptCount': len(n.xpath('.//w:vertAlign', namespaces=NS))})
    records = {'stem': collections.defaultdict(list), 'answer': collections.defaultdict(list)}
    phase, current, current_no = 'stem', None, None
    for b in blocks:
        t = b['plain']
        if re.fullmatch(r'.{0,15}(?:答案解析部分|参考答案与试题解析|参考答案|答案及解析|答案与解析).{0,8}', t):
            phase, current, current_no = 'answer', None, None
            continue
        m = re.match(r'^\s*(\d{1,3})[．.、]\s*(.*)', t)
        # Decimal arithmetic and numbered explanations cannot open question records.
        if m and (not m[2] or not re.match(r'^\d', m[2])):
            no = m[1]
            if current is None or int(no) == 1 or int(no) == int(current_no)+1:
                current = {'no': no, 'blocks': []}
                records[phase][no].append(current)
                current_no = no
        if current is not None:
            current['blocks'].append(b)
    out = {'name': entry['name'], 'sha256': entry['sha256'], 'records': {}}
    for field, by_no in records.items():
        out['records'][field] = {}
        for no, items in by_no.items():
            out['records'][field][no] = [{**i, 'plain': source_no_strip('\n'.join(b['plain'] for b in i['blocks'] if b['plain'])),
                                          'flat': source_no_strip('\n'.join(b['flat'] for b in i['blocks'] if b['flat'])),
                                          'text': source_no_strip('\n'.join(b['text'] for b in i['blocks'] if b['text'])),
                                          'errors': [b['error'] for b in i['blocks'] if b['error']]} for i in items]
    return out

def apply_source(q, field, records, fixes, pending):
    original = q.get(field, '')
    candidates = []
    for source, no in [(q.get('source'), str(q.get('sourceNo', '')))] + [(r.get('file'), str(r.get('no', ''))) for r in q.get('sourceRefs', [])]:
        doc = records.get(source)
        if doc:
            for candidate in doc['records'][field].get(no, []):
                if candidate['text'] != candidate['plain']:
                    candidates.append((source, doc, candidate))
    # Exact normalized skeleton alignment is required. Never use fuzzy similarity to apply.
    matched = [(s, d, c) for s, d, c in candidates if normalize(original) in {normalize(c['plain']), normalize(c.get('flat', c['plain']))} or skeleton(original) == normalize(c['plain'])]
    unique = {normalize(c['text']): (s, d, c) for s, d, c in matched if not c['errors']}
    if len(unique) == 1 and not protected(q, field):
        s, d, c = next(iter(unique.values()))
        restored = c['text']
        if normalize(original) != normalize(restored):
            # Existing formulas are protected unless the source skeleton matches and is richer.
            if r'\(' in original and original.count(r'\(') >= restored.count(r'\('):
                pending.append({'id': q['id'], 'field': field, 'reason': '已有公式保留，原Word候选供核对', 'source': s, 'candidate': restored})
                return
            q[field] = restored
            fixes.append({'id': q['id'], 'field': field, 'before': original, 'after': restored, 'method': 'unique-original-word-alignment',
                          'source': s, 'sourceSha256': d['sha256'], 'sourceNo': c['no'], 'blockIndexes': [b['index'] for b in c['blocks']],
                          'mathObjects': sum(b['mathCount'] for b in c['blocks']), 'scriptRuns': sum(b['scriptCount'] for b in c['blocks'])})
            return
    if candidates:
        # Try exact unique paragraph anchors without replacing teacher wording elsewhere.
        if not protected(q, field):
            new = original
            applied = []
            visited = set()
            anchor_alternatives = collections.defaultdict(set)
            for _, _, c in candidates:
                for b in c['blocks']:
                    anchor_alternatives[normalize(b['plain'])].add(normalize(b['text']))
                    anchor_alternatives[normalize(b.get('flat', b['plain']))].add(normalize(b['text']))
            for s, d, c in candidates:
                if c['errors']:
                    continue
                for b in c['blocks']:
                    anchor_key = (s, b['index'])
                    if anchor_key in visited:
                        continue
                    visited.add(anchor_key)
                    if b['text'] == b['plain'] or not b['plain'] or len(normalize(b['plain'])) < 12:
                        continue
                    if len(anchor_alternatives[normalize(b['plain'])]) != 1:
                        continue
                    target = source_no_strip(b['text'])
                    for old in dict.fromkeys([source_no_strip(b.get('flat', b['plain'])), source_no_strip(b['plain'])]):
                        if len(anchor_alternatives[normalize(old)]) != 1 or target in new:
                            continue
                        span = normalized_span(new, old)
                        if span:
                            start, end = span
                            prefix = new[new.rfind('\n', 0, start)+1:start]
                            suffix = new[end:new.find('\n', end) if '\n' in new[end:] else len(new)]
                            if not re.fullmatch(r'\s*(?:\d{1,3}[．.、]\s*)?', prefix) or suffix.strip():
                                continue
                            # Reject a match contained in or immediately followed by existing math.
                            inside_math = any(m.start() < end and m.end() > start for m in re.finditer(r'\\\([\s\S]*?\\\)', new))
                            if not inside_math and not new[end:].startswith(r'\('):
                                new = new[:start]+target+new[end:]
                                applied.append({'source': s, 'sourceSha256': d['sha256'], 'blockIndex': b['index'], 'alignment': 'unique-normalized-paragraph'})
                                break
            if new != original:
                q[field] = new
                fixes.append({'id': q['id'], 'field': field, 'before': original, 'after': new, 'method': 'unique-word-paragraph-anchor', 'anchors': applied})
        pending.append({'id': q['id'], 'field': field, 'reason': '教师字段受保护' if protected(q, field) else '原Word与母版不能唯一完整对齐',
                        'source': candidates[0][0], 'candidate': candidates[0][2]['text'], 'sourceErrors': candidates[0][2]['errors']})

def main():
    a = argparse.ArgumentParser()
    a.add_argument('--v4', required=True)
    a.add_argument('--raw', required=True)
    a.add_argument('--word-index', required=True)
    a.add_argument('--wmf-map', required=True)
    a.add_argument('--out', required=True)
    args = a.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if (out/'candidate-math.json').exists():
        raise ValueError('Output already exists; use a new version directory')
    bank = json.loads(Path(args.v4).read_text())
    z = zipfile.ZipFile(args.raw)
    raw = json.loads(z.read('bank.json'))
    entries = json.loads(Path(args.word_index).read_text())
    records = {e['name']: extract_doc(e) for e in entries}
    (out/'word-extracted.json').write_text(json.dumps(records, ensure_ascii=False))
    ids = {q['id'] for q in bank['questions']}
    added = []
    for source_q in raw['questions']:
        if source_q['id'] not in ids:
            q = copy.deepcopy(source_q)
            q['rebuildOrigin'] = {'package': Path(args.raw).name, 'sourceQuestionId': q['id'], 'reason': '原始记录不在V4中；恢复原件待审核'}
            q.setdefault('warnings', []).append('恢复原始记录；不代表题目内容及答案已经人工验收')
            bank['questions'].append(q)
            added.append(q['id'])
    fixes, pending = [], []
    wmf_map = json.loads(Path(args.wmf_map).read_text())
    originals = []
    for q in bank['questions']:
        for field in ('stem', 'answer'):
            apply_source(q, field, records, fixes, pending)
        # Original WMF objects and placeholder order provide explicit formula positions.
        for field, images_field in [('stem', 'images'), ('answer', 'answerImages')]:
            images = q.get(images_field, [])
            wmf_ref = lambda im: next((im[k] for k in ('ref', 'originalRefInPackage') if im.get(k, '').lower().endswith('.wmf')), None)
            objects = [im for im in images if wmf_ref(im)]
            text = q.get(field, '')
            marker_pattern = r'⟦嵌入对象/公式⟧|\[嵌入对象/公式\]|嵌入对象/公式'
            markers = list(re.finditer(marker_pattern, text))
            if objects and len(markers) == len(objects) and not protected(q, field):
                replacements = []
                for im in objects:
                    key = wmf_ref(im)
                    data = z.read(key)
                    mapping = wmf_map.get(key)
                    if not mapping or mapping['sha256'] != sha(data):
                        replacements = []
                        break
                    replacements.append(mapping)
                if replacements:
                    at = 0
                    def replace(m):
                        nonlocal at
                        t = replacements[at]['tex']
                        at += 1
                        return r'\('+t+r'\)'
                    new = re.sub(marker_pattern, replace, text)
                    q[field] = new
                    provenance = [{'originalRef': wmf_ref(im), 'sha256': m['sha256'], 'tex': m['tex'], 'basis': m['basis'], 'originalImageRecord': im} for im, m in zip(objects, replacements)]
                    q.setdefault('mathOriginalResourcesV5', []).extend(provenance)
                    # Formula previews become native math; every original is retained in a separate resource index.
                    q[images_field] = [im for im in images if im not in objects]
                    originals.extend(provenance)
                    fixes.append({'id': q['id'], 'field': field, 'before': text, 'after': new, 'method': 'wmf-source-position-and-visual-verification', 'objects': provenance})
            elif objects:
                pending.append({'id': q['id'], 'field': field, 'reason': 'WMF对象位置不能唯一对齐；保留原件', 'objects': [im['ref'] for im in objects]})
    now = datetime.now(timezone.utc).isoformat()
    for q in bank['questions']:
        changes = [f for f in fixes if f['id'] == q['id']]
        if changes:
            q['qualityFixes'] = q.get('qualityFixes', []) + [{**f, 'at': now, 'candidateOnly': True} for f in changes]
            q['mathRecoveryV5'] = {'at': now, 'fieldChanges': len(changes), 'state': 'awaitingAcceptance', 'originalsRetained': True}
            q['revision'] = q.get('revision', 1)+1
            q['updatedAt'] = now
    manifest = [{k: v for k, v in e.items() if k != 'local_path'} | {'packagePath': 'sources/word/'+e['name']} for e in entries]
    bank['rebuildV5'] = {'at': now, 'originalV4Sha256': sha(Path(args.v4).read_bytes()), 'rawPackageSha256': sha(Path(args.raw).read_bytes()),
                         'sourceWordCount': len(entries), 'addedOriginalIds': added, 'policy': '独立候选；无自动删除；来源不能唯一对齐则人工复核'}
    for name, value in [('candidate-math.json', bank), ('math-fixes.json', fixes), ('math-manual-review.json', pending), ('source-manifest.json', manifest)]:
        (out/name).write_text(json.dumps(value, ensure_ascii=False, indent=2))
    print(json.dumps({'total': len(bank['questions']), 'added': added, 'wordSources': len(records), 'changedQuestions': len({f['id'] for f in fixes}), 'fieldFixes': len(fixes), 'manualFields': len(pending)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
