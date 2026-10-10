'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const nameCode=fs.readFileSync(path.join(root,'student-name-search.js'),'utf8');
const reviewCode=fs.readFileSync(path.join(root,'question-bank/image-repair-review.js'),'utf8');
const merger=fs.readFileSync(path.join(root,'question-bank/bank-merge.js'),'utf8');
const win={};
vm.runInNewContext(nameCode,{window:win},{timeout:1000});
const norm=win.StudentNameSearch.normalizeClassName;
for(const className of ['02','2','二班','2班','02班'])assert.equal(norm(className),'2班');
assert.equal(norm('802'),'802','do not collapse grade-encoded 802 into generic class 2');
const indexed=['02','2','二班','2班'].map(c=>win.StudentNameSearch.indexStudent({name:'蓝晓丹',class:c}));
assert.equal(new Set(indexed.map(e=>e.className+'|'+e.displayName)).size,1);
const elements={};
for(const id of ['repairManagerBtn','repairDialog','repairCards','repairExportBtn','repairProgress','repairPrev','repairNext','repairPager','repairStatusFilter','repairSearch','repairCloseBtn','repairNotice']){
 elements[id]={value:'',textContent:'',innerHTML:'',disabled:false,open:false,listeners:{},
 addEventListener(k,fn){this.listeners[k]=fn},showModal(){this.open=true},close(){this.open=false}};
}
const original='data:image/png;base64,YWJj',updated='data:image/png;base64,ZGVm';
const q={id:'Q1',source:'old',sourceNo:'12',stem:'电路图',revision:1,images:[],answerImages:[0,1].map(()=>({contentHash:'a',data:original,repair:{status:'pending',candidateData:updated,method:'PNG增强',originalWidth:90,originalHeight:60}}))};
let saved=0,changed=0;const reviewWin={};
vm.runInNewContext(reviewCode,{window:reviewWin,document:{getElementById:id=>elements[id]},console},{timeout:1000});
reviewWin.PhysicsImageRepair.init({getQuestions:()=>[q],getEvents:()=>[],getMeta:()=>({}),save:async()=>{saved++},onChange:()=>{changed++}});
elements.repairManagerBtn.listeners.click();
assert.equal(reviewWin.PhysicsImageRepair.count().all,1,'repeated answer image should be one audit item');
assert.equal(reviewWin.PhysicsImageRepair.count().duplicatePositions,1);
assert.match(elements.repairCards.innerHTML,/同图在原题中引用2次/);
(async()=>{
 await elements.repairCards.listeners.click({target:{closest:()=>({dataset:{repairAction:'approve',key:'0'}})}});
 assert.equal(q.answerImages[0].data,updated);
 assert.equal(q.answerImages[1].data,updated);
 assert.equal(q.answerImages[0].repair.originalData,original);
 assert.equal(q.revision,2);
 assert.equal(saved,1);assert.equal(changed,1);
 const mergeWin={};vm.runInNewContext(merger,{window:mergeWin},{timeout:1000});
 const old={id:'other',images:[{contentHash:'same',data:'original',repair:{status:'rejected',method:'矢量轮廓描摹'}}],answerImages:[],revision:1,review:'pending'};
 const incoming={id:'other',images:[{contentHash:'same',data:'original',repair:{status:'pending',candidateData:'enhanced-png',method:'原图忠实增强PNG',previousReview:{status:'rejected'}}}],answerImages:[],revision:2};
 assert.equal(mergeWin.QuestionBankMerge.attachRepairCandidates(old,incoming),1);
 assert.equal(old.images[0].data,'original','unapproved PNG must not alter official image');
 assert.equal(old.images[0].repair.status,'pending');
 console.log('PASS: class aliases, distinct-grade protection, per-question dedup and synced approval, rejected-SVG replacement candidate');
})().catch(e=>{console.error(e);process.exitCode=1});
