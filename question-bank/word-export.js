/* 纯浏览器原生 OOXML 组卷：不使用 HTML altChunk / TikZ / 外部API。
 * 数据来自教师本机 IndexedDB；图片真正嵌入 DOCX，不依赖网页路径。
 */
(function(root){
'use strict';
const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PICREL=REL+'/image';
const DRAW='http://schemas.openxmlformats.org/drawingml/2006/main';
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const escapeXml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const uncode=v=>v.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g,'');
function textRun(s,bold=false,size=21){
  return '<w:r><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/>'+(bold?'<w:b/>':'')+'<w:sz w:val="'+size+'"/></w:rPr><w:t xml:space="preserve">'+escapeXml(uncode(s))+'</w:t></w:r>';
}
function paragraph(text,opts={}){
 const align=opts.align?'<w:jc w:val="'+opts.align+'"/>':'';
 const space='<w:spacing w:before="'+(opts.before||0)+'" w:after="'+(opts.after??100)+'" w:line="330" w:lineRule="auto"/>';
 const pPr='<w:pPr>'+align+space+(opts.keep?'<w:keepNext/>':'')+'</w:pPr>';
 const runs=String(text??'').split('\n').map((line,i)=>(i?'<w:r><w:br/></w:r>':'')+textRun(line,opts.bold,opts.size||21)).join('');
 return '<w:p>'+pPr+runs+'</w:p>';
}
function spacer(points=100){return '<w:p><w:pPr><w:spacing w:after="'+points+'"/></w:pPr></w:p>'}
function pageBreak(){return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'}
function smallTable(rows,width=10080){
 const widths=rows[0]?.length===2?[Math.floor(width/2),Math.ceil(width/2)]:[width];
 const cells=rows.map(row=>'<w:tr>'+row.map((t,i)=>{
 const cell=paragraph(t,{size:17,after:35});
 return '<w:tc><w:tcPr><w:tcW w:w="'+widths[i]+'" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="4" w:color="AAAAAA"/><w:left w:val="single" w:sz="4" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="4" w:color="AAAAAA"/><w:right w:val="single" w:sz="4" w:color="AAAAAA"/></w:tcBorders><w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr>'+cell+'</w:tc>'
 }).join('')+'</w:tr>').join('');
 return '<w:tbl><w:tblPr><w:tblW w:w="'+width+'" w:type="dxa"/><w:tblBorders><w:insideH w:val="single" w:sz="4" w:color="AAAAAA"/><w:insideV w:val="single" w:sz="4" w:color="AAAAAA"/></w:tblBorders></w:tblPr><w:tblGrid>'+widths.map(w=>'<w:gridCol w:w="'+w+'"/>').join('')+'</w:tblGrid>'+cells+'</w:tbl>';
}
function colsTable(left,right){
 const cell=(content,width)=>'<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/><w:tcMar><w:left w:w="130" w:type="dxa"/><w:right w:w="130" w:type="dxa"/></w:tcMar></w:tcPr>'+content+paragraph('',{after:0})+'</w:tc>';
 return '<w:tbl><w:tblPr><w:tblW w:w="10080" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:insideV w:val="single" w:sz="4" w:color="DDDDDD"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="5040"/><w:gridCol w:w="5040"/></w:tblGrid><w:tr>'+cell(left,5040)+cell(right,5040)+'</w:tr></w:tbl>'
}
function bytesFromData(src){
 const m=/^data:(image\/(?:png|jpeg|jpg|gif|svg\+xml));base64,([\s\S]+)$/i.exec(src||'');
 if(!m)throw Error('存在无法嵌入 Word 的图片（需要 PNG/JPEG/GIF/SVG data URI），请检查题图。');
 if(typeof atob!=='function')throw Error('浏览器缺少图片解码能力。');
 const raw=atob(m[2].replace(/\s/g,'')),b=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);
 return {mime:m[1].toLowerCase(),bytes:b};
}
function dimensions(src){
 if(typeof Image==='undefined')return Promise.resolve({w:800,h:400});
 return new Promise(resolve=>{
   const img=new Image();
   img.onload=()=>resolve({w:img.naturalWidth||800,h:img.naturalHeight||400});
   img.onerror=()=>resolve({w:800,h:400});
   img.src=src;
 });
}
async function svgToPng(src){
 if(typeof document==='undefined')throw Error('SVG图片需要浏览器canvas渲染');
 const d=await dimensions(src),canvas=document.createElement('canvas');
 canvas.width=Math.min(2400,Math.max(800,d.w*2));
 canvas.height=Math.min(1800,Math.max(400,d.h*2));
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('不能创建图片转换画布');
 const img=new Image();
 await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('SVG图片解析失败'));img.src=src});
 ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 return canvas.toDataURL('image/png');
}
function pictureXml(relId,idx,cx,cy){
 const xfrm='<a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm>';
 return '<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="'+idx+'" name="题图 '+idx+'"/><a:graphic xmlns:a="'+DRAW+'"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="题图"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="'+relId+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr>'+xfrm+'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}
