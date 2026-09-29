const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/知识点数据库.json'), 'utf8'));
const conn = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/关联连线数据库.json'), 'utf8'));
const patchCode = fs.readFileSync(path.join(root, 'knowledge/关系修正数据库.js'), 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(patchCode, sandbox);

if (!sandbox.window._RELATION_PATCH_DATA || typeof sandbox.window._RELATION_PATCH_DATA.applyTo !== 'function') {
  throw new Error('关系修正数据库.js 未暴露 applyTo');
}

const edges = sandbox.window._RELATION_PATCH_DATA.applyTo(conn.data);
const ids = new Set(db.data.map(n => n.id));

const pairMap = new Map();
for (const e of edges) {
  const key = [e.from, e.to].sort().join('||');
  if (!pairMap.has(key)) pairMap.set(key, []);
  pairMap.get(key).push(e);
}
const duplicatePairs = [...pairMap.values()].filter(v => v.length > 1);

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

const typeCounts = {};
for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;

const summary = {
  nodes: db.data.length,
  runtimeEdges: edges.length,
  relationTypes: typeCounts,
  duplicatePairs: duplicatePairs.length,
  unknownEdges: unknownEdges.length,
  isolatedNodes: isolated.length,
  metadataPrerequisitesMissingInEdges: metaMissingInEdges.length,
  edgePrerequisitesMissingInMetadata: edgeMissingInMeta.length
};

console.log(JSON.stringify(summary, null, 2));

if (
  duplicatePairs.length ||
  unknownEdges.length ||
  isolated.length ||
  metaMissingInEdges.length ||
  edgeMissingInMeta.length
) {
  if (duplicatePairs.length) console.error('重复关系:', duplicatePairs);
  if (unknownEdges.length) console.error('悬空关系:', unknownEdges);
  if (isolated.length) console.error('孤立节点:', isolated.map(n => n.id));
  if (metaMissingInEdges.length) console.error('元数据有、运行图无:', metaMissingInEdges);
  if (edgeMissingInMeta.length) console.error('运行图有、元数据无:', edgeMissingInMeta);
  process.exitCode = 1;
} else {
  console.log('Knowledge graph audit passed.');
}
