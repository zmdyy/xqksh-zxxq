'use strict';
// Private file-in/file-out workflow. Never upload question contents to GitHub.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const [input,baseline,overridesFile,out,additionalFile]=process.argv.slice(2);
if(!out){console.error('Usage: node tools/finalize-private-bank.cjs candidate.json baseline.json verified-overrides.json new-output-dir');process.exit(2);}
fs.mkdirSync(out,{recursive:true});if(fs.existsSync(path.join(out,'bank.json')))throw Error('Output exists; choose a new independent version');
const root=path.join(__dirname,'..'),win={katex:require(path.join(root,'katex.min.js'))},ctx={window:win,console};
for(const p of ['data/knowledge/concept-assessment-data.js','data/knowledge/concept-assessment.js','question-bank/math-content.js','question-bank/quality-diagnostics.js','question-bank/quality-review-v2.js','question-bank/bank-version-update.js'])vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),ctx,{filename:p});
const bank=JSON.parse(fs.readFileSync(input)),old=JSON.parse(fs.readFileSync(baseline)),overrides=JSON.parse(fs.readFileSync(overridesFile)),oldById=new Map(old.questions.map(q=>[q.id,q])),A=win.PhysicsConceptAssessment,R=win.PhysicsQualityReview;
if(additionalFile)for(const q of JSON.parse(fs.readFileSync(additionalFile))){if(bank.questions.some(x=>x.id===q.id))throw Error('Additional source ID already exists');if(!q.rebuildOrigin?.sourceSha256||!q.sourceRefs?.length)throw Error('Additional source has no provenance');bank.questions.push(q);}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),now=new Date().toISOString(),fixes=[],migration=[],mappingReview=[],semanticReview=[];
const candidateVersion=process.env.PHYSICS_BANK_CANDIDATE_VERSION||'physics-bank-2026-10-12-v5-rebuilt-r3';
for(const patch of overrides){
 const q=bank.questions.find(q=>q.id===patch.id);if(!q)throw Error('Missing override ID: '+patch.id);
 for(const field of patch.absentFields||[])if(Object.prototype.hasOwnProperty.call(q,field))throw Error('Expected absent field already exists: '+q.id+'/'+field);
 for(const [field,after] of Object.entries(patch.fields||{})){
  const before=q[field];if(Object.prototype.hasOwnProperty.call(patch.before||{},field)&&JSON.stringify(before)!==JSON.stringify(patch.before[field]))throw Error('Override baseline mismatch: '+q.id+'/'+field);
  if((q.qualityEditHistory||[]).some(h=>Object.prototype.hasOwnProperty.call(h.changes||{},field)))throw Error('Teacher field is protected: '+q.id+'/'+field);
  if(JSON.stringify(before)===JSON.stringify(after))continue;
  q[field]=after;const fix={id:q.id,field,before,after,method:'verified-source-or-physics-semantic-review',basis:patch.basis,at:now,candidateOnly:true};fixes.push(fix);q.qualityFixes=[...(q.qualityFixes||[]),fix];q.revision=(q.revision||1)+1;
 }
}
for(const q of bank.questions){
 // Split questions must receive the same proven math restoration as their parent.
 if(q.parts?.length){
  const markers=[...q.stem.matchAll(/(?:^|\n)\s*[（(](\d{1,2})[）)]/g)];
  const before=JSON.parse(JSON.stringify(q.parts));let partsChanged=false;
  for(const p of q.parts){
   if(p.review==='approved'||p.status==='approved')continue;
   const label=String(p.label||p.id).match(/\d+/)?.[0],hits=markers.filter(m=>m[1]===label);
   if(hits.length!==1)continue;
   const m=hits[0],index=markers.indexOf(m),next=q.stem.slice(m.index,markers[index+1]?.index||q.stem.length).trim();
   const strip=s=>String(s||'').replace(/\\\([\s\S]*?\\\)|⟦嵌入对象\/公式⟧|嵌入对象\/公式/g,'').normalize('NFKC').replace(/\s/g,'');
   if(strip(p.stem)===strip(next)&&p.stem!==next){p.stem=next;partsChanged=true;}
  }
  if(partsChanged){const f={id:q.id,field:'parts',before,after:JSON.parse(JSON.stringify(q.parts)),method:'parent-and-subquestion-math-sync',basis:'相同小问编号及去公式后的文本一致；教师已核查的小问受保护',at:now,candidateOnly:true};q.qualityFixes=[...(q.qualityFixes||[]),f];fixes.push(f);}
 }
 for(const field of ['stem','answer']){
  if((q.qualityEditHistory||[]).some(h=>Object.prototype.hasOwnProperty.call(h.changes||{},field)))continue;
  // Unit powers are dimensional notation, not new numerical values. Preserve equations.
  const before=q[field]||'',ranges=[...before.matchAll(/\\\([\s\S]*?\\\)/g)];let after='',at=0;
  const format=s=>s.replace(/\b(kg\/m|g\/cm|cm|mm|dm|m)([23])\b/g,(_,u,n)=>u+(n==='2'?'²':'³'));
  for(const m of ranges){after+=format(before.slice(at,m.index))+m[0];at=m.index+m[0].length;}after+=format(before.slice(at));
  if(after!==before){q[field]=after;const f={id:q.id,field,before,after,method:'dimensional-unit-power-format',basis:'面积与体积、密度单位的平方和立方格式；不修改数值或已有公式',at:now,candidateOnly:true};fixes.push(f);q.qualityFixes=[...(q.qualityFixes||[]),f];q.revision=(q.revision||1)+1;}
 }
 if(/(?:^|\n)\s*A[．.、]/.test(q.stem)&&/[BCD][．.、]/.test(q.stem)){
  const before=q.stem,after=before.replace(/([^\n])([BCD][．.、])/g,'$1\n$2');
  if(before!==after&&!q.qualityEditHistory?.some(h=>Object.prototype.hasOwnProperty.call(h.changes||{},'stem'))){q.stem=after;const f={id:q.id,field:'stem',before,after,method:'choice-option-line-breaks',basis:'A至D选项分行，避免公式与后一选项标签粘连',at:now,candidateOnly:true};fixes.push(f);q.qualityFixes=[...(q.qualityFixes||[]),f];}
 }
 q.qualityBaseVersion=candidateVersion;
 A.annotate(q);
 const override=overrides.find(o=>o.id===q.id);
 for(const decision of override?.tasks||[]){
  const p=q.knowledgeMappingV1.parts.find(p=>p.part_id===decision.part_id);if(!p)throw Error('Unknown reviewed task: '+q.id+'/'+decision.part_id);
  if(!p.concept_ids.includes(decision.primary_concept_id))throw Error('Reviewed primary not among candidates');
  p.primary_concept_id=decision.primary_concept_id;p.related_concept_ids=p.concept_ids.filter(id=>id!==p.primary_concept_id);p.candidate_concept_ids=[];p.status='mapped';p.confidence='source-reviewed';p.semanticBasis=override.basis;
  if(decision.assessment_ids){for(const id of decision.assessment_ids)if(!A.getCatalog().methods.some(m=>m.id===id))throw Error('Unknown reviewed assessment: '+id);p.assessment_ids=[...new Set([...p.assessment_ids,...decision.assessment_ids])];}
 }
 q.assessment_ids=[...new Set(q.knowledgeMappingV1.parts.flatMap(p=>p.assessment_ids))];
 if(q.knowledgeMappingV1.parts.every(p=>p.primary_concept_id)&&!q.knowledgeMappingV1.unmapped_tags.length)q.knowledgeMappingV1.status='mapped';
 const prior=oldById.get(q.id);
 if(prior){
  const records={};
  for(const [dim,record] of Object.entries(prior.qualityReviewV1||{})){
   const beforeSignature=R.signature(prior,dim),afterSignature=R.signature(q,dim);
   const hasChanged=beforeSignature!==afterSignature;
   let next={...record};
   if(['dismissed','approved','modified'].includes(record.status)){
    // An existing mismatched signature is already stale; never grant it new approval.
    const priorValid=!record.signature||record.signature===beforeSignature;
    if(hasChanged||!priorValid)next={...record,status:'awaitingAcceptance',priorDecision:{...record},lastRepairAt:now,lastRepairVersion:'v5-rebuilt-20261012',signature:afterSignature};
    else next={...record,signature:afterSignature,importedContentSignature:afterSignature};
    migration.push({id:q.id,dim,previous:record.status,status:next.status,beforeSignature,afterSignature,reason:hasChanged?'审核依据内容改变':'原决定与内容一致'});
   }
   records[dim]=next;
  }
  const sourceDuplicate=q.qualityReviewV1?.duplicate;
  q.qualityReviewV1={...q.qualityReviewV1,...records};
  if(q.archivedAsDuplicate?.provenance&&sourceDuplicate?.status==='resolved')q.qualityReviewV1.duplicate=sourceDuplicate;
  for(const field of ['stem','answer'])if(prior[field]!==q[field])q.qualityReviewV1.formula={...(q.qualityReviewV1.formula||{}),status:'awaitingAcceptance',signature:R.signature(q,'formula'),lastRepairAt:now};
  if(prior.answer!==q.answer)q.qualityReviewV1.answer={...(q.qualityReviewV1.answer||{}),status:'awaitingAcceptance',signature:R.signature(q,'answer'),lastRepairAt:now};
 }
 if(q.mathOriginalResourcesV5?.length){
  q.mathImageHistoryV5=q.mathOriginalResourcesV5;
  q.qualityFixes=[...(q.qualityFixes||[]),{kind:'remove-detached-math-images',field:'images',basis:'WMF按占位顺序恢复为内联公式；原图与原件保留在mathImageHistoryV5及资源包中',at:now}];
 }
 for(const part of q.knowledgeMappingV1.parts)if(!part.primary_concept_id)mappingReview.push({id:q.id,source:q.source,sourceNo:q.sourceNo,...part});
 // Find topical omissions without silently turning keyword hits into accepted mappings.
 const text=q.stem+'\n'+q.answer;
 const proposals=[['mech_liquid_pressure',/液体压强|水下\d+|液体内部压强/],['mech_archimedes',/阿基米德|浮力[＝=].*[ρ\\]|排开.*体积/],['mech_balance_forces',/二力平衡|处于平衡状态|匀速下落/],['mech_spring_dynamometer',/弹簧测力计/],['mech_force_interaction',/力的作用是相互的|相互作用力/],['mech_measurement_error',/误差.*减小|测量误差/],['elec_household_wiring',/三孔插座|螺口灯|火线.*开关|开关.*火线/],['elec_semiconductor',/半导体/],['elec_superconductor',/超导/],['micro_universe_structure',/太阳系|银河系/],['micro_nanometer_material',/纳米/],['therm_thermal_conductivity',/导热性|导热性能|导热能力/],['mech_material_elasticity',/弹性限度|恢复原状|弹性.*形变/]];
 const candidates=proposals.filter(([id,re])=>re.test(text)&&!q.concept_ids.includes(id)).map(([id,re])=>({concept_id:id,name:A.getCatalog().concepts.find(c=>c.concept_id===id)?.name,evidence:text.match(re)?.[0]}));
 if(candidates.length)semanticReview.push({id:q.id,source:q.source,sourceNo:q.sourceNo,reason:'原标签可能遗漏情境中的知识点；需区别主考点、背景和选项干扰项',candidates});
}
// Bind every archived pair on BOTH sides, preserving the teacher's original conclusion.
const duplicateArchive=[];
for(const q of bank.questions.filter(q=>q.archivedAsDuplicate)){
 const survivor=bank.questions.find(s=>s.id===q.archivedAsDuplicate.survivorId);if(!survivor)throw Error('Archived survivor missing');
 const pairId=[q.id,survivor.id].sort().join('|'),prior=q.qualityReviewV1?.duplicate;
 const record={pairId,verdict:'same',survivorId:survivor.id,archivedId:q.id,signatures:{[q.id]:R.signature(q,'duplicate'),[survivor.id]:R.signature(survivor,'duplicate')},reviewedAt:prior?.reviewedAt||q.archivedAsDuplicate.at||now,basis:prior?.note||'继承母版可逆归档结论',source:q.archivedAsDuplicate.provenance||'inherited-teacher-archive'};
 q.duplicatePairsV1={...(q.duplicatePairsV1||{}),[pairId]:record};survivor.duplicatePairsV1={...(survivor.duplicatePairsV1||{}),[pairId]:record};duplicateArchive.push(record);
}
// Exact repeated text alone is only a candidate. Require teachers to compare media.
const groups=new Map();for(const q of bank.questions.filter(q=>!q.archivedAsDuplicate)){const k=win.PhysicsQualityDiagnostics.norm(q.stem);if(k.length<12)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(q);}
const duplicateCandidates=[...groups.values()].filter(g=>g.length>1).map(g=>({ids:g.map(q=>q.id),reason:'规范化题干相同；原图、答案、来源仍需比较；未自动归档'}));
bank.parentBankVersion=old.bankVersion;bank.bankVersion=candidateVersion;bank.buildId=bank.bankVersion;bank.exportedAt=now;bank.batch='V5独立重建候选：原件核验与知识点考法映射';bank.description='保留V4、教师修改、归档题和全部原始资源；自动修复及映射仍需教师验收。';bank.activeQuestionCount=bank.questions.filter(q=>!q.archivedAsDuplicate).length;bank.archivedDuplicateCount=bank.questions.length-bank.activeQuestionCount;bank.qualityWorkflow={...bank.qualityWorkflow,questions:bank.questions.length,reviewState:'全量结构审计与风险筛查；待验收和人工清单不代表物理正确性通过'};bank.reviewMigration={records:migration.length,preserved:migration.filter(r=>r.status===r.previous).length,reopened:migration.filter(r=>r.status!==r.previous).length};
const write=(name,x)=>fs.writeFileSync(path.join(out,name),JSON.stringify(x,null,2)+'\n');
write('bank.json',bank);write('verified-overrides-applied.json',fixes);write('review-migration.json',migration);write('mapping-manual-review.json',mappingReview);write('semantic-coverage-review.json',semanticReview);write('duplicate-archive.json',duplicateArchive);write('duplicate-candidates.json',duplicateCandidates);
write('finalize-summary.json',{version:bank.bankVersion,at:now,total:bank.questions.length,active:bank.activeQuestionCount,archived:bank.archivedDuplicateCount,mappingReviewTasks:mappingReview.length,mappingReviewQuestions:new Set(mappingReview.map(x=>x.id)).size,semanticReviewQuestions:semanticReview.length,duplicateCandidateGroups:duplicateCandidates.length,reviewMigration:bank.reviewMigration,sha256:sha(fs.readFileSync(path.join(out,'bank.json')))});
console.log(fs.readFileSync(path.join(out,'finalize-summary.json'),'utf8'));
