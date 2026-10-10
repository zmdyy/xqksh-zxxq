/* 教师图像修复验收：原图保留，逐图确认后才作为题库正式图片。
 * 打包仅在本浏览器运行，生成可再次导入的完整私人 ZIP。
 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
let api=null,filter='pending',word='',page=0,busy=false;
const PER_PAGE=4;
let visibleGroups=[];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
function items(){
 const groups=new Map();
 for(const q of api.getQuestions()){
   for(const side of ['images','answerImages']){
     (q[side]||[]).forEach((im,index)=>{
       if(!im?.repair?.candidateData&&im?.repair?.status!=='approved')return;
       const rep=im.repair;
       // Use the ORIGINAL identity, not the high-res output (which may differ after approval).
       const identity=im.contentHash||rep.originalRef||rep.originalData||
         (rep.status==='approved'?'confirmed-'+side+'-'+index:(im.data||im.src||''));
       const key=q.id+'|'+identity;
       let g=groups.get(key);
       if(!g){g={q,side,index,im,repair:rep,slots:[],status:rep.status};groups.set(key,g)}
       g.slots.push({q,side,index,im,repair:rep});
       if(g.status!==rep.status)g.status='mixed';
     });
   }
 }
 return Array.from(groups.values());
}
function count(){
 const all=items();
 return {all:all.length,questions:new Set(all.map(i=>i.q.id)).size,
  approved:all.filter(i=>i.status==='approved').length,
  pending:all.filter(i=>i.status==='pending'||i.status==='mixed').length,
  rejected:all.filter(i=>i.status==='rejected').length,
  duplicatePositions:all.reduce((n,g)=>n+g.slots.length-1,0)};
}
function oldSrc(item){return item.repair.originalData||item.im.data||item.im.src||''}
function newSrc(item){return item.repair.candidateData||(item.repair.status==='approved'?item.im.data:'')}
function filteredGroups(){
 return items().filter(x=>(filter==='all'||x.status===filter||(filter==='pending'&&x.status==='mixed'))&&
  (!word||[x.q.id,x.q.source,x.q.sourceNo,x.q.stem,x.q.answer].join(' ').toLowerCase().includes(word.toLowerCase())));
}
function render(){
 const c=count();
 $('repairProgress').textContent='涉及 '+c.questions+' 道题、'+c.all+' 张不同图片（合并 '+c.duplicatePositions+' 处重复引用） · 已确认 '+c.approved+' · 待核 '+c.pending+' · 保留原图 '+c.rejected;
 visibleGroups=filteredGroups();
 const questions=[];
 for(const group of visibleGroups){
   let pageGroup=questions.find(entry=>entry.q.id===group.q.id);
   if(!pageGroup){pageGroup={q:group.q,images:[]};questions.push(pageGroup)}
   pageGroup.images.push(group);
 }
 const pages=Math.max(1,Math.ceil(questions.length/PER_PAGE));page=Math.max(0,Math.min(page,pages-1));
 const show=questions.slice(page*PER_PAGE,(page+1)*PER_PAGE);
 $('repairPager').textContent=(questions.length?page*PER_PAGE+1:0)+'–'+Math.min((page+1)*PER_PAGE,questions.length)+' / '+questions.length+'道题';
 $('repairPrev').disabled=page===0;$('repairNext').disabled=page+1>=pages;
 $('repairCards').innerHTML=show.length?show.map(({q,images})=>
  '<article class="repair-card repair-question-card"><div class="repair-card-heading"><b>'+escape(q.id)+' · 第'+escape(q.sourceNo||'?')+'题</b><span>'+images.length+'张不同图片</span></div>'+
  '<p class="repair-question">'+escape(q.source||'')+' · '+escape((q.stem||'').slice(0,130))+'</p>'+
  images.map(group=>{
   const key=visibleGroups.indexOf(group),orig=oldSrc(group),candidate=newSrc(group);
   const approved=group.status==='approved',rejected=group.status==='rejected',mixed=group.status==='mixed';
   return '<section class="repair-subfigure"><div class="repair-subfigure-label">'+(group.side==='images'?'题干图':'答案图')+' '+(group.index+1)+
     (group.slots.length>1?' · 同图在原题中引用'+group.slots.length+'次':'')+
     ' <span class="repair-state '+escape(group.status)+'">'+(approved?'已确认':rejected?'保留原图':mixed?'重复图状态不一致':'待核对')+'</span></div>'+
   '<div class="repair-compare"><figure><figcaption>原图（保留）</figcaption><img loading="lazy" alt="原始图" src="'+escape(orig)+'"></figure>'+
   '<figure><figcaption>当前候选 · '+escape(group.repair.method||'')+'</figcaption><img loading="lazy" alt="修复候选" src="'+escape(candidate)+'"></figure>'+
   (group.repair.alternativeCandidateData?'<figure><figcaption>备选：原图高清增强PNG</figcaption><img loading="lazy" alt="忠实原图增强候选" src="'+escape(group.repair.alternativeCandidateData)+'"></figure>':'')+
   '</div>'+
   '<div class="repair-card-actions"><span>原始尺寸：'+escape(group.repair.originalWidth)+'×'+escape(group.repair.originalHeight)+' px。先检查物理关系、文字和刻度。</span>'+
     (approved?'<button data-repair-action="undo" data-key="'+key+'">恢复原图</button>':
      '<button data-repair-action="approve" data-key="'+key+'" class="primary">确认采用</button><button data-repair-action="reject" data-key="'+key+'" class="muted">保留原图</button>')+
     (group.repair.alternativeCandidateData?'<button data-repair-action="approveAlternate" data-key="'+key+'">确认采用高清PNG</button>':'')+
   '</div></section>'
  }).join('')+'</article>'
 ).join(''):'<p class="repair-none">'+(c.all?'此条件下没有待核对的题目。':'请先导入含候选图的私人题库ZIP。')+'</p>';
 $('repairExportBtn').disabled=!c.all||busy;
}
async function act(item,action){
 if(!item||busy)return;
 busy=true;
 try{
   const q=item.q;
   if(item.status==='mixed'&&!confirm('同一原图的重复引用已有不同的审核结果。确定将这些位置统一应用本次选择吗？'))return;
   for(const slot of item.slots){
     const {im,repair}=slot;
     if(action==='approve'||action==='approveAlternate'){
       const candidate=action==='approveAlternate'?repair.alternativeCandidateData:repair.candidateData;
       if(!candidate)throw Error('选中的修复候选未加载');
       if(!repair.originalData)repair.originalData=im.data;
       if(action==='approveAlternate'){
         repair.legacyCandidateData=repair.candidateData;
         repair.candidateData=candidate;
         repair.method='原图忠实增强PNG（非结构重画）';
         delete repair.alternativeCandidateData;
       }
       im.data=candidate;im.useRedraw=false;
       repair.status='approved';repair.approvedAt=now();repair.reviewType='image-fidelity-only';
     }else if(action==='reject'){
       if(repair.status==='approved'&&repair.originalData)im.data=repair.originalData;
       repair.status='rejected';repair.approvedAt=null;
     }else if(action==='undo'){
       if(!repair.originalData)throw Error('原图缺失，不能恢复');
       im.data=repair.originalData;repair.status='pending';repair.approvedAt=null;
     }
   }
   q.revision=Number(q.revision||1)+1;q.updatedAt=now();
   await api.save(q);api.onChange();
   $('repairNotice').textContent='已保存 '+q.id+'（'+item.slots.length+'处相同图片同步处理）';
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
           if(review.alternativeCandidateData)review.alternativeCandidateRef=addData(review.alternativeCandidateData,'repair-candidates');
           if(review.legacyCandidateData)review.legacyCandidateRef=addData(review.legacyCandidateData,'repair-candidates');
           delete review.originalData;delete review.candidateData;delete review.previewPngData;delete review.alternativeCandidateData;delete review.legacyCandidateData;
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
 $('repairManagerBtn')?.addEventListener('click',()=>{$('repairDialog').showModal();filter='all';$('repairStatusFilter').value='all';page=0;render()});
 $('repairCloseBtn')?.addEventListener('click',()=>$('repairDialog').close());
 $('repairStatusFilter')?.addEventListener('change',e=>{filter=e.target.value;page=0;render()});
 $('repairSearch')?.addEventListener('input',e=>{word=e.target.value.trim();page=0;render()});
 $('repairPrev')?.addEventListener('click',()=>{page=Math.max(0,page-1);render()});
 $('repairNext')?.addEventListener('click',()=>{page++;render()});
 $('repairCards')?.addEventListener('click',async e=>{
   const btn=e.target.closest('[data-repair-action]');if(!btn)return;
   await act(visibleGroups[Number(btn.dataset.key)],btn.dataset.repairAction);
 });
 $('repairExportBtn')?.addEventListener('click',exportZip);
}
root.PhysicsImageRepair={init,items,count,exportZip};
})(typeof window!=='undefined'?window:globalThis);
