/* Teacher-confirmed presets and conservative, non-mutating typography suggestions. */
(function(root){
'use strict';
const presets=[];
function add(group,label,tex,note=''){presets.push({group,label,tex,note})}
const units={常用:['cm','m','cm²','cm³','kg','kg/m³','m/s','N','Pa','J','W','℃'],力学:['mm','km','m²','m³','mL','L','g','g/cm³','s','min','h','km/h','m/s²'],热学:['℃','J','kJ','MJ','J/(kg·℃)','J/kg','J/m³','kJ/kg','MJ/kg','MJ/m³','W','kW'],电学:['A','mA','V','Ω','kΩ','J','W','kW','kW·h'],拓展:['K','Hz','°']};
function unitTex(s){return '\\mathrm{'+s.replace(/²/g,'^{2}').replace(/³/g,'^{3}').replace(/·/g,'\\cdot ').replace(/Ω/g,'\\Omega ').replace(/℃/g,'{}^{\\circ}C').replace(/°/g,'{}^{\\circ}')+'}'}
for(const[g,list]of Object.entries(units))for(const s of list)add(g,s,unitTex(s),'单位');
for(const[label,tex]of [['F₁','F_1'],['F₂','F_2'],['v₀','v_0'],['ρ','\\rho'],['η','\\eta'],['Δt','\\Delta t'],['Q吸','Q_{\\text{吸}}'],['Q放','Q_{\\text{放}}'],['F浮','F_{\\text{浮}}'],['F拉','F_{\\text{拉}}'],['U额','U_{\\text{额}}'],['P额','P_{\\text{额}}'],['Q','Q'],['q','q'],['c','c'],['t','t'],['t₀','t_0'],['m','m'],['V','V'],['T','T'],['ΔT','\\Delta T'],['ΔU','\\Delta U'],['×','\\times'],['÷','\\div'],['≈','\\approx'],['≠','\\ne'],['≤','\\le'],['≥','\\ge'],['π','\\pi'],['Δ','\\Delta']])add('符号',label,tex);
for(const[label,tex]of [['分式','\\frac{a}{b}'],['根式','\\sqrt{x}'],['科学计数法','a\\times10^{n}'],['上标','x^{2}'],['下标','F_{1}']])add('结构',label,tex,'点击公式可编辑各位置');
const formulas=[
['速度','v=\\frac{s}{t}','路程与所用时间'],['密度','\\rho=\\frac{m}{V}','质量与体积'],['重力','G=mg','g 按题目给定值'],['压强','p=\\frac{F}{S}','压力与受力面积'],['液体压强','p=\\rho gh','液体内部压强'],['浮力','F_{\\text{浮}}=\\rho_{\\text{液}}gV_{\\text{排}}','阿基米德原理'],['杠杆平衡','F_1l_1=F_2l_2','力臂为支点到作用线距离'],['功','W=Fs','力与沿力方向移动距离'],['功率','P=\\frac{W}{t}','功与时间'],['机械效率','\\eta=\\frac{W_{\\text{有用}}}{W_{\\text{总}}}\\times100\\%',''],['欧姆定律','I=\\frac{U}{R}','同一导体'],['电功','W=UIt',''],['电功率','P=UI',''],
['吸热','Q_{\\text{吸}}=cm(t-t_0)','无物态变化、比热容可视为不变；t 表示温度'],['放热','Q_{\\text{放}}=cm(t_0-t)','无物态变化；放热量取正值'],['热量与温度变化','Q=cm\\Delta t','Δt 为温度变化大小；不用于物态变化吸放热'],['燃烧放热（质量）','Q_{\\text{放}}=mq','完全燃烧；q 按质量计'],['燃烧放热（体积）','Q_{\\text{放}}=Vq','完全燃烧；q 按体积计'],['加热效率','\\eta=\\frac{Q_{\\text{吸}}}{Q_{\\text{放}}}\\times100\\%','被加热物体吸热与燃料放热之比'],['热机效率','\\eta=\\frac{W_{\\text{有用}}}{Q_{\\text{放}}}\\times100\\%','有用机械功与燃料放热之比'],['焦耳定律','Q=I^2Rt','t 表示时间'],['理想热交换','Q_{\\text{吸}}=Q_{\\text{放}}','不计对外热损失等条件']];
for(const [label,tex,note]of formulas)add('公式',label,tex,note);
function scan(text){
 text=String(text||'');const out=[],ranges=Array.from(text.matchAll(/\\\([\s\S]*?\\\)/g),m=>[m.index,m.index+m[0].length]);
 function addMatches(re,replace,reason){for(const m of text.matchAll(re)){const start=m.index,end=start+m[0].length;if(ranges.some(([a,b])=>start<b&&end>a)||out.some(x=>start<x.end&&end>x.start))continue;out.push({start,end,before:m[0],after:replace(m),reason})}}
 addMatches(/(?<![A-Za-z0-9_])(?:kg\/m3|g\/cm3|[kM]?J\/m3|cm[23]|mm[23]|m[23])(?![A-Za-z0-9_])/g,m=>m[0].replace(/2/g,'²').replace(/3/g,'³'),'疑似单位指数，请确认这里表示物理单位');
 addMatches(/J\s*\/\s*kg\s*[·⋅]?\s*℃/g,()=> 'J/(kg·℃)','核对是否为比热容单位');
 addMatches(/(?<![A-Za-z0-9_])[FUIRvQt][0-9](?![A-Za-z0-9_])/g,m=>'\\('+m[0][0]+'_{'+m[0][1]+'}\\)','疑似物理量下标，须结合上下文确认；型号不适用');
 addMatches(/(?<![A-Za-z])(?:Q[吸放]|F[浮拉]|[UP][额])/g,m=>'\\('+m[0][0]+'_{\\text{'+m[0].slice(1)+'}}\\)','疑似文字下标，请确认');
 addMatches(/(?<![A-Za-z0-9_])(?:\d+(?:\.\d+)?)[×]10([+-]?\d{1,2})(?![0-9])/g,m=>'\\('+m[0].split('×')[0]+'\\times10^{'+m[1]+'}\\)','疑似科学计数法指数丢失，须核对原件；也可能是普通乘法');
 return out.sort((a,b)=>a.start-b.start);
}
root.PhysicsInput={presets,scan,unitTex};if(typeof module!=='undefined')module.exports=root.PhysicsInput;
})(typeof window!=='undefined'?window:globalThis);
