window._OPT_THINKING_DATA = (function() {
  const chapterTemplates = {
    "光的直线传播": {
      question: "光在什么条件下沿直线传播？这种模型能解释哪些现象？",
      core_model: "直线传播模型 = 光源发光 + 同种均匀介质 + 光线沿直线前进。",
      reasoning_path: ["识别光源", "判断介质是否均匀", "画直线光路", "解释影子、小孔成像、日月食"],
      variables: [
        { symbol: "c", name: "真空光速", unit: "m/s", meaning: "光在真空中的传播速度，约3×10^8m/s" },
        { symbol: "s", name: "距离", unit: "m", meaning: "光传播的路径长度" },
        { symbol: "t", name: "时间", unit: "s", meaning: "光传播所用时间" }
      ],
      measurement: [
        { quantity: "像距/物距", tool: "刻度尺", reading: "测小孔到屏、物体到小孔的距离", errors: ["屏幕未垂直", "光斑边缘模糊", "读数视差"] }
      ],
      rules: ["光线是表示光传播路径和方向的模型。", "影子形成需要光沿直线传播和不透明物体遮挡。", "小孔成像成倒立实像，像的大小与物距、像距有关。"],
      confusions: ["光线是模型，不是真实存在的线。", "影子不是像，小孔成像是实像。", "光年是距离单位，不是时间单位。"],
      transfer: ["排队看齐 -> 直线传播", "日食月食 -> 光被天体遮挡", "针孔相机 -> 小孔成像"],
      next_questions: ["光遇到镜面会怎样改变方向？", "光进入另一种介质时为什么会偏折？"]
    },
    "光的反射": {
      question: "光遇到物体表面后怎样返回原介质？怎样用法线和角度描述？",
      core_model: "反射模型 = 入射光线 + 法线 + 反射光线；反射角等于入射角。",
      reasoning_path: ["确定入射点", "作法线", "量入射角", "根据反射角等于入射角作反射光线", "解释平面镜成像"],
      variables: [
        { symbol: "i", name: "入射角", unit: "°", meaning: "入射光线与法线的夹角" },
        { symbol: "r", name: "反射角", unit: "°", meaning: "反射光线与法线的夹角" },
        { symbol: "d", name: "物/像到镜面距离", unit: "m", meaning: "平面镜成像中物距等于像距" }
      ],
      measurement: [
        { quantity: "角度", tool: "量角器", reading: "从法线开始量入射角和反射角", errors: ["把镜面当作角的一边", "法线未垂直镜面", "读数方向错误"] }
      ],
      rules: ["反射光线、入射光线、法线在同一平面内。", "反射角等于入射角。", "平面镜成正立、等大的虚像，物像关于镜面对称。"],
      confusions: ["入射角和反射角都是与法线的夹角，不是与镜面的夹角。", "镜面反射和漫反射都遵守反射定律。", "平面镜中的像是虚像，不能用光屏承接。"],
      transfer: ["潜望镜 -> 多次平面镜反射", "自行车尾灯 -> 角反射", "黑板反光 -> 镜面反射过强"],
      next_questions: ["光从空气进入水或玻璃时还会按反射规律走吗？", "镜面成像和透镜成像有什么不同？"]
    },
    "光的折射": {
      question: "光从一种介质进入另一种介质时为什么会改变方向？",
      core_model: "折射模型 = 光速改变导致传播方向偏折；空气到水/玻璃通常向法线偏折。",
      reasoning_path: ["确定两种介质", "作法线", "判断光从疏到密或密到疏", "画折射光线", "联系透镜成像"],
      variables: [
        { symbol: "i", name: "入射角", unit: "°", meaning: "入射光线与法线夹角" },
        { symbol: "γ", name: "折射角", unit: "°", meaning: "折射光线与法线夹角" },
        { symbol: "f", name: "焦距", unit: "m/cm", meaning: "透镜焦点到光心的距离" }
      ],
      measurement: [
        { quantity: "焦距", tool: "刻度尺+平行光/远处物体", reading: "移动光屏得到最小最亮光斑，测透镜到光屏距离", errors: ["光屏未成清晰光斑", "透镜与光屏不平行", "读数视差"] }
      ],
      rules: ["光从空气斜射入水或玻璃，折射光线向法线偏折。", "凸透镜会聚光，凹透镜发散光。", "折射现象中光路可逆。"],
      confusions: ["折射不是反射，光进入了另一种介质。", "凸透镜会聚不等于一定成实像。", "实像能用光屏承接，虚像不能。"],
      transfer: ["筷子插入水中像弯折 -> 折射", "眼镜矫正视力 -> 透镜改变光路", "相机镜头 -> 凸透镜成像"],
      next_questions: ["凸透镜在不同物距下怎样成像？", "色散为什么说明白光不是单色光？"]
    },
    "光的色散": {
      question: "白光为什么能分解出多种颜色？物体颜色从哪里来？",
      core_model: "色散模型 = 不同色光折射程度不同；物体颜色取决于反射/透过的色光。",
      reasoning_path: ["白光进入三棱镜", "不同色光偏折程度不同", "形成光谱", "解释色光混合和物体颜色"],
      variables: [
        { symbol: "λ", name: "波长", unit: "m/nm", meaning: "不同颜色光对应不同波长范围" },
        { symbol: "f", name: "频率", unit: "Hz", meaning: "光的颜色与频率有关" }
      ],
      measurement: [
        { quantity: "颜色/光谱", tool: "三棱镜/光屏", reading: "观察红橙黄绿蓝靛紫的排列", errors: ["环境光干扰", "光屏位置不当", "入射光不够窄"] }
      ],
      rules: ["白光是复色光。", "透明物体颜色由透过的色光决定。", "不透明物体颜色由反射的色光决定。"],
      confusions: ["色光三原色是红、绿、蓝，不是颜料三原色。", "红外线和紫外线不可见，但属于光谱范围。", "黑色物体吸收大部分可见光。"],
      transfer: ["彩虹 -> 太阳光色散", "显示屏 -> RGB色光混合", "验钞机 -> 紫外线应用"],
      next_questions: ["红外线和紫外线有哪些实际用途？", "光与电磁波有什么关系？"]
    },
    "凸透镜成像": {
      question: "凸透镜成像规律中，物距与像距之间有怎样的关系？",
      core_model: "透镜成像模型 = 物距 u + 焦距 f 决定成像类型；u>2f成倒立缩小实像，f<u<2f成倒立放大实像，u<f成正立放大虚像。",
      reasoning_path: ["测焦距 f", "确定物距 u", "根据物距判断成像类型", "移动光屏找实像（或透过透镜看虚像）", "比较像的正倒、大小、虚实"],
      variables: [
        { symbol: "u", name: "物距", unit: "cm", meaning: "物体到透镜光心的距离" },
        { symbol: "v", name: "像距", unit: "cm", meaning: "像到透镜光心的距离" },
        { symbol: "f", name: "焦距", unit: "cm", meaning: "透镜焦点到光心的距离" }
      ],
      measurement: [
        { quantity: "焦距", tool: "平行光聚焦法/太阳光法", reading: "透镜正对太阳，移动光屏得到最小最亮光斑", errors: ["未在光具座上共轴调节", "透镜与光屏不平行"] }
      ],
      rules: ["u>2f：倒立缩小实像，应用：照相机。", "u=2f：倒立等大实像，用于测焦距。", "f<u<2f：倒立放大实像，应用：投影仪。", "u=f：不成像。", "u<f：正立放大虚像，应用：放大镜。"],
      confusions: ["实像倒立、虚像正立。", "物距变小，实像变大、像距变大。", "照相机、投影仪、放大镜本质都是凸透镜，只是物距不同。"],
      transfer: ["人眼晶状体 -> 凸透镜成像", "相机调焦 -> 改变像距", "手机变焦 -> 数字裁剪"],
      next_questions: ["近视眼和远视眼的成像缺陷是怎么产生的？", "显微镜和望远镜如何利用透镜组合？"]
    }
  };

  const overrides = {
    opt_light_speed: {
      question: "光速为什么要和电磁波联系起来理解？",
      core_model: "光是电磁波的一种；真空中所有电磁波传播速度相同，c=λf≈3×10^8m/s。",
      reasoning_path: ["认识真空光速 c", "把光放入电磁波谱", "用 c=λf 联系波长和频率", "比较可见光、红外线、紫外线"],
      variables: [
        { symbol: "c", name: "真空光速/电磁波速度", unit: "m/s", meaning: "真空中光和电磁波的传播速度，约3×10^8m/s" },
        { symbol: "λ", name: "波长", unit: "m", meaning: "相邻两个同相位点之间的距离；可见光常用nm描述" },
        { symbol: "f", name: "频率", unit: "Hz", meaning: "单位时间振动次数；频率越高，波长越短" }
      ],
      rules: ["真空中电磁波速度相同：c=λf。", "可见光只是电磁波谱中的一小段。", "红外线频率低于可见红光，紫外线频率高于可见紫光。"],
      confusions: ["光速不是只属于可见光，电磁波在真空中也以光速传播。", "频率和波长不是独立随意变化，在真空中满足c=λf。", "光年是距离单位，不是时间单位。"],
      transfer: ["无线通信 -> 电磁波传播", "光纤通信 -> 光作为电磁波传递信息", "天文学 -> 用光年描述极远距离"],
      next_questions: ["不同频率的光为什么颜色不同？", "为什么红外线和紫外线看不见但仍属于光谱？"]
    },
    opt_lens_imaging: {
      question: "凸透镜成像为什么随物距变化而变化？",
      core_model: "凸透镜成像由物距u、像距v和焦距f共同决定。",
      reasoning_path: ["测焦距 f", "确定物距 u", "移动光屏找清晰像", "比较像的正倒、大小、虚实", "归纳成像规律"],
      variables: [
        { symbol: "u", name: "物距", unit: "cm", meaning: "物体到透镜光心的距离" },
        { symbol: "v", name: "像距", unit: "cm", meaning: "像到透镜光心的距离" },
        { symbol: "f", name: "焦距", unit: "cm", meaning: "焦点到光心距离" }
      ],
      measurement: [
        { quantity: "物距/像距", tool: "光具座刻度尺", reading: "分别读物体、透镜、光屏位置并相减", errors: ["未调共轴", "像未清晰就读数", "读位置而非距离"] }
      ],
      rules: ["u>2f：倒立缩小实像。", "f<u<2f：倒立放大实像。", "u<f：正立放大虚像。"],
      confusions: ["实像能成在光屏上，虚像不能。", "物距变小，实像通常变大且像距变大。", "照相机、投影仪、放大镜对应不同物距范围。"],
      transfer: ["照相机 -> u>2f", "投影仪 -> f<u<2f", "放大镜 -> u<f"],
      next_questions: ["近视和远视如何用透镜矫正？", "为什么调焦本质上是在改变像距或物距？"]
    },
    opt_reflection_law: {
      question: "怎样用一条法线确定反射光线方向？",
      reasoning_path: ["找到入射点", "作垂直镜面的法线", "量入射角", "在法线另一侧作等大的反射角"],
      rules: ["角度必须从法线量起。", "光路可逆，入射和反射路径可互换。"]
    },
    opt_平面镜成像: {
      question: "平面镜中的像为什么看起来在镜后？",
      core_model: "平面镜成像是反射光线反向延长线会聚形成的虚像。",
      reasoning_path: ["物体发出/反射光", "光到达镜面发生反射", "人眼沿反射光反向延长", "看到镜后虚像"],
      rules: ["物像等大。", "物距等于像距。", "物像连线垂直镜面。"],
      confusions: ["平面镜中的像不能用光屏承接。", "镜中左右看似相反，本质是前后方向反转。"]
    },
    opt_refraction_law: {
      question: "怎样判断折射光线向法线还是远离法线？",
      reasoning_path: ["确定入射介质和折射介质", "作法线", "比较光速变化", "画折射方向"],
      rules: ["空气到水/玻璃，通常向法线偏折。", "水/玻璃到空气，通常远离法线偏折。", "垂直入射时传播方向不变。"]
    },
    opt_凸透镜对光的作用: {
      question: "凸透镜为什么能会聚光？",
      reasoning_path: ["透镜两侧发生折射", "平行光向主光轴偏折", "会聚于焦点", "焦距描述会聚能力"],
      rules: ["凸透镜对光有会聚作用。", "焦距越短，会聚能力越强。", "通过光心的光线近似不偏折。"]
    },
    opt_凹透镜对光的作用: {
      question: "凹透镜为什么让光发散？",
      reasoning_path: ["光进入凹透镜发生折射", "出射光远离主光轴", "反向延长线过虚焦点"],
      rules: ["凹透镜对光有发散作用。", "凹透镜常用于近视矫正。", "虚焦点不是实际光线会聚点。"]
    },
    opt_眼镜与视力矫正: {
      question: "近视、远视为什么要用不同透镜矫正？",
      core_model: "视力矫正 = 改变进入眼睛前的光路，让像重新成在视网膜上。",
      reasoning_path: ["判断成像位置", "近视成在视网膜前", "用凹透镜发散", "远视成在视网膜后", "用凸透镜会聚"],
      rules: ["近视眼用凹透镜矫正。", "远视眼用凸透镜矫正。", "矫正目的都是让清晰像落在视网膜上。"],
      confusions: ["近视不是看近处不清，而是看远处不清。", "眼镜不是放大物体，而是改变光路。"]
    },
    opt_dispersion: {
      question: "为什么三棱镜能把白光分解成彩色光带？",
      core_model: "色散 = 白光中不同频率/波长的色光，在介质中传播速度略不同，所以折射程度不同。",
      reasoning_path: ["白光进入三棱镜", "不同色光频率/波长不同", "在介质中速度和折射程度不同", "出射方向分开", "屏上形成光谱"],
      variables: [
        { symbol: "λ", name: "波长", unit: "m/nm", meaning: "可见光约为380nm到780nm，不同颜色对应不同波长" },
        { symbol: "f", name: "频率", unit: "Hz", meaning: "红光频率较低，紫光频率较高" },
        { symbol: "c", name: "真空光速", unit: "m/s", meaning: "真空中满足c=λf" }
      ],
      rules: ["红光偏折较小，紫光偏折较大。", "白光由多种色光组成。", "可见光、红外线、紫外线都属于电磁波谱。", "彩虹是自然界中的色散现象。"],
      next_questions: ["红外线和紫外线与可见光频率有什么差别？", "光和电磁波为什么可以用同一个速度公式联系？"]
    },
    opt_显微镜与望远镜: {
      question: "显微镜和望远镜为什么都能放大，但放大效果不同？",
      core_model: "透镜组合原理 = 物镜成实像 + 目镜成虚像；显微镜物镜焦距短、目镜焦距长，望远镜物镜焦距长、目镜焦距短。",
      reasoning_path: ["区分物镜和目镜", "物镜先成倒立实像", "目镜再把实像放大成虚像", "显微镜看近处小物体", "望远镜看远处大物体"],
      variables: [
        { symbol: "f物", name: "物镜焦距", unit: "cm", meaning: "靠近物体的透镜焦距" },
        { symbol: "f目", name: "目镜焦距", unit: "cm", meaning: "靠近眼睛的透镜焦距" },
        { symbol: "L", name: "镜筒长度", unit: "cm", meaning: "物镜与目镜之间的距离" }
      ],
      rules: ["显微镜的物镜焦距短、目镜焦距长。", "望远镜的物镜焦距长、目镜焦距短。", "最终成的像都是虚像。", "显微镜与望远镜的目镜都相当于放大镜。"],
      confusions: ["显微镜和望远镜最终看到的都是虚像。", "放大倍数不是越大越好，受分辨率限制。", "望远镜不是把远处的物体拉近，而是增大了视角。"],
      transfer: ["天文望远镜 -> 观察星体", "电子显微镜 -> 观察纳米结构", "手机长焦镜头 -> 透镜组合原理"],
      next_questions: ["凸透镜成像规律怎样应用在显微镜和望远镜中？", "人眼看到虚像和实像的视觉感受有什么不同？"]
    },
    opt_红外线与紫外线: {
      question: "看不见的红外线、紫外线为什么仍然属于光谱？",
      core_model: "不可见光 = 人眼不可见的电磁波；红外线频率低于红光，紫外线频率高于紫光。",
      reasoning_path: ["从可见光谱两端延伸", "红光外侧是红外线", "紫光外侧是紫外线", "统一放入电磁波谱", "用频率和波长比较"],
      variables: [
        { symbol: "λ", name: "波长", unit: "m", meaning: "红外线波长比红光长，紫外线波长比紫光短" },
        { symbol: "f", name: "频率", unit: "Hz", meaning: "红外线频率低于可见光，紫外线频率高于可见光" },
        { symbol: "c", name: "真空传播速度", unit: "m/s", meaning: "真空中红外线、可见光、紫外线传播速度相同" }
      ],
      rules: ["红外线热效应明显，常用于遥控和热成像。", "紫外线化学作用强，常用于杀菌和验钞。", "不可见不等于不存在，它们仍是电磁波。"],
      confusions: ["红外线不是红色的光，而是红光外侧的人眼不可见电磁波。", "紫外线不是紫色的光，而是紫光外侧的人眼不可见电磁波。"],
      transfer: ["遥控器 -> 红外线通信", "验钞机 -> 紫外线激发荧光", "防晒 -> 减少紫外线伤害"],
      next_questions: ["无线电波、微波、X射线也属于电磁波谱吗？", "为什么不同频率电磁波的用途不同？"]
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
      if (node.module !== "光学") return;
      const template = clone(chapterTemplates[node.chapter] || chapterTemplates["光的折射"] || {});
      const override = clone(overrides[node.id] || {});
      node.thinking = mergeThinking(template, override);
    });
    return data;
  }

  return { chapterTemplates, overrides, applyTo };
})();
