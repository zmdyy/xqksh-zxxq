/* 物理训练题库一期：离线使用，无大模型或付费API，原题不提交公开仓库。 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const DB_NAME='PhysicsTrainingBankV1';
let db;
const state={questions:[],events:[],basket:[],catalog:[],catalogByName:new Map(),catalogById:new Map(),meta:{},current:null,draw:null,preview:null};
const norm=s=>String(s||'').replace(/\s+/g,'').replace(/[，。；:：、,.!?？！]/g,'').toLowerCase();
function hash(str){let h=2166136261;str=String(str||'');for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const now=()=>new Date().toISOString(), today=()=>now().slice(0,10);
function sourceBase(name){return String(name||'').replace(/\.(docx|doc|json)$/i,'').replace(/\(\d+\)$/,'').replace(/\s+/g,'').toLowerCase()}
function tell(msg,error){$('status').textContent=msg;$('status').className=error?'error':''}
function uniqueTags(x){return Array.from(new Set((Array.isArray(x)?x:String(x||'').split(/[;；,，、]/)).map(y=>String(y).trim()).filter(Boolean)))}
function inferType(s){for(const x of ['作图题','选择题','填空题','实验题','计算题','综合题'])if(String(s||'').includes(x.replace('题','')))return x;return '其他'}
function applyConcepts(q){q.concept_ids=Array.from(new Set((q.tags||[]).map(x=>state.catalogByName.get(norm(x))?.concept_id).filter(Boolean)))}
function openDB(){return new Promise((yes,no)=>{let r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{for(const x of ['questions','events','settings'])if(!r.result.objectStoreNames.contains(x))r.result.createObjectStore(x,{keyPath:'id'})};r.onsuccess=()=>yes(r.result);r.onerror=()=>no(r.error)})}
function getAll(table){return new Promise((yes,no)=>{const r=db.transaction(table).objectStore(table).getAll();r.onsuccess=()=>yes(r.result);r.onerror=()=>no(r.error)})}
function getOne(table,id){return new Promise((yes,no)=>{const r=db.transaction(table).objectStore(table).get(id);r.onsuccess=()=>yes(r.result);r.onerror=()=>no(r.error)})}
function put(table,val){return new Promise((yes,no)=>{const tx=db.transaction(table,'readwrite');tx.objectStore(table).put(val);tx.oncomplete=()=>yes();tx.onerror=()=>no(tx.error||Error('本地存储失败，可能空间不足'))})}
function del(table,id){return new Promise((yes,no)=>{const tx=db.transaction(table,'readwrite');tx.objectStore(table).delete(id);tx.oncomplete=()=>yes();tx.onerror=()=>no(tx.error)})}
async function init(){try{db=await openDB();state.questions=await getAll('questions');state.events=await getAll('events');let m=await getOne('settings','meta');state.meta=m?m.value:{};await loadCatalog();bind();window.PhysicsBankInlineDetails?.init?.({getQuestions:()=>state.questions,catalogById:state.catalogById,catalogByName:state.catalogByName,focusConcept,resetDetailFilters});if(window.StudentPracticeExport){await window.StudentPracticeExport.init({getEvents:()=>state.events,onSelectionChange:invalidateWordDownload})}const params=new URLSearchParams(location.search);const cid=params.get('concept_id'),cname=params.get('concept_name');if(cname){focusConcept(cname)}else if(cid){const c=state.catalogById.get(cid);if(c){$('conceptFilter').value=c.name;tell('已从知识星球定位：'+c.name)}}render()}catch(e){console.error(e);tell('题库启动失败：'+e.message,true)}}
async function loadCatalog(){try{let r=await fetch('../data/knowledge/exam-annotation-catalog.json');if(!r.ok)throw Error('HTTP '+r.status);let j=await r.json();state.catalog=j.concepts||[];state.catalog.forEach(c=>{state.catalogByName.set(norm(c.name),c);state.catalogById.set(c.concept_id,c)});for(let id of ['conceptFilter','conceptFilter2'])$(''+id).insertAdjacentHTML('beforeend',state.catalog.map(c=>'<option value="'+esc(c.name)+'">'+esc(c.module+' / '+c.name)+'</option>').join(''));state.questions.forEach(applyConcepts)}catch(e){tell('知识点目录暂不可用，仍可通过题目文字检索。',true)}}
function actualAssignments(id,cls){return state.events.filter(e=>e.status==='assigned'&&(!cls||e.className===cls)&&e.items.some(t=>t.id.split('::')[0]===id))}
function usedRecently(id,cls){return actualAssignments(id,cls).some(e=>new Date(e.date).getTime()>Date.now()-30*86400000)}
function tagMatches(q,label){
const target=norm(label);if(!target)return true;
if((q.tags||[]).some(t=>{const v=norm(t);return v===target||(Math.min(v.length,target.length)>=3&&(v.includes(target)||target.includes(v)))}))return true;
const cid=state.catalogByName.get(target)?.concept_id;return Boolean(cid&&(q.concept_ids||[]).includes(cid))
}
function matches(q){let term=norm($('search').value);if(term&&!norm([q.stem,q.source,q.sourceNo,(q.tags||[]).join(' '),q.type].join(' ')).includes(term))return false;let a=$('conceptFilter').value,b=$('conceptFilter2').value,m=$('relationFilter').value;if(a&&b){if(m==='any'){if(!tagMatches(q,a)&&!tagMatches(q,b))return false}else if(!tagMatches(q,a)||!tagMatches(q,b))return false}else if(a&&!tagMatches(q,a))return false;else if(b&&!tagMatches(q,b))return false;if(m==='cross'&&q.relation!=='cross')return false;if(m==='parallel'&&!['parallel','options'].includes(q.relation))return false;
if($('typeFilter').value&&q.type!==$('typeFilter').value)return false;if($('difficultyFilter').value&&q.difficulty!==$('difficultyFilter').value)return false;if($('reviewFilter').value&&q.review!==$('reviewFilter').value)return false;let status=$('usedFilter').value,cls=$('classFilter').value.trim();if(status==='unused'&&actualAssignments(q.id,'').length)return false;if(status==='used'&&!actualAssignments(q.id,'').length)return false;if(status==='recent'&&usedRecently(q.id,cls))return false;return true}
function mediaSrc(img){return img&&img.useRedraw&&img.redrawPng?img.redrawPng:(img?.data||img?.src||'')}
function findQuestion(id){return state.questions.find(q=>q.id===id.split('::')[0])}
function selectedLabel(id){const q=findQuestion(id);if(!q)return '题目不存在';let pi=id.split('::')[1],p=(q.parts||[]).find(x=>x.id===pi);return(q.sourceNo||'')+(p?p.label:'')+' · '+(p?p.stem:q.stem||'').slice(0,36)}
function addQuestion(id){if(state.basket.includes(id))return tell('这道题已经在试题篮');let parent=id.split('::')[0];if(state.basket.some(x=>x.split('::')[0]===parent&&(x===parent||id===parent)))return tell('不能同时加入整题和该题的某个小问。',true);state.basket.push(id);renderBasket();tell('已加入试题篮：'+selectedLabel(id))}

function focusConcept(label){
 const select=$('conceptFilter');
 if(!Array.from(select.options||[]).some(o=>o.value===label)){
   const option=document.createElement('option');option.value=label;option.textContent=label+'（题库标签）';select.appendChild(option);
 }
 select.value=label;
 for(const id of ['conceptFilter2','typeFilter','difficultyFilter','usedFilter','reviewFilter'])$(id).value='';
 $('relationFilter').value='any';$('search').value='';render();
 tell('已筛选知识点：'+label);
}
function resetDetailFilters(){
 $('detailScope').value='all';
 $('detailMetric').value='type';
 $('detailTop').value='20';
 $('detailSearch').value='';
 window.PhysicsBankInlineDetails?.refreshIfOpen?.();
}
const BANK_FILTER_IDS=['search','conceptFilter','conceptFilter2','relationFilter','typeFilter','difficultyFilter','reviewFilter','usedFilter','classFilter'];
function resetQuestionFilters(){
 for(const id of BANK_FILTER_IDS){
   const field=$(id);
   field.value=id==='relationFilter'?'any':id==='classFilter'?'801':'';
 }
 render();
 tell('筛选条件已重置');
}
function renderActiveFilters(){
 const host=$('activeFilterSummary');
 if(!host)return;
 const names={
   search:'关键词',conceptFilter:'主要知识点',conceptFilter2:'关联知识点',
   relationFilter:'知识点关系',typeFilter:'题型',difficultyFilter:'难度',
   reviewFilter:'审核状态',usedFilter:'布置记录',classFilter:'班级'
 };
 const active=[];
 for(const id of BANK_FILTER_IDS){
   const field=$(id),value=(field?.value||'').trim();
   if(!value||(id==='relationFilter'&&value==='any')||(id==='classFilter'&&(value==='801'||!$('usedFilter').value)))continue;
   const selected=field.tagName==='SELECT'?field.options[field.selectedIndex]?.textContent:value;
   active.push({id,label:names[id]+'：'+(selected||value)});
 }
 host.hidden=!active.length;
 host.innerHTML=active.length?
   '<span>当前筛选</span>'+active.map(x=>
     '<button type="button" class="bank-filter-chip" data-clear-filter="'+x.id+'" aria-label="移除'+esc(x.label)+'">'+esc(x.label)+' ×</button>'
   ).join(''):'';
}

function render(){let qs=state.questions.filter(matches);$('count').textContent=qs.length+' / '+state.questions.length+'条';$('results').innerHTML=qs.length?qs.slice(0,60).map(q=>{let name=({'cross':'真实交叉','single':'单知识点','parallel':'并列小问','options':'选项辨析','pending':'关系待审'})[q.relation||'pending'];let quality=q.hasMath?' ⚠ Word公式需逐题核对':'';let pics=(q.images||[]).slice(0,3).map(x=>'<img src="'+esc(mediaSrc(x))+'" alt="原题图" loading="lazy">').join('');let parts=(q.parts||[]).map(p=>'<div class="basket-item"><span class="title">'+esc(p.label+' '+p.stem.slice(0,40))+'</span><button class="small" data-add="'+esc(q.id+'::'+p.id)+'">＋此小问</button></div>').join('');
return '<article class="qcard"><div class="qtop"><strong>'+esc(q.type+' · 第'+(q.sourceNo||'?')+'题')+'</strong><div class="right"><span class="tag">'+esc(q.difficulty||'难度待审')+'</span><span class="tag '+(q.review==='approved'?'approved':'')+'">'+(q.review==='approved'?'已审核':'待审核')+'</span></div></div><div class="qsource">'+esc(q.source)+' · '+esc(name)+' · '+esc(quality)+' · 已布置 '+actualAssignments(q.id,'').length+' 次</div><div class="qstem">'+esc((q.stem||'').slice(0,260))+'</div><div class="qimage">'+pics+'</div><div class="qfooter"><div class="qfootleft">'+(q.tags||[]).slice(0,8).map(x=>'<span class="tag">'+esc(x)+'</span>').join('')+'</div><div class="qfootright"><button class="small" data-edit="'+esc(q.id)+'">审核 / 拆题</button><button class="small primary" data-add="'+esc(q.id)+'">＋整题</button></div></div>'+(parts?'<details><summary>独立子题 ('+q.parts.length+')</summary>'+parts+'</details>':'')+'</article>'}).join('')+(qs.length>60?'<p class="hint">仅显示前60条，请进一步筛选。</p>':''):'<p class="empty">未找到题目。可以导入原始 Word，或调整筛选条件。</p>';renderBasket();renderUsage();renderActiveFilters();window.StudentPracticeExport?.renderHistory?.();window.PhysicsBankInlineDetails?.refreshIfOpen?.()}
function renderBasket(){$('basketCount').textContent=state.basket.length+'道';$('basket').innerHTML=state.basket.length?state.basket.map((id,i)=>'<div class="basket-item"><span class="title">'+esc((i+1)+'. '+selectedLabel(id))+'</span><button data-up="'+i+'" '+(!i?'disabled':'')+'>↑</button><button data-down="'+i+'" '+(i===state.basket.length-1?'disabled':'')+'>↓</button><button data-remove="'+i+'">×</button></div>').join(''):'<p class="hint">尚未选题；可选整题或经审核的独立小问。</p>'}
function renderUsage(){let cls=$('classFilter').value.trim();let list=state.events.filter(e=>e.status==='assigned'&&(!cls||e.className===cls)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);$('usageSummary').innerHTML=list.length?list.map(e=>'<div class="event"><b>'+esc(e.className)+'</b> · '+esc(e.date.slice(0,10))+' · '+e.items.length+'题<br>'+esc(e.title||'精准练习')+'<br><button class="small" data-feedback-event="'+esc(e.id)+'">录入反馈</button> <button class="small" data-cancel-event="'+esc(e.id)+'">撤回布置</button>'+(e.feedback?'<br>'+esc(e.feedback.note||'已反馈'):'')+'</div>').join(''):'<p class="hint">本班尚无已确认的使用记录。</p>'}
function applyIndex(q){for(let r of q.sourceRefs||[{file:q.source,no:q.sourceNo}]){let d=state.meta[sourceBase(r.file)]?.[r.no];if(!d)continue;q.difficulty=q.difficulty||d.difficulty;q.type=q.type==='其他'?d.type:q.type;q.tags=q.tags?.length?q.tags:d.tags;applyConcepts(q);return true}return false}
async function parseDocIndex(file){let buf=await file.arrayBuffer(),txt=new TextDecoder('utf-8').decode(buf);if((txt.match(/�/g)||[]).length>15)txt=new TextDecoder('gb18030').decode(buf);if(!/<table/i.test(txt))throw Error('旧版二进制 DOC 无法直接解析，请另存为 DOCX。配套 HTML 格式的 .doc 目录可以直接导入。');let doc=new DOMParser().parseFromString(txt,'text/html'),sec='',base=sourceBase(file.name),count=0,updated=0;state.meta[base]=state.meta[base]||{};for(let tr of doc.querySelectorAll('tr')){let tds=tr.querySelectorAll('td');if(tds.length===1){sec=tds[0].textContent;continue}if(tds.length<3)continue;let n=tds[0].textContent.trim();if(!/^\d+$/.test(n))continue;state.meta[base][n]={difficulty:tds[1].textContent.trim(),tags:uniqueTags(tds[2].textContent),type:inferType(sec)};count++}for(let q of state.questions)if(applyIndex(q)){await put('questions',q);updated++}await put('settings',{id:'meta',value:state.meta});tell('目录导入：识别 '+count+' 条；更新现有原题 '+updated+' 条。') }
function sameMedia(a,b){return a.length===b.length&&a.every((m,i)=>hash(m.data||'')===hash(b[i]?.data||''))}
async function parseDocx(file){if(!window.JSZip)throw Error('缺少 JSZip');let zip=await JSZip.loadAsync(await file.arrayBuffer()),f=zip.file('word/document.xml');if(!f)throw Error('不是有效的 DOCX 文件');let doc=new DOMParser().parseFromString(await f.async('text'),'application/xml'),body=Array.from(doc.getElementsByTagName('*')).find(x=>x.localName==='body');if(!body)throw Error('缺少 Word 正文');
let rels={},rel=zip.file('word/_rels/document.xml.rels');if(rel){let rd=new DOMParser().parseFromString(await rel.async('text'),'application/xml');Array.from(rd.getElementsByTagName('*')).filter(x=>x.localName==='Relationship').forEach(x=>{let path=x.getAttribute('Target')||'';if(/image/i.test(x.getAttribute('Type')||'')&&!/^https?:/.test(path))rels[x.getAttribute('Id')]=path.startsWith('/')?path.slice(1):'word/'+path.replace(/^\.\//,'')})}
let questions=[],answers=new Map(),curr=null,phase='question',type='其他',cache={};
async function imagesFrom(p){let out=[];for(let n of Array.from(p.getElementsByTagName('*')).filter(x=>x.localName==='blip')){let rid=n.getAttribute('r:embed')||n.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed'),path=rels[rid];if(!path)continue;path=path.replace(/word\/\.\.\//g,'');if(!cache[path]){let z=zip.file(path);if(!z)continue;let ext=path.split('.').pop().toLowerCase();cache[path]={data:'data:'+(ext==='jpg'||ext==='jpeg'?'image/jpeg':ext==='gif'?'image/gif':ext==='svg'?'image/svg+xml':'image/png')+';base64,'+await z.async('base64'),sourcePath:path}}out.push({...cache[path]})}return out}
for(let child of Array.from(body.children)){let paras=child.localName==='p'?[child]:child.localName==='tbl'?Array.from(child.getElementsByTagName('*')).filter(x=>x.localName==='p'):[];for(let p of paras){let txt=Array.from(p.getElementsByTagName('*')).filter(x=>['t','tab','br'].includes(x.localName)).map(x=>x.localName==='t'?x.textContent:x.localName==='tab'?' ':'\n').join('').trim();if(txt.includes('答案解析部分')){phase='answer';curr=null;continue}let m=txt.match(/^\s*(\d{1,3})[．.、]\s*(.*)$/),a=txt.match(/^\s*(\d{1,3})[．.、]\s*【答案】(.*)$/);if(phase==='question'&&/^[一二三四五六七八九十]+[、．.]\s*(选择|填空|作图|计算|实验|综合)/.test(txt)){type=inferType(txt);continue}
if(phase==='answer'&&a){curr={n:a[1],text:a[2],images:[]};answers.set(curr.n,curr)}
else if(phase==='question'&&m){curr={n:m[1],text:m[2],images:[],type};questions.push(curr)}
else if(curr&&txt)curr.text+=(curr.text?'\n':'')+txt;
if(curr)curr.images.push(...await imagesFrom(p))}}
if(!questions.length)throw Error('没有识别到编号题（格式应类似 1．题干）');
const batch=[];
for(const item of questions){
 let ans=answers.get(item.n);
 const id='q'+hash(norm(item.text)+'|'+item.images.map(x=>hash(x.data||'')).join('|'));
 const q={id,source:file.name,sourceNo:item.n,type:item.type,
   stem:item.text,answer:ans?.text||'',images:item.images,answerImages:ans?.images||[],
   difficulty:'',tags:[],concept_ids:[],relation:'pending',review:'pending',revision:1,
   parts:[],sourceRefs:[{file:file.name,no:item.n}],createdAt:now(),updatedAt:now()};
 applyIndex(q);batch.push(q);
}
const result=await window.QuestionBankMerge.mergeQuestions(batch,{
 questions:state.questions,save:q=>put('questions',q),updateConcepts:applyConcepts,now,hash
});

tell(file.name+'：新增 '+result.added+' 道，自动合并重复 '+result.merged+' 道，疑似变式保留 '+result.suspected+' 道。请核对答案、公式和图片。');
}

async function importPrivateZip(file){
 if(!window.JSZip||!window.QuestionBankMerge)throw Error('缺少ZIP解析器或去重模块，请刷新页面');
 const zip=await JSZip.loadAsync(await file.arrayBuffer());
 const fileEntry=zip.file('bank.json');if(!fileEntry)throw Error('ZIP中没有bank.json');
 const j=JSON.parse(await fileEntry.async('text'));
 if(j.format!=='physics-training-bank-v1'||!Array.isArray(j.questions))throw Error('不是标准 physics-training-bank-v1 题库');
 if(!confirm('检测到 '+j.questions.length+' 道候选题。将与本地题库逐题比对，确认完全重复的题合并来源，数值或配图不同的变式题保留。\n全部仅保存到当前浏览器。是否导入？'))return;
 const cache={};
 for(const q of j.questions){
   for(const arr of [q.images||[],q.answerImages||[]]){
     for(const im of arr){
       if(!im.ref||im.data)continue;
       const ref=im.ref,blob=zip.file(ref);if(!blob)throw Error('题图缺失：'+ref);
       if(!cache[ref]){
         const ext=ref.split('.').pop().toLowerCase();
         const mime=ext==='jpg'||ext==='jpeg'?'image/jpeg':ext==='gif'?'image/gif':ext==='svg'?'image/svg+xml':ext==='emf'?'application/x-emf':ext==='wmf'?'application/x-wmf':'image/png';
         cache[ref]='data:'+mime+';base64,'+await blob.async('base64');
       }
       im.data=cache[ref];delete im.ref;
     }
   }
 }
 const out=await window.QuestionBankMerge.mergeQuestions(j.questions,{
   questions:state.questions,
   save:q=>put('questions',q),
   updateConcepts:applyConcepts,
   now,hash,
   provenanceUpdates:j.provenanceUpdates||[]
 });
 
 tell('增量导入完成：新增 '+out.added+' 道、合并确认重复 '+out.merged+' 道、疑似变式保留 '+out.suspected+' 道。已记录全部可确认的题目来源。');
}

async function importJson(file){let j=JSON.parse(await file.text());if(j.format==='physics-training-bank-v1'){if(confirm('将JSON题目去重后合并到当前题库？如需恢复使用历史，请使用页面顶部的“恢复备份”。')){const out=await window.QuestionBankMerge.mergeQuestions(j.questions,{questions:state.questions,save:q=>put('questions',q),updateConcepts:applyConcepts,now,hash});tell('JSON新增 '+out.added+' 道，自动合并重复 '+out.merged+' 道。')}return}let arr=Array.isArray(j)?j:(j.questions||j.items);if(!Array.isArray(arr))throw Error('JSON不是题目数组或题库备份');let n=0;for(let x of arr){if(!x.stem&&!x.text)continue;let q={id:x.id||'q'+hash(norm(x.stem||x.text)),source:x.source||file.name,sourceNo:x.sourceNo||x.question_no||'',type:x.type||'其他',stem:x.stem||x.text,answer:x.answer||'',images:x.images||[],answerImages:x.answerImages||[],tags:uniqueTags(x.tags||x.knowledge_points),difficulty:x.difficulty||'',concept_ids:[],relation:x.relation||'pending',review:'pending',revision:1,parts:x.parts||[],sourceRefs:x.sourceRefs||[],createdAt:now(),updatedAt:now()};if(state.questions.some(y=>y.id===q.id))continue;applyConcepts(q);state.questions.push(q);await put('questions',q);n++}tell('新导入 '+n+' 条 JSON 记录。没有完整图文的记录不能直接打印。')}

function bind(){
$('resetFiltersBtn').addEventListener('click',resetQuestionFilters);
$('activeFilterSummary').addEventListener('click',e=>{
 const chip=e.target.closest('[data-clear-filter]');if(!chip)return;
 const id=chip.dataset.clearFilter;
 if(!BANK_FILTER_IDS.includes(id))return;
 $(id).value=id==='relationFilter'?'any':id==='classFilter'?'801':'';
 render();
});
for(let id of ['search','classFilter'])$(id).addEventListener('input',render);
for(let id of ['conceptFilter','conceptFilter2','typeFilter','difficultyFilter','usedFilter','relationFilter','reviewFilter'])$(id).addEventListener('change',render);
$('fileInput').addEventListener('change',async e=>{let files=Array.from(e.target.files||[]);e.target.value='';for(let file of files){try{tell('正在本地处理 '+file.name);if(/\.docx$/i.test(file.name))await parseDocx(file);else if(/\.doc$/i.test(file.name))await parseDocIndex(file);else if(/\.json$/i.test(file.name))await importJson(file);else if(/\.zip$/i.test(file.name))await importPrivateZip(file);else throw Error('文件格式不支持')}catch(ex){tell(file.name+'：'+ex.message,true);console.error(ex)}}render()});
$('results').addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.add)addQuestion(b.dataset.add);if(b.dataset.edit)openEditor(b.dataset.edit)});
$('basket').addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;let val=b.dataset.remove??b.dataset.up??b.dataset.down;if(val==null)return;let n=Number(val);if(b.dataset.remove!=null)state.basket.splice(n,1);else if(b.dataset.up!=null&&n>0)[state.basket[n-1],state.basket[n]]=[state.basket[n],state.basket[n-1]];else if(b.dataset.down!=null&&n<state.basket.length-1)[state.basket[n+1],state.basket[n]]=[state.basket[n],state.basket[n+1]];renderBasket()});
$('clearBasketBtn').onclick=()=>{state.basket=[];renderBasket()};
$('previewBtn').onclick=showPreview;$('wordBtn').onclick=exportWord;$('previewExportBtn').onclick=exportWord;$('previewCloseBtn').onclick=()=>$('previewDialog').close();$('assignBtn').onclick=assignBasket;
$('usageSummary').addEventListener('click',async e=>{let b=e.target.closest('button');if(!b)return;let id=b.dataset.feedbackEvent||b.dataset.cancelEvent,ev=state.events.find(x=>x.id===id);if(!ev)return;if(b.dataset.cancelEvent){if(!confirm('撤回这次布置？事件仍保留，不再计入次数。'))return;ev.status='cancelled'}else{let note=prompt('教师汇总：学生数量、卡点、针对性评价、是否需要继续训练（不写学生隐私）',ev.feedback?.note||'');if(note===null)return;ev.feedback={note,updatedAt:now()}}await put('events',ev);render()});
$('backupBtn').onclick=()=>backup(false);$('backupHistoryBtn').onclick=()=>backup(true);$('restoreInput').onchange=async e=>{let f=e.target.files[0];e.target.value='';if(f)try{await restore(f)}catch(ex){tell(ex.message,true)}};
}
function field(name,id,value,textarea){return '<label class="wide">'+esc(name)+(textarea?'<textarea id="'+id+'">'+esc(value)+'</textarea>':'<input id="'+id+'" value="'+esc(value)+'">')+'</label>'}
function splitParts(stem){let s=String(stem||''),re=/[（(]\s*(\d{1,2})\s*[）)]/g,m,marks=[];while((m=re.exec(s)))marks.push({index:m.index,end:re.lastIndex,id:m[1],label:'('+m[1]+')'});if(marks.length<2||marks[0].id!=='1'||marks[1].id!=='2')return [];return marks.map((p,i)=>({id:String(i+1),label:p.label,sharedContext:s.slice(0,marks[0].index).trim(),stem:s.slice(p.end,marks[i+1]?.index??s.length).trim()}))}
function partsEditor(q){
const rows=(q.parts||[]).map((p,i)=>{
const thumbs=(q.images||[]).map((m,j)=>'<label class="part-image"><input type="checkbox" data-part-image="'+i+':'+j+'" '+((p.imageIndexes||[]).includes(j)?'checked':'')+'><img alt="题目原图" src="'+esc(mediaSrc(m))+'">原图'+(j+1)+'</label>').join('');
const answers=(q.answerImages||[]).map((m,j)=>'<label class="part-image"><input type="checkbox" data-part-answer-image="'+i+':'+j+'" '+((p.answerImageIndexes||[]).includes(j)?'checked':'')+'><img alt="答案图" src="'+esc(mediaSrc(m))+'">答案图'+(j+1)+'</label>').join('');
return '<div class="part-review"><strong>'+esc(p.label)+'</strong><label>子题题干（自动继承公共情境）<textarea id="part_'+i+'">'+esc(p.stem)+'</textarea></label><label>此小问的答案与简短解析<textarea id="partAnswer_'+i+'">'+esc(p.answer||'')+'</textarea></label><div class="part-image-picker"><b>本小问需要的原图（逐张勾选，勿带入其他小问图片）</b>'+thumbs+'</div><div class="part-image-picker"><b>此小问对应的答案图</b>'+answers+'</div></div>'
}).join('');
$('partsEditor').innerHTML=(q.parts||[]).length?'<h3>独立小问 · 图与答案须教师逐项核对</h3>'+rows:'<p class="hint">默认保持整题；只有子题能独立完成才拆分。</p>'
}
function openEditor(id){let q=state.questions.find(x=>x.id===id);if(!q)return;state.current=id;$('editorTitle').textContent='审核题目 · '+q.source+' · 第'+q.sourceNo+'题';
$('editorBody').innerHTML='<div class="editor-fields">'+field('题干（包含公共情境）','editStem',q.stem,true)+field('答案与简短解析','editAnswer',q.answer,true)+field('知识点（用分号分隔）','editTags',(q.tags||[]).join('；'))+
'<label>题型<select id="editType">'+['作图题','选择题','填空题','实验题','计算题','综合题','其他'].map(x=>'<option '+(q.type===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
'<label>难度<select id="editDifficulty">'+['','容易','普通','困难'].map(x=>'<option value="'+x+'" '+(q.difficulty===x?'selected':'')+'>'+(x||'待审')+'</option>').join('')+'</select></label>'+
'<label>知识点关系<select id="editRelation">'+Object.entries({pending:'尚未审核',single:'单知识点',cross:'真正交叉应用（联合解题）',parallel:'并列小问',options:'选项间独立辨析'}).map(([v,t])=>'<option value="'+v+'" '+(q.relation===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
'<label>审核状态<select id="editReview"><option value="pending">待审核</option><option value="approved" '+(q.review==='approved'?'selected':'')+'>教师已审核</option></select></label></div>'+
'<div class="hint" style="color:#a54832;font-weight:700">'+esc((q.warnings||[]).join('；'))+'</div><h3>题图 · 点击才启动重绘，原图永不覆盖</h3><div class="editor-images">'+(q.images||[]).map((img,i)=>'<div class="image-wrap"><img alt="原题图" src="'+esc(mediaSrc(img))+'"><button class="small" data-redraw="'+i+'">SVG手工重绘</button> '+(img.redrawPng?'<button class="small" data-toggle="'+i+'">'+(img.useRedraw?'使用原图':'采用重绘')+'</button>':'')+'</div>').join('')+'</div>'+
'<div class="buttons"><button id="autoSplit">识别独立小问</button><button id="clearParts" class="muted">取消拆题</button></div><div id="partsEditor"></div>'+
'<div class="buttons"><button id="saveEditor" class="primary">保存并更新题库</button><button id="removeEditor" class="muted">删除本地题目</button></div><p class="hint">拆分后每小题保留来源和稳定ID，且不会自动判定多知识点之间存在交叉应用。共用图片先由所有子题继承，打印前必须检查归属。</p>';
partsEditor(q);
$('autoSplit').onclick=()=>{q.parts=splitParts(q.stem);partsEditor(q);if(!q.parts.length)alert('没有检测到明确的（1）（2）连续小问，保留整题。')};
$('clearParts').onclick=()=>{q.parts=[];partsEditor(q)};
$('editorBody').onclick=async e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.redraw!=null)openDraw(q,Number(b.dataset.redraw));if(b.dataset.toggle!=null){let m=q.images[Number(b.dataset.toggle)];m.useRedraw=!m.useRedraw;await put('questions',q);openEditor(q.id)}};
$('saveEditor').onclick=async()=>{q.stem=$('editStem').value.trim();q.answer=$('editAnswer').value.trim();q.tags=uniqueTags($('editTags').value);q.type=$('editType').value;q.difficulty=$('editDifficulty').value;q.relation=$('editRelation').value;q.review=$('editReview').value;q.parts=(q.parts||[]).map((p,i)=>{
const checked=kind=>Array.from($('partsEditor').querySelectorAll('input[data-part-'+kind+']')).filter(el=>el.checked&&el.dataset['part'+kind.split('-').map(v=>v[0].toUpperCase()+v.slice(1)).join('')].startsWith(i+':')).map(el=>Number(el.value));
const imgSel=Array.from($('partsEditor').querySelectorAll('[data-part-image]')).filter(el=>el.checked&&el.dataset.partImage.startsWith(i+':')).map(el=>Number(el.dataset.partImage.split(':')[1]));
const ansSel=Array.from($('partsEditor').querySelectorAll('[data-part-answer-image]')).filter(el=>el.checked&&el.dataset.partAnswerImage.startsWith(i+':')).map(el=>Number(el.dataset.partAnswerImage.split(':')[1]));
return {...p,stem:($('part_'+i)?.value||p.stem).trim(),answer:($('partAnswer_'+i)?.value||'').trim(),imageIndexes:imgSel,answerImageIndexes:ansSel,verifiedImages:true}
});q.revision++;q.updatedAt=now();applyConcepts(q);try{await put('questions',q);$('editorDialog').close();render();tell('已保存题目，历史使用事件继续保留原版本信息。')}catch(e){tell(e.message,true)}};
$('removeEditor').onclick=async()=>{if(!confirm('从当前浏览器本地题库删除？原始文件不会被删除，历史事件保留。'))return;await del('questions',id);state.questions=state.questions.filter(x=>x.id!==id);state.basket=state.basket.filter(x=>x.split('::')[0]!==id);$('editorDialog').close();render()};
$('editorDialog').showModal()}
function download(blob,name){let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)}
async function backup(onlyHistory){let j={format:'physics-training-bank-v1',exportedAt:now(),questions:onlyHistory?[]:state.questions,events:state.events,meta:onlyHistory?{}:state.meta};download(new Blob([JSON.stringify(j)],{type:'application/json'}),(onlyHistory?'题目使用历史_':'私人题库完整备份_')+today()+'.json');tell('本地备份已导出，请避免公开传播第三方题目。')}
async function restore(file){let j=JSON.parse(await file.text());if(j.format!=='physics-training-bank-v1')throw Error('这不是可识别的题库备份');if(!confirm('确定导入备份？同ID记录会更新，其他记录保留。'))return;await restoreObject(j);render();tell('已恢复题库与使用记录')}
async function restoreObject(j){for(let q of j.questions||[]){let i=state.questions.findIndex(x=>x.id===q.id);if(i>=0)state.questions[i]=q;else state.questions.push(q);applyConcepts(q);await put('questions',q)}for(let e of j.events||[]){let i=state.events.findIndex(x=>x.id===e.id);if(i>=0)state.events[i]=e;else state.events.push(e);await put('events',e)}state.meta={...state.meta,...(j.meta||{})};await put('settings',{id:'meta',value:state.meta});window.StudentPracticeExport?.renderHistory?.()}
async function assignBasket(){if(!state.basket.length)return tell('试题篮为空',true);let cl=prompt('实际布置给哪个班级？',$('classFilter').value||'801');if(!cl||!cl.trim())return;let day=prompt('实际布置日期（YYYY-MM-DD）',today());if(!day)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return tell('日期格式错误',true);let title=prompt('练习名称','物理精准练习')||'物理精准练习';let items=state.basket.map(id=>({id,revision:findQuestion(id)?.revision||1})),fingerprint=hash(cl.trim()+'|'+day+'|'+items.map(x=>x.id).sort().join('|'));if(state.events.some(e=>e.status==='assigned'&&e.fingerprint===fingerprint))return tell('同班同日同一套题已记录，避免重复计次。',true);if(!confirm('已经实际布置或印发给学生？只有确认后才计入使用次数。'))return;let ev={id:uid(),fingerprint,className:cl.trim(),date:day+'T12:00:00',title,items,status:'assigned',createdAt:now()};state.events.push(ev);await put('events',ev);$('classFilter').value=cl.trim();render();tell('已记录 '+cl+' 班实际布置 '+items.length+'题。')}

function printable(id){
const q=findQuestion(id);if(!q)return null;
const pid=id.split('::')[1],p=(q.parts||[]).find(x=>x.id===pid);
if(pid&&!p)throw Error('子题不存在：'+id);
if(p&&q.images?.length&&!p.verifiedImages)throw Error('第'+q.sourceNo+p.label+'题的配图尚未确认，请在“审核 / 拆题”中勾选属于此小问的原图。');
const subset=(arr,indexes)=>p&&Array.isArray(indexes)?indexes.map(i=>arr[i]).filter(Boolean):arr;
return {id,q,
stem:p?[p.sharedContext,p.label+' '+p.stem].filter(Boolean).join('\n'):q.stem,
answer:p?(p.answer||'该小问答案尚未单独审核'):q.answer||'答案暂缺，请教师审核后使用',
images:subset(q.images||[],p?.imageIndexes).map(mediaSrc).filter(Boolean),
answerImages:subset(q.answerImages||[],p?.answerImageIndexes).map(mediaSrc).filter(Boolean)}
}
function autoLayout(arr){let mode=$('layout').value;if(mode!=='auto')return mode;return arr.every(x=>x.stem.length<145&&x.images.length<=1&&x.q.type!=='实验题')?'double':'single'}
function feedbackHtml(){return $('feedback').checked?'<table class="feedback"><tr><th colspan="2">完成后勾选（不影响评分）</th></tr><tr><td>完成：□ 独立　□ 某一步卡住　□ 需要提示</td><td>针对性：□ 正好　□ 部分相关　□ 不适合</td></tr><tr><td colspan="2">困难：□ 题图理解　□ 规律记忆　□ 步骤衔接　□ 作图表达　□ 其他：________</td></tr></table>':''}
function paperImages(imgs){return imgs.length?'<div class="images">'+imgs.map(s=>'<img alt="题目插图" src="'+esc(s)+'">').join('')+'</div>':''}
const PAPER_STYLE='@page{size:A4;margin:14mm 15mm}*{box-sizing:border-box}body{margin:0;background:white;color:#111;font:11pt "Microsoft YaHei",SimSun,sans-serif}.sheet{height:269mm;overflow:hidden;position:relative;page-break-after:always}.sheet:last-child{page-break-after:auto}.sheet h2{text-align:center;font-size:17pt;margin:0 0 5mm}.sheet .meta{text-align:center;font-size:10pt;border-bottom:1px solid #888;padding-bottom:4mm;margin-bottom:5mm}.sheet .questions.double{columns:2;column-gap:9mm;column-rule:1px solid #eee}.sheet .question,.sheet .answer{break-inside:avoid;page-break-inside:avoid;margin-bottom:5mm}.sheet .stem{white-space:pre-wrap;line-height:1.58;margin-bottom:3mm}.sheet .images{display:flex;flex-wrap:wrap;gap:3mm}.sheet .images img{max-width:100%;max-height:83mm;width:auto;height:auto;object-fit:contain}.sheet .double .images img{max-height:58mm}.sheet .answer .images img{max-height:77mm}.sheet .answer p{white-space:pre-wrap;line-height:1.6;margin:2mm 0}.sheet .feedback{width:100%;border-collapse:collapse;font-size:9pt;margin-top:4mm}.sheet .feedback td,.sheet .feedback th{border:1px solid #aaa;padding:2mm;text-align:left}.sheet .foot{position:absolute;bottom:0;width:100%;display:flex;justify-content:space-between;color:#777;font-size:9pt}';
function buildPages(){
let items=state.basket.map(printable).filter(Boolean);if(!items.length)throw Error('请先添加题目到试题篮');
if(items.some(x=>!x.q.stem.trim()))throw Error('有题目正文为空，请先审核');
let layout=autoLayout(items),title='物理精准练习 · '+today();
let front='<div class="sheet" id="frontSheet"><h2>'+title+'</h2><div class="meta">'+(window.StudentPracticeExport?.getSelection?.()?'班级：'+esc(window.StudentPracticeExport.getSelection().className||'未设置')+'　姓名：'+esc(window.StudentPracticeExport.getSelection().name):'班级：________　姓名：________')+'　日期：________　　少量多次 · 独立完成</div><div class="questions '+(layout==='double'?'double':'')+'">'+items.map((x,i)=>'<div class="question"><div class="stem"><b>'+(i+1)+'.</b> '+esc(x.stem)+'</div>'+paperImages(x.images)+'</div>').join('')+'</div>'+feedbackHtml()+'<div class="foot"><span>请在独立完成后核对背面答案</span><span>1 / 2</span></div></div>';
let back='<div class="sheet" id="backSheet"><h2>参考答案 · 自我核对</h2><div class="meta">与正面题号对应'+($('answerMode').value==='separate'?' · 此页可单独打印':' · 默认双面打印')+'</div><div class="questions '+(layout==='double'?'double':'')+'">'+items.map((x,i)=>'<div class="answer"><b>'+(i+1)+'.</b>'+paperImages(x.answerImages)+'<p>'+esc(x.answer)+'</p></div>').join('')+'</div><table class="feedback"><tr><td>核对后：□ 能独立重做　□ 看懂但仍有困难　□ 还需要教师讲解</td></tr></table><div class="foot"><span>建议用新情境的题目验证是否真正掌握</span><span>2 / 2</span></div></div>';
return {front,back,layout,items};
}
function printDocHtml(p){return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>'+PAPER_STYLE+'</style></head><body>'+p.front+p.back+'</body></html>'}
async function showPreview(){
try{let p=buildPages();state.preview=p;const convert=x=>x.replace('class="sheet"','class="paper sheet"');$('printPreview').innerHTML='<style>'+PAPER_STYLE+'</style>'+convert(p.front).replace('id="frontSheet"','id="previewFront"')+convert(p.back).replace('id="backSheet"','id="previewBack"');$('previewStatus').textContent='正在检查页面...';$('previewStatus').dataset.overflow='yes';$('previewDialog').showModal();await Promise.allSettled(Array.from($('printPreview').querySelectorAll('img')).map(img=>img.decode()));checkPageOverflow()}catch(e){tell('预览失败：'+e.message,true)}}
function checkPageOverflow(){let bad=[];for(let [i,id] of ['previewFront','previewBack'].entries()){const root=$(id);if(!root)continue;let foot=root.querySelector('.foot'),last=root.querySelector('.feedback')||root.querySelector('.questions'),pageRect=root.getBoundingClientRect();if(last&&foot&&(last.getBoundingClientRect().bottom>foot.getBoundingClientRect().top-5||last.getBoundingClientRect().bottom>pageRect.bottom-22))bad.push(i===0?'正面':'背面')}
let lows=Array.from($('printPreview').querySelectorAll('img')).filter(im=>im.naturalWidth&&im.naturalWidth<300).length;
$('previewStatus').textContent=(bad.length?bad.join('、')+'内容溢出：请删题或调整栏数。':'A4 正反面符合当前浏览器预览尺寸。')+(lows?' '+lows+'幅图像像素偏低，请试印核查。':'');
$('previewStatus').dataset.overflow=bad.length?'yes':'no'}
let wordDownloadUrl=null;
let exportingWord=false;
function invalidateWordDownload(){
  if(wordDownloadUrl){URL.revokeObjectURL(wordDownloadUrl);wordDownloadUrl=null}
  for(const id of ['wordDownloadLink','previewDownloadLink']){
    const link=$(id);if(link){link.removeAttribute('href');link.style.display='none'}
  }
  state.preview=null;
}
function safeFilePart(value){
  return String(value||'').trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/\s+/g,'').replace(/[. ]+$/g,'').slice(0,50)||'unnamed';
}
function exportedItemsSnapshot(items){
  return items.map(item=>{
    const id=item.id,sep=id.indexOf('::'),parent=item.q,partId=sep>=0?id.slice(sep+2):'';
    const part=partId?(parent.parts||[]).find(x=>String(x.id)===partId):null;
    return {id,revision:parent.revision||1,source:parent.source||'',sourceNo:String(parent.sourceNo||''),partLabel:part?.label||'',stemPreview:String(item.stem||'').slice(0,90)};
  });
}
async function exportWord(){
 const notice=$('previewStatus');
 const noticeError=message=>{
   tell('导出 Word：'+message,true);
   notice.textContent='导出 Word：'+message;
   notice.style.color='#a12729';
 };
 if(exportingWord)return;
 exportingWord=true;
 for(const id of ['wordBtn','previewExportBtn'])$(id).disabled=true;
 try{
   // 导出时直接弹窗选人，不再要求在侧栏提前输入姓名。
   const response=window.StudentPracticeExport?.promptForExport
     ?await window.StudentPracticeExport.promptForExport()
     :{mode:window.StudentPracticeExport?.isStudentMode?.()?'student':'generic',student:window.StudentPracticeExport?.getSelection?.()||null};
   if(!response)return; // 主动取消导出，不显示错误或改动历史
   const studentMode=response.mode==='student';
   const student=response.student||null;
   if(studentMode&&!student)throw Error('请选择一个有效的学生姓名');
   let p=buildPages();
   const outdated=!state.preview||state.preview.front!==p.front||state.preview.back!==p.back||state.preview.layout!==p.layout;
   if(outdated){
     await showPreview();
     p=buildPages();
     if(!state.preview)throw Error('无法创建预览，请先检查试题内容');
   }
   if(notice.dataset.overflow==='yes'){
     noticeError('正面或答案页超出一页A4，请减少题目或切换单双栏。');
     return;
   }
   const pending=p.items.filter(x=>x.q.review!=='approved');
   if(pending.length){
     const ok=confirm('当前有 '+pending.length+' 道题尚未标记为“教师已审核”。\n请确认题干、公式、题图和答案是否正确。\n是否仍要导出这次练习？');
     if(!ok){notice.textContent='已取消导出；题目与试题篮均已保留。';return}
   }
   if(!window.PhysicsWordExport?.createDocx)throw Error('Word 生成程序加载失败，请按 Ctrl+F5 刷新页面');
   notice.style.color='#436484';
   notice.textContent='正在生成 Word（图片较多时可能需要几秒钟）…';
   const blob=await window.PhysicsWordExport.createDocx({
     items:p.items,
     title:'物理精准练习',
     date:today(),
     student,
     layout:p.layout,
     answerMode:$('answerMode').value,
     feedback:$('feedback').checked
   });
   if(!(blob instanceof Blob)||blob.size<500)throw Error('生成的 Word 文件数据为空');
   // 生成过程中如果教师切换到了另一名学生，禁止为先前的学生保存/记账。
   const modeNow=Boolean(window.StudentPracticeExport?.isStudentMode?.());
   const selectedNow=modeNow?window.StudentPracticeExport.getSelection():null;
   if(modeNow!==studentMode||(student&&(selectedNow?.key!==student.key)))throw Error('生成过程中选择的学生发生变化，请重新导出，避免误记到其他学生名下。');
   const filename=student
     ?safeFilePart(student.className||'班级')+'_'+safeFilePart(student.name)+'_物理精准练习_'+today()+'.docx'
     :'physics_practice_'+today()+(p.layout==='double'?'_2col':'_1col')+'.docx';
   if(wordDownloadUrl)URL.revokeObjectURL(wordDownloadUrl);
   wordDownloadUrl=URL.createObjectURL(blob);
   for(const id of ['wordDownloadLink','previewDownloadLink']){
     const link=$(id);link.href=wordDownloadUrl;link.download=filename;link.style.display='inline-flex';
   }
   let savedHistory=true;
   if(student){
     // 仅记录 DOCX 成功生成并发起下载，不等同于学生已收到/已完成。
     const record={
       id:uid(),kind:'student-word-export',status:'generated',
       student:{key:student.key,name:student.name,rawName:student.rawName,className:student.className},
       date:now(),filename,layout:p.layout,items:exportedItemsSnapshot(p.items)
     };
     try{await put('events',record);state.events.push(record);window.StudentPracticeExport?.renderHistory?.()}
     catch(e){savedHistory=false;console.error('[题库]学生导出记录保存失败',e)}
   }
   $('wordDownloadLink').click();
   notice.textContent='Word 已生成：'+filename+'（'+Math.round(blob.size/1024)+' KB）。'+(student?(savedHistory?'已在 '+student.name+' 名下记录 '+p.items.length+' 道题。':'注意：个人导出历史未保存，请检查浏览器存储空间。'):'')
     +' 若浏览器未自动保存，请点击“点击保存 Word”。';
   notice.style.color=savedHistory?'#17633f':'#a12729';
   tell('Word 已生成并发起下载。'+(student?(savedHistory?'已记录学生导出历史。':'但个人历史保存失败。'):'')+' 如未下载请点击“保存已生成的 Word”。',!savedHistory);
 }catch(e){
   noticeError(e.message||String(e));
   console.error('[题库 Word 导出失败]',e);
 }finally{
   exportingWord=false;
   for(const id of ['wordBtn','previewExportBtn'])$(id).disabled=false;
 }
}

function openDraw(q,i){
let m=q.images[i];if(!m)return;state.draw={qid:q.id,imgIndex:i,pending:null};
$('drawOriginal').src=m.data||m.src||'';const svg=$('drawCanvas'),ns='http://www.w3.org/2000/svg';svg.innerHTML='<defs><marker id="qbArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#111"/></marker></defs>';
if(m.redrawSvg){try{let parsed=new DOMParser().parseFromString(m.redrawSvg,'image/svg+xml');for(const node of parsed.querySelectorAll('[data-shape]'))svg.appendChild(document.importNode(node,true))}catch(e){console.warn('已保存的SVG无法继续编辑',e)}}
$('drawDialog').showModal();
svg.onclick=e=>{let p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;let a=p.matrixTransform(svg.getScreenCTM().inverse()),x=Math.round(a.x),y=Math.round(a.y),mode=$('drawMode').value;if(mode==='text'){let t=document.createElementNS(ns,'text');t.setAttribute('x',x);t.setAttribute('y',y);t.textContent=$('drawText').value||'F';t.setAttribute('data-shape','1');svg.appendChild(t);return}
if(!state.draw.pending){state.draw.pending={x,y};return}let s=state.draw.pending;state.draw.pending=null;let tag=['line','arrow'].includes(mode)?'line':mode,el=document.createElementNS(ns,tag);if(tag==='line'){el.setAttribute('x1',s.x);el.setAttribute('y1',s.y);el.setAttribute('x2',x);el.setAttribute('y2',y);if(mode==='arrow')el.setAttribute('marker-end','url(#qbArrow)')}else if(tag==='rect'){el.setAttribute('x',Math.min(s.x,x));el.setAttribute('y',Math.min(s.y,y));el.setAttribute('width',Math.abs(x-s.x));el.setAttribute('height',Math.abs(y-s.y))}else{el.setAttribute('cx',(s.x+x)/2);el.setAttribute('cy',(s.y+y)/2);el.setAttribute('rx',Math.abs(x-s.x)/2);el.setAttribute('ry',Math.abs(y-s.y)/2)}el.setAttribute('data-shape','1');svg.appendChild(el)};
$('drawUndo').onclick=()=>{state.draw.pending=null;let arr=svg.querySelectorAll('[data-shape]');if(arr.length)arr[arr.length-1].remove()};
$('drawReset').onclick=()=>{if(confirm('清空重绘草稿？')){svg.querySelectorAll('[data-shape]').forEach(x=>x.remove());state.draw.pending=null}};
$('drawSave').onclick=async()=>{if(!svg.querySelector('[data-shape]'))return alert('请先绘制至少一个对象');let content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><defs><marker id="qbArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#111"/></marker></defs><rect width="800" height="500" fill="white"/>'+Array.from(svg.querySelectorAll('[data-shape]')).map(x=>x.outerHTML).join('')+'</svg>';let url=URL.createObjectURL(new Blob([content],{type:'image/svg+xml'}));try{let img=new Image();img.src=url;await img.decode();let c=document.createElement('canvas');c.width=1600;c.height=1000;let ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);m.redrawSvg=content;m.redrawPng=c.toDataURL('image/png');m.useRedraw=true;await put('questions',q);$('drawDialog').close();openEditor(q.id);tell('已保存教师重绘的 SVG 和打印PNG，原图仍在，需核验所有物理细节。')}catch(e){alert('保存重绘图失败：'+e.message)}finally{URL.revokeObjectURL(url)}}
}
window.PhysicsQuestionBank={splitParts,hash,norm,sourceBase,uniqueTags,buildPages};
init();
})();
