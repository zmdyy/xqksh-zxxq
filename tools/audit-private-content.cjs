#!/usr/bin/env node
'use strict';
// Read-only heuristics. Findings are review candidates, never automatic edits.
const fs = require('fs');
const bank = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const findings = [];
for (const q of bank.questions || []) {
  const answer = String(q.answer || '');
  const numberedAnswers = [...answer.matchAll(/(?:^|\n|[。；])\s*(\d{1,3})\s*[.．、]\s*【答案】/g)].map(m => m[1]);
  if (new Set(numberedAnswers).size > 1) findings.push({id:q.id, kind:'possible_answer_concatenation', numbers:numberedAnswers, reason:'多个原题编号答案可能串接；保留全部文字，须对照原件确认'});
  if (!answer.trim() && !(q.answerImages || []).length) findings.push({id:q.id, kind:'missing_answer', reason:'无文字答案及答案图片，禁止自动编造答案'});
  if (/惯性[\s\S]{0,80}(?:只有|仅与|只与)[^。；\n]{0,15}重力/.test(answer)) findings.push({id:q.id, kind:'physics_statement', reason:'惯性与质量有关；现答案提及仅与重力有关，须物理审核'});
  if (String(q.stem || '').includes('隔热') && (q.tags || []).includes('密度') && /塑料|锅柄/.test(q.stem || '')) findings.push({id:q.id, kind:'semantic_mapping', reason:'塑料锅柄隔热考查导热性，密度标签疑似不符；待审核后同步主考点与题库标签'});
}
const result = {scope:'all questions, including reversible archives', total:(bank.questions || []).length, automaticEdits:0, findings, counts:Object.fromEntries([...new Set(findings.map(f=>f.kind))].map(k=>[k,findings.filter(f=>f.kind===k).length]))};
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({total:result.total,counts:result.counts,automaticEdits:0}));
