/* ============================================================
   扶桑 · MBTI × 紫微斗数 全息融合分析引擎
   - 16 道核心情境测评题库（E/I, S/N, T/F, J/P）
   - 16 种 MBTI 原型档案（东方玄学与现代认知功能双语解构）
   - 紫微斗数十四主星 × MBTI 交叉共振算法
   - 先天命盘星耀底色与后天认知心理利刃综合推演
   ============================================================ */

export type MBTIDimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export interface MBTIQuestion {
  id: number
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  scenario: string
  question: string
  optionA: {
    text: string
    subtext: string
    dimension: MBTIDimension
  }
  optionB: {
    text: string
    subtext: string
    dimension: MBTIDimension
  }
}

export interface MBTIMeta {
  type: MBTIType
  chineseTitle: string
  archetype: string
  temperament: 'NT 理性者' | 'NF 理想家' | 'SJ 传统护卫' | 'SP 自由探索'
  cognitiveStack: string // 认知功能栈，如 Ni > Te > Fi > Se
  shortDesc: string
  keywords: string[]
  strengths: string[]
  shadows: string[]
  careerFields: string[]
  relationshipStyle: string
}

/* ------------------------------------------------------------
   16 道精炼情境选择题
   ------------------------------------------------------------ */
export const MBTI_QUESTIONS: MBTIQuestion[] = [
  // 1-4: E (外向) vs I (内向)
  {
    id: 1,
    dimension: 'EI',
    scenario: '周五傍晚历经高强度的一周劳顿后',
    question: '你最渴望以何种方式重新充满精神能量？',
    optionA: {
      text: '约上三两好友谈天说地或置身热闹场域',
      subtext: '在人群与外部刺激互动中汲取元气',
      dimension: 'E',
    },
    optionB: {
      text: '关掉手机独自品茶、阅读、放空或沉浸所爱',
      subtext: '在静谧独处与向内观照中聚拢能量',
      dimension: 'I',
    },
  },
  {
    id: 2,
    dimension: 'EI',
    scenario: '初次踏入一场汇聚各界名流的雅集聚会',
    question: '你的自然反应通常是？',
    optionA: {
      text: '主动举杯穿梭交谈，结识新面孔并引燃话题',
      subtext: '视破冰为展现风采与链接资源的机遇',
      dimension: 'E',
    },
    optionB: {
      text: '偏好安静旁观，仅与身旁投缘之人做深度长谈',
      subtext: '不喜表面客套，追求真挚且低消耗的交流',
      dimension: 'I',
    },
  },
  {
    id: 3,
    dimension: 'EI',
    scenario: '当内心萌生一个绝妙灵感或洞见时',
    question: '你更习惯如何推敲演进它？',
    optionA: {
      text: '立刻找伙伴口头切磋，边讨论边理清思路',
      subtext: '语言输出是我的思考加速器',
      dimension: 'E',
    },
    optionB: {
      text: '独自闭关默默梳理笔记，待框架成熟再对外开诚',
      subtext: '向内沉淀是我的思考护城河',
      dimension: 'I',
    },
  },
  {
    id: 4,
    dimension: 'EI',
    scenario: '周遭人对你行事风格的普遍印象是？',
    question: '你的社交能见度更偏向哪一种？',
    optionA: {
      text: '热情开朗、风趣幽默、反应敏捷且极具亲和力',
      subtext: '自带聚光灯与磁场共鸣',
      dimension: 'E',
    },
    optionB: {
      text: '沉静自敛、深邃内敛、不争自显且气场独立',
      subtext: '如静水流深，相熟方知底蕴',
      dimension: 'I',
    },
  },

  // 5-8: S (实感) vs N (直觉)
  {
    id: 5,
    dimension: 'SN',
    scenario: '研读一卷古籍命书或商业策划报告时',
    question: '你最先被内容的哪一方面所牢牢吸引？',
    optionA: {
      text: '详实确切的数字案例、执行细则与经世致用之法',
      subtext: '立足当下真实细节与已知实证',
      dimension: 'S',
    },
    optionB: {
      text: '文字背后的底层隐喻、宏观规律与未来无限推演',
      subtext: '洞察万物互联脉络与宏观天机',
      dimension: 'N',
    },
  },
  {
    id: 6,
    dimension: 'SN',
    scenario: '面对纷繁复杂的世界，你更相信哪种认识方式？',
    question: '你评估事物真实性的第一抓手是？',
    optionA: {
      text: '亲眼所见、亲身经验与实打实的历史先例',
      subtext: '凡事讲求根据，不作空中楼阁之虚谈',
      dimension: 'S',
    },
    optionB: {
      text: '冥冥之中的直觉嗅觉、预兆感知与第六感洞察',
      subtext: '看穿表象迷雾，直击未来可能趋势',
      dimension: 'N',
    },
  },
  {
    id: 7,
    dimension: 'SN',
    scenario: '当你向他人描摹描述一段经历或宏图时',
    question: '你的表达习惯偏向于？',
    optionA: {
      text: '按时间次序如实展开，强调具体谁、在哪、做了什么',
      subtext: '叙事写实精确，细节历历在目',
      dimension: 'S',
    },
    optionB: {
      text: '善用诗意比喻、概括宏观蓝图与精神意象',
      subtext: '提炼意蕴精髓，跳脱具象框架',
      dimension: 'N',
    },
  },
  {
    id: 8,
    dimension: 'SN',
    scenario: '在面对一项长期目标的旅途之中',
    question: '什么能带给你更踏实的成就感？',
    optionA: {
      text: '每一步都扎扎实实走过，眼见手头实体成果逐渐丰盈',
      subtext: '步步为营，循序渐进积土成山',
      dimension: 'S',
    },
    optionB: {
      text: '构想出颠覆既有常规的全新范式，哪怕当下尚未成型',
      subtext: '打破陈规，开拓前所未有的视界',
      dimension: 'N',
    },
  },

  // 9-12: T (思考) vs F (情感)
  {
    id: 9,
    dimension: 'TF',
    scenario: '挚友身陷困境向你倾诉求助时',
    question: '你的第一本能回应更偏向哪一方？',
    optionA: {
      text: '客观剖析因果症结，给出精准利弊推演与解决方案',
      subtext: '以真知良药破除迷惘，讲求实效',
      dimension: 'T',
    },
    optionB: {
      text: '先给予全神贯注的倾听共情、情绪包容与温暖拥抱',
      subtext: '抚慰内心创伤，尊重人的真切感受',
      dimension: 'F',
    },
  },
  {
    id: 10,
    dimension: 'TF',
    scenario: '在团队协作或家庭决策发生重大分歧时',
    question: '你恪守的核心评判准则是什么？',
    optionA: {
      text: '就事论事遵循客观真理与效率最大化，不讲人情偏颇',
      subtext: '公正不阿，依规矩成方圆',
      dimension: 'T',
    },
    optionB: {
      text: '兼顾各方感受与心理尊严，力求团队和睦与价值认同',
      subtext: '仁厚体恤，同舟共济方能长远',
      dimension: 'F',
    },
  },
  {
    id: 11,
    dimension: 'TF',
    scenario: '别人对你提出一段苛刻但有依据的批评意见时',
    question: '你的内心第一层涟漪是？',
    optionA: {
      text: '冷静滤除情绪噪音，只甄别其中逻辑正确部分吸收修正',
      subtext: '视反馈为认知迭代的数据补丁',
      dimension: 'T',
    },
    optionB: {
      text: '内心先感到隐隐刺痛或失落，随后体察对方的态度善恶',
      subtext: '情绪感受先行，珍视彼此关系的善意',
      dimension: 'F',
    },
  },
  {
    id: 12,
    dimension: 'TF',
    scenario: '回首过往生命中的重要决断时刻',
    question: '支撑你拍板定夺的终极砝码是？',
    optionA: {
      text: '冷峻清醒的利害分析、投资回报比与推演胜率',
      subtext: '理性之剑，不为感性私欲所动摇',
      dimension: 'T',
    },
    optionB: {
      text: '心底深处的热忱向往、良知召唤与人情羁绊',
      subtext: '随心而行，无愧于内心情感与信仰',
      dimension: 'F',
    },
  },

  // 13-16: J (判断) vs P (知觉)
  {
    id: 13,
    dimension: 'JP',
    scenario: '规划一次期待已久的远行或重大项目',
    question: '你的行事习惯更符合哪种状态？',
    optionA: {
      text: '提前制定周详行程表、备忘清单并预设应对方案',
      subtext: '掌控全局节奏，心里方有笃定',
      dimension: 'J',
    },
    optionB: {
      text: '仅定大致方向与落脚点，保留随心漫游与即兴奇遇',
      subtext: '顺其自然，风景常在计划之外',
      dimension: 'P',
    },
  },
  {
    id: 14,
    dimension: 'JP',
    scenario: '手头同时面对几项待办事项或截止期限',
    question: '你的日常工作节律通常是？',
    optionA: {
      text: '定好优先级与打卡进度，尽早完成避免临阵慌乱',
      subtext: '喜欢事情落袋为安，享受划掉清单的快感',
      dimension: 'J',
    },
    optionB: {
      text: '在最后关头的压强下往往迸发最强专注与灵感火花',
      subtext: '弹性应变，享受边走边调的敏捷状态',
      dimension: 'P',
    },
  },
  {
    id: 15,
    dimension: 'JP',
    scenario: '对于居住环境或电脑桌面的收纳管理',
    question: '你最自然的状态是？',
    optionA: {
      text: '井井有条，物归原位，容不得视觉上长期杂乱',
      subtext: '外在秩序是内心清明的镜像',
      dimension: 'J',
    },
    optionB: {
      text: '外人看似凌乱但自己心中有数，不拘泥形式规整',
      subtext: '自由舒适即可，注意力在更有趣的事物上',
      dimension: 'P',
    },
  },
  {
    id: 16,
    dimension: 'JP',
    scenario: '当既定日程被突发外力意外打乱时',
    question: '你的第一心理感受是？',
    optionA: {
      text: '颇为烦躁不安，渴望立刻重塑掌控恢复秩序',
      subtext: '秩序被打乱会消耗我的精神精力',
      dimension: 'J',
    },
    optionB: {
      text: '泰然处之甚至颇觉新奇，迅速根据新局势随机应变',
      subtext: '变化本是天道常态，顺势而为即是坦途',
      dimension: 'P',
    },
  },
]

