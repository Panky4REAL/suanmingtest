/* ============================================================
   玄机 · 玄学数理选号中心 (MetaphysicalPicker)
   - 融合易经六十四卦、五行河图洛书、紫微财曜与奇门遁甲
   - 提供心念起卦仪式感动画、灵签断辞、吉利时辰与一键复制推荐
   ============================================================ */

import { useState } from 'react'
import { useChartStore } from '@/stores'
import type { LotteryType } from './lottery-data'
import { LOTTERY_CONFIGS } from './lottery-data'
import type { MetaphysicalMethod, MetaphysicalResult } from './metaphysical-engine'
import { generateMetaphysicalNumbers } from './metaphysical-engine'

const METHODS: Array<{
  id: MetaphysicalMethod
  name: string
  subname: string
  icon: string
  desc: string
}> = [
  {
    id: 'bazi_elements',
    name: '五行河图洛书',
    subname: 'Hetu Luoshu',
    icon: '☯️',
    desc: '依本命五行气数与河图洛书相生相成律，定夺天一生水、地二生火之合数',
  },
  {
    id: 'iching_hexagram',
    name: '周易梅花易数',
    subname: 'I Ching Hexagram',
    icon: '🪙',
    desc: '摇卦问数，感应六十四卦天地交泰、大有丰盈之生发气运',
  },
  {
    id: 'ziwei_stars',
    name: '紫微财曜照命',
    subname: 'Ziwei Star Aura',
    icon: '✨',
    desc: '武曲、贪狼、太阴、禄存星垣照临，聚敛财帛宫正偏财吉度灵码',
  },
  {
    id: 'qimen_timing',
    name: '奇门时空九星',
    subname: 'Qimen Dunjia',
    icon: '🧭',
    desc: '以当下天时干支值符，寻生门吉方与天心天任九星相照之数',
  },
]

