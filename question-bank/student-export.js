/* 从学情分析的 ScoreAnalysisDB 只读取得学生名单。
   直接复用同仓库 StudentNameSearch 的中文 / 全拼 / 首字母评分算法。 */
(function(root){
'use strict';
let students=[],selected=null,eventsReader=()=>[],onSelectionChange=()=>{},currentIndex=-1;
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').trim();
const makeKey=e=>[e.className,e.rawName,e.displayName].join('\u001f');
function readScoreBatches(){
 return new Promise((resolve,reject)=>{
   if(!root.indexedDB)return reject(Error('当前环境不支持本地 IndexedDB'));
   const req=indexedDB.open('ScoreAnalysisDB',1);
   req.onerror=()=>reject(req.error||Error('无法读取学情分析的本地数据库'));
   req.onupgradeneeded=()=>{}; // 只读，不创建/写入学情分析的数据。
   req.onsuccess=()=>{
     const db=req.result;
     if(!db.objectStoreNames.contains('batches')){db.close();return resolve([])}
     let transaction;
     try{transaction=db.transaction('batches','readonly')}catch(e){db.close();return reject(e)}
     const r=transaction.objectStore('batches').get('scoreBatches');
     r.onsuccess=()=>{db.close();try{const item=r.result;const data=item?.value?JSON.parse(item.value):[];resolve(Array.isArray(data)?data:[])}catch(e){reject(Error('成绩批次内容解析失败：'+e.message))}};
     r.onerror=()=>{db.close();reject(r.error||Error('学生名单读取失败'))};
   };
 });
}
async function reloadRoster(){
 const status=$('studentRosterStatus');
 status.textContent='正在读取本浏览器保存的成绩批次…';
 try{
   const batches=await readScoreBatches(),seen=new Set(),result=[];
   // 最近一次批次优先；只提取姓名和班级，不复制成绩或个人分数到题库。
   for(const b of batches.slice().reverse()){
     for(const stu of b.combinedStudentData||[]){
       if(!stu||(!stu.name&&!stu.displayName))continue;
       const entry=root.StudentNameSearch.indexStudent(stu);
       if(!entry.displayName)continue;
       entry.studentKey=makeKey(entry);
       if(seen.has(entry.studentKey))continue;
       seen.add(entry.studentKey);
       result.push(entry);
     }
   }
   students=result.sort((a,b)=>a.className.localeCompare(b.className,'zh-CN')||a.displayName.localeCompare(b.displayName,'zh-CN'));
   status.textContent=students.length?'已读取 '+students.length+' 名学生（'+batches.length+' 个成绩批次），姓名仅用于本地组卷。':'未找到已保存的学生名单。请先在学情分析主页上传成绩并保存批次。';
   if(selected){const oldKey=selected.studentKey;selected=students.find(e=>e.studentKey===oldKey)||null;if(!selected)onSelectionChange()}
   renderSelected();renderSuggestions();
 }catch(e){status.textContent='读取失败：'+e.message;students=[];selected=null;renderSelected()}
}
function getSelection(){if(!$('studentExportMode').checked)return null;return selected?{key:selected.studentKey,name:selected.displayName,className:selected.className,rawName:selected.rawName}:null}
function isStudentMode(){return $('studentExportMode').checked}
function renderSelected(){
 const box=$('studentSelected');
 const use=isStudentMode();
 $('studentPicker').disabled=!use;
 box.textContent=!use?'当前为通用练习，不记录个人导出历史。':selected?'已选择：'+(selected.className?selected.className+' · ':'')+selected.displayName:'尚未选择学生；按学生导出前请明确选择姓名。';
 box.classList.toggle('selected',!!selected&&use);
 renderHistory();
}
function matches(){
 const input=$('studentPicker').value.trim();
 if(!input)return [];
 return root.StudentNameSearch.search(students,input,{limit:25});
}
function renderSuggestions(){
 const list=$('studentSuggestions');list.innerHTML='';
 if(!isStudentMode()||!$('studentPicker').value.trim()){list.hidden=true;$('studentPicker').setAttribute('aria-expanded','false');return}
 const results=matches();currentIndex=-1;
 if(!results.length){const item=document.createElement('div');item.className='student-empty-result';item.textContent='没有匹配的学生，请确认学情分析已保存成绩批次。';list.append(item)}
 else{
  for(const entry of results){
    const item=document.createElement('button');
    item.type='button';item.className='student-suggestion';
    const title=document.createElement('strong');title.textContent=entry.displayName;
    const subtitle=document.createElement('small');subtitle.textContent=(entry.className?entry.className+' · ':'')+(entry.initials||entry.fullPinyin||'');
    item.append(title,subtitle);
    item.addEventListener('mousedown',e=>e.preventDefault());
    item.addEventListener('click',()=>select(entry));
    list.append(item);
  }
 }
 list.hidden=false;$('studentPicker').setAttribute('aria-expanded','true');
}
function select(entry){selected=entry;onSelectionChange();$('studentPicker').value=entry.displayName;$('studentSuggestions').hidden=true;$('studentPicker').setAttribute('aria-expanded','false');renderSelected()}
function renderHistory(){
 const el=$('studentExportHistory');el.replaceChildren();
 if(!selected||!isStudentMode()){el.textContent='选择一名学生后，可查看该生曾导出过的具体题目。';return}
 const records=eventsReader().filter(e=>e.kind==='student-word-export'&&e.student?.key===selected.studentKey).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const heading=document.createElement('div');heading.className='student-history-heading';heading.textContent='此学生已生成 '+records.length+' 次 Word；'+new Set(records.flatMap(e=>e.items.map(x=>x.id))).size+' 个不同的题目/子题。';el.append(heading);
 if(!records.length){const p=document.createElement('p');p.className='hint';p.textContent='暂无个人导出记录。';el.append(p);return}
 for(const e of records.slice(0,25)){
   const d=document.createElement('details'),sum=document.createElement('summary');
   sum.textContent=String(e.date||'').replace('T',' ').slice(0,16)+' · '+e.items.length+'题 · '+(e.filename||'Word练习');
   const item=document.createElement('div');item.className='student-history-questions';
   item.textContent=e.items.map((q,i)=>(i+1)+'. '+(q.sourceNo?('#'+q.sourceNo):'')+(q.partLabel||'')+' '+(q.stemPreview||q.id)).join('\n');
   d.append(sum,item);el.append(d);
 }
}
async function init(opts){
 eventsReader=opts?.getEvents||(()=>[]);onSelectionChange=opts?.onSelectionChange||(()=>{});
 $('studentPicker').addEventListener('input',()=>{selected=null;onSelectionChange();renderSelected();renderSuggestions()});
 $('studentPicker').addEventListener('keydown',e=>{
   if(e.key==='Escape'){$('studentSuggestions').hidden=true;return}
   if(e.key==='Enter'){let r=matches();if(r.length===1){e.preventDefault();select(r[0])}else if(currentIndex>=0&&r[currentIndex]){e.preventDefault();select(r[currentIndex])}return}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){
     let rows=Array.from($('studentSuggestions').querySelectorAll('button.student-suggestion'));
     if(!rows.length)return;e.preventDefault();currentIndex=(currentIndex+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;
     rows.forEach((row,i)=>row.classList.toggle('active',i===currentIndex));
   }
 });
 $('studentExportMode').addEventListener('change',()=>{onSelectionChange();renderSelected()});
 $('studentReloadRoster').addEventListener('click',reloadRoster);
 renderSelected();await reloadRoster();
}
root.StudentPracticeExport={init,getSelection,isStudentMode,renderHistory,reloadRoster,makeKey};
})(typeof window!=='undefined'?window:globalThis);
