/* ============================================================
   扶桑 · 命运分身与气场画像 (Destiny Avatar)
   对标 lifekline.ai 核心功能：
   结合命盘主星、四化与三方四正，解析 160 种命运分身原型，
   呈现性格标签、气场画像、六维能量雷达与人生破局法则。
   ============================================================ */

import { useMemo } from 'react'
import { useChartStore } from '@/stores'
import ReactECharts from 'echarts-for-react'

// 星曜原型映射字典
interface StarArchetypeMeta {
  code: string
  archetype: string
  title: string
  element: string
  keywords: string[]
  tags: string[]
  aura: string
  script: string
  leverage: string
  radar: {
    strategy: number // 战略宏观
    execution: number // 穿透执行
    wealth: number // 财运感知
    empathy: number // 共情沟通
    resilience: number // 逆境抗压
    insight: number // 直觉洞见
  }
}

const STAR_METAS: Record<string, StarArchetypeMeta> = {
  紫微: {
    code: 'INTJ · 极君破局者',
    archetype: '战略统治者',
    title: '乾坤独揽 · 统筹全局之尊',
    element: '己土 (中央尊宿)',
    keywords: ['宏观推演', '独立决断', '尊贵自持', '秩序构建'],
    tags: ['英雄气', '长线规划', '高维视角', '自带权威', '护短重诺', '决断果敢', '不随波逐流', '统御全局', '体面尊严', '抗压极强'],
    aura: '如泰山端坐，目光深凝不怒自威。天生自带中心引力，擅长统御复杂资源，化混乱为秩序。',
    script: '一生追求自主掌控权与不世之功业，适合居高临下运筹帷幄。中年之后大运交汇，权柄与影响力渐入化境。',
    leverage: '戒急躁自负，善用智囊团队分担微观事务，以德服人则天下归心。',
    radar: { strategy: 95, execution: 85, wealth: 88, empathy: 72, resilience: 92, insight: 90 },
  },
  天机: {
    code: 'INTP · 智谋推演家',
    archetype: '高维策论者',
    title: '机变如神 · 灵感洞见之枢',
    element: '乙木 (智慧之泉)',
    keywords: ['敏锐逻辑', '动态应变', '数理悟性', '策略布局'],
    tags: ['深谋远虑', '洞悉人性', '智商极高', '思虑缜密', '触类旁通', '精神洁癖', '推拉博弈', '擅长博弈', '求知若渴', '清贵之气'],
    aura: '眼神清亮如水，思维如超导回路飞速流转。于乱象中一针见血，洞穿底层逻辑。',
    script: '智慧超群而心思灵敏，适合做科技、战略顾问、算法设计或文化学术之幕后操盘。',
    leverage: '知行合一，切忌思虑过甚而踟蹰不前；将宏大思考落地为单一最小闭环是破局密码。',
    radar: { strategy: 92, execution: 75, wealth: 80, empathy: 78, resilience: 76, insight: 96 },
  },
  太阳: {
    code: 'ENFJ · 光明领航官',
    archetype: '时代燃灯者',
    title: '日丽中天 · 仁厚旷达之宗',
    element: '丙火 (普照万方)',
    keywords: ['公共精神', '宏大叙事', '无私照拂', '声播四海'],
    tags: ['正气凛然', '公信力强', '热忱温暖', '外交气魄', '领袖气质', '担当意识', '慷慨博施', '大局观强', '感染力强', '名扬海外'],
    aura: '如暖阳破云，热情开朗，一举一动皆能点燃周遭人心，具备天然的道德号召力。',
    script: '贵气重于富气，易在政界、公众事务、国际外交、教育出版或头部舞台赢得巨大声望。',
    leverage: '善于收敛锋芒，留白于己；切忌为他人过度担保兜底，重信诺更需量力而行。',
    radar: { strategy: 88, execution: 86, wealth: 78, empathy: 95, resilience: 84, insight: 85 },
  },
  武曲: {
    code: 'ENTJ · 铁血操盘手',
    archetype: '财富重铸家',
    title: '刚毅决断 · 点石成金之魄',
    element: '辛金 (正财之司)',
    keywords: ['穿透执行', '资本嗅觉', '果断肃杀', '商业闭环'],
    tags: ['行动派', '风险偏好', '讲求效能', '重情重义', '直面竞争', '百折不挠', '逆商爆表', '敏锐嗅觉', '点石成金', '信守合同'],
    aura: '步履铿锵，身形挺拔若刀剑出鞘。对数字周期与商业本质有本能般的穿透力。',
    script: '一生与实业、金融资本或技术重资产结缘，早年纵有千般磨砺，亦能以硬实力强势登顶。',
    leverage: '刚极易折，须以柔和沟通补全人际短板；财帛丰盛之余，更须修养静气心境。',
    radar: { strategy: 86, execution: 98, wealth: 96, empathy: 65, resilience: 95, insight: 88 },
  },
  天同: {
    code: 'INFP · 逍遥乐道士',
    archetype: '纯真疗愈师',
    title: '福泽深厚 · 和润致祥之境',
    element: '壬水 (福德之主)',
    keywords: ['温润同理', '随遇而安', '艺术灵犀', '福慧双全'],
    tags: ['福星体质', '被爱体质', '灵性通透', '与世无争', '审美高级', '人缘极好', '化险为夷', '亲和力满', '感知丰富', '浪漫自由'],
    aura: '如春水初生，柔和温存。让人天然放下防备，不争而天下莫能与之争。',
    script: '平生自带解厄福气，困顿处常有贵人绝处逢生；在文化美学、生活方式或身心疗愈领域如鱼得水。',
    leverage: '适度跳出舒适区，保持对现实目标的钝感坚持，善始善终则福寿绵长。',
    radar: { strategy: 75, execution: 68, wealth: 82, empathy: 96, resilience: 85, insight: 90 },
  },
  廉贞: {
    code: 'ENTP · 敏捷破壁者',
    archetype: '极智冒险家',
    title: '才华横溢 · 敏锐求变之风',
    element: '丁火 (次桃花化气为囚)',
    keywords: ['敏锐洞察', '多面才华', '审美奇诡', '反骨求变'],
    tags: ['魅力非凡', '思维跳跃', '破局意识', '善解难题', '爱恨分明', '敢冒大险', '高级审美', '气场迷人', '追求极致', '不拘一格'],
    aura: '眉宇间兼具英气与邪魅，灵感飞溅，能在规则边缘创造意想不到的破局解法。',
    script: '人生波澜壮阔，适合从事政律、前沿技术革新、影视传媒或高附加值创意产业。',
    leverage: '守正出奇，以严谨合规之道护航澎湃才华，自律方能享有最大自由。',
    radar: { strategy: 90, execution: 88, wealth: 85, empathy: 84, resilience: 86, insight: 94 },
  },
  天府: {
    code: 'ESTJ · 坤德承载官',
    archetype: '财富守门人',
    title: '渊渟岳峙 · 库盈千仓之本',
    element: '戊土 (南斗主星令星)',
    keywords: ['稳健沉着', '财库充盈', '守成有道', '包容博大'],
    tags: ['定海神针', '生活品质', '信誉极佳', '擅守擅蓄', '安步当车', '务实可靠', '贵族气质', '善聚资源', '厚德载物', '从容淡定'],
    aura: '气度雍容华贵，言行平实沉稳，给人以极强的安全感与信任感。',
    script: '衣食无忧之吉星，最善稳固基业与长远保值；中年后身价财富累积惊人。',
    leverage: '避免过度保守而错失时代风口，适度配置风险进取型项目，守正创新。',
    radar: { strategy: 88, execution: 86, wealth: 95, empathy: 82, resilience: 92, insight: 84 },
  },
  太阴: {
    code: 'ISFJ · 月华涵养者',
    archetype: '清丽静修家',
    title: '月映万川 · 细致入微之韵',
    element: '癸水 (母仪之泽)',
    keywords: ['内敛深情', '精密理财', '审美敏锐', '耐力持久'],
    tags: ['细腻温润', '情调满满', '善于积攒', '母性光辉', '不动产缘', '敏锐感受', '深沉内敛', '清心寡欲', '文字通灵', '品味脱俗'],
    aura: '若明月映照深潭，静水流深。处事井然有序，于润物细无声中达成所愿。',
    script: '财帛丰盈、田宅有依之吉星，在资产配置、金融分析、设计艺术及文化产业中成就不凡。',
    leverage: '直面冲突，减少内在情绪消耗；相信自己的实力，果断走向台前。',
    radar: { strategy: 82, execution: 84, wealth: 92, empathy: 94, resilience: 85, insight: 90 },
  },
  贪狼: {
    code: 'ENFP · 万象探索家',
    archetype: '欲望魔术师',
    title: '多才多艺 · 八面玲珑之舞',
    element: '甲木癸水 (欲望之神桃花之首)',
    keywords: ['社交天赋', '多元感知', '商海弄潮', '机变百出'],
    tags: ['神仙交际', '天生玩家', '懂生活', '情商天花板', '爱恨洒脱', '商机嗅觉', '多才多艺', '身段灵活', '逆境求生', '魅力四射'],
    aura: '风姿绰约，眼带桃花与智慧，穿行于三教九流如鱼得水，瞬间抓住人心暗流。',
    script: '人生多彩多姿，经商办企、文化传播、演艺公关皆能如日中天；晚运修道明心，境界超脱。',
    leverage: '戒骄奢淫逸与见异思迁，专注打磨一技之长，贪狼化权化禄即可暴发成巨富。',
    radar: { strategy: 88, execution: 86, wealth: 92, empathy: 96, resilience: 86, insight: 94 },
  },
  巨门: {
    code: 'INTP · 辨伪求真官',
    archetype: '真理明辨者',
    title: '明察秋毫 · 言辞犀利之辩',
    element: '癸水 (暗曜化气为暗)',
    keywords: ['逻辑辨析', '求真求确', '口才雄辩', '深层探底'],
    tags: ['犀利批判', '学术考究', '不平则鸣', '言辞如刀', '擅长分析', '探求真相', '严谨治学', '辩才无碍', '暗中发力', '一鸣惊人'],
    aura: '如古剑藏匣，目光审慎，擅长在别人看不见的暗处发现漏洞与真理。',
    script: '适合从事法学裁判、深度调查、专业咨询、科学研究及自媒体观点输出。',
    leverage: '修口德以养浩然之气，善用言语解人危困，变“是非暗昧”为“声誉广播”。',
    radar: { strategy: 88, execution: 82, wealth: 80, empathy: 70, resilience: 85, insight: 95 },
  },
  天相: {
    code: 'ESFJ · 宰辅协调官',
    archetype: '信义守护者',
    title: '端方持重 · 印玺司权之辅',
    element: '壬水 (印星官禄之司)',
    keywords: ['居中调停', '注重契约', '端庄得体', '组织协同'],
    tags: ['得力干将', '体面绅士', '注重形象', '合规至上', '人脉通达', '中正无私', '严谨负责', '品行端正', '贵人引荐', '稳如泰山'],
    aura: '仪表堂堂，言谈举止极具职业素养与体面风范，是值得重托的副帅与中流砥柱。',
    script: '善于辅佐明主，组织协调重大工程，在跨部门管理、法务合规及高端服务业威信极高。',
    leverage: '避免过度妥协求全，在关键时刻树立鲜明原则立场，主次分明。',
    radar: { strategy: 85, execution: 90, wealth: 88, empathy: 90, resilience: 88, insight: 84 },
  },
  天梁: {
    code: 'INFJ · 庇荫荫庇公',
    archetype: '德高长者',
    title: '荫护天下 · 逢凶化吉之尊',
    element: '戊土 (寿星化气为荫)',
    keywords: ['长者风度', '逢凶化吉', '公道自在', '解厄消灾'],
    tags: ['化险为夷', '老干部气质', '公道人心', '热心助人', '寿星庇佑', '沉着睿智', '精神导师', '道德高标', '受人尊敬', '安贫乐道'],
    aura: '如古刹青松，清风拂袖。遇险不惊，往往在看似绝境时峰回路转。',
    script: '医学、司法、监察审计、慈善基金及宗教哲学之贵星，一生多得长辈与上苍厚待。',
    leverage: '戒倚老卖老与过度好为人师，以身作则远胜言语训诫。',
    radar: { strategy: 86, execution: 80, wealth: 80, empathy: 92, resilience: 95, insight: 92 },
  },
  七杀: {
    code: 'ISTP · 独行破军将',
    archetype: '孤勇先锋官',
    title: '孤胆雄心 · 万夫莫当之势',
    element: '庚金丁火 (将星化气为权)',
    keywords: ['一往无前', '极致专注', '开疆拓土', '宁折不弯'],
    tags: ['孤勇者', '战神气场', '杀伐决断', '极致专注', '敢打硬仗', '硬汉柔情', '绝地反击', '开创新局', '雷厉风行', '冷傲内敛'],
    aura: '目光冷冽坚毅，自带金戈铁马之肃杀之气，在惊涛骇浪中依然面不改色。',
    script: '创业开辟先锋、硬核科技攻坚、极危特殊行业之王者，越是动荡风云越能杀出重围。',
    leverage: '急流勇退，善结同盟以化解孤煞之性，以柔克刚能享长久功名。',
    radar: { strategy: 88, execution: 98, wealth: 86, empathy: 60, resilience: 98, insight: 90 },
  },
  破军: {
    code: 'ENTP · 颠覆革新者',
    archetype: '秩序重启者',
    title: '大破大立 · 摧枯拉朽之变',
    element: '癸水 (耗星先破后成)',
    keywords: ['颠覆重构', '推陈出新', '不破不立', '惊涛拍岸'],
    tags: ['颠覆大师', '拒绝平庸', '先破后立', '惊人魄力', '重塑规则', '极客精神', '勇于归零', '创造历史', '逆风翻盘', '生命力旺盛'],
    aura: '周身散发着重构一切旧规则的风暴能量，凡其所过之处，新格局应运而生。',
    script: '互联网颠覆式创新、产业重组并购、新商业模式开创者，大破之后必有大立。',
    leverage: '留存战略预备金，破立之间守住核心基本盘，谋定而动方能避免无谓消耗。',
    radar: { strategy: 92, execution: 96, wealth: 85, empathy: 70, resilience: 96, insight: 92 },
  },
}

