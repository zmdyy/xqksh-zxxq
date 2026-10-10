'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const folder=path.join(__dirname,'../question-bank');
const main=fs.readFileSync(path.join(folder,'index.html'),'utf8');
const dashboard=fs.readFileSync(path.join(folder,'dashboard.html'),'utf8');
const app=fs.readFileSync(path.join(folder,'app.js'),'utf8');
const script=fs.readFileSync(path.join(folder,'dashboard.js'),'utf8');
assert.match(main,/id="bankDetailsButton"/);
assert.match(main,/href="\.\/dashboard\.html"/);
assert.doesNotMatch(main,/id="bankDetails"/);
assert.doesNotMatch(main,/echarts\.min\.js/);
assert.doesNotMatch(main,/details\.js\?v=/);
assert.match(dashboard,/id="bankDetails"/);
assert.match(dashboard,/detailConceptChart/);
assert.match(dashboard,/detailTypeChart/);
assert.match(dashboard,/detailDifficultyChart/);
assert.match(dashboard,/detailConceptRows/);
assert.match(app,/params\.get\('concept_name'\)/);
const items=[{id:'q1',stem:'计算速度',tags:['速度'],type:'计算题',difficulty:'普通'}, {id:'q2',stem:'受力分析',tags:['力'],type:'作图题',difficulty:'容易'}];
let loaded=0,updated=0,initCallback;
const status={textContent:'',classList:{toggle(){}}};
const bank={
 objectStoreNames:{contains:name=>name==='questions'},
 transaction(name,mode){
   assert.equal(name,'questions');assert.equal(mode,'readonly');
   const tx={oncomplete:null,onerror:null,objectStore(){
     return {getAll(){
       const req={};
       queueMicrotask(()=>{req.result=items;req.onsuccess();queueMicrotask(()=>tx.oncomplete?.())});
       return req;
     }};
   }};
   return tx;
 },
 close(){}
};
const window={
 indexedDB:{open(name){assert.equal(name,'PhysicsTrainingBankV1');return {
  get result(){return bank},
  set onsuccess(fn){queueMicrotask(fn)},
  set onerror(fn){}
 }}},
 location:{href:'about:blank'},
 PhysicsBankDetails:{
  init(api){loaded++;this.api=api},
  update(q){updated++;assert.equal(q.length,2)}
 }
};
const document={
 getElementById(id){return id==='dashboardStatus'?status:null},
 addEventListener(name,fn){assert.equal(name,'DOMContentLoaded');initCallback=fn}
};
const knowledge={concepts:[{name:'速度',concept_id:'mech_speed',module:'运动'}]};
vm.runInNewContext(script,{window,document,console,fetch:async()=>({ok:true,json:async()=>knowledge}),queueMicrotask,URLSearchParams},{timeout:1000});
assert.equal(typeof initCallback,'function');
(async()=>{
 await initCallback();
 assert.equal(loaded,1);assert.equal(updated,1);
 assert.match(status.textContent,/2 道题/);
 window.PhysicsBankDetails.api.focusConcept('速度');
 assert.equal(window.location.href,'./index.html?concept_name='+encodeURIComponent('速度'));
 console.log('PASS: dashboard is separate, reads local bank, and returns to filtered question list');
})().catch(e=>{console.error(e);process.exitCode=1});
