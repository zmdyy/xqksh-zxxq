'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../question-bank/app.js'),'utf8');
assert.match(src,/function splitParts/);
assert.match(src,/function buildPages/);
const modified=src.replace(/init\(\);\s*\}\)\(\);\s*$/,'window.__state=state;window.__internal={actualAssignments,printable};\n})();');
assert.notEqual(modified,src,'test harness must suppress browser init');
const els={
layout:{value:'auto'},feedback:{checked:true},answerMode:{value:'back'},
search:{value:''},conceptFilter:{value:''},conceptFilter2:{value:''},
relationFilter:{value:'any'},typeFilter:{value:''},difficultyFilter:{value:''},
usedFilter:{value:''},reviewFilter:{value:''},classFilter:{value:'801'}
};
const window={};
vm.runInNewContext(modified,{window,document:{getElementById:id=>els[id]},console},{timeout:1000});
const api=window.PhysicsQuestionBank;
assert.equal(api.splitParts('（1）画力臂（2）画反射（3）连接电路').length,3);
assert.equal(api.splitParts('请判断电源极性并画磁感线').length,0);
assert.equal(api.hash('same'),api.hash('same'));
assert.notEqual(api.hash('same'),api.hash('different'));
const q={
id:'q1',sourceNo:'39',type:'作图题',stem:'公共情境',answer:'整题答案',review:'approved',
parts:[{id:'1',label:'(1)',stem:'第一个任务',sharedContext:'公共条件',answer:'子题答案',imageIndexes:[1],answerImageIndexes:[0],verifiedImages:true}],
images:[{data:'image-A'},{data:'image-B'}],answerImages:[{data:'answer-A'},{data:'answer-B'}]
};
window.__state.questions=[q];window.__state.basket=['q1::1'];
const item=window.__internal.printable('q1::1');
assert.equal(item.images.length,1);
assert.equal(item.images[0],'image-B');
assert.equal(item.answerImages[0],'answer-A');
assert.equal(item.answer,'子题答案');
const pages=api.buildPages();
assert.ok(pages.front.includes('第一个任务'));
assert.ok(!pages.front.includes('子题答案'));
assert.ok(pages.back.includes('子题答案'));
assert.ok(!pages.back.includes('answer-B'));
q.parts[0].verifiedImages=false;
assert.throws(()=>api.buildPages(),/配图尚未确认/);
window.__state.events=[{id:'e',status:'assigned',className:'801',date:'2026-10-09T12:00:00',items:[{id:'q1::1',revision:1}]}];
assert.equal(window.__internal.actualAssignments('q1','801').length,1);
assert.equal(window.__internal.actualAssignments('q1','802').length,0);
console.log('PASS question-bank pure flows: subparts, image mapping, A4 front/back, class-scoped usage');
