const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const rootHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const knowledgeHtml = fs.readFileSync(path.join(root, 'knowledge/index.html'), 'utf8');
const dbCode = fs.readFileSync(path.join(root, 'data/knowledge/knowledge-db.js'), 'utf8');
const dictCode = fs.readFileSync(path.join(root, 'knowledge/vendor/pinyinjs/pinyin_dict_withtone.js'), 'utf8');
const pinyinCode = fs.readFileSync(path.join(root, 'knowledge/vendor/pinyinjs/pinyinUtil.js'), 'utf8');
const metaCode = fs.readFileSync(path.join(root, 'knowledge/概念归类数据库.js'), 'utf8');
const examCatalog = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/exam-annotation-catalog.json'), 'utf8'));
const diagnosticBank = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/diagnostic-question-bank.json'), 'utf8'));

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
requireText(knowledgeHtml, "Number(isAuxiliaryStar(a.star)) - Number(isAuxiliaryStar(b.star))", '搜索排序未设置核心知识优先');
requireText(knowledgeHtml, 'function resolveChainNodeId', '知识发展链缺少ID/名称兼容解析');
requireText(knowledgeHtml, "star.satelliteKind === 'extension'", '二级拓展卫星回链逻辑缺失');
requireText(knowledgeHtml, '概念归类数据库.js', '未加载 Meta 数据库');
requireText(knowledgeHtml, 'classification:10', '未注册 classification 关系');
requireText(knowledgeHtml, 'function injectMetaConcepts', '未注入 Meta 概念');
requireText(knowledgeHtml, "star.nodeType !== 'meta'", '学习计数未排除 Meta');

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
vm.runInContext(metaCode, sandbox);

const db = sandbox.KNOWLEDGE_DB;
const pinyinUtil = sandbox.pinyinUtil;
if (!db || !Array.isArray(db.data)) errors.push('知识库 JS 加载失败');
if (!pinyinUtil || typeof pinyinUtil.getPinyin !== 'function') errors.push('本地拼音工具加载失败');

const metaData = sandbox._META_CONCEPT_DATA;
const metaNodes = metaData && Array.isArray(metaData.meta_nodes) ? metaData.meta_nodes : [];
if (metaNodes.length !== 19) errors.push('Meta 概念数量应为19，实际为 ' + metaNodes.length);
const dbIds = new Set((db && db.data || []).map(n => n.id));
const seenMeta = new Set();
for (const meta of metaNodes) {
  if (seenMeta.has(meta.id)) errors.push('Meta ID 重复: ' + meta.id);
  seenMeta.add(meta.id);
  if (dbIds.has(meta.id)) errors.push('Meta 节点错误混入知识库: ' + meta.id);
  for (const memberId of (meta.members || [])) {
    if (!dbIds.has(memberId) && !metaNodes.some(m => m.id === memberId)) errors.push('Meta 成员不存在: ' + meta.name + ' -> ' + memberId);
  }
  if (meta.anchor_id && !dbIds.has(meta.anchor_id) && !metaNodes.some(m => m.id === meta.anchor_id)) errors.push('Meta anchor不存在: ' + meta.name + ' -> ' + meta.anchor_id);
}
const expectedMetaNames = ['物质的物理属性','测量工具与仪表','间接测量','比值定义与比值表征','单位时间表征','能量的形式','能量转化装置','守恒思想','控制变量法','物理图示与图像表征','理想实验法（科学推理法）','转换法','风能','水能','等效替代法（等效思想）','模型法','类比法','多次测量·寻找普遍规律','多次测量·减小误差'];
for (const name of expectedMetaNames) if (!metaNodes.some(m => m.name === name)) errors.push('缺少 Meta 概念: ' + name);

