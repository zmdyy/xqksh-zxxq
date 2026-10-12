'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(root,'.'+u+(u.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.css':'text/css'}[path.extname(file)]||'application/octet-stream'));res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port+'/question-bank/';await page.goto(url);await page.waitForFunction(()=>document.querySelector('#conceptFilter').options.length>200);
  assert.equal(await page.locator('#qualityReviewDialog').isVisible(),false,'closed audit dialog must not occupy the homepage');
  await page.evaluate(()=>new Promise(r=>{const req=indexedDB.open('PhysicsTrainingBankV1');req.onsuccess=()=>{const db=req.result,tx=db.transaction('questions','readwrite');for(const id of ['A','B'])tx.objectStore('questions').put({id,stem:'一个电路实验如图所示，比较接线方法是否正确。',answer:'根据电路接线判断',tags:['电路'],type:'实验题',images:[],answerImages:[],review:'pending',revision:1});tx.oncomplete=()=>{db.close();r()}}}));
  await page.reload();await page.waitForSelector('.qcard');await page.click('#qualityReviewBtn');await page.locator('[data-dim="duplicate"]').click();await page.selectOption('#qrDuplicateVerdict','different');await page.locator('[data-decision="dismissed"]').click();await page.waitForFunction(()=>!document.querySelector('#qrDuplicateVerdict'));
  assert.equal(await page.locator('#qrScope').inputValue(),'risks','resolving a pair must not switch to all questions');
  await page.click('#qrClose');await page.reload();await page.waitForSelector('.qcard');await page.click('#qualityReviewBtn');await page.locator('[data-dim="duplicate"]').click();assert.equal(await page.locator('#qrDuplicateVerdict').count(),0,'resolved pair stays out of the attention queue after reload');await page.click('#qrClose');
  const updateResult=await page.evaluate(async()=>{
   const R=PhysicsQualityReview,png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==';
   let current=[{id:'format',stem:'重力G1',answer:'2N',tags:[],type:'填空题',review:'pending',revision:1,images:[],answerImages:[],qualityReviewV1:{formula:{status:'dismissed',reviewedAt:'2026-10-12'}}},{id:'media',stem:'原图保持一致',answer:'正确',tags:[],type:'作图题',review:'approved',revision:1,images:[{data:png,contentHash:'0123456789abcdef'}],answerImages:[],qualityReviewV1:{image:{status:'approved'}}},{id:'protected',stem:'教师手动修订',answer:'正确',tags:[],type:'填空题',review:'approved',revision:1,images:[],answerImages:[]}];
   current[1].qualityReviewV1.image.signature=R.signature(current[1],'image');
   const incoming=structuredClone(current);Object.assign(incoming[0],{stem:'重力G₁',revision:2,qualityFixes:[{field:'stem',before:'重力G1'}],qualityReviewV1:{formula:{status:'awaitingAcceptance'}}});incoming[1].images=[{ref:'media/same.png',contentHash:'f'.repeat(64)}];incoming[2].stem='与教师修改冲突';incoming[2].revision=2;
   const zip=new JSZip();zip.file('bank.json',JSON.stringify({format:'physics-training-bank-v1',bankVersion:'physics-bank-2026-10-12-v5',questions:incoming}));zip.file('media/same.png',png.split(',')[1],{base64:true});const file=new File([await zip.generateAsync({type:'blob'})],'V5.zip');
   const db=await new Promise(r=>{const req=indexedDB.open('PhysicsTrainingBankV1');req.onsuccess=()=>r(req.result)});
   const options={db,getQuestions:()=>current,setQuestions:q=>{current=q},getSetting:async()=>''};
   const first=await PhysicsBankVersionUpdate.update(file,options),after=structuredClone(current),second=await PhysicsBankVersionUpdate.update(file,options);db.close();return {first,second,after};
  });
  assert.equal(updateResult.first.updated,1);assert.equal(updateResult.first.conflicts,1);assert.equal(updateResult.second.updated,0,'repeat import must not reopen completed content repairs');assert.equal(updateResult.second.metadataSynced,0);
  const media=updateResult.after.find(q=>q.id==='media');assert.equal(media.review,'approved');assert.equal(media.qualityReviewV1.image.status,'approved');assert.ok(media.images[0].data.startsWith('data:image/png'));
  assert.equal(updateResult.after.find(q=>q.id==='format').qualityReviewV1.formula.status,'awaitingAcceptance');assert.equal(updateResult.after.find(q=>q.id==='protected').stem,'教师手动修订');assert.deepEqual(errors,[]);
  console.log('PASS: hidden audit dialog, persistent pair resolution, no repeated prompt, decoded media hash migration, protected teacher content and idempotent ZIP update');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
