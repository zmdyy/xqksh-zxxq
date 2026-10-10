'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const bank=fs.readFileSync(path.join(__dirname,'../question-bank/bank-merge.js'),'utf8');
const charts=fs.readFileSync(path.join(__dirname,'../question-bank/details.js'),'utf8');
const root={};const ctx={window:root,console};vm.runInNewContext(bank,ctx,{timeout:1000});vm.runInNewContext(charts,ctx,{timeout:1000});
const merge=root.QuestionBankMerge,detail=root.PhysicsBankDetails;
function q(id,stem,images=[],tags=[],type='选择题',difficulty=''){
 return {id,stem,images,answer:'',tags,type,difficulty,source:id+'.docx',sourceNo:'1',sourceRefs:[{file:id+'.docx',no:'1'}],review:'pending'};
}
(async()=>{
 const existing=[q('old','若温度为20℃，求物体的比热容',[{contentHash:'aaa111'}],['比热容'],'计算题','普通')];
 const batch=[
  q('copy','若温度为20℃，求物体的比热容',[{contentHash:'aaa111'}],['比热容'],'计算题','普通'),
  q('variation','若温度为20℃，求物体的比热容',[{contentHash:'different'}],['比热容'],'计算题','困难'),
  q('number','若温度为30℃，求物体的比热容',[{contentHash:'aaa111'}],['比热容'],'计算题','普通'),
  q('fresh','测量声音的响度',[],['声音的响度','声现象'],'选择题','容易'),
 ];
 let saved=[],rev=0;
 const stats=await merge.mergeQuestions(batch,{
   questions:existing,save:async o=>{saved.push(o.id)},now:()=>String(++rev),
   hash:x=>String(x.length),updateConcepts:()=>{}
 });
 assert.equal(stats.added,3,'only exact duplicate merged');
 assert.equal(stats.merged,1);
 assert.equal(stats.suspected,1);
 assert.equal(existing.length,4);
 assert.equal(existing[0].sourceRefs.length,2);
 assert.equal(existing[0].review,'pending');
 const result=detail.compute(existing,{catalogById:new Map(),catalogByName:new Map()});
 assert.equal(result.total,4);
 assert.equal(result.multi,1);
 const sound=result.rows.find(x=>x.name==='声音的响度');
 assert.equal(sound.count,1);
 assert.equal(sound.type['选择题'],1);
 assert.equal(sound.difficulty['容易'],1);
 const heat=result.rows.find(x=>x.name==='比热容');
 assert.equal(heat.count,3);
 assert.equal(heat.difficulty['普通'],2);
 assert.equal(heat.difficulty['困难'],1);
 assert.equal(result.untagged,0);
 assert.equal(result.types.reduce((a,b)=>a+b.value,0),4,'unique q totals not inflated by multi tags');
 assert.equal(merge.normalizeStem('1．（3分）相同题干'),merge.normalizeStem('相同题干'));
 console.log('PASS: exact dedup, variant protection, provenance, concept tags, type and difficulty aggregations');
})().catch(e=>{console.error(e);process.exitCode=1});
