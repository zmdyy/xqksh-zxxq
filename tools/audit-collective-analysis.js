// Run: node tools/audit-collective-analysis.js
// Execute production parsing/model/render functions with isolated data and DOM seams.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
scripts.forEach((script,index)=>new vm.Script(script,{filename:'index.html#'+index}));
function functionSource(name) {
    const start=html.indexOf('function '+name+'(');
    assert(start>=0,'Missing function: '+name);
    const next=html.indexOf('\nfunction ',start+1), end=html.indexOf('</script>',start+1);
    return html.slice(start,next>=0?Math.min(next,end):end);
}
const elements={};
function element(id) {
    return elements[id] || (elements[id]={style:{},innerHTML:'',textContent:'',value:'',checked:false,children:[],appendChild(child){this.children.push(child);},querySelectorAll(){return [];}});
}
const sandbox={console,Map,Set,document:{getElementById:element,querySelector:element,createElement:()=>({})},
    uploadedFilesData:{},combinedStudentData:[],allSubjectHeaders:[],collectiveThreshold:60,collectiveHeatmapContext:null,
    DataPool:{syncFromGlobalsIfEditing(){throw Error('Unexpected persistence during isolated import');}},
    updateStudentNameList(){},showToast(){},qkGetMapping(){return null;},qkBindButtons(){},qkUpdateToolbar(){},
    qkRenderCell(){return '';},qkRenderAction(){return '';},showStudentListModal(title,body){this.lastModal={title,body};}};
