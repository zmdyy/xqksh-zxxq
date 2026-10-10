'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../question-bank');
const text=fs.readFileSync(path.join(root,'image-repair-review.js'),'utf8');
const merger=fs.readFileSync(path.join(root,'bank-merge.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const id of ['repairManagerBtn','repairDialog','repairCards','repairExportBtn','repairProgress','repairPrev','repairNext'])assert.match(html,new RegExp('id="'+id+'"'));
let calls=0;
function element(id){return {value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,open:false,dataset:{},listeners:{},
  addEventListener(evt,fn){this.listeners[evt]=fn},showModal(){this.open=true},close(){this.open=false}}}
const ids=['repairManagerBtn','repairDialog','repairCards','repairExportBtn','repairProgress','repairPrev','repairNext','repairPager','repairStatusFilter','repairSearch','repairCloseBtn','repairNotice'];
const ui=Object.fromEntries(ids.map(x=>[x,element(x)]));
const original='data:image/png;base64,'+Buffer.from('old-pixels').toString('base64');
const better='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" />').toString('base64');
const q={id:'Q1',type:'作图题',source:'test.docx',sourceNo:'7',stem:'物理电路图',revision:1,images:[],answerImages:[
 {data:original,contentHash:'same',repair:{status:'pending',candidateData:better,method:'矢量描摹',originalWidth:120,originalHeight:90}}]};
const questions=[q],saved=[];
const win={};
vm.runInNewContext(text,{window:win,document:{getElementById:id=>ui[id]},console,Buffer,atob:x=>Buffer.from(x,'base64').toString('binary')},{timeout:1000});
const api=win.PhysicsImageRepair;
api.init({getQuestions:()=>questions,getEvents:()=>[],getMeta:()=>({}),save:async x=>saved.push(x.id),onChange:()=>calls++});
ui.repairManagerBtn.listeners.click();
assert.equal(ui.repairDialog.open,true);
assert.deepEqual(JSON.parse(JSON.stringify(api.count())),{all:1,questions:1,approved:0,pending:1,rejected:0});
(async()=>{
 await ui.repairCards.listeners.click({target:{closest:()=>({dataset:{repairAction:'approve',key:'0'}})}});
 assert.equal(q.answerImages[0].data,better);
 assert.equal(q.answerImages[0].repair.originalData,original);
 assert.equal(q.answerImages[0].repair.status,'approved');
 assert.equal(q.revision,2);
 assert.equal(saved.length,1);
 ui.repairStatusFilter.value='approved';ui.repairStatusFilter.listeners.change({target:ui.repairStatusFilter});
 await ui.repairCards.listeners.click({target:{closest:()=>({dataset:{repairAction:'undo',key:'0'}})}});
 assert.equal(q.answerImages[0].data,original);
 assert.equal(q.answerImages[0].repair.status,'pending');
 assert.equal(q.revision,3);
 assert.equal(calls,2);
 let m={};vm.runInNewContext(merger,{window:m,console},{timeout:1000});
 const existing={id:'Q2',images:[],answerImages:[{contentHash:'x123',data:original}],stem:'某题原题干',sourceNo:'1',source:'test.docx',review:'pending',revision:1};
 const incoming={...existing,answerImages:[{contentHash:'x123',data:original,repair:{status:'pending',candidateData:better}}]};
 assert.equal(m.QuestionBankMerge.attachRepairCandidates(existing,incoming),1);
 assert.equal(existing.answerImages[0].data,original,'candidate must not automatically overwrite original');
 existing.answerImages[0].repair.status='approved';
 assert.equal(m.QuestionBankMerge.attachRepairCandidates(existing,incoming),0,'do not downgrade already approved repair');
 console.log('PASS: repair modal, approval persists official image, original restored, importer merges candidates without overwriting');
})().catch(e=>{console.error(e);process.exitCode=1});
