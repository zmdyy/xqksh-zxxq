'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../question-bank/app.js'),'utf8');
const patched=source.replace(/init\(\);\s*\}\)\(\);\s*$/,'window.__test={state,buildPages,exportWord};})();');
assert.notEqual(source,patched);
let downloads=0,calls=0,confirmCount=0;
class MockBlob{constructor(){this.size=2200}}
const geom=bottom=>({classList:{contains(){return false}},clientWidth:120,scrollWidth:120,
 getBoundingClientRect(){return {top:50,bottom,left:60,right:500,height:bottom-50}}});
const page={
 querySelector(sel){return sel==='.foot'?{getBoundingClientRect(){return{top:970,bottom:1000}}}:null},
 querySelectorAll(sel){return sel==='img'?[]:[geom(750),geom(790)]},
 getBoundingClientRect(){return{top:0,bottom:1120,left:0,right:700,height:1120}}
};
const elements={
 layout:{value:'single'},feedback:{checked:true},answerMode:{value:'back'},
 status:{textContent:'',className:''},
 previewStatus:{dataset:{overflow:'no'},style:{},textContent:''},
 layoutDecision:{classList:{toggle(){},remove(){}},textContent:''},
 printPreview:{innerHTML:'',querySelectorAll:()=>[]},
 previewFront:page,previewBack:page,
 previewDialog:{open:false,showModal(){this.open=true}},
 wordBtn:{disabled:false},previewExportBtn:{disabled:false},
 wordDownloadLink:{style:{},click(){downloads++}},
 previewDownloadLink:{style:{}}
};
const window={PhysicsWordExport:{async createDocx(){calls++;return new MockBlob()}}};
let urlIndex=0;
vm.runInNewContext(patched,{window,document:{getElementById:id=>elements[id]},Blob:MockBlob,confirm:()=>{confirmCount++;return true},console,
URL:{createObjectURL:()=>('blob:mock-'+(++urlIndex)),revokeObjectURL(){}}
},{timeout:1000});
const test=window.__test;
test.state.questions=[{id:'q1',type:'作图题',stem:'题目',answer:'答案',images:[],answerImages:[],review:'approved',parts:[]}];
test.state.basket=['q1'];
(async()=>{
test.state.preview=test.buildPages();
await test.exportWord();
assert.equal(downloads,1);assert.equal(calls,1);
assert.match(elements.wordDownloadLink.download,/^physics_practice_.*\.docx$/);
assert.ok(elements.previewDownloadLink.href.startsWith('blob:mock-'));
test.state.preview=null;
await test.exportWord();
assert.equal(downloads,2,'main export first click must download');assert.equal(calls,2);
test.state.questions[0].review='pending';
test.state.preview=test.buildPages();
await test.exportWord();
assert.equal(downloads,3);assert.ok(confirmCount>0);
window.PhysicsWordExport.createDocx=async()=>{throw new Error('生成文件失败')};
await test.exportWord();
assert.equal(downloads,3);
assert.match(elements.previewStatus.textContent,/生成文件失败/);
console.log('PASS: main/preview export, pending confirmation, fallback, visible error');
})().catch(e=>{console.error(e);process.exitCode=1});