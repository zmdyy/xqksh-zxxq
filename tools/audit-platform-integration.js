const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const knowledgeHtml = fs.readFileSync(path.join(root, 'knowledge/index.html'), 'utf8');
const dbCode = fs.readFileSync(path.join(root, 'data/knowledge/knowledge-db.js'), 'utf8');
const dictCode = fs.readFileSync(path.join(root, 'knowledge/vendor/pinyinjs/pinyin_dict_withtone.js'), 'utf8');
const pinyinCode = fs.readFileSync(path.join(root, 'knowledge/vendor/pinyinjs/pinyinUtil.js'), 'utf8');

const errors = [];
function requireText(text, needle, label) {
  if (!text.includes(needle)) errors.push(label);
}

requireText(rootHtml, 'id="qkKnowledgePlanetBtn"', '小题分析缺少“知识星球”按钮');
requireText(rootHtml, "window.open('knowledge/index.html','_blank','noopener')", '知识星球按钮未绑定本地页面');
requireText(rootHtml, "return !k.node_type || k.node_type === 'core';", 'AI标注词表未限制为核心知识点');
requireText(rootHtml, "knowledge/index.html?concept_id=", '小题知识点未使用 concept_id 深链');
requireText(rootHtml, "|| '2.4'", 'AI标注包兜底知识库版本不是 2.4');

requireText(knowledgeHtml, 'vendor/pinyinjs/pinyin_dict_withtone.js', '知识星球未加载本地拼音字典');
requireText(knowledgeHtml, 'vendor/pinyinjs/pinyinUtil.js', '知识星球未加载本地拼音工具');
requireText(knowledgeHtml, 'function getPinyinSearchIndex', '缺少本地拼音索引');
requireText(knowledgeHtml, 'function getPinyinMatch', '缺少拼音匹配逻辑');
requireText(knowledgeHtml, "Number(isSatelliteStar(a.star)) - Number(isSatelliteStar(b.star))", '搜索排序未设置核心知识优先');
requireText(knowledgeHtml, 'function resolveChainNodeId', '知识发展链缺少ID/名称兼容解析');
requireText(knowledgeHtml, "star.satelliteKind === 'extension'", '二级拓展卫星回链逻辑缺失');

const remotePinyin = knowledgeHtml.match(/https?:\/\/[^"'\s>]*pinyin/gi) || [];
if (remotePinyin.length) errors.push('发现远程拼音依赖: ' + remotePinyin.join(', '));

function syntaxAudit(html, label) {
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    try { new vm.Script(m[1], { filename: label + '#inline-' + i }); }
    catch (e) { errors.push(label + ' 内联脚本语法错误 #' + i + ': ' + e.message); }
  }
}
syntaxAudit(rootHtml, 'index.html');
syntaxAudit(knowledgeHtml, 'knowledge/index.html');

const sandbox = {};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(dbCode, sandbox);
vm.runInContext(dictCode, sandbox);
vm.runInContext(pinyinCode, sandbox);

const db = sandbox.KNOWLEDGE_DB;
const pinyinUtil = sandbox.pinyinUtil;
if (!db || !Array.isArray(db.data)) errors.push('知识库 JS 加载失败');
if (!pinyinUtil || typeof pinyinUtil.getPinyin !== 'function') errors.push('本地拼音工具加载失败');

function pinyinIndex(name) {
  let spaced = String(pinyinUtil.getPinyin(name, ' ', false, false) || '').toLowerCase();
  if (name.includes('率')) spaced = spaced.replace(/\bshuai\b/g, 'lv');
  if (name.includes('弹')) spaced = spaced.replace(/\bdan\b/g, 'tan');
  const full = spaced.replace(/ü/g, 'v').replace(/[^a-z0-9]/g, '');
  const initials = spaced.split(/\s+/).map(part => {
    const m = String(part || '').match(/[a-z]/i);
    return m ? m[0].toLowerCase() : '';
  }).join('');
  return { spaced, full, initials };
}

const emptyPinyin = [];
if (db && pinyinUtil) {
  for (const n of db.data) {
    if (!/[\u4e00-\u9fff]/.test(n.name || '')) continue;
    const idx = pinyinIndex(n.name);
    if (!idx.full || !idx.initials) emptyPinyin.push(n.id);
  }
}
if (emptyPinyin.length) errors.push('知识点拼音索引为空: ' + emptyPinyin.join(', '));

const cases = {
  '光的反射定律':['guangdefanshedinglv','gdfSDL'.toLowerCase()],
  '电流的磁效应':['dianliudecixiaoying','dldcxy'],
  '机械效率':['jixiexiaolv','jxxl'],
  '弹力':['tanli','tl'],
  '重力':['zhongli','zl'],
  '滑动变阻器':['huadongbianzuqi','hdbzq']
};
const pinyinTests = {};
if (db && pinyinUtil) {
  for (const [name, expected] of Object.entries(cases)) {
    const node = db.data.find(n => n.name === name);
    if (!node) {
      errors.push('拼音测试知识点不存在: ' + name);
      continue;
    }
    const got = pinyinIndex(name);
    pinyinTests[name] = got;
    if (got.full !== expected[0] || got.initials !== expected[1]) {
      errors.push('拼音测试失败: ' + name + ' -> ' + JSON.stringify(got));
    }
  }
}

const summary = {
  knowledgeDbVersion: db && db.version,
  nodes: db && db.data ? db.data.length : 0,
  localPinyin: remotePinyin.length === 0,
  emptyPinyinIndexes: emptyPinyin.length,
  pinyinTests,
  errors
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
else console.log('Platform integration audit passed.');
