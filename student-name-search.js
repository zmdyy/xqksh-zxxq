/* 学情分析与精准练习题库共用姓名检索算法。
   与主页面 normalizeSearchKeyword/getPinyinTokens/scoreStudentSearchEntry 保持一致。*/
(function(global){
  'use strict';
  function normalizeSearchKeyword(text){
    return String(text||'').trim().toLowerCase().replace(/\s+/g,'');
  }
  function classNumber(part){const x=String(part||'').trim();const units={'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};if(/^\d+$/.test(x))return Number(x);if(x==='十')return 10;if(/^十[一二三四五六七八九]$/.test(x))return 10+units[x[1]];if(/^[一二三四五六七八九]十[一二三四五六七八九]?$/.test(x))return units[x[0]]*10+(x[2]?units[x[2]]:0);if(Object.hasOwn(units,x))return units[x];return null}
  function normalizeClassName(value){const original=String(value??'').trim();const s=original.replace(/[（）()]/g,'').replace(/\s+/g,'').replace(/^初中?/, '');if(!s)return '';
    const grade=s.match(/^([一二三四五六七八九十]|[1-9])年级([0-9]{1,2}|[一二两三四五六七八九十〇零]{1,3})班?$/);
    if(grade){const a=classNumber(grade[1]),b=classNumber(grade[2]);if(a!==null&&b!==null&&b>0)return a+'年级'+b+'班'}
    if(/^[1-9]\d{2}$/.test(s))return s;
    const m=s.match(/^([0-9]{1,2}|[一二两三四五六七八九十〇零]{1,3})班?$/);if(m){const n=classNumber(m[1]);if(n!==null&&n>0&&n<100)return n+'班'}
    return original;
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
      displayName,rawName,className:normalizeClassName(stu.class||stu.className||''),
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
      .filter(x=>x.score>=0&&(!options.className||x.entry.className===normalizeClassName(options.className)))
      .sort((a,b)=>b.score-a.score||a.entry.displayName.localeCompare(b.entry.displayName,'zh-CN'))
      .slice(0,options.limit||20).map(x=>x.entry);
  }
  global.StudentNameSearch={normalizeSearchKeyword,normalizeClassName,getPinyinTokens,scoreStudentSearchEntry,indexStudent,search};
})(typeof window!=='undefined'?window:globalThis);
