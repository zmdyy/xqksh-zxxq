/* 单个轻量 XLSX：待修复、教师修改、已排除，只有变化元数据，无整题图像。 */
(function(root){
'use strict';
const columns=[
 ['待修复',['事件ID','题目ID','题库版本','题目版本','审核项目','异常位置','异常类型','判断依据','可定位片段','教师备注','记录时间']],
 ['教师修改',['事件ID','题目ID','题库版本','题目版本','修改字段','原内容','新内容','记录时间']],
 ['已排除',['事件ID','题目ID','题库版本','题目版本','审核项目','异常位置','异常类型','排除依据/教师备注','记录时间']]
];
const xml=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
 .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
function gather(questions,ledger,baseVersion){
 const seen=new Set(ledger||[]),sheets=[[],[],[]],keys=[];
 function emit(sheet,id,values){if(seen.has(id))return;sheets[sheet].push([id,...values]);keys.push(id)}
 for(const q of questions||[]){
  const source=String(q.qualityBaseVersion||baseVersion||'未设置母版版本');
  const version=String(q.revision||1);
  for(const ev of q.qualityReviewEventsV2||[]){
   const id=ev.id||[q.id,ev.dim,ev.action,ev.at].join('|');
   if(ev.action==='repair'){
    emit(0,id,[q.id,source,version,ev.dim||'',ev.location||'',ev.type||'',ev.evidence||'',ev.snippet||'',ev.note||'',ev.at||'']);
   }else if(ev.action==='dismissed'){
    emit(2,id,[q.id,source,version,ev.dim||'',ev.location||'',ev.type||'',ev.note||ev.evidence||'',ev.at||'']);
   }
  }
  for(const edit of q.qualityEditHistory||[]){
   const changes=edit.changes||{};
   const prev=edit.before||{};
   const fields=Object.keys(changes).length?Object.keys(changes):(['stem','answer','tags','type','relation'].filter(k=>JSON.stringify(prev[k])!==JSON.stringify(q[k])));
   for(const k of fields){
    const id=[q.id,edit.at,k].join('|');
    const nv=Object.prototype.hasOwnProperty.call(changes,k)?changes[k]:q[k],ov=prev[k];
    if(JSON.stringify(nv)===JSON.stringify(ov))continue;
    emit(1,id,[q.id,source,version,k,Array.isArray(ov)?ov.join('；'):ov||'',Array.isArray(nv)?nv.join('；'):nv??'',edit.at||'']);
   }
  }
 }
 return {sheets,keys,count:keys.length};
}
function sheetXml(title,headers,rows){
 const all=[headers,...rows],rangeCol=headers.length;
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
 let out='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
 '<sheetFormatPr defaultRowHeight="17"/><cols>';
 for(let i=0;i<rangeCol;i++)out+='<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(i===0?22:i===1?20:(headers[i].includes('内容')||headers[i].includes('依据')||headers[i].includes('备注')?45:25))+'" customWidth="1"/>';
 out+='</cols><sheetData>';
 for(let r=0;r<all.length;r++){
  out+='<row r="'+(r+1)+'">';
  for(let c=0;c<all[r].length;c++){
   const value=xml(all[r][c]),ref=col(c)+(r+1);
   out+='<c r="'+ref+'" t="inlineStr"'+(r===0?' s="1"':'')+'><is><t xml:space="preserve">'+value+'</t></is></c>';
  }
  out+='</row>';
 }
 out+='</sheetData><autoFilter ref="A1:'+col(rangeCol-1)+Math.max(1,all.length)+'"/></worksheet>';
 return out;
}
async function create(questions,ledger,baseVersion){
 if(!root.JSZip)throw Error('页面没有加载JSZip，无法生成Excel');
 const data=gather(questions,ledger,baseVersion);
 if(!data.count)return {...data,blob:null};
 const zip=new root.JSZip();
 zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?>'+
 '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
 columns.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>');
 zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+
 columns.map(([name],i)=>'<sheet name="'+xml(name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>');
 zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+columns.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+'<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
 zip.file('xl/styles.xml','<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/></font><font><b/><sz val="11"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>');
 columns.forEach(([name,headers],i)=>zip.file('xl/worksheets/sheet'+(i+1)+'.xml',sheetXml(name,headers,data.sheets[i])));
 return {...data,blob:await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}})};
}
root.PhysicsQualityExport={gather,create};
})(typeof window!=='undefined'?window:globalThis);