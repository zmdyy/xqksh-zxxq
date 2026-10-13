/* 题库质量审核 V2：教师只做三种动作；检查定位、数据导出、版本回写由系统完成。 */
(function(root){
'use strict';
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MODES=[['overview','待办总览'],['image','图片'],['formula','公式与单位'],['answer','答案'],['duplicate','重复题'],['knowledge','知识点'],['type','题型']];
const TYPES=['选择题','填空题','作图题','实验题','计算题','综合题','其他'];
const TASKS=['选项判断','填空','作图/连线','实验探究','计算','数据或图像处理','综合情境'];
const STATUS={pending:'待核查',repair:'待修复',dismissed:'疑点已排除',modified:'已修改待复核',awaitingAcceptance:'修复待验收',stale:'内容改变待核验',approved:'已核查',resolved:'已处理',discuss:'待讨论'};
let api,mode='overview',scope='risks',query='',id='',peerId='',queue=[],diag=new Map(),dupes=new Map(),drawer=false,selectedIssue='',message='',saving=false;
const D=()=>root.PhysicsQualityDiagnostics;
const normalize=s=>D().norm(s);
function signature(q,d){
 const imgs=a=>(a||[]).map(i=>i.contentHash||((i.data||i.ref||'').slice(0,48))+'-'+(i.data?.length||0)).join(';');
 const v={image:[q.stem,imgs(q.images),imgs(q.answerImages)].join('|'),formula:[q.stem,q.answer].join('|'),answer:[q.stem,q.answer,imgs(q.answerImages)].join('|'),duplicate:[normalize(q.stem),imgs(q.images)].join('|'),knowledge:[q.stem,JSON.stringify(q.tags||[]),q.relation,JSON.stringify(q.knowledgeMappingV1?.parts?.map(p=>[p.part_id,p.primary_concept_id,p.related_concept_ids,p.assessment_ids])||[])].join('|'),type:[q.stem,q.type].join('|')};
 let h=2166136261;for(const x of v[d]||''){h^=x.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36);
}
function audit(q,d){
 const r=q.qualityReviewV1?.[d];if(!r)return {status:'pending',issues:{}};
 if(!r.signature&&['approved','dismissed'].includes(r.status)&&r.importedContentSignature){r.signature=r.importedContentSignature;}
 if(['approved','dismissed','modified'].includes(r.status)&&r.signature!==signature(q,d))return {...r,status:'stale'};
 const flagged=diag.get(q.id)?.filter(x=>x.dim===d)||[];
 const decisions=r.issues||{};
 if(flagged.length&&Object.keys(decisions).length){
  const unresolved=flagged.filter(x=>!decisions[x.id]||decisions[x.id].signature!==signature(q,d));
  if(flagged.some(x=>decisions[x.id]?.status==='repair'&&decisions[x.id].signature===signature(q,d)))return {...r,status:'repair'};
  if(!unresolved.length)return {...r,status:'dismissed'};
  return {...r,status:'pending'};
 }
 return r;
}
function buildIndexes(){
 const questions=api.getQuestions(),byStem=new Map();dupes=new Map();diag=new Map();
 for(const q of questions){
  const k=normalize(q.stem);
  if(k.length<12)continue;
  if(!byStem.has(k))byStem.set(k,[]);
  byStem.get(k).push(q);
 }
 for(const group of byStem.values())if(group.length>1)for(const q of group){const peers=group.filter(x=>x.id!==q.id&&!pairDecision(q,x));if(peers.length)dupes.set(q.id,peers);}
 for(const q of questions)diag.set(q.id,D().scan(q,{duplicates:dupes,catalogByName:api.catalogByName}));
}
function pairDecision(a,b){const key=[a.id,b.id].sort().join('|');const r=a.duplicatePairsV1?.[key]||b.duplicatePairsV1?.[key];if(!r)return false;return ['different','variation','same'].includes(r.verdict)&&r.signatures?.[a.id]===signature(a,'duplicate')&&r.signatures?.[b.id]===signature(b,'duplicate');}
function issues(q,d){const i=diag.get(q.id)||[];return d==='overview'?i:i.filter(x=>x.dim===d)}
function filteredIssue(q,d){
 const a=audit(q,d),signatureNow=signature(q,d);
 if(a.status==='approved')return [];
 if(a.status==='dismissed'&&a.signature===signatureNow&&!Object.keys(a.issues||{}).length)return [];
 return issues(q,d).filter(x=>!(a.issues?.[x.id]?.status==='dismissed'&&a.issues[x.id]?.signature===signatureNow));
}
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
 const all=issues(q,'overview'),groups=new Map();
 for(const issue of all){
  const key=issue.dim,group=groups.get(key)||{first:issue,count:0};
  group.count++;groups.set(key,group);
 }
 const names={formula:'公式与符号异常',image:'图片异常',answer:'答案异常',duplicate:'疑似重复题',knowledge:'知识点匹配',type:'题型需复核'};
 return groups.size?'<div class="qr-flags">'+Array.from(groups,([key,g])=>
 '<button type="button" data-issue-id="'+esc(g.first.id)+'" data-switch="'+esc(key)+'" class="qr-issue">'+
 esc(names[key]||g.first.type)+(g.count>1?' · '+g.count+'处':'')+' ↗</button>').join('')+'</div>':'';
}
function original(q,name,withRepair){
 const i=issues(q,'overview');
 const show=source=>{const text=String(q[source]||'');return i.some(x=>x.source===source&&x.precision==='exact')?D().markText(text,i,source,esc):(root.PhysicsMathContent?.html(text)||esc(text));};
 return '<div class="qr-evidence-body"><div class="qr-meta">'+esc(name||q.id)+' · '+esc(q.source||'')+' · 第'+esc(q.sourceNo||'?')+'题 · '+esc(q.type)+'</div>'+
 issueTags(q)+'<h3>原题</h3><div class="qr-stem">'+show('stem')+'</div>'+
 gallery(q.images||[],'原题图片',withRepair)+
 '<h3 id="qrAnswerHeading">答案与解析</h3><div class="qr-stem qr-answer-text">'+(q.answer?show('answer'):'<span class="qr-neutral">暂无文字答案</span>')+'</div>'+
 gallery(q.answerImages||[],'答案图片',withRepair)+'</div>';
}
function diagnosticPanel(q){
 const items=issues(q,mode);
 if(!items.length)return '<p class="qr-no-issue">规则未发现此类异常；不代表物理正确性已确认。</p>';
 const types=Array.from(new Set(items.map(x=>x.type))).join('、');
 return '<section class="qr-diagnostics qr-diagnostics-group"><strong>'+esc(types)+(items.length>1?'（'+items.length+'处）':'')+'</strong>'+
 '<div class="qr-diagnostic-summary">以下是同一审核项目的全部异常位置；点击对应位置查看高亮，不需要分别浏览多个大提示框。</div>'+
 '<div class="qr-diagnostic-positions">'+items.map((i,n)=>
 '<button type="button" class="qr-diagnostic '+(selectedIssue===i.id?'active':'')+'" data-issue-select="'+esc(i.id)+'" aria-pressed="'+(selectedIssue===i.id?'true':'false')+'">'+
 '<b>位置 '+(n+1)+'：'+esc(i.location)+'</b><small>'+esc(i.evidence)+'</small>'+
 (i.precision==='unlocated'?'<em>仅规则怀疑，尚未定位</em>':'<em>点击定位</em>')+'</button>').join('')+'</div><p class="qr-selected-position" role="status" aria-live="polite">请选择一个异常位置</p></section>';
}
function selectIssue(issueId,scroll=false){
 selectedIssue=issueId||'';
 const host=$('qrContent');
 const buttons=Array.from(host.querySelectorAll('[data-issue-select]'));
 const chosen=buttons.find(b=>b.dataset.issueSelect===selectedIssue);
 for(const b of buttons){const active=b===chosen;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
 const marks=Array.from(host.querySelectorAll('[data-issue]'));
 const target=marks.find(m=>m.dataset.issue===selectedIssue);
 for(const m of marks)m.classList.toggle('qr-current-issue',m===target);
 const status=host.querySelector('.qr-selected-position');
 if(status)status.textContent=chosen?'当前选中：'+chosen.querySelector('b').textContent+(target?'（左侧对应位置已突出显示）':'（尚无精确定位，请结合题目核对）'):'请选择一个异常位置';
 if(scroll&&target)target.scrollIntoView({behavior:'smooth',block:'center'});
}
function special(q){
 if(mode==='overview')return '<div class="qr-overview-actions">'+MODES.slice(1).map(([d,title])=>
 '<button type="button" class="qr-task-row" data-switch="'+d+'"><b>'+title+'</b><span>'+(STATUS[audit(q,d).status]||'待核查')+'</span><span>进入 →</span></button>').join('')+'</div>';
 if(mode==='formula'||mode==='answer')return '<p>题干、答案、单位和公式统一在上方“物理编辑器”修改。这里保留审核结论与教师备注。</p>';
 if(mode==='knowledge'){
  const concepts=Array.from(new Map(Array.from(api.catalogByName.values()).filter(v=>v?.name).map(v=>[v.name,v])).values());
  const A=root.PhysicsConceptAssessment;A?.annotate(q);const mapping=q.knowledgeMappingV1;const mappingView=mapping?'<div class="qr-mapping">'+mapping.parts.map(p=>'<p><b>'+esc(p.part_label)+'</b> · '+esc((p.concept_ids||[]).map(id=>A.getCatalog().concepts.find(c=>c.concept_id===id)?.name||id).join('；'))+'<br>考法：'+esc(A.methodNames(p.assessment_ids).join('；'))+'<br>'+esc(p.primary_concept_id?'已确定主知识点':'主辅关系待复核')+'<label>主知识点<select data-task-primary="'+esc(p.part_id)+'"><option value="">待确定</option>'+(p.concept_ids||[]).map(cid=>'<option value="'+esc(cid)+'"'+(cid===p.primary_concept_id?' selected':'')+'>'+esc(A.getCatalog().concepts.find(c=>c.concept_id===cid)?.name||cid)+'</option>').join('')+'</select></label><label>具体考法（可多选）<select multiple size="4" data-task-assessments="'+esc(p.part_id)+'">'+A.getCatalog().methods.filter(m=>!m.concept_ids||m.concept_ids.some(id=>p.concept_ids.includes(id))).map(m=>'<option value="'+esc(m.id)+'"'+(p.assessment_ids.includes(m.id)?' selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></label></p>').join('')+'</div>':'';
  return mappingView+'<label>从知识图谱搜索<input type="text" id="qrKnowledgePick" list="qrKnowledgeOptions" placeholder="搜索或输入知识点名称"></label>'+
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
  return '<label>两题比较结论<select id="qrDuplicateVerdict">'+Object.entries({unknown:'待判断',same:'完全重复',variation:'同题变式',different:'不是重复题'}).map(([k,t])=>'<option value="'+k+'"'+(q.qualityReviewV1?.duplicate?.verdict===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label><label>完全重复时保留<select id="qrDuplicateKeep"><option value="current">题目A</option><option value="peer">题目B</option></select></label>';
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
  host.innerHTML='<div class="qr-duplicate-workspace"><div class="qr-review-layout qr-duplicate-mode"><section class="qr-evidence">'+left+'</section><section class="qr-evidence qr-evidence-b">'+right+'</section></div>'+
  '<div class="qr-duplicate-controls">'+diagnosticPanel(q)+special(q)+'<label>教师备注<textarea id="qrNote">'+esc(audit(q,mode).note||'')+'</textarea></label>'+actions(q)+'</div></div>';
  return;
 }
 const side='<div class="qr-side"><div class="qr-side-title"><b>'+esc(Object.fromEntries(MODES)[mode])+'</b></div>'+
 '<div class="qr-side-scroll">'+diagnosticPanel(q)+special(q)+
 (mode==='overview'?'':'<label>教师备注<textarea id="qrNote" placeholder="可选：描述位置及问题">'+esc(audit(q,mode).note||'')+'</textarea></label>')+
 '</div>'+actions(q)+'</div>';
 host.innerHTML='<button type="button" data-unified-editor class="primary">打开物理编辑器 · 单位 / 公式 / 对照</button><div class="qr-review-layout"><section class="qr-evidence">'+left+'</section>'+side+'</div>';
 selectIssue(selectedIssue);
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
   for(const dim of ({stem:['formula','answer','duplicate','knowledge','type'],answer:['formula','answer'],type:['type'],tags:['knowledge'],relation:['knowledge'],knowledgeMappingV1:['knowledge'],typeAudit20261011:['type']})[f]||[]){
    review[dim]={...(review[dim]||{}),status:'modified',signature:signature(q,dim),reviewedAt:now,note:'教师已修改，待复核'};
   }
  }
  q.qualityReviewV1=review;
  await api.save(q);api.onChange?.();message='修改已保存，相关项目待复核';return true;
 }catch(e){Object.assign(q,old);message='保存失败：'+e.message;return false}
}
async function save(){
 const q=api.getQuestions().find(x=>x.id===id);if(!q)return;
 if(mode==='duplicate'){await resolveDuplicate(q);render();return;}
 const changes={},type=$('qrMainType')?.value;
 if(type&&type!==q.type)changes.type=type;
 if(mode==='formula'){changes.stem=q.stem;changes.answer=q.answer;if(!changes.stem.trim()){message='题干不能清空';rendered();return}}
 if(mode==='answer')changes.answer=q.answer;
 if(mode==='knowledge'){
  const tags=Array.from(new Set($('qrTags').value.split(/[；;,，、]/).map(x=>x.trim()).filter(Boolean)));
  if(!tags.length){message='知识点不能全部删除';rendered();return}
  changes.tags=tags;changes.relation=$('qrRelation').value;
  if(root.PhysicsConceptAssessment){const A=root.PhysicsConceptAssessment,shadow={...q,tags,relation:changes.relation};A.annotate(shadow,{force:true});const mapping=JSON.parse(JSON.stringify(shadow.knowledgeMappingV1));const allowed=new Set(A.getCatalog().methods.map(m=>m.id));for(const p of mapping.parts){const pick=Array.from($('qrContent').querySelectorAll('[data-task-primary]')).find(el=>el.dataset.taskPrimary===p.part_id);const input=Array.from($('qrContent').querySelectorAll('[data-task-assessments]')).find(el=>el.dataset.taskAssessments===p.part_id);const primary=pick?.value||null,methods=input?Array.from(input.selectedOptions).map(o=>o.value):p.assessment_ids;if(methods.some(x=>!allowed.has(x))){message='考法编号无效，请使用已列出的目录编号';rendered();return;}p.primary_concept_id=primary;p.related_concept_ids=primary?p.concept_ids.filter(x=>x!==primary):[];p.candidate_concept_ids=primary?[]:p.concept_ids;p.assessment_ids=methods;p.status=primary?'confirmed':'needsReview';}mapping.status=mapping.parts.some(p=>!p.primary_concept_id)?'needsReview':'approved';mapping.signature=A.digest(shadow);changes.knowledgeMappingV1=mapping;changes.assessment_ids=Array.from(new Set(mapping.parts.flatMap(p=>p.assessment_ids)));changes.concept_ids=shadow.concept_ids;}
 }
 if(mode==='type'){
  const tasks=Array.from($('qrContent').querySelectorAll('[data-task]:checked')).map(e=>e.dataset.task);
  changes.typeAudit20261011={...(q.typeAudit20261011||{}),teacherReview:{...(q.typeAudit20261011?.teacherReview||{}),status:'confirmed',type:type||q.type,tasks,reviewedAt:new Date().toISOString()}};
 }
 if(mode==='duplicate'){ const v=$('qrDuplicateVerdict')?.value||'unknown'; if(v!=='unknown'&&v!==q.qualityReviewV1?.duplicate?.verdict){changes.duplicateVerdict=v} }
 await saveChange(q,changes,mode);render();
}
async function resolveDuplicate(q){
 const peer=(dupes.get(q.id)||[]).find(x=>x.id===peerId)||(dupes.get(q.id)||[])[0],verdict=$('qrDuplicateVerdict')?.value||'unknown';
 if(!peer||verdict==='unknown'){message='请选择对照题和比较结论';return;}
 const at=new Date().toISOString(),key=[q.id,peer.id].sort().join('|'),survivor=$('qrDuplicateKeep')?.value==='peer'?peer:q,archived=survivor===q?peer:q;
 const record={pairId:key,questionIds:[q.id,peer.id],verdict,signatures:{[q.id]:signature(q,'duplicate'),[peer.id]:signature(peer,'duplicate')},survivorId:verdict==='same'?survivor.id:null,reviewedAt:at,note:$('qrNote')?.value||''};
 const next=[q,peer].map(x=>({...x,duplicatePairsV1:{...(x.duplicatePairsV1||{}),[key]:record},qualityReviewV1:{...(x.qualityReviewV1||{}),duplicate:{status:'resolved',verdict,signature:signature(x,'duplicate'),reviewedAt:at,peerId:x===q?peer.id:q.id}},qualityReviewEventsV2:[...(x.qualityReviewEventsV2||[]),{id:key+'|'+at+'|resolved',dim:'duplicate',action:'resolved',...record}]}));
 if(verdict==='same')next.find(x=>x.id===archived.id).archivedAsDuplicate={survivorId:survivor.id,at,reason:'教师对照确认完全重复',reversible:true};
 try{if(api.saveMany)await api.saveMany(next);else for(const x of next)await api.save(x);for(let i=0;i<next.length;i++)Object.assign([q,peer][i],next[i]);api.onChange?.();message=verdict==='same'?'已保留'+survivor.id+'，归档'+archived.id:'这对题的比较结论已保存';}catch(e){message='保存失败：'+e.message;}
}
async function decision(action){
 if(saving||mode==='overview')return;
 const q=api.getQuestions().find(x=>x.id===id);if(!q)return;
 if(mode==='duplicate'){await resolveDuplicate(q);render();return;}
 const verdict=mode==='duplicate'?$('qrDuplicateVerdict')?.value||'unknown':'';
 if(mode==='duplicate'&&verdict==='unknown'){message='请先选择两道题的比较结论';rendered();return}
 if(mode==='duplicate'&&action==='dismissed'&&verdict==='same'){message='完全重复的题不能排除疑点，请选择需修复';rendered();return}
 const outstanding=filteredIssue(q,mode),issue=issues(q,mode).find(x=>x.id===selectedIssue)||outstanding[0]||issues(q,mode)[0];
 const noteText=$('qrNote')?.value||'',at=new Date().toISOString();
 const current=q.qualityReviewV1||{},oldRecord=current[mode]||{};
 const signatureNow=signature(q,mode);
 const decisions={...(oldRecord.issues||{})};
 if(issue)decisions[issue.id]={status:action,signature:signatureNow,at,note:noteText};
 const dimStatus=action==='repair'?'repair':(issue&&outstanding.length>1?'pending':'dismissed');
 const nextRecord={...oldRecord,status:dimStatus,note:noteText,verdict,signature:signatureNow,reviewedAt:at,issues:decisions};
 const entry={id:q.id+'|'+mode+'|'+at+'|'+action,dim:mode,issueId:issue?.id||'',action,at,
  location:issue?.location||'仅规则怀疑，尚未定位',type:issue?.type||'人工确认',evidence:issue?.evidence||'',
  snippet:issue?.detail||'',note:noteText,verdict};
 const previous=q.qualityReviewV1,events=q.qualityReviewEventsV2;
 q.qualityReviewV1={...current,[mode]:nextRecord};
 q.qualityReviewEventsV2=[...(events||[]),entry];
 try{
  await api.save(q);api.onChange?.();
  message=action==='repair'?'已加入修复清单':'本条疑点已排除'+(outstanding.length>1?'，还有'+(outstanding.length-1)+'条待判断':'');
  selectedIssue='';
  render();
 }catch(e){
  q.qualityReviewV1=previous;q.qualityReviewEventsV2=events;message='保存失败：'+e.message;rendered();
 }
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
  if(e.target.closest('[data-unified-editor]')){const stem=$('qrStem'),answer=$('qrAnswerEdit'),q=api.getQuestions().find(x=>x.id===id);if((stem&&stem.value!==q.stem)||(answer&&answer.value!==q.answer)||($('qrNote')&&$('qrNote').value!==(audit(q,mode).note||''))){message='请先保存当前审核区修改，再打开物理编辑器';const hint=document.createElement('p');hint.textContent=message;e.target.after(hint);return}await api.openEditor(id,{review:true});return}
  const zoom=e.target.closest('[data-zoom]');if(zoom){zoom.classList.toggle('expanded');return}
  const focus=e.target.closest('[data-switch]');if(focus){focusMode(focus.dataset.switch,focus.dataset.issueId);return}
  const highlight=e.target.closest('[data-issue-select]');if(highlight){
   selectIssue(highlight.dataset.issueSelect,true);return;
  }
  const image=e.target.closest('[data-image-action]');if(image){await root.PhysicsImageRepair?.actFor?.(id,image.dataset.side,Number(image.dataset.index),image.dataset.imageAction);render();return}
  if(e.target.closest('[data-image-batch]')){$('repairDialog').showModal();root.PhysicsImageRepair?.refresh?.();return}
  const add=e.target.closest('[data-add-concept]');if(add){const field=$('qrKnowledgePick'),val=field.value.trim(),existing=$('qrTags').value.split(/[；;,，、]/).map(x=>x.trim()).filter(Boolean);if(val&&!existing.includes(val))existing.push(val);$('qrTags').value=existing.join('；');field.value='';return}
  const btn=e.target.closest('[data-decision]');if(btn){await decision(btn.dataset.decision);return}
  if(e.target.closest('[data-save-all]')){await save();return}
 });
 $('qrExport').addEventListener('click',exportExcel);
}
root.PhysicsQualityReview={init,refresh:render,audit,overall,signature,pairDecision};
})(typeof window!=='undefined'?window:globalThis);
