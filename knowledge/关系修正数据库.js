window._RELATION_PATCH_DATA = (function() {
  const remove = [
    { from: 'opt_refraction_law', to: 'elec_current' },
    // 原始数据把“受力分析”线性接在“摩擦力”之后，并重复写了 prerequisite + causal。
    // 这里先移除该 pair，再按“受力分析 = 汇聚型方法节点”重建关系。
    { from: 'mech_friction', to: 'mech_force_analysis' }
  ];

  const add = [
    {
      from: 'mech_force_diagram',
      to: 'mech_force_analysis',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '受力分析需要先能用力的示意图准确表示力的方向、作用点和作用线。'
    },
    {
      from: 'mech_force_gravity',
      to: 'mech_force_analysis',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '重力是初中受力分析中最常见的基本力之一，应直接汇入受力分析。'
    },
    {
      from: 'mech_force_elastic',
      to: 'mech_force_analysis',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '支持力、拉力等接触力在初中阶段可由弹力统一理解，是受力分析的核心力类型。'
    },
    {
      from: 'mech_friction',
      to: 'mech_force_analysis',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '摩擦力是受力分析的重要基本力之一，但不是受力分析的唯一来源。'
    },
    {
      from: 'mech_pressure_force',
      to: 'mech_force_analysis',
      type: 'parallel',
      color: '',
      width: 2,
      strength: 4,
      note: '压力是接触面间的作用力，在涉及压强、接触面问题时应纳入受力分析。'
    },
    {
      from: 'mech_buoyancy_cause',
      to: 'mech_force_analysis',
      type: 'parallel',
      color: '',
      width: 2,
      strength: 4,
      note: '浮力问题同样需要把浮力与重力、拉力等共同放入受力分析。'
    },
    {
      from: 'mech_force_analysis',
      to: 'mech_balance_forces',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '判断二力平衡前，应先完整识别研究对象受到的力。'
    },
    {
      from: 'mech_force_analysis',
      to: 'mech_force_motion_state',
      type: 'prerequisite',
      color: '',
      width: 2,
      strength: 5,
      note: '分析力与运动状态的关系前，应先完成研究对象的受力分析。'
    },
    {
      from: 'opt_light_speed',
      to: 'elec_电磁波',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '光是电磁波的一种，在真空中传播速度与电磁波相同，均约为3×10^8m/s。'
    },
    {
      from: 'opt_light_speed',
      to: 'opt_dispersion',
      type: 'causal',
      color: '',
      width: 2,
      strength: 3,
      note: '不同频率/波长的色光在介质中传播速度不同，折射程度不同，形成色散。'
    },
    {
      from: 'opt_dispersion',
      to: 'opt_红外线与紫外线',
      type: 'parallel',
      color: '',
      width: 2,
      strength: 4,
      note: '可见光、红外线、紫外线都属于电磁波谱，只是频率和波长范围不同。'
    },
    {
      from: 'opt_红外线与紫外线',
      to: 'elec_电磁波',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '红外线和紫外线是不可见电磁波，应与电磁波谱建立联系。'
    },
    {
      from: 'opt_光路可逆性',
      to: 'elec_光纤通信',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '光纤通信利用光的全反射原理传递信息，是光路可逆性和反射定律的重要应用。'
    },
    {
      from: 'elec_电磁波',
      to: 'elec_互联网',
      type: 'causal',
      color: '',
      width: 2,
      strength: 3,
      note: '互联网依赖于电磁波在各种传输介质（光纤、电缆、无线）中传递数据。'
    },
    {
      from: 'elec_家庭电路',
      to: 'elec_电话',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 3,
      note: '传统固定电话线路与家庭电路同属建筑布线系统，但电压和安全要求不同。'
    },
    {
      from: 'opt_light_speed',
      to: 'energy_nuclear_energy',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 5,
      note: '真空光速c不仅描述光传播的快慢，更出现在质能方程E=mc²中连接质量与能量。核反应中质量亏损Δm释放能量ΔE=Δm·c²，c²≈9×10¹⁶m²/s²是巨大换算系数。这是狭义相对论的核心成果。'
    },
    {
      from: 'therm_热传递方向',
      to: 'energy_directionality',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 5,
      note: '热传递的方向性（自发从高温到低温）与能量转化转移的方向性本质是同一个基本原理——热力学第二定律。孤立系统的熵不会自发减少，这是时间之矢（时间单向性）的物理基础。'
    },
    {
      from: 'mech_friction',
      to: 'therm_改变内能的方式',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '摩擦力做功将宏观机械能转化为微观分子热运动的动能（内能上升），是机械能→内能转化最典型的途径。这体现了能量转化的方向性：机械能可完全转化为内能，但内能不能自发完全转化为机械能。'
    },
    {
      from: 'mech_work',
      to: 'elec_electric_work',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '力学中W=Fs（力×位移），电磁学中W=UIt=Uq（电压×电荷量），两者都是能量转移量的量度。在更普遍的物理图景中，功的本质是能量从一种形式转化为另一种形式的量度。'
    },
    {
      from: 'opt_dispersion',
      to: 'elec_电磁波',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '可见光（波长约380~780nm）只是电磁波谱中人眼可感知的极窄一段。电磁波谱从长波无线电（千米级）到γ射线（皮米级），覆盖超过20个数量级的频率范围，所有电磁波在真空中都以光速c传播。'
    },
    {
      from: 'mech_sound_propagation',
      to: 'opt_light_speed',
      type: 'parallel',
      color: '',
      width: 2,
      strength: 4,
      note: '声波是机械波需要介质传播（空气中约340m/s），光波是电磁波不需要介质（真空中约3×10⁸m/s）。两者都遵循反射、折射等波动规律，但本质不同。真空中不能传声却能传光，因光本质是电磁场波动。'
    },
    {
      from: 'energy_nuclear_energy',
      to: 'elec_电磁波',
      type: 'cross_module',
      color: '',
      width: 2,
      strength: 4,
      note: '核反应（裂变、聚变）释放巨大能量的同时往往伴随γ射线（波长极短的电磁波）产生。核电站的发电过程本质是：核能→热能→机械能→电能，每一步都是能量形式的转化与传递。'
    }
  ];

  // ========================== 2026-09-27 全图谱关系体检 ==========================
  // auditRemove 删除“教材顺序误当知识依赖”、重复/关键词误连等关系。
  // auditAdd 只保留高置信度的前置、因果、并列与跨模块关系。
  const auditRemove = [
    {
      "from": "mech_uniform_motion",
      "to": "mech_variable_motion"
    },
    {
      "from": "mech_avg_speed",
      "to": "mech_instant_speed"
    },
    {
      "from": "mech_time_measure",
      "to": "mech_length_measure"
    },
    {
      "from": "mech_sound_production",
      "to": "mech_sound_propagation"
    },
    {
      "from": "mech_sound_speed",
      "to": "mech_pitch"
    },
    {
      "from": "mech_pitch",
      "to": "mech_loudness"
    },
    {
      "from": "mech_loudness",
      "to": "mech_timbre"
    },
    {
      "from": "mech_sound_speed",
      "to": "mech_ultrasound_infrasound"
    },
    {
      "from": "mech_mass_measurement",
      "to": "mech_density"
    },
    {
      "from": "mech_density_measurement",
      "to": "mech_material_identification"
    },
    {
      "from": "mech_inertia",
      "to": "mech_balance_forces"
    },
    {
      "from": "mech_balance_forces",
      "to": "mech_force_composition"
    },
    {
      "from": "mech_liquid_pressure",
      "to": "mech_atmospheric_pressure"
    },
    {
      "from": "mech_pressure_measure",
      "to": "mech_fluid_pressure"
    },
    {
      "from": "mech_浮力应用_轮船",
      "to": "mech_浮力应用_潜水艇"
    },
    {
      "from": "mech_浮力应用_潜水艇",
      "to": "mech_浮力应用_气球飞艇"
    },
    {
      "from": "mech_lever_balance",
      "to": "mech_滑轮"
    },
    {
      "from": "mech_滑轮组",
      "to": "mech_inclined_plane"
    },
    {
      "from": "mech_power",
      "to": "mech_efficiency"
    },
    {
      "from": "therm_thermometer",
      "to": "therm_melting_freezing"
    },
    {
      "from": "therm_熔化吸热与凝固放热",
      "to": "therm_汽化与液化"
    },
    {
      "from": "therm_蒸发与沸腾",
      "to": "therm_液化方法"
    },
    {
      "from": "therm_汽化与液化",
      "to": "therm_升华与凝华"
    },
    {
      "from": "therm_扩散现象",
      "to": "therm_分子间作用力"
    },
    {
      "from": "therm_改变内能的方式",
      "to": "therm_热量"
    },
    {
      "from": "therm_热量",
      "to": "therm_热传递"
    },
    {
      "from": "therm_heat_calculation",
      "to": "therm_水的比热容"
    },
    {
      "from": "therm_水的比热容",
      "to": "therm_calorific_value"
    },
    {
      "from": "therm_晶体与非晶体",
      "to": "therm_沸点与气压"
    },
    {
      "from": "therm_蒸发致冷",
      "to": "therm_物态变化中的能量转化"
    },
    {
      "from": "therm_热力学第一定律",
      "to": "therm_热传递方向"
    },
    {
      "from": "opt_light_speed",
      "to": "opt_影子的形成"
    },
    {
      "from": "opt_日食与月食",
      "to": "opt_小孔成像"
    },
    {
      "from": "opt_镜面反射与漫反射",
      "to": "opt_平面镜成像"
    },
    {
      "from": "opt_平面镜应用",
      "to": "opt_球面镜"
    },
    {
      "from": "opt_凸透镜对光的作用",
      "to": "opt_凹透镜对光的作用"
    },
    {
      "from": "opt_u_2f成像",
      "to": "opt_f_u_2f成像"
    },
    {
      "from": "opt_f_u_2f成像",
      "to": "opt_u_f成像"
    },
    {
      "from": "opt_照相机",
      "to": "opt_投影仪"
    },
    {
      "from": "opt_投影仪",
      "to": "opt_放大镜"
    },
    {
      "from": "opt_放大镜",
      "to": "opt_眼镜与视力矫正"
    },
    {
      "from": "opt_reflection_law",
      "to": "opt_dispersion"
    },
    {
      "from": "opt_dispersion",
      "to": "opt_色光混合"
    },
    {
      "from": "opt_色光混合",
      "to": "opt_物体的颜色"
    },
    {
      "from": "opt_物体的颜色",
      "to": "opt_红外线与紫外线"
    },
    {
      "from": "elec_series_circuit",
      "to": "elec_parallel_circuit"
    },
    {
      "from": "elec_current",
      "to": "elec_voltage"
    },
    {
      "from": "elec_电流表",
      "to": "elec_voltage"
    },
    {
      "from": "elec_滑动变阻器",
      "to": "elec_ohm_law"
    },
    {
      "from": "elec_伏安法测电阻",
      "to": "elec_串联电路特点"
    },
    {
      "from": "elec_串联电路特点",
      "to": "elec_并联电路特点"
    },
    {
      "from": "elec_并联电路特点",
      "to": "elec_电路故障分析"
    },
    {
      "from": "elec_电能表",
      "to": "elec_electric_power"
    },
    {
      "from": "elec_额定功率与实际功率",
      "to": "elec_joule_law"
    },
    {
      "from": "elec_电热利用与防止",
      "to": "elec_家庭电路"
    },
    {
      "from": "elec_安全用电",
      "to": "elec_测电笔"
    },
    {
      "from": "elec_测电笔",
      "to": "elec_触电急救"
    },
    {
      "from": "elec_地磁场",
      "to": "elec_电流的磁效应"
    },
    {
      "from": "elec_电磁继电器",
      "to": "elec_磁场对电流的作用"
    },
    {
      "from": "elec_电流的磁效应",
      "to": "elec_磁场对电流的作用"
    },
    {
      "from": "elec_electromagnetic_induction",
      "to": "elec_电磁波"
    },
    {
      "from": "energy_energy_conservation",
      "to": "energy_energy_classification"
    },
    {
      "from": "energy_solar_energy",
      "to": "energy_nuclear_energy"
    },
    {
      "from": "energy_nuclear_fusion_fission",
      "to": "energy_renewable_nonrenewable"
    },
    {
      "from": "mech_archimedes",
      "to": "therm_水的比热容"
    },
    {
      "from": "mech_friction",
      "to": "elec_磁现象"
    },
    {
      "from": "mech_liquid_pressure",
      "to": "therm_沸点与气压"
    },
    {
      "from": "mech_fluid_pressure",
      "to": "therm_蒸发与沸腾"
    },
    {
      "from": "mech_mechanical_energy",
      "to": "elec_electric_power"
    },
    {
      "from": "therm_能量守恒定律_热学",
      "to": "opt_dispersion"
    },
    {
      "from": "opt_rectilinear_propagation",
      "to": "mech_motion_speed"
    },
    {
      "from": "opt_lens_imaging",
      "to": "elec_ohm_law"
    },
    {
      "from": "elec_current",
      "to": "therm_分子热运动"
    },
    {
      "from": "elec_电流的磁效应",
      "to": "mech_newton1"
    },
    {
      "from": "energy_energy_classification",
      "to": "mech_work"
    },
    {
      "from": "mech_force_gravity",
      "to": "mech_force_elastic"
    },
    {
      "from": "mech_force_elastic",
      "to": "mech_friction"
    },
    {
      "from": "mech_force_gravity",
      "to": "mech_pressure_force"
    },
    {
      "from": "mech_force_gravity",
      "to": "mech_buoyancy_cause"
    },
    {
      "from": "mech_pressure_force",
      "to": "mech_buoyancy_cause"
    },
    {
      "from": "mech_pressure",
      "to": "mech_archimedes"
    },
    {
      "from": "mech_liquid_pressure",
      "to": "mech_float_sink_condition"
    },
    {
      "from": "mech_length_measure",
      "to": "mech_motion_reference"
    },
    {
      "from": "mech_motion_reference",
      "to": "mech_avg_speed"
    },
    {
      "from": "mech_sound_propagation",
      "to": "mech_timbre"
    },
    {
      "from": "mech_sound_speed",
      "to": "mech_loudness"
    },
    {
      "from": "mech_atmospheric_pressure",
      "to": "mech_浮力应用_轮船"
    },
    {
      "from": "mech_滑轮",
      "to": "mech_power"
    },
    {
      "from": "therm_熔化吸热与凝固放热",
      "to": "therm_液化方法"
    },
    {
      "from": "therm_液化方法",
      "to": "therm_升华与凝华"
    },
    {
      "from": "therm_分子热运动",
      "to": "therm_热量"
    },
    {
      "from": "therm_扩散现象",
      "to": "therm_改变内能的方式"
    },
    {
      "from": "therm_分子间作用力",
      "to": "therm_热传递"
    },
    {
      "from": "therm_heat_calculation",
      "to": "therm_calorific_value"
    },
    {
      "from": "therm_水的比热容",
      "to": "therm_heat_engine_efficiency"
    },
    {
      "from": "therm_自然界水循环",
      "to": "therm_热膨胀"
    },
    {
      "from": "opt_light_source",
      "to": "opt_影子的形成"
    },
    {
      "from": "opt_light_speed",
      "to": "opt_日食与月食"
    },
    {
      "from": "opt_平面镜成像",
      "to": "opt_球面镜"
    },
    {
      "from": "opt_平面镜应用",
      "to": "opt_凹面镜"
    },
    {
      "from": "opt_u_f成像",
      "to": "opt_照相机"
    },
    {
      "from": "opt_light_speed",
      "to": "opt_dispersion"
    },
    {
      "from": "elec_摩擦起电",
      "to": "elec_导体与绝缘体"
    },
    {
      "from": "elec_series_circuit",
      "to": "elec_voltage"
    },
    {
      "from": "elec_parallel_circuit",
      "to": "elec_电压表"
    },
    {
      "from": "elec_影响电阻的因素",
      "to": "elec_ohm_law"
    },
    {
      "from": "elec_伏安法测电阻",
      "to": "elec_电路故障分析"
    },
    {
      "from": "elec_electric_power",
      "to": "elec_joule_law"
    },
    {
      "from": "elec_电能表",
      "to": "elec_额定功率与实际功率"
    },
    {
      "from": "elec_额定功率与实际功率",
      "to": "elec_电热利用与防止"
    },
    {
      "from": "elec_joule_law",
      "to": "elec_家庭电路"
    },
    {
      "from": "elec_电热利用与防止",
      "to": "elec_安全用电"
    },
    {
      "from": "elec_家庭电路",
      "to": "elec_触电急救"
    },
    {
      "from": "elec_地磁场",
      "to": "elec_电磁铁"
    },
    {
      "from": "elec_generator",
      "to": "elec_电磁波"
    },
    {
      "from": "elec_交流电",
      "to": "elec_电磁波"
    },
    {
      "from": "elec_变压器",
      "to": "elec_电磁波"
    },
    {
      "from": "energy_energy_conservation",
      "to": "energy_solar_energy"
    },
    {
      "from": "energy_nuclear_energy",
      "to": "energy_renewable_nonrenewable"
    },
    {
      "from": "energy_nuclear_fusion_fission",
      "to": "energy_sustainable_可持续发展"
    },
    {
      "from": "mech_newton1",
      "to": "mech_pressure"
    },
    {
      "from": "opt_透镜",
      "to": "elec_current"
    },
    {
      "from": "mech_newton1",
      "to": "therm_能量守恒定律_热学"
    },
    {
      "from": "elec_磁场对电流的作用",
      "to": "elec_generator"
    },
    {
      "from": "elec_electric_motor",
      "to": "elec_交流电"
    },
    {
      "from": "mech_sound_propagation",
      "to": "opt_light_speed"
    },
    {
      "from": "opt_光路可逆性",
      "to": "elec_光纤通信"
    },
    {
      "from": "elec_电磁波",
      "to": "elec_互联网"
    },
    {
      "from": "elec_家庭电路",
      "to": "elec_电话"
    },
    {
      "from": "therm_热传递方向",
      "to": "energy_directionality"
    }
  ];

  const auditAdd = [
    {
      "from": "mech_motion_speed",
      "to": "mech_variable_motion",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "速度概念分支到匀速与变速两类运动。"
    },
    {
      "from": "mech_variable_motion",
      "to": "mech_instant_speed",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "瞬时速度用于描述变速运动某一时刻的快慢。"
    },
    {
      "from": "mech_time_measure",
      "to": "mech_motion_speed",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "速度测量需要时间测量。"
    },
    {
      "from": "mech_length_measure",
      "to": "mech_motion_speed",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "速度测量需要长度/路程测量。"
    },
    {
      "from": "mech_time_measure",
      "to": "mech_avg_speed",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "平均速度计算需要总时间。"
    },
    {
      "from": "mech_length_measure",
      "to": "mech_avg_speed",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "平均速度计算需要总路程。"
    },
    {
      "from": "mech_uniform_motion",
      "to": "mech_variable_motion",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "匀速运动与变速运动是运动状态的并列分类。"
    },
    {
      "from": "mech_time_measure",
      "to": "mech_length_measure",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "时间测量与长度测量是机械运动实验的并列基础技能。"
    },
    {
      "from": "mech_avg_speed",
      "to": "mech_instant_speed",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "平均速度与瞬时速度是描述运动快慢的不同尺度。"
    },
    {
      "from": "mech_sound_production",
      "to": "mech_sound_propagation",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "声音的产生与传播是声现象的两个基础问题。"
    },
    {
      "from": "mech_sound_production",
      "to": "mech_pitch",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "音调源于发声体振动频率。"
    },
    {
      "from": "mech_sound_production",
      "to": "mech_loudness",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "响度与发声体振幅等因素有关。"
    },
    {
      "from": "mech_sound_production",
      "to": "mech_timbre",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "音色与发声体材料和结构有关。"
    },
    {
      "from": "mech_pitch",
      "to": "mech_loudness",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "音调与响度是声音的并列特性。"
    },
    {
      "from": "mech_pitch",
      "to": "mech_timbre",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "音调与音色是声音的并列特性。"
    },
    {
      "from": "mech_loudness",
      "to": "mech_timbre",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "响度与音色是声音的并列特性。"
    },
    {
      "from": "mech_pitch",
      "to": "mech_ultrasound_infrasound",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "超声波与次声波按频率范围定义，直接依赖频率/音调概念。"
    },
    {
      "from": "mech_sound_propagation",
      "to": "mech_noise_control",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "从声源、传播途径和接收端控制噪声，需要理解声音传播。"
    },
    {
      "from": "mech_loudness",
      "to": "mech_noise_control",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "噪声控制常以降低声强/响度为直接目标。"
    },
    {
      "from": "mech_mass",
      "to": "mech_density",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "密度定义中包含质量。"
    },
    {
      "from": "mech_mass_measurement",
      "to": "mech_density_measurement",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "测密度必须先能测质量。"
    },
    {
      "from": "mech_length_measure",
      "to": "mech_density_measurement",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "规则物体密度测量需要长度测量求体积。"
    },
    {
      "from": "mech_density",
      "to": "mech_material_identification",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "物质鉴别可利用密度这一物质特性。"
    },
    {
      "from": "mech_density",
      "to": "mech_hollow_problem",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "空心问题本质上利用密度关系判断体积或质量。"
    },
    {
      "from": "mech_density_measurement",
      "to": "mech_material_identification",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "实际鉴别物质常先测出密度再查表比较。"
    },
    {
      "from": "mech_material_identification",
      "to": "mech_hollow_problem",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "二者都是密度知识的应用分支。"
    },
    {
      "from": "mech_newton1",
      "to": "mech_balance_forces",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "平衡状态判断建立在运动状态不改变与合力关系的基础上。"
    },
    {
      "from": "mech_force_analysis",
      "to": "mech_force_composition",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "进行同一直线二力合成前要先识别研究对象所受的力。"
    },
    {
      "from": "mech_force_concept",
      "to": "mech_balanced_vs_interaction",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "区分平衡力和相互作用力需要明确力的施力/受力对象。"
    },
    {
      "from": "mech_pressure",
      "to": "mech_atmospheric_pressure",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "大气压强是压强概念在气体中的应用。"
    },
    {
      "from": "mech_pressure",
      "to": "mech_fluid_pressure",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "流体压强与流速关系建立在压强概念基础上。"
    },
    {
      "from": "mech_liquid_pressure",
      "to": "mech_atmospheric_pressure",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "液体压强与大气压强是流体压强的并列情境。"
    },
    {
      "from": "mech_force_analysis",
      "to": "mech_pressure_force",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "判断压力方向和作用对象需要受力分析。"
    },
    {
      "from": "mech_float_sink_condition",
      "to": "mech_浮力应用_潜水艇",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "潜水艇通过改变浮沉条件实现上浮、下潜和悬浮。"
    },
    {
      "from": "mech_float_sink_condition",
      "to": "mech_浮力应用_气球飞艇",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "气球飞艇应用物体浮沉条件。"
    },
    {
      "from": "mech_浮力应用_轮船",
      "to": "mech_浮力应用_潜水艇",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "轮船与潜水艇是浮力的并列应用。"
    },
    {
      "from": "mech_浮力应用_轮船",
      "to": "mech_浮力应用_气球飞艇",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "轮船与气球飞艇是浮力的并列应用。"
    },
    {
      "from": "mech_浮力应用_潜水艇",
      "to": "mech_浮力应用_气球飞艇",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "潜水艇与气球飞艇是浮力的并列应用。"
    },
    {
      "from": "mech_lever_balance",
      "to": "mech_滑轮",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "滑轮可用杠杆思想分析，但不是杠杆平衡条件的线性后继。"
    },
    {
      "from": "mech_lever",
      "to": "mech_滑轮",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "杠杆与滑轮是简单机械的并列类型。"
    },
    {
      "from": "mech_lever",
      "to": "mech_inclined_plane",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "杠杆与斜面是简单机械的并列类型。"
    },
    {
      "from": "mech_lever",
      "to": "mech_wheel_axle",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "杠杆与轮轴是简单机械的并列类型。"
    },
    {
      "from": "mech_滑轮组",
      "to": "mech_inclined_plane",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "滑轮组与斜面是不同的简单机械分支。"
    },
    {
      "from": "mech_work",
      "to": "mech_efficiency",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "机械效率比较有用功与总功，直接依赖功的概念。"
    },
    {
      "from": "mech_power",
      "to": "mech_efficiency",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "功率描述做功快慢，效率描述有用程度，二者是不同指标。"
    },
    {
      "from": "therm_temperature",
      "to": "therm_melting_freezing",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "物态变化需要以温度变化为基本描述量。"
    },
    {
      "from": "therm_temperature",
      "to": "therm_汽化与液化",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "汽化与液化过程与温度密切相关。"
    },
    {
      "from": "therm_temperature",
      "to": "therm_升华与凝华",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "升华与凝华是温度变化下的物态变化。"
    },
    {
      "from": "therm_melting_freezing",
      "to": "therm_汽化与液化",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "熔化/凝固与汽化/液化是并列的物态变化类型。"
    },
    {
      "from": "therm_melting_freezing",
      "to": "therm_升华与凝华",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "熔化/凝固与升华/凝华是并列的物态变化类型。"
    },
    {
      "from": "therm_汽化与液化",
      "to": "therm_升华与凝华",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "汽化/液化与升华/凝华是并列的物态变化类型。"
    },
    {
      "from": "therm_汽化与液化",
      "to": "therm_液化方法",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "液化方法直接基于液化概念。"
    },
    {
      "from": "therm_物质的构成",
      "to": "therm_分子间作用力",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "分子间作用力建立在物质由微粒构成的模型上。"
    },
    {
      "from": "therm_分子热运动",
      "to": "therm_internal_energy",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "内能包含分子无规则运动的动能。"
    },
    {
      "from": "therm_扩散现象",
      "to": "therm_分子间作用力",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "扩散现象和分子间作用力分别体现分子运动与相互作用。"
    },
    {
      "from": "therm_改变内能的方式",
      "to": "therm_热传递",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热传递是改变内能的基本方式之一。"
    },
    {
      "from": "therm_热传递",
      "to": "therm_热量",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热量用于量度热传递过程中转移的能量。"
    },
    {
      "from": "therm_specific_heat",
      "to": "therm_水的比热容",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "水的比热容是比热容概念的典型实例。"
    },
    {
      "from": "therm_热量",
      "to": "therm_specific_heat",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "比热容用于定量研究热传递中的热量关系。"
    },
    {
      "from": "therm_热量",
      "to": "therm_heat_calculation",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热量计算直接基于热量概念。"
    },
    {
      "from": "therm_热量",
      "to": "therm_calorific_value",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "热值用于描述燃料完全燃烧放出热量的能力。"
    },
    {
      "from": "therm_蒸发与沸腾",
      "to": "therm_沸点与气压",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "沸点与气压关系属于沸腾条件的深化。"
    },
    {
      "from": "therm_蒸发与沸腾",
      "to": "therm_蒸发致冷",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "蒸发致冷是蒸发吸热的直接应用。"
    },
    {
      "from": "therm_melting_freezing",
      "to": "therm_物态变化图像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "物态变化图像需要理解熔化/凝固过程。"
    },
    {
      "from": "therm_蒸发与沸腾",
      "to": "therm_物态变化图像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "完整物态变化图像也涉及沸腾过程。"
    },
    {
      "from": "therm_沸点与气压",
      "to": "therm_物态变化图像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "识别沸腾平台需要理解沸点。"
    },
    {
      "from": "therm_熔化吸热与凝固放热",
      "to": "therm_物态变化中的能量转化",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "物态变化能量分析包含熔化吸热与凝固放热。"
    },
    {
      "from": "therm_汽化与液化",
      "to": "therm_物态变化中的能量转化",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "物态变化能量分析包含汽化吸热与液化放热。"
    },
    {
      "from": "therm_升华与凝华",
      "to": "therm_物态变化中的能量转化",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "物态变化能量分析包含升华吸热与凝华放热。"
    },
    {
      "from": "therm_temperature",
      "to": "therm_热传递方向",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热传递方向由温度差决定。"
    },
    {
      "from": "therm_热传递",
      "to": "therm_热传递方向",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "判断热传递方向需要先理解热传递。"
    },
    {
      "from": "therm_internal_energy",
      "to": "therm_热力学第一定律",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热力学第一定律描述内能变化与做功、热传递的关系。"
    },
    {
      "from": "therm_改变内能的方式",
      "to": "therm_热力学第一定律",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "第一定律统一描述做功和热传递改变内能。"
    },
    {
      "from": "therm_temperature",
      "to": "therm_温度与分子运动",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "温度与分子热运动关系需要温度概念。"
    },
    {
      "from": "opt_rectilinear_propagation",
      "to": "opt_影子的形成",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "影子形成是光沿直线传播的直接结果。"
    },
    {
      "from": "opt_rectilinear_propagation",
      "to": "opt_小孔成像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "小孔成像直接体现光的直线传播。"
    },
    {
      "from": "opt_影子的形成",
      "to": "opt_日食与月食",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "日食与月食可用影子形成解释。"
    },
    {
      "from": "opt_reflection_law",
      "to": "opt_平面镜成像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "平面镜成像可由反射定律解释。"
    },
    {
      "from": "opt_reflection_law",
      "to": "opt_球面镜",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "凹面镜和凸面镜同样遵守反射定律。"
    },
    {
      "from": "opt_透镜",
      "to": "opt_凹透镜对光的作用",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "凹透镜是透镜的一个基本分支。"
    },
    {
      "from": "opt_凸透镜对光的作用",
      "to": "opt_凹透镜对光的作用",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "凸透镜与凹透镜是两类并列透镜。"
    },
    {
      "from": "opt_lens_imaging",
      "to": "opt_f_u_2f成像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "f<u<2f 是凸透镜成像规律的一个分支。"
    },
    {
      "from": "opt_lens_imaging",
      "to": "opt_u_f成像",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "u<f 是凸透镜成像规律的一个分支。"
    },
    {
      "from": "opt_u_2f成像",
      "to": "opt_f_u_2f成像",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "三种物距情形应并列比较。"
    },
    {
      "from": "opt_u_2f成像",
      "to": "opt_u_f成像",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "三种物距情形应并列比较。"
    },
    {
      "from": "opt_f_u_2f成像",
      "to": "opt_u_f成像",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "三种物距情形应并列比较。"
    },
    {
      "from": "opt_透镜",
      "to": "opt_眼镜与视力矫正",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "近视/远视矫正建立在透镜基础上。"
    },
    {
      "from": "opt_凸透镜对光的作用",
      "to": "opt_眼镜与视力矫正",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "远视矫正需要理解凸透镜会聚作用。"
    },
    {
      "from": "opt_凹透镜对光的作用",
      "to": "opt_眼镜与视力矫正",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "近视矫正需要理解凹透镜发散作用。"
    },
    {
      "from": "opt_refraction_law",
      "to": "opt_dispersion",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "色散本质上来自不同色光折射程度不同。"
    },
    {
      "from": "opt_dispersion",
      "to": "opt_色光混合",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "色散与色光混合是颜色研究的两个不同方向。"
    },
    {
      "from": "opt_reflection_law",
      "to": "opt_物体的颜色",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "不透明物体的颜色与选择性反射有关。"
    },
    {
      "from": "opt_色光混合",
      "to": "opt_物体的颜色",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "光源颜色与色光混合会影响物体呈现的颜色。"
    },
    {
      "from": "opt_dispersion",
      "to": "opt_红外线与紫外线",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "从光谱拓展到可见光之外的红外线与紫外线。"
    },
    {
      "from": "elec_电路",
      "to": "elec_parallel_circuit",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "并联电路是基本电路连接方式。"
    },
    {
      "from": "elec_current",
      "to": "elec_voltage",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电流和电压是描述电路的两个基本物理量。"
    },
    {
      "from": "elec_series_circuit",
      "to": "elec_parallel_circuit",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "串联和并联是基本电路的并列结构。"
    },
    {
      "from": "elec_电路",
      "to": "elec_voltage",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电压概念放在完整电路情境中理解。"
    },
    {
      "from": "elec_电路",
      "to": "elec_电流表",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电流表必须接入电路中测量电流。"
    },
    {
      "from": "elec_电路",
      "to": "elec_电压表",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电压表必须在电路中并联测量电压。"
    },
    {
      "from": "elec_电流表",
      "to": "elec_电压表",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电流表与电压表是电路测量的并列仪表。"
    },
    {
      "from": "elec_current",
      "to": "elec_ohm_law",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "欧姆定律涉及电流 I。"
    },
    {
      "from": "elec_voltage",
      "to": "elec_ohm_law",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "欧姆定律涉及电压 U。"
    },
    {
      "from": "elec_resistance",
      "to": "elec_ohm_law",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "欧姆定律涉及电阻 R。"
    },
    {
      "from": "elec_电流表",
      "to": "elec_伏安法测电阻",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "伏安法需要电流表测 I。"
    },
    {
      "from": "elec_电压表",
      "to": "elec_伏安法测电阻",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "伏安法需要电压表测 U。"
    },
    {
      "from": "elec_series_circuit",
      "to": "elec_串联电路特点",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "串联电路特点直接建立在串联结构上。"
    },
    {
      "from": "elec_parallel_circuit",
      "to": "elec_并联电路特点",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "并联电路特点直接建立在并联结构上。"
    },
    {
      "from": "elec_串联电路特点",
      "to": "elec_并联电路特点",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "串并联电路特点应进行并列比较。"
    },
    {
      "from": "elec_串联电路特点",
      "to": "elec_电路故障分析",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "串联故障判断需要掌握串联电路规律。"
    },
    {
      "from": "elec_并联电路特点",
      "to": "elec_电路故障分析",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "并联故障判断需要掌握并联电路规律。"
    },
    {
      "from": "elec_电流表",
      "to": "elec_电路故障分析",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "仪表示数是故障分析的重要证据。"
    },
    {
      "from": "elec_电压表",
      "to": "elec_电路故障分析",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "仪表示数是故障分析的重要证据。"
    },
    {
      "from": "elec_滑动变阻器",
      "to": "elec_伏安法测电阻",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "伏安法实验常用滑动变阻器改变/保护电路。"
    },
    {
      "from": "elec_electric_work",
      "to": "elec_electric_power",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "电功率是单位时间内电流做功。"
    },
    {
      "from": "elec_current",
      "to": "elec_joule_law",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "焦耳定律涉及电流。"
    },
    {
      "from": "elec_resistance",
      "to": "elec_joule_law",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "焦耳定律涉及电阻。"
    },
    {
      "from": "elec_电路",
      "to": "elec_家庭电路",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "家庭电路是基本电路知识的实际应用。"
    },
    {
      "from": "elec_家庭电路",
      "to": "elec_测电笔",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "测电笔用于家庭电路火线识别。"
    },
    {
      "from": "elec_安全用电",
      "to": "elec_触电急救",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "触电急救属于安全用电知识的处置分支。"
    },
    {
      "from": "elec_magnetic_field",
      "to": "elec_磁场对电流的作用",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "电流受力问题首先需要磁场概念。"
    },
    {
      "from": "elec_current",
      "to": "elec_磁场对电流的作用",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "磁场对电流的作用以通电导体为对象。"
    },
    {
      "from": "elec_电流的磁效应",
      "to": "elec_磁场对电流的作用",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电流产生磁场与磁场对电流施力是两个并列电磁效应。"
    },
    {
      "from": "elec_electromagnetic_induction",
      "to": "elec_变压器",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "变压器工作基础是电磁感应。"
    },
    {
      "from": "elec_电流的磁效应",
      "to": "elec_电磁波",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "初中层面可把电磁波与变化电流产生变化电磁场联系起来。"
    },
    {
      "from": "energy_energy_conservation",
      "to": "energy_energy_classification",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "能量守恒讨论能量转化规律，能源分类讨论能源来源/再生性，二者不是先后依赖。"
    },
    {
      "from": "energy_energy_classification",
      "to": "energy_nuclear_energy",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "核能是能源分类中的重要实例。"
    },
    {
      "from": "energy_energy_classification",
      "to": "energy_renewable_nonrenewable",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "可再生/不可再生本身就是能源分类维度。"
    },
    {
      "from": "energy_solar_energy",
      "to": "energy_nuclear_energy",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "太阳能和核能是能源类型的并列实例。"
    },
    {
      "from": "energy_solar_energy",
      "to": "energy_energy_environment",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "太阳能的环境影响是能源评价的一部分。"
    },
    {
      "from": "energy_nuclear_energy",
      "to": "energy_energy_environment",
      "type": "causal",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "核能的环境与安全影响是能源评价的一部分。"
    },
    {
      "from": "mech_newton1_core",
      "to": "mech_newton1",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "核心定律节点对应课程中的牛顿第一定律知识节点。"
    },
    {
      "from": "mech_archimedes_core",
      "to": "mech_archimedes",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "核心定律节点对应课程中的阿基米德原理知识节点。"
    },
    {
      "from": "mech_balance_forces_core",
      "to": "mech_balance_forces",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "核心定律节点对应课程中的二力平衡知识节点。"
    },
    {
      "from": "mech_atmospheric_pressure",
      "to": "therm_沸点与气压",
      "type": "cross_module",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "液体沸点随外界大气压变化，这是力学大气压与热学沸腾的真实交叉。"
    },
    {
      "from": "opt_light_speed",
      "to": "mech_motion_speed",
      "type": "cross_module",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "光速是速度概念在光传播中的特殊实例。"
    },
    {
      "from": "energy_energy_conservation",
      "to": "therm_能量守恒定律_热学",
      "type": "cross_module",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "热学中的能量守恒是总能量守恒定律在热过程中的具体化。"
    },
    {
      "from": "mech_force_diagram",
      "to": "mech_force_elastic",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "会画力的示意图后，再分别学习弹力。"
    },
    {
      "from": "mech_force_diagram",
      "to": "mech_friction",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "会画力的示意图后，再分别学习摩擦力。"
    },
    {
      "from": "mech_force_gravity",
      "to": "mech_force_elastic",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "重力与弹力是受力分析中的并列基本力类型。"
    },
    {
      "from": "mech_force_gravity",
      "to": "mech_friction",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "重力与摩擦力是受力分析中的并列基本力类型。"
    },
    {
      "from": "mech_force_elastic",
      "to": "mech_friction",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "弹力与摩擦力是接触力中的并列知识分支。"
    },
    {
      "from": "mech_liquid_pressure",
      "to": "mech_buoyancy_cause",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "浮力产生于液体对物体上下表面压力差，直接依赖液体压强。"
    },
    {
      "from": "elec_摩擦起电",
      "to": "elec_导体与绝缘体",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 3,
      "note": "摩擦起电与导体/绝缘体是静电与电学基础中的并列知识。"
    },
    {
      "from": "opt_u_2f成像",
      "to": "opt_照相机",
      "type": "prerequisite",
      "color": "",
      "width": 2,
      "strength": 5,
      "note": "照相机利用 u>2f 时成倒立、缩小实像。"
    },
    {
      "from": "elec_electric_motor",
      "to": "elec_generator",
      "type": "parallel",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "电动机与发电机分别实现电能↔机械能转换，是互为对照的电磁装置。"
    },
    {
      "from": "mech_sound_speed",
      "to": "opt_light_speed",
      "type": "cross_module",
      "color": "",
      "width": 2,
      "strength": 4,
      "note": "声速与光速都描述传播快慢，但声波需要介质而光在真空中也能传播。"
    }
  ];

  function samePair(a, b) {
    return (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from);
  }

  function applyTo(connections) {
    let result = connections.filter(conn => !remove.some(target => samePair(conn, target)));
    add.forEach(conn => {
      if (!result.some(existing => samePair(existing, conn))) result.push(conn);
    });

    result = result.filter(conn => !auditRemove.some(target => samePair(conn, target)));
    auditAdd.forEach(conn => {
      result = result.filter(existing => !samePair(existing, conn));
      result.push(conn);
    });

    // 一个概念对只保留一条主关系，避免同一对节点叠出两条线。
    const priority = { prerequisite: 6, causal: 5, cross_module: 4, cross_disciplinary: 3, parallel: 2, historical: 1 };
    const deduped = new Map();
    result.forEach(conn => {
      const key = [conn.from, conn.to].sort().join('||');
      const old = deduped.get(key);
      if (!old || (priority[conn.type] || 0) > (priority[old.type] || 0)) deduped.set(key, conn);
    });
    return Array.from(deduped.values());
  }

  return { remove, add, applyTo };
})();
