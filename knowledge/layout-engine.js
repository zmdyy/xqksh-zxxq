(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KNOWLEDGE_LAYOUT = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  const MODULE_ANCHORS = {
    "力学": [-225, 65, 45],
    "热学": [-105, -195, 95],
    "光学": [95, 180, 85],
    "电磁学": [225, -45, -70],
    "能量": [50, -225, -155],
    "数学": [-45, 225, -165]
  };

  function distance(a, b) {
    const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function relationTarget(type) {
    if (type === 'prerequisite') return 50;
    if (type === 'parallel') return 62;
    if (type === 'causal') return 56;
    return 66;
  }

  function computeLayout(nodes, edges, options) {
    options = options || {};
    const targetRadius = options.targetRadius || 320;
    const iterations = options.iterations || 70;
    const minBase = options.minNodeDistance || 34;
    const nodeById = new Map((nodes || []).map(n => [n.id, n]));
    const validEdges = (edges || []).filter(e => nodeById.has(e.from) && nodeById.has(e.to));

    const degree = new Map((nodes || []).map(n => [n.id, 0]));
    validEdges.forEach(e => {
      degree.set(e.from, (degree.get(e.from) || 0) + 1);
      degree.set(e.to, (degree.get(e.to) || 0) + 1);
    });

    const byModule = {};
    (nodes || []).forEach(n => {
      (byModule[n.module] || (byModule[n.module] = [])).push(n);
    });

    const positions = new Map();
    const chapterAnchors = new Map();

    Object.keys(byModule).forEach(mod => {
      const moduleNodes = byModule[mod];
      const moduleAnchor = (MODULE_ANCHORS[mod] || [0, 0, 0]).slice();
      const chapters = [];
      moduleNodes.forEach(n => {
        if (chapters.indexOf(n.chapter) < 0) chapters.push(n.chapter);
      });
      const chapterRadius = chapters.length <= 1 ? 0 : Math.max(58, Math.min(98, 52 + chapters.length * 5));

      chapters.forEach((chapter, ci) => {
        const theta = (ci / Math.max(1, chapters.length)) * Math.PI * 2 - Math.PI / 2;
        const chapterAnchor = [
          moduleAnchor[0] + Math.cos(theta) * chapterRadius,
          moduleAnchor[1] + Math.sin(theta) * chapterRadius,
          moduleAnchor[2] + Math.sin(theta * 2) * 30
        ];
        chapterAnchors.set(mod + '|' + chapter, chapterAnchor);

        const chapterNodes = moduleNodes
          .filter(n => n.chapter === chapter)
          .slice()
          .sort((a, b) =>
            ((degree.get(b.id) || 0) - (degree.get(a.id) || 0)) ||
            ((a.star_level || 3) - (b.star_level || 3)) ||
            String(a.id).localeCompare(String(b.id))
          );

        chapterNodes.forEach((n, idx) => {
          if (idx === 0) {
            positions.set(n.id, chapterAnchor.slice());
            return;
          }
          const k = idx - 1;
          const ring = Math.floor(k / 7);
          const slot = k % 7;
          const remaining = chapterNodes.length - 1 - ring * 7;
          const countOnRing = Math.min(7, remaining);
          const nodeRadius = 30 + ring * 23 + Math.min(9, (degree.get(n.id) || 0) * 0.8);
          const angle = (slot / Math.max(1, countOnRing)) * Math.PI * 2 + (ci % 2) * 0.33;
          positions.set(n.id, [
            chapterAnchor[0] + Math.cos(angle) * nodeRadius,
            chapterAnchor[1] + Math.sin(angle) * nodeRadius,
            chapterAnchor[2] + ((slot % 3) - 1) * 11 + ring * 6
          ]);
        });
      });
    });

    const internalEdges = validEdges.filter(e => {
      const a = nodeById.get(e.from), b = nodeById.get(e.to);
      return a && b && a.module === b.module;
    });

    for (let iter = 0; iter < iterations; iter++) {
      const delta = new Map((nodes || []).map(n => [n.id, [0, 0, 0]]));

      Object.keys(byModule).forEach(mod => {
        const arr = byModule[mod];
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            const a = arr[i], b = arr[j];
            const pa = positions.get(a.id), pb = positions.get(b.id);
            let dx = pa[0] - pb[0], dy = pa[1] - pb[1], dz = pa[2] - pb[2];
            let d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
            const minD = minBase + Math.min(12, ((degree.get(a.id) || 0) + (degree.get(b.id) || 0)) * 0.5);
            if (d < minD) {
              const f = (minD - d) * 0.11 / d;
              const da = delta.get(a.id), db = delta.get(b.id);
              da[0] += dx * f; da[1] += dy * f; da[2] += dz * f;
              db[0] -= dx * f; db[1] -= dy * f; db[2] -= dz * f;
            }
          }
        }
      });

      internalEdges.forEach(e => {
        const pa = positions.get(e.from), pb = positions.get(e.to);
        let dx = pb[0] - pa[0], dy = pb[1] - pa[1], dz = pb[2] - pa[2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
        const target = relationTarget(e.type);
        const f = (d - target) * 0.010 / d;
        const da = delta.get(e.from), db = delta.get(e.to);
        da[0] += dx * f; da[1] += dy * f; da[2] += dz * f;
        db[0] -= dx * f; db[1] -= dy * f; db[2] -= dz * f;
      });

      (nodes || []).forEach(n => {
        const p = positions.get(n.id);
        const d = delta.get(n.id);
        const anchor = chapterAnchors.get(n.module + '|' + n.chapter);
        if (!p || !d || !anchor) return;
        const anchorStrength = (degree.get(n.id) || 0) >= 7 ? 0.032 : 0.015;
        d[0] += (anchor[0] - p[0]) * anchorStrength;
        d[1] += (anchor[1] - p[1]) * anchorStrength;
        d[2] += (anchor[2] - p[2]) * anchorStrength;
      });

      (nodes || []).forEach(n => {
        const p = positions.get(n.id), d = delta.get(n.id);
        if (!p || !d) return;
        const mag = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
        const scale = mag > 3 ? 3 / mag : 1;
        p[0] += d[0] * scale;
        p[1] += d[1] * scale;
        p[2] += d[2] * scale;
      });
    }

    let cx = 0, cy = 0, cz = 0, count = 0;
    positions.forEach(p => { cx += p[0]; cy += p[1]; cz += p[2]; count++; });
    if (count) { cx /= count; cy /= count; cz /= count; }

    let maxDist = 1;
    positions.forEach(p => {
      p[0] -= cx; p[1] -= cy; p[2] -= cz;
      maxDist = Math.max(maxDist, Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]));
    });
    const scale = targetRadius / maxDist;
    positions.forEach(p => {
      p[0] *= scale; p[1] *= scale; p[2] *= scale;
    });

    const moduleStats = {};
    Object.keys(byModule).forEach(mod => {
      const arr = byModule[mod];
      let min = Infinity, closePairs = 0;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const d = distance(positions.get(arr[i].id), positions.get(arr[j].id));
          min = Math.min(min, d);
          if (d < 22) closePairs++;
        }
      }
      moduleStats[mod] = {
        nodeCount: arr.length,
        minNodeDistance: isFinite(min) ? Number(min.toFixed(1)) : null,
        pairsUnder22: closePairs
      };
    });

    const modules = Object.keys(byModule);
    const moduleSeparations = [];
    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        let min = Infinity;
        byModule[modules[i]].forEach(a => {
          byModule[modules[j]].forEach(b => {
            min = Math.min(min, distance(positions.get(a.id), positions.get(b.id)));
          });
        });
        moduleSeparations.push({
          from: modules[i],
          to: modules[j],
          minDistance: Number(min.toFixed(1))
        });
      }
    }
    moduleSeparations.sort((a, b) => a.minDistance - b.minDistance);

    const positionObject = {};
    positions.forEach((p, id) => {
      positionObject[id] = { x: p[0], y: p[1], z: p[2] };
    });

    return {
      positions: positionObject,
      diagnostics: {
        nodeCount: (nodes || []).length,
        edgeCount: validEdges.length,
        radius: targetRadius,
        modules: moduleStats,
        closestModulePairs: moduleSeparations.slice(0, 6)
      }
    };
  }

  return { computeLayout, MODULE_ANCHORS };
});
