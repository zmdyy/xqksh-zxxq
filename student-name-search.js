/* 学情分析与精准练习题库共用姓名检索算法。
   与主页面 normalizeSearchKeyword/getPinyinTokens/scoreStudentSearchEntry 保持一致。*/
(function(global){
  'use strict';
  function normalizeSearchKeyword(text){
    return String(text||'').trim().toLowerCase().replace(/\s+/g,'');
  }
  function getPinyinTokens(text){
    const raw=String(text||'').trim();
    const pinyinPro=global.pinyinPro;
    if(!raw||!pinyinPro||typeof pinyinPro.pinyin!=='function')return {full:'',initials:''};
    try {
      const full=pinyinPro.pinyin(raw,{toneType:'none',type:'array',nonZh:'consecutive'})||[];
      return {
        full:full.map(x=>normalizeSearchKeyword(x)).filter(Boolean).join(''),
        initials:full.map(x=>normalizeSearchKeyword(x).charAt(0)).filter(Boolean).join('')
      };
    }catch(e){return {full:'',initials:''}}
  }
  function scoreStudentSearchEntry(entry,keyword){
    if(!entry||!keyword)return -1;
    if(entry.normalizedDisplay===keyword||entry.normalizedRaw===keyword)return 100;
    if(entry.displayName===keyword||entry.rawName===keyword)return 98;
    if(entry.normalizedDisplay.indexOf(keyword)===0||entry.normalizedRaw.indexOf(keyword)===0)return 92;
    if(entry.normalizedDisplay.indexOf(keyword)!==-1||entry.normalizedRaw.indexOf(keyword)!==-1)return 86;
    if(entry.fullPinyin===keyword||entry.rawFullPinyin===keyword)return 82;
    if(entry.initials===keyword||entry.rawInitials===keyword)return 80;
    if(entry.fullPinyin.indexOf(keyword)===0||entry.rawFullPinyin.indexOf(keyword)===0)return 76;
    if(entry.initials.indexOf(keyword)===0||entry.rawInitials.indexOf(keyword)===0)return 74;
    if(entry.fullPinyin.indexOf(keyword)!==-1||entry.rawFullPinyin.indexOf(keyword)!==-1)return 68;
    if(entry.initials.indexOf(keyword)!==-1||entry.rawInitials.indexOf(keyword)!==-1)return 64;
    return -1;
  }
  function indexStudent(stu){
    const displayName=String(stu.displayName||stu.name||'').trim();
    const rawName=String(stu.name||stu.displayName||'').trim();
    const py=getPinyinTokens(displayName),rawPy=rawName===displayName?py:getPinyinTokens(rawName);
    return {
      displayName,rawName,className:String(stu.class||stu.className||'').trim(),
      normalizedDisplay:normalizeSearchKeyword(displayName),normalizedRaw:normalizeSearchKeyword(rawName),
      fullPinyin:py.full||rawPy.full,initials:py.initials||rawPy.initials,
      rawFullPinyin:rawPy.full,rawInitials:rawPy.initials
    };
  }
  function search(index,keyword,options){
    const key=normalizeSearchKeyword(keyword);
    if(!key)return [];
    options=options||{};
    return (index||[]).map(entry=>({entry,score:scoreStudentSearchEntry(entry,key)}))
      .filter(x=>x.score>=0&&(!options.className||x.entry.className===options.className))
      .sort((a,b)=>b.score-a.score||a.entry.displayName.localeCompare(b.entry.displayName,'zh-CN'))
      .slice(0,options.limit||20).map(x=>x.entry);
  }
  global.StudentNameSearch={normalizeSearchKeyword,getPinyinTokens,scoreStudentSearchEntry,indexStudent,search};
})(typeof window!=='undefined'?window:globalThis);
