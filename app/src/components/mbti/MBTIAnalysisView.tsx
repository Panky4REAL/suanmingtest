/* ============================================================
   扶桑 · 紫微斗数 × MBTI 双维度全息综合分析面板 (MBTIAnalysisView)
   - 东方命理十四主星与西方 16 型认知心理学交叉推演
   - 双维六极能量雷达图 (ECharts)
   - 先天命曜底色 vs 后天认知利刃、内耗化解、职场天命与感情磁场
   - AI 深度双维详批报告生成器
   ============================================================ */

import { useState, useMemo } from 'react'
import { useChartStore, useProfileStore, useSettingsStore } from '@/stores'
import {
  analyzeZiweiMBTI,
  MBTI_METAS,
  type MBTIType,
} from '@/lib/mbti'
import { MBTIQuiz } from './MBTIQuiz'
import { generateChart, type BirthInfo } from '@/lib/astro'
import { streamChat, type ChatMessage, type LLMConfig } from '@/lib/llm'
import ReactECharts from 'echarts-for-react'

export function MBTIAnalysisView() {
  const { chart, birthInfo, setChart, setBirthInfo } = useChartStore()
  const { mbtiType, setMBTIResult, profiles, addGongde } = useProfileStore()
  const { provider, providerSettings, enableThinking, enableWebSearch, searchApiKey } = useSettingsStore()

  const [showQuiz, setShowQuiz] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 提取当前命盘命宫主星
  const majorStars = useMemo(() => {
    if (!chart) return ['紫微']
    try {
      const lifePalace = chart.palaces.find((p) => p.name === '命宫')
      if (lifePalace && lifePalace.majorStars.length > 0) {
        return lifePalace.majorStars.map((s) => s.name)
      }
    } catch {
      // ignore
    }
    return ['紫微']
  }, [chart])

  // 当前有效 MBTI
  const activeMBTI = (mbtiType as MBTIType) || 'INTJ'
  const mbtiMeta = MBTI_METAS[activeMBTI] || MBTI_METAS.INTJ

  // 综合交叉分析数据
  const analysis = useMemo(() => {
    return analyzeZiweiMBTI(majorStars, activeMBTI)
  }, [majorStars, activeMBTI])

  // 快捷载入默认档案排盘
  const handleLoadDefaultProfile = () => {
    const defaultProf = profiles.find((p) => p.isDefault) || profiles[0]
    if (defaultProf) {
      const bInfo: BirthInfo = {
        year: defaultProf.year,
        month: defaultProf.month,
        day: defaultProf.day,
        hour: defaultProf.hour,
        gender: defaultProf.gender,
      }
      const newChart = generateChart(bInfo)
      setBirthInfo(bInfo)
      setChart(newChart)
      if (defaultProf.mbti) {
        setMBTIResult(defaultProf.mbti)
      }
    }
  }

  // 召唤 AI 生成紫微×MBTI 深度千字详批
  const handleGenerateAIReport = async () => {
    setIsGenerating(true)
    setAiAnalysis('')

    const starNames = majorStars.join('、')
    const prompt = `
你是一位精通中州派紫微斗数与荣格/MBTI 现代认知心理学的东方玄学大师。
请针对以下命理与心理双维档案，为客官撰写一份文笔典雅、洞察入骨的【紫微斗数 × MBTI 双维全息融合详批报告】：

【测算档案】：
- 先天生辰：${birthInfo ? `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${birthInfo.hour}时 (${birthInfo.gender === 'male' ? '乾造·男命' : '坤造·女命'})` : '1995年8月18日 午时 (乾造)'}
- 先天命宫主星：${starNames}
- 后天认知人格：MBTI ${activeMBTI} (${mbtiMeta.chineseTitle})
- 认知功能栈：${mbtiMeta.cognitiveStack}
- 融合称号：${analysis.dualTitle}
- 契合属性：${analysis.resonanceType === 'resonance' ? '同频共振' : analysis.resonanceType === 'complementary' ? '阴阳互济' : '内在张力'}

请严格从以下四个核心篇章深度推演，字数在 800~1200 字左右，排版雅致清丽：
一、【宿命底盘与认知兵刃】：深度解析先天命曜（${starNames}）的潜意识原力与 MBTI（${activeMBTI}）现实决策操作系统的化学反应。
二、【优势聚变与不可替代性】：指出两相叠加后所爆发出的罕见超能力与天赋生态位。
三、【内耗警报与阴影救赎】：直击命盘煞气或流年波动与 MBTI 劣势盲区相遇时的心理内耗，并给出玄学心法与现实行动破解良方。
四、【天命事业与因缘启示】：指出最适宜深耕的商业/学术/艺术赛道，以及亲密关系中的磁场密码。
`

    const currentSettings = providerSettings[provider]
    const config: LLMConfig = {
      provider,
      apiKey: currentSettings.apiKey,
      baseUrl: currentSettings.customBaseUrl || undefined,
      model: currentSettings.customModel || undefined,
      enableThinking,
      enableWebSearch,
      searchApiKey: searchApiKey || undefined,
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: prompt },
    ]

    try {
      for await (const token of streamChat(config, messages)) {
        setAiAnalysis((prev) => prev + token)
      }
      addGongde(10, '生成紫微×MBTI双维详批报告')
    } catch (e: any) {
      setAiAnalysis((prev) => prev + `\n\n[调用出错: ${e.message || '网络异常'}]`)
    } finally {
      setIsGenerating(false)
    }
  }

  // ECharts 雷达配置
  const radarOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: '宏观战略', max: 100 },
        { name: '穿透执行', max: 100 },
        { name: '灵感直觉', max: 100 },
        { name: '共情沟通', max: 100 },
        { name: '逆境抗压', max: 100 },
        { name: '商业财气', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#24453f',
        fontSize: 11,
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
          color: ['rgba(247, 241, 231, 0.5)', 'rgba(255, 255, 255, 0.8)'],
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
        name: '能量雷达',
        type: 'radar',
        data: [
          {
            value: [
              analysis.radar.strategy,
              analysis.radar.execution,
              analysis.radar.insight,
              analysis.radar.empathy,
              analysis.radar.resilience,
              analysis.radar.wealthSense,
            ],
            name: analysis.dualTitle,
            itemStyle: {
              color: '#176f63',
            },
            areaStyle: {
              color: 'rgba(23, 111, 99, 0.35)',
            },
            lineStyle: {
              width: 2,
              color: '#176f63',
            },
          },
        ],
      },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* 答题测评弹窗 */}
      {showQuiz && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowQuiz(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
            <MBTIQuiz
              onComplete={(type) => {
                setMBTIResult(type)
                setShowQuiz(false)
              }}
              onCancel={() => setShowQuiz(false)}
            />
          </div>
        </div>
      )}

      {/* 顶栏主卡片：双维全息头衔 */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-[#dcd3c1]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,253,248,0.98) 0%, rgba(247,241,231,0.92) 100%)',
          boxShadow: '0 16px 40px rgba(111,82,35,0.08)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="fusang-seal text-xs">全息合璧</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63] font-semibold font-serif">
                命宫主星 · {majorStars.join(' ')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c58a28]/15 text-[#8A5B21] font-semibold font-mono">
                MBTI · {activeMBTI}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-serif font-bold ${
                analysis.resonanceType === 'resonance'
                  ? 'bg-emerald-100 text-emerald-800'
                  : analysis.resonanceType === 'complementary'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {analysis.resonanceType === 'resonance'
                  ? '🌟 同频共振 · 天赋合一'
                  : analysis.resonanceType === 'complementary'
                  ? '⚡ 阴阳互济 · 奇兵破局'
                  : '🗡️ 刀锋张力 · 潜能磨砺'
                } ({analysis.resonanceScore}分)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-sc text-[#1e2f34] tracking-tight">
              {analysis.dualTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#52666a] font-serif leading-relaxed max-w-2xl">
              以东方中州派紫微星曜为潜意识灵魂原力，以西方认知心理学为现实决策利刃。
              {mbtiMeta.shortDesc}
            </p>
          </div>

          {/* 快捷操作区 */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowQuiz(true)}
              className="btn-fusang px-4 py-2.5 rounded-xl text-xs font-bold font-serif-sc shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>✍️ 重新测评 / 切换 MBTI</span>
            </button>
            {!chart && (
              <button
                onClick={handleLoadDefaultProfile}
                className="px-4 py-2 rounded-xl text-xs font-serif bg-white border border-[#dcd3c1] text-[#176f63] hover:bg-[#f7f1e7] transition-colors"
              >
                ✦ 载入默认档案命盘
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 未排盘温馨提示横幅 */}
      {!chart && (
        <div className="p-4 rounded-2xl bg-[#c58a28]/10 border border-[#c58a28]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A5B21] font-serif">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>当前系统尚未载入命盘生辰，已使用默认紫微星宿模型。载入您的专属生辰可获得更精确的命宫星辰全息解析！</span>
          </div>
          <button
            onClick={handleLoadDefaultProfile}
            className="px-3 py-1.5 rounded-lg bg-[#c58a28] text-white font-bold hover:opacity-90 shrink-0"
          >
            一键载入本人命盘
          </button>
        </div>
      )}

      {/* 双维核心对照与六极雷达 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：先天底色 vs 后天利刃 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#dcd3c1]/70">
              <span className="fusang-seal text-xs">心命合璧</span>
              <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
                先天命盘星耀 vs 后天认知心法
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#176f63]/5 border border-[#176f63]/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#176f63] font-serif-sc">
                  <span>🏛️ 先天命盘原力</span>
                  <span className="font-mono">({majorStars.join(' ')})</span>
                </div>
                <p className="text-xs text-[#52666a] font-serif leading-relaxed">
                  {analysis.soulDuality.innateCore}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#c58a28]/10 border border-[#c58a28]/25 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A5B21] font-serif-sc">
                  <span>⚔️ 后天认知兵刃</span>
                  <span className="font-mono">({activeMBTI})</span>
                </div>
                <p className="text-xs text-[#52666a] font-serif leading-relaxed">
                  {analysis.soulDuality.acquiredBlade}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1] text-xs text-[#52666a] font-serif leading-relaxed">
              <strong className="text-[#1e2f34] block font-serif-sc mb-1">【双维共振综述】</strong>
              {analysis.soulDuality.fusionOverview}
            </div>
          </div>

          {/* 优势放大区 */}
          <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#dcd3c1]/70">
              <span className="fusang-seal text-xs">绝杀天赋</span>
              <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
                双重能量叠加优势区 (Superpowers)
              </h3>
            </div>

            <ul className="space-y-2">
              {analysis.superpowers.map((sp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#52666a] font-serif">
                  <span className="text-[#176f63] font-bold mt-0.5">✦</span>
                  <span className="leading-relaxed">{sp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 右侧：六极能量雷达图 */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#dcd3c1]/70">
            <div className="flex items-center gap-2">
              <span className="fusang-seal text-xs">六极气数</span>
              <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
                命理与认知复合能量雷达
              </h3>
            </div>
            <span className="text-[10px] text-[#789087] font-serif">双因子融合算法</span>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ReactECharts option={radarOption} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="pt-2 border-t border-[#dcd3c1]/70 grid grid-cols-3 gap-2 text-center text-[11px] text-[#52666a] font-serif">
            <div>
              <span className="block text-[#789087]">战略</span>
              <strong className="text-sm font-mono text-[#176f63]">{analysis.radar.strategy}</strong>
            </div>
            <div>
              <span className="block text-[#789087]">执行</span>
              <strong className="text-sm font-mono text-[#176f63]">{analysis.radar.execution}</strong>
            </div>
            <div>
              <span className="block text-[#789087]">逆商</span>
              <strong className="text-sm font-mono text-[#176f63]">{analysis.radar.resilience}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 深度四象限洞察：内耗警报、职场生态、人际姻缘 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. 内耗警报与阴影救赎 */}
        <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
              警
            </span>
            <h4 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              内在张力与内耗警报
            </h4>
          </div>
          <div className="space-y-2 text-xs text-[#52666a] font-serif leading-relaxed">
            <p className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-900">
              {analysis.blindspots.alarm}
            </p>
            <p className="pt-1">
              <strong className="text-[#1e2f34] block font-serif-sc mb-0.5">破局锦囊：</strong>
              {analysis.blindspots.advice}
            </p>
          </div>
        </div>

        {/* 2. 天命职场生态位 */}
        <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#176f63]/15 text-[#176f63] flex items-center justify-center text-xs font-bold">
              位
            </span>
            <h4 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              天命职场与财富生态位
            </h4>
          </div>
          <div className="space-y-2 text-xs text-[#52666a] font-serif leading-relaxed">
            <p>
              <strong className="text-[#1e2f34] block font-serif-sc mb-0.5">最佳角色：</strong>
              {analysis.careerNiche.bestRole}
            </p>
            <p>
              <strong className="text-[#1e2f34] block font-serif-sc mb-0.5">核心护城河：</strong>
              {analysis.careerNiche.keyAdvantage}
            </p>
            <p className="p-2.5 rounded-xl bg-[#f7f1e7] text-[#8A5B21]">
              <strong>避坑：</strong> {analysis.careerNiche.avoidTrap}
            </p>
          </div>
        </div>

        {/* 3. 亲密关系磁场 */}
        <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#c58a28]/20 text-[#8A5B21] flex items-center justify-center text-xs font-bold">
              缘
            </span>
            <h4 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              亲密关系与神仙搭档
            </h4>
          </div>
          <div className="space-y-2 text-xs text-[#52666a] font-serif leading-relaxed">
            <p>{analysis.relationshipInsight.chemistry}</p>
            <div className="p-2.5 rounded-xl bg-[#c58a28]/10 border border-[#c58a28]/20 space-y-1">
              <div>
                <span className="text-[#8A5B21] font-bold">最佳宿命搭档星曜：</span>
                <span className="text-[#1e2f34] font-semibold">{analysis.relationshipInsight.idealPartnerStar}</span>
              </div>
              <div>
                <span className="text-[#8A5B21] font-bold">互补心智型格：</span>
                <span className="text-[#1e2f34] font-mono font-semibold">{analysis.relationshipInsight.idealPartnerMBTI}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 深度详批召唤板块 */}
      <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#dcd3c1]/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="fusang-seal text-xs">AI 宗师批注</span>
              <h3 className="font-serif-sc font-bold text-lg text-[#1e2f34]">
                扶桑大模型 ·【紫微 × {activeMBTI}】全息千字定制详批
              </h3>
            </div>
            <p className="text-xs text-[#789087] font-serif mt-0.5">
              基于当前模型厂商 ({provider.toUpperCase()})，深度串联十二宫星曜、四化转合与荣格认知心理学
            </p>
          </div>

          <button
            disabled={isGenerating}
            onClick={handleGenerateAIReport}
            className="btn-fusang px-5 py-2.5 rounded-xl text-xs font-bold font-serif-sc shadow-sm shrink-0 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>宗师推演中...</span>
              </>
            ) : (
              <>
                <span>✦ 召唤千字详批 (功德+10)</span>
              </>
            )}
          </button>
        </div>

        {/* AI 输出内容区 */}
        {aiAnalysis ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f1e7]/80 border border-[#dcd3c1] text-xs sm:text-sm text-[#24453f] leading-relaxed font-serif whitespace-pre-line shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
            {aiAnalysis}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#879397] font-serif bg-[#f7f1e7]/40 rounded-2xl border border-dashed border-[#dcd3c1]">
            <p>点击上方按钮，AI 导师将为您把脉星盘主星、四化与 MBTI 四维，推演千字命运心法批注。</p>
          </div>
        )}
      </div>
    </div>
  )
}
