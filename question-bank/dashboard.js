/* 题库明细独立页：只读同源 IndexedDB，不重新导入，不修改题库。 */
(function(root){
'use strict';
const DB_NAME='PhysicsTrainingBankV1';
const STORE='questions';
const $=id=>document.getElementById(id);
const normalizeName=name=>String(name||'').trim().toLowerCase().replace(/[\s/]+/g,'');
let questions=[],api;
function showStatus(message,error=false){
 const el=$('dashboardStatus');if(!el)return;
 el.textContent=message;el.classList.toggle('error',error);
}
function readQuestions(){
 return new Promise((resolve,reject)=>{
   if(!root.indexedDB){reject(new Error('当前浏览器不支持 IndexedDB'));return}
   const req=root.indexedDB.open(DB_NAME);
   req.onerror=()=>reject(req.error||new Error('打不开本地题库数据库'));
   req.onsuccess=()=>{
     const db=req.result;
     if(!db.objectStoreNames.contains(STORE)){db.close();resolve([]);return}
     let tx;
     try{tx=db.transaction(STORE,'readonly')}catch(e){db.close();reject(e);return}
     const out=tx.objectStore(STORE).getAll();
     out.onsuccess=()=>resolve(out.result||[]);
     out.onerror=()=>reject(out.error||new Error('读取题目记录失败'));
     tx.oncomplete=()=>db.close();
     tx.onerror=()=>db.close();
   };
 });
}
async function readKnowledgeCatalog(){
 const byName=new Map(),byId=new Map();
 try{
   const response=await fetch('../data/knowledge/exam-annotation-catalog.json');
   if(!response.ok)throw new Error('知识点目录HTTP '+response.status);
   const data=await response.json();
   for(const item of data.concepts||[]){
     if(!item?.name)continue;
     byName.set(normalizeName(item.name),item);
     if(item.concept_id)byId.set(item.concept_id,item);
   }
 }catch(e){
   showStatus('题库已读取，但知识图谱目录暂不可用；仍可根据题目标签查看统计。',true);
 }
 return {byName,byId};
}
function focusConcept(name){
 root.location.href='./index.html?concept_name='+encodeURIComponent(name);
}
function resetFilters(){
 $('detailScope').value='all';
 $('detailMetric').value='type';
 $('detailTop').value='20';
 $('detailSearch').value='';
 root.PhysicsBankDetails.update(questions,api);
}
async function init(){
 if(!root.PhysicsBankDetails){showStatus('统计图表模块加载失败，请按 Ctrl+F5 刷新。',true);return}
 try{
   const [loaded,lookup]=await Promise.all([readQuestions(),readKnowledgeCatalog()]);
   questions=loaded;
   api={
     getQuestions:()=>questions,
     catalogByName:lookup.byName,
     catalogById:lookup.byId,
     focusConcept,
     resetFilters
   };
   root.PhysicsBankDetails.init(api);
   root.PhysicsBankDetails.update(questions,api);
   if(questions.length){
     showStatus('已读取当前浏览器 '+questions.length+' 道题。点击知识点图表或表格中的名称，可返回题库并筛选该知识点。');
   }else{
     showStatus('当前浏览器中还没有题库。请返回题库主页导入 ZIP，再打开本页面查看统计。');
   }
 }catch(e){
   showStatus('无法读取本地题库：'+(e?.message||String(e))+'。请在同一浏览器、同一站点打开题库主页确认数据已导入。',true);
   console.error('[题库明细]',e);
 }
}
root.QuestionBankDashboard={readQuestions,focusConcept,resetFilters};
document.addEventListener('DOMContentLoaded',init);
})(typeof window!=='undefined'?window:globalThis);