const allMetaOrDbIds = new Set([...dbIds, ...metaNodes.map(m => m.id)]);
for (const edge of (metaData.hierarchy_edges || [])) {
  if (!allMetaOrDbIds.has(edge.child) || !allMetaOrDbIds.has(edge.parent)) errors.push('Meta层级边无效: ' + JSON.stringify(edge));
}
const findMeta = name => metaNodes.find(m => m.name === name);
const indirect = findMeta('间接测量');
if (!indirect || !(indirect.members || []).includes('mech_avg_speed')) errors.push('间接测量缺少平均速度测量');
const energyForms = findMeta('能量的形式');
if (!energyForms || !(energyForms.members || []).includes('energy_solar_energy')) errors.push('能量形式缺少太阳能');
if (!energyForms || !(energyForms.members || []).includes('mech_mechanical_energy')) errors.push('能量形式缺少机械能上位节点');
const hierarchyKeys = new Set((metaData.hierarchy_edges || []).map(e => e.child + '->' + e.parent));
for (const k of [
  'mech_kinetic_energy->mech_mechanical_energy',
  'mech_gravitational_potential_energy->mech_mechanical_energy',
  'mech_elastic_potential_energy->mech_mechanical_energy',
  'meta_wind_energy->mech_kinetic_energy',
  'meta_water_energy->mech_kinetic_energy'
]) if (!hierarchyKeys.has(k)) errors.push('能量层级缺失: ' + k);

const controlMethod = findMeta('控制变量法');
const conversionMethod = findMeta('转换法');
const idealMethod = findMeta('理想实验法（科学推理法）');
if (!idealMethod || !(idealMethod.members || []).includes('mech_newton1') || !(idealMethod.members || []).includes('mech_sound_propagation')) errors.push('科学推理法实验覆盖不完整');
const doubleMethodExpected = ['mech_pressure','mech_liquid_pressure','mech_friction_factors','mech_kinetic_energy','mech_gravitational_potential_energy','therm_specific_heat','elec_joule_law','elec_electromagnet_factors'];
for (const id of doubleMethodExpected) {
  if (!controlMethod || !(controlMethod.members || []).includes(id) || !conversionMethod || !(conversionMethod.members || []).includes(id)) {
    errors.push('应同时标注控制变量法+转换法: ' + id);
  }
}

const equivalentMethod = findMeta('等效替代法（等效思想）');
const modelMethod = findMeta('模型法');
const analogyMethod = findMeta('类比法');
const repeatRuleMethod = findMeta('多次测量·寻找普遍规律');
const repeatErrorMethod = findMeta('多次测量·减小误差');
const requiredMethodMembers = [
  [equivalentMethod, 'opt_平面镜成像', '等效替代法缺少平面镜成像'],
  [modelMethod, 'elec_magnetic_field_lines', '模型法缺少磁感线'],
  [modelMethod, 'opt_rectilinear_propagation', '模型法缺少光线模型'],
  [analogyMethod, 'elec_current', '类比法缺少电流'],
  [analogyMethod, 'elec_voltage', '类比法缺少电压'],
  [repeatRuleMethod, 'mech_lever_balance', '寻找普遍规律缺少杠杆平衡'],
  [repeatRuleMethod, 'opt_reflection_law', '寻找普遍规律缺少反射定律'],
  [repeatRuleMethod, 'elec_ohm_law', '寻找普遍规律缺少欧姆定律'],
  [repeatErrorMethod, 'mech_length_measure', '减小误差缺少长度测量'],
  [repeatErrorMethod, 'elec_伏安法测电阻', '减小误差缺少伏安法测定值电阻']
];
for (const [method, id, message] of requiredMethodMembers) {
  if (!method || !(method.members || []).includes(id)) errors.push(message);
}
if (!equivalentMethod || !(equivalentMethod.members || []).includes('opt_平面镜成像') || !repeatRuleMethod || !(repeatRuleMethod.members || []).includes('opt_平面镜成像')) {
  errors.push('平面镜成像应同时体现等效替代法与多次测量寻找规律');
}
if (!repeatErrorMethod || !(repeatErrorMethod.members || []).includes('elec_伏安法测电阻')) {
  errors.push('伏安法测电阻应体现多次测量减小误差');
}



