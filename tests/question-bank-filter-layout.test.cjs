'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../question-bank');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert.doesNotMatch(html,/教师选题 · 一页练习 · 背面答案 · 本地保存/);
assert.doesNotMatch(html,/本页面在浏览器本地解析和保存教师上传的题目/);
assert.match(html,/<section class="bank-query-panel"/);
assert.match(html,/class="bank-query-main"/);
assert.match(html,/class="bank-query-fields bank-query-knowledge"/);
assert.match(html,/class="bank-query-fields bank-query-conditions"/);
assert.match(css,/\.bank-query-panel/);
assert.match(css,/@media\(max-width:650px\)/);
const ids=['search','fileInput','conceptFilter','conceptFilter2','relationFilter','typeFilter','difficultyFilter','reviewFilter','usedFilter','classFilter','resetFiltersBtn','activeFilterSummary'];
for(const id of ids){
 const count=(html.match(new RegExp('id="'+id+'"','g'))||[]).length;
 assert.equal(count,1,id+' appears exactly once');
}
const patched=app.replace(/init\(\);\s*\}\)\(\);\s*$/,'window.__filterTest={matches,renderActiveFilters,resetQuestionFilters,state};})();');
assert.notEqual(patched,app,'suppress init');
const els={};
for(const id of ids)els[id]={value:'',tagName:(id==='classFilter'||id==='search')?'INPUT':'SELECT',options:[],selectedIndex:0,innerHTML:'',textContent:'',hidden:true};
for(const id of ['count','results','basketCount','basket','usageSummary','status'])els[id]={innerHTML:'',textContent:'',className:''};
els.relationFilter.value='any';els.classFilter.value='801';
const win={};
vm.runInNewContext(patched,{window:win,document:{getElementById:id=>els[id]},console},{timeout:1000});
const api=win.__filterTest;
const q={id:'q1',stem:'根据光的反射定律作图',source:'试卷',sourceNo:'1',
 tags:['光的反射定律','平面镜成像'],type:'作图题',difficulty:'普通',review:'approved',relation:'cross',images:[],parts:[]};
api.state.questions=[q];
els.conceptFilter.value='光的反射定律';
els.relationFilter.value='cross';
assert.ok(api.matches(q),'cross relation works with one selected concept');
assert.ok(!api.matches({...q,relation:'parallel'}),'parallel question is not cross');
els.conceptFilter2.value='平面镜成像';els.relationFilter.value='both';
assert.ok(api.matches(q),'both concepts match');
assert.ok(!api.matches({...q,tags:['光的反射定律']}),'both concepts required');
els.relationFilter.value='any';els.typeFilter.value='实验题';
assert.ok(!api.matches(q),'type filter works');
els.typeFilter.value='';els.difficultyFilter.value='普通';
assert.ok(api.matches(q),'difficulty filter works');
api.renderActiveFilters();
assert.equal(els.activeFilterSummary.hidden,false);
assert.match(els.activeFilterSummary.innerHTML,/主要知识点/);
api.resetQuestionFilters();
for(const id of ids.filter(x=>!['fileInput','resetFiltersBtn','activeFilterSummary'].includes(x))){
 const expected=id==='classFilter'?'801':id==='relationFilter'?'any':'';
 assert.equal(els[id].value,expected,id+' reset');
}
console.log('PASS: no top disclaimer, grouped filters, concept relations, active chips, reset');
