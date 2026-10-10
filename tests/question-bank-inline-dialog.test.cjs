'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const base=path.join(__dirname,'..','question-bank');
const index=fs.readFileSync(path.join(base,'index.html'),'utf8');
const names=fs.readFileSync(path.join(__dirname,'..','student-name-search.js'),'utf8');
const students=fs.readFileSync(path.join(base,'student-export.js'),'utf8');
const inline=fs.readFileSync(path.join(base,'inline-details.js'),'utf8');
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
assert.match(index,/id="bankDetailsButton"/);
assert.match(index,/id="bankDetailsPanel"[^>]*hidden/);
assert.match(index,/id="studentNameDialog"/);
assert.match(index,/id="exportStudentName"/);
assert.match(index,/id="print-settings"|class="print-settings"/);
assert.doesNotMatch(index,/class="student-export-panel"/);
assert.match(app,/await window\.StudentPracticeExport\.promptForExport\(\)/);
function element(){
 return {value:'',hidden:false,open:false,checked:true,style:{},children:[],listeners:{},
 classList:{add(){},toggle(){}},replaceChildren(){this.children=[]},
 append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)},
 addEventListener(event,fn){this.listeners[event]=fn},
 showModal(){this.open=true},close(){this.open=false},focus(){},
 click(){return this.listeners.click?.()},setAttribute(){},scrollIntoView(){}};
}
const root={pinyinPro:{pinyin:name=>({张三:['zhang','san'],李言:['li','yan']}[name]||[name])}};
vm.runInNewContext(names,{window:root,console},{timeout:1000});
const ids=['exportStudentHint','exportStudentName','exportStudentClass','exportStudentMatches',
 'exportStudentError','exportStudentHistory','exportConfirmStudent','exportGenericWord',
 'exportStudentCancel','studentNameDialog'];
const els=Object.fromEntries(ids.map(id=>[id,element()]));
const document={getElementById:id=>els[id],createElement:()=>element()};
const source=[{combinedStudentData:[{name:'张三',class:'801'},{name:'李言',class:'802'}]}];
const indexedDB={open(){const db={objectStoreNames:{contains(){return true}},transaction(){
 const tx={oncomplete:null,objectStore(){return{get(){
 const req={result:{value:JSON.stringify(source)}};
 Promise.resolve().then(()=>req.onsuccess());
 Promise.resolve().then(()=>tx.oncomplete?.());return req
 }}}};return tx
 },close(){}};const r={result:db};Promise.resolve().then(()=>r.onsuccess());return r}};
root.indexedDB=indexedDB;
vm.runInNewContext(students,{window:root,document,console},{timeout:1000});
(async()=>{
 await root.StudentPracticeExport.init({getEvents:()=>[],onSelectionChange(){}});
 let pending=root.StudentPracticeExport.promptForExport();
 els.exportStudentName.value='zs';
 els.exportStudentName.listeners.input();
 assert.ok(els.exportStudentMatches.children.length);
 els.exportStudentMatches.children[0].listeners.click();
 els.exportConfirmStudent.listeners.click();
 const named=await pending;
 assert.equal(named.student.name,'张三');
 assert.equal(named.student.className,'801');
 pending=root.StudentPracticeExport.promptForExport();
 els.exportStudentName.value='王同学';els.exportStudentClass.value='802';
 els.exportStudentName.listeners.input();
 els.exportConfirmStudent.listeners.click();
 const custom=await pending;
 assert.equal(custom.student.name,'王同学');
 pending=root.StudentPracticeExport.promptForExport();
 els.exportGenericWord.listeners.click();
 assert.equal((await pending).mode,'generic');
 pending=root.StudentPracticeExport.promptForExport();
 els.studentNameDialog.listeners.cancel({preventDefault(){}});
 assert.equal(await pending,null);
 const p={bankDetailsButton:element(),bankDetailsPanel:element(),detailKpis:element()};
 p.bankDetailsPanel.hidden=true;
 const appRoot={echarts:{},PhysicsBankDetails:{init(){},update(list){this.count=list.length}}};
 vm.runInNewContext(inline,{window:appRoot,document:{getElementById:id=>p[id]},console},{timeout:1000});
 appRoot.PhysicsBankInlineDetails.init({getQuestions:()=>[{id:'q1'}]});
 await p.bankDetailsButton.listeners.click();
 assert.equal(p.bankDetailsPanel.hidden,false);
 assert.equal(appRoot.PhysicsBankDetails.count,1);
 await p.bankDetailsButton.listeners.click();
 assert.equal(p.bankDetailsPanel.hidden,true);
 console.log('PASS inline topic dashboard + export modal (initials, custom student, generic, cancel)');
})().catch(e=>{console.error(e);process.exitCode=1});