const annotationExcluded = new Set(['mech_newton1_core','mech_archimedes_core','mech_balance_forces_core']);
const expectedExamConcepts = (db && db.data || []).filter(k => {
  if (annotationExcluded.has(k.id)) return false;
  return !k.node_type || k.node_type === 'core';
}).map(k => ({
  concept_id:k.id,
  name:k.name,
  module:k.module || '',
  chapter:k.chapter || '',
  description:String(k.core_definition || '').trim(),
  formula:(k.formula && k.formula !== '无') ? k.formula : '',
  symbol:k.symbol || ''
}));
if (examCatalog.knowledge_db_version !== db.version) errors.push('考试标注词表版本与知识库不一致: ' + examCatalog.knowledge_db_version + ' vs ' + db.version);
if (examCatalog.concept_count !== expectedExamConcepts.length) errors.push('考试标注词表concept_count不一致');
const examMap = new Map((examCatalog.concepts || []).map(x => [x.concept_id, x]));
if (examMap.size !== expectedExamConcepts.length) errors.push('考试标注词表概念数量与运行词表不一致');
for (const x of expectedExamConcepts) {
  const y = examMap.get(x.concept_id);
  if (!y) { errors.push('考试标注词表缺少: ' + x.concept_id); continue; }
  for (const key of ['name','module','chapter','description','formula','symbol']) {
    if (String(y[key] ?? '') !== String(x[key] ?? '')) errors.push('考试标注词表字段不同步: ' + x.concept_id + '.' + key);
  }
}
for (const y of (examCatalog.concepts || [])) {
  if (!expectedExamConcepts.some(x => x.concept_id === y.concept_id)) errors.push('考试标注词表存在多余概念: ' + y.concept_id);
}
if ((examCatalog.excluded_node_types || []).indexOf('meta') < 0) errors.push('考试标注词表未明确排除Meta节点');

if (diagnosticBank.knowledge_db_version !== db.version) errors.push('诊断题库版本与知识库不一致');
if (diagnosticBank.group_count !== (diagnosticBank.groups || []).length) errors.push('诊断题库group_count不一致');
const diagnosticConceptIds = new Set();
const diagnosticQuestionIds = new Set();
let diagnosticQuestionCount = 0;
const examConceptIds = new Set((examCatalog.concepts || []).map(x => x.concept_id));
for (const group of (diagnosticBank.groups || [])) {
  if (diagnosticConceptIds.has(group.concept_id)) errors.push('诊断题库重复concept_id: ' + group.concept_id);
  diagnosticConceptIds.add(group.concept_id);
  if (!examConceptIds.has(group.concept_id)) errors.push('诊断题知识点不在考试标注词表: ' + group.concept_id);
  if ((group.questions || []).length < 2 || (group.questions || []).length > 4) errors.push('诊断题数不在2—4范围: ' + group.concept_id);
  const miscCodes = new Set((group.misconceptions || []).map(m => m.code));
  for (const q of (group.questions || [])) {
    diagnosticQuestionCount++;
    if (diagnosticQuestionIds.has(q.id)) errors.push('诊断题ID重复: ' + q.id);
    diagnosticQuestionIds.add(q.id);
    if ((q.options || []).length !== 4) errors.push('诊断题选项数不是4: ' + q.id);
    const optionIds = new Set((q.options || []).map(o => o.id));
    if (!optionIds.has(q.correct_option)) errors.push('诊断题正确答案无效: ' + q.id);
    for (const option of (q.options || [])) {
      if (option.id !== q.correct_option && (!option.misconception || !miscCodes.has(option.misconception))) {
        errors.push('诊断题干扰项未映射有效迷思: ' + q.id + '/' + option.id);
      }
    }
  }
}
if (diagnosticQuestionCount !== diagnosticBank.question_count) errors.push('诊断题库question_count不一致');
if ((diagnosticBank.groups || []).length !== 24) errors.push('第一批诊断知识点应为24组，实际为 ' + (diagnosticBank.groups || []).length);
const arch = (diagnosticBank.groups || []).find(g => g.concept_id === 'mech_archimedes');
if (!arch || JSON.stringify(arch).indexOf('液体密度') < 0 || JSON.stringify(arch).indexOf('V排') < 0) errors.push('阿基米德原理诊断未覆盖液体密度/V排边界');
const internalEnergy = (diagnosticBank.groups || []).find(g => g.concept_id === 'therm_internal_energy');
if (!internalEnergy || JSON.stringify(internalEnergy).indexOf('熔化') < 0 || JSON.stringify(internalEnergy).indexOf('凝固') < 0 || JSON.stringify(internalEnergy).indexOf('沸腾') < 0) {
  errors.push('内能诊断未覆盖熔化/凝固/沸腾温度不变情境');
}


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
  metaConcepts: metaNodes.length,
  examAnnotationConcepts: expectedExamConcepts.length,
  examCatalogVersion: examCatalog.knowledge_db_version,
  diagnosticGroups: diagnosticBank.group_count,
  diagnosticQuestions: diagnosticBank.question_count,
  errors
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
else console.log('Platform integration audit passed.');
