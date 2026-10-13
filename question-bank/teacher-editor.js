/* Unified local teacher editor. The canonical text keeps the existing math delimiters.
   Rendered formula DOM is never used as the source of mathematical content. */
(function(root){
'use strict';
const $=id=>document.getElementById(id),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=x=>JSON.parse(JSON.stringify(x)),stamp=()=>new Date().toISOString();
const fields=['stem','answer','tags','type','difficulty','relation','review','parts','images','answerImages','normalizationDecisionsV1','sourceEvidenceV1'];
const content=q=>Object.fromEntries(fields.map(k=>[k,q[k]??(['tags','parts','images','answerImages','normalizationDecisionsV1'].includes(k)?[]:'')]));
const fingerprint=q=>JSON.stringify(content(q));
let api,base,work,dialog,range,activeField,mathTarget,mathRange,undo=[],redo=[],writing=Promise.resolve(),saveBusy=false,session=0,issues=[],issueIndex=0;
function status(s,error=false){$('teStatus').textContent=s;$('teStatus').classList.toggle('error',error)}
function atom(tex){return '<span class="te-atom" contenteditable="false" tabindex="0" role="button" aria-label="编辑公式" data-tex="'+E(tex)+'">'+root.PhysicsMathContent.inline('\\('+tex+'\\)')+'</span>'}
function richInline(s){return root.PhysicsMathContent.tokens(s||'').map(t=>t.type==='math'?atom(t.text):E(t.text)).join('')}
function rich(s){return root.PhysicsMathContent.blocks(s||'').map(b=>b.type==='table'?'<table><tbody>'+b.rows.map(row=>'<tr>'+row.map(c=>'<td>'+richInline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>':richInline(b.text)).join('\n')}
function serialize(node){
 if(node.nodeType===3)return node.textContent;
 if(node.nodeType!==1)return '';
 if(node.dataset.tex!==undefined)return '\\('+node.dataset.tex+'\\)';
 if(node.tagName==='BR')return '\n';
 if(node.tagName==='TABLE')return [...node.rows].map(row=>[...row.cells].map(c=>serialize(c).trim()).join(' | ')).join('\n');
 let s='';for(const n of node.childNodes){const block=n.nodeType===1&&['DIV','P'].includes(n.tagName);if(block&&s&&!s.endsWith('\n'))s+='\n';s+=serialize(n);if(block&&n!==node.lastChild&&!s.endsWith('\n'))s+='\n';}return s;
}
function getField(key){return key.startsWith('part:')?work.parts[Number(key.split(':')[1])][key.split(':')[2]]:work[key]}
function setField(key,value){if(key.startsWith('part:'))work.parts[Number(key.split(':')[1])][key.split(':')[2]]=value;else work[key]=value}
function fieldNodes(){return [...dialog.querySelectorAll('[data-field]')]}
function collect(){for(const el of fieldNodes())setField(el.dataset.field,serialize(el));for(const key of ['type','difficulty','relation','review'])work[key]=$('teMeta-'+key).value;work.tags=$('teTags').value.split(/[；;,，、]/).map(x=>x.trim()).filter(Boolean)}
function checkpoint(){undo.push(clone(content(work)));redo=[];}
function changed(){collect();draft();}
function draft(){
 const id=work.id,s=session,payload={id,baseRevision:base.revision||0,baseFingerprint:fingerprint(base),content:clone(content(work)),at:stamp()};
 status('正在保存草稿…');writing=writing.catch(()=>{}).then(()=>api.setDraft(id,payload)).then(()=>{if(s===session)status('草稿已保存 · 尚未正式保存')}).catch(e=>{if(s===session)status('草稿保存失败：'+e.message,true);throw e});writing.catch(()=>{});return writing;
}
function rememberRange(){const sel=getSelection();if(!sel.rangeCount)return;const r=sel.getRangeAt(0);const el=(r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement).closest('[data-field]');if(el&&el.contains(r.endContainer)){range=r.cloneRange();activeField=el;}}
function selectRange(r){const sel=getSelection();sel.removeAllRanges();sel.addRange(r)}
function defaultRange(){let r=range;if(!r||!dialog.contains(r.startContainer)){const el=fieldNodes()[0];r=document.createRange();r.selectNodeContents(el);r.collapse(false);activeField=el;}return r}
function insertTex(tex,target=null,r=null){
 checkpoint();const holder=document.createElement('span');holder.innerHTML=atom(tex);const node=holder.firstChild;
 if(target&&target.isConnected)target.replaceWith(node);else{const at=r||defaultRange();at.deleteContents();at.insertNode(node)}
 const tail=document.createTextNode('');node.after(tail);range=document.createRange();range.setStart(tail,0);range.collapse(true);selectRange(range);changed();scan();
}
function textInsert(text){checkpoint();const r=defaultRange();r.deleteContents();const n=document.createTextNode(text);r.insertNode(n);range=document.createRange();range.setStartAfter(n);range.collapse(true);selectRange(range);changed();scan()}
function renderFields(){
 const box=(label,key)=>'<section class="te-field-section"><h3>'+label+'</h3><div class="te-rich" contenteditable="true" role="textbox" aria-multiline="true" aria-label="'+label+'" data-field="'+key+'">'+rich(getField(key)||'')+'</div></section>';
 $('teFields').innerHTML=box('题干与选项','stem')+images('images')+box('答案与解析','answer')+images('answerImages')+
 (work.parts?.length?'<details class="te-parts" open><summary>独立小问（分别编辑，不自动覆盖整题）</summary>'+work.parts.map((p,i)=>box('小问 '+(i+1)+' 题干','part:'+i+':stem')+box('小问 '+(i+1)+' 答案','part:'+i+':answer')).join('')+'</details>':'');
 range=null;activeField=fieldNodes()[0];
}
function mediaSrc(im){return im.useRedraw&&im.redrawPng?im.redrawPng:im.data||im.src||''}
function images(key){return '<section class="te-images"><h3>'+(key==='images'?'题图':'答案图')+'</h3><div class="te-image-grid">'+(work[key]||[]).map((im,i)=>'<div><img alt="'+(key==='images'?'题图':'答案图')+(i+1)+'" src="'+E(mediaSrc(im))+'" style="width:'+Number(im.displayWidth||320)+'px"><div><button type="button" data-image-zoom="'+key+':'+i+'">放大</button><label class="button">替换<input hidden type="file" accept="image/png,image/jpeg,image/webp" data-image-replace="'+key+':'+i+'"></label><label>显示宽度<input type="number" min="80" max="1200" value="'+Number(im.displayWidth||320)+'" data-image-width="'+key+':'+i+'"></label></div></div>').join('')+'</div><label class="button">＋ 添加图片<input hidden type="file" accept="image/png,image/jpeg,image/webp" data-image-add="'+key+'"></label></section>'}
function fillMeta(){for(const k of ['type','difficulty','relation','review'])$('teMeta-'+k).value=work[k]||'';$('teTags').value=(work.tags||[]).join('；')}
async function sourceFile(file){
 if(!file)return;const zip=await root.JSZip.loadAsync(await file.arrayBuffer()),entry=zip.file('word/document.xml');if(!entry)throw Error('不是有效DOCX');const xml=await entry.async('text'),doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw Error('Word正文XML损坏');const body=[...doc.getElementsByTagName('*')].find(n=>n.localName==='body'),blocks=[...body.children].map(n=>({text:root.PhysicsMathContent.fromWordNode(n).trim(),xml:new XMLSerializer().serializeToString(n)}));
 const candidates=[];let item;for(const block of blocks){const m=block.text.match(/^\s*(\d{1,3})[．.、]\s*(.*)/);if(m){item={no:m[1],text:block.text,xml:block.xml};candidates.push(item)}else if(item){item.text+='\n'+block.text;item.xml+='\n'+block.xml}}
 if(!candidates.length)throw Error('没有识别到编号题，原件仍可在Word中核对');
 const host=$('teSourceCandidates');host.innerHTML='<p>选择对应段落，分别关联题干和答案；不会替换当前题目。</p><select id="teSourceChoice">'+candidates.map((c,i)=>'<option value="'+i+'">'+E(c.text.slice(0,75))+'</option>').join('')+'</select><button id="teLinkStem">关联为题干原件</button><button id="teLinkAnswer">关联为答案原件</button>';
 const matching=candidates.findIndex(c=>c.no===String(work.sourceNo));if(matching>=0)$('teSourceChoice').value=String(matching);
 for(const[field,button]of [['stem','teLinkStem'],['answer','teLinkAnswer']])$(button).onclick=()=>{checkpoint();const c=candidates[Number($('teSourceChoice').value)];work.sourceEvidenceV1={...(work.sourceEvidenceV1||{}),kind:'teacher-linked-docx',source:file.name,at:stamp(),[field]:c.text,[field+'Xml']:c.xml};$('teCompareTab').value='source';comparison();draft();};
}
function comparison(){
 const source=$('teCompareTab').value==='source',data=source?work.sourceEvidenceV1:base;
 $('teCompareBody').innerHTML=data?'<p class="te-note">'+(source?'导入时提取内容，仅作对照，不等同原 Word 页面；请结合原文件核对。':'本轮进入编辑时的正式版本')+'</p><h3>题干</h3><div class="te-read">'+root.PhysicsMathContent.html(data.stem||'')+'</div><h3>答案</h3><div class="te-read">'+root.PhysicsMathContent.html(data.answer||'')+'</div>':'<p class="te-note">此题尚无可定位的原 Word 片段。不能用当前题目冒充原件。可切换“修改前版本”，或打开原始 Word 核对。</p>';
 if(!source) $('teCompareBody').insertAdjacentHTML('beforeend',(base.images||[]).map(im=>'<img alt="修改前题图" style="width:100%" src="'+E(mediaSrc(im))+'">').join(''));
 $('teCompareBody').insertAdjacentHTML('beforeend','<p>来源：'+E(base.source||'未记录')+' · 第 '+E(base.sourceNo||'?')+' 题</p>');
}
function issueKey(x,text){return x.field+'|'+text+'|'+x.start+'|'+x.before}
function scan(){
 collect();issues=[];for(const el of fieldNodes()){const field=el.dataset.field,text=getField(field);for(const x of root.PhysicsInput.scan(text)){x.field=field;x.key=issueKey(x,text);if(!(work.normalizationDecisionsV1||[]).some(d=>d.key===x.key&&d.status==='correct'))issues.push(x)}}
 issueIndex=Math.min(issueIndex,Math.max(0,issues.length-1));showIssue();
}
function showIssue(){const x=issues[issueIndex];$('teIssue').innerHTML=x?'<div><b>本题 '+issues.length+' 处待核对 · 第 '+(issueIndex+1)+' 处</b> <button data-action="issuePrev">上一处</button> <button data-action="issueNext">下一处</button></div><p><code>'+E(x.before)+'</code> → '+root.PhysicsMathContent.inline(x.after)+' · '+E(x.reason)+'</p><div><button data-action="accept">采用建议</button> <button data-action="locate">手动修改 / 定位</button> <button data-action="correct">原文正确</button></div>':'<b>未发现本轮规则覆盖的书写疑点</b><span> · 不代表物理内容已审核通过</span>';}
function locate(){const x=issues[issueIndex];if(!x)return;const el=fieldNodes().find(n=>n.dataset.field===x.field);el.scrollIntoView({block:'center'});el.focus();
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){if(n.parentElement.closest('.te-atom'))continue;const at=n.textContent.indexOf(x.before);if(at>=0){range=document.createRange();range.setStart(n,at);range.setEnd(n,at+x.before.length);selectRange(range);activeField=el;break;}}
}
function accept(){const x=issues[issueIndex];if(!x)return;checkpoint();const t=getField(x.field);if(t.slice(x.start,x.end)!==x.before){scan();return}setField(x.field,t.slice(0,x.start)+x.after+t.slice(x.end));renderFields();draft();scan()}
function palette(){const group=$('teGroup').value,term=$('teSearch').value.toLowerCase().replace(/[²³]/g,c=>c==='²'?'2':'3');$('tePresets').innerHTML=root.PhysicsInput.presets.map((p,i)=>({p,i})).filter(({p})=>(!group||p.group===group)&&(!term||(p.label+' '+p.tex+' '+p.note).toLowerCase().replace(/[²³]/g,c=>c==='²'?'2':'3').includes(term))).map(({p,i})=>'<button type="button" data-preset="'+i+'" title="'+E(p.note)+'">'+E(p.label)+'</button>').join('')}
function mathOpen(tex,target=null){rememberRange();mathTarget=target;mathRange=defaultRange().cloneRange();$('teMathValue').value=tex;$('teMathDialog').showModal();$('teMathValue').focus();$('teMathError').textContent='';}
function diff(){collect();return fields.filter(k=>JSON.stringify(base[k]??content(base)[k])!==JSON.stringify(work[k]??content(work)[k]))}
async function save(next=false){
 if(saveBusy)return false;collect();if(!work.stem.trim()){status('题干不能为空',true);return false}
 const invalid=fieldNodes().flatMap(n=>root.PhysicsMathContent.validate(getField(n.dataset.field)).filter(e=>e.type==='数学结构解析失败'||e.type==='数学定界符不成对'));
 if(invalid.length){status('公式结构未通过检查，请先修复：'+invalid[0].type,true);return false}
 saveBusy=true;dialog.querySelector('.te-layout').inert=true;dialog.querySelectorAll('button').forEach(b=>b.disabled=true);
 try{await writing;const result=await api.commit(base,work);base=clone(result);work=clone(result);undo=[];redo=[];status('正式版本已保存 · '+new Date().toLocaleTimeString());fillMeta();comparison();if(next)await navigate(1);return true}catch(e){status('保存失败，草稿保留：'+e.message,true);return false}finally{saveBusy=false;dialog.querySelector('.te-layout').inert=false;dialog.querySelectorAll('button').forEach(b=>b.disabled=false)}
}
async function navigate(delta){await writing;const list=api.questions().filter(q=>!q.archivedAsDuplicate),i=list.findIndex(q=>q.id===work.id),next=list[i+delta];if(next)await open(next.id,{review:!$('teCompare').hidden});else status(delta>0?'已到最后一题':'已到第一题')}
async function close(){if(saveBusy)return;try{await writing;dialog.close();api.onClose?.()}catch(e){status('草稿未保存，暂不关闭：'+e.message,true)}}
function restoreHistory(){const records=base.teacherHistoryV1||[];$('teHistoryBody').innerHTML=records.length?records.map((h,i)=>'<p>'+E(h.at)+' · '+E(h.fields.join('、'))+' <button data-history="'+i+'">恢复此修改前版本为草稿</button></p>').join(''):'暂无历史版本';$('teHistoryDialog').showModal()}
async function open(id,options={}){
 if(dialog?.open){collect();await writing;}const found=await api.getQuestion(id)||options.newQuestion;if(!found)return;
 session++;base=clone(found);if(!base.id)base.id=id;work=clone(base);undo=[];redo=[];issueIndex=0;const d=await api.getDraft(id);let note='未修改';
 if(d){if(d.baseFingerprint===fingerprint(base)){Object.assign(work,clone(d.content));note='已恢复未正式保存的草稿'}else{note='存在基于旧版本的草稿，请在历史中查看后恢复';}}
 build(options);renderFields();fillMeta();comparison();palette();scan();status(note);if(d&&d.baseFingerprint!==fingerprint(base)){$('teOldDraft').hidden=false;$('teOldDraft').onclick=()=>{if(confirm('恢复旧草稿会替换当前编辑内容，正式版本在点击保存前不变。继续？')){checkpoint();Object.assign(work,clone(d.content));renderFields();fillMeta();draft();scan()}}}if(!dialog.open)dialog.showModal();
}
function build(options){
 dialog=$('teacherEditorDialog');dialog.innerHTML=`<header class="te-head"><div><h2>编辑题目</h2><span>${E(work.source||'网页新建')} · 第 ${E(work.sourceNo||'?')} 题 · ${E(work.id)}</span></div><div><button data-action="prev">上一题</button><button data-action="next">下一题</button><button data-action="close">关闭</button></div><p id="teStatus" role="status" aria-live="polite"></p></header>
 <div class="te-layout"><aside id="teCompare" ${options.review?'':'hidden'}><select id="teCompareTab"><option value="before">修改前版本</option><option value="source">原 Word 提取内容</option></select><label class="button">关联原 Word<input id="teSourceFile" type="file" accept=".docx" hidden></label><div id="teSourceCandidates"></div><div id="teCompareBody"></div></aside>
 <main class="te-main"><div id="teIssue" class="te-issue"></div><div class="te-toolbar"><div class="te-tools"><button data-action="compare">原件 / 修改前对照</button><button data-action="undo">撤销</button><button data-action="redo">重做</button><button data-action="sub">下标</button><button data-action="sup">上标</button><button data-action="fraction">分式</button><button data-action="science">科学计数法</button><button data-action="table">表格</button><button data-action="preview">阅读预览</button><button data-action="jumpStem">题干</button><button data-action="jumpAnswer">答案</button><button data-action="scan">检查书写</button></div>
 <details class="te-palette" open><summary>单位 · 符号 · 公式</summary><div><select id="teGroup">${['常用','力学','热学','电学','符号','结构','公式','拓展'].map(g=>'<option>'+g+'</option>').join('')}<option value="">全部</option></select><input id="teSearch" placeholder="搜索 cm3、比热容、吸热…" aria-label="搜索物理输入块"></div><div id="tePresets"></div></details></div>
 <div id="teFields"></div><details class="te-meta"><summary>题目信息与拆题</summary><label>知识点<input id="teTags"></label>${[['type','题型',['其他','选择题','填空题','作图题','实验题','计算题','综合题']],['difficulty','难度',['','容易','普通','困难']],['relation','知识点关系',['pending','single','cross','parallel','options']],['review','审核状态',['pending','approved']]].map(([k,label,opts])=>'<label>'+label+'<select id="teMeta-'+k+'">'+opts.map(o=>'<option value="'+o+'">'+E(({pending:'待审核',approved:'教师已审核',single:'单知识点',cross:'交叉应用',parallel:'并列小问',options:'选项独立'})[o]||o||'未设置')+'</option>').join('')+'</select></label>').join('')}<button data-action="split">识别独立小问</button><button data-action="clearParts">取消拆题</button><p>整题与小问分别保存，修改后请核对两者一致。</p></details></main></div>
 <footer class="te-foot"><div><button data-action="compare">编辑 / 对照</button><button data-action="diff">查看修改</button><button data-action="history">历史版本</button><button id="teOldDraft" hidden>恢复旧草稿</button><button data-action="cancel">取消本次修改</button></div><div><button data-action="save" class="primary">保存</button><button data-action="saveNext" class="primary">保存并下一题</button></div></footer>`;
 dialog.classList.remove('te-preview');
}
function init(options){
 api=options;document.body.insertAdjacentHTML('beforeend','<dialog id="teacherEditorDialog" class="te-dialog" aria-label="题目编辑"></dialog><dialog id="teMathDialog" class="te-math-dialog"><h2>编辑公式</h2><p>点击公式位置输入；使用下方按钮插入结构。</p><math-field id="teMathValue" math-virtual-keyboard-policy="manual"></math-field><div class="te-tools"><button data-math-command="subscript">下标</button><button data-math-command="superscript">上标</button><button data-math-insert="\\frac{#0}{#?}">分式</button><button data-math-insert="\\sqrt{#0}">根式</button><button data-math-insert="\\times10^{#?}">×10ⁿ</button></div><p id="teMathError" role="alert"></p><button id="teMathCancel">取消</button><button id="teMathApply" class="primary">应用公式</button></dialog><dialog id="teHistoryDialog"><h2>版本与修改记录</h2><div id="teHistoryBody"></div><button id="teHistoryClose">关闭</button></dialog><dialog id="teImageDialog"><img alt="题图放大"><button id="teImageClose">关闭</button></dialog>');
 dialog=$('teacherEditorDialog');
 if(root.MathfieldElement){root.MathfieldElement.fontsDirectory=new URL('./vendor/mathlive/fonts',document.currentScript?.src||new URL('./teacher-editor.js',location.href)).href;root.MathfieldElement.soundsDirectory=null;}
 document.addEventListener('selectionchange',()=>{if(dialog.open)rememberRange()});
 dialog.addEventListener('beforeinput',e=>{if(e.target.closest('[data-field]'))checkpoint()});
 dialog.addEventListener('input',e=>{if(e.target.closest('[data-field]')||e.target.closest('.te-meta'))changed();if(e.target.id==='teSearch')palette()});
 dialog.addEventListener('change',async e=>{if(e.target.id==='teGroup')palette();if(e.target.id==='teCompareTab')comparison();if(e.target.id==='teSourceFile'){try{await sourceFile(e.target.files[0])}catch(err){status('原件读取失败：'+err.message,true)}return;}
 const ds=e.target.dataset;if(ds.imageWidth){checkpoint();const[k,i]=ds.imageWidth.split(':');work[k][i].displayWidth=Math.max(80,Math.min(1200,Number(e.target.value)||320));renderFields();draft();}
 if(ds.imageReplace||ds.imageAdd){const f=e.target.files?.[0];if(!f)return;try{if(!['image/png','image/jpeg','image/webp'].includes(f.type))throw Error('请选择 PNG、JPEG 或 WebP');const data=await new Promise((yes,no)=>{const r=new FileReader();r.onload=()=>yes(r.result);r.onerror=()=>no(r.error);r.readAsDataURL(f)});checkpoint();if(ds.imageAdd){work[ds.imageAdd]??=[];work[ds.imageAdd].push({data,sourcePath:f.name})}else{const[k,i]=ds.imageReplace.split(':');work[k][i]={data,sourcePath:f.name}}renderFields();draft()}catch(err){status(err.message,true)}}
 });
 dialog.addEventListener('paste',e=>{if(!e.target.closest('[data-field]'))return;e.preventDefault();rememberRange();textInsert(e.clipboardData.getData('text/plain'))});
 dialog.addEventListener('drop',e=>{if(e.target.closest('[data-field]'))e.preventDefault()});
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();travel(e.key.toLowerCase()==='y'||e.shiftKey)}if(e.key==='Enter'&&e.target.matches('.te-atom')){e.preventDefault();mathOpen(e.target.dataset.tex,e.target)}});
 dialog.addEventListener('click',async e=>{try{
 const at=e.target.closest('.te-atom');if(at){if(!dialog.classList.contains('te-preview'))mathOpen(at.dataset.tex,at);return}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.preset!==undefined){const p=root.PhysicsInput.presets[Number(b.dataset.preset)];if(['公式','结构'].includes(p.group))mathOpen(p.tex);else insertTex(p.tex);return}
 if(b.dataset.imageZoom){const[k,i]=b.dataset.imageZoom.split(':');$('teImageDialog').querySelector('img').src=mediaSrc(work[k][i]);$('teImageDialog').showModal();return}
 const a=b.dataset.action;if(!a)return;
 if(a==='save'||a==='saveNext'){await save(a==='saveNext');return}if(a==='close'){await close();return}if(a==='prev'||a==='next'){await navigate(a==='next'?1:-1);return}
 if(a==='compare'){$('teCompare').hidden=!$('teCompare').hidden;return}if(a==='preview'){const enabled=dialog.classList.toggle('te-preview');fieldNodes().forEach(n=>n.contentEditable=String(!enabled));return}
 if(a==='jumpStem'||a==='jumpAnswer'){fieldNodes().find(n=>n.dataset.field===(a==='jumpStem'?'stem':'answer')).scrollIntoView({block:'center'});return}
 if(a==='undo'||a==='redo'){travel(a==='redo');return}if(a==='scan'){scan();return}
 if(a==='sub'||a==='sup'){rememberRange();const selected=range?.toString()||'x';mathOpen(range?.toString()?'{}'+(a==='sub'?'_{':'^{')+selected+'}':(a==='sub'?'F_{1}':'x^{2}'));return}
 if(a==='fraction'){mathOpen('\\frac{a}{b}');return}if(a==='science'){mathOpen('a\\times10^{n}');return}
 if(a==='table'){checkpoint();const at=defaultRange(),holder=document.createElement('div');holder.innerHTML='<table><tbody><tr><td>项目</td><td>数值</td></tr><tr><td>物理量</td><td>0</td></tr></tbody></table>';at.deleteContents();at.insertNode(holder.firstChild);changed();return}
 if(a==='accept'){accept();return}if(a==='locate'){locate();return}if(a==='correct'){const x=issues[issueIndex];if(x){checkpoint();work.normalizationDecisionsV1??=[];work.normalizationDecisionsV1.push({key:x.key,status:'correct',at:stamp()});draft();scan()}return}
 if(a==='issuePrev'||a==='issueNext'){issueIndex=(issueIndex+(a==='issueNext'?1:issues.length-1))%Math.max(1,issues.length);showIssue();locate();return}
 if(a==='cancel'){if(confirm('放弃本次草稿，恢复当前正式版本？')){await writing;work=clone(base);undo=[];redo=[];renderFields();fillMeta();scan();await api.setDraft(work.id,null);status('已取消本次修改')}return}
 if(a==='history'){restoreHistory();return}if(a==='diff'){const keys=diff();$('teHistoryBody').innerHTML=keys.length?keys.map(k=>'<h3>'+E(k)+'</h3><div class="te-diff"><pre>'+E(['images','answerImages'].includes(k)?'图片 '+(base[k]||[]).length+' 张（原图保留于历史版本）':typeof base[k]==='string'?base[k]:JSON.stringify(base[k],null,2))+'</pre><pre>'+E(['images','answerImages'].includes(k)?'图片 '+(work[k]||[]).length+' 张（可在编辑区核对）':typeof work[k]==='string'?work[k]:JSON.stringify(work[k],null,2))+'</pre></div>').join(''):'没有内容修改';$('teHistoryDialog').showModal();return}
 if(a==='split'||a==='clearParts'){collect();if(work.parts?.length&&!confirm('替换现有小问草稿？正式版本仍可在历史中恢复。'))return;checkpoint();work.parts=a==='split'?api.split(work.stem):[];renderFields();draft();scan()}
 }catch(err){status(err.message,true)}});
 $('teHistoryBody').addEventListener('click',e=>{const b=e.target.closest('[data-history]');if(b){checkpoint();Object.assign(work,clone(base.teacherHistoryV1[Number(b.dataset.history)].before));renderFields();fillMeta();draft();scan();$('teHistoryDialog').close()}});
 $('teMathDialog').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.mathCommand)$('teMathValue').executeCommand(b.dataset.mathCommand);if(b?.dataset.mathInsert)$('teMathValue').insert(b.dataset.mathInsert)});
 $('teMathApply').onclick=()=>{const tex=$('teMathValue').value;try{if(!tex.trim()||/\\placeholder/.test(tex))throw Error('请填写公式中的空位');root.PhysicsMathContent.mathml(tex);insertTex(tex,mathTarget,mathRange);$('teMathDialog').close()}catch(e){$('teMathError').textContent='公式无法保存：'+e.message}};
 $('teMathCancel').onclick=()=>$('teMathDialog').close();$('teHistoryClose').onclick=()=>$('teHistoryDialog').close();$('teImageClose').onclick=()=>$('teImageDialog').close();
 root.addEventListener('beforeunload',e=>{if(dialog.open&&/失败|正在保存/.test($('teStatus').textContent)){e.preventDefault();e.returnValue=''}});
}
function travel(forward){collect();const from=forward?redo:undo,to=forward?undo:redo;if(!from.length)return;to.push(clone(content(work)));Object.assign(work,from.pop());renderFields();fillMeta();draft();scan()}
root.PhysicsTeacherEditor={init,open,content,fingerprint,serialize};
})(window);
