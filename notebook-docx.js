function xmlEscapeDocx(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function docxTextRun(text) {
    var t = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!t) return '';
    var parts = t.split('\n');
    var out = '';
    for (var i = 0; i < parts.length; i++) {
        if (i) out += '<w:br/>';
        out += '<w:t xml:space="preserve">' + xmlEscapeDocx(parts[i]) + '</w:t>';
    }
    return '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="宋体" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>' + out + '</w:r>';
}
function docxParagraph(innerXml, extraPpr) {
    return '<w:p><w:pPr><w:spacing w:after="80"/>' + (extraPpr || '') + '</w:pPr>' + (innerXml || '') + '</w:p>';
}
function docxHeading(text, sz) {
    var run = docxTextRun(text).replace('w:sz w:val="24"', 'w:sz w:val="' + (sz || 32) + '"').replace('w:szCs w:val="24"', 'w:szCs w:val="' + (sz || 32) + '"');
    return docxParagraph(run);
}
function stripMarkdownLight(text) {
    return String(text || '')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/<img\b[^>]*>/gi, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
function tokenizeNotebookMarkdown(md) {
    var tokens = [];
    var s = String(md || '');
    var re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$|!\[([^\]]*)\]\(([^)]+)\)|<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
    var last = 0, m;
    while ((m = re.exec(s))) {
        if (m.index > last) tokens.push({ type: 'text', value: s.slice(last, m.index) });
        if (m[1] != null) tokens.push({ type: 'math', display: true, value: String(m[1]).trim() });
        else if (m[2] != null) tokens.push({ type: 'math', display: false, value: String(m[2]).trim() });
        else if (m[4] != null) tokens.push({ type: 'image', src: String(m[4]).trim(), alt: m[3] || '' });
        else if (m[5] != null) tokens.push({ type: 'image', src: String(m[5]).trim(), alt: '' });
        last = m.index + m[0].length;
    }
    if (last < s.length) tokens.push({ type: 'text', value: s.slice(last) });
    return tokens;
}
function prepareLatexForOmml(latex) {
    var s = String(latex || '').trim();
    if (!s) return s;
    s = s.replace(/[ρϱ]/g, '\\rho ');
    s = s.replace(/\\blacktriangle/g, '\\triangle');
    s = s.replace(/\\underbrace\{[\s\S]*?\}(?:_\{[^}]*\})?/g, function(m) {
        if (/triangle|[▲△▴▵]/i.test(m)) return '\\text{▲}';
        return m;
    });
    s = s.replace(/\\underline\{\s*(\\triangle|[▲△▴▵])\s*\}/g, '\\text{▲}');
    s = s.replace(/=\s*(\\triangle|[▲△▴▵])/g, '=\\text{▲}');
    s = s.replace(/[▲△▴▵]/g, '\\text{▲}');
    s = s.replace(/\\text\{\s*\\text\{([^}]*)\}\s*\}/g, '\\text{$1}');
    var ph = [];
    s = s.replace(/\\(?:text|mathrm|textrm|mathbf|mbox)\{[^{}]*\}/g, function(m) {
        ph.push(m);
        return '@@T' + (ph.length - 1) + '@@';
    });
    s = s.replace(/[\u4e00-\u9fa5]+/g, function(han) { return '\\text{' + han + '}'; });
    ph.forEach(function(m, i) { s = s.split('@@T' + i + '@@').join(m); });
    s = s.replace(/_(\\text\{[^}]+\})/g, '_{$1}');
    s = s.replace(/\^(\\text\{[^}]+\})/g, '^{$1}');
    return s;
}
function applyOmmlTextPlaceholders(omml, map) {
    var out = String(omml);
    map.forEach(function(text, i) {
        var id = hzPlaceholderId(i);
        out = out.split(id).join(text);
    });
    return out;
}
function hzPlaceholderId(i) {
    return 'Hz' + String.fromCharCode(97 + Math.floor(i / 26)) + String.fromCharCode(97 + (i % 26));
}
function withLatexTextPlaceholders(latex) {
    var map = [];
    var s = String(latex || '');
    s = s.replace(/\\text\{([^}]*)\}/g, function(_, inner) {
        if (!/[\u4e00-\u9fa5▲△]/.test(inner)) return '\\text{' + inner + '}';
        var id = hzPlaceholderId(map.length);
        map.push(inner);
        return '\\text{' + id + '}';
    });
    return { latex: s, map: map };
}
function sanitizeMathMlForOmml(mml) {
    var s = String(mml || '');
    s = s.replace(/<annotation[\s\S]*?<\/annotation>/gi, '');
    s = s.replace(/<(mi|mo|mn)([^>]*)>([\u4e00-\u9fa5]+)<\/\1>/g, '<mtext$2>$3</mtext>');
    s = s.replace(/<(mi|mo|mn)([^>]*)>([▲△▴▵▼▽]|&#965[0-3];|&#x25B[2-5];)<\/\1>/gi, '<mtext>▲</mtext>');
    if (typeof DOMParser === 'undefined') return s;
    var wrapped = /<math[\s>]/i.test(s) ? s : '<math xmlns="http://www.w3.org/1998/Math/MathML">' + s + '</math>';
    var doc = new DOMParser().parseFromString(wrapped, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return s;
    var underTags = ['munder', 'munderover', 'mover'];
    underTags.forEach(function(tag) {
        var nodes = [].slice.call(doc.getElementsByTagName(tag));
        nodes.forEach(function(node) {
            var txt = String(node.textContent || '');
            if (/[▲△▴▵]|triangle/i.test(txt) || /[\u23DF\u23B4\u00AF]/.test(txt) && /[▲△▴▵\u25B2\u25B3]/.test(txt)) {
                var mtext = doc.createElementNS('http://www.w3.org/1998/Math/MathML', 'mtext');
                mtext.textContent = '▲';
                if (node.parentNode) node.parentNode.replaceChild(mtext, node);
            }
        });
    });
    return new XMLSerializer().serializeToString(doc);
}
function latexToOmml(latex, displayMode) {
    if (!latex || typeof katex === 'undefined' || typeof mml2omml !== 'function') return null;
    try {
        var prepared = prepareLatexForOmml(latex);
        var placed = withLatexTextPlaceholders(prepared);
        var html = '';
        try {
            html = katex.renderToString(placed.latex, { throwOnError: false, displayMode: !!displayMode, output: 'mathml', strict: 'ignore' });
        } catch (e1) {
            html = katex.renderToString(placed.latex, { throwOnError: false, displayMode: !!displayMode });
        }
        var mathMatch = String(html).match(/<math[\s\S]*?<\/math>/i);
        if (!mathMatch) {
            html = katex.renderToString(placed.latex, { throwOnError: false, displayMode: !!displayMode });
            mathMatch = String(html).match(/<math[\s\S]*?<\/math>/i);
        }
        if (!mathMatch) return null;
        var mml = sanitizeMathMlForOmml(mathMatch[0]);
        var omml = mml2omml(mml);
        if (!omml || omml.indexOf('m:oMath') < 0) return null;
        omml = omml.replace(/<\?xml[^>]*>/, '').trim();
        if (omml.indexOf('xmlns:m=') < 0) omml = omml.replace('<m:oMath', '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"');
        omml = applyOmmlTextPlaceholders(omml, placed.map);
        return patchOmmlEastAsia(omml);
    } catch (e) {
        console.warn('公式转 OMML 失败:', latex, e);
        return null;
    }
}
var UNICODE_SUB = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ' };
var UNICODE_SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','n':'ⁿ' };
function mapScriptChars(str, table) {
    return String(str || '').split('').map(function(ch) { return table[ch] || ch; }).join('');
}
function unwrapLatexFonts(s) {
    var fontCmd = /\\(?:mathrm|operatorname|text|textrm|textbf|textup|textit|mathit|mathbf|mathsf|mathscr|mathcal|mathfrak|mbox|hbox|bm|bold|boldsymbol|scriptsize|scriptstyle|textstyle|displaystyle|tiny|small|large|huge|normalsize)\{([^{}]*)\}/g;
    var prev = '', guard = 0;
    s = String(s || '');
    while (s !== prev && guard++ < 24) {
        prev = s;
        fontCmd.lastIndex = 0;
        s = s.replace(fontCmd, '$1');
    }
    return s;
}
function latexToPlainUnicode(latex) {
    var s = unwrapLatexFonts(latex);
    s = s.replace(/\\underbrace\{([^{}]*)\}(?:_\{[^{}]*\})?/g, '$1');
    s = s.replace(/\\underline\{([^{}]*)\}/g, '$1');
    s = s.replace(/\\overline\{([^{}]*)\}/g, '$1');
    s = unwrapLatexFonts(s);
    s = s.replace(/\\(black)?triangle\b/g, '▲');
    s = s.replace(/\\rho\s*/gi, 'ρ');
    s = s.replace(/\\times/g, '×');
    s = s.replace(/\\div/g, '÷');
    s = s.replace(/\\pm/g, '±');
    s = s.replace(/\\cdot/g, '·');
    s = s.replace(/\\leq/g, '≤');
    s = s.replace(/\\geq/g, '≥');
    s = s.replace(/\\neq/g, '≠');
    s = s.replace(/\\pi/g, 'π');
    s = s.replace(/\\alpha/g, 'α');
    s = s.replace(/\\beta/g, 'β');
    s = s.replace(/\\gamma/g, 'γ');
    s = s.replace(/\\Delta/g, 'Δ');
    s = s.replace(/\\infty/g, '∞');
    s = s.replace(/\\circ/g, '°');
    s = s.replace(/\\[,;! ]/g, ' ');
    s = s.replace(/~/g, ' ');
    s = s.replace(/_\{([^}]+)\}/g, function(_, sub) {
        if (/[\u4e00-\u9fa5]/.test(sub)) return '_' + sub;
        return mapScriptChars(sub, UNICODE_SUB);
    });
    s = s.replace(/_([\u4e00-\u9fa5]+)/g, '_$1');
    s = s.replace(/_([A-Za-z0-9‰])/g, function(_, ch) { return UNICODE_SUB[ch] || (ch === '‰' ? '水' : ch); });
    s = s.replace(/\^\{([^}]+)\}/g, function(_, sup) { return mapScriptChars(sup, UNICODE_SUP); });
    s = s.replace(/\^([A-Za-z0-9])/g, function(_, ch) { return UNICODE_SUP[ch] || ch; });
    s = s.replace(/\\[A-Za-z]+/g, '');
    s = s.replace(/[{}]/g, '');
    s = s.replace(/V[_ ]*G\b/g, 'V_石');
    s = s.replace(/ρ[_ ]*(‰|%|o)/g, 'ρ_水');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}
function preferPlainUnicode(latex) {
    if (/\\frac|\\sqrt|\\sum|\\int|\\begin|\\left|\\right|\\dfrac/.test(String(latex || ''))) return false;
    var cleaned = latexToPlainUnicode(latex);
    if (!cleaned || /\\/.test(cleaned)) return false;
    if (/[\u4e00-\u9fa5▲△]/.test(String(latex || '') + cleaned)) return true;
    if (/[ρρ]/.test(cleaned) && /[₀-₉水]/.test(cleaned)) return true;
    if (/[₀-₉]/.test(cleaned) && cleaned.length < 40) return true;
    return false;
}
function patchOmmlEastAsia(omml) {
    if (!omml || typeof DOMParser === 'undefined') return omml;
    var xml = String(omml);
    if (xml.indexOf('xmlns:w=') < 0) {
        xml = xml.replace(/<m:oMath\b/, '<m:oMath xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"');
    }
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return omml;
    var ns = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
    var wns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    var texts = doc.getElementsByTagNameNS(ns, 't');
    var needEast = /[\u4e00-\u9fa5▲△＿]/;
    for (var i = 0; i < texts.length; i++) {
        var tNode = texts[i];
        if (!needEast.test(tNode.textContent || '')) continue;
        var r = tNode.parentNode;
        if (!r || r.localName !== 'r') continue;
        var rPr = null, mRpr = null;
        for (var c = 0; c < r.childNodes.length; c++) {
            var ch = r.childNodes[c];
            if (ch.nodeType !== 1) continue;
            if (ch.localName === 'rPr' && ch.namespaceURI === wns) rPr = ch;
            if (ch.localName === 'rPr' && ch.namespaceURI === ns) mRpr = ch;
        }
        if (!mRpr) {
            mRpr = doc.createElementNS(ns, 'm:rPr');
            r.insertBefore(mRpr, tNode);
        }
        var hasNor = false;
        for (var n = 0; n < mRpr.childNodes.length; n++) {
            if (mRpr.childNodes[n].localName === 'nor') hasNor = true;
        }
        if (!hasNor) mRpr.insertBefore(doc.createElementNS(ns, 'm:nor'), mRpr.firstChild);
        if (!rPr) {
            rPr = doc.createElementNS(wns, 'w:rPr');
            r.insertBefore(rPr, r.firstChild);
        }
        var fonts = null;
        for (var f = 0; f < rPr.childNodes.length; f++) {
            if (rPr.childNodes[f].localName === 'rFonts') fonts = rPr.childNodes[f];
        }
        if (!fonts) {
            fonts = doc.createElementNS(wns, 'w:rFonts');
            rPr.appendChild(fonts);
        }
        fonts.setAttribute('w:ascii', '宋体');
        fonts.setAttribute('w:hAnsi', '宋体');
        fonts.setAttribute('w:eastAsia', '宋体');
        fonts.setAttribute('w:cs', '宋体');
    }
    var out = new XMLSerializer().serializeToString(doc);
    out = out.replace(/ xmlns:m="http:\/\/www\.w3\.org\/1998\/Math\/MathML"/g, '');
    return out;
}
function guessImageExt(src, mime) {
    var m = String(mime || '').toLowerCase();
    if (m.indexOf('jpeg') >= 0 || m.indexOf('jpg') >= 0) return 'jpeg';
    if (m.indexOf('gif') >= 0) return 'gif';
    if (m.indexOf('png') >= 0) return 'png';
    var s = String(src || '').toLowerCase();
    if (s.indexOf('image/jpeg') >= 0 || /\.jpe?g(\?|$)/.test(s)) return 'jpeg';
    if (s.indexOf('image/gif') >= 0 || /\.gif(\?|$)/.test(s)) return 'gif';
    return 'png';
}
function dataUriToBytes(dataUri) {
    var m = String(dataUri).match(/^data:([^;,]+)?(;base64)?,(.*)$/i);
    if (!m) return null;
    var mime = m[1] || 'image/png';
    var payload = m[3] || '';
    try {
        if (m[2]) {
            var bin = atob(payload);
            var bytes = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return { bytes: bytes, mime: mime };
        }
        var txt = decodeURIComponent(payload);
        var bytes2 = new TextEncoder().encode(txt);
        return { bytes: bytes2, mime: mime };
    } catch (e) { return null; }
}
function probeImageSize(bytes, mime) {
    return new Promise(function(resolve) {
        try {
            var blob = new Blob([bytes], { type: mime || 'image/png' });
            var url = URL.createObjectURL(blob);
            var img = new Image();
            img.onload = function() {
                URL.revokeObjectURL(url);
                resolve({ w: img.naturalWidth || 400, h: img.naturalHeight || 300 });
            };
            img.onerror = function() { URL.revokeObjectURL(url); resolve({ w: 400, h: 300 }); };
            img.src = url;
        } catch (e) { resolve({ w: 400, h: 300 }); }
    });
}
async function resolveNotebookImage(src) {
    if (!src) return null;
    src = String(src).trim();
    if (/^data:image\//i.test(src)) {
        var parsed = dataUriToBytes(src);
        if (!parsed) return null;
        var size = await probeImageSize(parsed.bytes, parsed.mime);
        return { bytes: parsed.bytes, ext: guessImageExt(src, parsed.mime), w: size.w, h: size.h };
    }
    try {
        var resp = await fetch(src, { mode: 'cors' });
        if (!resp.ok) return null;
        var buf = new Uint8Array(await resp.arrayBuffer());
        var mime = resp.headers.get('content-type') || 'image/png';
        var size2 = await probeImageSize(buf, mime);
        return { bytes: buf, ext: guessImageExt(src, mime), w: size2.w, h: size2.h };
    } catch (e) {
        console.warn('错题本题图读取失败:', src, e);
        return null;
    }
}
function docxImageDrawing(relId, cx, cy, docPrId) {
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">' +
        '<wp:extent cx="' + cx + '" cy="' + cy + '"/>' +
        '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
        '<wp:docPr id="' + docPrId + '" name="Picture ' + docPrId + '"/>' +
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
        '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
        '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
        '<pic:nvPicPr><pic:cNvPr id="0" name="image' + docPrId + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
        '<pic:blipFill><a:blip r:embed="' + relId + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
        '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
}
async function markdownStemToDocxBody(md, mediaBag) {
    var tokens = tokenizeNotebookMarkdown(md || '');
    var paragraphs = [];
    var inlineBuf = '';
    var flushInline = function() {
        if (inlineBuf) {
            paragraphs.push(docxParagraph(inlineBuf));
            inlineBuf = '';
        }
    };
    for (var i = 0; i < tokens.length; i++) {
        var tok = tokens[i];
        if (tok.type === 'text') {
            var plain = stripMarkdownLight(tok.value);
            if (!plain) continue;
            var chunks = plain.split(/\n{2,}/);
            for (var c = 0; c < chunks.length; c++) {
                var chunk = chunks[c].replace(/^\n+|\n+$/g, '');
                if (!chunk) {
                    flushInline();
                    continue;
                }
                if (c === 0) inlineBuf += docxTextRun(chunk);
                else {
                    flushInline();
                    inlineBuf = docxTextRun(chunk);
                }
            }
        } else if (tok.type === 'math') {
            if (preferPlainUnicode(tok.value)) {
                inlineBuf += docxTextRun(latexToPlainUnicode(tok.value));
            } else {
                var omml = latexToOmml(tok.value, tok.display);
                if (omml) {
                    if (tok.display) {
                        flushInline();
                        paragraphs.push(docxParagraph(omml.replace('<m:oMath', '<m:oMathPara><m:oMath').replace(/<\/m:oMath>\s*$/, '</m:oMath></m:oMathPara>')));
                    } else {
                        inlineBuf += omml;
                    }
                } else {
                    inlineBuf += docxTextRun(latexToPlainUnicode(tok.value) || tok.value);
                }
            }
        } else if (tok.type === 'image') {
            flushInline();
            var img = await resolveNotebookImage(tok.src);
            if (img && img.bytes) {
                var maxCx = 5486400;
                var ratio = img.h / Math.max(img.w, 1);
                var cx = Math.min(maxCx, Math.round(img.w * 9525));
                var cy = Math.round(cx * ratio);
                var idx = mediaBag.length + 1;
                var relId = 'rIdImg' + idx;
                var ext = img.ext === 'jpg' ? 'jpeg' : img.ext;
                mediaBag.push({ relId: relId, name: 'image' + idx + '.' + ext, bytes: img.bytes, ext: ext });
                paragraphs.push(docxParagraph(docxImageDrawing(relId, cx, cy, idx)));
            } else if (tok.alt) {
                paragraphs.push(docxParagraph(docxTextRun('[' + tok.alt + ']')));
            }
        }
    }
    flushInline();
    return paragraphs.join('');
}
async function exportErrorNotebookWord() {
    var payload = window.lastErrorNotebookExport;
    var titleEl = document.getElementById('errorNotebookTitle');
    var studentName = (payload && payload.studentName) || (titleEl ? titleEl.textContent.replace(/^[📘]?\s*个人错题本\s*[—\-]\s*/, '').trim() : '') || '错题本';
    if (typeof JSZip === 'undefined') throw new Error('未加载 JSZip（jszip.min.js）');
    if (typeof mml2omml !== 'function') console.warn('未加载 mathml2omml，公式将按原文导出');

    var loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px 30px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:10010;font-size:14px;color:#333;';
    loadingDiv.textContent = '正在生成 Word 文档，请稍候...';
    document.body.appendChild(loadingDiv);
    try {
        var mediaBag = [];
        var bodyXml = '';
        var preprocess = (typeof preprocessQuestionMarkdownForNotebook === 'function') ? preprocessQuestionMarkdownForNotebook : function(t) { return t; };
        if (payload && payload.subjects && payload.subjects.length) {
            bodyXml += docxHeading('个人错题本 — ' + payload.studentName, 36);
            bodyXml += docxParagraph(docxTextRun('共 ' + payload.totalErrors + ' 道错题，涉及 ' + payload.subjectCount + ' 个科目、' + payload.batchCount + ' 次考试。公式已转为 Word 公式；电路图等插图来自试卷 Markdown/PDF。'));
            for (var s = 0; s < payload.subjects.length; s++) {
                var subj = payload.subjects[s];
                bodyXml += docxHeading(subj.name, 30);
                for (var n = 0; n < subj.items.length; n++) {
                    var it = subj.items[n];
                    var ratePct = Math.round((it.rate || 0) * 100);
                    bodyXml += docxParagraph(docxTextRun((n + 1) + '. ' + it.itemName + '　[' + (it.batchLabel || '') + ']'));
                    bodyXml += docxParagraph(docxTextRun('得分：' + it.score + '/' + it.maxScore + '（' + ratePct + '%）　你的答案：' + (it.studentAnswer || '(空白)') + '　正确答案：' + (it.correctAnswer || '-')));
                    if (it.stemMarkdown) bodyXml += await markdownStemToDocxBody(preprocess(it.stemMarkdown), mediaBag);
                }
            }
        } else {
            var body = document.getElementById('errorNotebookBody');
            var plain = body ? String(body.innerText || '').trim() : '';
            if (!plain) throw new Error('没有可导出的错题本数据，请先打开某位学生的错题本');
            bodyXml += docxHeading(titleEl ? titleEl.textContent : '错题本', 36);
            bodyXml += await markdownStemToDocxBody(plain, mediaBag);
        }

        var rels = ['<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'];
        for (var mi = 0; mi < mediaBag.length; mi++) {
            rels.push('<Relationship Id="' + mediaBag[mi].relId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + mediaBag[mi].name + '"/>');
        }
        var seenExt = {};
        for (var ei = 0; ei < mediaBag.length; ei++) seenExt[mediaBag[ei].ext] = true;
        var defaultImgs = '';
        if (seenExt.png) defaultImgs += '<Default Extension="png" ContentType="image/png"/>';
        if (seenExt.jpeg) defaultImgs += '<Default Extension="jpeg" ContentType="image/jpeg"/>';
        if (seenExt.gif) defaultImgs += '<Default Extension="gif" ContentType="image/gif"/>';
        if (!defaultImgs) defaultImgs = '<Default Extension="png" ContentType="image/png"/>';

        var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
            '<w:body>' + bodyXml +
            '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
            '</w:body></w:document>';
        var stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="宋体" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>';
        var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + defaultImgs + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
        var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
        var docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels.join('') + '</Relationships>';

        var zip = new JSZip();
        zip.file('[Content_Types].xml', contentTypes);
        zip.folder('_rels').file('.rels', rootRels);
        var word = zip.folder('word');
        word.file('document.xml', documentXml);
        word.file('styles.xml', stylesXml);
        word.folder('_rels').file('document.xml.rels', docRels);
        var mediaFolder = word.folder('media');
        for (var fi = 0; fi < mediaBag.length; fi++) mediaFolder.file(mediaBag[fi].name, mediaBag[fi].bytes);
        var blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '错题本_' + studentName + '.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } finally {
        if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
    }
}
