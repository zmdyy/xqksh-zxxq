/* 教师图像修复验收：原图保留，逐图确认后才作为题库正式图片。
 * 打包仅在本浏览器运行，生成可再次导入的完整私人 ZIP。
 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
let api=null,filter='pending',word='',page=0,busy=false;
const PER_PAGE=12;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
function items(){
 const out=[];
 for(const q of api.getQuestions()){
   for(const side of ['images','answerImages']){
     (q[side]||[]).forEach((im,index)=>{
       if(im?.repair?.candidateData||im?.repair?.status==='approved'){
         out.push({q,side,index,im,repair:im.repair});
       }
     });
   }
 }
 return out;
}
function count(){
 const all=items(),approved=all.filter(i=>i.repair.status==='approved');
 return {all:all.length,questions:new Set(all.map(i=>i.q.id)).size,approved:approved.length,pending:all.filter(i=>i.repair.status==='pending').length,rejected:all.filter(i=>i.repair.status==='rejected').length};
}
function oldSrc(item){return item.repair.originalData||item.im.data||item.im.src||''}
function newSrc(item){return item.repair.candidateData||(item.repair.status==='approved'?item.im.data:'')}
function render(){
 const c=count(),summary=$('repairProgress');
 summary.textContent='涉及 '+c.questions+' 道题、'+c.all+' 处图片 · 已确认 '+c.approved+' · 待审核 '+c.pending+' · 保留原图 '+c.rejected;
 let result=items().filter(x=>(filter==='all'||x.repair.status===filter)&&
  (!word||[x.q.id,x.q.source,x.q.sourceNo,x.q.stem,x.q.answer].join(' ').toLowerCase().includes(word.toLowerCase())));
 const pages=Math.max(1,Math.ceil(result.length/PER_PAGE));page=Math.min(page,pages-1);
 $('repairPager').textContent=(result.length?(page*PER_PAGE+1):0)+'–'+Math.min((page+1)*PER_PAGE,result.length)+' / '+result.length+'幅';
 $('repairPrev').disabled=page===0;
 $('repairNext').disabled=page+1>=pages;
 const start=page*PER_PAGE,shown=result.slice(start,start+PER_PAGE);
 $('repairCards').innerHTML=shown.length?shown.map(({q,side,index,im,repair},j)=>{
   const key=start+j;
   const original=oldSrc(shown[j]),candidate=newSrc(shown[j]);
   const isApproved=repair.status==='approved',isRejected=repair.status==='rejected';
   const title=(side==='images'?'题干图':'答案图')+' '+(index+1);
   return '<article class="repair-card" data-repair-pos="'+key+'">'
     +'<div class="repair-card-heading"><b>'+escape(q.id)+' · '+escape(title)+'</b><span class="repair-state '+escape(repair.status)+'">'+
     (isApproved?'已确认采用':isRejected?'保留原图':'待审核')+'</span></div>'
     +'<p class="repair-question">'+escape(q.source||'')+' · 第'+escape(q.sourceNo||'')+'题 · '+escape((q.stem||'').slice(0,110))+'</p>'
     +'<div class="repair-compare">'
     +'<figure><figcaption>原图 · 始终保留</figcaption><img loading="lazy" alt="原始题图" src="'+escape(original)+'"></figure>'
     +'<figure><figcaption>修复候选 · '+escape(repair.method||'')+'</figcaption><img loading="lazy" alt="高清修复候选" src="'+escape(candidate)+'"></figure></div>'
     +'<div class="repair-card-actions"><span>'+escape(repair.originalWidth)+'×'+escape(repair.originalHeight)+'px · 请核查连线、箭头、刻度和数值</span>'
     +(isApproved?'<button data-repair-action="undo" data-key="'+key+'">恢复原图</button>'
     :'<button class="primary" data-repair-action="approve" data-key="'+key+'">确认采用修复图</button>'
      +'<button class="muted" data-repair-action="reject" data-key="'+key+'">保留原图</button>')
     +'</div></article>';
 }).join(''):'<p class="repair-none">'+(c.all?'此条件下没有待审核图像。':'尚未导入带修复候选的私人 ZIP。请先导入本次96题候选包。')+'</p>';
 $('repairExportBtn').disabled=!c.all||busy;
}
function recordUndo(repair,item){
 if(!repair.originalData)repair.originalData=item.im.data;
}
async function act(item,action){
 if(!item||busy)return;
 busy=true;
 try{
   const {q,im,repair}=item;
   if(action==='approve'){
     if(!repair.candidateData)throw Error('候选图未加载，无法采用');
     recordUndo(repair,item);
     im.data=repair.candidateData;
     im.useRedraw=false;
     repair.status='approved';
     repair.approvedAt=now();
     repair.reviewType='image-fidelity-only';
   }else if(action==='reject'){
     if(repair.status==='approved'&&repair.originalData)im.data=repair.originalData;
     repair.status='rejected';repair.approvedAt=null;
   }else if(action==='undo'){
     if(!repair.originalData)throw Error('原图未找到，已阻止恢复');
     im.data=repair.originalData;
     repair.status='pending';repair.approvedAt=null;
   }
   q.revision=Number(q.revision||1)+1;q.updatedAt=now();
   await api.save(q);api.onChange();
   $('repairNotice').textContent='已保存：'+q.id+' · '+(repair.status==='approved'?'正式题图已替换；原图仍在':'保持/恢复原图');
 }catch(e){$('repairNotice').textContent='保存失败：'+e.message;console.error(e)}
 finally{busy=false;render()}
}
const alphabet=/^data:([^;]+);base64,([\s\S]+)$/i;
function asBytes(src){
 const match=alphabet.exec(src||'');if(!match)throw Error('无法读取图片文件（必须是base64 data URI）');
 const str=atob(match[2].replace(/\s/g,'')),bytes=new Uint8Array(str.length);
 for(let i=0;i<str.length;i++)bytes[i]=str.charCodeAt(i);
 return {mime:match[1],bytes};
}
function extension(mime){return mime==='image/svg+xml'?'svg':mime==='image/jpeg'?'jpg':mime==='image/gif'?'gif':'png'}
async function exportZip(){
 if(busy)return;
 if(!root.JSZip)throw Error('缺少JSZip，无法生成完整题库');
 busy=true;$('repairExportBtn').disabled=true;
 $('repairNotice').textContent='正在打包所有题目和原图；大题库可能需要一些时间…';
 try{
   const zip=new root.JSZip(),memo=new Map();
   function addData(uri,folder){
     if(!uri)return null;
     const match=alphabet.exec(uri);if(!match)throw Error('存在不支持的图像编码');
     let key=folder+'|'+uri.length+'|'+uri.slice(0,96)+'|'+uri.slice(-96);
     if(memo.has(key))return memo.get(key);
     const parsed=asBytes(uri),path=folder+'/'+folder.replace(/[^a-z]/g,'').slice(0,10)+'_'+memo.size+'.'+extension(parsed.mime);
     zip.file(path,parsed.bytes,{binary:true,compression:'STORE'});
     memo.set(key,path);return path;
   }
   // Never mutate IndexedDB records while preparing a ZIP.
   const out=api.getQuestions().map(q=>{
     const cloned={...q};
     for(const side of ['images','answerImages']){
       cloned[side]=(q[side]||[]).map(im=>{
         const copy={...im},review=copy.repair?{...copy.repair}:null;
         const raw=im.data||im.src||'';
         if(raw)copy.ref=addData(raw,'media');
         delete copy.data;delete copy.src;
         if(review){
           const original=review.originalData||(review.status==='approved'?'':raw);
           const candidate=review.candidateData||(review.status==='approved'?raw:'');
           if(original)review.originalRef=addData(original,'repair-originals');
           if(candidate)review.candidateRef=addData(candidate,'repair-candidates');
           if(review.previewPngData)review.previewPngRef=addData(review.previewPngData,'repair-candidates');
           delete review.originalData;delete review.candidateData;delete review.previewPngData;
           copy.repair=review;
         }
         return copy;
       });
     }
     return cloned;
   });
   const c=count();
   const bank={
     format:'physics-training-bank-v1',version:1,private:true,
     batch:'1414道作图图像教师验收版',exportedAt:now(),
     description:'原图保存在repair-originals；已确认图采用为media中正式题图',
     questions:out,events:api.getEvents(),meta:api.getMeta(),
     diagramRepairBatch:{questionCount:c.questions,candidateSlots:c.all,approved:c.approved,
       pending:c.pending,rejected:c.rejected,originalsPreserved:true}
   };
   zip.file('bank.json',JSON.stringify(bank),{compression:'DEFLATE',compressionOptions:{level:3}});
   const blob=await zip.generateAsync({type:'blob',compression:'STORE',streamFiles:true},progress=>{
     if(progress.percent%10<1)$('repairNotice').textContent='正在生成私人题库ZIP：'+Math.floor(progress.percent)+'%';
   });
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='physics_bank_image_review_'+new Date().toISOString().slice(0,10)+'.zip';
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   $('repairNotice').textContent='已生成完整题库ZIP（'+(blob.size/1024/1024).toFixed(1)+' MB）：已确认'+c.approved+'幅；保留原图备份；其余继续待审。';
 }catch(e){$('repairNotice').textContent='导出失败：'+e.message;console.error(e)}
 finally{busy=false;render()}
}
function init(options){
 api=options;
 $('repairManagerBtn')?.addEventListener('click',()=>{$('repairDialog').showModal();filter='pending';page=0;render()});
 $('repairCloseBtn')?.addEventListener('click',()=>$('repairDialog').close());
 $('repairStatusFilter')?.addEventListener('change',e=>{filter=e.target.value;page=0;render()});
 $('repairSearch')?.addEventListener('input',e=>{word=e.target.value.trim();page=0;render()});
 $('repairPrev')?.addEventListener('click',()=>{page=Math.max(0,page-1);render()});
 $('repairNext')?.addEventListener('click',()=>{page++;render()});
 $('repairCards')?.addEventListener('click',async e=>{
   const btn=e.target.closest('[data-repair-action]');if(!btn)return;
   const list=items().filter(x=>(filter==='all'||x.repair.status===filter)&&
     (!word||[x.q.id,x.q.source,x.q.sourceNo,x.q.stem,x.q.answer].join(' ').toLowerCase().includes(word.toLowerCase())));
   await act(list[Number(btn.dataset.key)],btn.dataset.repairAction);
 });
 $('repairExportBtn')?.addEventListener('click',exportZip);
}
root.PhysicsImageRepair={init,items,count,exportZip};
})(typeof window!=='undefined'?window:globalThis);
