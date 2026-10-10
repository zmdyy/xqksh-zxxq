'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..');
const common=fs.readFileSync(path.join(base,'student-name-search.js'),'utf8');
const source=fs.readFileSync(path.join(base,'question-bank/app.js'),'utf8');
const root={pinyinPro:{pinyin(name){return ({
 '张三':['zhang','san'],'王善嘉':['wang','shan','jia'],
 '李言':['li','yan']
})[name]||[name]}}};
vm.runInNewContext(common,{window:root,console},{timeout:1000});
const matcher=root.StudentNameSearch;
const xs=[matcher.indexStudent({name:'张三',class:'801'}),matcher.indexStudent({name:'王善嘉',class:'801'}),matcher.indexStudent({name:'李言',class:'802'})];
assert.equal(matcher.search(xs,'zs')[0].displayName,'张三');
assert.equal(matcher.search(xs,'wangshanjia')[0].displayName,'王善嘉');
assert.equal(matcher.search(xs,'ly')[0].className,'802');
assert.equal(matcher.search(xs,'李')[0].displayName,'李言');
assert.equal(matcher.search(xs,'unknown').length,0);
const patched=source.replace(/init\(\);\s*\}\)\(\);\s*$/,'window.__test={state,buildPages,exportWord,setDB:x=>db=x,invalidateWordDownload};})();');
assert.notEqual(patched,source,'browser startup removed');
class MockBlob{constructor(){this.size=3051}}
let downloads=0,historyRenders=0,generateCount=0;
const elems={
 layout:{value:'single'},feedback:{checked:true},answerMode:{value:'back'},
 status:{className:'',textContent:''},
 previewStatus:{dataset:{overflow:'no'},style:{},textContent:''},
 wordBtn:{disabled:false},previewExportBtn:{disabled:false},
 wordDownloadLink:{style:{},click(){downloads++},removeAttribute(){delete this.href}},
 previewDownloadLink:{style:{},removeAttribute(){delete this.href}}
};
const choice={key:'801\u001f张三\u001f张三',name:'张三',rawName:'张三',className:'801'};
let studentMode=true;
root.StudentPracticeExport={
 isStudentMode:()=>studentMode,
 getSelection:()=>studentMode?choice:null,
 renderHistory(){historyRenders++}
};
root.PhysicsWordExport={async createDocx(){generateCount++;return new MockBlob()}};
const document={getElementById:id=>elems[id]};
const urls={createObjectURL:()=>('blob:test-'+generateCount),revokeObjectURL(){}};
vm.runInNewContext(patched,{window:root,document,Blob:MockBlob,URL:urls,console,confirm:()=>true},{timeout:1200});
let txn;
const fakeDB={transaction(){txn={oncomplete:null,onerror:null,objectStore(){return {put(){Promise.resolve().then(()=>txn.oncomplete?.())}}}};return txn}};
root.__test.setDB(fakeDB);
const part={id:'1',label:'(1)',sharedContext:'已知条件',stem:'正确画出光路',answer:'正确光路',verifiedImages:true,imageIndexes:[],answerImageIndexes:[]};
root.__test.state.questions=[{id:'Q101',sourceNo:'10',source:'试卷一.docx',stem:'已知条件',answer:'全部答案',type:'作图题',parts:[part],review:'approved',images:[],answerImages:[],revision:3}];
root.__test.state.basket=['Q101::1'];
(async()=>{
root.__test.state.preview=root.__test.buildPages();
await root.__test.exportWord();
assert.equal(downloads,1);assert.equal(generateCount,1);
assert.match(elems.wordDownloadLink.download,/^801_张三_物理精准练习_\d{4}-\d{2}-\d{2}\.docx$/);
let ev=root.__test.state.events[0];
assert.equal(ev.kind,'student-word-export');assert.equal(ev.student.name,'张三');
assert.equal(ev.student.className,'801');assert.equal(ev.items[0].id,'Q101::1');assert.equal(ev.items[0].revision,3);
assert.equal(ev.items[0].partLabel,'(1)');
assert.ok(historyRenders>0);
root.__test.invalidateWordDownload();assert.equal(elems.wordDownloadLink.style.display,'none');
choice.className='802';choice.key='802\u001f张三\u001f张三';
root.__test.state.preview=root.__test.buildPages();
await root.__test.exportWord();
assert.equal(root.__test.state.events.length,2);assert.equal(root.__test.state.events[1].student.className,'802');
studentMode=false;
root.__test.state.preview=root.__test.buildPages();
await root.__test.exportWord();
assert.equal(root.__test.state.events.length,2,'generic export does not create student record');
console.log('PASS: Chinese/full/initials search, class-disambiguated filename, exact subquestion history, generic export');
})().catch(e=>{console.error(e);process.exitCode=1});
