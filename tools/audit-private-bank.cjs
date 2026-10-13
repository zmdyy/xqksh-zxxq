'use strict';
// Audit a local, private master without adding its contents to the repository.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const input=process.argv[2],output=process.argv[3];if(!input){console.error('Usage: node tools/audit-private-bank.cjs bank.json [report.json]');process.exit(2);}
const base=path.join(__dirname,'..'),bank=JSON.parse(fs.readFileSync(input)),win={katex:require(path.join(base,'katex.min.js'))};
const warnings=[],errors=[],originalWarn=console.warn;let current;
console.warn=message=>warnings.push({...current,message:String(message)});
try{
 for(const file of ['data/knowledge/concept-assessment-data.js','data/knowledge/concept-assessment.js','question-bank/math-content.js','mathml2omml.js'])vm.runInNewContext(fs.readFileSync(path.join(base,file),'utf8'),{window:win,console});
 const ids=new Set(),concepts=new Set(win.PhysicsConceptAssessment.getCatalog().concepts.map(c=>c.concept_id)),methods=new Set(win.PhysicsConceptAssessment.getCatalog().methods.map(m=>m.id));let mathObjects=0,wordObjects=0,partMathObjects=0,partWordObjects=0;const partMathIssues=[];
 for(const q of bank.questions){
  if(!q.id||ids.has(q.id))errors.push({id:q.id,type:'空题目ID或重复ID'});ids.add(q.id);
  if(q.knowledgeMappingV1?.signature!==win.PhysicsConceptAssessment.digest(q))errors.push({id:q.id,type:'映射内容签名不匹配'});
  for(const id of q.concept_ids||[])if(!concepts.has(id))errors.push({id:q.id,type:'不存在的知识点',concept_id:id});
  for(const id of q.assessment_ids||[])if(!methods.has(id))errors.push({id:q.id,type:'不存在的考法',assessment_id:id});
  for(const field of ['stem','answer']){
   current={id:q.id,field};for(const e of win.PhysicsMathContent.validate(q[field]))errors.push({id:q.id,field,...e});
   for(const token of win.PhysicsMathContent.tokens(q[field]||''))if(token.type==='math'){
    mathObjects++;try{const omml=win.mml2omml(win.PhysicsMathContent.mathml(token.text).replace(/<annotation[\s\S]*?<\/annotation>/g,''));if(!omml.includes('<m:oMath'))throw Error('Missing native math');wordObjects++;}catch(e){errors.push({id:q.id,field,type:'Word公式转换失败',detail:e.message});}
   }
  }
  for(const p of q.parts||[])for(const field of ['stem','answer','sharedContext']){
   current={id:q.id,partId:p.id,field};for(const e of win.PhysicsMathContent.validate(p[field]||''))partMathIssues.push({id:q.id,partId:p.id,field,...e});
   for(const token of win.PhysicsMathContent.tokens(p[field]||''))if(token.type==='math'){
    partMathObjects++;try{const omml=win.mml2omml(win.PhysicsMathContent.mathml(token.text).replace(/<annotation[\s\S]*?<\/annotation>/g,''));if(!omml.includes('<m:oMath'))throw Error('Missing native math');partWordObjects++;}catch(e){partMathIssues.push({id:q.id,partId:p.id,field,type:'Word小问公式转换失败',detail:e.message});}
   }
  }
 }
 for(const q of bank.questions)if(q.archivedAsDuplicate&&!ids.has(q.archivedAsDuplicate.survivorId))errors.push({id:q.id,type:'重复归档保留题不存在'});
 const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const uniqueWarnings=[...new Map(warnings.map(w=>[[w.id,w.field,w.message].join('|'),w])).values()];
 const parts=bank.questions.filter(q=>!q.archivedAsDuplicate).flatMap(q=>(q.knowledgeMappingV1?.parts||[]).map(p=>({id:q.id,...p}))),pending=parts.filter(p=>!p.primary_concept_id);
 const report={at:new Date().toISOString(),bankSha256:sha(input),catalogSha256:sha(path.join(base,'data/knowledge/concept-assessment-catalog.json')),mathModuleSha256:sha(path.join(base,'question-bank/math-content.js')),total:bank.questions.length,active:bank.questions.filter(q=>!q.archivedAsDuplicate).length,archived:bank.questions.filter(q=>q.archivedAsDuplicate).length,taskUnits:parts.length,mathObjects,wordObjects,partMathObjects,partWordObjects,partMathIssues,errors,mappingReviewTasks:pending.length,mappingReviewQuestions:new Set(pending.map(p=>p.id)).size,unmappedTags:[...new Set(bank.questions.flatMap(q=>q.knowledgeMappingV1?.unmapped_tags||[]))],glyphCompatibilityWarnings:uniqueWarnings,warningFields:new Set(uniqueWarnings.map(w=>w.id+'|'+w.field)).size,reviewMigration:bank.reviewMigration};
 if(output)fs.writeFileSync(output,JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,glyphCompatibilityWarnings:undefined}));if(errors.length)process.exitCode=1;
}finally{console.warn=originalWarn;}
