window._DIAGNOSTIC_BANK = {
  "schema": "physics-misconception-diagnostic-bank",
  "schema_version": "0.1",
  "knowledge_db_version": "2.4",
  "status": "draft_for_teacher_review",
  "updated_at": "2026-09-29",
  "group_count": 24,
  "question_count": 84,
  "response_protocol": {
    "answer": "single_choice",
    "confidence": {
      "enabled": true,
      "scale": [
        {
          "value": 1,
          "label": "猜测"
        },
        {
          "value": 2,
          "label": "不确定"
        },
        {
          "value": 3,
          "label": "较确定"
        }
      ]
    }
  },
  "diagnostic_rules": [
    "每个知识点使用2—4道跨情境微题，不以单道题对错直接判定掌握或迷思。",
    "错误选项绑定具体 misconception code，用于积累同一错误模式的重复证据。",
    "至少需要同一迷思在两个独立题目/情境中得到一致证据，才进入“稳定迷思候选”。",
    "正确答案也需要跨题一致，避免把猜对或单一熟悉题型误判为稳定掌握。",
    "本批为教师审核稿，尚未接入学生端诊断界面。"
  ],
  "groups": [
    {
      "concept_id": "mech_avg_speed",
      "concept_name": "平均速度",
      "module": "力学",
      "chapter": "机械运动",
      "diagnostic_goal": "检验学生是否真正使用“总路程÷总时间”，而不是对分段速度机械求平均或漏掉停留时间。",
      "misconceptions": [
        {
          "code": "AVG_ARITHMETIC",
          "description": "把分段速度直接做算术平均。"
        },
        {
          "code": "AVG_IGNORE_STOP",
          "description": "计算全程平均速度时忽略停留时间。"
        },
        {
          "code": "AVG_PART_AS_WHOLE",
          "description": "用某一段或某一时刻的速度代表全程平均速度。"
        }
      ],
      "questions": [
        {
          "id": "DQ-AVG-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "小车先以2 m/s行驶相同的一段路程，再以6 m/s行驶同样长的一段路程。全程平均速度为多少？",
          "options": [
            {
              "id": "A",
              "text": "3 m/s",
              "misconception": null
            },
            {
              "id": "B",
              "text": "4 m/s",
              "misconception": "AVG_ARITHMETIC"
            },
            {
              "id": "C",
              "text": "6 m/s",
              "misconception": "AVG_PART_AS_WHOLE"
            },
            {
              "id": "D",
              "text": "8 m/s",
              "misconception": "AVG_PART_AS_WHOLE"
            }
          ],
          "correct_option": "A",
          "explanation": "相同路程下两段所用时间不同，应按总路程÷总时间计算，结果为3 m/s。"
        },
        {
          "id": "DQ-AVG-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "某同学跑100 m用20 s，停下休息10 s，又跑100 m用10 s。若从第一次起跑计到第二段结束，全程平均速度是多少？",
          "options": [
            {
              "id": "A",
              "text": "5 m/s",
              "misconception": null
            },
            {
              "id": "B",
              "text": "6.7 m/s",
              "misconception": "AVG_IGNORE_STOP"
            },
            {
              "id": "C",
              "text": "7.5 m/s",
              "misconception": "AVG_ARITHMETIC"
            },
            {
              "id": "D",
              "text": "10 m/s",
              "misconception": "AVG_PART_AS_WHOLE"
            }
          ],
          "correct_option": "A",
          "explanation": "总路程200 m，总时间20+10+10=40 s，平均速度为5 m/s。"
        },
        {
          "id": "DQ-AVG-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "汽车从甲地到乙地速度60 km/h，沿原路返回速度40 km/h，两地路程相同。往返平均速度为多少？",
          "options": [
            {
              "id": "A",
              "text": "48 km/h",
              "misconception": null
            },
            {
              "id": "B",
              "text": "50 km/h",
              "misconception": "AVG_ARITHMETIC"
            },
            {
              "id": "C",
              "text": "40 km/h",
              "misconception": "AVG_PART_AS_WHOLE"
            },
            {
              "id": "D",
              "text": "60 km/h",
              "misconception": "AVG_PART_AS_WHOLE"
            }
          ],
          "correct_option": "A",
          "explanation": "两段路程相同但时间不同，不能直接平均60和40；由总路程÷总时间得48 km/h。"
        }
      ]
    },
    {
      "concept_id": "mech_force_gravity",
      "concept_name": "重力",
      "module": "力学",
      "chapter": "力",
      "diagnostic_goal": "检验学生是否把重力理解为地球对物体的吸引作用，并正确判断方向、质量与重力的区别。",
      "misconceptions": [
        {
          "code": "G_ONLY_MOVING",
          "description": "认为只有下落或运动的物体才受重力。"
        },
        {
          "code": "G_NORMAL_SURFACE",
          "description": "认为重力方向总是垂直接触面。"
        },
        {
          "code": "G_MASS_CONFUSION",
          "description": "混淆质量与重力，认为换地点后质量也随重力改变。"
        }
      ],
      "questions": [
        {
          "id": "DQ-G-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "一本书静止在水平桌面上。关于书受到的重力，下列说法正确的是？",
          "options": [
            {
              "id": "A",
              "text": "书仍受到竖直向下的重力",
              "misconception": null
            },
            {
              "id": "B",
              "text": "书静止，所以不受重力",
              "misconception": "G_ONLY_MOVING"
            },
            {
              "id": "C",
              "text": "支持力抵消了重力，所以重力消失",
              "misconception": "G_ONLY_MOVING"
            },
            {
              "id": "D",
              "text": "只有书开始下落时才有重力",
              "misconception": "G_ONLY_MOVING"
            }
          ],
          "correct_option": "A",
          "explanation": "力是否存在不能由运动状态决定；书始终受到地球的吸引。"
        },
        {
          "id": "DQ-G-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "物块静止在斜面上。重力方向应为？",
          "options": [
            {
              "id": "A",
              "text": "竖直向下",
              "misconception": null
            },
            {
              "id": "B",
              "text": "垂直斜面向下",
              "misconception": "G_NORMAL_SURFACE"
            },
            {
              "id": "C",
              "text": "沿斜面向下",
              "misconception": "G_NORMAL_SURFACE"
            },
            {
              "id": "D",
              "text": "指向斜面底端",
              "misconception": "G_NORMAL_SURFACE"
            }
          ],
          "correct_option": "A",
          "explanation": "重力方向始终竖直向下，与接触面的方向无关。"
        },
        {
          "id": "DQ-G-03",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "把同一物体从地球带到月球，若不考虑其他变化，则它的质量和重力怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "质量不变，重力变小",
              "misconception": null
            },
            {
              "id": "B",
              "text": "质量和重力都变小",
              "misconception": "G_MASS_CONFUSION"
            },
            {
              "id": "C",
              "text": "质量变小，重力不变",
              "misconception": "G_MASS_CONFUSION"
            },
            {
              "id": "D",
              "text": "质量和重力都不变",
              "misconception": "G_MASS_CONFUSION"
            }
          ],
          "correct_option": "A",
          "explanation": "质量是物体所含物质多少的量度，地点改变质量不变；重力随当地重力场变化。"
        }
      ]
    },
    {
      "concept_id": "mech_force_motion_state",
      "concept_name": "力与运动状态",
      "module": "力学",
      "chapter": "运动和力",
      "diagnostic_goal": "检验学生是否理解力改变运动状态，而不是维持运动；能区分速度方向和合力方向。",
      "misconceptions": [
        {
          "code": "FORCE_MAINTAINS_MOTION",
          "description": "认为物体持续运动必须持续受到沿运动方向的力。"
        },
        {
          "code": "FORCE_PROPORTIONAL_SPEED",
          "description": "认为速度越大，合力一定越大。"
        },
        {
          "code": "FORCE_SAME_AS_VELOCITY",
          "description": "认为合力方向一定与速度方向相同。"
        },
        {
          "code": "ZERO_SPEED_ZERO_FORCE",
          "description": "认为某瞬间速度为零就必然合力为零。"
        }
      ],
      "questions": [
        {
          "id": "DQ-FM-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "汽车在水平直路上做匀速直线运动。忽略竖直方向后，关于水平方向合力正确的是？",
          "options": [
            {
              "id": "A",
              "text": "合力为0",
              "misconception": null
            },
            {
              "id": "B",
              "text": "一定有向前的合力维持运动",
              "misconception": "FORCE_MAINTAINS_MOTION"
            },
            {
              "id": "C",
              "text": "速度越大合力越大",
              "misconception": "FORCE_PROPORTIONAL_SPEED"
            },
            {
              "id": "D",
              "text": "只要运动就一定有合力",
              "misconception": "FORCE_MAINTAINS_MOTION"
            }
          ],
          "correct_option": "A",
          "explanation": "匀速直线运动时运动状态不变，合力为0。"
        },
        {
          "id": "DQ-FM-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "小球竖直向上抛出后，已经离开手，在上升过程中忽略空气阻力。此时小球速度向上，合力方向为？",
          "options": [
            {
              "id": "A",
              "text": "竖直向下",
              "misconception": null
            },
            {
              "id": "B",
              "text": "竖直向上",
              "misconception": "FORCE_SAME_AS_VELOCITY"
            },
            {
              "id": "C",
              "text": "合力为0",
              "misconception": "FORCE_MAINTAINS_MOTION"
            },
            {
              "id": "D",
              "text": "先向上后向下",
              "misconception": "FORCE_SAME_AS_VELOCITY"
            }
          ],
          "correct_option": "A",
          "explanation": "离手后只受重力，合力向下，即使速度仍向上。"
        },
        {
          "id": "DQ-FM-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "小球被竖直上抛，到达最高点的瞬间速度为0。忽略空气阻力，此刻合力怎样？",
          "options": [
            {
              "id": "A",
              "text": "仍竖直向下",
              "misconception": null
            },
            {
              "id": "B",
              "text": "等于0",
              "misconception": "ZERO_SPEED_ZERO_FORCE"
            },
            {
              "id": "C",
              "text": "竖直向上",
              "misconception": "FORCE_SAME_AS_VELOCITY"
            },
            {
              "id": "D",
              "text": "无法判断",
              "misconception": "ZERO_SPEED_ZERO_FORCE"
            }
          ],
          "correct_option": "A",
          "explanation": "最高点瞬时速度为0，但仍受重力，因此合力不为0。"
        },
        {
          "id": "DQ-FM-04",
          "role": "迁移判断",
          "type": "single_choice",
          "stem": "小车做匀速圆周运动，速度大小保持不变但方向不断改变。关于合力，下列说法正确的是？",
          "options": [
            {
              "id": "A",
              "text": "合力不为0，因为运动方向在改变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "速度大小不变，所以合力一定为0",
              "misconception": "FORCE_PROPORTIONAL_SPEED"
            },
            {
              "id": "C",
              "text": "合力方向始终与速度方向相同",
              "misconception": "FORCE_SAME_AS_VELOCITY"
            },
            {
              "id": "D",
              "text": "只有速度大小变化才需要力",
              "misconception": "FORCE_MAINTAINS_MOTION"
            }
          ],
          "correct_option": "A",
          "explanation": "运动状态包含速度大小和方向；方向改变同样说明存在合力。"
        }
      ]
    },
    {
      "concept_id": "mech_inertia",
      "concept_name": "惯性",
      "module": "力学",
      "chapter": "运动和力",
      "diagnostic_goal": "检验学生是否把惯性理解为物体固有属性，而不是力，也不随速度或运动状态改变。",
      "misconceptions": [
        {
          "code": "INERTIA_DEPENDS_SPEED",
          "description": "认为速度越大惯性越大。"
        },
        {
          "code": "INERTIA_ONLY_MOVING",
          "description": "认为静止物体没有惯性。"
        },
        {
          "code": "INERTIA_IS_FORCE",
          "description": "把惯性说成推动物体继续运动的一种力。"
        }
      ],
      "questions": [
        {
          "id": "DQ-IN-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "质量相同的甲、乙两球，甲静止，乙正在运动。关于惯性大小，下列说法正确的是？",
          "options": [
            {
              "id": "A",
              "text": "两球惯性相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "乙速度大，所以惯性更大",
              "misconception": "INERTIA_DEPENDS_SPEED"
            },
            {
              "id": "C",
              "text": "甲静止，所以没有惯性",
              "misconception": "INERTIA_ONLY_MOVING"
            },
            {
              "id": "D",
              "text": "运动的乙受到惯性力，所以惯性更大",
              "misconception": "INERTIA_IS_FORCE"
            }
          ],
          "correct_option": "A",
          "explanation": "惯性大小主要由质量决定，与物体是否运动、速度大小无关。"
        },
        {
          "id": "DQ-IN-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "公交车突然刹车，站立乘客身体向前倾。最合适的解释是？",
          "options": [
            {
              "id": "A",
              "text": "乘客身体要保持原来的运动状态",
              "misconception": null
            },
            {
              "id": "B",
              "text": "有一个向前的惯性力推动乘客",
              "misconception": "INERTIA_IS_FORCE"
            },
            {
              "id": "C",
              "text": "刹车后乘客惯性突然变大",
              "misconception": "INERTIA_DEPENDS_SPEED"
            },
            {
              "id": "D",
              "text": "只有上半身具有惯性",
              "misconception": "INERTIA_ONLY_MOVING"
            }
          ],
          "correct_option": "A",
          "explanation": "惯性是保持原运动状态的性质，不是一个实际施加的力。"
        },
        {
          "id": "DQ-IN-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "同一辆汽车从80 km/h减速到20 km/h但质量不变。汽车的惯性怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "不变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "变小",
              "misconception": "INERTIA_DEPENDS_SPEED"
            },
            {
              "id": "C",
              "text": "变大",
              "misconception": "INERTIA_DEPENDS_SPEED"
            },
            {
              "id": "D",
              "text": "减速时惯性暂时消失",
              "misconception": "INERTIA_ONLY_MOVING"
            }
          ],
          "correct_option": "A",
          "explanation": "质量不变时，惯性大小不因速度变化而改变。"
        }
      ]
    },
    {
      "concept_id": "mech_balance_forces",
      "concept_name": "二力平衡",
      "module": "力学",
      "chapter": "运动和力",
      "diagnostic_goal": "检验学生是否掌握二力平衡的四个条件，并能与相互作用力区分。",
      "misconceptions": [
        {
          "code": "BALANCE_EQUAL_ONLY",
          "description": "认为两个力只要大小相等就是平衡力。"
        },
        {
          "code": "ACTION_REACTION_AS_BALANCE",
          "description": "把作用力与反作用力当成同一物体上的平衡力。"
        },
        {
          "code": "STATIC_MEANS_NO_FORCE",
          "description": "认为物体静止就一定不受力。"
        }
      ],
      "questions": [
        {
          "id": "DQ-BAL-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "书静止在水平桌面上。书受到的重力G和桌面对书的支持力N属于？",
          "options": [
            {
              "id": "A",
              "text": "一对平衡力",
              "misconception": null
            },
            {
              "id": "B",
              "text": "一对相互作用力",
              "misconception": "ACTION_REACTION_AS_BALANCE"
            },
            {
              "id": "C",
              "text": "因为书静止，所以两个力都不存在",
              "misconception": "STATIC_MEANS_NO_FORCE"
            },
            {
              "id": "D",
              "text": "只要G=N就无需考虑方向和作用对象",
              "misconception": "BALANCE_EQUAL_ONLY"
            }
          ],
          "correct_option": "A",
          "explanation": "两个力作用在同一物体上，大小相等、方向相反、在同一直线上。"
        },
        {
          "id": "DQ-BAL-02",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "人用手推墙，手对墙的力和墙对手的力大小相等、方向相反。这两个力为什么不是平衡力？",
          "options": [
            {
              "id": "A",
              "text": "它们作用在不同物体上",
              "misconception": null
            },
            {
              "id": "B",
              "text": "它们大小虽然相等但方向不相反",
              "misconception": "BALANCE_EQUAL_ONLY"
            },
            {
              "id": "C",
              "text": "运动时才叫相互作用力",
              "misconception": "ACTION_REACTION_AS_BALANCE"
            },
            {
              "id": "D",
              "text": "因为墙没有移动",
              "misconception": "STATIC_MEANS_NO_FORCE"
            }
          ],
          "correct_option": "A",
          "explanation": "平衡力必须作用在同一物体上；作用力与反作用力分别作用在两个物体上。"
        },
        {
          "id": "DQ-BAL-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "小车在水平面上做匀速直线运动。下列判断正确的是？",
          "options": [
            {
              "id": "A",
              "text": "小车所受合力为0",
              "misconception": null
            },
            {
              "id": "B",
              "text": "小车运动，所以水平方向一定有向前的合力",
              "misconception": "STATIC_MEANS_NO_FORCE"
            },
            {
              "id": "C",
              "text": "只有静止物体才可能受平衡力",
              "misconception": "STATIC_MEANS_NO_FORCE"
            },
            {
              "id": "D",
              "text": "只要有两个大小相等的力就一定平衡",
              "misconception": "BALANCE_EQUAL_ONLY"
            }
          ],
          "correct_option": "A",
          "explanation": "静止和匀速直线运动都属于平衡状态。"
        },
        {
          "id": "DQ-BAL-04",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "一个物体同时受到两个大小均为5 N的力。仅凭这一信息能否判断它们是一对平衡力？",
          "options": [
            {
              "id": "A",
              "text": "不能，还要看方向、是否共线以及是否作用在同一物体上",
              "misconception": null
            },
            {
              "id": "B",
              "text": "能，大小相等就一定平衡",
              "misconception": "BALANCE_EQUAL_ONLY"
            },
            {
              "id": "C",
              "text": "能，只要方向相反即可",
              "misconception": "BALANCE_EQUAL_ONLY"
            },
            {
              "id": "D",
              "text": "不能，因为平衡力大小不能相等",
              "misconception": "BALANCE_EQUAL_ONLY"
            }
          ],
          "correct_option": "A",
          "explanation": "二力平衡必须同时满足同体、等大、反向、共线。"
        }
      ]
    },
    {
      "concept_id": "mech_friction",
      "concept_name": "摩擦力",
      "module": "力学",
      "chapter": "力",
      "diagnostic_goal": "检验学生是否依据相对运动或相对运动趋势判断摩擦力，而不是机械地把摩擦力理解为“总与运动方向相反”。",
      "misconceptions": [
        {
          "code": "FRICTION_ALWAYS_OPPOSES_MOTION",
          "description": "认为摩擦力一定与物体运动方向相反。"
        },
        {
          "code": "CONTACT_ALWAYS_FRICTION",
          "description": "认为只要接触就一定存在摩擦力。"
        },
        {
          "code": "FRICTION_ONLY_SLIDING",
          "description": "认为只有发生滑动才有摩擦力。"
        }
      ],
      "questions": [
        {
          "id": "DQ-FR-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "人在水平地面上向前走路时，地面对脚的静摩擦力方向通常是？",
          "options": [
            {
              "id": "A",
              "text": "向前",
              "misconception": null
            },
            {
              "id": "B",
              "text": "向后",
              "misconception": "FRICTION_ALWAYS_OPPOSES_MOTION"
            },
            {
              "id": "C",
              "text": "竖直向上",
              "misconception": "FRICTION_ALWAYS_OPPOSES_MOTION"
            },
            {
              "id": "D",
              "text": "走路时没有摩擦力",
              "misconception": "FRICTION_ONLY_SLIDING"
            }
          ],
          "correct_option": "A",
          "explanation": "脚有相对地面向后滑的趋势，地面对脚的静摩擦力向前，帮助人前进。"
        },
        {
          "id": "DQ-FR-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "一个木块静止放在粗糙水平桌面上，水平方向没有受到其他力。此时木块受到的水平摩擦力为？",
          "options": [
            {
              "id": "A",
              "text": "0",
              "misconception": null
            },
            {
              "id": "B",
              "text": "一定向左",
              "misconception": "CONTACT_ALWAYS_FRICTION"
            },
            {
              "id": "C",
              "text": "一定向右",
              "misconception": "CONTACT_ALWAYS_FRICTION"
            },
            {
              "id": "D",
              "text": "等于木块重力",
              "misconception": "CONTACT_ALWAYS_FRICTION"
            }
          ],
          "correct_option": "A",
          "explanation": "没有相对运动趋势时，粗糙接触面之间也可以没有摩擦力。"
        },
        {
          "id": "DQ-FR-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "传送带向右加速，一个小箱子放在带上并随传送带一起向右加速且不打滑。传送带对箱子的摩擦力方向是？",
          "options": [
            {
              "id": "A",
              "text": "向右",
              "misconception": null
            },
            {
              "id": "B",
              "text": "向左",
              "misconception": "FRICTION_ALWAYS_OPPOSES_MOTION"
            },
            {
              "id": "C",
              "text": "为0，因为没有滑动",
              "misconception": "FRICTION_ONLY_SLIDING"
            },
            {
              "id": "D",
              "text": "竖直向上",
              "misconception": "FRICTION_ALWAYS_OPPOSES_MOTION"
            }
          ],
          "correct_option": "A",
          "explanation": "箱子靠向右的静摩擦力获得向右加速度；静摩擦力不一定阻碍物体相对地面的运动。"
        },
        {
          "id": "DQ-FR-04",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "一个木块正在水平桌面上向右滑动，桌面对它的滑动摩擦力方向是？",
          "options": [
            {
              "id": "A",
              "text": "向左",
              "misconception": null
            },
            {
              "id": "B",
              "text": "向右",
              "misconception": "FRICTION_ALWAYS_OPPOSES_MOTION"
            },
            {
              "id": "C",
              "text": "竖直向下",
              "misconception": "CONTACT_ALWAYS_FRICTION"
            },
            {
              "id": "D",
              "text": "无法判断",
              "misconception": "FRICTION_ONLY_SLIDING"
            }
          ],
          "correct_option": "A",
          "explanation": "滑动摩擦力阻碍接触面之间的相对滑动，因此方向向左。"
        }
      ]
    },
    {
      "concept_id": "mech_pressure",
      "concept_name": "压强",
      "module": "力学",
      "chapter": "压强",
      "diagnostic_goal": "检验学生是否同时考虑压力和受力面积，而不是把压力大小直接等同于压强大小。",
      "misconceptions": [
        {
          "code": "PRESSURE_FORCE_ONLY",
          "description": "认为压力越大压强一定越大，忽略受力面积。"
        },
        {
          "code": "PRESSURE_AREA_WRONG",
          "description": "认为接触面积越大压强越大。"
        },
        {
          "code": "PRESSURE_EQUALS_FORCE",
          "description": "把压力和压强当成同一个物理量。"
        }
      ],
      "questions": [
        {
          "id": "DQ-P-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "同一块砖对水平地面的压力不变，分别平放和竖放。哪种放法对地面的压强更大？",
          "options": [
            {
              "id": "A",
              "text": "接触面积较小的竖放",
              "misconception": null
            },
            {
              "id": "B",
              "text": "接触面积较大的平放",
              "misconception": "PRESSURE_AREA_WRONG"
            },
            {
              "id": "C",
              "text": "两种一样，因为压力相同",
              "misconception": "PRESSURE_FORCE_ONLY"
            },
            {
              "id": "D",
              "text": "无法比较",
              "misconception": "PRESSURE_EQUALS_FORCE"
            }
          ],
          "correct_option": "A",
          "explanation": "p=F/S，压力相同，受力面积越小压强越大。"
        },
        {
          "id": "DQ-P-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "一个人从双脚站立改为平躺在地面上，体重不变。忽略姿势变化对支持力的其他影响，地面受到的压强怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "减小",
              "misconception": null
            },
            {
              "id": "B",
              "text": "增大",
              "misconception": "PRESSURE_AREA_WRONG"
            },
            {
              "id": "C",
              "text": "不变，因为压力不变",
              "misconception": "PRESSURE_FORCE_ONLY"
            },
            {
              "id": "D",
              "text": "压力和压强都变为0",
              "misconception": "PRESSURE_EQUALS_FORCE"
            }
          ],
          "correct_option": "A",
          "explanation": "压力近似不变，而受力面积显著增大，因此压强减小。"
        },
        {
          "id": "DQ-P-03",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "甲物体对地面压力100 N、接触面积0.01 m²；乙物体压力200 N、面积0.04 m²。谁产生的压强更大？",
          "options": [
            {
              "id": "A",
              "text": "甲",
              "misconception": null
            },
            {
              "id": "B",
              "text": "乙，因为压力更大",
              "misconception": "PRESSURE_FORCE_ONLY"
            },
            {
              "id": "C",
              "text": "一样大",
              "misconception": "PRESSURE_EQUALS_FORCE"
            },
            {
              "id": "D",
              "text": "只看面积，乙更大",
              "misconception": "PRESSURE_AREA_WRONG"
            }
          ],
          "correct_option": "A",
          "explanation": "甲压强10000 Pa，乙5000 Pa。压强由压力和受力面积共同决定。"
        }
      ]
    },
    {
      "concept_id": "mech_liquid_pressure",
      "concept_name": "液体压强",
      "module": "力学",
      "chapter": "压强",
      "diagnostic_goal": "检验学生是否理解静止液体内部压强主要由液体密度和深度决定，而不是容器形状或液体总量。",
      "misconceptions": [
        {
          "code": "LP_CONTAINER_SHAPE",
          "description": "认为同深度液体压强由容器形状决定。"
        },
        {
          "code": "LP_AMOUNT",
          "description": "认为液体总量越多，某一深度处压强一定越大。"
        },
        {
          "code": "LP_IGNORE_DENSITY",
          "description": "忽略液体密度对压强的影响。"
        }
      ],
      "questions": [
        {
          "id": "DQ-LP-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "三个形状不同的容器都装同种液体，液面高度相同。三个容器底部中心到液面的深度相同，则底部该点液体压强怎样？",
          "options": [
            {
              "id": "A",
              "text": "相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "底面积最大的最大",
              "misconception": "LP_CONTAINER_SHAPE"
            },
            {
              "id": "C",
              "text": "装液体最多的最大",
              "misconception": "LP_AMOUNT"
            },
            {
              "id": "D",
              "text": "容器最窄的最大",
              "misconception": "LP_CONTAINER_SHAPE"
            }
          ],
          "correct_option": "A",
          "explanation": "同种液体、同一深度，静止液体内部压强相同，与容器形状无关。"
        },
        {
          "id": "DQ-LP-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "同一杯水中，A点距液面5 cm，B点距液面15 cm。哪一点液体压强更大？",
          "options": [
            {
              "id": "A",
              "text": "B点",
              "misconception": null
            },
            {
              "id": "B",
              "text": "A点",
              "misconception": "LP_AMOUNT"
            },
            {
              "id": "C",
              "text": "一样大",
              "misconception": "LP_AMOUNT"
            },
            {
              "id": "D",
              "text": "要看杯子形状",
              "misconception": "LP_CONTAINER_SHAPE"
            }
          ],
          "correct_option": "A",
          "explanation": "同一液体中深度越大，液体压强越大。"
        },
        {
          "id": "DQ-LP-03",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "水和某种密度较小的油分别装在两只相同容器中，比较液面下相同深度处的压强。哪一个更大？",
          "options": [
            {
              "id": "A",
              "text": "水中更大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "油中更大",
              "misconception": "LP_IGNORE_DENSITY"
            },
            {
              "id": "C",
              "text": "一定相同",
              "misconception": "LP_IGNORE_DENSITY"
            },
            {
              "id": "D",
              "text": "只由容器底面积决定",
              "misconception": "LP_CONTAINER_SHAPE"
            }
          ],
          "correct_option": "A",
          "explanation": "p=ρgh，同深度时液体密度越大，压强越大。"
        }
      ]
    },
    {
      "concept_id": "mech_buoyancy",
      "concept_name": "浮力",
      "module": "力学",
      "chapter": "浮力",
      "diagnostic_goal": "检验学生是否理解浸在液体中的物体可以受到浮力，浮力大小不能仅由浮沉状态、物重或深度判断。",
      "misconceptions": [
        {
          "code": "BUOY_ONLY_FLOATING",
          "description": "认为只有漂浮或上浮物体才受浮力。"
        },
        {
          "code": "BUOY_WEIGHT_DETERMINES",
          "description": "认为浮力大小由物体重量直接决定。"
        },
        {
          "code": "BUOY_DEPTH_ALWAYS",
          "description": "认为物体越深，浮力一定越大。"
        }
      ],
      "questions": [
        {
          "id": "DQ-BUOY-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "一个铁块完全浸没在水中并正在下沉。铁块是否受到浮力？",
          "options": [
            {
              "id": "A",
              "text": "受到浮力",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不受浮力，因为它在下沉",
              "misconception": "BUOY_ONLY_FLOATING"
            },
            {
              "id": "C",
              "text": "只有到水底才受浮力",
              "misconception": "BUOY_ONLY_FLOATING"
            },
            {
              "id": "D",
              "text": "只有密度小于水才受浮力",
              "misconception": "BUOY_ONLY_FLOATING"
            }
          ],
          "correct_option": "A",
          "explanation": "浸在液体中的物体，只要液体对其上下表面压力存在差异，就可能受到浮力；下沉不等于无浮力。"
        },
        {
          "id": "DQ-BUOY-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "同一个实心球完全浸没在同一种液体中，从较浅位置缓慢移到更深位置，球体积和液体密度均不变。忽略液体密度随深度变化，浮力怎样？",
          "options": [
            {
              "id": "A",
              "text": "基本不变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "越深越大",
              "misconception": "BUOY_DEPTH_ALWAYS"
            },
            {
              "id": "C",
              "text": "越深越小",
              "misconception": "BUOY_DEPTH_ALWAYS"
            },
            {
              "id": "D",
              "text": "由球的重量决定",
              "misconception": "BUOY_WEIGHT_DETERMINES"
            }
          ],
          "correct_option": "A",
          "explanation": "完全浸没且V排不变、液体密度不变时，阿基米德浮力不随深度改变。"
        },
        {
          "id": "DQ-BUOY-03",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "甲、乙两个物体都漂浮在水面，甲比乙重。比较它们受到的浮力，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "甲的浮力更大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "漂浮物浮力都一样大",
              "misconception": "BUOY_WEIGHT_DETERMINES"
            },
            {
              "id": "C",
              "text": "乙更轻所以浮力更大",
              "misconception": "BUOY_WEIGHT_DETERMINES"
            },
            {
              "id": "D",
              "text": "仅凭漂浮状态无法知道它们各自浮力是否等于重力",
              "misconception": "BUOY_ONLY_FLOATING"
            }
          ],
          "correct_option": "A",
          "explanation": "漂浮平衡时F浮=G，甲更重，所以甲所受浮力更大。"
        },
        {
          "id": "DQ-BUOY-04",
          "role": "迁移判断",
          "type": "single_choice",
          "stem": "一个物体完全浸没在水中，若不改变物体体积，把水换成密度更大的盐水，浮力怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "增大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不变，因为物体重量不变",
              "misconception": "BUOY_WEIGHT_DETERMINES"
            },
            {
              "id": "C",
              "text": "减小",
              "misconception": "BUOY_DEPTH_ALWAYS"
            },
            {
              "id": "D",
              "text": "只有物体上浮后才有浮力",
              "misconception": "BUOY_ONLY_FLOATING"
            }
          ],
          "correct_option": "A",
          "explanation": "完全浸没时V排相同，液体密度增大，浮力增大。"
        }
      ]
    },
    {
      "concept_id": "mech_archimedes",
      "concept_name": "阿基米德原理",
      "module": "力学",
      "chapter": "浮力",
      "diagnostic_goal": "检验学生是否准确理解F浮与液体密度ρ液、排开液体体积V排有关，并区分V排与物体总体积。",
      "misconceptions": [
        {
          "code": "ARCH_OBJECT_DENSITY",
          "description": "误认为阿基米德浮力直接由物体密度决定。"
        },
        {
          "code": "ARCH_VDISP_ALWAYS_OBJECT",
          "description": "认为任何情况下V排都等于物体总体积。"
        },
        {
          "code": "ARCH_WEIGHT_EQUALS_BUOY",
          "description": "认为浮力在任何状态下都等于物体重力。"
        },
        {
          "code": "ARCH_IGNORE_FLUID_DENSITY",
          "description": "忽略液体密度对浮力的影响。"
        }
      ],
      "questions": [
        {
          "id": "DQ-ARCH-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "物体浸在液体中，阿基米德原理中决定浮力大小的直接量是？",
          "options": [
            {
              "id": "A",
              "text": "液体密度和排开液体的体积",
              "misconception": null
            },
            {
              "id": "B",
              "text": "物体密度和物体总体积",
              "misconception": "ARCH_OBJECT_DENSITY"
            },
            {
              "id": "C",
              "text": "物体重力和浸入深度",
              "misconception": "ARCH_WEIGHT_EQUALS_BUOY"
            },
            {
              "id": "D",
              "text": "只看排开液体体积，与液体种类无关",
              "misconception": "ARCH_IGNORE_FLUID_DENSITY"
            }
          ],
          "correct_option": "A",
          "explanation": "F浮=ρ液gV排，注意是液体密度ρ液，不是物体密度。"
        },
        {
          "id": "DQ-ARCH-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "一个木块有一半体积浸在水中并漂浮。此时V排与木块总体积V物的关系是？",
          "options": [
            {
              "id": "A",
              "text": "V排=0.5V物",
              "misconception": null
            },
            {
              "id": "B",
              "text": "V排=V物",
              "misconception": "ARCH_VDISP_ALWAYS_OBJECT"
            },
            {
              "id": "C",
              "text": "V排>V物",
              "misconception": "ARCH_VDISP_ALWAYS_OBJECT"
            },
            {
              "id": "D",
              "text": "V排与浸入体积无关",
              "misconception": "ARCH_VDISP_ALWAYS_OBJECT"
            }
          ],
          "correct_option": "A",
          "explanation": "V排等于物体浸入液体中的体积；只有完全浸没时，V排才等于物体排开的总体积。"
        },
        {
          "id": "DQ-ARCH-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "两个外形体积相同的实心球，一个铝球、一个铜球，都完全浸没在同一杯水中且不接触杯底。比较浮力，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "浮力相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "铜球密度大，所以浮力大",
              "misconception": "ARCH_OBJECT_DENSITY"
            },
            {
              "id": "C",
              "text": "铝球质量小，所以浮力大",
              "misconception": "ARCH_WEIGHT_EQUALS_BUOY"
            },
            {
              "id": "D",
              "text": "重的球浮力一定大",
              "misconception": "ARCH_WEIGHT_EQUALS_BUOY"
            }
          ],
          "correct_option": "A",
          "explanation": "同一液体、完全浸没、排开体积相同，因此浮力相同，与物体密度没有直接关系。"
        },
        {
          "id": "DQ-ARCH-04",
          "role": "跨情境迁移",
          "type": "single_choice",
          "stem": "同一物体完全浸没，先放在水中，再放在密度更大的盐水中。两次V排相同。哪次浮力更大？",
          "options": [
            {
              "id": "A",
              "text": "盐水中更大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "水中更大",
              "misconception": "ARCH_IGNORE_FLUID_DENSITY"
            },
            {
              "id": "C",
              "text": "一样大，因为物体相同",
              "misconception": "ARCH_OBJECT_DENSITY"
            },
            {
              "id": "D",
              "text": "一样大，因为V排相同就足够了",
              "misconception": "ARCH_IGNORE_FLUID_DENSITY"
            }
          ],
          "correct_option": "A",
          "explanation": "V排相同时，ρ液越大，F浮越大。"
        }
      ]
    },
    {
      "concept_id": "mech_float_sink_condition",
      "concept_name": "物体浮沉条件",
      "module": "力学",
      "chapter": "浮力",
      "diagnostic_goal": "检验学生是否能把浮沉状态与ρ物、ρ液及平衡条件联系起来，而不把“浮力大小”和“物体密度”简单等同。",
      "misconceptions": [
        {
          "code": "FS_DENSITY_MEANS_BUOY",
          "description": "把“物体密度小”误说成“受到浮力一定更大”。"
        },
        {
          "code": "FS_FLOAT_BUOY_GREATER_WEIGHT",
          "description": "认为漂浮时浮力大于重力。"
        },
        {
          "code": "FS_SUSPEND_NO_GRAVITY",
          "description": "认为悬浮时物体不受重力或浮力。"
        }
      ],
      "questions": [
        {
          "id": "DQ-FS-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "物体静止漂浮在水面上时，浮力F浮与重力G的关系是？",
          "options": [
            {
              "id": "A",
              "text": "F浮=G",
              "misconception": null
            },
            {
              "id": "B",
              "text": "F浮>G",
              "misconception": "FS_FLOAT_BUOY_GREATER_WEIGHT"
            },
            {
              "id": "C",
              "text": "F浮<G",
              "misconception": "FS_DENSITY_MEANS_BUOY"
            },
            {
              "id": "D",
              "text": "漂浮时没有重力",
              "misconception": "FS_SUSPEND_NO_GRAVITY"
            }
          ],
          "correct_option": "A",
          "explanation": "漂浮静止属于平衡状态，竖直方向浮力与重力平衡。"
        },
        {
          "id": "DQ-FS-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "一个小球完全浸没在液体中并静止悬浮，且不与容器接触。正确的是？",
          "options": [
            {
              "id": "A",
              "text": "F浮=G，且ρ物=ρ液",
              "misconception": null
            },
            {
              "id": "B",
              "text": "没有重力",
              "misconception": "FS_SUSPEND_NO_GRAVITY"
            },
            {
              "id": "C",
              "text": "F浮>G，所以才能停在液体中",
              "misconception": "FS_FLOAT_BUOY_GREATER_WEIGHT"
            },
            {
              "id": "D",
              "text": "物体密度越小，浮力一定越大",
              "misconception": "FS_DENSITY_MEANS_BUOY"
            }
          ],
          "correct_option": "A",
          "explanation": "悬浮时物体受力平衡，对均匀实心物体可用ρ物=ρ液理解。"
        },
        {
          "id": "DQ-FS-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "甲、乙两物体都漂浮在同一种液体中，甲质量比乙大。下列说法正确的是？",
          "options": [
            {
              "id": "A",
              "text": "甲所受浮力更大，但不能据此说甲的密度更大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "密度越小浮力一定越大",
              "misconception": "FS_DENSITY_MEANS_BUOY"
            },
            {
              "id": "C",
              "text": "两者漂浮，所以浮力一定相同",
              "misconception": "FS_DENSITY_MEANS_BUOY"
            },
            {
              "id": "D",
              "text": "甲重，所以一定下沉",
              "misconception": "FS_FLOAT_BUOY_GREATER_WEIGHT"
            }
          ],
          "correct_option": "A",
          "explanation": "漂浮时F浮=G，质量大的甲浮力更大；浮沉不能只由“浮力大小”单独判断。"
        }
      ]
    },
    {
      "concept_id": "therm_热量",
      "concept_name": "热量",
      "module": "热学",
      "chapter": "分子热运动与内能",
      "diagnostic_goal": "检验学生是否把热量理解为热传递过程中转移的能量，而不是物体“含有”的状态量。",
      "misconceptions": [
        {
          "code": "HEAT_CONTAINED",
          "description": "认为物体内部储存或“含有”热量。"
        },
        {
          "code": "HEAT_EQUALS_TEMP",
          "description": "认为温度越高，物体“具有的热量”一定越多。"
        },
        {
          "code": "HEAT_NO_PROCESS",
          "description": "脱离热传递过程谈某物体具有多少热量。"
        }
      ],
      "questions": [
        {
          "id": "DQ-HEAT-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "下列说法中，符合物理学中“热量”概念的是？",
          "options": [
            {
              "id": "A",
              "text": "热量是在热传递过程中转移的能量",
              "misconception": null
            },
            {
              "id": "B",
              "text": "一杯热水内部含有很多热量",
              "misconception": "HEAT_CONTAINED"
            },
            {
              "id": "C",
              "text": "温度高的物体一定具有更多热量",
              "misconception": "HEAT_EQUALS_TEMP"
            },
            {
              "id": "D",
              "text": "任何物体都可以说自己储存了多少热量",
              "misconception": "HEAT_NO_PROCESS"
            }
          ],
          "correct_option": "A",
          "explanation": "热量是过程量，通常用“吸收热量”“放出热量”，不说物体“含有热量”。"
        },
        {
          "id": "DQ-HEAT-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "甲、乙两个物体都处于20℃且没有发生热传递。关于它们“各自含有多少热量”，正确说法是？",
          "options": [
            {
              "id": "A",
              "text": "这种说法本身不恰当，热量描述的是传递过程",
              "misconception": null
            },
            {
              "id": "B",
              "text": "温度相同，所以含有热量一定相同",
              "misconception": "HEAT_CONTAINED"
            },
            {
              "id": "C",
              "text": "质量大的物体含有热量更多",
              "misconception": "HEAT_CONTAINED"
            },
            {
              "id": "D",
              "text": "体积大的物体含有热量更多",
              "misconception": "HEAT_NO_PROCESS"
            }
          ],
          "correct_option": "A",
          "explanation": "没有具体热传递过程时，不用“物体含有多少热量”描述状态。"
        },
        {
          "id": "DQ-HEAT-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "把80℃的金属块放入20℃的水中，直到温度趋于相同。关于热量转移方向，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "能量通过热传递从高温金属块转移到低温水",
              "misconception": null
            },
            {
              "id": "B",
              "text": "热量从水流向金属，因为水质量可能更大",
              "misconception": "HEAT_EQUALS_TEMP"
            },
            {
              "id": "C",
              "text": "温度相同前两者各自都在“产生热量”",
              "misconception": "HEAT_CONTAINED"
            },
            {
              "id": "D",
              "text": "只有金属温度下降，没有能量转移",
              "misconception": "HEAT_NO_PROCESS"
            }
          ],
          "correct_option": "A",
          "explanation": "热传递自发地从高温物体向低温物体进行，直到达到热平衡。"
        }
      ]
    },
    {
      "concept_id": "therm_internal_energy",
      "concept_name": "内能",
      "module": "热学",
      "chapter": "分子热运动与内能",
      "diagnostic_goal": "检验学生是否区分内能与温度、热量，并理解相变时温度可不变而内能仍发生变化。",
      "misconceptions": [
        {
          "code": "IE_ZERO_AT_ZERO_C",
          "description": "认为0℃物体没有内能。"
        },
        {
          "code": "IE_EQUALS_TEMP",
          "description": "认为温度不变时内能一定不变，或温度越高内能一定越大而忽略质量/状态。"
        },
        {
          "code": "IE_PHASE_TEMP_CONST_NO_CHANGE",
          "description": "认为晶体熔化、凝固或液体沸腾时温度不变，因此内能不变。"
        },
        {
          "code": "IE_HEAT_CONFUSION",
          "description": "把内能和热量当成同一个概念。"
        }
      ],
      "questions": [
        {
          "id": "DQ-IE-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "0℃的冰块是否具有内能？",
          "options": [
            {
              "id": "A",
              "text": "具有内能",
              "misconception": null
            },
            {
              "id": "B",
              "text": "没有，因为温度是0℃",
              "misconception": "IE_ZERO_AT_ZERO_C"
            },
            {
              "id": "C",
              "text": "只有吸热时才有内能",
              "misconception": "IE_HEAT_CONFUSION"
            },
            {
              "id": "D",
              "text": "只有液态和气态物质有内能",
              "misconception": "IE_ZERO_AT_ZERO_C"
            }
          ],
          "correct_option": "A",
          "explanation": "组成物质的粒子仍在运动并相互作用，因此0℃的冰也具有内能。"
        },
        {
          "id": "DQ-IE-02",
          "role": "相变诊断",
          "type": "single_choice",
          "stem": "某晶体在熔点处继续吸热并逐渐熔化，熔化过程中温度保持不变。其内能怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "增大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不变，因为温度不变",
              "misconception": "IE_PHASE_TEMP_CONST_NO_CHANGE"
            },
            {
              "id": "C",
              "text": "减小",
              "misconception": "IE_PHASE_TEMP_CONST_NO_CHANGE"
            },
            {
              "id": "D",
              "text": "先不变后突然增大",
              "misconception": "IE_EQUALS_TEMP"
            }
          ],
          "correct_option": "A",
          "explanation": "晶体熔化时虽然温度不变，但持续吸收能量，粒子间状态改变，内能增加。"
        },
        {
          "id": "DQ-IE-03",
          "role": "相变反例",
          "type": "single_choice",
          "stem": "同一晶体在凝固点处逐渐凝固，凝固过程中温度保持不变并向外放热。其内能怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "减小",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不变，因为温度不变",
              "misconception": "IE_PHASE_TEMP_CONST_NO_CHANGE"
            },
            {
              "id": "C",
              "text": "增大，因为正在发生物态变化",
              "misconception": "IE_HEAT_CONFUSION"
            },
            {
              "id": "D",
              "text": "温度不变，所以无法判断任何能量变化",
              "misconception": "IE_EQUALS_TEMP"
            }
          ],
          "correct_option": "A",
          "explanation": "凝固时持续放出能量，即使温度保持不变，内能仍减小。"
        },
        {
          "id": "DQ-IE-04",
          "role": "相变迁移",
          "type": "single_choice",
          "stem": "一锅水在标准大气压下沸腾后继续稳定吸热，水温约保持100℃。关于水的内能，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "仍可继续增大",
              "misconception": null
            },
            {
              "id": "B",
              "text": "温度不变，所以内能不再变化",
              "misconception": "IE_PHASE_TEMP_CONST_NO_CHANGE"
            },
            {
              "id": "C",
              "text": "沸腾时热量全部消失了",
              "misconception": "IE_HEAT_CONFUSION"
            },
            {
              "id": "D",
              "text": "只有水温升高时内能才会增加",
              "misconception": "IE_EQUALS_TEMP"
            }
          ],
          "correct_option": "A",
          "explanation": "沸腾过程中温度可保持不变，但液体持续吸热并汽化，系统内能仍发生变化。"
        }
      ]
    },
    {
      "concept_id": "therm_specific_heat",
      "concept_name": "比热容",
      "module": "热学",
      "chapter": "比热容与热量",
      "diagnostic_goal": "检验学生是否把比热容理解为物质特性，并能在Q=cmΔt中正确控制质量、热量和温升。",
      "misconceptions": [
        {
          "code": "C_DEPENDS_MASS",
          "description": "认为同种物质的比热容随质量改变。"
        },
        {
          "code": "C_MORE_HEAT_BIGGER",
          "description": "认为吸收热量多就说明比热容大，忽略质量和温升。"
        },
        {
          "code": "C_MORE_DT_BIGGER",
          "description": "认为温升越大比热容越大。"
        }
      ],
      "questions": [
        {
          "id": "DQ-C-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "同种铝制成的两个物块，甲质量是乙的2倍。它们的比热容关系是？",
          "options": [
            {
              "id": "A",
              "text": "相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "甲是乙的2倍",
              "misconception": "C_DEPENDS_MASS"
            },
            {
              "id": "C",
              "text": "乙是甲的2倍",
              "misconception": "C_DEPENDS_MASS"
            },
            {
              "id": "D",
              "text": "质量不同就无法比较",
              "misconception": "C_DEPENDS_MASS"
            }
          ],
          "correct_option": "A",
          "explanation": "比热容是物质的一种特性，在状态和条件相同时不随物体质量改变。"
        },
        {
          "id": "DQ-C-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "质量相同的甲、乙两种液体吸收相同热量，甲升温较少。忽略热损失，则哪种液体比热容较大？",
          "options": [
            {
              "id": "A",
              "text": "甲",
              "misconception": null
            },
            {
              "id": "B",
              "text": "乙",
              "misconception": "C_MORE_DT_BIGGER"
            },
            {
              "id": "C",
              "text": "一样大，因为吸热相同",
              "misconception": "C_MORE_HEAT_BIGGER"
            },
            {
              "id": "D",
              "text": "无法判断",
              "misconception": "C_DEPENDS_MASS"
            }
          ],
          "correct_option": "A",
          "explanation": "Q、m相同时，Δt越小表示c越大。"
        },
        {
          "id": "DQ-C-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "同一种水，甲杯1 kg、乙杯2 kg，都升高10℃。哪杯水吸收热量更多？这能否说明乙的比热容更大？",
          "options": [
            {
              "id": "A",
              "text": "乙吸热更多，但两杯水比热容相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "乙吸热更多，所以乙比热容更大",
              "misconception": "C_MORE_HEAT_BIGGER"
            },
            {
              "id": "C",
              "text": "甲质量小，所以甲比热容更大",
              "misconception": "C_DEPENDS_MASS"
            },
            {
              "id": "D",
              "text": "两杯吸热相同",
              "misconception": "C_MORE_HEAT_BIGGER"
            }
          ],
          "correct_option": "A",
          "explanation": "Q=cmΔt，质量大的水吸热更多，但同种水的比热容相同。"
        },
        {
          "id": "DQ-C-04",
          "role": "迁移判断",
          "type": "single_choice",
          "stem": "质量相同的水和食用油，用相同加热器加热相同时间，忽略热损失。若水的比热容更大，则通常谁的温升更大？",
          "options": [
            {
              "id": "A",
              "text": "食用油",
              "misconception": null
            },
            {
              "id": "B",
              "text": "水",
              "misconception": "C_MORE_DT_BIGGER"
            },
            {
              "id": "C",
              "text": "一定相同",
              "misconception": "C_MORE_HEAT_BIGGER"
            },
            {
              "id": "D",
              "text": "比热容越大温升越大",
              "misconception": "C_MORE_DT_BIGGER"
            }
          ],
          "correct_option": "A",
          "explanation": "相同Q、m下，c较小的液体温升更大。"
        }
      ]
    },
    {
      "concept_id": "opt_平面镜成像",
      "concept_name": "平面镜成像",
      "module": "光学",
      "chapter": "光的反射",
      "diagnostic_goal": "检验学生是否掌握平面镜成像的位置、大小和虚像性质，而不是把视觉变化误当成像本身改变。",
      "misconceptions": [
        {
          "code": "MIRROR_IMAGE_ON_MIRROR",
          "description": "认为像就在镜面上。"
        },
        {
          "code": "MIRROR_SIZE_CHANGES_DISTANCE",
          "description": "认为人靠近/远离镜子时像本身大小改变。"
        },
        {
          "code": "MIRROR_REAL_IMAGE",
          "description": "认为平面镜像可以在光屏上承接。"
        },
        {
          "code": "MIRROR_DISTANCE_ONE_SIDE",
          "description": "混淆物距、像距和物像间距离。"
        }
      ],
      "questions": [
        {
          "id": "DQ-MIR-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "人站在平面镜前1.5 m处，像到镜面的距离约为？",
          "options": [
            {
              "id": "A",
              "text": "1.5 m",
              "misconception": null
            },
            {
              "id": "B",
              "text": "0 m，像在镜面上",
              "misconception": "MIRROR_IMAGE_ON_MIRROR"
            },
            {
              "id": "C",
              "text": "3.0 m",
              "misconception": "MIRROR_DISTANCE_ONE_SIDE"
            },
            {
              "id": "D",
              "text": "随观察者位置改变",
              "misconception": "MIRROR_IMAGE_ON_MIRROR"
            }
          ],
          "correct_option": "A",
          "explanation": "平面镜成像中像距等于物距。"
        },
        {
          "id": "DQ-MIR-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "人从距镜2 m走到距镜1 m处。关于像的大小，下列说法正确的是？",
          "options": [
            {
              "id": "A",
              "text": "像本身大小不变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "像变大",
              "misconception": "MIRROR_SIZE_CHANGES_DISTANCE"
            },
            {
              "id": "C",
              "text": "像变小",
              "misconception": "MIRROR_SIZE_CHANGES_DISTANCE"
            },
            {
              "id": "D",
              "text": "靠近后像变成实像",
              "misconception": "MIRROR_REAL_IMAGE"
            }
          ],
          "correct_option": "A",
          "explanation": "平面镜成等大像；靠近时只是观察视角发生变化，像本身大小不变。"
        },
        {
          "id": "DQ-MIR-03",
          "role": "虚实辨析",
          "type": "single_choice",
          "stem": "把一块光屏放在平面镜后面像所在的位置，光屏上能直接得到清晰的像吗？",
          "options": [
            {
              "id": "A",
              "text": "不能，因为平面镜成的是虚像",
              "misconception": null
            },
            {
              "id": "B",
              "text": "能，只要光屏放在像的位置",
              "misconception": "MIRROR_REAL_IMAGE"
            },
            {
              "id": "C",
              "text": "镜子越亮越能接到像",
              "misconception": "MIRROR_REAL_IMAGE"
            },
            {
              "id": "D",
              "text": "只有人靠近时能接到",
              "misconception": "MIRROR_REAL_IMAGE"
            }
          ],
          "correct_option": "A",
          "explanation": "平面镜后的光线并未真正会聚，虚像不能直接承接在光屏上。"
        },
        {
          "id": "DQ-MIR-04",
          "role": "距离迁移",
          "type": "single_choice",
          "stem": "人距平面镜2 m，则人与自己的像相距约多少？",
          "options": [
            {
              "id": "A",
              "text": "4 m",
              "misconception": null
            },
            {
              "id": "B",
              "text": "2 m",
              "misconception": "MIRROR_DISTANCE_ONE_SIDE"
            },
            {
              "id": "C",
              "text": "0 m",
              "misconception": "MIRROR_IMAGE_ON_MIRROR"
            },
            {
              "id": "D",
              "text": "1 m",
              "misconception": "MIRROR_DISTANCE_ONE_SIDE"
            }
          ],
          "correct_option": "A",
          "explanation": "像在镜后2 m，人与像分别位于镜面两侧，因此相距4 m。"
        }
      ]
    },
    {
      "concept_id": "opt_refraction_law",
      "concept_name": "光的折射定律",
      "module": "光学",
      "chapter": "光的折射",
      "diagnostic_goal": "检验学生是否能依据光从哪种介质进入哪种介质判断折射方向，并正确处理垂直入射。",
      "misconceptions": [
        {
          "code": "REFRACT_ALWAYS_TO_NORMAL",
          "description": "认为进入任何另一介质都向法线偏折。"
        },
        {
          "code": "REFRACT_CONFUSE_REFLECTION",
          "description": "把折射方向判断与反射定律混淆。"
        },
        {
          "code": "REFRACT_NORMAL_MUST_BEND",
          "description": "认为垂直入射时传播方向也必须发生偏折。"
        }
      ],
      "questions": [
        {
          "id": "DQ-REF-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "光从空气斜射入玻璃时，折射光线通常怎样偏折？",
          "options": [
            {
              "id": "A",
              "text": "向法线偏折",
              "misconception": null
            },
            {
              "id": "B",
              "text": "远离法线",
              "misconception": "REFRACT_ALWAYS_TO_NORMAL"
            },
            {
              "id": "C",
              "text": "折射角一定等于入射角",
              "misconception": "REFRACT_CONFUSE_REFLECTION"
            },
            {
              "id": "D",
              "text": "沿原路返回",
              "misconception": "REFRACT_CONFUSE_REFLECTION"
            }
          ],
          "correct_option": "A",
          "explanation": "光从空气进入玻璃这类较密介质时，折射角通常小于入射角。"
        },
        {
          "id": "DQ-REF-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "光从玻璃斜射入空气时，未发生全反射。折射光线通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "远离法线",
              "misconception": null
            },
            {
              "id": "B",
              "text": "向法线偏折",
              "misconception": "REFRACT_ALWAYS_TO_NORMAL"
            },
            {
              "id": "C",
              "text": "折射角一定等于入射角",
              "misconception": "REFRACT_CONFUSE_REFLECTION"
            },
            {
              "id": "D",
              "text": "一定不发生折射",
              "misconception": "REFRACT_CONFUSE_REFLECTION"
            }
          ],
          "correct_option": "A",
          "explanation": "从玻璃进入空气时，折射光线通常远离法线。"
        },
        {
          "id": "DQ-REF-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "光从空气垂直射入玻璃。关于传播方向，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "方向不发生偏折",
              "misconception": null
            },
            {
              "id": "B",
              "text": "一定向法线偏折",
              "misconception": "REFRACT_NORMAL_MUST_BEND"
            },
            {
              "id": "C",
              "text": "一定远离法线",
              "misconception": "REFRACT_NORMAL_MUST_BEND"
            },
            {
              "id": "D",
              "text": "反射角和折射角都必须为45°",
              "misconception": "REFRACT_CONFUSE_REFLECTION"
            }
          ],
          "correct_option": "A",
          "explanation": "垂直入射时入射角为0，折射光线仍沿法线方向传播。"
        }
      ]
    },
    {
      "concept_id": "opt_lens_imaging",
      "concept_name": "凸透镜成像规律",
      "module": "光学",
      "chapter": "凸透镜成像",
      "diagnostic_goal": "检验学生是否真正理解物距范围与成像性质，并能处理遮挡等反口诀情境。",
      "misconceptions": [
        {
          "code": "LENS_MEMORIZE_WRONG_RANGE",
          "description": "混淆u>2f、f<u<2f、u<f的成像性质。"
        },
        {
          "code": "LENS_PARTIAL_COVER_PARTIAL_IMAGE",
          "description": "认为遮住部分透镜就只剩相应部分的像。"
        },
        {
          "code": "LENS_REAL_VIRTUAL_CONFUSION",
          "description": "混淆实像和虚像能否用光屏承接。"
        }
      ],
      "questions": [
        {
          "id": "DQ-LENS-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "物体放在凸透镜2倍焦距以外，光屏上通常得到怎样的像？",
          "options": [
            {
              "id": "A",
              "text": "倒立、缩小的实像",
              "misconception": null
            },
            {
              "id": "B",
              "text": "正立、放大的虚像",
              "misconception": "LENS_MEMORIZE_WRONG_RANGE"
            },
            {
              "id": "C",
              "text": "倒立、放大的实像",
              "misconception": "LENS_MEMORIZE_WRONG_RANGE"
            },
            {
              "id": "D",
              "text": "正立、缩小的实像",
              "misconception": "LENS_REAL_VIRTUAL_CONFUSION"
            }
          ],
          "correct_option": "A",
          "explanation": "u>2f时成倒立、缩小的实像。"
        },
        {
          "id": "DQ-LENS-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "物体位于凸透镜焦点以内。眼睛从透镜另一侧观察，通常看到怎样的像？",
          "options": [
            {
              "id": "A",
              "text": "正立、放大的虚像",
              "misconception": null
            },
            {
              "id": "B",
              "text": "倒立、放大的实像",
              "misconception": "LENS_MEMORIZE_WRONG_RANGE"
            },
            {
              "id": "C",
              "text": "倒立、缩小的实像",
              "misconception": "LENS_MEMORIZE_WRONG_RANGE"
            },
            {
              "id": "D",
              "text": "一定能在光屏上接到",
              "misconception": "LENS_REAL_VIRTUAL_CONFUSION"
            }
          ],
          "correct_option": "A",
          "explanation": "u<f时成正立、放大的虚像，不能直接承接在光屏上。"
        },
        {
          "id": "DQ-LENS-03",
          "role": "虚实辨析",
          "type": "single_choice",
          "stem": "当凸透镜在光屏上已经成清晰实像时，把光屏移走，人眼在合适位置还能看到该像吗？",
          "options": [
            {
              "id": "A",
              "text": "可以，实像处真实光线仍会聚",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不可以，实像必须依赖光屏才存在",
              "misconception": "LENS_REAL_VIRTUAL_CONFUSION"
            },
            {
              "id": "C",
              "text": "移走光屏后像自动变成虚像",
              "misconception": "LENS_REAL_VIRTUAL_CONFUSION"
            },
            {
              "id": "D",
              "text": "只有物体在焦点内才能看到像",
              "misconception": "LENS_MEMORIZE_WRONG_RANGE"
            }
          ],
          "correct_option": "A",
          "explanation": "光屏只是用来承接实像，不是实像形成的条件。"
        },
        {
          "id": "DQ-LENS-04",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "凸透镜正在光屏上成完整清晰的实像。用不透明纸遮住透镜上半部分，其他位置不变。光屏上的像通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "仍是完整像，但会变暗",
              "misconception": null
            },
            {
              "id": "B",
              "text": "只剩下像的下半部分",
              "misconception": "LENS_PARTIAL_COVER_PARTIAL_IMAGE"
            },
            {
              "id": "C",
              "text": "只剩像的上半部分",
              "misconception": "LENS_PARTIAL_COVER_PARTIAL_IMAGE"
            },
            {
              "id": "D",
              "text": "像完全消失",
              "misconception": "LENS_PARTIAL_COVER_PARTIAL_IMAGE"
            }
          ],
          "correct_option": "A",
          "explanation": "物体每个点发出的光可通过透镜不同区域参与成像；遮挡一部分主要减少到达光屏的光。"
        }
      ]
    },
    {
      "concept_id": "elec_current",
      "concept_name": "电流",
      "module": "电磁学",
      "chapter": "电路基础",
      "diagnostic_goal": "检验学生是否理解电流是电荷定向移动形成的物理量，并消除“电流被用电器消耗”“电源恒流输出”等典型直流电路迷思。",
      "misconceptions": [
        {
          "code": "CURRENT_CONSUMED",
          "description": "认为电流流过用电器后会被消耗而变小。"
        },
        {
          "code": "BATTERY_FIXED_CURRENT",
          "description": "认为同一电源无论接什么电路都提供固定电流。"
        },
        {
          "code": "SERIES_CURRENT_DIFF",
          "description": "认为串联电路中靠近电源处电流大、经过用电器后变小。"
        }
      ],
      "questions": [
        {
          "id": "DQ-I-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "两个小灯泡串联在同一电路中，电路正常工作。比较通过两灯的电流，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "相等",
              "misconception": null
            },
            {
              "id": "B",
              "text": "靠近电源正极的灯电流更大",
              "misconception": "SERIES_CURRENT_DIFF"
            },
            {
              "id": "C",
              "text": "经过第一个灯后电流被消耗，所以第二个更小",
              "misconception": "CURRENT_CONSUMED"
            },
            {
              "id": "D",
              "text": "哪个灯更亮，哪个电流一定更大",
              "misconception": "CURRENT_CONSUMED"
            }
          ],
          "correct_option": "A",
          "explanation": "串联电路各处电流相等，电流不会在经过灯泡后被“消耗掉”。"
        },
        {
          "id": "DQ-I-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "在同一个串联电路中，把电流表从灯泡前移到灯泡后，其他条件不变。示数通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "相同",
              "misconception": null
            },
            {
              "id": "B",
              "text": "灯泡后更小",
              "misconception": "CURRENT_CONSUMED"
            },
            {
              "id": "C",
              "text": "灯泡前更小",
              "misconception": "SERIES_CURRENT_DIFF"
            },
            {
              "id": "D",
              "text": "位置越靠近电源示数越大",
              "misconception": "SERIES_CURRENT_DIFF"
            }
          ],
          "correct_option": "A",
          "explanation": "稳定串联电路中各处电流相等。"
        },
        {
          "id": "DQ-I-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "同一节电池先接一个小电阻，再换成一个更大的电阻，均在正常范围内。电路电流会怎样？",
          "options": [
            {
              "id": "A",
              "text": "一般会改变，接更大电阻时电流较小",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不变，因为电池总提供固定电流",
              "misconception": "BATTERY_FIXED_CURRENT"
            },
            {
              "id": "C",
              "text": "更大电阻会消耗更多电流，所以电源先输出更多",
              "misconception": "CURRENT_CONSUMED"
            },
            {
              "id": "D",
              "text": "只由电池大小决定，与外电路无关",
              "misconception": "BATTERY_FIXED_CURRENT"
            }
          ],
          "correct_option": "A",
          "explanation": "电路电流由电源电压和电路电阻等共同决定，不是电池固定提供某个电流值。"
        },
        {
          "id": "DQ-I-04",
          "role": "并联迁移",
          "type": "single_choice",
          "stem": "两支路并联，干路电流为0.8 A，其中一支路电流0.3 A，则另一支路电流约为？",
          "options": [
            {
              "id": "A",
              "text": "0.5 A",
              "misconception": null
            },
            {
              "id": "B",
              "text": "0.8 A",
              "misconception": "CURRENT_CONSUMED"
            },
            {
              "id": "C",
              "text": "1.1 A",
              "misconception": "SERIES_CURRENT_DIFF"
            },
            {
              "id": "D",
              "text": "0.3 A",
              "misconception": "BATTERY_FIXED_CURRENT"
            }
          ],
          "correct_option": "A",
          "explanation": "并联电路干路电流等于各支路电流之和。"
        }
      ]
    },
    {
      "concept_id": "elec_voltage",
      "concept_name": "电压",
      "module": "电磁学",
      "chapter": "电路基础",
      "diagnostic_goal": "检验学生是否把电压理解为电路两点间的电势差/形成电流的重要条件，而不是“会流动的东西”或与电流等同。",
      "misconceptions": [
        {
          "code": "VOLTAGE_REQUIRES_CURRENT",
          "description": "认为没有电流就一定没有电压。"
        },
        {
          "code": "VOLTAGE_FLOWS",
          "description": "把电压说成在电路中流动或被消耗的量。"
        },
        {
          "code": "VOLTAGE_EQUALS_CURRENT",
          "description": "认为电压大就必然电流大，忽略电阻。"
        }
      ],
      "questions": [
        {
          "id": "DQ-U-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "一节电池没有接入闭合电路时，两端是否可以存在电压？",
          "options": [
            {
              "id": "A",
              "text": "可以",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不可以，因为没有电流",
              "misconception": "VOLTAGE_REQUIRES_CURRENT"
            },
            {
              "id": "C",
              "text": "只有接灯泡后才产生电压",
              "misconception": "VOLTAGE_REQUIRES_CURRENT"
            },
            {
              "id": "D",
              "text": "电压必须随电流一起流动",
              "misconception": "VOLTAGE_FLOWS"
            }
          ],
          "correct_option": "A",
          "explanation": "电源两端可以在开路时存在电压；有电压不等于一定有电流。"
        },
        {
          "id": "DQ-U-02",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "下列说法最恰当的是？",
          "options": [
            {
              "id": "A",
              "text": "电压是两点间的电势差，不是在导线中“流动”的东西",
              "misconception": null
            },
            {
              "id": "B",
              "text": "电压像电流一样从电源正极流向负极",
              "misconception": "VOLTAGE_FLOWS"
            },
            {
              "id": "C",
              "text": "灯泡把电压逐渐消耗完",
              "misconception": "VOLTAGE_FLOWS"
            },
            {
              "id": "D",
              "text": "电压和电流只是同一个量的不同叫法",
              "misconception": "VOLTAGE_EQUALS_CURRENT"
            }
          ],
          "correct_option": "A",
          "explanation": "电压描述两点间的电势差，不能用“电压流过某处”表述。"
        },
        {
          "id": "DQ-U-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "甲、乙两个电阻两端电压相同，但甲电阻比乙大。比较电流，正确的是？",
          "options": [
            {
              "id": "A",
              "text": "甲电流较小",
              "misconception": null
            },
            {
              "id": "B",
              "text": "电压相同，所以电流一定相同",
              "misconception": "VOLTAGE_EQUALS_CURRENT"
            },
            {
              "id": "C",
              "text": "甲电阻大，所以电流也一定大",
              "misconception": "VOLTAGE_EQUALS_CURRENT"
            },
            {
              "id": "D",
              "text": "只知道电压就能判断两者电流完全相同",
              "misconception": "VOLTAGE_EQUALS_CURRENT"
            }
          ],
          "correct_option": "A",
          "explanation": "同电压下，电阻越大电流越小。"
        }
      ]
    },
    {
      "concept_id": "elec_resistance",
      "concept_name": "电阻",
      "module": "电磁学",
      "chapter": "欧姆定律",
      "diagnostic_goal": "检验学生是否理解电阻是导体本身对电流阻碍作用的属性，在条件一定时不会因U/I的数值变化而被“算出来后改变”。",
      "misconceptions": [
        {
          "code": "R_CAUSED_BY_UI",
          "description": "把R=U/I理解为U变大导致R变大、I变大导致R变小。"
        },
        {
          "code": "R_ONLY_LENGTH",
          "description": "只考虑长度而忽略材料、横截面积、温度等因素。"
        },
        {
          "code": "R_CURRENT_CONSUMPTION",
          "description": "把电阻理解为消耗电流的能力。"
        }
      ],
      "questions": [
        {
          "id": "DQ-R-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "同一个定值电阻，温度保持不变，把两端电压从2 V增大到4 V。其电阻怎样变化？",
          "options": [
            {
              "id": "A",
              "text": "基本不变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "变为原来的2倍",
              "misconception": "R_CAUSED_BY_UI"
            },
            {
              "id": "C",
              "text": "变为原来的一半",
              "misconception": "R_CAUSED_BY_UI"
            },
            {
              "id": "D",
              "text": "电流越大电阻就越小",
              "misconception": "R_CAUSED_BY_UI"
            }
          ],
          "correct_option": "A",
          "explanation": "定值电阻在温度不变时R基本不随所加电压改变；U增大时I按比例增大。"
        },
        {
          "id": "DQ-R-02",
          "role": "公式辨析",
          "type": "single_choice",
          "stem": "关于R=U/I，下列理解正确的是？",
          "options": [
            {
              "id": "A",
              "text": "它可以用来计算导体电阻，但不能说明R由U和I共同“造成”",
              "misconception": null
            },
            {
              "id": "B",
              "text": "U增大一定导致R增大",
              "misconception": "R_CAUSED_BY_UI"
            },
            {
              "id": "C",
              "text": "I增大一定导致R减小",
              "misconception": "R_CAUSED_BY_UI"
            },
            {
              "id": "D",
              "text": "没有电流时导体电阻就为0",
              "misconception": "R_CAUSED_BY_UI"
            }
          ],
          "correct_option": "A",
          "explanation": "对给定导体在一定条件下，R反映导体本身性质；U/I给出其电阻值。"
        },
        {
          "id": "DQ-R-03",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "材料和横截面积相同、温度相同的两根导线，甲比乙长。通常谁的电阻更大？",
          "options": [
            {
              "id": "A",
              "text": "甲",
              "misconception": null
            },
            {
              "id": "B",
              "text": "乙",
              "misconception": "R_ONLY_LENGTH"
            },
            {
              "id": "C",
              "text": "一样，因为材料相同",
              "misconception": "R_ONLY_LENGTH"
            },
            {
              "id": "D",
              "text": "谁通过的电流大谁电阻大",
              "misconception": "R_CURRENT_CONSUMPTION"
            }
          ],
          "correct_option": "A",
          "explanation": "其他条件相同时，导线越长电阻越大。"
        },
        {
          "id": "DQ-R-04",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "灯丝工作时温度升高，测得其电阻也增大。这里电阻变化的主要原因是？",
          "options": [
            {
              "id": "A",
              "text": "温度改变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "因为电流被灯丝消耗了",
              "misconception": "R_CURRENT_CONSUMPTION"
            },
            {
              "id": "C",
              "text": "只因为电压变大，R必须随U增大",
              "misconception": "R_CAUSED_BY_UI"
            },
            {
              "id": "D",
              "text": "任何导体电阻都只由长度决定",
              "misconception": "R_ONLY_LENGTH"
            }
          ],
          "correct_option": "A",
          "explanation": "金属导体电阻通常随温度升高而增大；这是温度影响，不是R=U/I的代数因果。"
        }
      ]
    },
    {
      "concept_id": "elec_ohm_law",
      "concept_name": "欧姆定律",
      "module": "电磁学",
      "chapter": "欧姆定律",
      "diagnostic_goal": "检验学生是否理解欧姆定律的适用条件和变量关系，而不是只会代公式。",
      "misconceptions": [
        {
          "code": "OHM_R_DYNAMIC_RATIO",
          "description": "把R看成由当前U/I动态决定的变量。"
        },
        {
          "code": "OHM_IGNORE_CONDITION",
          "description": "忽略同一导体、温度等条件，机械套用正比关系。"
        },
        {
          "code": "OHM_WRONG_PROPORTION",
          "description": "混淆固定R时I∝U与固定U时I∝1/R。"
        }
      ],
      "questions": [
        {
          "id": "DQ-OHM-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "对同一个定值电阻，温度不变时，两端电压增大为原来的2倍，电流通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "约变为2倍",
              "misconception": null
            },
            {
              "id": "B",
              "text": "不变，因为电阻固定就不能改变电流",
              "misconception": "OHM_WRONG_PROPORTION"
            },
            {
              "id": "C",
              "text": "变为一半",
              "misconception": "OHM_WRONG_PROPORTION"
            },
            {
              "id": "D",
              "text": "电阻也自动变为2倍，所以电流不变",
              "misconception": "OHM_R_DYNAMIC_RATIO"
            }
          ],
          "correct_option": "A",
          "explanation": "R一定时I=U/R，电流与电压成正比。"
        },
        {
          "id": "DQ-OHM-02",
          "role": "变量辨析",
          "type": "single_choice",
          "stem": "在电压相同的条件下，两个定值电阻R甲>R乙，则通过它们的电流关系是？",
          "options": [
            {
              "id": "A",
              "text": "I甲<I乙",
              "misconception": null
            },
            {
              "id": "B",
              "text": "I甲>I乙",
              "misconception": "OHM_WRONG_PROPORTION"
            },
            {
              "id": "C",
              "text": "I甲=I乙",
              "misconception": "OHM_WRONG_PROPORTION"
            },
            {
              "id": "D",
              "text": "R越大越能“吸收电流”，所以无法判断",
              "misconception": "OHM_R_DYNAMIC_RATIO"
            }
          ],
          "correct_option": "A",
          "explanation": "U相同时I=U/R，电阻越大电流越小。"
        },
        {
          "id": "DQ-OHM-03",
          "role": "适用条件",
          "type": "single_choice",
          "stem": "某小灯泡两端电压逐渐增大时，灯丝温度也明显升高，其I-U关系不再严格为直线。最合理的解释是？",
          "options": [
            {
              "id": "A",
              "text": "灯丝温度改变导致电阻发生变化",
              "misconception": null
            },
            {
              "id": "B",
              "text": "欧姆定律说明任何导体I都必须与U严格成正比",
              "misconception": "OHM_IGNORE_CONDITION"
            },
            {
              "id": "C",
              "text": "R=U/I，所以是电流变化主动造成电阻变化",
              "misconception": "OHM_R_DYNAMIC_RATIO"
            },
            {
              "id": "D",
              "text": "电压越大，电流反而一定越小",
              "misconception": "OHM_WRONG_PROPORTION"
            }
          ],
          "correct_option": "A",
          "explanation": "欧姆关系的简单正比例判断要求导体电阻基本不变；灯丝升温会使电阻改变。"
        },
        {
          "id": "DQ-OHM-04",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "某同学说：“电流越大，由R=U/I可知电阻越小。”这个说法的问题主要是？",
          "options": [
            {
              "id": "A",
              "text": "把计算式中的比值关系误当成了因果关系",
              "misconception": null
            },
            {
              "id": "B",
              "text": "公式R=U/I本身错误",
              "misconception": "OHM_IGNORE_CONDITION"
            },
            {
              "id": "C",
              "text": "电流越大时电阻一定越大",
              "misconception": "OHM_WRONG_PROPORTION"
            },
            {
              "id": "D",
              "text": "只有串联电路才能使用电阻概念",
              "misconception": "OHM_IGNORE_CONDITION"
            }
          ],
          "correct_option": "A",
          "explanation": "对同一导体在条件一定时，U和I会共同按其电阻关系变化，不能把I单独看作R变化的原因。"
        }
      ]
    },
    {
      "concept_id": "elec_electric_power",
      "concept_name": "电功率",
      "module": "电磁学",
      "chapter": "电功率",
      "diagnostic_goal": "检验学生是否区分功率与电能、额定功率与实际功率，并理解功率描述做功快慢。",
      "misconceptions": [
        {
          "code": "POWER_EQUALS_ENERGY",
          "description": "认为功率大就必然消耗电能更多，忽略时间。"
        },
        {
          "code": "RATED_EQUALS_ACTUAL",
          "description": "认为额定功率在任何工作状态下都等于实际功率。"
        },
        {
          "code": "BRIGHTNESS_RATED_ONLY",
          "description": "比较灯泡亮度时只看额定功率，不考虑实际工作状态。"
        }
      ],
      "questions": [
        {
          "id": "DQ-EP-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "甲电器功率1000 W工作1 min，乙电器功率100 W工作20 min。谁消耗的电能更多？",
          "options": [
            {
              "id": "A",
              "text": "乙",
              "misconception": null
            },
            {
              "id": "B",
              "text": "甲，因为功率大就一定耗电更多",
              "misconception": "POWER_EQUALS_ENERGY"
            },
            {
              "id": "C",
              "text": "一样多，因为都是电器",
              "misconception": "POWER_EQUALS_ENERGY"
            },
            {
              "id": "D",
              "text": "只看功率无法再结合时间判断",
              "misconception": "POWER_EQUALS_ENERGY"
            }
          ],
          "correct_option": "A",
          "explanation": "W=Pt。甲为60000 J，乙为120000 J，功率大不代表在任意时间内总耗能一定更多。"
        },
        {
          "id": "DQ-EP-02",
          "role": "额定实际辨析",
          "type": "single_choice",
          "stem": "标有“220 V 40 W”的灯泡接在低于额定电压的电源上正常但较暗地发光。此时实际功率通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "小于40 W",
              "misconception": null
            },
            {
              "id": "B",
              "text": "仍一定等于40 W",
              "misconception": "RATED_EQUALS_ACTUAL"
            },
            {
              "id": "C",
              "text": "一定大于40 W",
              "misconception": "RATED_EQUALS_ACTUAL"
            },
            {
              "id": "D",
              "text": "额定功率会自动改写成实际功率",
              "misconception": "RATED_EQUALS_ACTUAL"
            }
          ],
          "correct_option": "A",
          "explanation": "40 W是额定电压下的额定功率，实际功率取决于实际工作状态。"
        },
        {
          "id": "DQ-EP-03",
          "role": "亮度迁移",
          "type": "single_choice",
          "stem": "比较两只灯泡亮暗时，下列说法最可靠的是？",
          "options": [
            {
              "id": "A",
              "text": "在相应实际电路条件下比较它们的实际功率",
              "misconception": null
            },
            {
              "id": "B",
              "text": "额定功率大的无论怎么连接都一定更亮",
              "misconception": "BRIGHTNESS_RATED_ONLY"
            },
            {
              "id": "C",
              "text": "电阻大的无论何时一定更亮",
              "misconception": "BRIGHTNESS_RATED_ONLY"
            },
            {
              "id": "D",
              "text": "只看灯泡标牌，不用考虑实际电压电流",
              "misconception": "RATED_EQUALS_ACTUAL"
            }
          ],
          "correct_option": "A",
          "explanation": "灯泡亮度与实际功率密切相关，额定功率只对应额定工作状态。"
        }
      ]
    },
    {
      "concept_id": "mech_pitch",
      "concept_name": "音调",
      "module": "力学",
      "chapter": "声现象",
      "diagnostic_goal": "检验学生是否把音调主要与频率联系起来，并与响度、传播速度区分。",
      "misconceptions": [
        {
          "code": "PITCH_EQUALS_LOUDNESS",
          "description": "把音调高低与声音响度混淆。"
        },
        {
          "code": "PITCH_AMPLITUDE",
          "description": "认为振幅越大音调越高。"
        },
        {
          "code": "PITCH_SPEED",
          "description": "认为声音传播速度越大音调越高。"
        }
      ],
      "questions": [
        {
          "id": "DQ-PITCH-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "其他条件相近时，发声体振动频率越高，听到的声音通常怎样？",
          "options": [
            {
              "id": "A",
              "text": "音调越高",
              "misconception": null
            },
            {
              "id": "B",
              "text": "响度一定越大",
              "misconception": "PITCH_EQUALS_LOUDNESS"
            },
            {
              "id": "C",
              "text": "传播速度一定越大",
              "misconception": "PITCH_SPEED"
            },
            {
              "id": "D",
              "text": "音调越低",
              "misconception": "PITCH_AMPLITUDE"
            }
          ],
          "correct_option": "A",
          "explanation": "音调主要由发声体振动频率决定。"
        },
        {
          "id": "DQ-PITCH-02",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "同一音叉轻敲和重敲，重敲时振幅更大。若振动频率近似不变，主要变化的是？",
          "options": [
            {
              "id": "A",
              "text": "响度",
              "misconception": null
            },
            {
              "id": "B",
              "text": "音调",
              "misconception": "PITCH_AMPLITUDE"
            },
            {
              "id": "C",
              "text": "频率一定翻倍",
              "misconception": "PITCH_AMPLITUDE"
            },
            {
              "id": "D",
              "text": "声音在空气中的速度",
              "misconception": "PITCH_SPEED"
            }
          ],
          "correct_option": "A",
          "explanation": "振幅主要影响响度；频率不变时音调基本不变。"
        },
        {
          "id": "DQ-PITCH-03",
          "role": "跨概念辨析",
          "type": "single_choice",
          "stem": "同一频率的声波从空气传入另一介质，传播速度发生变化。若频率保持不变，音调怎样？",
          "options": [
            {
              "id": "A",
              "text": "基本不变",
              "misconception": null
            },
            {
              "id": "B",
              "text": "传播越快音调越高",
              "misconception": "PITCH_SPEED"
            },
            {
              "id": "C",
              "text": "传播越慢音调越低",
              "misconception": "PITCH_SPEED"
            },
            {
              "id": "D",
              "text": "音调由传播速度决定",
              "misconception": "PITCH_SPEED"
            }
          ],
          "correct_option": "A",
          "explanation": "音调对应频率；介质改变可改变传播速度和波长，但频率由声源决定。"
        }
      ]
    },
    {
      "concept_id": "mech_loudness",
      "concept_name": "响度",
      "module": "力学",
      "chapter": "声现象",
      "diagnostic_goal": "检验学生是否把响度与振幅、距离等因素联系起来，并与音调区分。",
      "misconceptions": [
        {
          "code": "LOUDNESS_EQUALS_PITCH",
          "description": "把频率/音调变化当作响度变化。"
        },
        {
          "code": "LOUDNESS_AMPLITUDE_WRONG",
          "description": "认为振幅增大声音反而更小或与响度无关。"
        },
        {
          "code": "LOUDNESS_IGNORE_DISTANCE",
          "description": "认为声源振幅一定时，听到的响度与距离无关。"
        }
      ],
      "questions": [
        {
          "id": "DQ-LOUD-01",
          "role": "基线判断",
          "type": "single_choice",
          "stem": "同一发声体在其他条件相同时，振幅增大，通常听到的声音怎样？",
          "options": [
            {
              "id": "A",
              "text": "更响",
              "misconception": null
            },
            {
              "id": "B",
              "text": "音调一定更高",
              "misconception": "LOUDNESS_EQUALS_PITCH"
            },
            {
              "id": "C",
              "text": "更轻",
              "misconception": "LOUDNESS_AMPLITUDE_WRONG"
            },
            {
              "id": "D",
              "text": "响度不受振幅影响",
              "misconception": "LOUDNESS_AMPLITUDE_WRONG"
            }
          ],
          "correct_option": "A",
          "explanation": "振幅越大，通常响度越大。"
        },
        {
          "id": "DQ-LOUD-02",
          "role": "变式迁移",
          "type": "single_choice",
          "stem": "同一扬声器以相同状态发声，听者从距扬声器2 m走到10 m。通常听到的声音怎样？",
          "options": [
            {
              "id": "A",
              "text": "变弱",
              "misconception": null
            },
            {
              "id": "B",
              "text": "音调降低所以变弱",
              "misconception": "LOUDNESS_EQUALS_PITCH"
            },
            {
              "id": "C",
              "text": "响度完全不变",
              "misconception": "LOUDNESS_IGNORE_DISTANCE"
            },
            {
              "id": "D",
              "text": "距离越远振幅越大，所以更响",
              "misconception": "LOUDNESS_IGNORE_DISTANCE"
            }
          ],
          "correct_option": "A",
          "explanation": "传播过程中声能分散，通常距离声源越远听到的响度越小。"
        },
        {
          "id": "DQ-LOUD-03",
          "role": "反例检验",
          "type": "single_choice",
          "stem": "甲声音频率高但振幅小，乙声音频率低但振幅大。能否仅根据“甲频率更高”断定甲更响？",
          "options": [
            {
              "id": "A",
              "text": "不能",
              "misconception": null
            },
            {
              "id": "B",
              "text": "能，频率越高一定越响",
              "misconception": "LOUDNESS_EQUALS_PITCH"
            },
            {
              "id": "C",
              "text": "能，音调高就等于响度大",
              "misconception": "LOUDNESS_EQUALS_PITCH"
            },
            {
              "id": "D",
              "text": "能，传播速度也一定更快",
              "misconception": "LOUDNESS_EQUALS_PITCH"
            }
          ],
          "correct_option": "A",
          "explanation": "频率主要决定音调，不能仅由频率判断响度。"
        }
      ]
    }
  ]
};
