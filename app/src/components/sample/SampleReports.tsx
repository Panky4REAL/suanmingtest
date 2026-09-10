/* ============================================================
   扶桑 · 示例报告中心 (Sample Reports)
   基于 lifekline.ai 的核心展示逻辑：
   提供预置经典命盘报告样本，用户免输入一键查阅真实案例
   ============================================================ */

import { useState } from 'react'
import { generateChart, type BirthInfo } from '@/lib/astro'
import { useChartStore } from '@/stores'

export interface SampleCase {
  id: string
  title: string
  subtitle: string
  avatarCode: string
  archetype: string
  pattern: string
  birthInfo: BirthInfo
  birthText: string
  tags: string[]
  coreAura: string
  summary: string
  highlights: Array<{ age: string; title: string; desc: string }>
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'tech-founder',
    title: '青年科技创业先锋 · 商业破局者',
    subtitle: '紫府同宫格 · 乾纲独断，长线复利',
    avatarCode: 'INTJ-甲木紫府',
    archetype: '战略破局家',
    pattern: '紫府朝垣格 / 禄马交驰',
    birthInfo: { year: 1992, month: 8, day: 15, hour: 12, gender: 'male' },
    birthText: '1992年8月15日 午时 · 阳历男命',
    tags: ['深谋远虑', '格局宏阔', '长线规划', '高维决断', '抗压极强', '贵人扶持'],
    coreAura: '端凝厚重，气场沉敛而杀伐果决，善于在迷局中抓住全局杠杆支点。',
    summary: '命坐紫微天府于子午之位，天生具备统筹全局与构筑商业护城河之气度。大运在30岁后步入财禄丰盈之吉限，是典型的大器早成而持续跃升之高阶命格。',
    highlights: [
      { age: '22-26岁', title: '潜龙勿用', desc: '名校毕业，技术底层探索与认知积累期' },
      { age: '28-32岁', title: '见龙在田', desc: '初创核心业务实现突破，获顶级产业资本加注' },
      { age: '35-42岁', title: '飞龙在天', desc: '大运坐化禄化权，形成行业领军护城河与全球化布局' },
    ],
  },
  {
    id: 'culture-scholar',
    title: '跨界学者与艺术智囊 · 知性深耕',
    subtitle: '机月同梁格 · 清贵温润，文采斐然',
    avatarCode: 'INFJ-乙木太阴',
    archetype: '思想洞见者',
    pattern: '机月同梁格 / 文桂文华',
    birthInfo: { year: 1995, month: 3, day: 22, hour: 6, gender: 'female' },
    birthText: '1995年3月22日 卯时 · 阳历女命',
    tags: ['灵感敏锐', '精神内核', '审美绝佳', '内敛温润', '文字通灵', '文星照命'],
    coreAura: '如空谷幽兰，思辨深邃，善于以直觉感知时代潮流动向并转化为深沉表达。',
    summary: '天机天梁太阴同聚三合，才思敏捷且具有深刻同理心。适合从事学术研究、文化创作、高等智囊与精神疗愈等领域，越陈越香，声誉远扬。',
    highlights: [
      { age: '23-27岁', title: '独辟蹊径', desc: '跨学科深造与学术代表作发表，确立专业话语权' },
      { age: '31-36岁', title: '厚积薄发', desc: '国际影响力与智库合作井喷，名利水到渠成' },
      { age: '40岁+', title: '桃李天下', desc: '出版经典论著，成为精神领域的灯塔式导师' },
    ],
  },
  {
    id: 'finance-trader',
    title: '宏观对冲与战略投资操盘手',
    subtitle: '武曲七杀格 · 敏锐决绝，点石成金',
    avatarCode: 'ENTJ-庚金武杀',
    archetype: '市场操盘手',
    pattern: '武曲七杀格 / 火贪暴发',
    birthInfo: { year: 1988, month: 11, day: 6, hour: 20, gender: 'male' },
    birthText: '1988年11月6日 戌时 · 阳历男命',
    tags: ['逆境翻盘', '敏锐嗅觉', '果敢刚毅', '风险把控', '敢为人先', '财帛星曜'],
    coreAura: '目光如炬，对资本周期与风险敞口有着惊人的动物本能，敢于在无人问津时重注。',
    summary: '武曲七杀于卯酉坐命，将星临门，行动力与财帛感知力居十四星之冠。早年多见波折磨砺，一旦抓住时代红利大浪，势如破竹。',
    highlights: [
      { age: '24-29岁', title: '百炼成钢', desc: '经历多轮周期洗礼，搭建独立宏观量化投研体系' },
      { age: '32-38岁', title: '乘风破浪', desc: '捕获宏观大拐点，资产规模数阶跳跃' },
      { age: '45岁+', title: '大道至简', desc: '转向天使家族基金，运筹帷幄于无形之中' },
    ],
  },
  {
    id: 'global-leader',
    title: '涉外法务与国际治理战略官',
    subtitle: '日丽中天格 · 声播四海，明察秋毫',
    avatarCode: 'ENFJ-丙火太阳',
    archetype: '光明引路人',
    pattern: '日丽中天 / 巨日同宫',
    birthInfo: { year: 1993, month: 6, day: 18, hour: 8, gender: 'female' },
    birthText: '1993年6月18日 辰时 · 阳历女命',
    tags: ['公信力强', '正气凛然', '外交口才', '国际视野', '化解纠纷', '声名显赫'],
    coreAura: '如旭日东升，言语如春风化雨却字字千钧，极具公众信赖感与号召力。',
    summary: '太阳居巳午旺位，如日中天，驱散巨门之阴暗。为人光明磊落，涉足跨国法律、公众政策及重大商务谈判如鱼得水，受世人敬仰。',
    highlights: [
      { age: '25-28岁', title: '崭露头角', desc: '主导跨境复杂仲裁案，以缜密逻辑赢得全行业赞誉' },
      { age: '33-39岁', title: '如日方升', desc: '出任国际合规总长，代表机构参与国际准则制定' },
      { age: '45岁+', title: '德高望重', desc: '受聘全球顾问委员会，立德立言功勋卓著' },
    ],
  },
]

