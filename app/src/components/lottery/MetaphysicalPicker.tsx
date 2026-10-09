/* ============================================================
   玄机 · 周易玄学互动起卦选号引擎 (MetaphysicalPicker)
   - 彻底告别被动等待随机！加入强参与感与仪式感
   - 模式一：三枚铜钱·六爻纳甲摇卦 (用户亲手抛掷 6 次铜钱逐爻建卦)
   - 模式二：邵康节梅花易数·心念自主报数起卦 (用户自主输入灵感数字)
   - 模式三：紫微星垣·心念摇签筒 (交互式摇晃竹签筒求签)
   - 原生 Web Audio API 合成金石铜钱撞击与竹签咔嗒音效
   ============================================================ */

import { useState, useMemo, useEffect } from 'react'
import type { LotteryType } from './lottery-data'
import { LOTTERY_CONFIGS } from './lottery-data'
import type { MetaphysicalResult } from './metaphysical-engine'
import {
  generateFromCoinToss,
  generateFromMindNumbers,
  generateFromBambooSlip,
} from './metaphysical-engine'

// 音效合成辅助 (Web Audio API 原生无依赖)
function playCoinSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1760, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(720, audioCtx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.24)
  } catch {
    // 忽略音频环境受限
  }
}

function playBambooSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(360, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.09)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.11)
  } catch {
    // 忽略音频环境受限
  }
}

type DivinationMode = 'coins' | 'meihua' | 'bamboo'

