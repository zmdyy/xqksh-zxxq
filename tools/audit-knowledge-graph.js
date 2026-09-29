const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/知识点数据库.json'), 'utf8'));
const conn = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/关联连线数据库.json'), 'utf8'));
const patchCode = fs.readFileSync(path.join(root, 'knowledge/关系修正数据库.js'), 'utf8');
const chainCode = fs.readFileSync(path.join(root, 'knowledge/知识链排序配置表.js'), 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(patchCode, sandbox);
vm.runInContext(chainCode, sandbox);

if (!sandbox.window._RELATION_PATCH_DATA || typeof sandbox.window._RELATION_PATCH_DATA.applyTo !== 'function') {
  throw new Error('关系修正数据库.js 未暴露 applyTo');
}

const edges = sandbox.window._RELATION_PATCH_DATA.applyTo(conn.data);
const ids = new Set(db.data.map(n => n.id));
const byId = new Map(db.data.map(n => [n.id, n]));
const byName = new Map();
for (const n of db.data) {
  if (!byName.has(n.name)) byName.set(n.name, []);
  byName.get(n.name).push(n.id);
}

const pairMap = new Map();
for (const e of edges) {
  const key = [e.from, e.to].sort().join('||');
  if (!pairMap.has(key)) pairMap.set(key, []);
  pairMap.get(key).push(e);
}
const duplicatePairs = [...pairMap.values()].filter(v => v.length > 1);
const duplicateNames = [...byName.entries()].filter(([, arr]) => arr.length > 1);
const unknownEdges = edges.filter(e => !ids.has(e.from) || !ids.has(e.to));

const touched = new Set();
for (const e of edges) {
  if (ids.has(e.from)) touched.add(e.from);
  if (ids.has(e.to)) touched.add(e.to);
}
const isolated = db.data.filter(n => !touched.has(n.id));

const edgePre = new Set(
  edges
    .filter(e => e.type === 'prerequisite' && ids.has(e.from) && ids.has(e.to))
    .map(e => e.from + '->' + e.to)
);
const metaPre = new Set();
for (const n of db.data) {
  for (const p of (n.prerequisites || [])) {
    if (ids.has(p)) metaPre.add(p + '->' + n.id);
  }
}
const metaMissingInEdges = [...metaPre].filter(k => !edgePre.has(k));
const edgeMissingInMeta = [...edgePre].filter(k => !metaPre.has(k));

const satellites = db.data.filter(n => n.node_type === 'satellite');
const badSatelliteKinds = satellites.filter(n => !['cross','application','extension'].includes(n.satellite_kind));
const satelliteWithoutAnchor = satellites.filter(n => !edges.some(e => e.from === n.id || e.to === n.id));

const chains = (sandbox.window._CHAIN_DATA && sandbox.window._CHAIN_DATA.knowledgeChains) || [];
const invalidChainRefs = [];
const duplicateChainRefs = [];
for (const chain of chains) {
  const seen = new Set();
  for (const nid of (chain.nodes || [])) {
    if (!ids.has(nid)) invalidChainRefs.push({ chain: chain.name || chain.chainId, id: nid });
    if (seen.has(nid)) duplicateChainRefs.push({ chain: chain.name || chain.chainId, id: nid });
    seen.add(nid);
  }
}

function uniqueIdByName(name) {
  const found = byName.get(name) || [];
  return found.length === 1 ? found[0] : null;
}
function hasTypedEdge(fromName, toName, type) {
  const from = uniqueIdByName(fromName);
  const to = uniqueIdByName(toName);
  if (!from || !to) return false;
  return edges.some(e => e.from === from && e.to === to && e.type === type);
}
const criticalRelations = [
  ['比热容','沿海气候','cross_disciplinary'],
  ['比热容','海陆风','cross_disciplinary'],
  ['帕斯卡原理','液压系统','application'],
  ['色光混合','色光混合与颜料混色对比','cross_disciplinary'],
  ['能量守恒定律','质量守恒','extension'],
  ['电流的磁效应','电磁感应现象','support'],
  ['磁场对电流的作用','电动机','prerequisite'],
  ['电磁感应现象','发电机','prerequisite'],
  ['电与磁的相互联系','电动机','support'],
  ['电与磁的相互联系','发电机','support']
];
const missingCriticalRelations = criticalRelations.filter(r => !hasTypedEdge(r[0], r[1], r[2]));

const typeCounts = {};
for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;

const summary = {
  nodes: db.data.length,
  runtimeEdges: edges.length,
  relationTypes: typeCounts,
  duplicatePairs: duplicatePairs.length,
  duplicateNames: duplicateNames.length,
  unknownEdges: unknownEdges.length,
  isolatedNodes: isolated.length,
  metadataPrerequisitesMissingInEdges: metaMissingInEdges.length,
  edgePrerequisitesMissingInMetadata: edgeMissingInMeta.length,
  satellites: satellites.length,
  badSatelliteKinds: badSatelliteKinds.length,
  satelliteWithoutAnchor: satelliteWithoutAnchor.length,
  knowledgeChains: chains.length,
  invalidChainRefs: invalidChainRefs.length,
  duplicateChainRefs: duplicateChainRefs.length,
  missingCriticalRelations: missingCriticalRelations.length
};

console.log(JSON.stringify(summary, null, 2));

const failed =
  duplicatePairs.length ||
  duplicateNames.length ||
  unknownEdges.length ||
  isolated.length ||
  metaMissingInEdges.length ||
  edgeMissingInMeta.length ||
  badSatelliteKinds.length ||
  satelliteWithoutAnchor.length ||
  invalidChainRefs.length ||
  duplicateChainRefs.length ||
  missingCriticalRelations.length;

if (failed) {
  if (duplicatePairs.length) console.error('重复关系:', duplicatePairs);
  if (duplicateNames.length) console.error('重复知识点名称:', duplicateNames);
  if (unknownEdges.length) console.error('悬空关系:', unknownEdges);
  if (isolated.length) console.error('孤立节点:', isolated.map(n => n.id));
  if (metaMissingInEdges.length) console.error('元数据有、运行图无:', metaMissingInEdges);
  if (edgeMissingInMeta.length) console.error('运行图有、元数据无:', edgeMissingInMeta);
  if (badSatelliteKinds.length) console.error('卫星类型无效:', badSatelliteKinds.map(n => n.id));
  if (satelliteWithoutAnchor.length) console.error('孤立卫星:', satelliteWithoutAnchor.map(n => n.id));
  if (invalidChainRefs.length) console.error('知识链无效节点:', invalidChainRefs);
  if (duplicateChainRefs.length) console.error('知识链重复节点:', duplicateChainRefs);
  if (missingCriticalRelations.length) console.error('关键关系缺失:', missingCriticalRelations);
  process.exitCode = 1;
} else {
  console.log('Knowledge graph audit passed.');
}
