/* 一次选择ZIP后自动完成更新；IndexedDB事务保证不会出现半更新；保留旧题差异快照。 */
(function(root){
'use strict';
const now=()=>new Date().toISOString();
function plain(q){return [q.stem||'',q.answer||'',q.type||'',JSON.stringify(q.tags||[]),q.relation||''].join('\u001d')}
function mediaFingerprint(q){return ['images','answerImages'].map(k=>(q[k]||[]).map(i=>i.contentHash?'hash:'+i.contentHash:(i.ref?'unverified':'unverified')).join(';')).join('|')}
function decodedMediaEqual(a,b){
 for(const side of ['images','answerImages']){
  const x=a[side]||[],y=b[side]||[];if(x.length!==y.length)return false;
  for(let i=0;i<x.length;i++){
   const ax=x[i],by=y[i];
   if(ax.contentHash&&by.contentHash&&ax.contentHash!==by.contentHash)return false;
   if(ax.data&&by.data&&ax.data!==by.data)return false;
   if((ax.repair?.status||'')!==(by.repair?.status||''))return false;
   if((ax.repair?.candidateData||'')!==(by.repair?.candidateData||'')&&
      (ax.repair?.candidateData||by.repair?.candidateData))return false;
  }
 }
 return true;
}

function isNewer(ver,prior){
 const a=String(ver||'').match(/20\d{2}[-_]?(\d{2})[-_]?(\d{2})/),b=String(prior||'').match(/20\d{2}[-_]?(\d{2})[-_]?(\d{2})/);
 if(!a||!b)return true;
 const n=x=>Number(x[0].match(/\d{4}/)[0])*10000+Number(x[1])*100+Number(x[2]);
 return n(a)>=n(b);
}
function preserve(old,incoming,changed){
 const q={...incoming};
 // 不丢教师的历史记录、使用标记以及修复前的原图。模型修复涉及字段时不继承旧的“已通过”结论。
 q.qualityReviewV1={...(incoming.qualityReviewV1||{}),...(old.qualityReviewV1||{})};
 q.qualityReviewEventsV2=[...(old.qualityReviewEventsV2||[])];
 for(const evt of incoming.qualityReviewEventsV2||[]){
  if(!q.qualityReviewEventsV2.some(x=>x.id===evt.id))q.qualityReviewEventsV2.push(evt);
 }
 q.qualityEditHistory=[...(old.qualityEditHistory||[])];
 q.typeAudit20261011={...(incoming.typeAudit20261011||{}),...(old.typeAudit20261011||{})};
 if(old.review==='approved'&&changed)q.review='pending';
 else if(old.review==='approved')q.review='approved';
 if(!changed)q.review=old.review||q.review;
 if(old.parts?.length&&!q.parts?.length)q.parts=old.parts;
 for(const side of ['images','answerImages']){
   if(!(q[side]||[]).length&&(old[side]||[]).length)q[side]=old[side];
   else (q[side]||[]).forEach((im,i)=>{if(old[side]?.[i]?.repair?.status==='approved'&&im.repair?.status!=='approved')q[side][i]=old[side][i]});
 }
 if(old.difficulty&&!q.difficulty)q.difficulty=old.difficulty;
 q.sourceRefs=Array.from(new Map([...(incoming.sourceRefs||[]),...(old.sourceRefs||[])].map(x=>[(x.file||'')+'#'+(x.no||''),x])).values());
 q.qualityBaseVersion=incoming.qualityBaseVersion||old.qualityBaseVersion||'';
 if(changed){
  const review={...q.qualityReviewV1};
  const isChanged={formula:old.stem!==q.stem||old.answer!==q.answer,answer:old.answer!==q.answer||mediaFingerprint({answerImages:old.answerImages})!==mediaFingerprint({answerImages:q.answerImages}),image:mediaFingerprint(old)!==mediaFingerprint(q),knowledge:JSON.stringify(old.tags||[])!==JSON.stringify(q.tags||[])||old.relation!==q.relation,type:old.type!==q.type,duplicate:old.stem!==q.stem};
  for(const d of Object.keys(isChanged)){
   if(!isChanged[d])continue;
   const previous=review[d]||{};
   if(previous.status==='repair'||previous.status==='modified'||previous.status==='approved'||previous.status==='dismissed'){
    review[d]={...previous,status:'awaitingAcceptance',lastRepairAt:now(),lastRepairVersion:q.qualityBaseVersion};
   }
  }
  q.qualityReviewV1=review;
  q.qualityRepairNotice={at:now(),changedFields:Object.keys(isChanged).filter(k=>isChanged[k]),baseRevision:old.revision||1,newRevision:q.revision||1};
 }
 return q;
}
function compare(current,payload){
 const existing=new Map(current.map(q=>[q.id,q])),updates=[],added=[],conflicts=[];
 for(const next of payload){
  if(!next?.id||!next.stem)continue;
  const old=existing.get(next.id);
  if(!old){added.push(next);continue}
  const changed=plain(old)!==plain(next)||mediaFingerprint(old)!==mediaFingerprint(next)||Number(next.revision||1)>Number(old.revision||1)||Boolean(next.qualityFixes?.length);
  if(!changed){ // no substantive changes; add only new metadata, preserving human review
   continue;
  }
  const newRev=Number(next.revision||1),oldRev=Number(old.revision||1);
  const isRepair=Array.isArray(next.qualityFixes)&&next.qualityFixes.length>0;
  if((newRev>oldRev||isRepair)&&old.review!=='approved'){
   updates.push({previous:old,next:preserve(old,next,true)});
  }else{
   conflicts.push({id:old.id,oldRevision:oldRev,newRevision:newRev,reason:old.review==='approved'?'人工整题审核受保护':'新版修订版本号不足以安全覆盖'});
  }
 }
 return {updates,added,conflicts};
}
function transactionApply(db,data,version,base){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['questions','settings'],'readwrite');
  const qs=tx.objectStore('questions'),settings=tx.objectStore('settings');
  for(const q of data.added)qs.put(q);
  for(const u of data.updates)qs.put(u.next);
  const checkpoint={at:now(),from:base||'',to:version,
   updated:data.updates.map(u=>{
    const old=u.previous,cur=u.next;
    // 同图只备份文字/元数据，防止复制整套200MB题图导致本地容量耗尽。
    const mediaChanged=!decodedMediaEqual(old,cur);
    const fields={stem:old.stem,answer:old.answer,type:old.type,tags:old.tags,relation:old.relation,
      revision:old.revision,updatedAt:old.updatedAt,review:old.review,qualityReviewV1:old.qualityReviewV1,
      concept_ids:old.concept_ids,typeAudit20261011:old.typeAudit20261011};
    if(mediaChanged){fields.images=old.images;fields.answerImages=old.answerImages}
    return {id:old.id,fields,imageBackedUp:mediaChanged};
   }),
   addedIds:data.added.map(q=>q.id)};
  settings.put({id:'bankRollbackV2',value:checkpoint});
  settings.put({id:'bankVersionV2',value:version});
  settings.put({id:'bankUpdateConflictsV2',value:data.conflicts});
  tx.oncomplete=()=>resolve(checkpoint);
  tx.onabort=()=>reject(tx.error||Error('空间不足，已自动回滚。'));
  tx.onerror=()=>{}; // let transaction abort propagate
 });
}
async function decode(zip,questions){
 const cached=new Map();
 async function media(ref){
  if(!ref)return '';
  if(cached.has(ref))return cached.get(ref);
  const item=zip.file(ref);if(!item)throw Error('题图缺失：'+ref);
  const ext=ref.split('.').pop().toLowerCase();
  const mime={jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',svg:'image/svg+xml',emf:'application/x-emf',wmf:'application/x-wmf'}[ext]||'image/png';
  const data='data:'+mime+';base64,'+await item.async('base64');cached.set(ref,data);return data;
 }
 for(const q of questions){
  for(const side of ['images','answerImages'])for(const im of q[side]||[]){
   if(im.ref&&!im.data){im.data=await media(im.ref);delete im.ref}
   if(!im.repair)continue;
   for(const [refKey,dataKey] of [['candidateRef','candidateData'],['originalRef','originalData'],['alternativeCandidateRef','alternativeCandidateData'],['previewPngRef','previewPngData'],['legacyCandidateRef','legacyCandidateData']]){
    if(im.repair[refKey]&&!im.repair[dataKey])im.repair[dataKey]=await media(im.repair[refKey]);
   }
  }
 }
}
async function update(file,options){
 if(!root.JSZip)throw Error('JSZip未加载');
 const zip=await root.JSZip.loadAsync(await file.arrayBuffer());
 const entry=zip.file('bank.json');if(!entry)throw Error('这不是标准题库ZIP：缺少bank.json');
 const bank=JSON.parse(await entry.async('text'));
 if(bank.format!=='physics-training-bank-v1'||!Array.isArray(bank.questions))throw Error('题库格式不匹配，已停止更新');
 if(!bank.questions.length)throw Error('题库为空，已停止更新');
 const idSet=new Set();
 for(const q of bank.questions){if(!q.id||idSet.has(q.id))throw Error('题库包含空或重复的题目ID，已停止更新：'+q.id);idSet.add(q.id)}
 // bank.version=1 是JSON格式版本，不是题库批次。使用明确批次ID或文件名+内容校验码。
 const rawInfo=[file.name,bank.questions.length,bank.exportedAt||''].join('|');
 let fingerprint=2166136261;for(let i=0;i<rawInfo.length;i++){fingerprint^=rawInfo.charCodeAt(i);fingerprint=Math.imul(fingerprint,16777619)}
 const version=String(bank.bankVersion||bank.buildId||(file.name+'#'+(fingerprint>>>0).toString(36))).slice(0,150);
 const base=await options.getSetting('bankVersionV2')||'';
 if(base&&!isNewer(version,base))throw Error('所选题库版本可能早于现有版本，自动取消覆盖。现有：'+base+'；导入：'+version);
 let records=compare(options.getQuestions(),bank.questions);
 // 只解压将要写入的题图，原有未修改题不再反复加载，减少大型ZIP处理内存。
 const applyList=[...records.added,...records.updates.map(u=>u.next)];
 await decode(zip,applyList);
 // 修改是否仅为题图，在载入后再作正式比较，防止误报
 const previous=new Map(options.getQuestions().map(q=>[q.id,q]));
 records.updates=records.updates.filter(u=>plain(u.previous)!==plain(u.next)||!decodedMediaEqual(u.previous,u.next)).map(u=>({...u,next:preserve(u.previous,u.next,true)}));
 const applied=await transactionApply(options.db,records,version,base);
 const merged=new Map(options.getQuestions().map(q=>[q.id,q]));
 for(const q of records.added)merged.set(q.id,q);
 for(const u of records.updates)merged.set(u.next.id,u.next);
 options.setQuestions(Array.from(merged.values()));
 options.onChange?.();
 return {version,previous:base,added:records.added.length,updated:records.updates.length,conflicts:records.conflicts.length,conflictIds:records.conflicts.slice(0,20).map(c=>c.id),snapshotChanges:applied.updated.length};
}
root.PhysicsBankVersionUpdate={compare,preserve,update,isNewer};
})(typeof window!=='undefined'?window:globalThis);