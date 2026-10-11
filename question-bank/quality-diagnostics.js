/* 可追溯的规则诊断：只对明确命中的片段定位。不能定位时明确标记未定位。 */
(function(root){
'use strict';
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/[，。；:：、,.!?？！“”'"()（）【】]/g,'');
function issue(id,dim,type,location,evidence,detail,source,start,end){
 return {id,dim,type,location,evidence,detail,source:source||'',start:Number.isInteger(start)?start:null,end:Number.isInteger(end)?end:null,precision:Number.isInteger(start)?'exact':'unlocated'};
}
function scan(q,options){
 const issues=[],tags=q.tags||[],stem=String(q.stem||''),answer=String(q.answer||''),ids=new Set();
 function add(dim,type,location,evidence,detail,source,from,to){
  const key=[dim,type,location,from].join('|');if(ids.has(key))return;ids.add(key);
  issues.push(issue(q.id+':'+issues.length,dim,type,location,evidence,detail,source,from,to));
 }
 const checks=[
  {regex:/⟦[^⟧\n]{0,150}⟧|OLE(?:公式|对象|Object)?|公式占位(?:符)?|嵌入对象|\uFFFD/g,type:'公式占位或乱码',basis:'命中明确的占位/乱码标记，需对照原Word核对'},
  {regex:/[=＝]\s*(?:[；;。]|$)/gm,type:'疑似算式缺失',basis:'等号后紧接结束符号，可能是公式提取不完整'}
 ];
 for(const [key,text] of [['stem',stem],['answer',answer]]){
  for(const rule of checks){rule.regex.lastIndex=0;let m,count=0;
   while((m=rule.regex.exec(text))&&count++<6){
    const prefix=text.slice(0,m.index),section=(prefix.match(/[（(]\s*\d{1,2}\s*[）)]/g)||[]).slice(-1)[0];
    const where=(key==='stem'?'题干':'答案')+(section?' · '+section:'')+' · 字符'+(m.index+1)+'附近';
    add('formula',rule.type,where,rule.basis,m[0],key,m.index,m.index+m[0].length);
    if(rule.regex.lastIndex===m.index)rule.regex.lastIndex++;
   }
  }
 }
 if(/如图|图甲|图乙|图丙|下图|图示/.test(stem)&&!(q.images||[]).length){
  const m=/如图|图甲|图乙|图丙|下图|图示/.exec(stem);
  add('image','疑似缺少题图','题干 · 字符'+(m.index+1),'题干引用图片，但题干图资源为空','请对照原卷，确认是否缺图','stem',m.index,m.index+m[0].length);
 }
 for(const [side,name] of [['images','题干图'],['answerImages','答案图']]){
  (q[side]||[]).forEach((im,i)=>{
   if(im.repair?.candidateData&&im.repair?.status!=='approved'&&im.repair?.status!=='rejected')
    add('image','图片修复候选待确认',name+' · 图'+(i+1),'存在候选增强图，尚未确认是否忠实原图','需核对刻度、符号、结构及文字','',null,null);
  });
 }
 if(!answer.trim()&&!(q.answerImages||[]).length)add('answer','缺少答案','答案区','答案文本和答案图均为空','需对照标准答案补全','',null,null);
 if(!tags.length)add('knowledge','知识点缺失','知识点','题目标签列表为空','应根据整题主要考查任务标注','',null,null);
 else if(options?.catalogByName instanceof Map&&options.catalogByName.size){
  const unknown=tags.filter(t=>!options.catalogByName.has(norm(t)));
  if(unknown.length)add('knowledge','知识图谱映射不完整','知识点','无法按名称映射：'+unknown.join('、'),'属于标签对齐问题，不等于物理知识点错误','',null,null);
 }
 if(q.typeAudit20261011?.needsManualReview&&!q.typeAudit20261011?.teacherReview?.status)
  add('type','题型分类待核验','主类型','此前规则检测标记为人工复核候选','需按整道题主任务和次级考法确认','',null,null);
 const dup=options?.duplicates?.get(q.id);
 if(dup?.length)add('duplicate','疑似重复题','题干及题图','规范化题干与'+dup.length+'道题相同，尚未比较图片、答案和数值','只有逐项核对后才能判定真正重复','',null,null);
 if(!issues.some(x=>x.dim==='formula')&&q.hasMath&&/[=＝]/.test(stem+' '+answer))
  add('formula','数学内容需要抽查','题干与解析','题库原始记录带有数学公式标记，常规规则未精确定位异常','仅规则怀疑，尚未定位','',null,null);
 return issues;
}
function byDim(issues,dim){return dim==='overview'?issues:issues.filter(x=>x.dim===dim)}
function markText(text,issues,source,escape){
 const list=issues.filter(i=>i.source===source&&i.precision==='exact').sort((a,b)=>a.start-b.start);
 let result='',at=0;
 for(const it of list){
  if(it.start<at||it.end>text.length)continue;
  result+=escape(text.slice(at,it.start));
  result+='<mark class="qr-highlight" title="'+escape(it.type+'：'+it.evidence)+'" data-issue="'+escape(it.id)+'">'+escape(text.slice(it.start,it.end))+'</mark>';
  at=it.end;
 }
 return result+escape(text.slice(at));
}
root.PhysicsQualityDiagnostics={scan,byDim,markText,norm};
})(typeof window!=='undefined'?window:globalThis);