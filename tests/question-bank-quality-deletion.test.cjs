'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'../question-bank/app.js'),'utf8');
const from=app.indexOf('async function removeExcludedQuestions(ids){');
const to=app.indexOf('\nasync function importPrivateZip(',from);
assert.ok(from>=0&&to>from);
const extracted=app.slice(from,to);
const q1={id:'ole1',review:'pending'},q2={id:'draw2',review:'pending'},q3={id:'teacher',review:'approved'};
const state={questions:[q1,q2,q3,{id:'good',review:'pending'}],
 basket:['ole1','draw2::1','teacher','good'],
 events:[{id:'existing',items:[{id:'ole1'}]}]};
const deleted=[];let renders=0,invalidates=0;
const context={state,del:async(_,id)=>{deleted.push(id)},confirm:()=>true,render:()=>{renders++},invalidateWordDownload:()=>{invalidates++}};
const execute=vm.runInNewContext(extracted+'\nremoveExcludedQuestions',{...context},{timeout:1000});
(async()=>{
 const result=await execute(['ole1','draw2','teacher','does-not-exist']);
 assert.equal(result.removed,2);
 assert.equal(result.protected,1);
 assert.deepEqual(deleted.sort(),['draw2','ole1']);
 assert.deepEqual(state.questions.map(q=>q.id),['teacher','good']);
 assert.deepEqual(state.basket,['teacher','good']);
 assert.equal(state.events[0].items[0].id,'ole1','do not rewrite historical assignment');
 assert.equal(renders,1);assert.equal(invalidates,1);
 console.log('PASS: vetted tombstones delete pending questions, preserve approved item and actual assignment history');
})().catch(e=>{console.error(e);process.exitCode=1});
