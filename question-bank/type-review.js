
/* 原题库内的题型专项复核：仅筛选2026-10-11复核候选；不更改整题物理审核状态。 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES=['选择题','填空题','作图题','实验题','计算题','综合题','综合能力题','其他'];
const TASKS=['选项判断','填空','作图/连线','实验/探究','计算','数据或图像处理','阅读/项目式情境'];
// 这7道属于后续补充1 Word资料，未列入原始346题待审核清单。
const EXCLUDED=new Set(['SUP1-013','SUP1-021','SUP1-039','SUP1-040','SUP1-041','SUP1-042','SUP1-043']);
let api=null,selectedId='',filtered=[],filterStatus='pending',keyword='',busy=false,message='';
const audit=q=>q.typeAudit20261011||{};
const teacher=q=>audit(q).teacherReview||{};
const eligible=q=>Boolean(audit(q).needsManualReview&&!EXCLUDED.has(q.id));
const reviewStatus=q=>teacher(q).status||'pending';
const label=s=>({pending:'待审核',confirmed:'类型已确认',discuss:'待讨论',repair:'需修复'})[s]||'待审核';
function all(){return (api?.getQuestions()||[]).filter(eligible)}
function filteredItems(){
 const key=keyword.toLowerCase().trim();
 return all().filter(q=>(filterStatus==='all'||reviewStatus(q)===filterStatus)&&
 (!key||[q.id,q.stem,q.source,q.sourceNo,(q.tags||[]).join(' ')].join(' ').toLowerCase().includes(key)));
}
function keepVisible(){
 filtered=filteredItems();
 if(!filtered.find(q=>q.id===selectedId))selectedId=filtered[0]?.id||'';
}
function progress(){
 const qs=all(),done=qs.filter(q=>reviewStatus(q)==='confirmed').length;
 $('typeReviewProgress').textContent='专项清单 '+qs.length+'道 · 已确认 '+done+' · 待审核 '+qs.filter(q=>reviewStatus(q)==='pending').length+
 ' · 待讨论 '+qs.filter(q=>reviewStatus(q)==='discuss').length+' · 需修复 '+qs.filter(q=>reviewStatus(q)==='repair').length;
}
function media(im){return (im?.useRedraw&&im?.redrawPng)||im?.data||im?.src||''}
function gallery(imgs,heading){
 return (imgs||[]).length?'<section><h4>'+esc(heading)+'</h4><div class="tr-gallery">'+imgs.map((im,i)=>
 '<figure><figcaption>第'+(i+1)+'幅（点击放大）</figcaption><button type="button" data-zoom aria-label="放大或缩小图片"><img alt="'+esc(heading)+'" loading="lazy" src="'+esc(media(im))+'"></button></figure>'
 ).join('')+'</div></section>':'';
}
function queue(){
 $('typeReviewQueue').innerHTML=filtered.length?filtered.map((q,i)=>{
  const selected=q.id===selectedId;
  const status=reviewStatus(q);
  const cl=status==='confirmed'?'tr-reviewed':status!=='pending'?'tr-needs-work':'';
  return '<button type="button" data-select="'+esc(q.id)+'" aria-current="'+selected+'" class="'+cl+'">'+
   (i+1)+'. '+esc(q.sourceNo||'?')+'题 · '+esc(q.type)+' · '+esc(label(status))+
   '<small>'+esc(q.source||q.id)+'</small><small>'+esc((q.stem||'').replace(/\s+/g,' ').slice(0,65))+'</small></button>';
 }).join(''):'<p class="tr-empty">没有符合条件的题目</p>';
}
function selected(){return (api.getQuestions()||[]).find(q=>q.id===selectedId)}
function detail(){
 const host=$('typeReviewContent'),q=selected();
 if(!q){
  host.innerHTML='<p class="tr-empty">'+(all().length?'当前条件下没有待显示的题目':'未找到带专项复核标记的题目。请从本页面“＋ 导入题目”导入2026-10-11修订版题库ZIP，之后再打开本入口。')+'</p>';
  return;
 }
 const a=audit(q),t=teacher(q),current=t.type||q.type||'其他';
 const tasks=Array.isArray(t.tasks)?t.tasks:(a.tasks||[]);
 const options=TYPES.map(v=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>').join('');
 host.innerHTML='<div class="tr-kicker"><strong>'+esc(q.id)+'</strong> · '+esc(q.source||'')+' · 原卷第'+esc(q.sourceNo||'?')+'题 · 当前专题状态：'+esc(label(reviewStatus(q)))+'</div>'+
  '<div class="tr-labels"><div><strong>导入前类型：</strong>'+esc(a.oldType||q.type)+'　<strong>当前类型：</strong>'+esc(q.type)+'</div>'+
  '<div><strong>程序建议：</strong>'+esc(a.proposedType||'未知')+'（置信度：'+esc(a.confidence||'未知')+'）</div>'+
  '<div><strong>判断依据：</strong>'+esc(a.rule||'未提供')+'</div>'+
  '<div><strong>知识点：</strong>'+esc((q.tags||[]).join('；')||'待补充')+'</div>'+
  '<div><strong>原题整体审核：</strong>'+(q.review==='approved'?'已审核':'待审核')+'（与本次题型专项审核分开）</div></div>'+
  '<h3>题目正文</h3><div class="tr-stem">'+esc(q.stem||'')+'</div>'+
  gallery(q.images,'题干原图')+
  '<details class="tr-answer"><summary>展开答案和解析（默认隐藏）</summary><pre>'+esc(q.answer||'原题未提供文字答案')+'</pre>'+gallery(q.answerImages,'答案图')+'</details>'+
  '<h3>本题题型审核</h3><div class="tr-fields">'+
  '<label for="trType">确认主类型</label><select id="trType">'+options+'</select>'+
  '<span>次级考法（可多选）</span><div class="tr-tasks">'+TASKS.map((v,i)=>
     '<label><input type="checkbox" data-task="'+i+'" '+(tasks.includes(v)?'checked':'')+'>'+esc(v)+'</label>').join('')+'</div>'+
  '<label for="trNote">人工审核备注</label><textarea id="trNote" placeholder="如：本题包含连线，但主要是实验探究；或题目缺图、答案不全">'+esc(t.note||'')+'</textarea>'+
  '</div><div class="tr-actions">'+
  '<button type="button" class="primary" data-save-status="confirmed">确认题型并保存</button>'+
  '<button type="button" class="muted" data-save-status="discuss">标记待讨论</button>'+
  '<button type="button" class="muted" data-save-status="repair">标记需修复</button>'+
  '<button type="button" data-open-editor>转到原有“审核 / 拆题”</button>'+
  '</div><p class="tr-message" id="trMessage">'+esc(message)+'</p>';
}
function render(){
 if(!api)return;
 keepVisible();progress();queue();detail();
 const i=filtered.findIndex(q=>q.id===selectedId);
 $('trIndex').textContent=filtered.length?(i+1)+' / '+filtered.length:'0 / 0';
 $('trPrev').disabled=i<=0;$('trNext').disabled=i<0||i===filtered.length-1;
 $('trExport').disabled=all().length===0;
}
function jump(delta){
 const i=filtered.findIndex(q=>q.id===selectedId),n=i+delta;
 if(n<0||n>=filtered.length)return;
 selectedId=filtered[n].id;message='';
 render();$('typeReviewContent').scrollTop=0;
}
async function record(status){
 if(busy)return;
 const q=selected();if(!q)return;
 const type=$('trType').value, note=$('trNote').value.trim();
 const tasks=Array.from(document.querySelectorAll('#typeReviewContent input[data-task]:checked'))
  .map(x=>TASKS[Number(x.dataset.task)]).filter(Boolean);
 if(status==='confirmed'&&!TYPES.includes(type))return;
 const id=q.id;busy=true;
 try{
  const a=q.typeAudit20261011||{};
  a.teacherReview={status,type,tasks,note,reviewedAt:new Date().toISOString(),typeBefore:q.type};
  if(status==='confirmed'&&q.type!==type){
    q.type=type;q.revision=(Number(q.revision)||1)+1;q.updatedAt=new Date().toISOString();
  }
  q.typeAudit20261011=a;
  await api.save(q);
  message='已保存到原题库本地数据库（专项审核不会改变整题“已审核”状态）。';
  api.onChange?.();
  if(filterStatus==='pending'){const next=filtered.find(x=>x.id!==id && reviewStatus(x)==='pending');if(next)selectedId=next.id}
  render();$('typeReviewContent').scrollTop=0;
 }catch(e){message='保存失败：'+(e.message||e);detail()}
 finally{busy=false}
}
function download(data,name){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),2000);
}
function exportRecords(){
 const qs=all();
 const decisions=qs.filter(q=>reviewStatus(q)!=='pending').map(q=>({id:q.id,teacherReview:teacher(q)}));
 download({format:'physics-type-audit-v1',exportedAt:new Date().toISOString(),candidateCount:qs.length,decisions},
 '题型专项复核_'+new Date().toISOString().slice(0,10)+'.json');
 message='已导出 '+decisions.length+' 道审核记录；完整题库请用原页面“备份题库与记录”。';detail();
}
async function importRecords(file){
 if(!file)return;
 const j=JSON.parse(await file.text());
 if(j.format!=='physics-type-audit-v1'||!Array.isArray(j.decisions))throw Error('不是本页面导出的题型专项复核记录');
 const qmap=new Map(all().map(q=>[q.id,q]));let count=0,missing=0;
 for(const d of j.decisions){
  const q=qmap.get(d.id);
  if(!q){missing++;continue}
  const t=d.teacherReview;
  if(!t||!['confirmed','discuss','repair'].includes(t.status))continue;
  const a=q.typeAudit20261011||{};
  // 只合并专项复核结果；不改变原题整体审核状态或原文和图。
  if(t.status==='confirmed'&&TYPES.includes(t.type)&&q.type!==t.type){
    q.type=t.type;q.revision=(Number(q.revision)||1)+1;q.updatedAt=new Date().toISOString();
  }
  a.teacherReview={...t};q.typeAudit20261011=a;
  await api.save(q);count++;
 }
 api.onChange?.();message='导入专项审核 '+count+' 道；清单未匹配 '+missing+' 道。';render();
}
function open(){
 $('typeReviewDialog').showModal();
 filterStatus='pending';keyword='';$('trStatus').value='pending';$('trSearch').value='';
 selectedId='';message='';render();
}
function init(options){
 if(api)return;
 api=options;
 $('typeReviewBtn')?.addEventListener('click',open);
 $('trClose')?.addEventListener('click',()=>$('typeReviewDialog').close());
 $('trStatus')?.addEventListener('change',e=>{filterStatus=e.target.value;selectedId='';render()});
 $('trSearch')?.addEventListener('input',e=>{keyword=e.target.value;selectedId='';render()});
 $('typeReviewQueue')?.addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(!b)return;selectedId=b.dataset.select;message='';render()});
 $('typeReviewContent')?.addEventListener('click',e=>{
  const zoom=e.target.closest('[data-zoom]');if(zoom){zoom.classList.toggle('expanded');return}
  const save=e.target.closest('[data-save-status]');if(save){record(save.dataset.saveStatus);return}
  const edit=e.target.closest('[data-open-editor]');if(edit){const id=selectedId;$('typeReviewDialog').close();api.openEditor?.(id)}
 });
 $('trPrev')?.addEventListener('click',()=>jump(-1));
 $('trNext')?.addEventListener('click',()=>jump(1));
 $('trExport')?.addEventListener('click',exportRecords);
 $('trImport')?.addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';try{await importRecords(file)}catch(err){message=err.message;detail()}});
}
root.PhysicsTypeReview={init,refresh:render};
})(typeof window!=='undefined'?window:globalThis);