interface SampleReportsProps {
  onLoadCase: (c: SampleCase) => void
}

export function SampleReports({ onLoadCase }: SampleReportsProps) {
  const [selectedId, setSelectedId] = useState<string>('tech-founder')
  const { setBirthInfo, setChart } = useChartStore()

  const currentCase = SAMPLE_CASES.find((c) => c.id === selectedId) || SAMPLE_CASES[0]

  const handleApply = (c: SampleCase) => {
    try {
      const chart = generateChart(c.birthInfo)
      setBirthInfo(c.birthInfo)
      setChart(chart)
      onLoadCase(c)
    } catch (err) {
      console.error('加载案例失败', err)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* 顶部介绍 */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#176f63]/25 bg-[#176f63]/5 text-[#176f63] text-xs font-serif mb-3">
          <span>❖ 扶桑典藏案例库</span>
          <span className="opacity-40">|</span>
          <span>无需输入 · 一键直达体验</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34] tracking-tight">
          经典人生格局 · 命运K线示例
        </h2>
        <p className="mt-2 text-sm text-[#52666a]">
          精选不同性格原型与星曜格局的真实测算样例，直观感受扶桑算法对百年运势走势与人生剧本的深刻洞见。
        </p>
      </div>

      {/* 案例卡片横向选项卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLE_CASES.map((c) => {
          const isSelected = c.id === selectedId
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`
                text-left p-4 rounded-2xl transition-all duration-200 border
                ${isSelected
                  ? 'bg-white border-[#176f63] shadow-md -translate-y-1'
                  : 'bg-white/70 border-[#dcd3c1] hover:bg-white hover:border-[#176f63]/40'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63]">
                  {c.archetype}
                </span>
                <span className="text-[11px] text-[#879397] font-mono">{c.avatarCode.split('-')[0]}</span>
              </div>
              <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34] line-clamp-1">
                {c.title.split('·')[0]}
              </h3>
              <p className="text-xs text-[#52666a] line-clamp-1 mt-1 font-serif">
                {c.pattern}
              </p>
              <div className="mt-3 pt-2 border-t border-[#dcd3c1]/50 flex items-center justify-between text-[11px] text-[#879397]">
                <span>{c.birthText.split('·')[0]}</span>
                <span className="text-[#176f63] font-semibold">查看详情 →</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 选中的案例详述看板 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-[#dcd3c1]/70">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="fusang-seal text-xs">扶桑精选</span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-[#c58a28]/15 text-[#8A5B21] border border-[#c58a28]/30">
                {currentCase.avatarCode}
              </span>
              <span className="text-xs text-[#52666a] font-serif">
                {currentCase.pattern}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
              {currentCase.title}
            </h3>
            <p className="text-sm text-[#52666a] font-serif italic">
              “{currentCase.subtitle}”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleApply(currentCase)}
              className="btn-fusang flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide"
            >
              <span>载入此案例并生成K线</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* 案例核心标签与气场 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#879397]">
              命格标签 (Avatar Traits)
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentCase.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-[#176f63] border border-[#176f63]/20 shadow-2xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#879397]">
              气场画像 (Avatar Aura)
            </p>
            <p className="text-sm text-[#1e2f34] leading-relaxed font-serif pt-1">
              {currentCase.coreAura}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#879397]">
              命格判词 (Life Script)
            </p>
            <p className="text-xs sm:text-sm text-[#52666a] leading-relaxed pt-1">
              {currentCase.summary}
            </p>
          </div>
        </div>

        {/* 关键大运转折节点 */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#879397]">
            大运关键周期转折点 (Milestones)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentCase.highlights.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#dcd3c1]/80 bg-white hover:border-[#176f63]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#c58a28] bg-[#c58a28]/10 px-2 py-0.5 rounded">
                    {h.age}
                  </span>
                  <span className="text-xs font-serif-sc font-bold text-[#1e2f34]">
                    {h.title}
                  </span>
                </div>
                <p className="text-xs text-[#52666a] leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
