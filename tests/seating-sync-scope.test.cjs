'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm');
const current=fs.readFileSync('index.html','utf8');
for(const match of current.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc=/.test(match[1]))new vm.Script(match[2]);
if(process.env.SEATING_SYNC_BASE){
 const original=cp.execFileSync('git',['show',process.env.SEATING_SYNC_BASE+':index.html'],{encoding:'utf8',maxBuffer:10*1024*1024});
 function normalized(s){
  s=s.replace(/    <link rel="stylesheet" href="seating\.css">\n/,'');
  s=s.replace(/<script src="(?:app-core|seating-data|seating-engine|seating)\.js"><\/script>\n/g,'');
  s=s.replace(/    \/\* ═+\n       座位 Tab[\s\S]*?(?=    \/\* ── Markdown 渲染样式)/,'    /* 座位样式见 seating.css。 */\n\n');
  s=s.replace(/function buildSeatingReadableData\(className\) \{[\s\S]*?(?=function refreshSmartTab\(\))/,'/* seating reports */\n');
  s=s.replace(/function generateSeatingReport\(className\) \{[\s\S]*?(?=function generateSingleSubjectClassReport\()/,'/* seating markdown */\n');
  s=s.replace(/var SEATING_AI_PROMPT = \[[\s\S]*?\]\.join\('\\n'\);/,'/* seating prompt */');
  s=s.replace(/\/\/ =+\n\/\/  座位 — 数据构建\n\/\/ =+\n[\s\S]*?(?=<\/script>)/,'// 座位逻辑见 seating.js；其余功能保留源仓库实现。\n');
  return s;
 }
 assert.equal(normalized(current),normalized(original),'non-seating portions of the source page must remain byte-for-byte unchanged');
}
console.log('PASS source host: inline script syntax'+(process.env.SEATING_SYNC_BASE?' and unchanged non-seating page regions':''));
