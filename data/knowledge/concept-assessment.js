/* Shared canonical concepts, contextual tasks and non-destructive migration. */
(function(root){
'use strict';
let catalog=root.CONCEPT_ASSESSMENT_CATALOG||{concepts:[],aliases:[],methods:[]},byId,byLabel;
const norm=s=>String(s||'').normalize('NFKC').replace(/[\s，。；:：、,.!?？！“”'"()（）【】]/g,'').toLowerCase();
const unique=a=>Array.from(new Set(a.filter(Boolean)));
function configure(value){catalog=value||catalog;byId=new Map((catalog.concepts||[]).map(c=>[c.concept_id,c]));byLabel=new Map((catalog.concepts||[]).map(c=>[norm(c.name),{source:c.name,concept_ids:[c.concept_id],task:'',basis:'规范知识点名称'}]));for(const a of catalog.aliases||[])byLabel.set(norm(a.source),a);}
function resolve(value){if(!byId)configure();if(byId.has(value))return value;const a=byLabel.get(norm(value));return a?.concept_ids?.length===1?a.concept_ids[0]:null;}
function lookup(label){if(!byLabel)configure();return byLabel.get(norm(label))||null;}
function digest(q){let h=2166136261;const text=JSON.stringify([q.stem,q.tags,(q.parts||[]).map(p=>[p.id,p.stem,p.tags])]);for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36);}
const clues={mech_pitch:/音调|频率|振动快慢/,mech_loudness:/响度|振幅|声音.*大小/,mech_timbre:/音色|声音.*特色/,therm_melting_freezing:/熔化|凝固|熔点|凝固点/,therm_汽化与液化:/汽化|液化|蒸发|沸腾|水蒸气/,therm_升华与凝华:/升华|凝华|霜|干冰/,elec_series_circuit:/串联|同时闭合|依次/,elec_parallel_circuit:/并联|独立工作|分别控制/,elec_series_voltage_rule:/串联|串接/,elec_parallel_voltage_rule:/并联|支路/,elec_series_current_rule:/串联|串接/,elec_parallel_current_rule:/并联|支路/,elec_positive_charge:/正电|失去电子/,elec_negative_charge:/负电|得到电子/,elec_closed_circuit:/通路|正常工作|闭合/,elec_open_circuit:/断路|开路|断开/,elec_short_circuit:/短路/,energy_energy_conversion:/转化|转换/,energy_energy_transfer:/转移|传递/,mech_kinetic_energy:/动能|速度/,mech_potential_energy:/势能|高度|弹性形变/};
function modes(text,type){const out=[];if(/计算|求[：:(（]|求出|多少|至少|最大|最小/.test(text)||type==='计算题')out.push('calculate');if(/画出|作图|连线|补充.*电路|画线|连接.*电路/.test(text)||type==='作图题')out.push('draw');if(/实验|探究|调节|操作|多次测量/.test(text)||type==='实验题')out.push('experiment');if(/图像|图象|表格|数据|图线/.test(text))out.push('graph');if(/估测|估计|约为/.test(text))out.push('estimate');if(/移动|滑片|改变|变化|动态/.test(text))out.push('dynamic');if(/读数|分度值|测量|量程/.test(text))out.push('measure');if(/应用|原理|装置|生活/.test(text))out.push('application');if(!out.length)out.push('identify');return unique(out);}
function annotate(q,options){
 if(!byId)configure();const sig=digest(q);
 if(q.knowledgeMappingV1?.signature===sig&&q.knowledgeMappingV1.catalogVersion===catalog.version)return q;
 if(q.knowledgeMappingV1?.status==='approved'&&!options?.force){q.knowledgeMappingV1={...q.knowledgeMappingV1,status:'stale'};return q;}
 const tags=q.tags||[],unknown=tags.filter(t=>!lookup(t)),wholeIds=unique(tags.flatMap(t=>lookup(t)?.concept_ids||[]));
 let units=(q.parts||[]).filter(p=>p.stem).map(p=>({id:p.id,label:p.label||p.id,stem:p.stem,tags:p.tags}));
 if(!units.length){const re=/(?:^|\n)\s*[（(](\d{1,2})[）)]/g,markers=[...String(q.stem||'').matchAll(re)];
  units=markers.length>1?markers.map((m,i)=>({id:'task-'+m[1],label:'（'+m[1]+'）',stem:q.stem.slice(m.index,markers[i+1]?.index||q.stem.length),context:q.stem.slice(0,markers[0].index)})):[{id:'whole',label:'整题',stem:q.stem||''}];}
 const parts=units.map(u=>{
  const text=String(u.stem||''),sourceTags=u.tags?.length?u.tags:tags,entries=sourceTags.map(lookup).filter(Boolean),declared=unique(entries.flatMap(e=>e.concept_ids||[]));
  let ids=declared.filter(id=>!clues[id]||clues[id].test(text));
  if(!ids.length)ids=declared;
  if(/符合安全用电|安全用电原则/.test(text)&&!(/连接|画线|接入/.test(text)))ids=unique(['elec_安全用电',...ids.filter(id=>id!=='elec_家庭电路')]);
  const uncertain=units.length>1&&!u.tags?.length&&ids.length>1;
  let primary=ids.length===1?ids[0]:null;
  if(!primary&&/符合安全用电|安全用电原则/.test(text)&&ids.includes('elec_安全用电'))primary='elec_安全用电';
  if(!primary){const ranked=ids.map(id=>{const name=byId.get(id)?.name||'',literal=name&&text.includes(name)?3:0,explicit=clues[id]?.test(text)?2:0;return {id,score:literal+explicit};}).sort((a,b)=>b.score-a.score);if(ranked[0]?.score>=3&&ranked[0].score>(ranked[1]?.score||0))primary=ranked[0].id;}
  const assessments=unique([...modes(text,q.type),...entries.filter(e=>e.task&&(!uncertain||e.concept_ids.some(id=>clues[id]?.test(text)||byId.get(id)?.name&&text.includes(byId.get(id).name)))).map(e=>'task:'+e.task)]);
  return {part_id:String(u.id),part_label:u.label,primary_concept_id:primary,related_concept_ids:primary?ids.filter(id=>id!==primary):[],candidate_concept_ids:primary?[]:ids,concept_ids:ids,assessment_ids:assessments,source_tags:sourceTags,basis:entries.map(e=>({source:e.source,concept_ids:e.concept_ids,reason:e.basis})),task_text:text,shared_context:u.context||'',score_eligible:false,status:!primary?'needsReview':'mapped',confidence:ids.length===1?'high':primary?'medium':'low'};
 });
 q.concept_ids=unique([...wholeIds,...parts.flatMap(p=>p.concept_ids)]);
 q.assessment_ids=unique(parts.flatMap(p=>p.assessment_ids));
 q.knowledgeMappingV1={schema:1,catalogVersion:catalog.version,knowledgeDbVersion:catalog.knowledge_db_version,signature:sig,status:unknown.length||parts.some(p=>!p.primary_concept_id)?'needsReview':'mapped',unmapped_tags:unknown,parts,source:'semantic-alias-and-context',scope:'知识归属与考法；不代表物理正确性已验收'};
 return q;
}
function units(q){annotate(q);return q.knowledgeMappingV1?.parts||[];}
function matches(q,filter){const a=resolve(filter.primary)||filter.primary,b=resolve(filter.related)||filter.related,method=filter.assessment||'';const parts=units(q);return parts.some(p=>{
 const ids=p.concept_ids||[],primary=p.primary_concept_id;
 const first=!a||(filter.primaryOnly?primary===a:ids.includes(a));
 const second=!b||(filter.relatedOnly?(p.related_concept_ids||[]).includes(b):ids.includes(b));
 const conceptMatch=filter.relation==='any'&&a&&b?first||second:first&&second;
 return conceptMatch&&(!method||(p.assessment_ids||[]).includes(method));
 });}
function methodNames(ids){return (ids||[]).map(id=>(catalog.methods||[]).find(m=>m.id===id)?.name||id);}
function catalogForConcept(id){return (catalog.methods||[]).filter(m=>!m.concept_ids||m.concept_ids.includes(id));}
function normalizePart(p){return {...p,assessment_ids:unique((p.assessment_ids||[]).filter(id=>(catalog.methods||[]).some(m=>m.id===id)))};}
configure(catalog);root.PhysicsConceptAssessment={configure,resolve,lookup,annotate,units,matches,methodNames,catalogForConcept,normalizePart,digest,getCatalog:()=>catalog};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PhysicsConceptAssessment;
})(typeof window!=='undefined'?window:globalThis);
