/* 按学生导出：仅在点“导出 Word”时显示姓名弹窗。
 * 学生名单读取当前浏览器 ScoreAnalysisDB，使用全站同一套拼音检索。
 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
let students=[],selected=null,mode='student',eventsReader=()=>[],onSelectionChange=()=>{};
let activeResolve=null,currentCandidate=null,loaded=false;
const clean=x=>String(x||'').trim();
const keyOf=e=>[e.className,e.rawName,e.displayName].join('\u001f');
function readBatches(){
 return new Promise((resolve,reject)=>{
   if(!root.indexedDB)return reject(new Error('当前浏览器不支持本地学生名单'));
   const req=root.indexedDB.open('ScoreAnalysisDB');
   req.onerror=()=>reject(req.error||new Error('读取成绩数据库失败'));
   req.onupgradeneeded=()=>{}; // 只读取学生，不写入任何成绩数据
   req.onsuccess=()=>{
     const db=req.result;
     if(!db.objectStoreNames.contains('batches')){db.close();resolve([]);return}
     const tx=db.transaction('batches','readonly'),request=tx.objectStore('batches').get('scoreBatches');
     request.onsuccess=()=>{
       try{
         const raw=request.result?.value;
         const batches=raw?(typeof raw==='string'?JSON.parse(raw):raw):[];
         resolve(Array.isArray(batches)?batches:[]);
       }catch(e){reject(new Error('学生名单解析失败：'+e.message))}
     };
     request.onerror=()=>reject(request.error||new Error('学生名单读取失败'));
     tx.oncomplete=()=>db.close();tx.onerror=()=>db.close();
   };
 });
}
async function reloadRoster(){
 const tip=$('exportStudentHint');
 if(tip)tip.textContent='正在读取已有成绩批次中的学生姓名…';
 try{
   const batches=await readBatches(),seen=new Set(),all=[];
   for(const batch of batches.slice().reverse()){
     for(const stu of batch.combinedStudentData||[]){
       if(!stu||(!stu.name&&!stu.displayName))continue;
       const entry=root.StudentNameSearch.indexStudent(stu);
       if(!entry.displayName)continue;
       entry.studentKey=keyOf(entry);
       if(seen.has(entry.studentKey))continue;
       seen.add(entry.studentKey);all.push(entry);
     }
   }
   students=all.sort((a,b)=>a.className.localeCompare(b.className,'zh-CN')||a.displayName.localeCompare(b.displayName,'zh-CN'));
   loaded=true;
   if(tip)tip.textContent=students.length
     ?'已关联 '+students.length+' 名学生。点击匹配结果可避免重名误选；没有找到的学生可手动填写姓名与班级。'
     :'未读取到成绩批次中的学生。可以直接填写姓名及班级后导出。';
 }catch(e){
   students=[];loaded=true;
   if(tip)tip.textContent='学生名单暂不可读取（'+e.message+'），可以手动填写姓名和班级导出。';
 }
 return students;
}
function searchRoster(input,limit=20){
 if(!root.StudentNameSearch)return [];
 return root.StudentNameSearch.search(students,clean(input),{limit});
}
function asSelected(entry){
 return {key:entry.studentKey,name:entry.displayName,className:entry.className,rawName:entry.rawName};
}
function getSelection(){return mode==='student'?selected:null}
function isStudentMode(){return mode==='student'}
function switchSelection(choice,newMode){
 mode=newMode;
 selected=choice;
 onSelectionChange();
}
function renderHistory(){
 const holder=$('exportStudentHistory');if(!holder)return;
 holder.replaceChildren();
 if(!currentCandidate?.studentKey)return;
 const records=eventsReader().filter(x=>x.kind==='student-word-export'&&x.student?.key===currentCandidate.studentKey);
 if(!records.length){holder.textContent='该学生目前没有生成过的练习。';return}
 const unique=new Set(records.flatMap(x=>(x.items||[]).map(i=>i.id))).size;
 holder.textContent='已为该生生成 '+records.length+' 份 Word，涉及 '+unique+' 道不同题目/子题。';
}
function setCandidate(entry){
 currentCandidate=entry;
 $('exportStudentName').value=entry.displayName;
 $('exportStudentClass').value=entry.className;
 renderMatches();
 renderHistory();
}
function renderMatches(){
 const input=clean($('exportStudentName').value),panel=$('exportStudentMatches');
 panel.replaceChildren();
 if(!input){panel.hidden=true;return}
 const found=searchRoster(input,12);
 panel.hidden=false;
 if(!found.length){
   const message=document.createElement('p');message.className='student-empty-result';
   message.textContent='名单中无匹配，确认姓名和班级后可手动登记。';
   panel.appendChild(message);
   return;
 }
 found.forEach(entry=>{
   const button=document.createElement('button');button.type='button';button.className='export-student-result';
   if(currentCandidate?.studentKey===entry.studentKey)button.classList.add('active');
   const n=document.createElement('b');n.textContent=entry.displayName;
   const detail=document.createElement('span');detail.textContent=(entry.className||'班级未填写')+' · '+(entry.initials||entry.fullPinyin||'');
   button.append(n,detail);
   button.addEventListener('click',()=>{setCandidate(entry);$('exportStudentError').hidden=true});
   panel.appendChild(button);
 });
}
function error(message){const el=$('exportStudentError');el.hidden=false;el.textContent=message}
function finish(result){
 const dialog=$('studentNameDialog');
 if(dialog.open)dialog.close();
 const callback=activeResolve;activeResolve=null;
 if(callback)callback(result);
}
function chooseManual(name,className){
 name=clean(name);className=clean(className);
 if(!name)throw new Error('请输入学生姓名');
 if(name.length>40)throw new Error('学生姓名不能超过40个字符');
 if(!className)throw new Error('请输入班级，避免同名学生的记录混淆');
 if(className.length>24)throw new Error('班级名称不能超过24个字符');
 if(/^[a-z\s]+$/i.test(name)){
   throw new Error('输入的是拼音或首字母，请点击上方匹配的学生；未在名单中的学生请填写中文姓名。');
 }
 const exist=students.find(x=>x.className===className&&(x.displayName===name||x.rawName===name));
 if(exist)return asSelected(exist);
 const index=root.StudentNameSearch.indexStudent({name,displayName:name,class:className});
 index.studentKey=keyOf(index);
 return asSelected(index);
}
function promptForExport(){
 if(activeResolve)return Promise.resolve(null);
 const dialog=$('studentNameDialog'),input=$('exportStudentName'),classInput=$('exportStudentClass');
 $('exportStudentError').hidden=true;
 currentCandidate=null;
 input.value='';
 classInput.value=selected?.className||'';
 $('exportStudentMatches').replaceChildren();
 $('exportStudentMatches').hidden=true;
 const history=$('exportStudentHistory');if(history)history.replaceChildren();
 if(!loaded)reloadRoster();
 return new Promise(resolve=>{
   activeResolve=resolve;
   dialog.showModal();
   input.focus();
 });
}
function bindEvents(){
 $('exportStudentName').addEventListener('input',()=>{
   currentCandidate=null;
   $('exportStudentError').hidden=true;renderMatches();renderHistory();
 });
 $('exportStudentName').addEventListener('keydown',e=>{
   if(e.key!=='Enter')return;
   e.preventDefault();
   const found=searchRoster($('exportStudentName').value,3);
   if(found.length===1){setCandidate(found[0]);return}
   $('exportConfirmStudent').click();
 });
 $('exportStudentClass').addEventListener('input',()=>{
   // Editing the class after choosing roster result switches to explicit manual mode.
   if(currentCandidate&&currentCandidate.className!==clean($('exportStudentClass').value))currentCandidate=null;
   $('exportStudentError').hidden=true;
 });
 $('exportConfirmStudent').addEventListener('click',()=>{
   try{
     const student=currentCandidate
       ?asSelected(currentCandidate)
       :chooseManual($('exportStudentName').value,$('exportStudentClass').value);
     switchSelection(student,'student');
     finish({mode:'student',student});
   }catch(e){error(e.message)}
 });
 $('exportGenericWord').addEventListener('click',()=>{switchSelection(null,'generic');finish({mode:'generic',student:null})});
 $('exportStudentCancel').addEventListener('click',()=>finish(null));
 $('studentNameDialog').addEventListener('cancel',e=>{e.preventDefault();finish(null)});
}
async function init(options={}){
 eventsReader=options.getEvents||(()=>[]);onSelectionChange=options.onSelectionChange||(()=>{});
 bindEvents();
 await reloadRoster();
}
root.StudentPracticeExport={init,promptForExport,isStudentMode,getSelection,searchRoster,reloadRoster,renderHistory};
})(typeof window!=='undefined'?window:globalThis);
