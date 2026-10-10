/* 增量题库自动去重：不覆盖教师审核信息、个人导出历史。
 * 仅当规范化完整题干一致、图片数量及内容一致，才确认完全重复。
 * 对变式题保守保留，附人工复核提示。
 */
(function(root){
'use strict';
function normalizeStem(text){
  return String(text||'').replace(/^\s*(?:[（(]多选[）)]\s*)?\d{1,3}[．.、]\s*/,'')
    .replace(/^\s*[（(]\s*\d+分\s*[）)]\s*/,'')
    .replace(/^\s*[（(]20\d{2}[•·—-][^）)]{0,45}[）)]\s*/,'')
    .normalize('NFKC').toLowerCase().replace(/[\s、，。：；,.!?？！“”'"\(\)（）【】]/g,'');
}
function imagesMatch(a,b){
 a=Array.isArray(a)?a:[];b=Array.isArray(b)?b:[];
 if(a.length!==b.length)return false;
 return a.every((x,i)=>{
   const y=b[i];if(!y)return false;
   const aHash=String(x.contentHash||''),bHash=String(y.contentHash||'');
   if(aHash&&bHash&&(aHash===bHash||aHash.startsWith(bHash)||bHash.startsWith(aHash)))return true;
   return !!(x.data&&y.data&&x.data===y.data);
 });
}
function sameQuestion(a,b){
 const an=normalizeStem(a.stem),bn=normalizeStem(b.stem);
 return an===bn&&imagesMatch(a.images,b.images)&&(an.length>10||((a.images||[]).length>0));
}
function mergeExisting(target,source){
 const refs=target.sourceRefs||[{file:target.source,no:target.sourceNo}];
 const keys=new Set(refs.map(r=>r.file+'#'+r.no));
 for(const x of source.sourceRefs||[{file:source.source,no:source.sourceNo}]){
   if(!x.file)continue;
   const key=x.file+'#'+x.no;if(keys.has(key))continue;
   refs.push(x);keys.add(key);
 }
 target.sourceRefs=refs;
 if(!target.answer&&source.answer)target.answer=source.answer;
 if(!target.answerImages?.length&&source.answerImages?.length)target.answerImages=source.answerImages;
 if(!target.tags?.length&&source.tags?.length)target.tags=source.tags.slice();
 if((!target.relation||target.relation==='pending')&&source.relation&&source.relation!=='pending')target.relation=source.relation;
 if(!target.curriculum2022&&source.curriculum2022)target.curriculum2022=source.curriculum2022;
 if(!target.knowledgeReview&&source.knowledgeReview)target.knowledgeReview=source.knowledgeReview;
 if(!target.concept_ids?.length&&source.concept_ids?.length)target.concept_ids=source.concept_ids.slice();
 target.warnings=Array.from(new Set([...(target.warnings||[]),...(source.warnings||[])]));
 return target;
}
async function mergeQuestions(incoming,options){
 const {questions,save,updateConcepts,now,hash}=options;
 const index=new Map(),stats={added:0,merged:0,suspected:0,referenceUpdates:0};
 for(const q of questions){
   let key=normalizeStem(q.stem);if(!index.has(key))index.set(key,[]);index.get(key).push(q);
 }
 for(const item of incoming||[]){
   if(!item||!item.stem)continue;
   item.images=item.images||[];item.answerImages=item.answerImages||[];
   item.tags=item.tags||[];item.sourceRefs=item.sourceRefs||[{file:item.source,no:item.sourceNo}];
   item.review='pending';
   const key=normalizeStem(item.stem),similar=index.get(key)||[];
   const duplicate=similar.find(x=>sameQuestion(x,item));
   if(duplicate){
     mergeExisting(duplicate,item);duplicate.updatedAt=now();
     updateConcepts(duplicate);await save(duplicate);
     stats.merged++;continue;
   }
   if(similar.length){
     item.warnings=Array.from(new Set([...(item.warnings||[]),'相同题干的题图不同，可能是变式题；已保留待教师复核。']));
     stats.suspected++;
   }
   if(questions.some(x=>x.id===item.id))item.id+='-'+hash(item.source+':'+item.sourceNo).slice(0,7);
   updateConcepts(item);await save(item);
   questions.push(item);
   if(!index.has(key))index.set(key,[]);index.get(key).push(item);
   stats.added++;
 }
 for(const update of options.provenanceUpdates||[]){
   const old=questions.find(x=>x.id===update.existingId);
   if(!old)continue;
   mergeExisting(old,{sourceRefs:[update.sourceRef]});old.updatedAt=now();await save(old);
   stats.referenceUpdates++;
 }
 return stats;
}
root.QuestionBankMerge={normalizeStem,imagesMatch,sameQuestion,mergeExisting,mergeQuestions};
})(typeof window!=='undefined'?window:globalThis);
