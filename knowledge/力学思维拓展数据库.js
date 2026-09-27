window._MECH_THINKING_DATA = (function() {
  const chapterTemplates = {
    "机械运动": {
      question: "怎样描述物体是否运动、运动多快，以及测量过程是否可靠？",
      core_model: "运动描述 = 参照物 + 路程/距离 + 时间 + 速度。",
      reasoning_path: ["选定参照物", "测量路程和时间", "用比值描述快慢", "分析读数与误差"],
      variables: [
        { symbol: "s", name: "路程/距离", unit: "m", meaning: "物体运动轨迹的长度或两点间长度" },
        { symbol: "t", name: "时间", unit: "s", meaning: "运动或实验过程持续的时间间隔" },
        { symbol: "v", name: "速度", unit: "m/s", meaning: "单位时间内通过的路程" }
      ],
      measurement: [
        { quantity: "时间", tool: "秒表/停表", reading: "读到最小分度值，注意起停时刻一致", errors: ["反应时间", "起点终点判断不一致", "多次测量未取平均"] },
        { quantity: "长度", tool: "刻度尺/卷尺", reading: "零刻度对齐，视线垂直，估读到分度值下一位", errors: ["视差", "刻度尺未放正", "起点未对准零刻度"] }
      ],
      rules: ["先确定研究对象和参照物，再判断运动状态。", "比较快慢时，优先统一时间或统一路程。", "平均速度只表示全程粗略快慢，不代表每一时刻都一样快。"],
      confusions: ["路程不等于位移；平均速度不等于速度平均值。", "时间测量和长度测量的误差会传递到速度计算。"],
      transfer: ["跑步比赛 -> 测路程和时间 -> 比较速度", "交通区间测速 -> 总路程/总时间 -> 平均速度"],
      next_questions: ["速度改变的原因是什么？", "测量误差如何影响计算结果？"]
    },
    "声现象": {
      question: "声音怎样产生、传播，并被人耳区分？",
      core_model: "声现象 = 振动产生声音 + 介质传播声音 + 频率/振幅/材料决定听感。",
      reasoning_path: ["物体振动", "介质传播", "人耳接收", "用音调、响度、音色区分"],
      variables: [
        { symbol: "f", name: "频率", unit: "Hz", meaning: "每秒振动次数，决定音调高低" },
        { symbol: "A", name: "振幅", unit: "", meaning: "振动偏离平衡位置的程度，影响响度" },
        { symbol: "v声", name: "声速", unit: "m/s", meaning: "声音在介质中传播的快慢" }
      ],
      measurement: [
        { quantity: "声音强弱", tool: "分贝仪", reading: "读取声级dB，注意环境背景噪声", errors: ["距离声源不同", "背景噪声干扰", "仪器响应延迟"] },
        { quantity: "频率", tool: "示波器/频率计", reading: "观察周期或直接读频率", errors: ["波形不稳定", "采样设置不当"] }
      ],
      rules: ["一切发声体都在振动。", "真空不能传声。", "频率高音调高，振幅大响度大，材料和结构影响音色。"],
      confusions: ["声音传播需要介质，但光传播不需要介质。", "音调和响度是两个维度。", "超声波不是声音更响，而是频率高于人耳听觉上限。"],
      transfer: ["吉他弦振动 -> 音调和响度", "医院B超 -> 超声波成像", "隔音材料 -> 减弱噪声传播"],
      next_questions: ["波动思想如何迁移到光和电磁波？", "如何用图像表示振动和频率？"]
    },
    "力": {
      question: "力如何改变物体形状或运动状态？怎样把受力情况画清楚？",
      core_model: "力的分析 = 施力物体 + 受力物体 + 大小 + 方向 + 作用点。",
      reasoning_path: ["找研究对象", "找接触或场作用", "标出力的三要素", "判断力的效果"],
      variables: [
        { symbol: "F", name: "力", unit: "N", meaning: "物体对物体的作用" },
        { symbol: "G", name: "重力", unit: "N", meaning: "地球吸引物体产生的力" },
        { symbol: "f", name: "摩擦力", unit: "N", meaning: "阻碍相对运动或相对运动趋势的力" }
      ],
      measurement: [
        { quantity: "力", tool: "弹簧测力计", reading: "先调零，沿弹簧轴线读数，读到分度值", errors: ["未调零", "斜拉读数", "超过量程"] }
      ],
      rules: ["受力分析先隔离研究对象。", "重力方向总是竖直向下。", "摩擦力方向与相对运动或相对运动趋势相反。"],
      confusions: ["平衡力作用在同一物体上；相互作用力作用在两个物体上。", "有力不一定运动，运动也不一定需要持续受力。"],
      transfer: ["推箱子 -> 推力、摩擦力、重力、支持力", "弹簧拉物体 -> 弹力大小与形变量相关"],
      next_questions: ["合力为零时物体怎样运动？", "力怎样参与做功？"]
    },
    "运动和力": {
      question: "物体为什么会保持原状态，什么情况下运动状态会改变？",
      core_model: "运动状态变化 = 受力不平衡；保持原状态 = 惯性和受力平衡。",
      reasoning_path: ["分析受力", "判断是否平衡", "联系运动状态", "解释现象"],
      variables: [
        { symbol: "F合", name: "合力", unit: "N", meaning: "多个力共同作用的等效力" },
        { symbol: "m", name: "质量", unit: "kg", meaning: "惯性大小的量度" }
      ],
      measurement: [],
      rules: ["合力为零，物体可能静止或匀速直线运动。", "合力不为零，物体运动状态一定改变。", "惯性只与质量有关。"],
      confusions: ["惯性不是力，不能说受到惯性。", "速度大不一定受力大。"],
      transfer: ["急刹车身体前倾 -> 惯性", "匀速行驶汽车 -> 牵引力与阻力平衡"],
      next_questions: ["力沿位移方向作用时是否做功？", "运动状态变化如何与能量变化联系？"]
    },
    "压强": {
      question: "同样的力为什么作用效果不同？液体和气体压力怎样传递？",
      core_model: "压强 = 压力作用效果 = 压力 / 受力面积。",
      reasoning_path: ["确定压力", "确定受力面积", "计算或比较压强", "分析增大/减小方法"],
      variables: [
        { symbol: "p", name: "压强", unit: "Pa", meaning: "单位面积上受到的压力" },
        { symbol: "F", name: "压力", unit: "N", meaning: "垂直压在物体表面上的力" },
        { symbol: "S", name: "受力面积", unit: "m²", meaning: "压力实际作用的面积" }
      ],
      measurement: [
        { quantity: "压强", tool: "压强计/压力传感器", reading: "观察液面高度差或传感器数值", errors: ["未调零", "探头深度不稳定", "单位换算错误"] }
      ],
      rules: ["压力相同，面积越小压强越大。", "面积相同，压力越大压强越大。", "液体压强随深度和密度增大而增大。"],
      confusions: ["压力不一定等于重力。", "受力面积是实际接触面积，不是物体总面积。"],
      transfer: ["刀刃很薄 -> 减小面积增大压强", "坦克履带 -> 增大面积减小压强"],
      next_questions: ["液体内部的压力差如何产生浮力？", "流体流速变化会怎样影响压强？"]
    },
    "浮力": {
      question: "物体在液体或气体中为什么会受到向上的力？怎样判断浮沉？",
      core_model: "浮力来自上下表面压力差，大小等于排开液体所受重力。",
      reasoning_path: ["分析液体压强差", "确定排开液体体积", "计算浮力", "比较浮力与重力判断浮沉"],
      variables: [
        { symbol: "F浮", name: "浮力", unit: "N", meaning: "液体或气体对物体向上的托力" },
        { symbol: "ρ液", name: "液体密度", unit: "kg/m³", meaning: "影响浮力大小的介质属性" },
        { symbol: "V排", name: "排开液体体积", unit: "m³", meaning: "物体浸入液体后排开的液体体积" }
      ],
      measurement: [
        { quantity: "浮力", tool: "弹簧测力计", reading: "空气中重力减去液体中示数", errors: ["物体碰到容器壁", "未完全静止读数", "液体溅出或体积读数不准"] }
      ],
      rules: ["F浮 > G 上浮；F浮 = G 悬浮或漂浮；F浮 < G 下沉。", "浸没后继续加深，V排不变则浮力不变。"],
      confusions: ["漂浮时浮力等于重力，但不一定等于最大浮力。", "浮力大小与物体在液体中的深度不直接成正比。"],
      transfer: ["轮船漂浮 -> 排开水的重力等于船重", "潜水艇 -> 改变自身重力实现浮沉"],
      next_questions: ["浮力怎样与压强联系？", "密度怎样帮助判断物体浮沉？"]
    },
    "功和功率": {
      question: "力做了多少功？做功快慢怎样比较？",
      core_model: "功 = 力在力方向上的位移效果；功率 = 单位时间内完成的功。",
      reasoning_path: ["判断是否做功", "计算 W=Fs", "引入时间 t", "比较 P=W/t", "联系速度得到 P=Fv"],
      variables: [
        { symbol: "W", name: "功", unit: "J", meaning: "力在位移方向上的作用效果" },
        { symbol: "F", name: "力", unit: "N", meaning: "做功的作用力" },
        { symbol: "s", name: "距离", unit: "m", meaning: "物体在力方向上移动的距离" },
        { symbol: "t", name: "时间", unit: "s", meaning: "完成这些功所用时间" },
        { symbol: "P", name: "功率", unit: "W", meaning: "做功快慢" },
        { symbol: "v", name: "速度", unit: "m/s", meaning: "单位时间内通过的距离" }
      ],
      measurement: [
        { quantity: "力", tool: "弹簧测力计", reading: "沿运动方向读力", errors: ["拉力方向与位移方向不一致", "读数时物体未匀速"] },
        { quantity: "距离", tool: "刻度尺/卷尺", reading: "测量力方向上的位移", errors: ["测了路径而非力方向距离", "估读不规范"] },
        { quantity: "时间", tool: "秒表", reading: "从开始做功到结束做功的时间", errors: ["起停不同步", "反应时间"] }
      ],
      rules: ["做功必须同时有力和力方向上的距离。", "功率比较的是快慢：功相同看时间，时间相同看功。", "匀速拉动物体时 P=W/t=Fs/t=Fv。"],
      confusions: ["功表示多少，功率表示快慢。", "有力不一定做功，例如提着书水平走。", "机械效率表示有用功比例，不等于功率。"],
      transfer: ["爬楼比赛 -> 克服重力做功相近，用时短功率大", "汽车加速 -> 牵引力和速度共同影响输出功率"],
      next_questions: ["做的功是否都有用？", "功率大是否一定效率高？", "电功率与机械功率有什么共同模型？"]
    },
    "功和机械能": {
      question: "做功怎样引起能量变化？机械装置怎样提升效果？",
      core_model: "做功是能量转化的量度，机械能包括动能和势能。",
      reasoning_path: ["分析受力和位移", "判断做功", "联系能量变化", "比较有用功和总功"],
      variables: [
        { symbol: "η", name: "机械效率", unit: "%", meaning: "有用功占总功的比例" },
        { symbol: "Ek", name: "动能", unit: "J", meaning: "物体由于运动具有的能" },
        { symbol: "Ep", name: "势能", unit: "J", meaning: "物体由于位置或形变具有的能" }
      ],
      measurement: [],
      rules: ["速度越大、质量越大，动能越大。", "高度越高、质量越大，重力势能越大。", "效率只表示有用程度，不表示做功快慢。"],
      confusions: ["机械效率和功率是两个不同维度：效率看比例，功率看快慢。", "能量守恒不等于机械能一定守恒。"],
      transfer: ["过山车 -> 重力势能和动能转化", "滑轮组 -> 省力但有额外功"],
      next_questions: ["能量怎样在热、电、机械之间转化？", "如何减少额外功提高效率？"]
    },
    "简单机械": {
      question: "怎样用机械改变力的大小、方向或距离？",
      core_model: "简单机械不省功，只是在力和距离之间重新分配。",
      reasoning_path: ["找支点/绳段/斜面", "比较力臂或承担重物的绳段数", "判断省力、省距离或改变方向", "分析额外功和效率"],
      variables: [
        { symbol: "l", name: "力臂", unit: "m", meaning: "支点到力作用线的距离" },
        { symbol: "n", name: "承担重物绳段数", unit: "", meaning: "滑轮组中共同承担重物的绳子段数" }
      ],
      measurement: [],
      rules: ["省力一定费距离。", "定滑轮改变力方向，动滑轮省力。", "杠杆平衡条件是动力×动力臂=阻力×阻力臂。"],
      confusions: ["机械省力不省功。", "力臂不是支点到力作用点的距离，而是到力作用线的垂直距离。"],
      transfer: ["撬棍 -> 增大动力臂省力", "滑轮组吊重物 -> 多段绳分担重力"],
      next_questions: ["为什么实际机械效率小于100%？", "机械做功怎样与功率联系？"]
    },
    "质量与密度": {
      question: "物质多少和疏密程度怎样测量与判断？",
      core_model: "密度 = 质量 / 体积，是识别物质和分析浮沉的重要桥梁。",
      reasoning_path: ["测质量", "测体积", "计算密度", "比较物质或浮沉"],
      variables: [
        { symbol: "m", name: "质量", unit: "kg/g", meaning: "物体所含物质的多少" },
        { symbol: "V", name: "体积", unit: "m³/cm³", meaning: "物体占据空间大小" },
        { symbol: "ρ", name: "密度", unit: "kg/m³ 或 g/cm³", meaning: "单位体积的质量" }
      ],
      measurement: [
        { quantity: "质量", tool: "天平", reading: "左物右码，游码读数加砝码", errors: ["未调平", "物码放反", "游码读数错误"] },
        { quantity: "体积", tool: "量筒/刻度尺", reading: "视线与凹液面最低处相平", errors: ["仰视俯视", "物体未完全浸没", "单位换算错误"] }
      ],
      rules: ["同种物质密度一般不随质量和体积改变。", "单位换算是密度题高频失分点。"],
      confusions: ["质量大不一定密度大。", "密度是物质属性，体积和质量是物体属性。"],
      transfer: ["鉴别金属 -> 测m和V算ρ", "空心问题 -> 比较实际密度和材料密度"],
      next_questions: ["密度怎样影响浮力？", "测量误差怎样影响密度计算？"]
    }
  };

  const overrides = {
    mech_power: {
      question: "怎样比较两个人或机器做功的快慢？",
      core_model: "功率把“做了多少功”与“用了多少时间”合在一起比较。",
      reasoning_path: ["先判断做功 W=Fs", "再测完成这些功的时间 t", "用 P=W/t 比较快慢", "若匀速且力沿运动方向，可转化为 P=Fv"],
      variables: [
        { symbol: "P", name: "功率", unit: "W", meaning: "单位时间内完成的功" },
        { symbol: "W", name: "功", unit: "J", meaning: "力在力方向上的位移效果" },
        { symbol: "t", name: "时间", unit: "s", meaning: "做功过程持续的时间" },
        { symbol: "F", name: "力", unit: "N", meaning: "对物体做功的力" },
        { symbol: "s", name: "距离", unit: "m", meaning: "物体在力方向上通过的距离" },
        { symbol: "v", name: "速度", unit: "m/s", meaning: "s/t，连接功率与运动快慢" }
      ],
      measurement: [
        { quantity: "时间", tool: "秒表/停表", reading: "从开始做功到结束做功，读到分度值", errors: ["起停不同步", "反应时间"] },
        { quantity: "距离", tool: "刻度尺/卷尺", reading: "测力方向上的距离", errors: ["测错方向", "估读不规范"] },
        { quantity: "力", tool: "弹簧测力计", reading: "沿运动方向匀速拉动时读数", errors: ["斜拉", "未匀速", "超过量程"] }
      ],
      rules: ["功相同，时间越短功率越大。", "时间相同，做功越多功率越大。", "匀速直线拉动且力与速度同向时：P=W/t=Fs/t=Fv。"],
      confusions: ["功率大不代表效率高。", "功率大表示做功快，不一定总功多。", "比较功率前要统一单位：J、s、W。"],
      transfer: ["爬楼梯实验 -> mgh/t 估算人体功率", "汽车发动机 -> Fv 解释牵引力、速度和输出功率"],
      next_questions: ["机械效率如何描述有用功比例？", "电功率与机械功率是否同样表示能量转化快慢？"]
    },
    mech_work: {
      question: "什么时候力对物体做了功？做了多少？",
      reasoning_path: ["找作用在物体上的力", "判断物体是否在力方向上移动", "用 W=Fs 计算", "再引出单位时间做功即功率"],
      rules: ["有力、有距离、距离在力的方向上，三者同时满足才做功。", "力和位移垂直时不做功。", "功是标量，只讨论做功多少。"],
      confusions: ["提着书水平走，人对书的支持力不做功。", "累不等于物理上一定做功。"]
    },
    mech_time_measure: {
      question: "怎样可靠地测量一个过程用了多久？",
      core_model: "时间测量关注的是时间间隔，不只是某一时刻。",
      reasoning_path: ["确定起点事件", "确定终点事件", "选择合适量程和分度值", "多次测量减小偶然误差"],
      rules: ["先看量程和分度值，再读数。", "测短时间可测多次或测多个周期再平均。", "起停时刻必须与研究过程一致。"],
      confusions: ["秒表读数不是只看一根指针。", "反应时间属于测量误差来源。"]
    },
    mech_length_measure: {
      question: "怎样把距离、长度或位移测得可信？",
      core_model: "长度测量 = 工具分度值 + 正确放置 + 垂直读数 + 合理估读。",
      reasoning_path: ["选择合适刻度尺", "零刻度或整刻度对齐", "视线垂直刻度", "估读到分度值下一位", "分析误差来源"],
      rules: ["读数包含准确值和估读值。", "多次测量取平均可减小偶然误差。", "测功时要测力方向上的距离。"],
      confusions: ["误差不可避免，错误可以避免。", "分度值越小通常测量越精确。"]
    },
    mech_motion_speed: {
      question: "怎样用一个量描述运动快慢？",
      reasoning_path: ["测路程 s", "测时间 t", "用 v=s/t 得到快慢", "通过图像或单位理解速度"],
      rules: ["速度是比值定义，比较前注意单位。", "s-t 图像越陡，速度越大。", "速度可以连接到功率：P=Fv。"]
    },
    mech_force_concept: {
      question: "物体之间怎样相互作用并改变形状或运动状态？",
      reasoning_path: ["找两个物体", "判断相互作用", "描述力的三要素", "观察力的效果"]
    },
    mech_force_diagram: {
      question: "怎样把看不见的力画成可分析的图？",
      core_model: "力的示意图用带箭头线段表示力的作用点、方向和大小关系。",
      reasoning_path: ["确定研究对象", "找出所有受力", "从作用点沿力方向画箭头", "标出力的名称和符号"],
      rules: ["先画重力和支持力，再补充拉力、压力、摩擦力。", "箭头方向必须表示力的方向。", "同一图中线段长短可粗略表示力的大小关系。"],
      confusions: ["不要把施力物体受到的力画到受力物体上。", "摩擦力不一定总是向后，要看相对运动或趋势。"]
    },
    mech_pressure: {
      question: "为什么同样的力，尖锐物体更容易刺入？",
      reasoning_path: ["找压力 F", "找受力面积 S", "用 p=F/S 比较作用效果", "联系增大或减小压强的方法"]
    },
    mech_archimedes: {
      question: "浮力大小到底由什么决定？",
      reasoning_path: ["物体浸入液体", "排开一定体积液体", "排开液体有重力", "浮力等于排开液体所受重力"]
    },
    mech_efficiency: {
      question: "机器做的功有多少真正用在目标上？",
      core_model: "机械效率 = 有用功 / 总功，描述有用程度，不描述快慢。",
      rules: ["η 越高，额外功占比越小。", "η 与 P 不同：效率看比例，功率看快慢。", "实际机械有摩擦和自重，效率小于100%。"],
      confusions: ["省力机械不一定效率高。", "功率大不等于机械效率高。"]
    },
    mech_lever_balance: {
      question: "杠杆为什么能省力，平衡时满足什么关系？",
      core_model: "杠杆平衡取决于力和力臂的乘积：F1l1=F2l2。",
      reasoning_path: ["找支点", "画动力和阻力", "作力臂", "比较力×力臂"],
      rules: ["动力臂越长越省力。", "力臂是支点到力作用线的垂直距离。", "等臂杠杆既不省力也不费力。"],
      confusions: ["力臂不是杠杆长度。", "省力杠杆会费距离，不省功。"]
    },
    mech_pulley: {
      question: "滑轮怎样改变力的方向或大小？",
      core_model: "定滑轮改变方向，动滑轮省力，滑轮组用多段绳分担重物。",
      reasoning_path: ["判断定滑轮或动滑轮", "数承担重物绳段", "估算拉力", "分析绳端移动距离"],
      rules: ["理想滑轮组中 F≈G/n。", "绳端移动距离通常是重物上升距离的 n 倍。", "实际滑轮组要考虑动滑轮重和摩擦。"],
      confusions: ["省力不等于省功。", "改变方向不一定省力。"]
    },
    mech_kinetic_energy: {
      question: "运动物体的能量由哪些因素决定？",
      core_model: "动能与质量和速度有关，速度影响更显著。",
      reasoning_path: ["物体在运动", "比较质量", "比较速度", "判断动能大小"],
      rules: ["质量相同，速度越大动能越大。", "速度相同，质量越大动能越大。", "交通安全中速度变化会显著影响危险程度。"],
      confusions: ["运动快不一定质量大，但动能可能很大。", "动能不是速度本身，而是物体具有的能量。"]
    },
    mech_potential_energy: {
      question: "被举高或发生形变的物体为什么具有能量？",
      core_model: "势能来自位置或形变储存的能量。",
      reasoning_path: ["判断是否被举高或形变", "比较质量/高度/形变程度", "分析能量转化"],
      rules: ["质量越大、高度越高，重力势能越大。", "弹性形变越大，弹性势能越大。", "势能可以转化为动能。"],
      confusions: ["高度要相对参考平面讨论。", "发生塑性形变不等于一定能完全恢复弹性势能。"]
    },
    mech_mechanical_energy: {
      question: "动能和势能怎样相互转化？",
      core_model: "机械能 = 动能 + 势能；忽略阻力时机械能守恒。",
      reasoning_path: ["识别动能和势能", "判断转化方向", "考虑阻力做功", "分析机械能是否守恒"],
      rules: ["下落时重力势能减少、动能增加。", "有摩擦时部分机械能转化为内能。", "机械能守恒需要忽略阻力和其他能量损失。"],
      confusions: ["能量守恒不等于机械能守恒。", "速度为零时可能仍有势能。"]
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeThinking(base, extra) {
    const result = Object.assign({}, base || {}, extra || {});
    ["reasoning_path", "variables", "measurement", "rules", "confusions", "transfer", "next_questions"].forEach(key => {
      if (extra && extra[key]) result[key] = extra[key];
    });
    return result;
  }

  function applyTo(data) {
    data.forEach(node => {
      if (node.module !== "力学") return;
      const template = clone(chapterTemplates[node.chapter] || chapterTemplates["力"] || {});
      const override = clone(overrides[node.id] || {});
      node.thinking = mergeThinking(template, override);
    });
    return data;
  }

  return { chapterTemplates, overrides, applyTo };
})();
