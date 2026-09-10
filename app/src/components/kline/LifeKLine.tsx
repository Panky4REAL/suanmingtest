/* ============================================================
   人生 K 线 - 扶桑东方雅致羊皮纸风格
   ============================================================ */

import { useState, useMemo, useCallback } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  LabelList,
} from 'recharts'
import { useChartStore, useSettingsStore, useContentCacheStore } from '@/stores'
import { ScoreRadar } from './ScoreRadar'
import {
  generateLifetimeKLines,
  generateKLinesWithLLM,
  type LifetimeKLinePoint,
} from '@/lib/fortune-score'
import { type LLMConfig } from '@/lib/llm'

/* ============================================================
   自定义 Tooltip (东方宣纸风格)
   ============================================================ */

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: LifetimeKLinePoint }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  const isUp = data.close >= data.open
  const scoreLevel = data.score >= 80 ? '大吉' :
                     data.score >= 60 ? '顺吉' :
                     data.score >= 40 ? '中平' :
                     data.score >= 20 ? '慎微' : '大凶'

  return (
    <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-[#dcd3c1] z-50 w-[320px] md:w-[380px] text-[#1e2f34]">
      {/* ─── Header ─── */}
      <div className="flex justify-between items-start mb-3 border-b border-[#dcd3c1]/70 pb-3">
        <div>
          <p className="text-lg font-bold font-serif-sc text-[#1e2f34]">
            {data.year}年 · {data.ganZhi}
            <span className="text-sm text-[#52666a] ml-2">({data.age}岁)</span>
          </p>
          <p className="text-xs text-[#176f63] font-medium mt-0.5">
            所属大限：{data.daYun} ({data.daYunRange})
          </p>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
          data.score >= 60 ? 'bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/25' :
          data.score >= 40 ? 'bg-[#c58a28]/15 text-[#8A5B21] border border-[#c58a28]/25' :
          'bg-[#c0392b]/10 text-[#c0392b] border border-[#c0392b]/25'
        }`}>
          {scoreLevel} · {data.score}分
        </div>
      </div>

      {/* ─── OHLC 四柱走势 ─── */}
      <div className="grid grid-cols-4 gap-1 text-xs mb-3 bg-[#f7f1e7]/80 p-2.5 rounded-xl border border-[#dcd3c1]/60">
        <div className="text-center">
          <span className="block text-[#879397] text-[10px] mb-0.5">年初始</span>
          <span className="font-mono text-[#1e2f34] font-bold">{data.open}</span>
        </div>
        <div className="text-center">
          <span className="block text-[#879397] text-[10px] mb-0.5">年末结</span>
          <span className={`font-mono font-bold ${isUp ? 'text-[#176f63]' : 'text-[#c0392b]'}`}>{data.close}</span>
        </div>
        <div className="text-center">
          <span className="block text-[#879397] text-[10px] mb-0.5">年最高</span>
          <span className="font-mono text-[#c58a28] font-bold">{data.high}</span>
        </div>
        <div className="text-center">
          <span className="block text-[#879397] text-[10px] mb-0.5">年最低</span>
          <span className="font-mono text-[#c0392b] font-bold">{data.low}</span>
        </div>
      </div>

      {/* ─── 流年批语 ─── */}
      <div className="text-xs text-[#52666a] leading-relaxed max-h-[110px] overflow-y-auto font-serif">
        {data.reason || (
          <span className="text-[#879397] flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-[#176f63] border-t-transparent rounded-full animate-spin" />
            扶桑算法深度推演中...
          </span>
        )}
      </div>

      {/* ─── 流年四化 ─── */}
      {data.yearlyMutagens && data.yearlyMutagens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-[#dcd3c1]/70">
          {data.yearlyMutagens.map((m, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#176f63]/10 text-[#176f63]">
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   自定义蜡烛图形状 (扶桑翡翠绿与朱砂赤)
   ============================================================ */

interface CandleShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: LifetimeKLinePoint
  yAxis?: { scale: (value: number) => number }
}

function CandleShape(props: CandleShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload, yAxis } = props
  if (!payload) return null

  const isUp = payload.close >= payload.open
  const color = isUp ? '#176f63' : '#c0392b'
  const strokeColor = isUp ? '#0f5249' : '#991b1b'

  let highY = y
  let lowY = y + height

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high)
      lowY = yAxis.scale(payload.low)
    } catch {
      highY = y
      lowY = y + height
    }
  }

  const center = x + width / 2
  const renderHeight = height < 2 ? 2 : height

  return (
    <g>
      {/* 影线 */}
      <line x1={center} y1={highY} x2={center} y2={lowY} stroke={strokeColor} strokeWidth={1.2} />
      {/* 蜡烛体 */}
      <rect
        x={x}
        y={y}
        width={width}
        height={renderHeight}
        fill={color}
        stroke={strokeColor}
        strokeWidth={0.5}
        rx={1}
      />
    </g>
  )
}

/* ============================================================
   峰值星标组件 (雅金星星)
   ============================================================ */

interface PeakLabelProps {
  x?: number
  y?: number
  width?: number
  value?: number
  maxHigh: number
}

function PeakLabel(props: PeakLabelProps) {
  const { x = 0, y = 0, width = 0, value, maxHigh } = props
  if (value !== maxHigh) return null

  return (
    <g>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        transform={`translate(${x + width / 2 - 6}, ${y - 18}) scale(0.5)`}
        fill="#c58a28"
        stroke="#8A5B21"
        strokeWidth="1"
      />
    </g>
  )
}

/* ============================================================
   主组件
   ============================================================ */

export function LifeKLine() {
  const { chart, birthInfo } = useChartStore()
  const { provider, getCurrentSettings, enableThinking, enableWebSearch, searchApiKey } = useSettingsStore()
  const { klineCache, setKlineCache } = useContentCacheStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [selectedPoint, setSelectedPoint] = useState<LifetimeKLinePoint | null>(null)

  const llmConfig: LLMConfig = useMemo(() => {
    const settings = getCurrentSettings()
    return {
      provider,
      apiKey: settings.apiKey,
      baseUrl: settings.customBaseUrl || undefined,
      model: settings.customModel || undefined,
      enableThinking,
      enableWebSearch,
      searchApiKey,
    }
  }, [provider, getCurrentSettings, enableThinking, enableWebSearch, searchApiKey])

  const generateKLines = useCallback(async () => {
    if (!chart || !birthInfo) return

    setIsGenerating(true)
    setProgress('天地排布中...')

    try {
      let lifetime: LifetimeKLinePoint[]

      if (llmConfig.apiKey) {
        lifetime = await generateKLinesWithLLM(
          chart,
          birthInfo.year,
          llmConfig,
          setProgress
        )
      } else {
        setProgress('计算大运流年...')
        lifetime = generateLifetimeKLines(chart, birthInfo.year)
      }

      setKlineCache({ lifetime, isGenerating: false })
      setProgress('')
    } catch (error) {
      console.error('K 线生成失败:', error)
      const lifetime = generateLifetimeKLines(chart, birthInfo.year)
      setKlineCache({ lifetime, isGenerating: false })
    }

    setIsGenerating(false)
  }, [chart, birthInfo, llmConfig, setKlineCache])

  const chartData = useMemo(() => {
    if (!klineCache?.lifetime) {
      // 若缓存为空但已有 chart，自动生成默认算法K线
      if (chart && birthInfo) {
        return generateLifetimeKLines(chart, birthInfo.year).map(d => ({
          ...d,
          bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
        }))
      }
      return []
    }
    return klineCache.lifetime.map(d => ({
      ...d,
      bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    }))
  }, [klineCache, chart, birthInfo])

  const daYunChanges = useMemo(() => {
    if (!chartData.length) return []
    return chartData.filter((d, i) => {
      if (i === 0) return true
      return d.daYun !== chartData[i - 1].daYun
    })
  }, [chartData])

  const maxHigh = useMemo(() => {
    if (!chartData.length) return 100
    return Math.max(...chartData.map(d => d.high))
  }, [chartData])

  const handleChartClick = useCallback((data: unknown) => {
    const chartData = data as { activePayload?: Array<{ payload: LifetimeKLinePoint }> }
    if (chartData.activePayload?.[0]?.payload) {
      setSelectedPoint(chartData.activePayload[0].payload)
    }
  }, [])

  if (!chart) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 rounded-3xl bg-white/80 border border-[#dcd3c1]">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-[#52666a] font-serif">请先输入生辰信息或从示例库载入案例</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-6xl mx-auto">
      {/* ─── 标题区 ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#dcd3c1]/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="fusang-seal text-xs">扶桑核心</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34]">
              百年大运 · 人生K线图
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#52666a] mt-1 font-serif">
            {birthInfo?.year}年生 · 百年流年起伏与十年大限周期可视化
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateKLines}
            disabled={isGenerating}
            className="btn-fusang px-5 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isGenerating ? (progress || 'AI 推演中...') : '✨ AI 重新决策K线'}</span>
          </button>
        </div>
      </div>

      {/* ─── K 线主看板 ─── */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-white/95 border border-[#dcd3c1] shadow-sm backdrop-blur-md">
        {/* 顶部指示说明 */}
        <div className="mb-4 flex flex-wrap justify-between items-center gap-2 px-1">
          <div className="flex items-center gap-2 text-xs text-[#52666a]">
            <span className="font-serif">横轴：实际年龄 (1-100岁)</span>
            <span className="opacity-40">|</span>
            <span className="font-serif">纵轴：命格气数分 (0-100分)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center text-[#176f63] bg-[#176f63]/10 px-2.5 py-0.5 rounded-full border border-[#176f63]/20">
              <span className="w-2 h-2 bg-[#176f63] mr-1.5 rounded-full" /> 翡翠阳线 · 扬升吉运
            </span>
            <span className="flex items-center text-[#c0392b] bg-[#c0392b]/10 px-2.5 py-0.5 rounded-full border border-[#c0392b]/20">
              <span className="w-2 h-2 bg-[#c0392b] mr-1.5 rounded-full" /> 朱砂阴线 · 蓄势沉淀
            </span>
            <span className="flex items-center text-[#8A5B21] bg-[#c58a28]/10 px-2.5 py-0.5 rounded-full border border-[#c58a28]/20">
              ★ 金星 · 人生巅峰年份
            </span>
          </div>
        </div>

        {/* Recharts K线画布 */}
        <div className="w-full h-[460px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 25, right: 10, left: -10, bottom: 20 }}
              onClick={handleChartClick}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(23, 111, 99, 0.1)"
              />

              <XAxis
                dataKey="age"
                tick={{ fontSize: 11, fill: '#52666a', fontFamily: 'Noto Serif SC' }}
                interval={9}
                axisLine={{ stroke: '#dcd3c1' }}
                tickLine={false}
                label={{
                  value: '岁数',
                  position: 'insideBottomRight',
                  offset: -5,
                  fontSize: 11,
                  fill: '#879397',
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#879397' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(23, 111, 99, 0.35)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              {/* 大运分界线 */}
              {daYunChanges.map((point, index) => (
                <ReferenceLine
                  key={`dayun-${index}`}
                  x={point.age}
                  stroke="rgba(23, 111, 99, 0.25)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                >
                  <Label
                    value={point.daYun}
                    position="top"
                    fill="#176f63"
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="Noto Serif SC"
                  />
                </ReferenceLine>
              ))}

              {/* K 线蜡烛 */}
              <Bar
                dataKey="bodyRange"
                shape={<CandleShape />}
                isAnimationActive={true}
                animationDuration={1200}
              >
                <LabelList
                  dataKey="high"
                  position="top"
                  content={<PeakLabel maxHigh={maxHigh} />}
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 提示点击卡片 */}
        <p className="text-[11px] text-[#879397] text-center mt-3 font-serif">
          💡 点击 K 线上的任意年份柱体，即可在下方调取该年度的运势四维雷达与详细流年批语
        </p>
      </div>

      {/* ─── 选中年份雷达与解读详情卡片 ─── */}
      {selectedPoint && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* 雷达图 */}
          <div className="bg-white/90 border border-[#dcd3c1] rounded-3xl p-6 shadow-sm">
            <ScoreRadar
              score={{
                total: selectedPoint.score,
                trend: selectedPoint.close >= selectedPoint.open ? 'up' : 'down',
                dimensions: selectedPoint.dimensions,
              }}
              period={`${selectedPoint.year}年 (${selectedPoint.age}岁 · ${selectedPoint.ganZhi})`}
            />
          </div>

          {/* 详细信息卡片 */}
          <div className="bg-white/90 border border-[#dcd3c1] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
              <div>
                <h3 className="text-lg font-bold font-serif-sc text-[#1e2f34]">
                  {selectedPoint.year}年 · {selectedPoint.ganZhi}年运
                </h3>
                <span className="text-xs text-[#52666a]">
                  年龄：{selectedPoint.age}岁 · 所属大运：{selectedPoint.daYun}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#879397] block font-serif">流年气数</span>
                <span className={`text-2xl font-bold font-serif-sc ${
                  selectedPoint.score >= 70 ? 'text-[#176f63]' :
                  selectedPoint.score >= 50 ? 'text-[#c58a28]' : 'text-[#c0392b]'
                }`}>
                  {selectedPoint.score} 分
                </span>
              </div>
            </div>

            {selectedPoint.yearlyMutagens && selectedPoint.yearlyMutagens.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[#879397] block mb-1.5">
                  流年天干四化
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPoint.yearlyMutagens.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/20">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPoint.reason && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#879397] block mb-1">
                  流年行止指引与契机
                </span>
                <p className="text-sm text-[#1e2f34] leading-relaxed font-serif bg-[#f7f1e7]/60 p-3.5 rounded-xl border border-[#dcd3c1]/60">
                  {selectedPoint.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
