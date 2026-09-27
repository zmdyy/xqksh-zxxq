const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/知识点数据库.json'), 'utf8'));
const conn = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge/关联连线数据库.json'), 'utf8'));
const patchCode = fs.readFileSync(path.join(root, 'knowledge/关系修正数据库.js'), 'utf8');
const layout = require(path.join(root, 'knowledge/layout-engine.js'));
const html = fs.readFileSync(path.join(root, 'knowledge/index.html'), 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(patchCode, sandbox);
const patch = sandbox.window._RELATION_PATCH_DATA;
if (!patch || typeof patch.applyTo !== 'function') throw new Error('关系修正层未加载');

const runtimeEdges = patch.applyTo(conn.data);
const ids = new Set(db.data.map(n => n.id));
const internalEdges = runtimeEdges.filter(e => ids.has(e.from) && ids.has(e.to));
const result = layout.computeLayout(db.data, internalEdges, {
  targetRadius: 320,
  iterations: 70,
  minNodeDistance: 34
});

const errors = [];
const warnings = [];
const positions = result.positions;

for (const n of db.data) {
  const p = positions[n.id];
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
    errors.push('无效坐标: ' + n.id);
  }
}

Object.entries(result.diagnostics.modules).forEach(([mod, stat]) => {
  if (stat.minNodeDistance < 22) {
    errors.push(mod + ' 模块节点最小间距过小: ' + stat.minNodeDistance);
  } else if (stat.minNodeDistance < 25) {
    warnings.push(mod + ' 模块节点较密: ' + stat.minNodeDistance);
  }
  if (stat.pairsUnder22 > 0) {
    errors.push(mod + ' 模块存在 ' + stat.pairsUnder22 + ' 对节点距离小于22');
  }
});

const closest = result.diagnostics.closestModulePairs[0];
if (closest && closest.minDistance < 60) {
  errors.push('模块间过近: ' + closest.from + ' / ' + closest.to + ' = ' + closest.minDistance);
}

if (!html.includes('<script src="layout-engine.js"></script>')) {
  errors.push('knowledge/index.html 未加载 layout-engine.js');
}
if (html.includes('|| selectedId)')) {
  errors.push('发现旧标签显示 bug：selectedId 被当作全局布尔值');
}
if (!html.includes('labelBoxOverlaps')) {
  errors.push('未启用标签碰撞规避');
}

const summary = {
  nodes: db.data.length,
  runtimeEdges: runtimeEdges.length,
  internalEdges: internalEdges.length,
  radius: result.diagnostics.radius,
  modules: result.diagnostics.modules,
  closestModulePairs: result.diagnostics.closestModulePairs,
  warnings,
  errors
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
else console.log('Visual layout audit passed.');
