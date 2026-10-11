/* ============================================================
   玄机 · 全维数理分位走势大表 (FiveHundredTrendTable)
   - 参照国家体彩/福彩中心行业标准分位走势模型
   - 包含：分位选号矩阵、单元格历史遗漏值、SVG 走势折线连接、
          出现总次数/平均遗漏/最大遗漏/最大连出 四行统计、
          底部交互式模拟选号台
   ============================================================ */

import { useState, useMemo } from 'react'
import type { LotteryType, LotteryDraw } from './lottery-data'
import {
  LOTTERY_CONFIGS,
  buildDigitsMatrix,
  buildLottoMatrix,
  calculateTrendSummary,
  calculateFeatures,
} from './lottery-data'

interface FiveHundredTrendTableProps {
  lotteryType: LotteryType
  draws: LotteryDraw[]
  periodCount?: number
  onPeriodCountChange?: (count: number) => void
}

export function FiveHundredTrendTable({
  lotteryType,
  draws,
  periodCount,
  onPeriodCountChange,
}: FiveHundredTrendTableProps) {
  const cfg = LOTTERY_CONFIGS[lotteryType]

  // 控制选项
  const [showLines, setShowLines] = useState(true)
  const [showOmission, setShowOmission] = useState(true)
  const [showLayering, setShowLayering] = useState(true)
  const [showSummary, setShowSummary] = useState(true)
  const [showSimulate, setShowSimulate] = useState(true)

  // 模拟选号状态 (按位置选择)
  const [simulatedPicks, setSimulatedPicks] = useState<Record<number, number | null>>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
  })
  const [simulatedLottoReds, setSimulatedLottoReds] = useState<number[]>([])
  const [simulatedLottoBlues, setSimulatedLottoBlues] = useState<number[]>([])
  const [copied, setCopied] = useState(false)

  // 倒序排列（从老到新用于矩阵计算，展示时可由新到老展示）
  // 500彩票网标准：上方是最新一期（或可正序），此处按最新在最上面排列
  const chronologicalDraws = useMemo(() => [...draws].reverse(), [draws])

  // 1. 分位矩阵 (排列5 / 排列3 / 3D)
  const digitsMatrix = useMemo(() => {
    if (!cfg.isPositionDigits) return null
    return buildDigitsMatrix(chronologicalDraws, cfg.redCount)
  }, [cfg, chronologicalDraws])

  // 2. 乐透矩阵 (双色球 / 大乐透)
  const lottoRedMatrix = useMemo(() => {
    if (cfg.isPositionDigits) return null
    return buildLottoMatrix(chronologicalDraws, cfg.redRange, false)
  }, [cfg, chronologicalDraws])

  const lottoBlueMatrix = useMemo(() => {
    if (!cfg.blueRange) return null
    return buildLottoMatrix(chronologicalDraws, cfg.blueRange, true)
  }, [cfg, chronologicalDraws])

  // 专业四行统计计算
  // 分位统计：[posIndex][digit 0..9] -> TrendSummary
  const digitSummaries = useMemo(() => {
    if (!cfg.isPositionDigits) return null
    return Array.from({ length: cfg.redCount }, (_, pos) => {
      return Array.from({ length: 10 }, (_, d) => {
        const hitFlags = chronologicalDraws.map((dr) => dr.reds[pos] === d)
        return calculateTrendSummary(hitFlags)
      })
    })
  }, [cfg, chronologicalDraws])

  // 乐透型统计：红球 [0..N] 与 蓝球 [0..M]
  const lottoRedSummaries = useMemo(() => {
    if (cfg.isPositionDigits) return null
    const [min, max] = cfg.redRange
    return Array.from({ length: max - min + 1 }, (_, idx) => {
      const num = min + idx
      const hitFlags = chronologicalDraws.map((dr) => dr.reds.includes(num))
      return calculateTrendSummary(hitFlags)
    })
  }, [cfg, chronologicalDraws])

  const lottoBlueSummaries = useMemo(() => {
    if (!cfg.blueRange) return null
    const [min, max] = cfg.blueRange
    return Array.from({ length: max - min + 1 }, (_, idx) => {
      const num = min + idx
      const hitFlags = chronologicalDraws.map((dr) => dr.blues.includes(num))
      return calculateTrendSummary(hitFlags)
    })
  }, [cfg, chronologicalDraws])

  // 绘制数据索引映射（当前展示列表是从最新到最老）
  const displayDraws = draws
  const features = useMemo(() => calculateFeatures(displayDraws, lotteryType), [
    displayDraws,
    lotteryType,
  ])

  // 格式化输出
  const formatBall = (n: number) => (cfg.isPositionDigits ? n.toString() : n.toString().padStart(2, '0'))

  // 模拟选号点击切换
  const handleToggleDigitPick = (pos: number, digit: number) => {
    setSimulatedPicks((prev) => ({
      ...prev,
      [pos]: prev[pos] === digit ? null : digit,
    }))
  }

  const handleToggleLottoRed = (num: number) => {
    setSimulatedLottoReds((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num].sort((a, b) => a - b)
    )
  }

  const handleToggleLottoBlue = (num: number) => {
    setSimulatedLottoBlues((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num].sort((a, b) => a - b)
    )
  }

  // 复制模拟自选号码
  const handleCopySimulated = () => {
    let str = ''
    if (cfg.isPositionDigits) {
      const nums = Array.from({ length: cfg.redCount }, (_, i) => simulatedPicks[i] ?? '*')
      str = `【玄机分位走势模拟选号 · ${cfg.name}】${nums.join(' ')}`
    } else {
      str = `【玄机分位走势模拟选号 · ${cfg.name}】红球: ${simulatedLottoReds.map(formatBall).join(' ')}`
      if (simulatedLottoBlues.length > 0) {
        str += ` + 蓝球: ${simulatedLottoBlues.map(formatBall).join(' ')}`
      }
    }
    navigator.clipboard.writeText(str)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 重置选号
  const handleClearSimulated = () => {
    setSimulatedPicks({ 0: null, 1: null, 2: null, 3: null, 4: null })
    setSimulatedLottoReds([])
    setSimulatedLottoBlues([])
  }

  return (
    <div className="space-y-4">
      {/* 全维走势工具栏控制条 */}
      <div className="bg-[#fbf7ee] p-3 sm:p-4 rounded-2xl border border-[#dcd3c1] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-serif-sc font-bold text-[#176f63] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#176f63]" />
            全维数理分位走势大表
          </span>
          <span className="text-[#879397] font-mono text-[11px] hidden md:inline">
            | 动态全位遗漏矩阵与折线连线
          </span>
        </div>

        {/* 快捷显隐开关 */}
        <div className="flex flex-wrap items-center gap-4 text-[#52666a] font-serif">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#176f63] select-none">
            <input
              type="checkbox"
              checked={showLines}
              onChange={(e) => setShowLines(e.target.checked)}
              className="accent-[#176f63] rounded"
            />
            <span>显示走势折线</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#176f63] select-none">
            <input
              type="checkbox"
              checked={showOmission}
              onChange={(e) => setShowOmission(e.target.checked)}
              className="accent-[#176f63] rounded"
            />
            <span>显示遗漏数据</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#176f63] select-none">
            <input
              type="checkbox"
              checked={showLayering}
              onChange={(e) => setShowLayering(e.target.checked)}
              className="accent-[#176f63] rounded"
            />
            <span>遗漏冷热分层</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#176f63] select-none">
            <input
              type="checkbox"
              checked={showSummary}
              onChange={(e) => setShowSummary(e.target.checked)}
              className="accent-[#176f63] rounded"
            />
            <span>统计四行</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#176f63] select-none">
            <input
              type="checkbox"
              checked={showSimulate}
              onChange={(e) => setShowSimulate(e.target.checked)}
              className="accent-[#176f63] rounded"
            />
            <span>模拟选号台</span>
          </label>
        </div>

        {/* 统计范围快捷切换 */}
        {onPeriodCountChange && (
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-white border border-[#dcd3c1] text-xs font-serif shadow-2xs">
            <span className="text-[#879397] text-[11px]">统计范围:</span>
            {[30, 50, 100].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onPeriodCountChange(cnt)}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  periodCount === cnt
                    ? 'bg-[#176f63] text-white shadow-xs'
                    : 'text-[#55736b] hover:bg-gray-100'
                }`}
              >
                近{cnt}期
              </button>
            ))}
            <span className="text-[#176f63] font-mono text-[10px] ml-1 font-bold">
              (实显 {draws.length} 期)
            </span>
          </div>
        )}
      </div>

      {/* 全维分位标准走势大表 */}
      <div className="bg-white rounded-2xl border border-[#dcd3c1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-center text-[11px] font-mono border-collapse select-none">
            {/* 表头第一层 */}
            <thead>
              <tr className="bg-[#f0e7d5] text-[#24453f] font-serif-sc font-bold border-b border-[#dcd3c1]">
                <th rowSpan={2} className="py-2.5 px-2 sticky left-0 bg-[#f0e7d5] z-20 w-20 border-r border-[#dcd3c1]">
                  期号
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-24 border-r border-[#dcd3c1] whitespace-nowrap">
                  开奖号码
                </th>

                {/* 1. 分位彩票 (排列5 / 排列3 / 3D) */}
                {cfg.isPositionDigits &&
                  cfg.positionNames?.map((posName, idx) => (
                    <th
                      key={posName}
                      colSpan={10}
                      className={`py-1.5 border-r border-[#dcd3c1] ${
                        idx % 2 === 0 ? 'bg-[#f7f0e1]' : 'bg-[#f1e6cf]'
                      }`}
                    >
                      {posName}走势 (0 - 9)
                    </th>
                  ))}

                {/* 2. 乐透彩票 (双色球 / 大乐透) */}
                {!cfg.isPositionDigits && (
                  <>
                    <th
                      colSpan={cfg.redRange[1] - cfg.redRange[0] + 1}
                      className="py-1.5 bg-[#fceeed] text-[#d93829] border-r border-[#dcd3c1]"
                    >
                      {cfg.id === 'ssq' ? '红球开奖分布区 (01 - 33)' : '前区红球分布区 (01 - 35)'}
                    </th>
                    {cfg.blueRange && (
                      <th
                        colSpan={cfg.blueRange[1] - cfg.blueRange[0] + 1}
                        className="py-1.5 bg-[#eaf2fb] text-[#1a68b5] border-r border-[#dcd3c1]"
                      >
                        {cfg.id === 'ssq' ? '蓝球分布区 (01 - 16)' : '后区蓝球分布区 (01 - 12)'}
                      </th>
                    )}
                  </>
                )}

                <th rowSpan={2} className="py-2.5 px-2 w-12 border-r border-[#dcd3c1]">
                  和值
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-12">
                  跨度
                </th>
              </tr>

              {/* 表头第二层：子列数字 */}
              <tr className="bg-[#faf5eb] text-[#6d8980] border-b border-[#dcd3c1] text-[10px]">
                {/* 分位子列 0-9 */}
                {cfg.isPositionDigits &&
                  cfg.positionNames?.map((_, posIdx) =>
                    Array.from({ length: 10 }, (_, d) => (
                      <th
                        key={`${posIdx}-${d}`}
                        className={`w-6 py-1 border-r border-[#ece3d3] ${
                          d === 9 ? 'border-r-[#dcd3c1]' : ''
                        }`}
                      >
                        {d}
                      </th>
                    ))
                  )}

                {/* 乐透红球子列 */}
                {!cfg.isPositionDigits &&
                  Array.from(
                    { length: cfg.redRange[1] - cfg.redRange[0] + 1 },
                    (_, i) => cfg.redRange[0] + i
                  ).map((num, i) => (
                    <th
                      key={`r-${num}`}
                      className={`w-6 py-1 border-r border-[#ece3d3] text-[#d93829] ${
                        i === cfg.redRange[1] - cfg.redRange[0] ? 'border-r-[#dcd3c1]' : ''
                      }`}
                    >
                      {formatBall(num)}
                    </th>
                  ))}

                {/* 乐透蓝球子列 */}
                {!cfg.isPositionDigits &&
                  cfg.blueRange &&
                  Array.from(
                    { length: cfg.blueRange[1] - cfg.blueRange[0] + 1 },
                    (_, i) => cfg.blueRange![0] + i
                  ).map((num) => (
                    <th key={`b-${num}`} className="w-6 py-1 border-r border-[#ece3d3] text-[#1a68b5]">
                      {formatBall(num)}
                    </th>
                  ))}
              </tr>
            </thead>

            {/* 开奖数据行 */}
            <tbody className="divide-y divide-[#ede4d4] relative">
              {displayDraws.map((d, rowIdx) => {
                const feat = features.find((f) => f.issue === d.issue)
                // 对应的 chronological 索引
                const chronoIdx = displayDraws.length - 1 - rowIdx

                return (
                  <tr
                    key={d.issue}
                    className={`hover:bg-[#fbf7ed] transition-colors ${
                      rowIdx % 2 === 1 ? 'bg-[#faf6ee]/50' : 'bg-white'
                    }`}
                  >
                    {/* 期号 (固定列) */}
                    <td className="py-2 px-2 font-bold text-[#1e2f34] sticky left-0 bg-inherit z-10 border-r border-[#dcd3c1] whitespace-nowrap shadow-2xs">
                      {d.issue}
                    </td>

                    {/* 开奖号码徽章 */}
                    <td className="py-2 px-2 border-r border-[#dcd3c1] whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {d.reds.map((ball, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full bg-[#d93829] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs"
                          >
                            {formatBall(ball)}
                          </span>
                        ))}
                        {d.blues.map((ball, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full bg-[#1a68b5] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs"
                          >
                            {formatBall(ball)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 1. 分位号码单元格 (万、千、百、十、个各 0-9) */}
                    {cfg.isPositionDigits &&
                      digitsMatrix &&
                      Array.from({ length: cfg.redCount }, (_, posIdx) => {
                        return Array.from({ length: 10 }, (_, digit) => {
                          const cell = digitsMatrix[chronoIdx]?.[posIdx]?.[digit]
                          const isHit = cell?.isHit ?? false
                          const omission = cell?.omission ?? 0

                          // 冷热背景分层
                          let layerBg = ''
                          if (showLayering && !isHit) {
                            if (omission >= 15) layerBg = 'bg-[#789087]/15'
                            else if (omission >= 8) layerBg = 'bg-[#c58a28]/10'
                          }

                          return (
                            <td
                              key={`${posIdx}-${digit}`}
                              className={`py-1.5 px-0.5 border-r border-[#eee6d8] ${layerBg} ${
                                digit === 9 ? 'border-r-[#dcd3c1]' : ''
                              }`}
                            >
                              {isHit ? (
                                <div className="w-5 h-5 mx-auto rounded-full bg-[#d93829] text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                                  {digit}
                                </div>
                              ) : showOmission ? (
                                <span className="text-[#879397] text-[10px]">
                                  {omission}
                                </span>
                              ) : null}
                            </td>
                          )
                        })
                      })}

                    {/* 2. 乐透红球与蓝球单元格 */}
                    {!cfg.isPositionDigits && lottoRedMatrix && (
                      <>
                        {Array.from(
                          { length: cfg.redRange[1] - cfg.redRange[0] + 1 },
                          (_, i) => {
                            const num = cfg.redRange[0] + i
                            const cell = lottoRedMatrix[chronoIdx]?.[i]
                            const isHit = cell?.isHit ?? false
                            const omission = cell?.omission ?? 0

                            let layerBg = ''
                            if (showLayering && !isHit) {
                              if (omission >= 18) layerBg = 'bg-[#d93829]/10'
                              else if (omission >= 10) layerBg = 'bg-[#c58a28]/8'
                            }

                            return (
                              <td
                                key={`r-${num}`}
                                className={`py-1.5 px-0.5 border-r border-[#eee6d8] ${layerBg}`}
                              >
                                {isHit ? (
                                  <div className="w-5 h-5 mx-auto rounded-full bg-[#d93829] text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                                    {formatBall(num)}
                                  </div>
                                ) : showOmission ? (
                                  <span className="text-[#879397] text-[10px]">
                                    {omission}
                                  </span>
                                ) : null}
                              </td>
                            )
                          }
                        )}

                        {cfg.blueRange &&
                          lottoBlueMatrix &&
                          Array.from(
                            { length: cfg.blueRange[1] - cfg.blueRange[0] + 1 },
                            (_, i) => {
                              const num = cfg.blueRange![0] + i
                              const cell = lottoBlueMatrix[chronoIdx]?.[i]
                              const isHit = cell?.isHit ?? false
                              const omission = cell?.omission ?? 0

                              let layerBg = ''
                              if (showLayering && !isHit) {
                                if (omission >= 12) layerBg = 'bg-[#1a68b5]/10'
                              }

                              return (
                                <td
                                  key={`b-${num}`}
                                  className={`py-1.5 px-0.5 border-r border-[#eee6d8] ${layerBg}`}
                                >
                                  {isHit ? (
                                    <div className="w-5 h-5 mx-auto rounded-full bg-[#1a68b5] text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                                      {formatBall(num)}
                                    </div>
                                  ) : showOmission ? (
                                    <span className="text-[#879397] text-[10px]">
                                      {omission}
                                    </span>
                                  ) : null}
                                </td>
                              )
                            }
                          )}
                      </>
                    )}

                    {/* 和值与跨度 */}
                    <td className="py-2 px-1 font-bold text-[#8A5B21] border-r border-[#dcd3c1]">
                      {feat?.sum ?? '-'}
                    </td>
                    <td className="py-2 px-1 text-[#24453f]">
                      {feat?.span ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* 专业四行统计表底 */}
            {showSummary && (
              <tfoot className="border-t-2 border-[#176f63] font-serif-sc font-bold text-[10px]">
                {/* 1. 出现总次数 */}
                <tr className="bg-[#f6eee0] text-[#1e2f34]">
                  <td className="py-2 px-2 sticky left-0 bg-[#f6eee0] z-10 border-r border-[#dcd3c1]">
                    出现总次数
                  </td>
                  <td className="py-2 px-2 border-r border-[#dcd3c1] text-[#879397] font-mono">
                    Σ 频次
                  </td>
                  {cfg.isPositionDigits &&
                    digitSummaries?.map((posArr, posIdx) =>
                      posArr.map((st, d) => (
                        <td
                          key={`hits-${posIdx}-${d}`}
                          className={`py-1.5 border-r border-[#e5dcce] font-mono ${
                            d === 9 ? 'border-r-[#dcd3c1]' : ''
                          } ${st.hits >= 6 ? 'bg-[#c58a28]/20 text-[#8A5B21]' : ''}`}
                        >
                          {st.hits}
                        </td>
                      ))
                    )}
                  {!cfg.isPositionDigits && lottoRedSummaries && (
                    <>
                      {lottoRedSummaries.map((st, i) => (
                        <td key={`rhits-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.hits}
                        </td>
                      ))}
                      {lottoBlueSummaries?.map((st, i) => (
                        <td key={`bhits-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.hits}
                        </td>
                      ))}
                    </>
                  )}
                  <td className="border-r border-[#dcd3c1]">-</td>
                  <td>-</td>
                </tr>

                {/* 2. 平均遗漏值 */}
                <tr className="bg-[#faf5eb] text-[#52666a]">
                  <td className="py-2 px-2 sticky left-0 bg-[#faf5eb] z-10 border-r border-[#dcd3c1]">
                    平均遗漏值
                  </td>
                  <td className="py-2 px-2 border-r border-[#dcd3c1] text-[#879397] font-mono">
                    Avg 间隔
                  </td>
                  {cfg.isPositionDigits &&
                    digitSummaries?.map((posArr, posIdx) =>
                      posArr.map((st, d) => (
                        <td
                          key={`avg-${posIdx}-${d}`}
                          className={`py-1.5 border-r border-[#e5dcce] font-mono ${
                            d === 9 ? 'border-r-[#dcd3c1]' : ''
                          }`}
                        >
                          {st.avgOmission}
                        </td>
                      ))
                    )}
                  {!cfg.isPositionDigits && lottoRedSummaries && (
                    <>
                      {lottoRedSummaries.map((st, i) => (
                        <td key={`ravg-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.avgOmission}
                        </td>
                      ))}
                      {lottoBlueSummaries?.map((st, i) => (
                        <td key={`bavg-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.avgOmission}
                        </td>
                      ))}
                    </>
                  )}
                  <td className="border-r border-[#dcd3c1]">-</td>
                  <td>-</td>
                </tr>

                {/* 3. 最大遗漏值 */}
                <tr className="bg-[#f6eee0] text-[#52666a]">
                  <td className="py-2 px-2 sticky left-0 bg-[#f6eee0] z-10 border-r border-[#dcd3c1]">
                    最大遗漏值
                  </td>
                  <td className="py-2 px-2 border-r border-[#dcd3c1] text-[#879397] font-mono">
                    Max 峰值
                  </td>
                  {cfg.isPositionDigits &&
                    digitSummaries?.map((posArr, posIdx) =>
                      posArr.map((st, d) => (
                        <td
                          key={`max-${posIdx}-${d}`}
                          className={`py-1.5 border-r border-[#e5dcce] font-mono ${
                            d === 9 ? 'border-r-[#dcd3c1]' : ''
                          }`}
                        >
                          {st.maxOmission}
                        </td>
                      ))
                    )}
                  {!cfg.isPositionDigits && lottoRedSummaries && (
                    <>
                      {lottoRedSummaries.map((st, i) => (
                        <td key={`rmax-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.maxOmission}
                        </td>
                      ))}
                      {lottoBlueSummaries?.map((st, i) => (
                        <td key={`bmax-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.maxOmission}
                        </td>
                      ))}
                    </>
                  )}
                  <td className="border-r border-[#dcd3c1]">-</td>
                  <td>-</td>
                </tr>

                {/* 4. 最大连出值 */}
                <tr className="bg-[#faf5eb] text-[#52666a]">
                  <td className="py-2 px-2 sticky left-0 bg-[#faf5eb] z-10 border-r border-[#dcd3c1]">
                    最大连出值
                  </td>
                  <td className="py-2 px-2 border-r border-[#dcd3c1] text-[#879397] font-mono">
                    Max 连出
                  </td>
                  {cfg.isPositionDigits &&
                    digitSummaries?.map((posArr, posIdx) =>
                      posArr.map((st, d) => (
                        <td
                          key={`consec-${posIdx}-${d}`}
                          className={`py-1.5 border-r border-[#e5dcce] font-mono ${
                            d === 9 ? 'border-r-[#dcd3c1]' : ''
                          }`}
                        >
                          {st.maxConsecutive}
                        </td>
                      ))
                    )}
                  {!cfg.isPositionDigits && lottoRedSummaries && (
                    <>
                      {lottoRedSummaries.map((st, i) => (
                        <td key={`rconsec-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.maxConsecutive}
                        </td>
                      ))}
                      {lottoBlueSummaries?.map((st, i) => (
                        <td key={`bconsec-${i}`} className="py-1.5 border-r border-[#e5dcce] font-mono">
                          {st.maxConsecutive}
                        </td>
                      ))}
                    </>
                  )}
                  <td className="border-r border-[#dcd3c1]">-</td>
                  <td>-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* 底部 500.com 模拟选号栏 */}
        {showSimulate && (
          <div className="p-4 border-t-2 border-[#176f63] bg-[#fdfbf6] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-[#176f63] text-white font-serif-sc font-bold text-xs shrink-0 shadow-2xs">
                🎯 模拟选号台
              </div>
              <div className="text-xs text-[#52666a] font-serif">
                点击表格各位置号码试选，直观验证冷热落点与走势形态。
              </div>
            </div>

            {/* 分位选号按钮组 (排列5 / 排列3 / 3D) */}
            {cfg.isPositionDigits && (
              <div className="flex flex-wrap items-center gap-3">
                {cfg.positionNames?.map((name, posIdx) => (
                  <div key={name} className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-[#dcd3c1]">
                    <span className="text-[10px] text-[#879397] font-serif px-1">{name}:</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 10 }, (_, d) => {
                        const isPicked = simulatedPicks[posIdx] === d
                        return (
                          <button
                            key={d}
                            onClick={() => handleToggleDigitPick(posIdx, d)}
                            className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold transition-all ${
                              isPicked
                                ? 'bg-[#d93829] text-white shadow-xs scale-110'
                                : 'bg-[#f4eddf] text-[#55736b] hover:bg-[#d93829]/20'
                            }`}
                          >
                            {d}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 乐透选号按钮快捷显示 (双色球 / 大乐透) */}
            {!cfg.isPositionDigits && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-[#dcd3c1]">
                  <span className="text-[10px] text-[#d93829] font-serif px-1">
                    红球({simulatedLottoReds.length}/{cfg.redCount}):
                  </span>
                  <div className="flex items-center gap-0.5 max-w-[280px] overflow-x-auto py-0.5 custom-scrollbar">
                    {Array.from(
                      { length: cfg.redRange[1] - cfg.redRange[0] + 1 },
                      (_, i) => cfg.redRange[0] + i
                    )
                      .slice(0, 16)
                      .map((num) => {
                        const isPicked = simulatedLottoReds.includes(num)
                        return (
                          <button
                            key={num}
                            onClick={() => handleToggleLottoRed(num)}
                            className={`w-5 h-5 rounded-full text-[9px] font-mono font-bold shrink-0 transition-all ${
                              isPicked
                                ? 'bg-[#d93829] text-white shadow-xs scale-110'
                                : 'bg-[#f4eddf] text-[#55736b] hover:bg-[#d93829]/20'
                            }`}
                          >
                            {formatBall(num)}
                          </button>
                        )
                      })}
                  </div>
                </div>

                {cfg.blueRange && (
                  <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-[#dcd3c1]">
                    <span className="text-[10px] text-[#1a68b5] font-serif px-1">蓝球:</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from(
                        { length: cfg.blueRange[1] - cfg.blueRange[0] + 1 },
                        (_, i) => cfg.blueRange![0] + i
                      ).map((num) => {
                        const isPicked = simulatedLottoBlues.includes(num)
                        return (
                          <button
                            key={num}
                            onClick={() => handleToggleLottoBlue(num)}
                            className={`w-5 h-5 rounded-full text-[9px] font-mono font-bold transition-all ${
                              isPicked
                                ? 'bg-[#1a68b5] text-white shadow-xs scale-110'
                                : 'bg-[#eaf2fb] text-[#1a68b5] hover:bg-[#1a68b5]/20'
                            }`}
                          >
                            {formatBall(num)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 操作按键 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySimulated}
                className="btn-xuanji px-3.5 py-1.5 rounded-xl text-xs font-bold font-serif-sc shadow-2xs"
              >
                {copied ? '✓ 已复制自选' : '📋 复制选号'}
              </button>
              <button
                onClick={handleClearSimulated}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#dcd3c1] text-[#789087] hover:text-[#d93829] text-xs font-serif transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