/* ------------------------------------------------------------
   16 型 MBTI 档案数据库
   ------------------------------------------------------------ */
export const MBTI_METAS: Record<MBTIType, MBTIMeta> = {
  INTJ: {
    type: 'INTJ',
    chineseTitle: '建筑师 · 极智破局官',
    archetype: '战略布道者',
    temperament: 'NT 理性者',
    cognitiveStack: 'Ni > Te > Fi > Se',
    shortDesc: '以高维直觉推演万物终局，以铁血逻辑筑起现实天梯。冷静深邃，不怒自威。',
    keywords: ['宏观闭环', '战略远见', '极高标准', '独立主权'],
    strengths: ['穿透未来趋势', '复杂系统解构', '逆境绝对冷静', '坚定不移的执行力'],
    shadows: ['容易陷入对蠢钝的苛责', '忽略人情共情成本', '长期过度紧绷导致精力枯竭'],
    careerFields: ['顶层架构师', '量化投资人', '战略军师', '科技领袖', '哲思学者'],
    relationshipStyle: '极度珍视精神同频与智识对弈；宁缺毋滥，一旦认定理智深情兼具。',
  },
  INTP: {
    type: 'INTP',
    chineseTitle: '逻辑学家 · 乾坤推演家',
    archetype: '高维哲论者',
    temperament: 'NT 理性者',
    cognitiveStack: 'Ti > Ne > Si > Fe',
    shortDesc: '穿梭于宇宙底层定理与虚空灵感之间的思想隐士。追问终极逻辑，解构世俗幻象。',
    keywords: ['底层解构', '思维漫游', '求真洁癖', '机变推演'],
    strengths: ['秒懂本质规律', '多维联想悟性', '不盲从权威', '绝境奇招破局'],
    shadows: ['容易思虑过甚而迟疑落子', '对世俗人际潜规则钝感', '三分钟热度易坑深'],
    careerFields: ['AI 算法科研', '哲学与玄学研究', '系统解构顾问', '独立开发者', '科幻作家'],
    relationshipStyle: '像一只猫；需要大量精神独处空间，但被其信任者可窥其温软纯真。',
  },
  ENTJ: {
    type: 'ENTJ',
    chineseTitle: '指挥官 · 铁血执旗手',
    archetype: '霸图开拓者',
    temperament: 'NT 理性者',
    cognitiveStack: 'Te > Ni > Se > Fi',
    shortDesc: '天生为破壁开荒与重构世界秩序而生的统帅。雷厉风行，将野心锻造成现实丰碑。',
    keywords: ['穿透执行', '统御全局', '结果导向', '气吞山河'],
    strengths: ['资源极限调度', '穿透重重阻力', '商业与战略嗅觉', '点石成金的组织力'],
    shadows: ['刚愎好胜易灼伤身边人', '难以容忍软弱与拖沓', '内心脆弱面不易自洽'],
    careerFields: ['跨国企业 CEO', '创业先驱', '产业投资操盘手', '组织变革家', '统筹领导'],
    relationshipStyle: '寻找并肩作战的平起平坐盟友，爱是互相托举与共同征服世界。',
  },
  ENTP: {
    type: 'ENTP',
    chineseTitle: '辩论家 · 逍遥破壁人',
    archetype: '千面灵狐',
    temperament: 'NT 理性者',
    cognitiveStack: 'Ne > Ti > Fe > Si',
    shortDesc: '永远在打破常规、挑战不可能的智力冒险家。敏锐犀利，于嬉笑怒骂中颠覆陈规。',
    keywords: ['降维脑洞', '颠覆创新', '舌灿莲花', '博弈机趣'],
    strengths: ['天马行空的解法', '极强临场应变', '穿透伪善的话术', '跨界整合能力'],
    shadows: ['缺乏恒常落地耐力', '好辩容易引来无谓争端', '难以维系平淡日常'],
    careerFields: ['风险投资合伙人', '商业创新顾问', '脱口秀与新媒体创作者', '顶尖公关专家'],
    relationshipStyle: '充满智力挑逗与新鲜感，最怕无趣与平庸；能接住其脑洞者即为知己。',
  },
  INFJ: {
    type: 'INFJ',
    chineseTitle: '提倡者 · 灵犀洞照使',
    archetype: '世外隐士',
    temperament: 'NF 理想家',
    cognitiveStack: 'Ni > Fe > Ti > Se',
    shortDesc: '外表温润如玉，内藏普渡苍生之宏愿与看穿虚伪之冷眼。自带宿命神秘色彩。',
    keywords: ['灵性洞照', '慈悲深情', '洞穿人心', '崇高愿景'],
    strengths: ['穿透式共情力', '深层直觉预感', '点化他人潜能', '坚定的人文信仰'],
    shadows: ['吸收过多他人负能量导致内耗', '门禁极严易决绝断联(Door Slam)', '过度理想化'],
    careerFields: ['身心疗愈大师', '心理导师', '作家与哲人', '战略文化总监', '公益领袖'],
    relationshipStyle: '追求灵魂深处的绝对共振与精神归宿；一生只为寻觅能看透自己面具之人。',
  },
  INFP: {
    type: 'INFP',
    chineseTitle: '调停者 · 诗性筑梦师',
    archetype: '纯真守火人',
    temperament: 'NF 理想家',
    cognitiveStack: 'Fi > Ne > Si > Te',
    shortDesc: '灵魂深处宿有一座纯净圣殿的漫游诗人。珍视真善美，于凡俗红尘中守护本真灵性。',
    keywords: ['赤子之心', '高级审美', '同理共感', '灵性觉知'],
    strengths: ['艺术通透悟性', '极致道德自律', '包容世间一切异类', '润物细无声的情感'],
    shadows: ['现实钝感易受现实碰壁', '逃避冲突拖延症', '情绪内耗波幅过大'],
    careerFields: ['文学艺术创作', '心理咨询疗愈', '人文教育', '创意策划', '生活美学设计师'],
    relationshipStyle: '如童话般纯粹深情，愿意为爱牺牲奉献，最伤于世俗欺瞒与敷衍冷漠。',
  },
  ENFJ: {
    type: 'ENFJ',
    chineseTitle: '主人公 · 暖阳领航官',
    archetype: '时代燃灯人',
    temperament: 'NF 理想家',
    cognitiveStack: 'Fe > Ni > Se > Ti',
    shortDesc: '生来具有点燃万人心灯之伟力的领航者。胸怀宽广，春风化雨，让人不由自主信赖追随。',
    keywords: ['号召感染', '仁德布道', '赋能他人', '领袖胸怀'],
    strengths: ['顶尖群众魅力', '精准感知群体情绪', '激发他人向上信念', '卓越的外交斡旋'],
    shadows: ['过度讨好背负过多他人命运', '忽视自我真实诉求', '易因他人背弃而心碎'],
    careerFields: ['教育家与演说家', '公关与品牌领袖', '政界与社会活动家', '资深人力合伙人'],
    relationshipStyle: '无私且充满热忱的伴侣，渴望与对方共同成为更好的人，滋养全家。',
  },
  ENFP: {
    type: 'ENFP',
    chineseTitle: '竞选者 · 炽烈追光者',
    archetype: '灵感快乐使',
    temperament: 'NF 理想家',
    cognitiveStack: 'Ne > Fi > Te > Si',
    shortDesc: '像一束永不停歇、照亮黯淡长夜的流光。对世间充满好奇，永远能在绝处开出繁花。',
    keywords: ['灵动无拘', '情感丰沛', '机锋自现', '奇思妙想'],
    strengths: ['感染全场的生命力', '瞬间化解冰霜之僵局', '天生灵感捕手', '深层人性关怀'],
    shadows: ['情绪三分钟热度', '对琐碎落地事务感到折磨', '内心孤独与欢脱的反差'],
    careerFields: ['创意总监', '活动策划大师', '自媒体顶流', '文化IP操盘', '咨询顾问'],
    relationshipStyle: '热烈浪漫且忠诚深情，渴望无话不谈的灵魂冒险，拒绝一切枯燥教条。',
  },
  ISTJ: {
    type: 'ISTJ',
    chineseTitle: '物流师 · 磐石基石官',
    archetype: '秩序守护者',
    temperament: 'SJ 传统护卫',
    cognitiveStack: 'Si > Te > Fi > Ne',
    shortDesc: '沉稳厚重、信守诺言的天地柱石。行胜于言，在风雨飘摇中筑起最坚实可靠的堤坝。',
    keywords: ['恪尽职守', '务实严谨', '诺重千金', '秩序基石'],
    strengths: ['执行毫无差错', '忠诚可靠值得托付', '卓越的风险防范', '稳健的财富积累'],
    shadows: ['固守旧例对剧变抵触', '不善于表达温情爱意', '对自己与他人要求过苛'],
    careerFields: ['风控与审计法务', '高级财务总监', '核心政务管理', '军工与精密制造'],
    relationshipStyle: '沉默而深沉的山脉；不常言爱，却把所有爱意化为真金白银与终生守护。',
  },
  ISFJ: {
    type: 'ISFJ',
    chineseTitle: '守卫者 · 慈心护道人',
    archetype: '大地母亲',
    temperament: 'SJ 传统护卫',
    cognitiveStack: 'Si > Fe > Ti > Ne',
    shortDesc: '润物细无声的守护之星。以温厚耐劳之肩，默默担起人间烟火温存，家国之定海神针。',
    keywords: ['体贴入微', '尽职奉献', '岁月静好', '仁厚持重'],
    strengths: ['无微不至的关照', '极强责任担当', '珍视传统与家庭纽带', '耐得住寂寞的长跑'],
    shadows: ['习惯隐忍压抑真实自我', '被动背负过多负担', '难以拒绝他人恳求'],
    careerFields: ['医疗健康管理', '教育行政', '客户关系维护', '非营利服务', '家族财富管家'],
    relationshipStyle: '最温馨安稳的港湾；一旦许诺便是一生守护，细水长流相濡以沫。',
  },
  ESTJ: {
    type: 'ESTJ',
    chineseTitle: '总经理 · 铁腕定局者',
    archetype: '宗族执事',
    temperament: 'SJ 传统护卫',
    cognitiveStack: 'Te > Si > Ne > Fi',
    shortDesc: '立规矩、定方圆、平乱象的实干铁腕。雷厉风行抓效益，保境安民成大事。',
    keywords: ['立法定规', '强力推进', '实干笃行', '崇尚权威'],
    strengths: ['雷霆般的组织推进', '明辨赏罚纪律严明', '高压下稳定产出', '现实世界的压舱石'],
    shadows: ['好为人师掌控欲过盛', '对异见缺乏包容柔韧', '容易忽略情感细腻需求'],
    careerFields: ['运营总监 COO', '政法监察系统', '工程总指挥', '制造业统领', '实业企业家'],
    relationshipStyle: '担当起全家的顶梁柱，要求明确但保护欲极强，讲求务实有保障的生活。',
  },
  ESFJ: {
    type: 'ESFJ',
    chineseTitle: '执政官 · 和乐融和官',
    archetype: '宗门枢纽',
    temperament: 'SJ 传统护卫',
    cognitiveStack: 'Fe > Si > Ne > Ti',
    shortDesc: '人脉网络中的向心力枢纽。八面玲珑，和气致祥，总能让身旁每一个人感受到温暖被重视。',
    keywords: ['情商极高', '乐善好施', '和谐黏合', '宾至如归'],
    strengths: ['极高社交敏感度', '擅长维系庞大社群', '危机中安抚人心', '强大的组织协调'],
    shadows: ['过度在乎外界评价口舌', '卷入他人纷争难抽身', '害怕冲突而委曲求全'],
    careerFields: ['商务外交代表', '资深人力资源', '高端社群运营', '会展与公关负责人'],
    relationshipStyle: '极具仪式感与家庭温情；以伴侣与家人的快乐为己任，期待深切回馈。',
  },
  ISTP: {
    type: 'ISTP',
    chineseTitle: '鉴赏家 · 独行破阵客',
    archetype: '绝命刀客',
    temperament: 'SP 自由探索',
    cognitiveStack: 'Ti > Se > Ni > Fe',
    shortDesc: '人狠话不多的冷静手艺人与刺客。身怀绝技，临危不乱，以最精妙解法穿透复杂困局。',
    keywords: ['沉着机敏', '绝技在手', '崇尚自由', '极简高效'],
    strengths: ['绝境下的顶级心理素质', '机械与系统实操天花板', '去伪存真极简思维', '随性潇洒不受约束'],
    shadows: ['过分游离难以融入体制', '对情感沟通懒于应对', '冲动冒险风险偏好高'],
    careerFields: ['极客与系统架构', '高精尖手术/机械工程师', '特种勘探与飞行员', '极限运动员'],
    relationshipStyle: '需要自由与松弛；不说废话，在危难时刻会默默为你摆平一切麻烦。',
  },
  ISFP: {
    type: 'ISFP',
    chineseTitle: '探险家 · 墨客游侠儿',
    archetype: '落花仙子',
    temperament: 'SP 自由探索',
    cognitiveStack: 'Fi > Se > Ni > Te',
    shortDesc: '游走于大自然与艺术秘境之间的灵秀行者。对美具有天然本能，不喜争名，唯愿心安。',
    keywords: ['物我两忘', '高级审美', '温润随缘', '灵性觉照'],
    strengths: ['直觉色彩与空间通感', '不给他人施加任何压力', '忠于当下的真切体验', '细腻柔韧的生命力'],
    shadows: ['对世俗竞争主动退避', '规划力偏弱随波逐流', '过于敏感易缩回壳中'],
    careerFields: ['视觉艺术与设计', '音乐人与摄影师', '手作非遗大师', '园艺与生态保护'],
    relationshipStyle: '安宁惬意不打扰的爱；像山野的风，只为懂得其清幽香气的人长久驻足。',
  },
  ESTP: {
    type: 'ESTP',
    chineseTitle: '企业家 · 惊涛弄潮儿',
    archetype: '风暴骑手',
    temperament: 'SP 自由探索',
    cognitiveStack: 'Se > Ti > Fe > Ni',
    shortDesc: '在危机与机遇的风暴之眼中狂欢的现实赢家。嗅觉灵敏，杀伐果决，天生危机公关操盘手。',
    keywords: ['敏锐嗅觉', '敢打敢拼', '借力打力', '当下称雄'],
    strengths: ['现场掌控力与破冰力', '捕捉瞬间商业变现商机', '抗压极强不纠结过往', '极度实战实用主义'],
    shadows: ['缺乏对超长周期的耐性', '易厌倦平淡日常而惹火', '不喜哲学抽象反思'],
    careerFields: ['连续创业家', '顶级销售总监', '风险套利操盘手', '突发危机公关', '实战投资人'],
    relationshipStyle: '带你体验人间最刺激好玩的风景；爱是当下的尽兴与不虚此行。',
  },
  ESFP: {
    type: 'ESFP',
    chineseTitle: '表演者 · 极乐燃火官',
    archetype: '红尘欢客',
    temperament: 'SP 自由探索',
    cognitiveStack: 'Se > Fi > Te > Ni',
    shortDesc: '天生属于聚光灯的魅力发电机。将生活过成一台永不散场的盛宴，所到之处皆是欢笑。',
    keywords: ['生机勃勃', '魅力四射', '活在当下', '真情流露'],
    strengths: ['秒级点燃全场氛围', '极致审美与时尚感知', '纯粹真实毫无矫饰', '广结善缘朋友遍天下'],
    shadows: ['难以面对冷寂孤独', '逃避严肃长期承诺', '财务规划容易冲动挥霍'],
    careerFields: ['演艺与娱乐明星', '时尚买手与主理人', '文旅体验官', '奢侈品私域运营'],
    relationshipStyle: '热情似火且毫不吝啬赞美；每天都是热恋，带你领略人间所有鲜活滋味。',
  },
}

