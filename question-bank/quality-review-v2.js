/* 题库质量审核 V2：教师只做三种动作；检查定位、数据导出、版本回写由系统完成。 */
(function(root){
'use strict';
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MODES=[['overview','待办总览'],['image','图片'],['formula','公式与单位'],['answer','答案'],['duplicate','重复题'],['knowledge','知识点'],['type','题型']];
const TYPES=['选择题','填空题','作图题','实验题','计算题','综合题','综合能力题','其他'];
const TASKS=['选项判断','填空','作图/连线','实验探究','计算','数据或图像处理','综合情境'];
const STATUS={pending:'待核查',repair:'待修复',dismissed:'疑点已排除',modified:'已修改待复核',awaitingAcceptance:'修复待验收',stale:'内容改变待核验',approved:'已核查',discuss:'待讨论'};
let api,mode='overview',scope='risks',query='',id='',peerId='',queue=[],diag=new Map(),dupes=new Map(),drawer=false,selectedIssue='',message='',saving=false;
const D=()=>root.PhysicsQualityDiagnostics;
const normalize=s=>D().norm(s);
function signature(q,d){
 const imgs=a=>(a||[]).map(i=>i.contentHash||((i.data||i.ref||'').slice(0,48))+'-'+(i.data?.length||0)).join(';');
 const v={image:[q.stem,imgs(q.images),imgs(q.answerImages)].join('|'),formula:[q.stem,q.answer].join('|'),answer:[q.stem,q.answer,imgs(q.answerImages)].join('|'),duplicate:[normalize(q.stem),imgs(q.images)].join('|'),knowledge:[q.stem,JSON.stringify(q.tags||[]),q.relation].join('|'),type:[q.stem,q.type].join('|')};
 let h=2166136261;for(const x of v[d]||''){h^=x.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36);
}
function audit(q,d){
 const r=q.qualityReviewV1?.[d];if(!r)return {status:'pending'};
 if(['approved','dismissed','modified'].includes(r.status)&&r.signature!==signature(q,d))return {...r,status:'stale'};
 return r;
}
function buildIndexes(){
 const questions=api.getQuestions(),byStem=new Map();dupes=new Map();diag=new Map();
 for(const q of questions){
  const k=normalize(q.stem);
  if(k.length<20)continue;
  if(!byStem.has(k))byStem.set(k,[]);
  byStem.get(k).push(q);
 }
 for(const group of byStem.values())if(group.length>1)for(const q of group)dupes.set(q.id,group.filter(x=>x.id!==q.id));
 for(const q of questions)diag.set(q.id,D().scan(q,{duplicates:dupes,catalogByName:api.catalogByName}));
}
function issues(q,d){const i=diag.get(q.id)||[];return d==='overview'?i:i.filter(x=>x.dim===d)}
function filteredIssue(q,d){const a=audit(q,d);return a.status==='dismissed'||a.status==='approved'?[]:issues(q,d)}
function overall(q){
 const states=MODES.slice(1).map(([d])=>audit(q,d).status);
 if(states.includes('repair'))return {code:'repair',label:'待修复'};
 if(states.includes('awaitingAcceptance'))return {code:'accept',label:'修复待验收'};
 if(states.includes('modified'))return {code:'modified',label:'已修改待复核'};
 if(states.includes('stale'))return {code:'stale',label:'内容变化待复核'};
 if(states.includes('discuss'))return {code:'discuss',label:'待讨论'};
 if(MODES.slice(1).some(([d])=>filteredIssue(q,d).length))return {code:'risk',label:'有疑点待核查'};
 return q.review==='approved'?{code:'teacher',label:'已有人工作业审核'}:{code:'screened',label:'规则检查通过（非物理正确性认证）'};
}
function relevant(q){
 if(mode==='image')return !!((q.images||[]).length||(q.answerImages||[]).length||issues(q,'image').length);
 if(mode==='duplicate')return dupes.has(q.id)||!!q.qualityReviewV1?.duplicate;
 return true;
}
function include(q){
 if(!relevant(q))return false;
 if(query&&!normalize([q.id,q.source,q.sourceNo,q.stem,(q.tags||[]).join(' ')].join(' ')).includes(normalize(query)))return false;
 const states=mode==='overview'?MODES.slice(1).map(([d])=>audit(q,d).status):[audit(q,mode).status];
 if(scope==='all')return true;
 if(scope==='repair')return states.includes('repair');
 if(scope==='approved')return mode==='overview'?overall(q).code==='screened'||overall(q).code==='teacher':states.includes('dismissed')||states.includes('approved');
 if(scope==='discuss')return states.includes('discuss');
 if(scope==='pending')return states.some(x=>['pending','modified','awaitingAcceptance','stale'].includes(x));
 if(mode==='overview')return !['screened','teacher'].includes(overall(q).code);
 return states.some(x=>['repair','awaitingAcceptance','stale','modified','discuss'].includes(x))||filteredIssue(q,mode).length>0;
}
function issueScore(q){return issues(q,mode).length+(['repair','awaitingAcceptance','stale'].includes(audit(q,mode).status)?4:0)}
function tabs(){
 const qs=api.getQuestions();
 $('qrTabs').innerHTML=MODES.map(([d,title])=>{
  const count=d==='overview'?qs.filter(q=>!['screened','teacher'].includes(overall(q).code)).length:
  qs.filter(q=>issues(q,d).length&&audit(q,d).status!=='dismissed'&&audit(q,d).status!=='approved').length;
  return '<button type="button" class="qr-tab '+(mode===d?'active':'')+'" data-dim="'+d+'">'+title+'<small>'+count+'道待关注</small></button>';
 }).join('');
 $('qrSummary').textContent='';
}
function media(x){return x?.repair?.originalData||((x?.useRedraw&&x.redrawPng)||x?.data||x?.src||'')}
function gallery(images,title,editable){
 if(!images?.length)return '';
 const side=title==='原题图片'?'images':'answerImages';
 return '<h4>'+title+'</h4><div class="qr-gallery">'+images.map((im,i)=>{
  const r=im.repair||{};
  return '<figure><figcaption>'+title+' '+(i+1)+'</figcaption><button type="button" data-zoom><img loading="lazy" alt="'+title+'" src="'+esc(media(im))+'"></button>'+
  (editable&&r.candidateData?'<div class="qr-compare"><b>修复候选</b><button type="button" data-zoom><img loading="lazy" alt="修复候选" src="'+esc(r.candidateData)+'"></button></div>':'')+
  (editable&&r.alternativeCandidateData?'<div class="qr-compare"><b>备选高清图</b><button type="button" data-zoom><img loading="lazy" alt="备选高清图" src="'+esc(r.alternativeCandidateData)+'"></button></div>':'')+
  (editable&&r.candidateData?'<div class="qr-image-tools"><button type="button" data-image-action="approve" data-side="'+side+'" data-index="'+i+'">采用候选</button><button type="button" data-image-action="reject" data-side="'+side+'" data-index="'+i+'">保留原图</button></div>':'')+'</figure>';
 }).join('')+'</div>';
}
function issueTags(q){
 const items=issues(q,'overview');
 return items.length?'<div class="qr-flags">'+items.map(i=>'<button type="button" data-issue-id="'+esc(i.id)+'" data-switch="'+esc(i.dim)+'" class="qr-issue">'+esc(i.type)+' ↗</button>').join('')+'</div>':'';
}
function original(q,name,withRepair){
 const i=issues(q,'overview');
 const show=source=>D().markText(String(q[source]||''),i,source,esc);
 return '<div class="qr-evidence-body"><div class="qr-meta">'+esc(name||q.id)+' · '+esc(q.source||'')+' · 第'+esc(q.sourceNo||'?')+'题 · '+esc(q.type)+'</div>'+
 issueTags(q)+'<h3>原题</h3><div class="qr-stem">'+show('stem')+'</div>'+
 gallery(q.images||[],'原题图片',withRepair)+
 '<h3 id="qrAnswerHeading">答案与解析</h3><div class="qr-stem qr-answer-text">'+(q.answer?show('answer'):'<span class="qr-neutral">暂无文字答案</span>')+'</div>'+
 gallery(q.answerImages||[],'答案图片',withRepair)+'</div>';
}
function diagnosticPanel(q){
 const items=issues(q,mode);
 return items.length?'<section class="qr-diagnostics"><strong>疑点与定位依据</strong>'+items.map(i=>
 '<button type="button" class="qr-diagnostic '+(selectedIssue===i.id?'active':'')+'" data-issue-select="'+esc(i.id)+'"><b>'+esc(i.type)+'</b><span>'+esc(i.location)+'</span><small>'+esc(i.evidence)+'</small>'+
 (i.precision==='unlocated'?'<em>仅规则怀疑，尚未定位</em>':'<em>已定位，点击高亮对应位置</em>')+'</button>').join('')+'</section>':
 '<p class="qr-no-issue">本项暂无规则检出的异常。这仅代表自动规则覆盖范围，不能证明所有物理内容正确。</p>';
}
function special(q){
 if(mode==='overview')return '<div class="qr-overview-actions">'+MODES.slice(1).map(([d,title])=>
 '<button type="button" class="qr-task-row" data-switch="'+d+'"><b>'+title+'</b><span>'+STATUS[audit(q,d).status]||'待核查'+'</span><span>进入 →</span></button>').join('')+'</div>';
 if(mode==='formula')return '<label>题干、公式<textarea id="qrStem">'+esc(q.stem||'')+'</textarea></label><label>答案、计算过程<textarea id="qrAnswerEdit">'+esc(q.answer||'')+'</textarea></label>';
 if(mode==='answer')return '<label>答案与解析<textarea id="qrAnswerEdit">'+esc(q.answer||'')+'</textarea></label>';
 if(mode==='knowledge'){
  const concepts=Array.from(new Map(Array.from(api.catalogByName.values()).filter(v=>v?.name).map(v=>[v.name,v])).values());
  return '<label>从知识图谱搜索<input type="text" id="qrKnowledgePick" list="qrKnowledgeOptions" placeholder="搜索或输入知识点名称"></label>'+
  '<datalist id="qrKnowledgeOptions">'+concepts.map(v=>'<option value="'+esc(v.name)+'">'+esc(v.module||'')+'</option>').join('')+'</datalist>'+
  '<button type="button" data-add-concept>＋添加知识点</button><label>已有知识点<textarea id="qrTags">'+esc((q.tags||[]).join('；'))+'</textarea></label>'+
  '<label>知识点关系<select id="qrRelation">'+Object.entries({pending:'待判断',single:'单知识点',cross:'真正交叉应用',parallel:'并列小问',options:'选项辨析'}).map(([val,text])=>
 '<option value="'+val+'"'+(q.relation===val?' selected':'')+'>'+text+'</option>').join('')+'</select></label>';
 }
 if(mode==='type'){
  const tasks=q.typeAudit20261011?.teacherReview?.tasks||[];
  return '<h4>次级考法</h4><div class="qr-tasks">'+TASKS.map(t=>'<label><input type="checkbox" data-task="'+esc(t)+'"'+(tasks.includes(t)?' checked':'')+'>'+esc(t)+'</label>').join('')+'</div>';
 }
 if(mode==='duplicate'){
  return '<label>两题比较结论<select id="qrDuplicateVerdict">'+Object.entries({unknown:'待判断',same:'完全重复',variation:'同题变式',different:'不是重复题'}).map(([k,t])=>'<option value="'+k+'"'+(q.qualityReviewV1?.duplicate?.verdict===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label>';
 }
 if(mode==='image')return '<button type="button" data-image-batch>高级图片对照与整库ZIP导出</button>';
 return '';
}
function rendered(){
 const q=api.getQuestions().find(x=>x.id===id),host=$('qrContent');
 if(!q){host.innerHTML='<p class="qr-empty">没有符合条件的题目</p>';return}
 const peer=mode==='duplicate'?(dupes.get(q.id)||[]).find(x=>x.id===peerId)||(dupes.get(q.id)||[])[0]:null;
 if(peer)peerId=peer.id;
 let left=original(q,mode==='duplicate'?'题目A · '+q.id:q.id,mode==='image');
 if(mode==='duplicate'){
  const choices=(dupes.get(q.id)||[]).map(t=>'<option value="'+esc(t.id)+'"'+(t.id===peerId?' selected':'')+'>'+esc(t.id)+' · '+esc(t.sourceNo||'')+'题</option>').join('');
  left='<div class="qr-pair-header"><b>题目A（当前题）</b></div>'+left;
  const right=peer?'<div class="qr-pair-header"><b>题目B（疑似重复）</b><select id="qrPeerPicker" aria-label="选择对照题">'+choices+'</select></div>'+original(peer,'题目B · '+peer.id,false):'<div class="qr-empty">暂无疑似重复题</div>';
  host.innerHTML='<div class="qr-review-layout qr-duplicate-mode"><section class="qr-evidence">'+left+'</section><section class="qr-evidence qr-evidence-b">'+right+'</section></div>'+
  '<div class="qr-duplicate-controls">'+diagnosticPanel(q)+special(q)+'<label>教师备注<textarea id="qrNote">'+esc(audit(q,mode).note||'')+'</textarea></label>'+actions(q)+'</div>';
  return;
 }
 const side='<div class="qr-side"><div class="qr-side-title"><b>'+esc(Object.fromEntries(MODES)[mode])+'</b></div>'+
 '<div class="qr-side-scroll">'+diagnosticPanel(q)+special(q)+
 (mode==='overview'?'':'<label>教师备注<textarea id="qrNote" placeholder="可选：描述位置及问题">'+esc(audit(q,mode).note||'')+'</textarea></label>')+
 '</div>'+actions(q)+'</div>';
 host.innerHTML='<div class="qr-review-layout"><section class="qr-evidence">'+left+'</section>'+side+'</div>';
}
function actions(q){
 if(mode==='overview')return '<div class="qr-side-bottom"><p>点击右侧的审核项目开始。</p><span>当前题：'+esc(overall(q).label)+'</span></div>';
 return '<div class="qr-side-bottom qr-compact-actions"><div class="qr-primary-actions">'+
 '<button type="button" data-decision="repair">需修复</button>'+
 '<button type="button" data-decision="dismissed">排除疑点</button>'+
 '<button type="button" class="primary" data-save-all>保存修改</button>'+
 '<label>题型 <select id="qrMainType" aria-label="题目主类型">'+TYPES.map(t=>'<option'+(q.type===t?' selected':'')+'>'+t+'</option>').join('')+'</select></label></div>'+
 '<span class="qr-result">'+esc(STATUS[audit(q,mode).status]||'待核查')+' · '+esc(overall(q).label)+' · '+esc(message)+'</span></div>';
}
function render(){
 if(!api)return;
 buildIndexes();tabs();
 queue=api.getQuestions().filter(include).sort((a,b)=>issueScore(b)-issueScore(a)||String(a.source||'').localeCompare(String(b.source||''),'zh-CN'));
 if(id&&mode!=='overview'&&scope==='risks'&&!queue.some(x=>x.id===id)&&api.getQuestions().some(x=>x.id===id)){scope='all';$('qrScope').value='all';queue=api.getQuestions().filter(include)}
 if(!queue.some(q=>q.id===id))id=queue[0]?.id||'';
 const pos=queue.findIndex(q=>q.id===id),page=Math.floor(Math.max(pos,0)/40),items=queue.slice(page*40,(page+1)*40);
 $('qrList').innerHTML=items.map((q,j)=>'<button data-id="'+esc(q.id)+'" class="'+(q.id===id?'active':'')+'"><b>'+(page*40+j+1)+'. '+esc(q.sourceNo||'?')+'题</b><small>'+esc(q.source||q.id)+'</small><small>'+esc((q.stem||'').slice(0,55))+'</small></button>').join('')||'<p class="qr-empty">没有符合条件的题目</p>';
 $('qrCount').textContent=pos<0?'0 / 0':'第 '+(pos+1)+' / '+queue.length+' 题';
 $('qrQueueBadge').textContent='('+queue.length+'道)';
 $('qrPrevious').disabled=pos<=0;$('qrFollowing').disabled=pos<0||pos===queue.length-1;
 rendered();
}
function focusMode(d,issue){
 mode=d;selectedIssue=issue||'';scope='risks';query='';message='';$('qrScope').value='risks';$('qrSearch').value='';render();
}
function drawerSet(on){
 drawer=!!on;$('qrDrawer').classList.toggle('open',drawer);$('qrDrawer').setAttribute('aria-hidden',String(!drawer));
 $('qrDrawerBackdrop').hidden=!drawer;$('qrQueueToggle').setAttribute('aria-expanded',String(drawer));
}
function next(step){const p=queue.findIndex(q=>q.id===id);if(p+step<0||p+step>=queue.length)return;id=queue[p+step].id;peerId='';message='';render()}
async function saveChange(q,changes,kind){
 const fields=Object.keys(changes).filter(k=>JSON.stringify(changes[k])!==JSON.stringify(q[k]));
 if(!fields.length){message='没有内容变化';return true}
 const before={},changed={};for(const k of fields){before[k]=q[k];changed[k]=changes[k]}
 const old={...q,qualityEditHistory:q.qualityEditHistory,qualityReviewV1:q.qualityReviewV1};
 const now=new Date().toISOString();
 try{
  Object.assign(q,changed);
  if(fields.includes('tags'))api.updateConcepts?.(q);
  q.revision=Number(q.revision||1)+1;q.updatedAt=now;
  q.qualityEditHistory=[...(q.qualityEditHistory||[]),{at:now,label:kind,before,changes:changed}];
  const review={...(q.qualityReviewV1||{})};
  for(const f of fields){
   for(const dim of ({stem:['formula','answer','duplicate','knowledge','type'],answer:['formula','answer'],type:['type'],tags:['knowledge'],relation:['knowledge'],typeAudit20261011:['type']})[f]||[]){
    review[dim]={...(review[dim]||{}),status:'modified',signature:signature(q,dim),reviewedAt:now,note:'教师已修改，待复核'};
   }
  }
  q.qualityReviewV1=review;
  await api.save(q);api.onChange?.();message='修改已保存，相关项目待复核';return true;
 }catch(e){Object.assign(q,old);message='保存失败：'+e.message;return false}
}
async function save(){
 const q=api.getQuestions().find(x=>x.id===id);if(!q)return;
 const changes={},type=$('qrMainType')?.value;
 if(type&&type!==q.type)changes.type=type;
 if(mode==='formula'){changes.stem=$('qrStem').value;changes.answer=$('qrAnswerEdit').value;if(!changes.stem.trim()){message='题干不能清空';rendered();return}}
 if(mode==='answer')changes.answer=$('qrAnswerEdit').value;
 if(mode==='knowledge'){
  const tags=Array.from(new Set($('qrTags').value.split(/[；;,，、]/).map(x=>x.trim()).filter(Boolean)));
  if(!tags.length){message='知识点不能全部删除';rendered();return}
  changes.tags=tags;changes.relation=$('qrRelation').value;
 }
 if(mode==='type'){
  const tasks=Array.from($('qrContent').querySelectorAll('[data-task]:checked')).map(e=>e.dataset.task);
  changes.typeAudit20261011={...(q.typeAudit20261011||{}),teacherReview:{...(q.typeAudit20261011?.teacherReview||{}),status:'confirmed',type:type||q.type,tasks,reviewedAt:new Date().toISOString()}};
 }
 if(mode==='duplicate')changes.duplicateVerdict=$('qrDuplicateVerdict')?.value||'unknown';
 await saveChange(q,changes,mode);render();
}
async function decision(action){
 if(saving||mode==='overview')return;
 const q=api.getQuestions().find(x=>x.id===id);if(!q)return;
 const verdict=mode==='duplicate'?$('qrDuplicateVerdict')?.value||'unknown':'';
 if(mode==='duplicate'&&verdict==='unknown'){message='请先选择重复题比较结论';rendered();return}
 if(mode==='duplicate'&&action==='dismissed'&&verdict==='same'){message='确认完全重复不能选择“排除疑点”，请使用“需修复”';rendered();return}
 const noteText=$('qrNote')?.value||'',issue=(issues(q,mode).find(x=>x.id===selectedIssue)||issues(q,mode)[0]);
 const at=new Date().toISOString(),entry={id:q.id+'|'+mode+'|'+at+'|'+action,dim:mode,action,at,location:issue?.location||'仅规则怀疑，尚未定位',
 type:issue?.type||'人工核验',evidence:issue?.evidence||'',snippet:issue?.detail||'',note:noteText,verdict};
 const previous=q.qualityReviewV1;
 q.qualityReviewV1={...(q.qualityReviewV1||{}),[mode]:{status:action,note:noteText,verdict,signature:signature(q,mode),reviewedAt:at}};
 q.qualityReviewEventsV2=[...(q.qualityReviewEventsV2||[]),entry];
 try{await api.save(q);api.onChange?.();message=action==='repair'?'已加入修复清单':'疑点已排除';render()}
 catch(e){q.qualityReviewV1=previous;q.qualityReviewEventsV2.pop();message='保存失败：'+e.message;rendered()}
}
async function exportExcel(){
 if(!root.PhysicsQualityExport){message='Excel导出模块未加载';rendered();return}
 const button=$('qrExport');button.disabled=true;
 try{
  const ledger=await api.getSetting('qualityExportLedgerV2')||[];
  const version=await api.getSetting('bankVersionV2')||'未记录版本';
  const result=await root.PhysicsQualityExport.create(api.getQuestions(),ledger,version);
  if(!result.count){message='没有新增修改需要导出';rendered();return}
  const url=URL.createObjectURL(result.blob),a=document.createElement('a');a.href=url;a.download='题库质量修改清单_'+new Date().toISOString().slice(0,10)+'.xlsx';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  await api.setSetting('qualityExportLedgerV2',[...ledger,...result.keys]);
  message='已导出'+result.count+'项修改（仅元数据，无题图），发送此Excel即可';rendered();
 }catch(e){message='导出失败：'+e.message;rendered()}finally{button.disabled=false}
}
function init(options){
 api=options;
 $('qualityReviewBtn').addEventListener('click',()=>{$('qualityReviewDialog').showModal();drawerSet(false);focusMode('overview')});
 $('qrClose').addEventListener('click',()=>$('qualityReviewDialog').close());
 $('qrQueueToggle').addEventListener('click',()=>drawerSet(!drawer));
 $('qrDrawerClose').addEventListener('click',()=>drawerSet(false));$('qrDrawerBackdrop').addEventListener('click',()=>drawerSet(false));
 $('qrFocusToggle').addEventListener('click',()=>{const g=$('qrGrid'),enabled=!g.classList.contains('edit-focus');g.classList.toggle('edit-focus',enabled);$('qrFocusToggle').textContent=enabled?'恢复对照比例':'扩大编辑区'});
 $('qrTabs').addEventListener('click',e=>{const target=e.target.closest('[data-dim]');if(target)focusMode(target.dataset.dim)});
 $('qrScope').addEventListener('change',e=>{scope=e.target.value;id='';render()});
 $('qrSearch').addEventListener('input',e=>{query=e.target.value;id='';render()});
 $('qrList').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;id=b.dataset.id;peerId='';drawerSet(false);render()});
 $('qrPrevious').addEventListener('click',()=>next(-1));$('qrFollowing').addEventListener('click',()=>next(1));
 $('qrContent').addEventListener('change',e=>{if(e.target?.id==='qrPeerPicker'){peerId=e.target.value;rendered()}});
 $('qrContent').addEventListener('click',async e=>{
  const zoom=e.target.closest('[data-zoom]');if(zoom){zoom.classList.toggle('expanded');return}
  const focus=e.target.closest('[data-switch]');if(focus){focusMode(focus.dataset.switch,focus.dataset.issueId);return}
  const highlight=e.target.closest('[data-issue-select]');if(highlight){
   selectedIssue=highlight.dataset.issueSelect;const elem=Array.from($('qrContent').querySelectorAll('[data-issue]')).find(x=>x.dataset.issue===selectedIssue);
   if(elem)elem.scrollIntoView({behavior:'smooth',block:'center'});else message='仅规则怀疑，尚未定位';return;
  }
  const image=e.target.closest('[data-image-action]');if(image){await root.PhysicsImageRepair?.actFor?.(id,image.dataset.side,Number(image.dataset.index),image.dataset.imageAction);render();return}
  if(e.target.closest('[data-image-batch]')){$('repairDialog').showModal();root.PhysicsImageRepair?.refresh?.();return}
  const add=e.target.closest('[data-add-concept]');if(add){const field=$('qrKnowledgePick'),val=field.value.trim(),existing=$('qrTags').value.split(/[；;,，、]/).map(x=>x.trim()).filter(Boolean);if(val&&!existing.includes(val))existing.push(val);$('qrTags').value=existing.join('；');field.value='';return}
  const btn=e.target.closest('[data-decision]');if(btn){await decision(btn.dataset.decision);return}
  if(e.target.closest('[data-save-all]')){await save();return}
 });
 $('qrExport').addEventListener('click',exportExcel);
}
root.PhysicsQualityReview={init,refresh:render,audit,overall,signature};
})(typeof window!=='undefined'?window:globalThis);