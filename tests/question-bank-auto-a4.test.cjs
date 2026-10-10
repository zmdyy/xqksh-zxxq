'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../question-bank/app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../question-bank/index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../question-bank/style.css'),'utf8');
for(const label of ['检索与筛选','题目资源','试题篮','组卷设置'])assert.ok(html.includes(label));
for(const name of ['basket-section','layout-decision','usage-section','workflow-heading'])assert.ok(html.includes(name));
assert.match(css,/\.workspace\{grid-template-columns/);
const modified=src.replace(/init\(\);\s*\}\)\(\);\s*$/,'window.__test={state,showPreview,exportWord,buildPages,inspectPageFit};})();');
assert.notEqual(modified,src);
class StubBlob{constructor(){this.size=2048}}
let isDouble=false,exported=[],clicks=0;
const content=(bottom)=>({classList:{contains:()=>false},getBoundingClientRect:()=>({top:80,bottom,left:70,right:530,height:bottom-80}),clientWidth:100,scrollWidth:100});
const elements={};
function generic(){return {value:'',dataset:{},style:{},textContent:'',checked:false,open:false,disabled:false,
 addEventListener(){},removeAttribute(){},click(){clicks++},showModal(){this.open=true},
 classList:{toggle(){},remove(){}},querySelectorAll(){return[]},scrollIntoView(){},getBoundingClientRect(){return{top:0,bottom:1120,left:0,right:700,height:1120}}}}
for(const id of ['layout','feedback','answerMode','previewDialog','printPreview','previewFront','previewBack','previewStatus','layoutDecision','wordBtn','previewExportBtn','wordDownloadLink','previewDownloadLink','status'])elements[id]=generic();
elements.layout.value='auto';elements.feedback.checked=true;elements.answerMode.value='back';
let currentHtml='';
Object.defineProperty(elements.printPreview,'innerHTML',{get:()=>currentHtml,set(value){currentHtml=value;isDouble=value.includes('questions double')}});
elements.printPreview.querySelectorAll=()=>[];
for(const id of ['previewFront','previewBack']){
 const sheet=elements[id];
 sheet.querySelector=selector=>selector==='.foot'?{getBoundingClientRect:()=>({top:970,bottom:1000})}:null;
 sheet.querySelectorAll=selector=>selector==='img'?[]:[content(isDouble?830:1050),content(isDouble?850:1060)];
}
const window={StudentPracticeExport:{getSelection:()=>null,isStudentMode:()=>false,promptForExport:async()=>({mode:'generic',student:null})},
 PhysicsWordExport:{async createDocx(options){exported.push(options.layout);return new StubBlob()}}};
let index=0;
vm.runInNewContext(modified,{window,document:{getElementById:id=>elements[id]},Blob:StubBlob,console,confirm:()=>true,
 URL:{createObjectURL:()=>('blob:test-'+ ++index),revokeObjectURL(){}}
},{timeout:1000});
window.__test.state.questions=[{id:'q1',stem:'图像作图题',answer:'参考答案',type:'作图题',review:'approved',images:[],answerImages:[],revision:1}];
window.__test.state.basket=['q1'];
(async()=>{
 const result=await window.__test.showPreview();
 assert.equal(result.layout,'double','auto switches to double if single overflows');
 assert.equal(window.__test.state.preview.layout,'double');
 assert.equal(elements.previewStatus.dataset.overflow,'no');
 assert.match(elements.layoutDecision.textContent,/已切换为双栏/);
 await window.__test.exportWord();
 assert.deepEqual(exported,['double'],'DOCX uses the preview-selected double columns');
 assert.equal(clicks,1);
 elements.layout.value='single';
 const single=await window.__test.showPreview();
 assert.equal(single.layout,'single','explicit single layout must not silently switch');
 assert.equal(elements.previewStatus.dataset.overflow,'yes');
 const before=exported.length;
 await window.__test.exportWord();
 assert.equal(exported.length,before,'failed manual A4 fit prevents Word export');
 console.log('PASS: four workflow areas, measured single-to-double fallback, DOCX matches preview, manual overflow blocked');
})().catch(e=>{console.error(e);process.exitCode=1});
