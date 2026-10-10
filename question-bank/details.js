/* 题库统计：只读取本地题目，不加载学生姓名/分数，不上传网络 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const TYPES=['选择题','填空题','实验题','作图题','计算题','综合题','其他'];
const LEVELS=['容易','普通','困难','未评定'];
const TYPE_COLORS=['#356fac','#2a9c99','#db9743','#785fab','#e47678','#769365','#a1acb9'];
const LEVEL_COLORS=['#53ac8a','#ecad53','#d77773','#b9c3cc'];
let charts={},allRows=[],scopeQuestions=[],lastApi=null,started=false;
function norm(x){return String(x||'').trim().toLowerCase().replace(/[\s/]+/g,'')}
function pick(q,kind){return kind==='type'?(TYPES.includes(q.type)?q.type:'其他'):(['容易','普通','困难'].includes(q.difficulty)?q.difficulty:'未评定')}
function questionTags(q,api){
 const result=[];
 const knownById=api.catalogById||new Map(),knownByName=api.catalogByName||new Map();
 for(const id of q.concept_ids||[]){
   const hit=knownById.get(id);if(hit&&hit.name)result.push({name:hit.name,module:hit.module||'知识图谱',id});
 }
 for(const tag of q.tags||[]){
   const name=String(tag).trim();if(!name)continue;
   const inGraph=knownByName.get(norm(name))||knownByName.get(name);
   const actual=inGraph?.name||name;
   result.push({name:actual,module:inGraph?.module||'其他已标注',id:inGraph?.concept_id||''})
 }
 // Some older JSON records have concept_ids but empty tags; both are counted once per skill.
 const seen=new Set();
 return result.filter(x=>{const k=norm(x.name);if(seen.has(k))return false;seen.add(k);return true});
}
function compute(questions,api){
 const scoped=Array.isArray(questions)?questions:[];
 const stats=new Map();
 let untagged=0;
 for(const q of scoped){
   const tags=questionTags(q,api);
   if(!tags.length){untagged++;continue}
   for(const t of tags){
     const key=norm(t.name);let entry=stats.get(key);
     if(!entry){entry={name:t.name,module:t.module,concept_id:t.id,count:0,type:{},difficulty:{},ids:[]};stats.set(key,entry)}
     entry.count++;entry.ids.push(q.id);
     const type=pick(q,'type'),difficulty=pick(q,'difficulty');
     entry.type[type]=(entry.type[type]||0)+1;
     entry.difficulty[difficulty]=(entry.difficulty[difficulty]||0)+1;
   }
 }
 const rows=Array.from(stats.values()).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'zh-CN'));
 const types=TYPES.map(name=>({name,value:scoped.filter(q=>pick(q,'type')===name).length})).filter(x=>x.value);
 const levels=LEVELS.map(name=>({name,value:scoped.filter(q=>pick(q,'difficulty')===name).length})).filter(x=>x.value);
 return {total:scoped.length,approved:scoped.filter(q=>q.review==='approved').length,untagged,concepts:rows.length,rows,types,levels,multi:scoped.filter(q=>questionTags(q,api).length>=2).length};
}
function chart(id){if(!root.echarts||!$(id))return null;charts[id]=charts[id]||root.echarts.init($(id));return charts[id]}
function showPie(id,data,colors){
 const instance=chart(id);if(!instance)return;
 instance.setOption({
   color:colors,
   tooltip:{trigger:'item',formatter:'{b}：{c} 道（{d}%）'},
   legend:{bottom:0,type:'scroll',textStyle:{fontSize:11}},
   graphic:data.length?[]:[{type:'text',left:'center',top:'40%',style:{text:'暂无数据',fill:'#8b9cad',fontSize:13}}],
   series:[{type:'pie',radius:['45%','68%'],center:['50%','41%'],avoidLabelOverlap:true,
     itemStyle:{borderColor:'#fff',borderWidth:2},
     label:{show:false},emphasis:{label:{show:true,formatter:'{b}\n{c} 道',fontSize:13}},
     data:data.length?data:[]
   }]
 },true);
}
function paintStack(rows,mode){
 const el=$('detailConceptChart'),inst=chart('detailConceptChart');if(!el||!inst)return;
 const top=$('detailTop').value,shown=top==='all'?rows:rows.slice(0,Number(top));
 const labels=(mode==='type'?TYPES:LEVELS);
 const colors=(mode==='type'?TYPE_COLORS:LEVEL_COLORS);
 const series=labels.map((name,i)=>({name,type:'bar',stack:'总数',barWidth:16,
   itemStyle:{color:colors[i],borderRadius:0},
   data:shown.map(r=>r[mode][name]||0),emphasis:{focus:'series'}
 }));
 const height=Math.max(300,shown.length*30+95);
 el.style.height=height+'px';inst.resize();
 inst.setOption({
   animationDuration:350,color:colors,
   grid:{left:175,right:35,top:45,bottom:43},
   tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:params=>{
     const row=shown[params[0]?.dataIndex];if(!row)return '';
     return '<strong>'+row.name+'</strong> · 共'+row.count+'道<br>'+
       params.filter(p=>p.value).map(p=>p.marker+p.seriesName+'：'+p.value+'道').join('<br>')
   }},
   legend:{type:'scroll',top:2,textStyle:{fontSize:11}},
   xAxis:{type:'value',minInterval:1,axisLabel:{fontSize:11}},
   yAxis:{type:'category',inverse:true,data:shown.map(x=>x.name),axisLabel:{fontSize:12,width:155,overflow:'truncate'}},
   series
 },true);
 inst.off('click');inst.on('click',e=>{
   const row=shown[e.dataIndex];if(row)focus(row);
 });
}
function focus(row){
 if(!lastApi)return;
 lastApi.focusConcept(row.name);
 $('results')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function rowHtml(r){
 const type=TYPES.slice(0,6).map(t=>'<td>'+(r.type[t]||0)+'</td>').join('');
 const diff=LEVELS.map(l=>'<td>'+(r.difficulty[l]||0)+'</td>').join('');
 return '<tr><td><button class="detail-concept-link" data-concept="'+encodeURIComponent(r.name)+'">'+escapeText(r.name)+'</button><small>'+escapeText(r.module)+'</small></td><td><strong>'+r.count+'</strong></td>'+type+diff+'</tr>';
}
function escapeText(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function paintTable(rows){
 const word=norm($('detailSearch').value);
 const list=rows.filter(r=>!word||norm(r.name).includes(word)||norm(r.module).includes(word));
 const shown=list.slice(0,250);
 $('detailConceptRows').innerHTML=shown.length?shown.map(rowHtml).join(''):'<tr><td colspan="12" style="text-align:center;padding:20px">没有匹配的知识点</td></tr>';
 $('detailFoot').textContent='显示'+shown.length+'/'+list.length+'个知识点。各知识点关联题量可重复计数；选择、填空、实验、作图、计算、综合按原题类型统计，难度未知记为“未评定”。';
}
function update(questions,api){
 lastApi=api;
 const scope=$('detailScope').value;
 scopeQuestions=(questions||[]).filter(q=>scope!=='approved'||q.review==='approved');
 const r=compute(scopeQuestions,api);allRows=r.rows;
 $('detailKpis').innerHTML=[
   ['实际大题',r.total],['有知识点标签',r.total-r.untagged],['待标注',r.untagged],
   ['覆盖知识点',r.concepts],['多知识点大题',r.multi],['教师已审核',r.approved]
 ].map(([k,v])=>'<div class="detail-kpi"><small>'+k+'</small><b>'+v+'</b></div>').join('');
 paintStack(allRows,$('detailMetric').value);showPie('detailTypeChart',r.types,TYPE_COLORS);showPie('detailDifficultyChart',r.levels,LEVEL_COLORS);paintTable(allRows);
}
function init(api){
 if(started)return;started=true;
 lastApi=api;
 for(const id of ['detailScope','detailMetric','detailTop'])$(id)?.addEventListener('change',()=>update(api.getQuestions(),api));
 $('detailSearch')?.addEventListener('input',()=>paintTable(allRows));
 $('detailToggle')?.addEventListener('click',()=>{
   const content=$('detailContent'),open=!content.hidden;content.hidden=open;
   $('detailToggle').textContent=open?'展开明细':'收起明细';$('detailToggle').setAttribute('aria-expanded',String(!open));
   if(!open)requestAnimationFrame(()=>Object.values(charts).forEach(c=>c.resize()));
 });
 $('detailReset')?.addEventListener('click',()=>api.resetFilters());
 $('detailConceptRows')?.addEventListener('click',e=>{
   const btn=e.target.closest('[data-concept]');if(!btn)return;
   const row=allRows.find(r=>r.name===decodeURIComponent(btn.dataset.concept));if(row)focus(row)
 });
 root.addEventListener?.('resize',()=>Object.values(charts).forEach(x=>x.resize()));
}
root.PhysicsBankDetails={init,update,compute,questionTags};
})(typeof window!=='undefined'?window:globalThis);