/* ------------------------------------------------------------
   紫微主星 × MBTI 交叉共振深度解析
   ------------------------------------------------------------ */

export interface ZiweiMBTIAnalysis {
  dualTitle: string // 复合称号，如：紫微天府 · INTJ 极君建筑师
  resonanceType: 'resonance' | 'complementary' | 'tension' // 共振类型
  resonanceScore: number // 契合指数 75 - 99
  soulDuality: {
    innateCore: string // 先天紫微底色 (灵魂原力)
    acquiredBlade: string // 后天 MBTI 利刃 (处世武器)
    fusionOverview: string // 融合概述
  }
  radar: {
    strategy: number // 宏观战略
    execution: number // 穿透执行
    insight: number // 灵感直觉
    empathy: number // 共情沟通
    resilience: number // 逆境抗压
    wealthSense: number // 商业财气
  }
  superpowers: string[] // 优势放大叠加区
  blindspots: {
    alarm: string // 警报点
    advice: string // 命理与心理破局建议
  }
  careerNiche: {
    bestRole: string // 天命生态位
    keyAdvantage: string // 绝杀优势
    avoidTrap: string // 避坑指南
  }
  relationshipInsight: {
    chemistry: string // 感情磁场
    idealPartnerStar: string // 最佳配对紫微星
    idealPartnerMBTI: string // 最佳配对 MBTI
  }
}

