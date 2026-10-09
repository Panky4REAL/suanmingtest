/* ============================================================
   玄机 · 中国福彩与体彩 走势图鉴 (LotteryTrendChart)
   - 支持：双色球、大乐透、福彩3D、排列3、快乐8
   - 包含：开奖走势大表、冷热温码统计、和值/跨度/奇偶指标图
   ============================================================ */

import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { LotteryType } from './lottery-data'
import {
  LOTTERY_CONFIGS,
  getLotteryDraws,
  calculateStats,
  calculateFeatures,
} from './lottery-data'

type ChartViewMode = 'distribution' | 'hotcold' | 'indicators'

export function LotteryTrendChart() {
  const [activeType, setActiveType] = useState<LotteryType>('ssq')
  const [viewMode, setViewMode] = useState<ChartViewMode>('distribution')

  const cfg = LOTTERY_CONFIGS[activeType]
  const draws = useMemo(() => getLotteryDraws(activeType), [activeType])
  const latestDraw = draws[0]

  // 冷热统计数据
  const redStats = useMemo(
    () => calculateStats(draws, cfg.redRange, false),
    [draws, cfg.redRange]
  )
  const blueStats = useMemo(() => {
    if (!cfg.blueRange) return []
    return calculateStats(draws, cfg.blueRange, true)
  }, [draws, cfg.blueRange])

  // 特征数据
  const features = useMemo(
    () => calculateFeatures(draws, activeType),
    [draws, activeType]
  )

  // 和值走势 ECharts 配置
  const sumChartOption = useMemo(() => {
    const reversedFeatures = [...features].reverse()
    const xData = reversedFeatures.map((f) => f.issue)
    const sumData = reversedFeatures.map((f) => f.sum)
    const spanData = reversedFeatures.map((f) => f.span)

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 253, 248, 0.95)',
        borderColor: '#176f63',
        textStyle: { color: '#1e2f34', fontFamily: 'serif' },
      },
      legend: {
        data: ['和值', '跨度'],
        textStyle: { color: '#52666a' },
        top: 5,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '18%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: '#dcd3c1' } },
        axisLabel: { color: '#6d8980', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: '和值',
          nameTextStyle: { color: '#6d8980' },
          splitLine: { lineStyle: { color: 'rgba(220, 211, 193, 0.4)' } },
          axisLabel: { color: '#6d8980' },
        },
        {
          type: 'value',
          name: '跨度',
          nameTextStyle: { color: '#6d8980' },
          splitLine: { show: false },
          axisLabel: { color: '#6d8980' },
        },
      ],
      series: [
        {
          name: '和值',
          type: 'line',
          data: sumData,
          smooth: true,
          itemStyle: { color: '#d93829' },
          lineStyle: { width: 3, color: '#d93829' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(217, 56, 41, 0.25)' },
                { offset: 1, color: 'rgba(217, 56, 41, 0.01)' },
              ],
            },
          },
        },
        {
          name: '跨度',
          type: 'line',
          yAxisIndex: 1,
          data: spanData,
          smooth: true,
          itemStyle: { color: '#176f63' },
          lineStyle: { width: 2, type: 'dashed', color: '#176f63' },
        },
      ],
    }
  }, [features])

  // 大小与奇偶 ECharts 配置
  const ratioChartOption = useMemo(() => {
    const reversedFeatures = [...features].reverse()
    const xData = reversedFeatures.map((f) => f.issue)
    const oddData = reversedFeatures.map((f) => f.oddCount)
    const bigData = reversedFeatures.map((f) => f.bigCount)

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 253, 248, 0.95)',
        borderColor: '#c58a28',
        textStyle: { color: '#1e2f34' },
      },
      legend: {
        data: ['奇数个数', '大号个数'],
        textStyle: { color: '#52666a' },
        top: 5,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '18%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: '#dcd3c1' } },
        axisLabel: { color: '#6d8980', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: cfg.redCount,
        splitLine: { lineStyle: { color: 'rgba(220, 211, 193, 0.4)' } },
        axisLabel: { color: '#6d8980' },
      },
      series: [
        {
          name: '奇数个数',
          type: 'bar',
          data: oddData,
          itemStyle: { color: '#c58a28' },
          barWidth: '28%',
        },
        {
          name: '大号个数',
          type: 'bar',
          data: bigData,
          itemStyle: { color: '#1a68b5' },
          barWidth: '28%',
        },
      ],
    }
  }, [features, cfg.redCount])

  // 辅助格式化数字 (3D/排列3/排列5展示单数字0-9，双色球/大乐透展示两位01-35)
  const isDigitType = activeType === 'fc3d' || activeType === 'pl3' || activeType === 'pl5'
  const formatBall = (n: number) => (isDigitType ? n.toString() : n.toString().padStart(2, '0'))

  return (
    <div className="space-y-6">
      {/* 顶部彩种导航切换 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="xuanji-seal text-xs">{cfg.category}</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
                {cfg.fullName} · 走势图鉴
              </h2>
            </div>
            <p className="text-xs text-[#6d8980] mt-1 font-serif">
              {cfg.desc} ｜ 开奖时辰：{cfg.drawDays}
            </p>
          </div>

          {/* 彩种胶囊选择 */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map((key) => {
              const item = LOTTERY_CONFIGS[key]
              const isSelected = activeType === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-serif-sc font-bold transition-all
                    ${isSelected
                      ? 'bg-[#176f63] text-white shadow-xs'
                      : 'bg-[#f4eddf] text-[#55736b] hover:bg-white hover:text-[#176f63] border border-[#dcd3c1]'
                    }
                  `}
                >
                  <span className="text-[10px] opacity-75 mr-1 font-mono">[{item.category}]</span>
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 最新一期开奖横幅 */}
        {latestDraw && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#f7f2e7] via-[#fffdf9] to-[#f4ece1] border border-[#dcd3c1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#c58a28]/15 border border-[#c58a28]/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] text-[#8A5B21] font-serif">最新期</span>
                <span className="font-mono text-xs font-bold text-[#8A5B21]">
                  {latestDraw.issue.slice(-3)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-serif-sc text-[#1e2f34]">
                    第 {latestDraw.issue} 期
                  </span>
                  <span className="text-xs text-[#879397] font-mono">
                    {latestDraw.date}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {/* 红球展示 */}
                  {latestDraw.reds.map((ball, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f25c4e] to-[#d93829] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-white/50"
                    >
                      {formatBall(ball)}
                    </span>
                  ))}
                  {/* 蓝球展示 */}
                  {latestDraw.blues.map((ball, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b87d9] to-[#1a68b5] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-white/50"
                    >
                      {formatBall(ball)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {latestDraw.poolPrize && (
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#dcd3c1]/60">
                <span className="text-[10px] text-[#879397] font-serif block">奖池累积</span>
                <span className="font-mono text-base font-black text-[#d93829]">
                  {latestDraw.poolPrize}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 视图模式切换卡 */}
      <div className="flex items-center justify-between border-b border-[#dcd3c1] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('distribution')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-sc transition-all ${
              viewMode === 'distribution'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'bg-white/70 text-[#55736b] hover:bg-white'
            }`}
          >
            📋 开奖分布走势表
          </button>
          <button
            onClick={() => setViewMode('hotcold')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-sc transition-all ${
              viewMode === 'hotcold'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'bg-white/70 text-[#55736b] hover:bg-white'
            }`}
          >
            🔥 号码冷热与遗漏
          </button>
          <button
            onClick={() => setViewMode('indicators')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-sc transition-all ${
              viewMode === 'indicators'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'bg-white/70 text-[#55736b] hover:bg-white'
            }`}
          >
            📈 和值/奇偶/大小指标
          </button>
        </div>

        <span className="text-xs text-[#879397] font-serif hidden sm:inline-block">
          显示近 {draws.length} 期数据
        </span>
      </div>

      {/* 1. 开奖分布走势表 */}
      {viewMode === 'distribution' && (
        <div className="bg-white/95 rounded-3xl border border-[#dcd3c1] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#dcd3c1] bg-[#fbf8f2] flex items-center justify-between">
            <span className="font-serif-sc font-bold text-xs text-[#24453f]">
              ❖ 期号与开出号码分布总览
            </span>
            <div className="flex items-center gap-3 text-[11px] font-serif text-[#6d8980]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d93829]" /> 红球
              </span>
              {cfg.blueRange && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a68b5]" /> 蓝球
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-[#f2ece0] text-[#52666a] font-serif border-b border-[#dcd3c1]">
                  <th className="py-2.5 px-3 sticky left-0 bg-[#f2ece0] z-10 w-24">期号</th>
                  <th className="py-2.5 px-3 w-28">开奖日期</th>
                  <th className="py-2.5 px-3">开奖号码</th>
                  <th className="py-2.5 px-3">和值</th>
                  <th className="py-2.5 px-3">跨度</th>
                  <th className="py-2.5 px-3">奇偶比</th>
                  <th className="py-2.5 px-3">大小比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4d6]">
                {draws.map((d) => {
                  const feat = features.find((f) => f.issue === d.issue)
                  return (
                    <tr
                      key={d.issue}
                      className="hover:bg-[#fbf7ee] transition-colors font-mono"
                    >
                      <td className="py-3 px-3 font-bold text-[#1e2f34] sticky left-0 bg-white/95">
                        {d.issue}
                      </td>
                      <td className="py-3 px-3 text-[#789087] text-[11px]">
                        {d.date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {d.reds.map((r, i) => (
                            <span
                              key={i}
                              className="w-6 h-6 rounded-full bg-[#d93829] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs"
                            >
                              {formatBall(r)}
                            </span>
                          ))}
                          {d.blues.map((b, i) => (
                            <span
                              key={i}
                              className="w-6 h-6 rounded-full bg-[#1a68b5] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs"
                            >
                              {formatBall(b)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#8A5B21]">
                        {feat?.sum ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-[#52666a]">
                        {feat?.span ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-[#24453f]">
                        {feat?.oddEvenRatio ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-[#24453f]">
                        {feat?.bigSmallRatio ?? '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. 号码冷热与遗漏看板 */}
      {viewMode === 'hotcold' && (
        <div className="space-y-6">
          {/* 红球冷热 */}
          <div className="bg-white/95 rounded-3xl border border-[#dcd3c1] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d93829]" />
                <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                  红球/前区 冷热频次与当前遗漏
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-serif">
                <span className="px-2 py-0.5 rounded bg-[#d93829]/15 text-[#d93829] font-bold">
                  🔥 热码
                </span>
                <span className="px-2 py-0.5 rounded bg-[#c58a28]/15 text-[#8A5B21]">
                  ⛅ 温码
                </span>
                <span className="px-2 py-0.5 rounded bg-[#52666a]/15 text-[#52666a]">
                  ❄️ 冷码
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-2.5">
              {redStats.map((st) => (
                <div
                  key={st.num}
                  className={`
                    p-2.5 rounded-2xl border text-center transition-all
                    ${st.heat === 'hot'
                      ? 'bg-[#d93829]/5 border-[#d93829]/30 hover:border-[#d93829]'
                      : st.heat === 'cold'
                      ? 'bg-[#f4eddf]/40 border-[#dcd3c1] hover:border-[#52666a]'
                      : 'bg-white border-[#dcd3c1] hover:border-[#c58a28]'
                    }
                  `}
                >
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#d93829] text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs mb-1.5">
                    {formatBall(st.num)}
                  </div>
                  <div className="text-[11px] font-mono text-[#1e2f34]">
                    出 <span className="font-bold">{st.freq}</span> 次
                  </div>
                  <div className="text-[10px] font-mono text-[#879397] mt-0.5">
                    遗漏 <span className="font-bold text-[#8A5B21]">{st.omission}</span> 期
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 蓝球冷热 (若有) */}
          {blueStats.length > 0 && (
            <div className="bg-white/95 rounded-3xl border border-[#dcd3c1] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1a68b5]" />
                  <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                    蓝球/后区 冷热频次与当前遗漏
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
                {blueStats.map((st) => (
                  <div
                    key={st.num}
                    className="p-2 rounded-2xl border border-[#dcd3c1] bg-white text-center hover:border-[#1a68b5] transition-all"
                  >
                    <div className="w-6 h-6 mx-auto rounded-full bg-[#1a68b5] text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs mb-1">
                      {formatBall(st.num)}
                    </div>
                    <div className="text-[10px] font-mono text-[#1e2f34]">
                      出 <span className="font-bold">{st.freq}</span> 次
                    </div>
                    <div className="text-[10px] font-mono text-[#879397]">
                      漏 <span className="font-bold text-[#1a68b5]">{st.omission}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 和值与奇偶指标图 */}
      {viewMode === 'indicators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/95 rounded-3xl border border-[#dcd3c1] p-5 shadow-xs">
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34] mb-2">
              ❖ 和值与跨度起伏趋势
            </h3>
            <p className="text-xs text-[#879397] font-serif mb-4">
              反映号码整体重心的冷热位移（红线为和值走势，绿虚线为跨度）
            </p>
            <div className="h-64 sm:h-72 w-full">
              <ReactECharts option={sumChartOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl border border-[#dcd3c1] p-5 shadow-xs">
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34] mb-2">
              ❖ 奇偶与大小比柱状分布
            </h3>
            <p className="text-xs text-[#879397] font-serif mb-4">
              分析号码阴阳平衡与高低位区间共振规律
            </p>
            <div className="h-64 sm:h-72 w-full">
              <ReactECharts option={ratioChartOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