// 爻位名称与传统含义
const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export function MetaphysicalPicker() {
  const [lotteryType, setLotteryType] = useState<LotteryType>('pl5')
  const [mode, setMode] = useState<DivinationMode>('coins')

  // -------------------------------------------------------------
  // 模式一：三枚铜钱六爻状态
  // -------------------------------------------------------------
  // 每爻点数：6(老阴), 7(少阳), 8(少阴), 9(老阳)
  const [tossedYaos, setTossedYaos] = useState<number[]>([])
  // 当前 3 枚铜钱状态：true=字(正面/阳), false=背(背面/阴)
  const [coinsFacing, setCoinsFacing] = useState<[boolean, boolean, boolean]>([true, false, true])
  const [isCoinFlipping, setIsCoinFlipping] = useState(false)

  // -------------------------------------------------------------
  // 模式二：梅花易数心念报数状态
  // -------------------------------------------------------------
  const [mindNum1, setMindNum1] = useState('168')
  const [mindNum2, setMindNum2] = useState('888')
  const currentHourZhi = useMemo(() => {
    const h = new Date().getHours()
    return Math.floor((h + 1) / 2) % 12 || 12
  }, [])
  const [selectedHour, setSelectedHour] = useState(currentHourZhi)

  // -------------------------------------------------------------
  // 模式三：紫微摇签筒状态
  // -------------------------------------------------------------
  const [shakeCount, setShakeCount] = useState(0)
  const [isCanisterShaking, setIsCanisterShaking] = useState(false)
  const [drawnSlipNumber, setDrawnSlipNumber] = useState<number | null>(null)

  // 最终起卦选号结果
  const [result, setResult] = useState<MetaphysicalResult | null>(null)
  const [copied, setCopied] = useState(false)

  const cfg = LOTTERY_CONFIGS[lotteryType]
  const isDigitType = cfg.isPositionDigits
  const formatBall = (n: number) => (isDigitType ? n.toString() : n.toString().padStart(2, '0'))

  // 初始化首次铜钱卦象结果 (预设示例)
  useEffect(() => {
    if (!result) {
      const initialYaos = [7, 8, 9, 7, 8, 7]
      setTossedYaos(initialYaos)
      setResult(generateFromCoinToss(lotteryType, initialYaos))
    }
  }, [lotteryType, result])

  // -------------------------------------------------------------
  // 铜钱抛掷逻辑
  // -------------------------------------------------------------
  const handleTossCoin = () => {
    if (isCoinFlipping) return
    setIsCoinFlipping(true)
    playCoinSound()

    // 随机掷出 3 枚铜钱的正反面
    const c1 = Math.random() > 0.5
    const c2 = Math.random() > 0.5
    const c3 = Math.random() > 0.5

    setTimeout(() => {
      setCoinsFacing([c1, c2, c3])

      // 纳甲规则：
      // 背为阴(2), 字为阳(3)
      // 3字=9(老阳), 2字1背=8(少阴), 1字2背=7(少阳), 3背=6(老阴)
      const frontCount = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0)
      let yaoScore = 7
      if (frontCount === 3) yaoScore = 9 // 三阳老阳
      else if (frontCount === 2) yaoScore = 8 // 二阳一阴少阴
      else if (frontCount === 1) yaoScore = 7 // 一阳二阴少阳
      else yaoScore = 6 // 三阴老阴

      const nextYaos = tossedYaos.length >= 6 ? [yaoScore] : [...tossedYaos, yaoScore]
      setTossedYaos(nextYaos)
      setIsCoinFlipping(false)

      // 掷满6爻，触发定卦
      if (nextYaos.length === 6) {
        const res = generateFromCoinToss(lotteryType, nextYaos)
        setResult(res)
      }
    }, 550)
  }

  // 一键掷满后续爻位
  const handleFastForwardToss = () => {
    let current = [...tossedYaos]
    if (current.length >= 6) current = []
    while (current.length < 6) {
      const r = Math.random()
      const score = r < 0.25 ? 6 : r < 0.5 ? 7 : r < 0.75 ? 8 : 9
      current.push(score)
    }
    setTossedYaos(current)
    playCoinSound()
    const res = generateFromCoinToss(lotteryType, current)
    setResult(res)
  }

  // 重新开始摇卦
  const handleResetToss = () => {
    setTossedYaos([])
    setResult(null)
  }

  // -------------------------------------------------------------
  // 梅花易数报数起卦
  // -------------------------------------------------------------
  const handleDivinateMeihua = () => {
    const n1 = parseInt(mindNum1, 10) || 168
    const n2 = parseInt(mindNum2, 10) || 888
    playBambooSound()
    const res = generateFromMindNumbers(lotteryType, n1, n2, selectedHour)
    setResult(res)
  }

  // -------------------------------------------------------------
  // 紫微签筒摇签
  // -------------------------------------------------------------
  const handleShakeBamboo = () => {
    if (isCanisterShaking) return
    setIsCanisterShaking(true)
    playBambooSound()

    const nextCount = shakeCount + 1
    setShakeCount(nextCount)

    setTimeout(() => {
      setIsCanisterShaking(false)
      if (nextCount >= 3) {
        // 摇出签
        const slip = Math.floor(Math.random() * 64) + 1
        setDrawnSlipNumber(slip)
        const res = generateFromBambooSlip(lotteryType, slip)
        setResult(res)
        setShakeCount(0)
      }
    }, 450)
  }

  // 复制号码
  const handleCopyNumbers = (reds: number[], blues: number[]) => {
    const redStr = reds.map(formatBall).join(' ')
    const blueStr = blues.length > 0 ? ` + 蓝球: ${blues.map(formatBall).join(' ')}` : ''
    const text = `【玄机 · ${cfg.name} 易数吉签】\n号码: ${redStr}${blueStr}\n卦象: ${result?.title}\n迎财吉方: ${result?.favorableDirection} | 吉时: ${result?.auspiciousHours}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 复制5注
  const handleCopyAllSets = () => {
    if (!result?.multipleSets) return
    const lines = result.multipleSets.map((s, idx) => {
      const bStr = s.blues.length > 0 ? ` | ${s.blues.map(formatBall).join(' ')}` : ''
      return `第${idx + 1}注: ${s.reds.map(formatBall).join(' ')}${bStr}`
    })
    const text = `【玄机 · ${cfg.name} 5注周易吉数组合】\n${lines.join('\n')}\n❖ 吉方: ${result.favorableDirection}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 顶部主配置与彩种切换 */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#dcd3c1]/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="xuanji-seal text-xs">六爻纳甲</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
                周易互动起卦选号 · 亲手感应定数
              </h2>
            </div>
            <p className="text-xs text-[#6d8980] mt-1 font-serif">
              “至诚之道，可以先知”。绝非盲盒随机，由您亲手掷铜钱、报灵数、摇签筒，因果相生。
            </p>
          </div>

          {/* 彩种选择切换 */}
          <div className="flex flex-wrap gap-2">
            {(['pl5', 'pl3', 'ssq', 'dlt', 'fc3d'] as LotteryType[]).map((key) => {
              const item = LOTTERY_CONFIGS[key]
              const isSelected = lotteryType === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setLotteryType(key)
                    setResult(null)
                    setTossedYaos([])
                  }}
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

        {/* 三大交互起卦模式导航切换 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          <button
            onClick={() => setMode('coins')}
            className={`
              p-4 rounded-2xl text-left border transition-all duration-200
              ${mode === 'coins'
                ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🪙</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                mode === 'coins' ? 'bg-[#176f63] text-white font-bold' : 'bg-[#c58a28]/15 text-[#8A5B21]'
              }`}>
                亲手抛掷 6 次
              </span>
            </div>
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              三枚铜钱 · 六爻纳甲抛卦
            </h3>
            <p className="text-xs text-[#52666a] mt-1 font-serif line-clamp-2">
              乾隆通宝三币翻转，由初爻至上爻逐爻叠起本卦与变卦，仪式感拉满。
            </p>
          </button>

          <button
            onClick={() => setMode('meihua')}
            className={`
              p-4 rounded-2xl text-left border transition-all duration-200
              ${mode === 'meihua'
                ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🌸</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                mode === 'meihua' ? 'bg-[#176f63] text-white font-bold' : 'bg-[#c58a28]/15 text-[#8A5B21]'
              }`}>
                自主输入灵数
              </span>
            </div>
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              梅花易数 · 心念报数起卦
            </h3>
            <p className="text-xs text-[#52666a] mt-1 font-serif line-clamp-2">
              输入您的当下灵感数字（生日、车牌、心跳），按邵康节体用法则严密除八求卦。
            </p>
          </button>

          <button
            onClick={() => setMode('bamboo')}
            className={`
              p-4 rounded-2xl text-left border transition-all duration-200
              ${mode === 'bamboo'
                ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🎋</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                mode === 'bamboo' ? 'bg-[#176f63] text-white font-bold' : 'bg-[#c58a28]/15 text-[#8A5B21]'
              }`}>
                晃动签筒摇签
              </span>
            </div>
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              紫微灵签 · 摇晃签筒求字
            </h3>
            <p className="text-xs text-[#52666a] mt-1 font-serif line-clamp-2">
              交互式摇晃竹签筒，伴随清脆竹木声响，求得紫微星曜大吉神签。
            </p>
          </button>
        </div>

        {/* -------------------------------------------------------------
            交互操作区：模式一 (三枚铜钱六爻掷卦台)
           ------------------------------------------------------------- */}
        {mode === 'coins' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#faf6ee] border border-[#dcd3c1] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dcd3c1]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                  ❖ 铜钱爻台进度：
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63]">
                  {tossedYaos.length < 6 ? `正在摇掷第 ${tossedYaos.length + 1} 爻 (${YAO_NAMES[tossedYaos.length]})` : '六爻已全 · 卦象定盘'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {tossedYaos.length < 6 ? (
                  <button
                    onClick={handleFastForwardToss}
                    className="text-[#176f63] hover:underline font-serif"
                  >
                    一键摇满后续爻位 ⚡️
                  </button>
                ) : (
                  <button
                    onClick={handleResetToss}
                    className="text-[#8A5B21] hover:underline font-serif"
                  >
                    ↺ 重新摇卦
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* 左侧：3枚立体乾隆通宝铜钱展示与动画 */}
              <div className="md:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 border border-[#dcd3c1]/80 shadow-2xs">
                <div className="text-xs font-serif text-[#879397] mb-4">
                  {isCoinFlipping ? '铜钱在龟甲中急速翻转...' : '三枚铜钱静卧于檀木盘中 (点击下方按钮掷出)'}
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-6 py-3">
                  {coinsFacing.map((isFront, i) => (
                    <div
                      key={i}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#c58a28] shadow-md flex items-center justify-center select-none transition-transform duration-500
                        ${isCoinFlipping ? 'animate-spin scale-110' : 'hover:scale-105'}
                        ${isFront
                          ? 'bg-gradient-to-br from-[#d4a046] via-[#b88628] to-[#8f6314] text-[#fff8ea]'
                          : 'bg-gradient-to-br from-[#8a6828] via-[#6d4f18] to-[#4e360f] text-[#ecd8b0]'
                        }
                      `}
                    >
                      {/* 铜钱内方孔与铭文 */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border border-[#f5dfaa]/50 bg-[#1e2f34]/80 rounded-xs flex items-center justify-center shadow-inner">
                          <span className="text-[8px] font-mono text-[#f5dfaa]/40">孔</span>
                        </div>
                        <span className="absolute top-1 text-[10px] sm:text-xs font-serif font-black">
                          {isFront ? '乾' : '宝'}
                        </span>
                        <span className="absolute bottom-1 text-[10px] sm:text-xs font-serif font-black">
                          {isFront ? '隆' : '泉'}
                        </span>
                        <span className="absolute left-1 text-[10px] sm:text-xs font-serif font-black">
                          {isFront ? '通' : '滿'}
                        </span>
                        <span className="absolute right-1 text-[10px] sm:text-xs font-serif font-black">
                          {isFront ? '宝' : '文'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 铜钱落定面相解说 */}
                <div className="mt-4 text-xs font-serif text-center text-[#52666a]">
                  当前落地：
                  <span className="font-bold text-[#8A5B21]">
                    {coinsFacing.filter(Boolean).length} 个字面(阳) ｜ {coinsFacing.filter((f) => !f).length} 个背纹(阴)
                  </span>
                </div>

                {/* 抛掷按钮 */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleTossCoin}
                    disabled={isCoinFlipping}
                    className="btn-xuanji px-6 py-2.5 rounded-full text-xs font-bold font-serif-sc shadow-md flex items-center gap-2"
                  >
                    <span>🪙</span>
                    <span>
                      {tossedYaos.length < 6
                        ? `摇掷第 ${tossedYaos.length + 1} 爻 (${YAO_NAMES[tossedYaos.length]})`
                        : '六爻已满 · 再次起卦'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 右侧：六爻卦象从初爻自底向上点亮展示台 */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-white border border-[#dcd3c1] shadow-2xs space-y-2">
                <div className="text-center font-serif-sc font-bold text-xs text-[#24453f] pb-2 border-b border-[#dcd3c1]/60">
                  周易卦柱 (从下到上生成)
                </div>

                <div className="flex flex-col-reverse gap-1.5 py-1">
                  {[0, 1, 2, 3, 4, 5].map((yaoIdx) => {
                    const score = tossedYaos[yaoIdx]
                    const hasValue = score !== undefined
                    const isYang = score === 7 || score === 9
                    const isMoving = score === 6 || score === 9

                    return (
                      <div
                        key={yaoIdx}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          hasValue
                            ? isMoving
                              ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                              : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-16">
                          <span className="font-serif-sc">{YAO_NAMES[yaoIdx]}</span>
                          {yaoIdx === 2 && <span className="text-[9px] text-[#879397]">[下卦]</span>}
                          {yaoIdx === 5 && <span className="text-[9px] text-[#879397]">[上卦]</span>}
                        </div>

                        {/* 爻形符号 */}
                        <div className="flex-1 flex items-center justify-center font-mono">
                          {hasValue ? (
                            isYang ? (
                              <div className="flex items-center gap-1">
                                <span className="h-2 w-16 bg-[#176f63] rounded-xs inline-block" />
                                {isMoving && <span className="text-[10px] text-red-600 font-bold">○ 变</span>}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="h-2 w-7 bg-[#8A5B21] rounded-xs inline-block" />
                                <span className="w-2 inline-block" />
                                <span className="h-2 w-7 bg-[#8A5B21] rounded-xs inline-block" />
                                {isMoving && <span className="text-[10px] text-red-600 font-bold">× 变</span>}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-300">待摇掷...</span>
                          )}
                        </div>

                        <div className="w-12 text-right font-mono text-[11px]">
                          {hasValue ? (
                            <span>
                              点数 <strong>{score}</strong>
                            </span>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            交互操作区：模式二 (梅花易数心念自主报数)
           ------------------------------------------------------------- */}
        {mode === 'meihua' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#faf6ee] border border-[#dcd3c1] space-y-4">
            <div className="text-xs text-[#52666a] font-serif leading-relaxed">
              邵康节先生云：“动静有常，因数生卦”。您可以输入此刻脑海中浮现的任意灵感数字（例如手机后四位、生日、心跳次数），由易理公式推求上卦、下卦与动爻。
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-serif-sc font-bold text-[#24453f] mb-1">
                  上卦灵感数（天数）
                </label>
                <input
                  type="number"
                  value={mindNum1}
                  onChange={(e) => setMindNum1(e.target.value)}
                  placeholder="如 168"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#dcd3c1] font-mono text-sm focus:outline-none focus:border-[#176f63]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-sc font-bold text-[#24453f] mb-1">
                  下卦灵感数（地数）
                </label>
                <input
                  type="number"
                  value={mindNum2}
                  onChange={(e) => setMindNum2(e.target.value)}
                  placeholder="如 888"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#dcd3c1] font-mono text-sm focus:outline-none focus:border-[#176f63]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-sc font-bold text-[#24453f] mb-1">
                  当下取值时辰（人数）
                </label>
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#dcd3c1] font-serif text-sm focus:outline-none focus:border-[#176f63]"
                >
                  <option value={1}>子时 (23:00-01:00)</option>
                  <option value={2}>丑时 (01:00-03:00)</option>
                  <option value={3}>寅时 (03:00-05:00)</option>
                  <option value={4}>卯时 (05:00-07:00)</option>
                  <option value={5}>辰时 (07:00-09:00)</option>
                  <option value={6}>巳时 (09:00-11:00)</option>
                  <option value={7}>午时 (11:00-13:00)</option>
                  <option value={8}>未时 (13:00-15:00)</option>
                  <option value={9}>申时 (15:00-17:00)</option>
                  <option value={10}>酉时 (17:00-19:00)</option>
                  <option value={11}>戌时 (19:00-21:00)</option>
                  <option value={12}>亥时 (21:00-23:00)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleDivinateMeihua}
                className="btn-xuanji px-8 py-2.5 rounded-full text-xs font-bold font-serif-sc shadow-md flex items-center justify-center gap-2 mx-auto"
              >
                <span>⚡️</span>
                <span>依数启卦 · 推演梅花易数吉码</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            交互操作区：模式三 (紫微竹签筒摇签)
           ------------------------------------------------------------- */}
        {mode === 'bamboo' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#faf6ee] border border-[#dcd3c1] text-center space-y-4">
            <div className="text-xs text-[#52666a] font-serif">
              轻按下方摇签按钮，连续晃动签筒 3 次，感应紫微财帛星曜照临，摇出一支特等灵签。
            </div>

            <div className="py-2 flex flex-col items-center justify-center">
              {/* 竹签筒示意图标与动画 */}
              <div
                className={`
                  w-20 h-28 rounded-b-2xl rounded-t-lg bg-gradient-to-b from-[#b88628] to-[#6d4f18] border-2 border-[#f5dfaa]/50 shadow-lg flex flex-col items-center justify-end p-2 relative transition-transform
                  ${isCanisterShaking ? 'animate-bounce -rotate-6' : ''}
                `}
              >
                {/* 签筒内的竹签 */}
                <div className="absolute -top-6 flex items-end justify-center gap-1">
                  <span className="w-1.5 h-10 bg-[#f4eddf] border border-[#c58a28] rounded-t-xs" />
                  <span className="w-1.5 h-12 bg-[#d93829] border border-[#c58a28] rounded-t-xs" />
                  <span className="w-1.5 h-9 bg-[#f4eddf] border border-[#c58a28] rounded-t-xs" />
                </div>
                <span className="font-serif-sc font-bold text-white text-xs tracking-widest writing-vertical">
                  紫微灵签
                </span>
              </div>

              <div className="mt-4 text-xs font-mono text-[#8A5B21]">
                摇动契合度：
                <span className="font-bold">
                  {shakeCount === 0
                    ? drawnSlipNumber
                      ? `已摇出第 ${drawnSlipNumber} 签！可继续摇取新签`
                      : '尚未摇动'
                    : shakeCount === 1
                    ? '第一次摇动...'
                    : shakeCount === 2
                    ? '竹签已松动...'
                    : '灵签出匣！'}
                </span>
              </div>
            </div>

            <button
              onClick={handleShakeBamboo}
              disabled={isCanisterShaking}
              className="btn-xuanji px-8 py-2.5 rounded-full text-xs font-bold font-serif-sc shadow-md mx-auto"
            >
              🎋 摇动签筒 ({shakeCount}/3)
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          易数选号最终结果看板
         ------------------------------------------------------------- */}
      {result && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* 卦象与灵签卡片 */}
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
                  <span className="text-[#879397] block text-[10px]">吉利投注时辰</span>
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

          {/* 重点第一注 (主签号码) */}
          <div className="p-6 rounded-2xl bg-white border border-[#dcd3c1] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dcd3c1]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d93829]" />
                <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
                  本命灵签主选号码 · 易数定夺
                </h3>
              </div>
              <button
                onClick={() => handleCopyNumbers(result.redPicks, result.bluePicks)}
                className="px-3.5 py-1.5 rounded-xl bg-[#176f63]/10 text-[#176f63] hover:bg-[#176f63] hover:text-white font-serif-sc font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>{copied ? '✓ 已复制号码' : '📋 复制此注号码'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 flex-wrap">
              {result.redPicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#f25c4e] to-[#d93829] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{ animationDelay: `${idx * 100}ms`, animationIterationCount: 1 }}
                >
                  {formatBall(ball)}
                </div>
              ))}
              {result.bluePicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#3b87d9] to-[#1a68b5] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{
                    animationDelay: `${(result.redPicks.length + idx) * 100}ms`,
                    animationIterationCount: 1,
                  }}
                >
                  {formatBall(ball)}
                </div>
              ))}
            </div>
          </div>

          {/* 严谨推导过程卡片 (数理推演步骤，杜绝黑盒) */}
          {result.derivationSteps && result.derivationSteps.length > 0 && (
            <div className="p-4 rounded-xl bg-[#176f63]/5 border border-[#176f63]/20 space-y-2 text-xs font-serif">
              <span className="font-bold font-serif-sc text-[#176f63] flex items-center gap-1.5">
                <span>📜</span>
                <span>六爻纳甲与卦象数理推导步骤（拒绝随机）：</span>
              </span>
              <ul className="space-y-1 text-[#52666a] list-disc list-inside leading-relaxed">
                {result.derivationSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 5注五行合局倍投清单 */}
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

          {/* 公益购彩公约提示 */}
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
