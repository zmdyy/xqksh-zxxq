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

function docxStyledRun(text, opts) {
    opts = opts || {};
    var t = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!t) return '';
    var size = opts.size || 22;
    var color = String(opts.color || '1F2937').replace('#','');
    var rPr = '<w:rPr>' +
        '<w:rFonts w:ascii="Microsoft YaHei" w:hAnsi="Microsoft YaHei" w:eastAsia="微软雅黑" w:cs="Microsoft YaHei"/>' +
        '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/>' +
        '<w:color w:val="' + color + '"/>' +
        (opts.bold ? '<w:b/><w:bCs/>' : '') +
        (opts.italic ? '<w:i/><w:iCs/>' : '') +
        '</w:rPr>';
    var parts = t.split('\n');
    var body = '';
    for (var i = 0; i < parts.length; i++) {
        if (i) body += '<w:br/>';
        body += '<w:t xml:space="preserve">' + xmlEscapeDocx(parts[i]) + '</w:t>';
    }
    return '<w:r>' + rPr + body + '</w:r>';
}
function docxBlock(innerXml, opts) {
    opts = opts || {};
    var pPr = '<w:pPr>' +
        '<w:spacing w:before="' + (opts.before || 0) + '" w:after="' + (opts.after == null ? 100 : opts.after) + '" w:line="' + (opts.line || 320) + '" w:lineRule="auto"/>' +
        (opts.align ? '<w:jc w:val="' + opts.align + '"/>' : '') +
        (opts.keepNext ? '<w:keepNext/>' : '') +
        (opts.pageBreakBefore ? '<w:pageBreakBefore/>' : '') +
        (opts.shading ? '<w:shd w:val="clear" w:color="auto" w:fill="' + String(opts.shading).replace('#','') + '"/>' : '') +
        (opts.borderBottom ? '<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="5" w:color="' + String(opts.borderBottom).replace('#','') + '"/></w:pBdr>' : '') +
        '</w:pPr>';
    return '<w:p>' + pPr + (innerXml || '') + '</w:p>';
}
function docxPageBreak() {
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}
function docxInfoCell(label, value, accent) {
    return '<w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>' +
        docxBlock(docxStyledRun(label + '：', {size:20,color:'64748B',bold:true}) + docxStyledRun(value, {size:21,color:accent || '1F2937',bold:true}), {after:0,line:280}) +
        '</w:tc>';
}
function docxInfoTable(scoreText, studentAnswer, correctAnswer) {
    return '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/>' +
        '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="E2E8F0"/><w:left w:val="single" w:sz="4" w:color="E2E8F0"/><w:bottom w:val="single" w:sz="4" w:color="E2E8F0"/><w:right w:val="single" w:sz="4" w:color="E2E8F0"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/><w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>' +
        '<w:tr>' +
        docxInfoCell('得分', scoreText, 'DC2626') +
        docxInfoCell('我的答案', studentAnswer, 'DC2626') +
        docxInfoCell('正确答案', correctAnswer, '059669') +
        '</w:tr></w:tbl>' +
        '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
}
function notebookCleanAnswer(value, fallback) {
    var s = String(value == null ? '' : value).trim();
    if (!s || /^[-—_.·…，,；;\s]+$/.test(s)) return fallback;
    return s;
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

async function docxImageParagraphFromSource(src, mediaBag, maxCx, maxCy) {
    var img = await resolveNotebookImage(src);
    if (!img || !img.bytes) return '';
    maxCx = maxCx || 5850000;
    maxCy = maxCy || 6900000;
    var naturalCx = Math.max(1, Math.round(img.w * 9525));
    var naturalCy = Math.max(1, Math.round(img.h * 9525));
    var scale = Math.min(1, maxCx / naturalCx, maxCy / naturalCy);
    var cx = Math.max(1, Math.round(naturalCx * scale));
    var cy = Math.max(1, Math.round(naturalCy * scale));
    var idx = mediaBag.length + 1;
    var relId = 'rIdImg' + idx;
    var ext = img.ext === 'jpg' ? 'jpeg' : img.ext;
    mediaBag.push({ relId: relId, name: 'image' + idx + '.' + ext, bytes: img.bytes, ext: ext });
    return docxBlock(docxImageDrawing(relId, cx, cy, idx), {after:120,align:'center'});
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
    var studentName = (payload && payload.studentName) || (titleEl ? titleEl.textContent.replace(/^[^\u4e00-\u9fa5A-Za-z0-9]*个人错题本\s*[—\-]\s*/, '').trim() : '') || '学生';
    if (typeof JSZip === 'undefined') throw new Error('未加载 JSZip（jszip.min.js）');
    if (!payload || !payload.subjects || !payload.subjects.length) throw new Error('没有可导出的错题本数据，请先打开某位学生的错题本');

    var loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px 30px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:10010;font-size:14px;color:#333;';
    loadingDiv.textContent = '正在生成错题本 Word，请稍候...';
    document.body.appendChild(loadingDiv);

    try {
        var mediaBag = [];
        var bodyXml = '';
        var preprocess = (typeof preprocessQuestionMarkdownForNotebook === 'function') ? preprocessQuestionMarkdownForNotebook : function(t) { return t; };

        bodyXml += docxBlock(docxStyledRun(studentName + ' 个人错题本', {size:40,bold:true,color:'B42318'}), {align:'center',after:120,line:360});
        var classText = payload.studentClass ? (' · ' + payload.studentClass + '班') : '';
        bodyXml += docxBlock(
            docxStyledRun('共 ' + payload.totalErrors + ' 道错题 · ' + payload.subjectCount + ' 个科目 · ' + payload.batchCount + ' 次考试' + classText, {size:20,color:'64748B'}),
            {align:'center',after:260,line:300,borderBottom:'E5E7EB'}
        );

        for (var s = 0; s < payload.subjects.length; s++) {
            var subj = payload.subjects[s];
            if (s > 0) bodyXml += docxPageBreak();
            bodyXml += docxBlock(
                docxStyledRun(subj.name, {size:30,bold:true,color:'4338CA'}) +
                docxStyledRun('  （' + subj.items.length + ' 道）', {size:20,color:'64748B'}),
                {before:40,after:160,keepNext:true,borderBottom:'C7D2FE'}
            );

            for (var n = 0; n < subj.items.length; n++) {
                var it = subj.items[n];
                var ratePct = Math.round((it.rate || 0) * 100);
                var title = (n + 1) + '. ' + (it.itemName || '未命名题目');
                var batchText = it.batchLabel ? ('  [' + it.batchLabel + ']') : '';

                bodyXml += docxBlock(
                    docxStyledRun(title, {size:24,bold:true,color:'111827'}) +
                    docxStyledRun(batchText, {size:18,color:'64748B'}),
                    {before:n ? 220 : 40,after:100,keepNext:true,shading:'F8FAFC'}
                );

                var stuAns = notebookCleanAnswer(it.studentAnswer, '空白');
                var correctAns = notebookCleanAnswer(it.correctAnswer, '未提供');
                bodyXml += docxInfoTable(it.score + '/' + it.maxScore + '（' + ratePct + '%）', stuAns, correctAns);

                var snapshots = [];
                if (typeof window.getErrorNotebookQuestionSnapshots === 'function' && it.batchId) {
                    try {
                        loadingDiv.textContent = '正在提取原题：' + subj.name + ' ' + (it.itemName || '');
                        snapshots = await window.getErrorNotebookQuestionSnapshots(it);
                    } catch (snapErr) {
                        console.warn('原题截图提取失败，回退到文本题干', snapErr);
                        snapshots = [];
                    }
                }

                bodyXml += docxBlock(docxStyledRun('原题', {size:20,bold:true,color:'475569'}), {after:70,keepNext:true});
                if (snapshots && snapshots.length) {
                    for (var si = 0; si < snapshots.length; si++) {
                        var shotXml = await docxImageParagraphFromSource(snapshots[si], mediaBag, 5850000, 6900000);
                        if (shotXml) bodyXml += shotXml;
                    }
                } else if (it.stemMarkdown) {
                    bodyXml += await markdownStemToDocxBody(preprocess(it.stemMarkdown), mediaBag);
                } else {
                    bodyXml += docxBlock(docxStyledRun('未能从试卷中定位原题。', {size:19,color:'94A3B8'}), {after:100});
                }

                bodyXml += docxBlock('', {after:60,borderBottom:'E5E7EB'});
            }
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
            '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="950" w:bottom="900" w:left="950"/></w:sectPr>' +
            '</w:body></w:document>';

        var stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
            '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="微软雅黑" w:hAnsi="Microsoft YaHei" w:cs="Microsoft YaHei"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>' +
            '<w:pPrDefault><w:pPr><w:spacing w:line="320" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
            '</w:styles>';

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

        loadingDiv.textContent = '正在打包 Word 文档...';
        var blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '错题本_' + studentName + '.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    } finally {
        if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
    }
}