async function createDocx(options){
 const zipLib=options.JSZip||root.JSZip;
 if(!zipLib)throw Error('JSZip 未加载，请刷新页面后重试。');
 const zip=new zipLib(),rels=[],types=new Set(),items=options.items||[];
 if(!items.length)throw Error('试题篮为空');
 let imageId=0,docPr=0;
 async function addImages(images,limitInches,limitHeight){
   let xml='';
   for(let src of images||[]){
     if(!src)continue;
     let parsed=bytesFromData(src);
     if(parsed.mime==='image/svg+xml'){src=await svgToPng(src);parsed=bytesFromData(src)}
     const ext=parsed.mime==='image/jpeg'||parsed.mime==='image/jpg'?'jpg':parsed.mime==='image/gif'?'gif':'png';
     const name='image'+(++imageId)+'.'+ext;
     zip.file('word/media/'+name,parsed.bytes);
     types.add(ext);
     const rid='rId'+(imageId+1);
     rels.push({id:rid,target:'media/'+name});
     let size=await dimensions(src),w=Math.max(1,size.w),h=Math.max(1,size.h);
     let inches=Math.min(limitInches,w/96),hi=inches*(h/w);
     if(hi>limitHeight){hi=limitHeight;inches=hi*w/h}
     const cx=Math.max(95000,Math.round(inches*914400)),cy=Math.max(95000,Math.round(hi*914400));
     xml+=pictureXml(rid,++docPr,cx,cy);
   }
   return xml;
 }
 async function renderItem(item,num,isAnswer,width){
   const q=isAnswer?item.answer:item.stem;
   let x=paragraph(num+'. '+(q|| (isAnswer?'答案待核对':'题干缺失')),{after:100,size:21,bold:false});
   x+=await addImages(isAnswer?item.answerImages:item.images,width,width===3.0?1.95:2.65);
   return x+spacer(70);
 }
 async function pageItems(isAnswer,layout){
   if(layout==='double'){
     let left='',right='';
     for(let i=0;i<items.length;i++){
       const xml=await renderItem(items[i],i+1,isAnswer,3.0);
       if(i%2===0)left+=xml;else right+=xml;
     }
     return colsTable(left,right);
   }
   let result='';
   for(let i=0;i<items.length;i++)result+=await renderItem(items[i],i+1,isAnswer,6.65);
   return result;
 }
 const title=options.title||'物理精准练习';
 const date=options.date||new Date().toISOString().slice(0,10);
 let body=paragraph(title+' · '+date,{align:'center',bold:true,size:30,after:170});
 body+=paragraph('班级：________　姓名：________　日期：________　　少量多次 · 独立完成',{align:'center',size:19,after:190});
 body+=await pageItems(false,options.layout||'single');
 if(options.feedback!==false)body+=smallTable([
   ['完成后勾选（不影响评分）'],
   ['完成：□ 独立　□ 某一步卡住　□ 需要提示'],
   ['针对性：□ 正好练到　□ 部分相关　□ 不太适合'],
   ['困难：□ 题图　□ 规律　□ 步骤衔接　□ 作图表达　□ 其他：________']
 ]);
 body+=pageBreak();
 body+=paragraph('参考答案 · 自我核对',{align:'center',bold:true,size:30,after:170});
 body+=paragraph('答案与正面题号对应',{align:'center',size:19,after:170});
 body+=await pageItems(true,options.layout||'single');
 body+=smallTable([['核对后：□ 能独立重做　□ 看懂但有困难　□ 需要教师讲解']]);
 const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="'+W+'" xmlns:r="'+REL+'"><w:body>'+body+
 '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="794" w:bottom="794" w:left="850" w:right="850" w:header="360" w:footer="360"/></w:sectPr></w:body></w:document>';
 const contentTypes='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
 '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+
 Array.from(types).map(x=>'<Default Extension="'+x+'" ContentType="image/'+(x==='jpg'?'jpeg':x)+'"/>').join('')+
 '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
 zip.file('[Content_Types].xml',contentTypes);
 zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="'+REL+'/officeDocument" Target="word/document.xml"/></Relationships>');
 zip.file('word/document.xml',doc);
 zip.file('word/_rels/document.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels.map(r=>'<Relationship Id="'+r.id+'" Type="'+PICREL+'" Target="'+r.target+'"/>').join('')+'</Relationships>');
 const result=await zip.generateAsync({type:'blob',mimeType:MIME,compression:'DEFLATE',compressionOptions:{level:6}});
 if(!result || result.size<500)throw Error('Word 文件生成结果异常');
 return result;
}
root.PhysicsWordExport={createDocx,MIME};
})(typeof window!=='undefined'?window:globalThis);