export function MetaphysicalPicker() {
  const { chart } = useChartStore()

  const [lotteryType, setLotteryType] = useState<LotteryType>('ssq')
  const [selectedMethod, setSelectedMethod] = useState<MetaphysicalMethod>('bazi_elements')
  const [customElement, setCustomElement] = useState<string>('木火通明')
  const [isDivining, setIsDivining] = useState(false)
  const [divineStepText, setDivineStepText] = useState('')
  const [result, setResult] = useState<MetaphysicalResult | null>(() =>
    generateMetaphysicalNumbers('ssq', 'bazi_elements', '木火')
  )
  const [copied, setCopied] = useState(false)

  const cfg = LOTTERY_CONFIGS[lotteryType]

  // 格式化彩球数字 (3D/排列3/排列5展示单数字0-9，双色球/大乐透展示两位01-35)
  const isDigitType = lotteryType === 'fc3d' || lotteryType === 'pl3' || lotteryType === 'pl5'
  const formatBall = (n: number) => (isDigitType ? n.toString() : n.toString().padStart(2, '0'))

  // 触发起卦
  const handleStartDivination = () => {
    setIsDivining(true)
    setDivineStepText('静心凝神，感应干支节律...')

    setTimeout(() => {
      setDivineStepText('排定洛书九宫，运转天星易理...')
    }, 500)

    setTimeout(() => {
      setDivineStepText('吉气内凝，灵码出匣...')
    }, 1000)

    setTimeout(() => {
      const userEl = chart ? chart.palaces[0]?.name : customElement
      const res = generateMetaphysicalNumbers(lotteryType, selectedMethod, userEl)
      setResult(res)
      setIsDivining(false)
    }, 1400)
  }

  // 复制号码
  const handleCopyNumbers = (reds: number[], blues: number[]) => {
    const redStr = reds.map(formatBall).join(' ')
    const blueStr = blues.length > 0 ? ` + 蓝球: ${blues.map(formatBall).join(' ')}` : ''
    const text = `【玄机 · ${cfg.name}吉数】\n红球/前区: ${redStr}${blueStr}\n迎财吉方: ${result?.favorableDirection}\n吉利时辰: ${result?.auspiciousHours}`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // 复制全部5注
  const handleCopyAllSets = () => {
    if (!result?.multipleSets) return
    const lines = result.multipleSets.map((s, idx) => {
      const r = s.reds.map(formatBall).join(' ')
      const b = s.blues.length > 0 ? ` | ${s.blues.map(formatBall).join(' ')}` : ''
      return `第${idx + 1}注: ${r}${b}`
    })
    const text = `【玄机 · ${cfg.name} 5注易数灵签】\n${lines.join('\n')}\n❖ 吉方: ${result.favorableDirection}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* 顶部选号配置面板 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#dcd3c1]/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="xuanji-seal text-xs">玄机数理</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
                灵机定数 · 玄学起卦选号
              </h2>
            </div>
            <p className="text-xs text-[#6d8980] mt-1 font-serif">
              以天地易理、干支纳音与紫微星照，契合自然节律感应灵动气运。
            </p>
          </div>

          {/* 目标彩种选择 */}
          <div className="flex flex-wrap gap-2">
            {(['ssq', 'dlt', 'fc3d', 'pl3', 'pl5'] as LotteryType[]).map((key) => {
              const item = LOTTERY_CONFIGS[key]
              const isSelected = lotteryType === key
              return (
                <button
                  key={key}
                  onClick={() => setLotteryType(key)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-serif-sc font-bold transition-all
                    ${isSelected
                      ? 'bg-[#176f63] text-white shadow-xs'
                      : 'bg-[#f4eddf] text-[#55736b] hover:bg-white hover:text-[#176f63] border border-[#dcd3c1]'
                    }
                  `}
                >
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 四大起号法门选择卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
          {METHODS.map((m) => {
            const isSelected = selectedMethod === m.id
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`
                  p-4 rounded-2xl text-left border transition-all duration-200
                  ${isSelected
                    ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                    : 'bg-white/70 border-[#dcd3c1] hover:bg-white hover:border-[#176f63]/40'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#176f63] text-white' : 'bg-[#c58a28]/15 text-[#8A5B21]'
                  }`}>
                    {isSelected ? '当前法门' : '可选'}
                  </span>
                </div>
                <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                  {m.name}
                </h3>
                <p className="text-[11px] text-[#879397] font-mono mt-0.5">
                  {m.subname}
                </p>
                <p className="text-xs text-[#52666a] mt-2 font-serif line-clamp-2">
                  {m.desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* 个性化气运输入/联动 */}
        {selectedMethod === 'bazi_elements' && (
          <div className="p-3.5 rounded-2xl bg-[#f4eddf]/60 border border-[#dcd3c1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-5">
            <div className="flex items-center gap-2">
              <span className="font-serif-sc font-bold text-[#24453f]">❖ 本命气场契合：</span>
              <span className="text-[#6d8980]">
                {chart ? `已自动关联本命排盘 (${chart.solarDate})` : '未录入命盘，可快捷选择意向喜用神'}
              </span>
            </div>
            {!chart && (
              <div className="flex items-center gap-1.5">
                {['木火通明', '金水相生', '土载厚德', '水润万物', '金石坚固'].map((el) => (
                  <button
                    key={el}
                    onClick={() => setCustomElement(el)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-colors ${
                      customElement === el
                        ? 'bg-[#176f63] text-white font-bold'
                        : 'bg-white text-[#55736b] border border-[#dcd3c1]'
                    }`}
                  >
                    {el}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 起卦按钮 */}
        <div className="text-center pt-2">
          <button
            onClick={handleStartDivination}
            disabled={isDivining}
            className="btn-xuanji px-8 py-3.5 rounded-full text-sm font-bold font-serif-sc shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isDivining ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{divineStepText || '心念起卦中...'}</span>
              </>
            ) : (
              <>
                <span>🔮</span>
                <span>心念启盘 · 求取{cfg.name}吉数</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 选号结果看板 */}
      {result && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* 卦象与签文卡片 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#faf6ee] to-[#f4ece0] border border-[#c58a28]/40 relative overflow-hidden">
            <div className="absolute right-4 -top-6 text-7xl opacity-5 font-serif select-none pointer-events-none">
              ☯
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="xuanji-seal text-xs">{result.methodName}</span>
                  <span className="font-serif-sc font-bold text-lg text-[#1e2f34]">
                    {result.title}
                  </span>
                  <span className="text-xs font-mono text-[#c58a28]">
                    {'★'.repeat(result.confidenceStars)}
                  </span>
                </div>
                {/* 灵签诗句 */}
                <div className="p-3 rounded-xl bg-white/70 border border-[#c58a28]/20 font-serif-sc text-sm text-[#8A5B21] tracking-wider leading-relaxed">
                  “ {result.signPoem} ”
                </div>
                <p className="text-xs text-[#52666a] font-serif leading-relaxed mt-2">
                  <span className="font-bold text-[#176f63]">【玄机解语】</span>
                  {result.oracleInterpretation}
                </p>
              </div>

              {/* 吉方与时辰指南 */}
              <div className="shrink-0 p-4 rounded-xl bg-white/80 border border-[#dcd3c1] space-y-2 text-xs font-serif min-w-[200px]">
                <div>
                  <span className="text-[#879397] block text-[10px]">迎财吉位</span>
                  <span className="font-bold text-[#24453f] font-serif-sc">
                    {result.favorableDirection}
                  </span>
                </div>
                <div>
                  <span className="text-[#879397] block text-[10px]">吉利下注时辰</span>
                  <span className="font-bold text-[#8A5B21] font-mono">
                    {result.auspiciousHours}
                  </span>
                </div>
                <div>
                  <span className="text-[#879397] block text-[10px]">气运合局</span>
                  <span className="text-[#52666a]">{result.elementAffinity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 核心第一注 (主签号码) */}
          <div className="p-6 rounded-2xl bg-white border border-[#dcd3c1] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dcd3c1]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d93829]" />
                <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
                  本命灵感第一注 · 重点吉码
                </h3>
              </div>
              <button
                onClick={() => handleCopyNumbers(result.redPicks, result.bluePicks)}
                className="px-3.5 py-1.5 rounded-xl bg-[#176f63]/10 text-[#176f63] hover:bg-[#176f63] hover:text-white font-serif-sc font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>{copied ? '✓ 已复制号码' : '📋 复制此注号码'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 py-6 flex-wrap">
              {result.redPicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#f25c4e] to-[#d93829] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{ animationDelay: `${idx * 120}ms`, animationIterationCount: 1 }}
                >
                  {formatBall(ball)}
                </div>
              ))}
              {result.bluePicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#3b87d9] to-[#1a68b5] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{
                    animationDelay: `${(result.redPicks.length + idx) * 120}ms`,
                    animationIterationCount: 1,
                  }}
                >
                  {formatBall(ball)}
                </div>
              ))}
            </div>
          </div>

          {/* 5注五行倍投建议列表 */}
          {result.multipleSets && result.multipleSets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif-sc font-bold text-sm text-[#24453f]">
                  ❖ 五行合局 · 5注推荐灵签
                </span>
                <button
                  onClick={handleCopyAllSets}
                  className="text-xs font-serif text-[#176f63] hover:underline"
                >
                  一键复制全部 5 注 →
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {result.multipleSets.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#fcf9f2] border border-[#dcd3c1] flex items-center justify-between hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-xs font-bold text-[#8A5B21] w-14">
                        第 {idx + 1} 注
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.reds.map((r, i) => (
                          <span
                            key={i}
                            className="w-7 h-7 rounded-full bg-[#d93829] text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs"
                          >
                            {formatBall(r)}
                          </span>
                        ))}
                        {s.blues.map((b, i) => (
                          <span
                            key={i}
                            className="w-7 h-7 rounded-full bg-[#1a68b5] text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs"
                          >
                            {formatBall(b)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyNumbers(s.reds, s.blues)}
                      className="text-xs text-[#6d8980] hover:text-[#176f63] font-serif p-1"
                    >
                      复制
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 理性购彩公约警示 */}
          <div className="p-4 rounded-2xl bg-[#c58a28]/10 border border-[#c58a28]/30 flex items-start gap-3 text-xs text-[#78592c] font-serif">
            <span className="text-base shrink-0">🍀</span>
            <div className="space-y-1">
              <span className="font-bold font-serif-sc block text-[#8A5B21]">
                公益福彩与体彩 · 理性购彩公约
              </span>
              <p className="leading-relaxed">
                彩票开奖系国家公益随机摇奖，本功能融汇周易数理与传统干支，仅供民俗文化探讨、生活灵感启迪与娱乐参考，绝无保证中奖之效。请保持平和心态，量力而行，理性购彩。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