export function DestinyAvatar() {
  const { chart } = useChartStore()

  // 解析命宫主星
  const avatarData = useMemo(() => {
    if (!chart?.palaces) return STAR_METAS['紫微']

    // 获取命宫
    const mingPalace = chart.palaces.find((p) => p.name === '命宫')
    const primaryStarName = mingPalace?.majorStars?.[0]?.name || '紫微'

    return STAR_METAS[primaryStarName] || STAR_METAS['紫微']
  }, [chart])

  // 雷达图配置
  const radarOption = useMemo(() => {
    const { radar } = avatarData
    return {
      tooltip: {},
      radar: {
        indicator: [
          { name: '战略宏观', max: 100 },
          { name: '穿透执行', max: 100 },
          { name: '财运嗅觉', max: 100 },
          { name: '同理共情', max: 100 },
          { name: '逆境抗压', max: 100 },
          { name: '直觉洞见', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#52666a',
          fontSize: 12,
          fontFamily: 'Noto Serif SC',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(23, 111, 99, 0.15)',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(247, 241, 231, 0.6)', 'rgba(255, 253, 248, 0.7)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(23, 111, 99, 0.2)',
          },
        },
      },
      series: [
        {
          name: '命格能量雷达',
          type: 'radar',
          data: [
            {
              value: [
                radar.strategy,
                radar.execution,
                radar.wealth,
                radar.empathy,
                radar.resilience,
                radar.insight,
              ],
              name: avatarData.code,
              symbol: 'circle',
              symbolSize: 5,
              itemStyle: {
                color: '#176f63',
              },
              lineStyle: {
                color: '#176f63',
                width: 2,
              },
              areaStyle: {
                color: 'rgba(23, 111, 99, 0.22)',
              },
            },
          ],
        },
      ],
    }
  }, [avatarData])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* 顶部标题区 */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#176f63]/25 bg-[#176f63]/5 text-[#176f63] text-xs font-serif mb-3">
          <span>❖ 扶桑 · 命运分身体系</span>
          <span className="opacity-40">|</span>
          <span>160种命运人格原型</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34] tracking-tight">
          命盘心象 · 命运分身与气场画像
        </h2>
        <p className="mt-2 text-sm text-[#52666a]">
          通过三方四正与主星四化气数，提炼你的本命原型代码、气场风骨与决策破局法则。
        </p>
      </div>

      {/* 核心分身名牌看板 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#dcd3c1]/70">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="fusang-seal text-xs">本命分身</span>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/25">
                {avatarData.code}
              </span>
              <span className="text-xs text-[#879397] font-serif">
                {avatarData.element}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34]">
              {avatarData.title}
            </h3>
            <p className="text-sm text-[#52666a] font-serif">
              原型定位：<strong className="text-[#176f63]">{avatarData.archetype}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {avatarData.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f4eddf] text-[#8A5B21] border border-[#c58a28]/30"
              >
                ✦ {kw}
              </span>
            ))}
          </div>
        </div>

        {/* 核心内容区：左侧气场画像与标签，右侧能量雷达 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
          {/* 左侧详情 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 气场画像 */}
            <div className="p-5 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#879397]">
                <span>❖ 气场风格 (Avatar Aura)</span>
              </div>
              <p className="text-sm sm:text-base text-[#1e2f34] leading-relaxed font-serif pt-1">
                {avatarData.aura}
              </p>
            </div>

            {/* 个性高光标签 (Personality Tags) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#879397]">
                <span>❖ 个性与气场标签 (Personality Tags)</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {avatarData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-[#176f63] border border-[#176f63]/20 shadow-2xs hover:border-[#176f63] transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 人生剧本走向 */}
            <div className="p-5 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#879397]">
                <span>❖ 人生剧本走向 (Destiny Trajectory)</span>
              </div>
              <p className="text-sm text-[#52666a] leading-relaxed pt-1">
                {avatarData.script}
              </p>
            </div>

            {/* 破局破执法则 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fbf8f1] to-[#f4eddf] border border-[#c58a28]/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A5B21]">
                <span>⚡ 处事心法与破局杠杆 (Life Leverage)</span>
              </div>
              <p className="text-sm font-serif-sc font-medium text-[#5B3F1F] leading-relaxed pt-1">
                {avatarData.leverage}
              </p>
            </div>
          </div>

          {/* 右侧雷达图 */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f7f1e7]/40 border border-[#dcd3c1]/60">
            <h4 className="text-sm font-bold font-serif-sc text-[#1e2f34] mb-2 text-center">
              六维能量场分布 (Energy Dimensions)
            </h4>
            <div className="w-full h-[320px]">
              <ReactECharts
                option={radarOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>
            <p className="text-xs text-[#879397] text-center mt-2 font-serif">
              基于中州派星曜禀赋与庙旺利陷权重实时测算
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