// 主星典型匹配倾向映射
const STAR_NATURAL_MBTI: Record<string, MBTIType[]> = {
  紫微: ['INTJ', 'ENTJ', 'INFJ'],
  天机: ['INTP', 'INTJ', 'ENTP'],
  太阳: ['ENFJ', 'ESFJ', 'ENTJ'],
  武曲: ['ENTJ', 'ISTJ', 'ESTJ'],
  天同: ['INFP', 'ISFP', 'ENFP'],
  廉贞: ['ENTP', 'ENFP', 'ESTP'],
  天府: ['ESTJ', 'ESFJ', 'ENTJ'],
  太阴: ['ISFJ', 'INFJ', 'INFP'],
  贪狼: ['ENFP', 'ESTP', 'ESFP'],
  巨门: ['INTP', 'ENTP', 'ISTP'],
  天相: ['ISFJ', 'ESFJ', 'ENFJ'],
  天梁: ['INFJ', 'INTJ', 'ISTJ'],
  七杀: ['ESTP', 'ISTP', 'ENTJ'],
  破军: ['ENTP', 'ESTP', 'ISFP'],
}

export function analyzeZiweiMBTI(majorStars: string[], mbti: MBTIType): ZiweiMBTIAnalysis {
  const mbtiMeta = MBTI_METAS[mbti] || MBTI_METAS.INTJ
  const primaryStar = majorStars[0] || '紫微'
  const secondaryStar = majorStars[1] || ''
  const starNameFull = secondaryStar ? `${primaryStar}${secondaryStar}` : primaryStar

  // 判断是否同频契合
  const naturalMatchList = STAR_NATURAL_MBTI[primaryStar] || ['INTJ']
  let resonanceType: 'resonance' | 'complementary' | 'tension' = 'complementary'
  let resonanceScore = 86

  if (naturalMatchList.includes(mbti)) {
    resonanceType = 'resonance'
    resonanceScore = 94 + Math.floor(Math.random() * 5)
  } else {
    // 检查是否有极端反差产生张力
    const isAggressiveStar = ['七杀', '破军', '武曲'].includes(primaryStar)
    const isGentleStar = ['天同', '太阴', '天相'].includes(primaryStar)

    if ((isAggressiveStar && mbti.includes('FP')) || (isGentleStar && mbti.includes('TJ'))) {
      resonanceType = 'tension'
      resonanceScore = 78 + Math.floor(Math.random() * 6)
    } else {
      resonanceType = 'complementary'
      resonanceScore = 85 + Math.floor(Math.random() * 6)
    }
  }

  // 复合称号
  const dualTitle = `${starNameFull} · ${mbti} ${mbtiMeta.chineseTitle.split('·')[1]?.trim() || mbtiMeta.archetype}`

  // 基础雷达根据星曜与MBTI权重融合计算
  const isE = mbti.startsWith('E')
  const isN = mbti[1] === 'N'
  const isT = mbti[2] === 'T'
  const isJ = mbti[3] === 'J'

  const radar = {
    strategy: Math.min(99, Math.max(65, (isN ? 88 : 72) + (['紫微', '天机', '天府'].includes(primaryStar) ? 10 : 0))),
    execution: Math.min(99, Math.max(65, (isJ ? 88 : 72) + (['武曲', '七杀', '破军'].includes(primaryStar) ? 10 : 0))),
    insight: Math.min(99, Math.max(65, (isN ? 90 : 70) + (['天机', '贪狼', '太阴'].includes(primaryStar) ? 9 : 0))),
    empathy: Math.min(99, Math.max(60, (!isT ? 92 : 68) + (['天同', '太阳', '天相'].includes(primaryStar) ? 8 : 0))),
    resilience: Math.min(99, Math.max(65, (isJ ? 85 : 75) + (['紫微', '武曲', '七杀'].includes(primaryStar) ? 11 : 0))),
    wealthSense: Math.min(99, Math.max(65, (isT ? 86 : 74) + (['武曲', '天府', '太阴'].includes(primaryStar) ? 12 : 0))),
  }

  // 先天底色与后天武器说明
  const soulDuality = {
    innateCore: `【${starNameFull}】奠定了你潜意识中的命盘原力与人生重力场，决定了你在天地运势波动时的终极抉择与气场厚度。`,
    acquiredBlade: `【${mbti} · ${mbtiMeta.archetype}】是你投射于现实世界的认知操作系统，决定了你面对世俗难题时的决策算法与处世兵刃。`,
    fusionOverview: resonanceType === 'resonance'
      ? `命曜与心智高度同频！先天星气与后天心理无缝耦合，如同名将披挂绝世良驹，行事顺遂透彻，容易在所属赛道迅速积聚势能。`
      : resonanceType === 'complementary'
      ? `阴阳交泰，互为奇兵！你的命格底色沉稳而认知风格灵动（或反之），这赋予了你极度稀缺的多面手潜能，常能出其不意破局立功。`
      : `刀锋行走，内在张力！先天命理追求与后天心理模式存在深层抗衡（例如刀剑之气与菩萨柔心交织）。虽有精神内耗，但一旦修通整合，必成大器。`,
  }

  // 优势叠加区
  const superpowers = [
    `【${starNameFull}天威】遇上【${mbti}思维】：在关键大运节点兼备超强决断与精密推演`,
    `既有${mbtiMeta.temperament}的现代敏锐，又具中州紫微命理底盘的深沉定力`,
    `面对危机时具备常人难以企及的${radar.resilience > 85 ? '逆风翻盘韧性' : '灵敏避险嗅觉'}与资源调配手腕`,
  ]

  // 盲区与警报
  const blindspots = {
    alarm: resonanceType === 'tension'
      ? `警惕“理智与情感的拉锯战”：命盘煞气或化忌发动时，容易陷入自我苛责与纠结踟蹰，内耗甚至甚于外部阻力。`
      : `警惕“认知隧道效应”：过度依赖 ${mbtiMeta.cognitiveStack.split('>')[0]?.trim()} 优势功能，容易在星曜落陷之年忽视身边人的真实情感。`,
    advice: `以紫微三方四正化解执念：在事业运盛时以柔克刚，在低谷运伏时静心蓄水。接纳自身阴影，把内耗化为深层创造力。`,
  }

  // 天命职场生态位
  const careerNiche = {
    bestRole: `${mbtiMeta.careerFields[0]} / ${starNameFull}气数对应的核心操盘人`,
    keyAdvantage: `凭借 ${mbtiMeta.keywords.join(' · ')} 构建不可替代的个人护城河`,
    avoidTrap: `切忌陷入纯机械重复与琐碎扯皮内耗的枯竭型岗位，必须占据有主导权或创造空间的生态位。`,
  }

  // 亲密关系磁场
  const relationshipInsight = {
    chemistry: mbtiMeta.relationshipStyle,
    idealPartnerStar: ['紫微', '七杀', '破军'].includes(primaryStar) ? '天相 / 太阴 / 天府' : '紫微 / 太阳 / 武曲',
    idealPartnerMBTI: isE ? (mbti.replace('E', 'I') as MBTIType) : (mbti.replace('I', 'E') as MBTIType),
  }

  return {
    dualTitle,
    resonanceType,
    resonanceScore,
    soulDuality,
    radar,
    superpowers,
    blindspots,
    careerNiche,
    relationshipInsight,
  }
}
