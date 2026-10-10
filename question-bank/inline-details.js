/* 题库明细：按主页按钮惰性加载统计库和图表；默认不占据选题页面。 */
(function(root){
'use strict';
let open=false,loadPromise=null,initDone=false,api=null,scheduled=false;
const $=id=>document.getElementById(id);
function loadScript(src){
 return new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=src;script.async=true;
   script.onload=resolve;script.onerror=()=>reject(new Error('图表脚本加载失败：'+src));
   document.head.appendChild(script);
 });
}
async function ensureCharts(){
 if(root.echarts&&root.PhysicsBankDetails)return;
 if(!loadPromise)loadPromise=(async()=>{
   if(!root.echarts)await loadScript('../echarts.min.js');
   if(!root.PhysicsBankDetails)await loadScript('./details.js?v=20261010b');
 })().catch(e=>{loadPromise=null;throw e});
 await loadPromise;
}
function redraw(){
 if(!open||!initDone||!api)return;
 root.PhysicsBankDetails.update(api.getQuestions(),api);
}
function refreshIfOpen(){
 if(!open||!initDone||scheduled)return;
 scheduled=true;
 Promise.resolve().then(()=>{scheduled=false;redraw()});
}
function init(options){
 api=options;
 const button=$('bankDetailsButton'),panel=$('bankDetailsPanel');
 if(!button||!panel)return;
 button.addEventListener('click',async()=>{
   if(open){
     open=false;panel.hidden=true;
     button.setAttribute('aria-expanded','false');
     button.textContent='▤ 题库明细';
     return;
   }
   open=true;panel.hidden=false;
   button.setAttribute('aria-expanded','true');
   button.textContent='▤ 收起题库明细';
   button.disabled=true;
   const tip=$('detailKpis');
   if(!initDone&&tip)tip.textContent='正在加载题库统计图表…';
   try{
     await ensureCharts();
     if(!initDone){root.PhysicsBankDetails.init(api);initDone=true}
     if(open){redraw();panel.scrollIntoView({behavior:'smooth',block:'start'})}
   }catch(e){
     if(tip)tip.textContent=e.message+'，请刷新页面后重试。';
     console.error('[题库明细]',e);
   }finally{button.disabled=false}
 });
}
root.PhysicsBankInlineDetails={init,refreshIfOpen};
})(typeof window!=='undefined'?window:globalThis);
