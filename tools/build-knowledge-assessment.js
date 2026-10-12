/* Reproducible shared concept/task catalog. No private questions are committed. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'../data/knowledge');
const db=JSON.parse(fs.readFileSync(path.join(dir,'知识点数据库.json'),'utf8'));
const oldCatalog=JSON.parse(fs.readFileSync(path.join(dir,'exam-annotation-catalog.json'),'utf8'));
const version='2.6',date='2026-10-12';
const additions=[
 ['mech_measurement_error','测量误差','力学','机械运动','测量值与真实值之间的差异。误差不能完全消除，多次测量求平均值等方法可减小误差；错误操作属于错误。',['mech_length_measure','mech_time_measure']],
 ['mech_volume_measurement','体积测量','力学','质量与密度','用量筒测量液体体积，视线与凹液面最低处相平；用排液法测不溶于液体且能浸没的固体体积。',['mech_length_measure']],
 ['mech_spring_dynamometer','弹簧测力计','力学','力','在弹性限度内，弹簧伸长量与所受拉力成正比。使用时检查量程、分度值和零点，拉力沿弹簧轴线，读数时视线正对刻度。',['mech_force_elastic']],
 ['mech_force_interaction','力的相互作用','力学','力','物体间力的作用是相互的。一对相互作用力大小相等、方向相反、作用在不同物体上，同时产生和消失。',['mech_force_concept']],
 ['mech_motion_relativity','运动和静止的相对性','力学','机械运动','运动或静止是相对于所选参照物而言的；同一物体相对于不同参照物可以有不同的运动状态。',['mech_motion_reference']],
 ['elec_household_wiring','家庭电路接线规则','电磁学','电功率','用电器和插座并联；开关串联在火线与被控制用电器之间。螺口灯座中心触点经开关接火线，螺纹接零线；三孔插座按左零右火上接地连接。',['elec_家庭电路','elec_安全用电','elec_parallel_circuit']],
 ['elec_semiconductor','半导体','电磁学','电流与电路','半导体的导电能力介于导体和绝缘体之间，并可随温度、光照或掺杂等条件改变；可用于二极管、光敏和热敏器件。',['elec_导体与绝缘体']],
 ['elec_superconductor','超导体','电磁学','电流与电路','某些材料在特定条件下电阻降为零，称为超导现象；超导应用需要满足材料和温度等条件。',['elec_resistance']],
 ['therm_material_states','物质的三态','热学','物态变化','固态通常有一定形状和体积，液态通常有一定体积而无固定形状，气态通常没有固定形状和体积；状态变化伴随吸热或放热。',['therm_物质的构成']],
 ['micro_universe_structure','宇宙的层次结构','跨学科支撑','物质与宇宙','地球属于太阳系，太阳系属于银河系。认识宇宙中天体及其层次关系，并区分宏观宇宙与微观物质结构。',[]],
 ['micro_nanometer_material','纳米材料','跨学科支撑','物质与材料','纳米是长度单位，1 nm=10⁻⁹ m。纳米尺度材料的部分性质可与宏观材料不同，应结合具体材料和应用讨论。',['therm_物质的构成','math_unit_conversion']],
 ['mech_material_elasticity','物质的弹性','力学','力','物体受力时发生形变，撤去力后能够恢复原状，这种物理属性称为弹性。超过弹性限度可能不能完全恢复；应区分材料的弹性、弹性形变和形变产生的弹力。',['therm_material_states']],
 ['therm_thermal_conductivity','导热性','热学','内能','导热性描述材料通过热传导传递热量的能力。比较材料导热性能时应控制形状尺寸、温差等条件；导热快慢不等于吸收相同热量后温度变化大小，不能与比热容混淆。',['therm_热传递']]
];
const added=[];
for(const [id,name,module,chapter,definition,prerequisites] of additions){
 if(db.data.some(n=>n.id===id))continue;
 const parent=db.data.find(n=>n.id===prerequisites[0]);
 db.data.push({id,name,module,chapter,node_type:'core',difficulty:1,grade:8,core_definition:definition,formula:'无',units:'',history:{},key_experiments:[],applications:[],common_mistakes:[],exam_points:{frequency:2,question_types:['选择题','填空题']},prerequisites,follow_ups:[],parallels:[],cross_module:[],cross_disciplinary:[],tags:[],x:(parent?.x||0)+12,y:(parent?.y||0)-18,z:(parent?.z||0)+18+added.length*4,size:8,color:'',brightness:1,star_level:2,coverageAudit:{at:date,basis:'课程知识结构与题库语义覆盖复核'}});added.push(id);
}
for(const id of ['micro_atomic_structure','energy_efficiency']){const n=db.data.find(n=>n.id===id);if(n){n.node_type='core';n.annotation_enabled=true;}}
const float=db.data.find(n=>n.id==='mech_float_sink_condition');
if(float)float.core_definition='浸没物体所受浮力大于、等于、小于重力时，分别上浮、悬浮、下沉；漂浮时浮力等于重力。对不吸液、不透液且可用整体平均密度描述的物体，可结合物体与液体密度比较判断最终状态。';
db.version=version;db.update_date=date;db.total_count=db.data.length;
const write=(name,obj)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(obj,null,2)+'\n');
write('知识点数据库.json',db);fs.writeFileSync(path.join(dir,'knowledge-db.js'),'window.KNOWLEDGE_DB = '+JSON.stringify(db,null,2)+';\n');
const conn=JSON.parse(fs.readFileSync(path.join(dir,'关联连线数据库.json'),'utf8'));
const edgeKeys=new Set(conn.data.map(e=>e.from+'|'+e.to+'|'+e.type));
for(const id of additions.map(x=>x[0])){const n=db.data.find(x=>x.id===id);for(const from of n.prerequisites){const key=from+'|'+id+'|prerequisite';if(!edgeKeys.has(key)){conn.data.push({from,to:id,type:'prerequisite',color:'',width:2,strength:3});edgeKeys.add(key);}}}
const universe=db.data.find(n=>n.id==='micro_universe_structure');
if(universe&&!universe.prerequisites.length){universe.prerequisites=['energy_solar_energy'];conn.data.push({from:'energy_solar_energy',to:universe.id,type:'prerequisite',color:'',width:2,strength:2});}
conn.version=version;conn.update_date=date;conn.total_count=conn.data.length;write('关联连线数据库.json',conn);fs.writeFileSync(path.join(__dirname,'../knowledge/关联连线数据库.js'),'window._CONN_DATA = '+JSON.stringify(conn,null,2)+';\n');
write('知识点数据库.json',db);fs.writeFileSync(path.join(dir,'knowledge-db.js'),'window.KNOWLEDGE_DB = '+JSON.stringify(db,null,2)+';\n');
const excluded=new Set((oldCatalog.excluded_from_annotation||[]).map(x=>x.concept_id));
const concepts=db.data.filter(n=>!excluded.has(n.id)&&(!n.node_type||n.node_type==='core')).map(n=>({concept_id:n.id,name:n.name,module:n.module||'',chapter:n.chapter||'',description:n.core_definition||'',formula:n.formula==='无'?'':n.formula||'',symbol:n.symbol||''}));
const catalog={...oldCatalog,knowledge_db_version:version,updated_at:date,concept_count:concepts.length,concepts};
write('exam-annotation-catalog.json',catalog);
for(const file of ['diagnostic-question-bank.json']){const j=JSON.parse(fs.readFileSync(path.join(dir,file)));j.knowledge_db_version=version;write(file,j);}
const diagPath=path.join(__dirname,'../knowledge/诊断题库.js');
if(fs.existsSync(diagPath))fs.writeFileSync(diagPath,fs.readFileSync(diagPath,'utf8').replace(/"knowledge_db_version":\s*"2\.[456]"/g,'"knowledge_db_version": "'+version+'"'));
const specs=fs.readFileSync(path.join(__dirname,'knowledge-tag-aliases.tsv'),'utf8').trim().split('\n').filter(x=>x&&!x.startsWith('#')).map(line=>{const [source,ids,task,basis]=line.split('\t');return {source,concept_ids:(ids||'').split(',').filter(Boolean),task:task||'',basis:basis||'依据概念定义与任务边界对应'};});
const taskDefs=[['identify','概念与规则辨析'],['calculate','数值计算'],['draw','作图与连接'],['experiment','实验操作与探究'],['graph','图像与数据分析'],['estimate','估测与量级判断'],['dynamic','条件变化分析'],['measure','仪器读数与测量'],['application','情境与装置应用'],['method','科学探究方法']].map(([id,name])=>({id,name}));
const methods=new Map(taskDefs.map(x=>[x.id,x]));
for(const s of specs)if(s.task)methods.set('task:'+s.task,{id:'task:'+s.task,name:s.task,concept_ids:s.concept_ids});
const out={schema:'concept-assessment-catalog',schema_version:1,knowledge_db_version:version,version:'20261012-rebuilt-v2',concepts,aliases:specs,methods:[...methods.values()],coverage:{added:additions.map(x=>x[0]),enabledExisting:['micro_atomic_structure','energy_efficiency'],definitionRepairs:['mech_float_sink_condition'],source:'https://www.ictr.edu.cn/download_center/ywjy/p/1.html',additionalEvidence:{clause:'1.2.1',printedPage:10,pdfPage:17,concepts:['mech_material_elasticity','therm_thermal_conductivity']}}};
write('concept-assessment-catalog.json',out);fs.writeFileSync(path.join(dir,'concept-assessment-data.js'),'window.CONCEPT_ASSESSMENT_CATALOG = '+JSON.stringify(out)+';\n');
console.log(JSON.stringify({nodes:db.data.length,concepts:concepts.length,aliases:specs.length,methods:methods.size,added}));
