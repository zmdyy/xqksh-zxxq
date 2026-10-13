'use strict';
const assert=require('assert/strict');
global.katex=require('../katex.min.js');const M=require('../question-bank/math-content.js'),P=require('../question-bank/physics-input.js');
for(const p of P.presets)assert.doesNotThrow(()=>M.mathml(p.tex),p.label);
assert.ok(P.presets.some(p=>p.label==='J/(kg·℃)'));
assert.ok(!P.presets.some(p=>p.label==='J/(kg·K)'||p.label==='电加热综合计算'));
assert.equal(P.scan('型号 AF1X，题号123，单位 kg/m³，公式 \\(F_1=2\\)').length,0);
assert.deepEqual(P.scan('F1，cm3，kg/m3，J/kg℃，Q吸').map(x=>x.after),['\\(F_{1}\\)','cm³','kg/m³','J/(kg·℃)','\\(Q_{\\text{吸}}\\)']);
console.log('PASS: all presets parse, thermal exclusions, conservative suggestions and no mutation');

const vm=require('vm'),fs=require('fs'),path=require('path');
const win={katex:global.katex,JSZip:require('../jszip.min.js'),PhysicsMathContent:M};
for(const f of ['mathml2omml.js','question-bank/word-export.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),{window:win,console,Uint8Array,atob,Blob});
(async()=>{const blob=await win.PhysicsWordExport.createDocx({items:P.presets.map(p=>({stem:p.label+'：\\('+p.tex+'\\)',answer:'',images:[],answerImages:[]})),feedback:false});const z=await win.JSZip.loadAsync(await blob.arrayBuffer()),xml=await z.file('word/document.xml').async('string');assert.ok(xml.includes('<m:oMath'));assert.ok(!xml.includes('\\frac'));console.log('PASS: every preset converts to native Word equations')})().catch(e=>{console.error(e);process.exitCode=1});
