'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'../question-bank/word-export.js'),'utf8');
const root={};const sandbox={window:root,atob,Uint8Array,Promise,console};
vm.runInNewContext(js,sandbox,{timeout:1500});
assert.ok(root.PhysicsWordExport&&root.PhysicsWordExport.createDocx,'native OOXML exporter exposed');
let exported;
class ZipFake{
  constructor(){this.files=new Map();exported=this}
  file(name,value){this.files.set(name,value);return this}
  async generateAsync(opts){assert.equal(opts.type,'blob');return {size:2200,type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}}
}
const img='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==';
(async()=>{
for(const layout of ['single','double']){
  const blob=await root.PhysicsWordExport.createDocx({JSZip:ZipFake,title:'力学练习',date:'2026-10-10',layout,feedback:true,items:[
    {stem:'力的示意图',answer:'向下的重力',images:[img],answerImages:[img]},
    {stem:'电路连线',answer:'并联电路',images:[],answerImages:[]}
  ]});
  assert.ok(blob.size>500);
  let x=String(exported.files.get('word/document.xml'));
  assert.ok(x.includes('力学练习'), 'document title present');
  assert.ok(x.includes('w:type="page"'),'page break before answers');
  assert.ok(x.includes('参考答案'),'answers present');
  assert.ok(x.includes('完成后勾选'),'student feedback present');
  assert.ok(!x.includes('altChunk'),'no HTML-dependent Word rendering');
  assert.equal((x.match(/<a:blip r:embed=/g)||[]).length,2,'both question and answer embedded');
  assert.ok(exported.files.has('word/media/image1.png'),'question image embedded');
  assert.ok(exported.files.has('word/media/image2.png'),'answer image embedded');
  assert.ok(String(exported.files.get('word/_rels/document.xml.rels')).includes('image2.png'));
  assert.ok(String(exported.files.get('[Content_Types].xml')).includes('image/png'));
  assert.equal((x.match(/<w:tbl>/g)||[]).length,layout==='double'?4:2,'single/double layout table count');
}
await assert.rejects(root.PhysicsWordExport.createDocx({JSZip:ZipFake,items:[]}),/试题篮为空/);
console.log('PASS: OOXML single/double, page break, image relationships, feedback, empty basket');
})().catch(e=>{console.error(e);process.exitCode=1});