sandbox.echarts={init(dom){
    // SVG painter appends a viewport; dispose clears the root, matching bundled ECharts.
    dom.innerHTML+='<svg></svg>';
    return {setOption(option){this.option=option;},off(){},on(type,callback){this[type]=callback;},resize(){},dispose(){dom.innerHTML='';}};
}};
vm.createContext(sandbox);
const functions=[
    'escapeHtml','deepClone','hasDataValue','pickDataValue','hasMeaningfulValue','getStudentDisplayName','applyDuplicateDisplayNames',
    'mergeImportedQuestionMetadata','mergeImportedSubScores','getImportedStudentClassKey','combineAllStudentData',
    'parseDataByHeaderRows','resolveHeaderRowCount','getImportedHeaderRows','getQuestionMaxScoreFromHeaderRows','extractSubjectAndField','autoDetectHeaderRowCount','detectImportedDataStartRow','repairImportedBatchData',
    'compactDigits','parseCompositeQuestionRef','normalizeItemName','expandItemRefs','getCanonicalQuestionRefInfo','getCanonicalQuestionRefFromHeaderRows',
    'getMergedSubjectNames','subjectHasScoreData','subjectHasGradeData','getScoredSubjectNames','getGradedSubjectNames','getTotalSubjectName','getRankValue','applyFallbackGradeRanks','calculateFallbackRanks','applyScoreRankingForSubject',
    'getCollectiveSubjectAliases','resolveCollectiveStudentMetric','normalizeCollectiveGrade','collectiveScoreNumber','buildCollectiveDataSnapshot','buildCollectiveDataFromCombined','qkBuildCollectiveDataFromBatchSnapshot',
    'utilGetTitle','utilGetTitleAns','utilGetSubjectFromHeader','utilSplitHeaderCols','utilGetQuestionDictKey','utilBuildQuestionDict','formatCollectiveOptionDistribution',
    'getSelectedSubject','getCollectiveFilteredData','renderCollectiveClassFilter','renderCollectiveSubjectFilter',
    'getSubjectFullMarksFromInputs','diagSafeNumber','buildCollectiveQuestionModels','buildCollectiveStudentBaselines','getCollectiveStudentBaselineExcludingItem','getCollectiveIndividualThreshold','getCollectiveHeatmapFallbackStep','splitCollectiveScoreRateTiers','splitCollectiveAbilityTiers','getCollectiveThresholdRate','calculateCollectiveDiagnosis',
    'getCollectiveHeatmapSourceRef','getCollectiveHeatmapQuestionInfo','getCollectiveHeatmapQuestionLabel','sortCollectiveHeatmapQuestions','buildCollectiveHeatmapModel','resolveCollectiveHeatmapSubject',
    'setCollectiveHeatmapExportEnabled','formatCollectiveHeatmapAxisLabel','getCollectiveHeatmapChartWidth','getCollectiveHeatmapAxisBottom','resetCollectiveHeatmapChart','showCollectiveHeatmapStatus','getCollectiveHeatmapGroupingText','renderCollectiveHeatmap','renderCollectiveStudentOverviewHeatmap','showCollectiveHeatmapCellDetail',
    'renderCollectiveTables','calculateQuestionGroupLowStudents'
];
for(const name of functions) vm.runInContext(functionSource(name),sandbox,{filename:name});
const json=value=>JSON.parse(JSON.stringify(value));
let count=0;
function test(name,fn){fn();count++;console.log('PASS',name);}
function fixtures() {
    const main={fileType:'main',headerRows:2,rawData:[
        ['姓名','班级','英语笔试','','道德与法治','','听说',''],
        ['','','分数','等级','成绩','等第','分数','等级'],
        ...Array.from({length:12},(_,i)=>['学生'+i,'801班',i?65+i:0,['Ａ＋','B','C'][i%3],60+i,['A','B','C'][i%3],20,'D'])
    ],headerMerges:[{s:{r:0,c:2},e:{r:0,c:3}},{s:{r:0,c:4},e:{r:0,c:5}},{s:{r:0,c:6},e:{r:0,c:7}}]};
    const sub={fileType:'sub',headerRows:3,rawData:[
        ['姓名','班级','英语','','','','道法'],
        ['','','1（2分）','','2（3分）','','1（4分）'],
        ['','','得分','答案（B）','分数','答案（A）','得分'],
        ...Array.from({length:12},(_,i)=>['学生'+i,'801',i?2:'','B',i%4,'A',i%5])
    ],headerMerges:[{s:{r:0,c:2},e:{r:0,c:5}},{s:{r:1,c:2},e:{r:1,c:3}},{s:{r:1,c:4},e:{r:1,c:5}}]};
    return {main,sub};
}
let baseline;
test('合并表头识别满分、分数/成绩、等级/等第，保留0分',()=>{
    const files=fixtures();const raw=JSON.stringify(files);
    sandbox.allSubjectHeaders=[];
    sandbox.parseDataByHeaderRows(files.main,files.main.rawData,2);
    sandbox.parseDataByHeaderRows(files.sub,files.sub.rawData,3);
    assert.equal(files.main.studentData[0].subjects['英语笔试'].score,0);
    assert.equal(files.main.studentData[0].subjects['道德与法治'].grade,'A');
    assert.equal(files.sub.subjectHeaders.find(h=>h.name==='英语').subScoreQuestionMap['1'].maxScore,2);
    assert.equal(files.sub.studentData[0].subjects['英语'].subScores['1'].score,0);
    assert.equal(files.sub.subjectHeaders.find(h=>h.name==='英语').subScoreQuestionMap['2'].maxScore,3);
    const original=JSON.parse(raw);
    assert.deepEqual(json(files.main.rawData),original.main.rawData);
    assert.deepEqual(json(files.sub.rawData),original.sub.rawData);
    sandbox.uploadedFilesData=files;sandbox.combineAllStudentData(false);
    assert.equal(sandbox.combinedStudentData.length,12);
    baseline=sandbox.buildCollectiveDataFromCombined();
    assert.equal(baseline.data[0]['英语_等级'],'A+');
    assert.equal(baseline.data[0]['道法_等级'],'A');
    assert.equal(baseline.data[0]['英语_分数'],0);
    assert.deepEqual(json(baseline.subjectMetricSources['英语'].grade),['英语笔试']);
});
test('上传顺序不影响等级、满分、得分；不污染源文件元数据',()=>{
    const files=fixtures();sandbox.allSubjectHeaders=[];
    for(const file of Object.values(files)) sandbox.parseDataByHeaderRows(file,file.rawData,file.headerRows);
    const source=JSON.stringify(files);
    sandbox.uploadedFilesData={sub:files.sub,main:files.main};sandbox.combineAllStudentData(false);
    const reversed=sandbox.buildCollectiveDataFromCombined();
    assert.deepEqual(json(reversed.data),json(baseline.data));
    assert.deepEqual(json(reversed.fullScoreMap),json(baseline.fullScoreMap));
    assert.equal(JSON.stringify(files),source);
});
test('只有同一考试科目别名匹配，听说/合成成绩/总分不混入',()=>{
    const student={subjects:{'英语笔试':{grade:'A'},'听说':{grade:'D'},'英语合':{grade:'B'},'总分':{grade:'C'}}};
    assert.equal(sandbox.resolveCollectiveStudentMetric(student,'英语','grade').value,'A');
    assert.equal(sandbox.resolveCollectiveStudentMetric(student,'英语听力','grade').value,'D');
    assert.equal(sandbox.resolveCollectiveStudentMetric(student,'英语合','grade').value,'B');
    assert.equal(sandbox.resolveCollectiveStudentMetric({subjects:{总分:{grade:'A'}}},'英语','grade').value,'');
    assert.equal(sandbox.resolveCollectiveStudentMetric({subjects:{英语:{grade:'B'},英语笔试:{grade:'A'}}},'英语','grade').value,'B');
});
test('计分与答案信息分开合并，空字段不覆盖已有满分/得分',()=>{
    const metadata=sandbox.mergeImportedQuestionMetadata({name:'1',scoreIndex:3,maxScore:2},{name:'1',scoreIndex:-1,answerIndex:8,maxScore:null});
    assert.equal(metadata.maxScore,2);assert.equal(metadata.scoreIndex,3);assert.equal(metadata.answerIndex,8);
    for(const reverse of [false,true]) {
        const scored={'1':{score:0,maxScore:2,studentAnswer:''}},answered={'1':{score:'',maxScore:'',studentAnswer:'B'}};
        const merged=sandbox.mergeImportedSubScores(reverse?answered:scored,reverse?scored:answered);
        assert.equal(merged['1'].score,0);assert.equal(merged['1'].maxScore,2);assert.equal(merged['1'].studentAnswer,'B');
    }
});
test('旧批次从原表恢复满分和等级；无需重新上传',()=>{
    const files=fixtures();sandbox.uploadedFilesData=files;
    assert.equal(sandbox.repairImportedBatchData(),true);
    assert.equal(sandbox.repairImportedBatchData(),false);
    const fd=sandbox.buildCollectiveDataFromCombined();
    assert.equal(fd.fullScoreMap['英语_1（2分）'],2);assert.equal(fd.data[0]['英语_等级'],'A+');
});
test('旧批次曾手动调整表头行数时，保留第一位学生；单行主成绩字段兼容',()=>{
    const file={fileType:'main',headerRows:3,rawData:[['姓名','班级','数学分数','数学等级','数学年级排名','物理分数','物理等级'],['甲','801',0,'A',2,60,'B'],['乙','801',90,'A+',1,70,'A']]};
    assert.equal(sandbox.autoDetectHeaderRowCount(file.rawData),1);
    sandbox.parseDataByHeaderRows(file,file.rawData,1);
    assert.equal(file.studentData.length,2);assert.equal(file.studentData[0].subjects.数学.gradeRank,2);
    assert.equal(file.studentData[0].subjects.数学.score,0);assert.equal(file.studentData[0].subjects.物理.grade,'B');
    const twoRow=fixtures().sub;twoRow.rawData.splice(2,1);twoRow.headerRows=3;
    assert.equal(sandbox.detectImportedDataStartRow(twoRow.rawData),2);
});
test('满分来自实际表头或保存的小题元数据，不从最高得分猜测',()=>{
    assert.equal(sandbox.getQuestionMaxScoreFromHeaderRows([['第1题（２．５分）']],0),2.5);
    assert.equal(sandbox.getQuestionMaxScoreFromHeaderRows([['第1题'],['满分：3']],0),3);
    assert.equal(sandbox.getQuestionMaxScoreFromHeaderRows([['满分',2,3]],2),3);
    const fd=sandbox.buildCollectiveDataSnapshot([{name:'学生',subjects:{物理:{subScores:{'1':{score:1,maxScore:3}}}}}],[{name:'物理',subScoreQuestionMap:{'1':{name:'1',scoreIndex:2,maxScore:null}}}]);
    assert.equal(fd.fullScoreMap['物理_1（3分）'],3);
});
test('父题/子题从合并表头识别，排序与点击保持题目身份',()=>{
    const rows=[['姓名','班级','物理','',''],['','','13','',''],['','','1','45','123']];
    assert.equal(sandbox.getCanonicalQuestionRefFromHeaderRows(rows,3,'物理',2),'13(4、5)');
    assert.equal(sandbox.getCanonicalQuestionRefFromHeaderRows(rows,4,'物理',2),'13(1、2、3)');
    const sorted=sandbox.sortCollectiveHeatmapQuestions(['10','2','13(4、5)','13(1、2、3)'].map((label,index)=>({index,label,q:{title:label,scoreHeader:'物理_'+label+'（2分）'}})));
    assert.deepEqual(json(sorted.map(q=>q.index)),[1,0,3,2]);
    const vertical={headerMerges:[{s:{r:1,c:2},e:{r:2,c:2}}]};
    const restored=sandbox.getImportedHeaderRows(vertical,[['姓名','班级','物理'],['','','1（2分）'],['','','']],3);
    assert.equal(sandbox.getCanonicalQuestionRefFromHeaderRows(restored,2,'物理',2),'1');
});
test('当前分析与历史知识点分析使用同一数据入口',()=>{
    const current=sandbox.buildCollectiveDataFromCombined();
    const saved=sandbox.qkBuildCollectiveDataFromBatchSnapshot({combinedStudentData:sandbox.combinedStudentData,allSubjectHeaders:sandbox.allSubjectHeaders});
    assert.deepEqual(json(saved),json(current));
});
test('空白按0；非法非空值排除；热力图与统计/等级下钻均值一致',()=>{
    const fd={headers:['姓名','班级','物理_1（2分）','物理_等级'],nameField:'姓名',classField:'班级',fullScoreMap:{'物理_1（2分）':2},data:[
        {'姓名':'甲','物理_1（2分）':'','物理_等级':'A'}, {'姓名':'乙','物理_1（2分）':2,'物理_等级':'A'}, {'姓名':'丙','物理_1（2分）':'无效','物理_等级':'A'}]};
    const questions=sandbox.buildCollectiveQuestionModels(fd,'物理');
    assert.equal(questions[0].students.length,2);assert.equal(questions[0].overallRate,0.5);
    const group=sandbox.calculateQuestionGroupLowStudents(fd.data,'物理_1（2分）',2);
    assert.equal(group.validCount,2);assert.equal(group.averageRate,0.5);assert.equal(group.lowStudents[0].score,0);
    assert.equal(sandbox.collectiveScoreNumber('—'),null);
    assert.equal(sandbox.collectiveScoreNumber('-'),0);
});
function select(subject,mode='rate',only=false) {
    element('collectiveSubjectFilter').value=subject;element('collectiveHeatmapMode').value=mode;element('collectiveHeatmapOnlyAbnormal').checked=only;
    sandbox.renderCollectiveHeatmap();return element('collectiveHeatmapChart').__chart;
}
test('全部科目→道法→英语→道法，提示不会残留在 SVG 容器',()=>{
    assert.equal(select(''),null);assert.match(element('collectiveHeatmapEmpty').innerHTML,/请选择|选择一个科目/);
    for(const subject of ['道法','英语','道法']) {
        const chart=select(subject);assert(chart);assert.equal(element('collectiveHeatmapChart').innerHTML,'<svg></svg>');
        assert.equal(element('collectiveHeatmapEmpty').style.display,'none');
        assert(chart.option.yAxis.data.includes('A') || chart.option.yAxis.data.includes('A+'));
    }
});
test('37题英语始终显示百分数；汇总/学生视图宽度一致',()=>{
    const current=json(sandbox.combinedStudentData),heads=json(sandbox.allSubjectHeaders);
    sandbox.allSubjectHeaders=[{name:'英语',subScoreQuestionMap:Object.fromEntries(Array.from({length:37},(_,i)=>[String(i+1),{name:String(i+1),scoreIndex:i+2,maxScore:2,answerIndex:-1}]))},{name:'英语笔试'}];
    sandbox.combinedStudentData=Array.from({length:12},(_,i)=>({name:'学生'+i,class:'801',subjects:{英语:{subScores:Object.fromEntries(Array.from({length:37},(_,q)=>[String(q+1),{score:(i+q)%3,maxScore:2}]))},英语笔试:{score:75,grade:['A','B','C'][i%3]}}}));
    const chart=select('英语');assert.equal(chart.option.series[0].label.show,true);assert.equal(chart.option.series[0].data.length,148);
    assert.equal(chart.option.series[0].label.formatter({value:[0,0,0]}),'0%');
    assert.equal(chart.option.series[0].label.formatter({value:[0,0,100]}),'100%');
    const width=parseInt(element('collectiveHeatmapChart').style.width,10);
    assert.equal(select('英语','anomaly').option.series[0].label.show,true);
    select('英语','student');assert.equal(parseInt(element('collectiveHeatmapChart').style.width,10),width+40);
    select('英语');sandbox.combinedStudentData=current;sandbox.allSubjectHeaders=heads;
});
test('无异常→恢复全部题、无数据→恢复数据、0%阈值不回退60%',()=>{
    const current=sandbox.combinedStudentData;
    sandbox.collectiveThreshold=0;assert.equal(sandbox.getCollectiveThresholdRate(),0);
    select('英语','rate',true); // zero common threshold still may have individual anomalies
    assert(select('英语'));
    sandbox.combinedStudentData=[];assert.equal(select('英语'),null);assert.equal(sandbox.collectiveHeatmapContext,null);
    sandbox.combinedStudentData=current;assert(select('英语'));
    sandbox.collectiveThreshold=60;
});
test('单一真实等级仍按等级；无学科等级绝不借用总分等级',()=>{
    const fd={headers:['物理_等级','总分_等级'],data:Array.from({length:12},()=>({'物理_等级':'A','总分_等级':'B'}))};
    const grades=sandbox.splitCollectiveAbilityTiers(fd,[],new Map(),'物理');
    assert.equal(grades.length,1);assert.equal(grades[0].source,'grade');
    const noGrade={...fd,headers:['总分_等级'],fullScoreField:'总分_分数'};
    assert.equal(sandbox.splitCollectiveAbilityTiers(noGrade,[],new Map(),'物理').length,0);
});
test('未匹配行全部隐藏；未分级学生仍保留在全班及学生数据',()=>{
    const fd={headers:['姓名','班级','物理_1（2分）','物理_等级'],nameField:'姓名',classField:'班级',fullScoreMap:{'物理_1（2分）':2},data:[
        {'姓名':'甲','班级':'801','物理_1（2分）':2,'物理_等级':'A'},
        {'姓名':'乙','班级':'801','物理_1（2分）':1,'物理_等级':'B'}]};
    const hasUnmatched=model=>model.rows.some(row=>row.source==='ungraded');
    assert.equal(hasUnmatched(sandbox.buildCollectiveHeatmapModel(fd,'物理')),false);
    fd.data.push({'姓名':'丙','班级':'802','物理_1（2分）':'无效','物理_等级':''});
    assert.equal(hasUnmatched(sandbox.buildCollectiveHeatmapModel(fd,'物理')),false);
    fd.data[2]['物理_1（2分）']=0;
    const model=sandbox.buildCollectiveHeatmapModel(fd,'物理');
    assert.equal(hasUnmatched(model),false);
    assert.equal(model.questions[0].cells[0].qStudents.length,3);
    assert.equal(model.questions[0].cells[0].qStudents[2].score,0);
    assert.equal(hasUnmatched(sandbox.buildCollectiveHeatmapModel({...fd,data:fd.data.filter(row=>row.班级==='801')},'物理')),false);
});
test('无等级按单科得分率10%/20%划分：边界、满分、0分、空组与非法分数',()=>{
    element('fullMark_物理').value='70';
    const values=[0,6.999,7,14,42,56,63,70,-1,71,'坏'];
    const fd={headers:['姓名','物理_分数'],fullScoreMap:{},data:values.map((v,i)=>({'姓名':String(i),'物理_分数':v}))};
    const ten=sandbox.splitCollectiveAbilityTiers(fd,[],new Map(),'物理',10);
    const twenty=sandbox.splitCollectiveAbilityTiers(fd,[],new Map(),'物理',20);
    assert(ten.every(t=>t.source==='score-rate' && t.rows.length));
    assert.deepEqual(json(ten.find(t=>t.lower===0).rows.map(r=>r.姓名)),['0','1']);
    assert.deepEqual(json(ten.find(t=>t.lower===10).rows.map(r=>r.姓名)),['2']);
    assert.deepEqual(json(ten.find(t=>t.lower===90).rows.map(r=>r.姓名)),['6','7']);
    assert.equal(ten.reduce((n,t)=>n+t.rows.length,0),8);
    assert.deepEqual(json(twenty.find(t=>t.lower===80).rows.map(r=>r.姓名)),['5','6','7']);
    assert.equal(sandbox.splitCollectiveAbilityTiers({...fd,data:fd.data.slice(0,1)},[],new Map(),'物理',20).length,1);
    element('fullMark_物理').value='';
});
test('无单科成绩时使用小题加权合计；空白0分保留，非法值不用于分层',()=>{
    const fd={headers:['姓名','物理_1（1分）','物理_2（9分）'],nameField:'姓名',classField:'班级',
        fullScoreMap:{'物理_1（1分）':1,'物理_2（9分）':9},data:[
        {'姓名':'甲','物理_1（1分）':1,'物理_2（9分）':0},
        {'姓名':'乙','物理_1（1分）':'','物理_2（9分）':''},
        {'姓名':'丙','物理_1（1分）':'坏','物理_2（9分）':9}]};
    const questions=sandbox.buildCollectiveQuestionModels(fd,'物理');
    const tiers=sandbox.splitCollectiveAbilityTiers(fd,questions,new Map(),'物理',10);
    assert.deepEqual(json(tiers.map(t=>[t.lower,t.rows.map(r=>r.姓名)])),[[10,['甲']],[0,['乙']]]);
    assert(tiers.every(t=>t.usesQuestionTotal));
    element('collectiveHeatmapFallbackStep').value='20';
    const model=sandbox.buildCollectiveHeatmapModel(fd,'物理');
    assert.equal(model.fallbackStep,20);assert.equal(model.rows[1].label,'0–20%');
    assert.match(sandbox.getCollectiveHeatmapGroupingText(model),/20%梯度/);
    element('collectiveHeatmapFallbackStep').value='10';
});
test('真实等级优先且不混入得分率段；同伴异常按热力图当前梯度计算',()=>{
    element('fullMark_物理').value='100';
    const fd={headers:['姓名','物理_分数','物理_1（10分）','物理_2（10分）'],nameField:'姓名',classField:'班级',
        fullScoreMap:{'物理_1（10分）':10,'物理_2（10分）':10},data:[
        ...[0,1,2].map(i=>({'姓名':'低'+i,'物理_分数':80,'物理_1（10分）':3,'物理_2（10分）':3})),
        ...[0,1,2].map(i=>({'姓名':'高'+i,'物理_分数':90,'物理_1（10分）':10,'物理_2（10分）':10}))]};
    element('collectiveHeatmapFallbackStep').value='10';
    const ten=sandbox.buildCollectiveHeatmapModel(fd,'物理');
    assert.equal(ten.individualQuestionCount,0);
    element('collectiveHeatmapFallbackStep').value='20';
    const twenty=sandbox.buildCollectiveHeatmapModel(fd,'物理');
    assert.equal(twenty.individualQuestionCount,2);
    assert.equal(twenty.questions[0].cells[1].anomalyCount,3);
    fd.headers.push('物理_等级');fd.data.forEach((row,i)=>row['物理_等级']=i?'A':'');
    const graded=sandbox.buildCollectiveHeatmapModel(fd,'物理');
    assert.deepEqual(json(graded.rows.map(r=>r.label)),['全班','A']);
    element('fullMark_物理').value='';element('collectiveHeatmapFallbackStep').value='10';
});
console.log(`Collective analysis audit passed: ${count} cases; ${scripts.length} scripts parsed.`);
