window._META_CONCEPT_DATA = {
  "version": "1.0",
  "update_date": "2026-09-29",
  "description": "知识星球跨章节 Meta 概念归类层；不进入知识点数据库、AI标注或学习计数。",
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
        "mech_density_measurement",
        "mech_pressure_measure",
        "elec_伏安法测电阻",
        "elec_measure_lamp_power"
      ],
      "note": "典型路径分别对应 m/V、托里拆利思想、U/I 和 UI。"
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
        "mech_kinetic_energy",
        "mech_gravitational_potential_energy",
        "mech_elastic_potential_energy",
        "therm_internal_energy",
        "elec_electric_energy",
        "energy_chemical_energy",
        "energy_nuclear_energy"
      ],
      "note": "太阳能属于能源来源的表述，本组只收明确的能量形式。"
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
      "description": "研究一个因素的影响时，只改变该因素并控制其他相关条件不变，是初中物理影响因素探究的核心方法。",
      "members": [
        "mech_friction_factors",
        "elec_影响电阻的因素",
        "elec_electromagnet_factors",
        "therm_specific_heat"
      ],
      "note": "比热容相关实验通过控制质量、加热条件等比较不同物质的吸热能力。"
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
    }
  ]
};
