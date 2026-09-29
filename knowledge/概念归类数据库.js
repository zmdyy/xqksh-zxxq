window._META_CONCEPT_DATA = {
  "version": "1.1",
  "update_date": "2026-09-29",
  "description": "知识星球跨章节 Meta 概念归类层；支持多重归类和层级归类，不进入知识点数据库、AI标注或学习计数。",
  "meta_nodes": [
    {
      "id": "meta_material_properties",
      "name": "物质的物理属性",
      "aliases": [
        "物质属性",
        "材料物性"
      ],
      "description": "把不同章节中用于描述物质或材料特性的概念归在一起。它们彼此不是前置或因果关系，只是共享“物质物性”这一上位分类。",
      "members": [
        "mech_density",
        "therm_specific_heat",
        "therm_calorific_value",
        "therm_熔点与凝固点",
        "therm_沸点与气压",
        "elec_导体与绝缘体",
        "elec_magnetism_property"
      ],
      "note": "热值主要针对燃料；熔点、沸点等需注意物态与外界条件。"
    },
    {
      "id": "meta_measurement_tools",
      "name": "测量工具与仪表",
      "aliases": [
        "测量工具",
        "测量仪器"
      ],
      "description": "把初中物理常见测量活动和仪表集中起来，对应刻度尺、秒表、天平、温度计、量筒、电流表、电压表、电能表以及气压测量装置等。",
      "members": [
        "mech_length_measure",
        "mech_time_measure",
        "mech_mass_measurement",
        "therm_thermometer",
        "mech_density_measurement",
        "elec_电流表",
        "elec_电压表",
        "elec_电能表",
        "mech_pressure_measure"
      ],
      "note": "当前知识库部分节点以“测量活动”命名，因此量筒等具体工具通过对应测量节点进入本归类。"
    },
    {
      "id": "meta_indirect_measurement",
      "name": "间接测量",
      "aliases": [
        "间接测量法"
      ],
      "description": "不能或不便直接读出目标物理量时，先测其他物理量，再利用物理关系计算得到结果。",
      "members": [
        "mech_avg_speed",
        "mech_density_measurement",
        "mech_pressure_measure",
        "mech_buoyancy",
        "mech_efficiency",
        "elec_伏安法测电阻",
        "elec_measure_lamp_power"
      ],
      "note": "典型例子：测路程和时间求平均速度、测质量和体积求密度、托里拆利法测大气压、称重法求浮力、由有用功/总功求机械效率、伏安法测电阻、由UI求小灯泡电功率。",
      "member_notes": {
        "mech_avg_speed": "测量路程 s 和时间 t，再由 v=s/t 求平均速度。",
        "mech_density_measurement": "测质量 m 和体积 V，再由 ρ=m/V 求密度。",
        "mech_pressure_measure": "通过液柱高度等可测量量间接得到大气压。",
        "mech_buoyancy": "称重法用物体在空气中与液体中的示数差得到浮力。",
        "mech_efficiency": "测有用功和总功，再计算机械效率。",
        "elec_伏安法测电阻": "测 U、I，再由 R=U/I 求电阻。",
        "elec_measure_lamp_power": "测 U、I，再由 P=UI 求电功率。"
      }
    },
    {
      "id": "meta_ratio_quantities",
      "name": "比值定义与比值表征",
      "aliases": [
        "比值定义",
        "比值法"
      ],
      "description": "把通过“某量与另一量（或若干量乘积）的比”来定义或表征的物理量放在一起，帮助理解公式结构而不是机械记忆。",
      "members": [
        "mech_motion_speed",
        "mech_avg_speed",
        "mech_density",
        "mech_pressure",
        "mech_power",
        "mech_efficiency",
        "therm_specific_heat",
        "therm_calorific_value",
        "therm_heat_engine_efficiency",
        "elec_current",
        "elec_electric_power"
      ],
      "note": "电阻不放入本组，避免把 R=U/I 误解成“电阻随 U、I 的比值变化”的定义关系。"
    },
    {
      "id": "meta_per_time_quantities",
      "name": "单位时间表征",
      "aliases": [
        "单位时间量",
        "单位时间内"
      ],
      "description": "这些量都用“单位时间内发生多少”来刻画运动、振动、做功或电荷定向移动的快慢与强弱。",
      "members": [
        "mech_motion_speed",
        "mech_avg_speed",
        "mech_sound_speed",
        "mech_frequency",
        "mech_power",
        "elec_current",
        "elec_electric_power"
      ],
      "note": "这里是数学结构上的归类，不表示这些物理量具有相同物理意义。"
    },
    {
      "id": "meta_energy_forms",
      "name": "能量的形式",
      "aliases": [
        "能量形式"
      ],
      "description": "把不同模块中的具体能量形式放在一起，便于从统一的能量观点理解机械、热、电、化学和核过程。",
      "members": [
        "mech_mechanical_energy",
        "therm_internal_energy",
        "elec_electric_energy",
        "energy_chemical_energy",
        "energy_nuclear_energy",
        "energy_solar_energy"
      ],
      "note": "这里用于初中阶段知识整理：机械能、内能、电能、化学能、核能以及教材中的太阳能。太阳能更严格地说是能源来源/辐射能相关表述，因此只作课程层面的归类。"
    },
    {
      "id": "meta_energy_conversion_devices",
      "name": "能量转化装置",
      "aliases": [
        "能量转换装置"
      ],
      "description": "把教材中以能量形式转化为核心功能的典型装置归在一起。",
      "members": [
        "therm_heat_engine",
        "elec_electric_motor",
        "elec_generator"
      ],
      "note": "热机：内能到机械能；电动机：电能到机械能；发电机：机械能到电能。变压器主要改变交流电压，不归入“能量形式转化装置”。"
    },
    {
      "id": "meta_conservation_ideas",
      "name": "守恒思想",
      "aliases": [
        "守恒规律",
        "守恒观念"
      ],
      "description": "跨物理与化学比较不同的守恒规律，强调“研究对象不同，但都体现总量守恒的科学思想”。",
      "members": [
        "energy_energy_conservation",
        "therm_能量守恒定律_热学",
        "elec_charge_conservation",
        "sat_extension_化学_质量守恒"
      ],
      "note": "质量守恒与能量守恒是不同规律，只在“守恒思想”层面比较。"
    },
    {
      "id": "meta_control_variable",
      "name": "控制变量法",
      "aliases": [
        "控制变量"
      ],
      "description": "研究一个因素对结果的影响时，只改变该因素，并使其他可能影响结果的条件保持不变。一个实验可以同时使用控制变量法和其他实验方法。",
      "members": [
        "mech_pitch",
        "mech_loudness",
        "mech_pressure",
        "mech_liquid_pressure",
        "mech_buoyancy",
        "mech_friction_factors",
        "mech_kinetic_energy",
        "mech_gravitational_potential_energy",
        "therm_specific_heat",
        "opt_lens_imaging",
        "elec_影响电阻的因素",
        "elec_ohm_law",
        "elec_joule_law",
        "elec_electromagnet_factors",
        "elec_磁场对电流的作用",
        "elec_electromagnetic_induction"
      ],
      "note": "典型覆盖：音调/响度、压力作用效果、液体压强、浮力、滑动摩擦力、动能/重力势能影响因素、不同物质吸热能力、凸透镜成像、导体电阻、欧姆定律、焦耳定律、电磁铁、磁场对电流作用与电磁感应等。",
      "member_notes": {
        "mech_pitch": "研究音调与频率关系时控制材料、长度/振幅等其他条件。",
        "mech_loudness": "研究响度与振幅关系时控制声源、频率、距离等条件。",
        "mech_pressure": "探究压力作用效果与压力、受力面积的关系。",
        "mech_liquid_pressure": "探究液体压强与深度、液体密度等因素的关系。",
        "mech_buoyancy": "探究浮力与排开液体体积、液体密度等因素的关系。",
        "mech_friction_factors": "分别研究压力大小、接触面粗糙程度对滑动摩擦力的影响。",
        "mech_kinetic_energy": "探究动能与质量、速度的关系。",
        "mech_gravitational_potential_energy": "探究重力势能与质量、高度的关系。",
        "therm_specific_heat": "比较不同物质吸热能力时控制质量、加热条件等。",
        "opt_lens_imaging": "研究物距变化与成像性质时保持透镜焦距等条件不变。",
        "elec_影响电阻的因素": "分别研究材料、长度、横截面积、温度等因素。",
        "elec_ohm_law": "研究 I-U 或 I-R 关系时控制另一相关量。",
        "elec_joule_law": "分别研究电流、电阻、通电时间对产生热量的影响。",
        "elec_electromagnet_factors": "分别改变电流、匝数等研究磁性强弱。",
        "elec_磁场对电流的作用": "研究受力方向与电流方向、磁场方向的关系。",
        "elec_electromagnetic_induction": "探究产生感应电流的条件时逐项改变运动、磁场、回路状态。"
      }
    },
    {
      "id": "meta_visual_representation",
      "name": "物理图示与图像表征",
      "aliases": [
        "物理图示",
        "图像表征"
      ],
      "description": "用示意图、辅助线、场线或坐标图把方向、空间关系和数量变化表示出来，帮助把抽象关系变得可观察、可比较。",
      "members": [
        "mech_force_diagram",
        "therm_物态变化图像",
        "elec_magnetic_field_lines",
        "opt_normal",
        "opt_principal_axis",
        "math_linear_graph",
        "math_inverse_graph"
      ],
      "note": "这些表示方法的物理含义不同，本组只强调“用图来表征物理关系”的共同方法。"
    },
    {
      "id": "meta_ideal_experiment",
      "name": "理想实验法（科学推理法）",
      "aliases": [
        "理想实验法",
        "科学推理法",
        "实验推理法"
      ],
      "description": "在真实实验事实基础上，进一步排除难以完全消除的条件或把条件推向理想极限，再进行科学推理得到结论。",
      "members": [
        "mech_newton1",
        "mech_sound_propagation"
      ],
      "note": "初中最典型的是牛顿第一定律的实验—推理过程，以及逐渐抽气后声音减弱并进一步推理“真空不能传声”。",
      "member_notes": {
        "mech_newton1": "由斜面小车等实验事实出发，进一步推理到“完全不受力”这一理想条件。",
        "mech_sound_propagation": "真空罩实验无法获得绝对真空，通过空气逐渐减少、声音逐渐减弱进一步推理真空不能传声。"
      }
    },
    {
      "id": "meta_conversion_method",
      "name": "转换法",
      "aliases": [
        "转换法实验",
        "转换思想"
      ],
      "description": "把不易直接观察或测量的物理现象、物理量，转换成容易观察或测量的现象、效果或示数来研究。",
      "members": [
        "mech_sound_production",
        "mech_pressure",
        "mech_liquid_pressure",
        "mech_friction_factors",
        "mech_kinetic_energy",
        "mech_gravitational_potential_energy",
        "therm_分子热运动",
        "therm_specific_heat",
        "elec_electroscope",
        "elec_magnetic_field",
        "elec_oersted_experiment",
        "elec_joule_law",
        "elec_electromagnet_factors"
      ],
      "note": "同一实验可同时使用转换法和控制变量法，例如液体压强、动能影响因素、焦耳定律、电磁铁强弱等。",
      "member_notes": {
        "mech_sound_production": "用乒乓球、碎纸等明显运动放大/显示发声体不易观察的振动。",
        "mech_pressure": "用海绵或软材料的形变程度表示压力作用效果。",
        "mech_liquid_pressure": "用 U 形管两侧液面高度差表示液体压强大小。",
        "mech_friction_factors": "用弹簧测力计示数，在匀速运动条件下间接反映滑动摩擦力大小。",
        "mech_kinetic_energy": "用物体推动木块移动距离等效果反映动能大小。",
        "mech_gravitational_potential_energy": "用下落后产生的形变/移动效果反映重力势能大小。",
        "therm_分子热运动": "用宏观扩散现象反映肉眼看不见的分子无规则运动。",
        "therm_specific_heat": "在相同加热条件下，用加热时间或温升等可测量量比较吸热多少/吸热能力。",
        "elec_electroscope": "用金属箔张开等可观察现象判断物体是否带电。",
        "elec_magnetic_field": "用小磁针受力偏转等现象显示看不见的磁场作用。",
        "elec_oersted_experiment": "用小磁针偏转显示通电导线周围存在磁场。",
        "elec_joule_law": "用温度计示数、液体温升等反映电流产生热量的多少。",
        "elec_electromagnet_factors": "用吸引大头针数量等可观察效果表示电磁铁磁性强弱。"
      }
    },
    {
      "id": "meta_wind_energy",
      "name": "风能",
      "aliases": [
        "风的动能"
      ],
      "description": "流动空气具有的动能。初中阶段可把风能理解为大量空气定向运动所具有的动能。",
      "members": [
        "sat_application_应用_风力发电"
      ],
      "anchor_id": "mech_kinetic_energy",
      "note": "风力发电利用风的动能推动风轮，再经发电机转化为电能。"
    },
    {
      "id": "meta_water_energy",
      "name": "水能",
      "aliases": [
        "水的机械能",
        "流动水体能量"
      ],
      "description": "水体能够具有机械能。这里挂在动能下一级，主要表示流动水体的动能；实际水力发电中，高处水体还具有重力势能。",
      "members": [],
      "anchor_id": "mech_kinetic_energy",
      "note": "不要把水能理解为只有动能：水库蓄水常先具有重力势能，流动过程中再转化为动能。"
    }
  ],
  "hierarchy_edges": [
    {
      "child": "mech_kinetic_energy",
      "parent": "mech_mechanical_energy",
      "note": "动能是机械能的一种。"
    },
    {
      "child": "mech_gravitational_potential_energy",
      "parent": "mech_mechanical_energy",
      "note": "重力势能是机械能中的势能形式。"
    },
    {
      "child": "mech_elastic_potential_energy",
      "parent": "mech_mechanical_energy",
      "note": "弹性势能是机械能中的势能形式。"
    },
    {
      "child": "meta_wind_energy",
      "parent": "mech_kinetic_energy",
      "note": "风能在此按流动空气的动能理解。"
    },
    {
      "child": "meta_water_energy",
      "parent": "mech_kinetic_energy",
      "note": "此处强调流动水体的动能；水体还可能具有重力势能。"
    }
  ]
};
