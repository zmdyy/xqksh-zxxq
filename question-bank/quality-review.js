/* 题库质量审核中心：不上传题目；所有结论存入原题库 IndexedDB。 */
(function(root){
'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DIMS=[['overview','待办总览'],['image','图片'],['formula','公式与单位'],['answer','答案'],['duplicate','重复题'],['knowledge','知识点'],['type','题型']];
const TYPES=['选择题','填空题','作图题','实验题','计算题','综合题','综合能力题','其他'];
const TASKS=['选项判断','填空','作图/连线','实验探究','计算','数据或图像处理','综合情境'];
const STATUS={pending:'待审核',approved:'已通过',repair:'需修复',discuss:'待讨论',stale:'内容变动待复核'};
let api,dim='overview',scope='risks',search='',selected='',queue=[],dupMap=new Map(),risks=new Map(),note='',saving=false;
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s，。；:：、,.!?？！“”'"()（）【】]/g,'');
const hash=s=>{let h=2166136261;for(const c of String(s||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const src=m=>m?.useRedraw&&m.redrawPng?m.redrawPng:m?.data||m?.src||'';
const imgKey=m=>[m?.contentHash||'',m?.ref||'',m?.data?.length||0,(m?.data||'').slice(0,40),m?.repair?.status||''].join(':');
function signature(q,d){
 const ims=a=>(a||[]).map(imgKey).join(';');
 const map={image:q.stem+ims(q.images)+ims(q.answerImages),formula:q.stem+'|'+q.answer,answer:q.stem+'|'+q.answer+'|'+ims(q.answerImages),
 duplicate:norm(q.stem)+'|'+ims(q.images),knowledge:q.stem+'|'+(q.tags||[]).join(';')+'|'+(q.concept_ids||[]).join(';')+'|'+q.relation,type:q.stem+'|'+q.type};
 return hash(map[d]||'');
}
function audit(q,d){
 const r=q.qualityReviewV1?.[d];
 if(r)return r.status==='approved'&&r.signature!==signature(q,d)?{...r,status:'stale'}:r;
 const older=d==='type'?q.typeAudit20261011?.teacherReview:null;
 if(older?.status==='confirmed'&&older.type===q.type)return {status:'approved',note:older.note||'',legacy:true};
 if(['repair','discuss'].includes(older?.status))return {status:older.status,note:older.note||'',legacy:true};
 return {status:'pending',note:''};
}
function index(){
 dupMap=new Map();risks=new Map();
 const byText=new Map(),qs=api.getQuestions();
 for(const q of qs){const k=norm(q.stem);if(k.length>=20){if(!byText.has(k))byText.set(k,[]);byText.get(k).push(q)}}
 for(const group of byText.values())if(group.length>1)for(const q of group)dupMap.set(q.id,group.filter(t=>t.id!==q.id));
 for(const q of qs){
  const found=[],imgs=[...(q.images||[]),...(q.answerImages||[])];
  if(imgs.some(i=>i.repair?.candidateData&&i.repair?.status!=='approved'&&i.repair?.status!=='rejected'))found.push('有图片修复候选');
  if(/如图|图甲|图乙|下图|图示/.test(q.stem||'')&&!(q.images||[]).length)found.push('疑似缺少题图');
  if(/⟦[^⟧]{0,100}⟧|嵌入对象|公式占位|OLE|\uFFFD|[=＝]\s*(?:[；;。]|$)/im.test((q.stem||'')+'\n'+(q.answer||'')))found.push('疑似公式或符号异常');
  if(!String(q.answer||'').trim()&&!(q.answerImages||[]).length)found.push('答案缺失');
  if(dupMap.has(q.id))found.push('文本相同的重复题候选');
  if(!(q.tags||[]).length)found.push('缺少知识点');
  else if((q.tags||[]).some(t=>!api.catalogByName.has(norm(t))))found.push('知识点未完全映射');
  if(q.typeAudit20261011?.needsManualReview&&!q.typeAudit20261011?.teacherReview?.status)found.push('题型人工复核候选');
  if(Object.keys(q.qualityReviewV1||{}).some(d=>['repair','discuss','stale'].includes(audit(q,d).status)))found.push('人工记录尚待处理');
  risks.set(q.id,found);
 }
}
function hints(q,d){
 const arr=risks.get(q.id)||[];
 const k={image:['图片','题图'],formula:['公式','符号'],answer:['答案'],duplicate:['重复'],knowledge:['知识点'],type:['题型']};
 return d==='overview'?arr:arr.filter(x=>(k[d]||[]).some(t=>x.includes(t)));
}
function applies(q,d){
 if(d==='image')return (q.images||[]).length>0||(q.answerImages||[]).length>0||/如图|下图|图示/.test(q.stem||'');
 if(d==='duplicate')return dupMap.has(q.id)||!!q.qualityReviewV1?.duplicate;
 return true;
}
function match(q){
 if(!applies(q,dim))return false;
 if(search&&!norm([q.id,q.stem,q.source,q.sourceNo,(q.tags||[]).join(';')].join(' ')).includes(norm(search)))return false;
 const statuses=dim==='overview'?DIMS.slice(1).map(([d])=>audit(q,d).status):[audit(q,dim).status];
 if(scope==='all')return true;
 if(scope==='approved')return dim!=='overview'&&statuses.includes('approved');
 if(scope==='repair'||scope==='discuss')return statuses.includes(scope);
 if(scope==='pending')return statuses.some(s=>s==='pending'||s==='stale');
 return statuses.some(s=>s==='repair'||s==='discuss'||s==='stale')||(hints(q,dim).length>0&&dim==='overview'||hints(q,dim).length>0&&!statuses.includes('approved'));
}
function candidates(){
 return api.getQuestions().filter(match).sort((a,b)=>{
  const points=q=>hints(q,dim).length+(q.typeAudit20261011?.needsManualReview&&dim==='type'?2:0);
  return points(b)-points(a)||String(a.source||'').localeCompare(String(b.source||''),'zh-CN')||String(a.sourceNo||'').localeCompare(String(b.sourceNo||''));
 });
}
function tabs(){
 const qs=api.getQuestions();
 $('qrTabs').innerHTML=DIMS.map(([d,title])=>{
  let risksCount=0,passed=0;
  for(const q of qs){if(!applies(q,d))continue;if(hints(q,d).length&&audit(q,d).status!=='approved')risksCount++;if(d!=='overview'&&audit(q,d).status==='approved')passed++}
  return '<button class="qr-tab '+(d===dim?'active':'')+'" data-dim="'+d+'">'+title+'<small>'+(d==='overview'?risksCount+'道风险提示':risksCount+'待关注 · '+passed+'已通过')+'</small></button>';
 }).join('');
 $('qrSummary').textContent='题库 '+qs.length+' 道 · 风险只是检索提示，需教师核对 · 原题图和已有审核记录均保留';
}
function gallery(images,title,repair){
 if(!images?.length)return '';
 const side=title==='题干图'?'images':'answerImages';
 return '<h4>'+esc(title)+' ('+images.length+'幅)</h4><div class="qr-gallery">'+images.map((im,i)=>{
  const rep=im.repair||{},origin=rep.originalData||src(im);
  return '<figure><figcaption>'+esc(title)+' '+(i+1)+(rep.status?' · 修复：'+esc(rep.status):'')+'</figcaption>'+
   '<button type="button" data-zoom><img loading="lazy" src="'+esc(origin)+'" alt="原始图片"></button>'+
   (repair&&rep.candidateData?'<div class="qr-compare"><span>修复候选</span><button type="button" data-zoom><img loading="lazy" src="'+esc(rep.candidateData)+'" alt="修复候选"></button></div>':'')+
   (repair&&rep.alternativeCandidateData?'<div class="qr-compare"><span>高清PNG备选</span><button type="button" data-zoom><img loading="lazy" src="'+esc(rep.alternativeCandidateData)+'" alt="备选图"></button></div>':'')+
   (repair&&rep.candidateData?'<div class="qr-image-tools"><button data-image-action="approve" data-side="'+side+'" data-index="'+i+'">采用候选</button>'+
   (rep.alternativeCandidateData?'<button data-image-action="approveAlternate" data-side="'+side+'" data-index="'+i+'">采用高清PNG</button>':'')+
   (rep.status==='approved'?'<button data-image-action="undo" data-side="'+side+'" data-index="'+i+'">恢复原图</button>':'<button data-image-action="reject" data-side="'+side+'" data-index="'+i+'">保留原图</button>')+'</div>':'')+
   '</figure>';
 }).join('')+'</div>';
}
function special(q){
 if(dim==='overview')return '<section class="qr-card"><h3>逐项审核状态</h3>'+DIMS.slice(1).map(([d,n])=>'<div class="qr-line"><b>'+n+'</b><span>'+esc(STATUS[audit(q,d).status])+'</span><button data-switch="'+d+'">进入审核</button></div>').join('')+'</section>';
 if(dim==='image')return '<section class="qr-card"><h3>图片质量与物理结构</h3><p>核对标注、上下标、刻度、电路、光路及原图忠实度；采用候选图不等于整题验收。</p>'+gallery(q.images,'题干图',true)+gallery(q.answerImages,'答案图',true)+'<button data-image-batch>批量图像对照与完整ZIP导出</button></section>';
 if(dim==='formula')return '<section class="qr-card"><h3>公式与单位</h3><p>检查计算步骤、单位、分式、上下标和符号。仅修正文本不会自动认定答案正确。</p><label>题干<textarea id="qrStem">'+esc(q.stem||'')+'</textarea></label><label>答案和解析<textarea id="qrAnswerEdit">'+esc(q.answer||'')+'</textarea></label><button data-edit="formula">保存公式与文本修订</button></section>';
 if(dim==='answer')return '<section class="qr-card"><h3>答案和解析</h3><p>核对最终答案、单位、实验结论与图片是否一致。</p><label>答案<textarea id="qrAnswerEdit">'+esc(q.answer||'')+'</textarea></label>'+gallery(q.answerImages,'答案图',false)+'<button data-edit="answer">保存答案修订</button></section>';
 if(dim==='knowledge')return '<section class="qr-card"><h3>知识点及关系</h3><p>支持多标签，交叉应用与并列小问应区分。</p><label>知识点（分号隔开）<textarea id="qrTags">'+esc((q.tags||[]).join('；'))+'</textarea></label><label>知识点关系<select id="qrRelation">'+Object.entries({pending:'待审核',single:'单知识点',cross:'真正交叉应用',parallel:'并列小问',options:'选项辨析'}).map(([k,v])=>'<option value="'+k+'"'+(q.relation===k?' selected':'')+'>'+v+'</option>').join('')+'</select></label><button data-edit="knowledge">保存知识点</button></section>';
 if(dim==='type'){
  const t=q.typeAudit20261011||{},old=t.teacherReview||{};
  return '<section class="qr-card"><h3>主类型与次级考法</h3><p>原类型：'+esc(t.oldType||q.type)+' · 建议：'+esc(t.proposedType||'无')+'</p><label>主类型<select id="qrType">'+TYPES.map(s=>'<option'+(s===(old.type||q.type)?' selected':'')+'>'+s+'</option>').join('')+'</select></label><div class="qr-tasks">'+TASKS.map(s=>'<label><input type="checkbox" data-task="'+esc(s)+'"'+((old.tasks||q.qualityReviewV1?.type?.tasks||[]).includes(s)?' checked':'')+'>'+s+'</label>').join('')+'</div><button data-edit="type">保存题型</button></section>';
 }
 if(dim==='duplicate'){
  const peers=dupMap.get(q.id)||[];
  return '<section class="qr-card"><h3>重复题与变式对比</h3><p>仅相同规范化题干初筛，图片不同的题不得直接判定重复；不会自动删除。</p>'+
  (peers.length?peers.map(p=>'<div class="qr-peer"><b>'+esc(p.id)+' · '+esc(p.source||'')+' 第'+esc(p.sourceNo||'?')+'题</b><p>'+esc((p.stem||'').slice(0,170))+'</p><span>配图 '+(p.images||[]).length+' 幅</span><button data-peer="'+esc(p.id)+'">查看该题</button></div>').join(''):'<p>尚未识别到题干完全相同的记录。</p>')+'</section>';
 }
 return '';
}
function detail(){
 const q=api.getQuestions().find(x=>x.id===selected),box=$('qrContent');
 if(!q){box.innerHTML='<p class="qr-empty">此筛选下没有题目。可切换“全部题目”，或导入最新修订题库。</p>';return}
 const a=dim==='overview'?null:audit(q,dim),flag=hints(q,dim);
 box.innerHTML='<div class="qr-meta">'+esc(q.id)+' · '+esc(q.source||'')+' · 第'+esc(q.sourceNo||'?')+'题 · '+esc(q.type)+'</div>'+
  '<div class="qr-flags">'+(flag.length?flag.map(s=>'<span>'+esc(s)+'</span>').join(''):'<span class="neutral">当前分类无自动风险提示，仍可人工抽查</span>')+'</div>'+
  '<h3>原题</h3><div class="qr-stem">'+esc(q.stem||'')+'</div>'+
  (dim==='image'?'':gallery(q.images,'题干图',false))+
  '<details class="qr-answer"><summary>展开答案及答案图</summary><pre>'+esc(q.answer||'未提供文字答案')+'</pre>'+gallery(q.answerImages,'答案图',false)+'</details>'+
  special(q)+
  (dim==='overview'?'':'<section class="qr-card qr-conclusion"><h3>本项审核结论</h3><label>审核备注<textarea id="qrNote" placeholder="记录存在的问题或通过依据">'+esc(a.note||'')+'</textarea></label><p>当前：'+esc(STATUS[a.status]||'待审核')+'</p><div class="qr-actions"><button class="primary" data-accept="approved">确认通过</button><button data-accept="repair">需要修复</button><button data-accept="discuss">待讨论</button><button data-accept="pending">撤销结论</button></div></section>')+
  '<div class="qr-footer-actions"><button data-open-original>打开原题完整编辑器</button><span id="qrMessage">'+esc(note)+'</span></div>';
}
function render(){
 if(!api)return;
 index();tabs();queue=candidates();
 // 修好公式、答案或图片后，风险提示可能消失：保留当前题直到完成确认。
 if(selected&&dim!=='overview'&&scope==='risks'&&!queue.some(q=>q.id===selected)&&api.getQuestions().some(q=>q.id===selected)){
  scope='all';$('qrScope').value='all';queue=candidates();
 }
 if(!queue.some(q=>q.id===selected))selected=queue[0]?.id||'';
 const pos=queue.findIndex(q=>q.id===selected),page=pos<0?0:Math.floor(pos/50),rows=queue.slice(page*50,(page+1)*50);
 $('qrList').innerHTML=rows.length?rows.map((q,j)=>{
  const a=dim==='overview'?null:audit(q,dim);
  return '<button data-id="'+esc(q.id)+'" class="'+(q.id===selected?'active ':'')+(a?.status==='approved'?'passed':'')+'"><b>'+(page*50+j+1)+'. 第'+esc(q.sourceNo||'?')+'题 · '+esc(q.type)+'</b><small>'+esc(q.source||q.id)+'</small><small>'+esc((q.stem||'').slice(0,55))+'</small><span>'+esc(dim==='overview'?hints(q,'overview').length+'项提示':STATUS[a.status])+'</span></button>';
 }).join(''):'<p class="qr-empty">没有符合筛选条件的题目</p>';
 $('qrCount').textContent=(queue.length?page*50+1:0)+'—'+Math.min(queue.length,(page+1)*50)+' / '+queue.length;
 $('qrPrevious').disabled=pos<=0;$('qrFollowing').disabled=pos<0||pos===queue.length-1;
 detail();
}
async function saveQ(q,updates,label,history){
 if(saving)return;saving=true;
 try{
  const before={stem:q.stem,answer:q.answer,type:q.type,tags:[...(q.tags||[])],relation:q.relation};
  Object.assign(q,updates);q.updatedAt=new Date().toISOString();q.revision=Number(q.revision||1)+1;
  if(history)q.qualityEditHistory=(q.qualityEditHistory||[]).concat([{at:q.updatedAt,label,before}]).slice(-15);
  api.updateConcepts?.(q);await api.save(q);api.onChange?.();note='修改已保存。关联审核结果会根据内容变化重新提示核验。';render();
 }catch(e){note='保存失败：'+e.message;detail()}finally{saving=false}
}
async function edit(mode){
 const q=api.getQuestions().find(x=>x.id===selected);if(!q)return;
 if(mode==='formula'){const stem=$('qrStem').value,answer=$('qrAnswerEdit').value;if(!stem.trim())return alert('题干不能为空');if(stem!==q.stem||answer!==q.answer)await saveQ(q,{stem,answer},mode,true)}
 if(mode==='answer'){const answer=$('qrAnswerEdit').value;if(answer!==q.answer)await saveQ(q,{answer},mode,true)}
 if(mode==='knowledge'){
  const tags=Array.from(new Set($('qrTags').value.split(/[;,；，、]/).map(s=>s.trim()).filter(Boolean)));
  await saveQ(q,{tags,relation:$('qrRelation').value},mode,true);
 }
 if(mode==='type'){
  const type=$('qrType').value,tasks=Array.from($('qrContent').querySelectorAll('[data-task]:checked')).map(x=>x.dataset.task);
  const old={...(q.typeAudit20261011||{})};
  old.teacherReview={...(old.teacherReview||{}),status:'confirmed',type,tasks,reviewedAt:new Date().toISOString()};
  await saveQ(q,{type,typeAudit20261011:old},mode,true);
 }
}
async function decide(status){
 if(saving||dim==='overview')return;
 const q=api.getQuestions().find(x=>x.id===selected);if(!q)return;
 if(status==='approved'&&dim==='answer'&&!String(q.answer||'').trim()&&!(q.answerImages||[]).length){note='答案缺失，请补充后再通过。';detail();return}
 if(status==='approved'&&dim==='image'&&/如图|图甲|图乙|下图|图示/.test(q.stem||'')&&!(q.images||[]).length){note='题目引用了图片但无题图，请先补齐。';detail();return}
 const saved=dim,id=q.id,review={...(q.qualityReviewV1||{})};
 review[saved]={...(review[saved]||{}),status,note:$('qrNote').value.trim(),signature:signature(q,saved),reviewedAt:new Date().toISOString()};
 q.qualityReviewV1=review;
 if(saved==='type'){q.typeAudit20261011=q.typeAudit20261011||{};q.typeAudit20261011.teacherReview={...(q.typeAudit20261011.teacherReview||{}),status:status==='approved'?'confirmed':status,type:q.type,note:review[saved].note,reviewedAt:review[saved].reviewedAt}}
 try{await api.save(q);api.onChange?.();note='已保存'+STATUS[status]+'，未改变整题物理正确性的审核状态。';if(status==='approved'&&scope!=='all')selected=queue.find(x=>x.id!==id)?.id||id;render()}catch(e){note='保存失败：'+e.message;detail()}
}
function changeTab(d){dim=d;scope='risks';search='';selected='';note='';$('qrScope').value='risks';$('qrSearch').value='';render()}
function move(step){const pos=queue.findIndex(q=>q.id===selected);if(pos+step<0||pos+step>=queue.length)return;selected=queue[pos+step].id;note='';render();$('qrContent').scrollTop=0}
function focus(id){dim='duplicate';scope='all';search='';selected=id;$('qrScope').value='all';$('qrSearch').value='';render()}
function download(x,name){const blob=new Blob([JSON.stringify(x,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function exportReview(){const decisions=api.getQuestions().filter(q=>q.qualityReviewV1||q.typeAudit20261011?.teacherReview).map(q=>({id:q.id,qualityReviewV1:q.qualityReviewV1||{},typeReview:q.typeAudit20261011?.teacherReview||null}));download({format:'physics-quality-review-v1',exportedAt:new Date().toISOString(),decisions},'物理题库质量审核_'+new Date().toISOString().slice(0,10)+'.json');note='已导出'+decisions.length+'条审核记录；完整题库另用“备份题库与记录”。';detail()}
async function importReview(file){
 if(!file)return;const data=JSON.parse(await file.text());if(data.format!=='physics-quality-review-v1'||!Array.isArray(data.decisions))throw Error('不是此审核中心导出的记录');
 const map=new Map(api.getQuestions().map(q=>[q.id,q]));let done=0,missing=0;
 for(const item of data.decisions){const q=map.get(item.id);if(!q){missing++;continue}
  q.qualityReviewV1={...(item.qualityReviewV1||{}),...(q.qualityReviewV1||{})};
  if(item.typeReview&&!q.typeAudit20261011?.teacherReview){q.typeAudit20261011=q.typeAudit20261011||{};q.typeAudit20261011.teacherReview=item.typeReview}
  await api.save(q);done++;
 }
 note='导入'+done+'条，未匹配'+missing+'条。';render();
}
function init(a){
 api=a;
 $('qualityReviewBtn')?.addEventListener('click',()=>{$('qualityReviewDialog').showModal();changeTab('overview')});
 $('qrClose')?.addEventListener('click',()=>$('qualityReviewDialog').close());
 $('qrTabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-dim]');if(b)changeTab(b.dataset.dim)});
 $('qrScope')?.addEventListener('change',e=>{scope=e.target.value;selected='';render()});
 $('qrSearch')?.addEventListener('input',e=>{search=e.target.value;selected='';render()});
 $('qrList')?.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){selected=b.dataset.id;render();$('qrContent').scrollTop=0}});
 $('qrPrevious')?.addEventListener('click',()=>move(-1));$('qrFollowing')?.addEventListener('click',()=>move(1));
 $('qrContent')?.addEventListener('click',async e=>{
  const z=e.target.closest('[data-zoom]');if(z){z.classList.toggle('expanded');return}
  const t=e.target.closest('[data-switch]');if(t){changeTab(t.dataset.switch);return}
  const peer=e.target.closest('[data-peer]');if(peer){focus(peer.dataset.peer);return}
  const im=e.target.closest('[data-image-action]');if(im){await root.PhysicsImageRepair?.actFor?.(selected,im.dataset.side,Number(im.dataset.index),im.dataset.imageAction);return}
  if(e.target.closest('[data-image-batch]')){$('repairDialog')?.showModal();root.PhysicsImageRepair?.refresh?.();return}
  if(e.target.closest('[data-open-original]')){const id=selected;$('qualityReviewDialog').close();api.openEditor?.(id);return}
  const ed=e.target.closest('[data-edit]');if(ed){await edit(ed.dataset.edit);return}
  const dec=e.target.closest('[data-accept]');if(dec){await decide(dec.dataset.accept);return}
 });
 $('qrExport')?.addEventListener('click',exportReview);
 $('qrImport')?.addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';try{await importReview(file)}catch(err){note='导入失败：'+err.message;detail()}});
}
root.PhysicsQualityReview={init,refresh:render,audit,signature};
})(typeof window!=='undefined'?window:globalThis);