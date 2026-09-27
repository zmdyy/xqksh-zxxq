window._RELATION_PATCH_DATA = (function() {
  const remove = [
    { from: 'opt_refraction_law', to: 'elec_current' }
  ];

  const add = [
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

  function samePair(a, b) {
    return (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from);
  }

  function applyTo(connections) {
    let result = connections.filter(conn => !remove.some(target => samePair(conn, target)));
    add.forEach(conn => {
      if (!result.some(existing => samePair(existing, conn))) result.push(conn);
    });
    return result;
  }

  return { remove, add, applyTo };
})();
