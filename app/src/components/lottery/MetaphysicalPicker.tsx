/* ============================================================
   玄机 · 周易玄学互动起卦选号引擎 (MetaphysicalPicker)
   - 彻底告别被动等待随机！加入强参与感与至诚仪式感
   - 模式一：三枚铜钱·六爻纳甲摇卦 (八卦锦缎卦垫 + 3D乾隆通宝凌空抛掷落布动画)
   - 模式二：邵康节梅花易数·心念自主报数起卦 (天数/地数/人数严密除八起卦)
   - 模式三：紫微星垣·心念摇签筒 (紫竹签筒摇晃 + 灵签破鞘腾空金光拔起)
   - 原生 Web Audio API 物理合成高保真铜钱空中相撞、落布沉闷阻尼、竹签咔嗒与道磬神鸣
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

// =============================================================
// 原生 Web Audio API 物理级音效合成引擎 (零第三方依赖，零资源加载延迟)
// =============================================================
class MetaphysicalAudioEngine {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return this.ctx
    } catch {
      return null
    }
  }

  /**
   * 1. 铜钱凌空起掷金属撞击脆鸣 (双枚古铜币在空中相碰清脆泛音)
   */
  playCoinToss() {
    const ctx = this.getContext()
    if (!ctx) return
    const t = ctx.currentTime

    // 主音: 2150Hz 纯正铜金属泛音
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(2150, t)
    osc1.frequency.exponentialRampToValueAtTime(1420, t + 0.16)
    gain1.gain.setValueAtTime(0.3, t)
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(t)
    osc1.stop(t + 0.2)

    // 副音: 2880Hz 错开 20ms 模拟多币连续擦碰
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(2880, t + 0.02)
    osc2.frequency.exponentialRampToValueAtTime(1750, t + 0.18)
    gain2.gain.setValueAtTime(0.2, t + 0.02)
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(t + 0.02)
    osc2.stop(t + 0.22)
  }

  /**
   * 2. 铜钱接触八卦锦缎布面的柔软阻尼落地声 (噗嗒柔和吸能)
   */
  playClothLand() {
    const ctx = this.getContext()
    if (!ctx) return
    const t = ctx.currentTime

    // 低频绒布撞击声 (130Hz -> 50Hz)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(130, t)
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.09)
    gain.gain.setValueAtTime(0.26, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.11)

    // 金属压实织物时的轻微泛音
    const oscSoft = ctx.createOscillator()
    const gainSoft = ctx.createGain()
    oscSoft.type = 'triangle'
    oscSoft.frequency.setValueAtTime(740, t)
    oscSoft.frequency.exponentialRampToValueAtTime(260, t + 0.05)
    gainSoft.gain.setValueAtTime(0.1, t)
    gainSoft.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    oscSoft.connect(gainSoft)
    gainSoft.connect(ctx.destination)
    oscSoft.start(t)
    oscSoft.stop(t + 0.07)
  }

  /**
   * 3. 摇晃紫竹签筒时竹签交错碰撞声 (连续多重咔嗒竹木共鸣)
   */
  playBambooRattle() {
    const ctx = this.getContext()
    if (!ctx) return
    const t = ctx.currentTime

    const freqs = [540, 660, 480, 720]
    freqs.forEach((freq, idx) => {
      const offset = idx * 0.038
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, t + offset)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + offset + 0.05)
      gain.gain.setValueAtTime(0.22, t + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + offset)
      osc.stop(t + offset + 0.07)
    })
  }

  /**
   * 4. 灵签破鞘跃出大吉神鸣 (破鞘风声 + 仙家金磬余韵)
   */
  playSacredEmerge() {
    const ctx = this.getContext()
    if (!ctx) return
    const t = ctx.currentTime

    // 破鞘风声
    const oscRise = ctx.createOscillator()
    const gainRise = ctx.createGain()
    oscRise.type = 'sine'
    oscRise.frequency.setValueAtTime(380, t)
    oscRise.frequency.exponentialRampToValueAtTime(1080, t + 0.3)
    gainRise.gain.setValueAtTime(0.24, t)
    gainRise.gain.exponentialRampToValueAtTime(0.01, t + 0.32)
    oscRise.connect(gainRise)
    gainRise.connect(ctx.destination)
    oscRise.start(t)
    oscRise.stop(t + 0.35)

    // 道门铜磬悠扬谐音 (1046Hz, 1568Hz)
    const oscChime = ctx.createOscillator()
    const gainChime = ctx.createGain()
    oscChime.type = 'sine'
    oscChime.frequency.setValueAtTime(1046, t + 0.12)
    gainChime.gain.setValueAtTime(0.32, t + 0.12)
    gainChime.gain.exponentialRampToValueAtTime(0.001, t + 0.85)
    oscChime.connect(gainChime)
    gainChime.connect(ctx.destination)
    oscChime.start(t + 0.12)
    oscChime.stop(t + 0.9)
  }
}

const audio = new MetaphysicalAudioEngine()

type DivinationMode = 'coins' | 'meihua' | 'bamboo'

// 爻位名称与传统含义
const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

// =============================================================
// 高保真 3D 乾隆通宝古铜币拟真组件 (QianlongCoin)
// =============================================================
interface CoinProps {
  index: number
  isFront: boolean // true=字面(阳), false=背满文(阴)
  isTossing: boolean
  restingAngle: number
  restingOffsetX: number
  restingOffsetY: number
}

function QianlongCoin({
  index,
  isFront,
  isTossing,
  restingAngle,
  restingOffsetX,
  restingOffsetY,
}: CoinProps) {
  // 根据不同币选择不同的投掷轨迹类
  const tossAnimationClass =
    index === 0
      ? 'animate-[coin-toss-arc-1_0.9s_cubic-bezier(0.25,1,0.5,1)_forwards]'
      : index === 1
      ? 'animate-[coin-toss-arc-2_0.92s_cubic-bezier(0.25,1,0.5,1)_forwards]'
      : 'animate-[coin-toss-arc-3_0.88s_cubic-bezier(0.25,1,0.5,1)_forwards]'

  return (
    <div
      className="relative select-none"
      style={{
        transform: isTossing
          ? undefined
          : `translate3d(${restingOffsetX}px, ${restingOffsetY}px, 0px) rotate(${restingAngle}deg)`,
        transition: isTossing
          ? 'none'
          : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* 锦缎布面接触柔和阴影 */}
      <div
        className={`absolute inset-x-2 -bottom-2 h-4 rounded-full bg-black/60 blur-xs transition-opacity duration-300 pointer-events-none ${
          isTossing ? 'opacity-20 scale-75' : 'opacity-80 scale-100'
        }`}
      />

      {/* 3D 铜币翻转容器 */}
      <div
        className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full [perspective:1000px] [transform-style:preserve-3d] ${
          isTossing ? tossAnimationClass : ''
        }`}
      >
        <div
          className="w-full h-full rounded-full [transform-style:preserve-3d] transition-transform duration-700"
          style={{
            transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          {/* ===================== 正面：乾隆通宝 (阳) ===================== */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[#54380b] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,235,170,0.6)] flex items-center justify-center [backface-visibility:hidden]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #f7dc99 0%, #d4a348 35%, #a17424 75%, #6a4911 100%)',
            }}
          >
            {/* 铜钱外郭圈 (Double Rim) */}
            <div className="absolute inset-1 rounded-full border border-[#fceecc]/50 pointer-events-none" />
            <div className="absolute inset-1.5 rounded-full border border-[#482e07]/60 pointer-events-none" />

            {/* 内方穿孔 (Square Hole) */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-[#0c1815] rounded-[1px] border border-[#fceecc]/60 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.9),0_0_0_1px_#482e07] flex items-center justify-center z-10" />

            {/* 乾隆通宝四字楷书 (上乾、下隆、右通、左宝) */}
            <span
              className="absolute top-1 text-[11px] sm:text-xs font-serif-sc font-black text-[#382105] drop-shadow-[0_1px_0_rgba(255,235,180,0.8)]"
              style={{ letterSpacing: '0.05em' }}
            >
              乾
            </span>
            <span
              className="absolute bottom-1 text-[11px] sm:text-xs font-serif-sc font-black text-[#382105] drop-shadow-[0_1px_0_rgba(255,235,180,0.8)]"
              style={{ letterSpacing: '0.05em' }}
            >
              隆
            </span>
            <span
              className="absolute right-1 text-[11px] sm:text-xs font-serif-sc font-black text-[#382105] drop-shadow-[0_1px_0_rgba(255,235,180,0.8)]"
              style={{ letterSpacing: '0.05em' }}
            >
              通
            </span>
            <span
              className="absolute left-1 text-[11px] sm:text-xs font-serif-sc font-black text-[#382105] drop-shadow-[0_1px_0_rgba(255,235,180,0.8)]"
              style={{ letterSpacing: '0.05em' }}
            >
              宝
            </span>
          </div>

          {/* ===================== 背面：满文宝泉局 (阴) ===================== */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[#3d2706] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,235,170,0.4)] flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #b88b39 0%, #87601f 40%, #593f11 80%, #3a2608 100%)',
            }}
          >
            {/* 铜钱外郭圈 */}
            <div className="absolute inset-1 rounded-full border border-[#fceecc]/30 pointer-events-none" />
            <div className="absolute inset-1.5 rounded-full border border-[#2b1803]/80 pointer-events-none" />

            {/* 内方穿孔 */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-[#0c1815] rounded-[1px] border border-[#fceecc]/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.9),0_0_0_1px_#2b1803] flex items-center justify-center z-10" />

            {/* 满文宝泉铭文 (左宝 ᠪᠣᠣ / 右泉 ᠴᡳᠣᡠᠠᠨ) */}
            <div className="absolute left-1.5 flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-serif font-black text-[#261503] drop-shadow-[0_1px_0_rgba(230,195,130,0.5)]">
                ᠪᠣᠣ
              </span>
              <span className="text-[7px] text-[#261503]/70 font-mono scale-75 -mt-1">
                (宝)
              </span>
            </div>
            <div className="absolute right-1.5 flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-serif font-black text-[#261503] drop-shadow-[0_1px_0_rgba(230,195,130,0.5)]">
                ᠴᡳᠣᡠᠠᠨ
              </span>
              <span className="text-[7px] text-[#261503]/70 font-mono scale-75 -mt-1">
                (泉)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================
// 主组件：周易玄学互动起卦选号引擎 (MetaphysicalPicker)
// =============================================================
export function MetaphysicalPicker() {
  const [lotteryType, setLotteryType] = useState<LotteryType>('pl5')
  const [mode, setMode] = useState<DivinationMode>('coins')

  // -------------------------------------------------------------
  // 模式一：三枚铜钱六爻状态
  // -------------------------------------------------------------
  const [tossedYaos, setTossedYaos] = useState<number[]>([])
  const [coinsFacing, setCoinsFacing] = useState<[boolean, boolean, boolean]>([
    true,
    false,
    true,
  ])
  const [isCoinFlipping, setIsCoinFlipping] = useState(false)
  const [clothRipple, setClothRipple] = useState(false)

  // 铜钱在布面上拟真停靠角度与微位移 (散落物理效果)
  const [coinRestingAngles, setCoinRestingAngles] = useState<[number, number, number]>([
    -14, 22, -6,
  ])
  const [coinOffsets, setCoinOffsets] = useState<
    [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }]
  >([
    { x: -5, y: 4 },
    { x: 2, y: -6 },
    { x: 6, y: 5 },
  ])

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
  const [isSlipEmerged, setIsSlipEmerged] = useState(false)
  const [drawnSlipNumber, setDrawnSlipNumber] = useState<number | null>(null)

  // 最终起卦选号结果
  const [result, setResult] = useState<MetaphysicalResult | null>(null)
  const [copied, setCopied] = useState(false)

  const cfg = LOTTERY_CONFIGS[lotteryType]
  const isDigitType = cfg.isPositionDigits
  const formatBall = (n: number) =>
    isDigitType ? n.toString() : n.toString().padStart(2, '0')

  // 初始化首次铜钱卦象结果 (预设示例)
  useEffect(() => {
    if (!result) {
      const initialYaos = [7, 8, 9, 7, 8, 7]
      setTossedYaos(initialYaos)
      setResult(generateFromCoinToss(lotteryType, initialYaos))
    }
  }, [lotteryType, result])

  // -------------------------------------------------------------
  // 铜钱拟真抛掷逻辑 (触布物理反馈 + 真实声效)
  // -------------------------------------------------------------
  const handleTossCoin = () => {
    if (isCoinFlipping) return
    setIsCoinFlipping(true)
    setClothRipple(true)

    // 凌空起掷清脆撞击声
    audio.playCoinToss()

    // 生成随机的正反面
    const c1 = Math.random() > 0.5
    const c2 = Math.random() > 0.5
    const c3 = Math.random() > 0.5

    // 计算布面上自然的随机停留倾斜角度 (-22° ~ +22°)
    const angle1 = Math.round(-18 + Math.random() * 12)
    const angle2 = Math.round(10 + Math.random() * 16)
    const angle3 = Math.round(-12 + Math.random() * 20)

    // 计算落布自然微散落偏移
    const off1 = { x: Math.round(-10 + Math.random() * 12), y: Math.round(-6 + Math.random() * 14) }
    const off2 = { x: Math.round(-6 + Math.random() * 12), y: Math.round(-12 + Math.random() * 10) }
    const off3 = { x: Math.round(4 + Math.random() * 12), y: Math.round(-4 + Math.random() * 14) }

    // 在 750ms 时播放接触柔软织物的阻尼落布声
    setTimeout(() => {
      audio.playClothLand()
    }, 720)

    // 880ms 完成落定
    setTimeout(() => {
      setCoinsFacing([c1, c2, c3])
      setCoinRestingAngles([angle1, angle2, angle3])
      setCoinOffsets([off1, off2, off3])

      // 纳甲易数规则：
      // 背为阴(2), 字为阳(3)
      // 3字=9(老阳·动爻), 2字1背=8(少阴), 1字2背=7(少阳), 3背=6(老阴·动爻)
      const frontCount = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0)
      let yaoScore = 7
      if (frontCount === 3) yaoScore = 9
      else if (frontCount === 2) yaoScore = 8
      else if (frontCount === 1) yaoScore = 7
      else yaoScore = 6

      const nextYaos =
        tossedYaos.length >= 6 ? [yaoScore] : [...tossedYaos, yaoScore]
      setTossedYaos(nextYaos)
      setIsCoinFlipping(false)
      setClothRipple(false)

      // 掷满 6 爻，自动成卦
      if (nextYaos.length === 6) {
        const res = generateFromCoinToss(lotteryType, nextYaos)
        setResult(res)
      }
    }, 880)
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
    audio.playCoinToss()
    setTimeout(() => audio.playClothLand(), 200)
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
    audio.playBambooRattle()
    const res = generateFromMindNumbers(lotteryType, n1, n2, selectedHour)
    setResult(res)
  }

  // -------------------------------------------------------------
  // 紫微签筒拟真摇签与破鞘出签
  // -------------------------------------------------------------
  const handleShakeBamboo = () => {
    if (isCanisterShaking) return
    setIsCanisterShaking(true)
    setIsSlipEmerged(false)
    audio.playBambooRattle()

    const nextCount = shakeCount + 1
    setShakeCount(nextCount)

    setTimeout(() => {
      setIsCanisterShaking(false)

      // 第 3 次摇动，灵签破鞘跃出
      if (nextCount >= 3) {
        setIsSlipEmerged(true)
        audio.playSacredEmerge()

        const slip = Math.floor(Math.random() * 64) + 1
        setDrawnSlipNumber(slip)
        const res = generateFromBambooSlip(lotteryType, slip)
        setResult(res)
        setShakeCount(0)
      }
    }, 550)
  }

  // 复制号码
  const handleCopyNumbers = (reds: number[], blues: number[]) => {
    const redStr = reds.map(formatBall).join(' ')
    const blueStr =
      blues.length > 0 ? ` + 蓝球: ${blues.map(formatBall).join(' ')}` : ''
    const text = `【玄机 · ${cfg.name} 易数吉签】\n号码: ${redStr}${blueStr}\n卦象: ${result?.title}\n迎财吉方: ${result?.favorableDirection} | 吉时: ${result?.auspiciousHours}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 复制5注
  const handleCopyAllSets = () => {
    if (!result?.multipleSets) return
    const lines = result.multipleSets.map((s, idx) => {
      const bStr =
        s.blues.length > 0 ? ` | ${s.blues.map(formatBall).join(' ')}` : ''
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
                    px-3.5 py-1.5 rounded-xl text-xs font-serif-sc font-bold transition-all cursor-pointer
                    ${
                      isSelected
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
              p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer
              ${
                mode === 'coins'
                  ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                  : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🪙</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  mode === 'coins'
                    ? 'bg-[#176f63] text-white font-bold'
                    : 'bg-[#c58a28]/15 text-[#8A5B21]'
                }`}
              >
                八卦锦垫抛掷 6 次
              </span>
            </div>
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              三枚铜钱 · 六爻纳甲抛卦
            </h3>
            <p className="text-xs text-[#52666a] mt-1 font-serif line-clamp-2">
              金丝刺绣八卦锦缎垫，乾隆通宝凌空3D翻转落布微弹，逐爻建立本卦与变卦。
            </p>
          </button>

          <button
            onClick={() => setMode('meihua')}
            className={`
              p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer
              ${
                mode === 'meihua'
                  ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                  : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🌸</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  mode === 'meihua'
                    ? 'bg-[#176f63] text-white font-bold'
                    : 'bg-[#c58a28]/15 text-[#8A5B21]'
                }`}
              >
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
              p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer
              ${
                mode === 'bamboo'
                  ? 'bg-gradient-to-br from-white to-[#fbf7ee] border-[#176f63] shadow-md -translate-y-0.5'
                  : 'bg-white/70 border-[#dcd3c1] hover:bg-white'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xl">🎋</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  mode === 'bamboo'
                    ? 'bg-[#176f63] text-white font-bold'
                    : 'bg-[#c58a28]/15 text-[#8A5B21]'
                }`}
              >
                晃动签筒出签
              </span>
            </div>
            <h3 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              紫微灵签 · 摇晃签筒求字
            </h3>
            <p className="text-xs text-[#52666a] mt-1 font-serif line-clamp-2">
              紫竹签筒左右摇晃摩擦，三摇灵签破鞘腾空拔起，金光大吉神签。
            </p>
          </button>
        </div>

        {/* -------------------------------------------------------------
            交互操作区：模式一 (三枚铜钱六爻掷卦台 · 八卦金丝刺绣锦缎垫)
           ------------------------------------------------------------- */}
        {mode === 'coins' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#faf6ee] border border-[#dcd3c1] space-y-5">
            {/* 顶栏进度与快捷控制 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dcd3c1]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                  ❖ 铜钱六爻进度：
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/20">
                  {tossedYaos.length < 6
                    ? `正在摇掷第 ${tossedYaos.length + 1} 爻 (${
                        YAO_NAMES[tossedYaos.length]
                      })`
                    : '六爻已全 · 卦象定盘'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {tossedYaos.length < 6 ? (
                  <button
                    onClick={handleFastForwardToss}
                    className="text-[#176f63] hover:underline font-serif font-semibold cursor-pointer"
                  >
                    一键掷满后续爻位 ⚡️
                  </button>
                ) : (
                  <button
                    onClick={handleResetToss}
                    className="text-[#8A5B21] hover:underline font-serif font-semibold cursor-pointer"
                  >
                    ↺ 重新摇卦
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* 左侧：极高保真“八卦金丝刺绣锦缎卦布”与 3D 乾隆通宝投掷区 */}
              <div className="md:col-span-7 flex flex-col items-center">
                {/* 锦缎卦垫主体 */}
                <div
                  onClick={handleTossCoin}
                  className={`relative w-full max-w-[420px] aspect-[1.25/1] rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between select-none cursor-pointer overflow-hidden shadow-2xl transition-all duration-300 ${
                    clothRipple ? 'animate-[cloth-soft-ripple_0.5s_ease-out]' : ''
                  }`}
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, #152e27 0%, #0d211b 50%, #081512 100%)',
                    boxShadow:
                      '0 20px 40px -10px rgba(8,21,18,0.7), inset 0 0 0 3px rgba(212,175,55,0.4), inset 0 0 30px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* 锦缎面双道金丝刺绣滚边 */}
                  <div className="absolute inset-2.5 rounded-2xl border-2 border-dashed border-[#d4af37]/40 pointer-events-none" />
                  <div className="absolute inset-4 rounded-xl border border-[#d4af37]/20 pointer-events-none" />

                  {/* 四角如意金丝云纹角饰 */}
                  <div className="absolute top-3 left-3 text-[#d4af37]/60 font-serif text-sm pointer-events-none">
                    ╔
                  </div>
                  <div className="absolute top-3 right-3 text-[#d4af37]/60 font-serif text-sm pointer-events-none">
                    ╗
                  </div>
                  <div className="absolute bottom-3 left-3 text-[#d4af37]/60 font-serif text-sm pointer-events-none">
                    ╚
                  </div>
                  <div className="absolute bottom-3 right-3 text-[#d4af37]/60 font-serif text-sm pointer-events-none">
                    ╝
                  </div>

                  {/* 卦垫中央：金丝刺绣八卦阵与太极双鱼图底纹 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-56 h-56 text-[#d4af37] animate-[spin_60s_linear_infinite]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
                      <circle cx="100" cy="100" r="70" />
                      <circle cx="100" cy="100" r="45" strokeDasharray="2 2" />

                      {/* 太极双鱼 S 曲线 */}
                      <path
                        d="M 100 55 A 22.5 22.5 0 0 1 100 100 A 22.5 22.5 0 0 0 100 145 A 45 45 0 0 1 100 55"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle cx="100" cy="77.5" r="4" fill="#081512" />
                      <circle cx="100" cy="122.5" r="4" fill="currentColor" />

                      {/* 八卦符号乾南坤北 */}
                      <g fontSize="10" fontFamily="serif" textAnchor="middle" fill="currentColor">
                        <text x="100" y="24">☰ 乾</text>
                        <text x="100" y="186">☷ 坤</text>
                        <text x="24" y="104">☲ 离</text>
                        <text x="176" y="104">☵ 坎</text>
                        <text x="44" y="48">☱ 兑</text>
                        <text x="156" y="48">☳ 震</text>
                        <text x="44" y="160">☴ 巽</text>
                        <text x="156" y="160">☶ 艮</text>
                      </g>
                    </svg>
                  </div>

                  {/* 顶部卦垫题印 */}
                  <div className="relative z-10 w-full flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-serif tracking-widest text-[#d4af37]/80">
                      ❖ 玄机八卦锦垫
                    </span>
                    <span className="text-[10px] font-mono text-[#a5c5bc]/70">
                      {isCoinFlipping ? '凌空翻转中...' : '轻触锦垫即掷'}
                    </span>
                  </div>

                  {/* 锦缎中央：三枚 3D 乾隆通宝真实散落位置 */}
                  <div className="relative z-10 w-full flex items-center justify-center gap-6 sm:gap-8 py-3 my-auto">
                    {coinsFacing.map((isFront, i) => (
                      <QianlongCoin
                        key={i}
                        index={i}
                        isFront={isFront}
                        isTossing={isCoinFlipping}
                        restingAngle={coinRestingAngles[i]}
                        restingOffsetX={coinOffsets[i].x}
                        restingOffsetY={coinOffsets[i].y}
                      />
                    ))}
                  </div>

                  {/* 底部落布状态提示 */}
                  <div className="relative z-10 w-full text-center pb-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-[#d4af37]/30 text-[11px] font-serif text-[#ecd9b5]">
                      {isCoinFlipping ? (
                        <span className="animate-pulse text-[#f5d99b]">
                          铜钱在八卦气场中三维翻转...
                        </span>
                      ) : (
                        <span>
                          当前落布：
                          <strong className="text-[#f5d99b]">
                            {coinsFacing.filter(Boolean).length} 个字面(阳)
                          </strong>{' '}
                          ·{' '}
                          <strong className="text-[#ecd9b5]">
                            {coinsFacing.filter((f) => !f).length} 个满文(阴)
                          </strong>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 投掷操作主按钮 */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleTossCoin}
                    disabled={isCoinFlipping}
                    className="btn-xuanji px-7 py-3 rounded-full text-xs font-bold font-serif-sc shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-base">🪙</span>
                    <span>
                      {tossedYaos.length < 6
                        ? `摇掷第 ${tossedYaos.length + 1} 爻 (${
                            YAO_NAMES[tossedYaos.length]
                          })`
                        : '六爻已满 · 重新掷卦'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 右侧：六爻卦柱从初爻自底向上点亮展示台 */}
              <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-white border border-[#dcd3c1] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#dcd3c1]/60">
                  <span className="font-serif-sc font-bold text-xs text-[#24453f]">
                    ❖ 周易卦柱 (自底向上建爻)
                  </span>
                  <span className="text-[10px] font-mono text-[#879397]">
                    6(老阴) 7(少阳) 8(少阴) 9(老阳)
                  </span>
                </div>

                <div className="flex flex-col-reverse gap-2 py-1">
                  {[0, 1, 2, 3, 4, 5].map((yaoIdx) => {
                    const score = tossedYaos[yaoIdx]
                    const hasValue = score !== undefined
                    const isYang = score === 7 || score === 9
                    const isMoving = score === 6 || score === 9

                    return (
                      <div
                        key={yaoIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-300 ${
                          hasValue
                            ? isMoving
                              ? 'bg-amber-50/90 border-amber-300 text-amber-900 font-bold shadow-xs'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                            : 'bg-[#faf7f0] border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-16">
                          <span className="font-serif-sc">{YAO_NAMES[yaoIdx]}</span>
                          {yaoIdx === 2 && (
                            <span className="text-[9px] text-[#879397] font-mono">
                              [下卦]
                            </span>
                          )}
                          {yaoIdx === 5 && (
                            <span className="text-[9px] text-[#879397] font-mono">
                              [上卦]
                            </span>
                          )}
                        </div>

                        {/* 爻形符号 */}
                        <div className="flex-1 flex items-center justify-center font-mono">
                          {hasValue ? (
                            isYang ? (
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-16 bg-[#176f63] rounded-xs inline-block shadow-2xs" />
                                {isMoving && (
                                  <span className="text-[10px] text-red-600 font-bold animate-pulse">
                                    ○ 变
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-7 bg-[#8A5B21] rounded-xs inline-block shadow-2xs" />
                                <span className="w-2 inline-block" />
                                <span className="h-2 w-7 bg-[#8A5B21] rounded-xs inline-block shadow-2xs" />
                                {isMoving && (
                                  <span className="text-[10px] text-red-600 font-bold animate-pulse">
                                    × 变
                                  </span>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-300 font-serif">待掷...</span>
                          )}
                        </div>

                        <div className="w-14 text-right font-mono text-[11px]">
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
          <div className="p-5 sm:p-6 rounded-3xl bg-[#faf6ee] border border-[#dcd3c1] space-y-4">
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
                className="btn-xuanji px-8 py-2.5 rounded-full text-xs font-bold font-serif-sc shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span>⚡️</span>
                <span>依数启卦 · 推演梅花易数吉码</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            交互操作区：模式三 (紫微竹木签筒 · 摇晃碰撞与破鞘出签)
           ------------------------------------------------------------- */}
        {mode === 'bamboo' && (
          <div className="p-5 sm:p-7 rounded-3xl bg-[#faf6ee] border border-[#dcd3c1] text-center space-y-5">
            <div className="text-xs text-[#52666a] font-serif max-w-lg mx-auto leading-relaxed">
              轻按下方摇签按钮，连续晃动紫竹签筒 3 次。伴随真实竹签撞击之声，感应紫微财帛星曜照临，摇出一支特等大吉灵签。
            </div>

            <div className="py-4 flex flex-col items-center justify-center">
              {/* 沉香紫竹签筒主体与破鞘出签动画 */}
              <div
                onClick={handleShakeBamboo}
                className={`relative w-28 h-40 sm:w-32 sm:h-44 rounded-b-3xl rounded-t-xl cursor-pointer select-none transition-transform ${
                  isCanisterShaking ? 'animate-[canister-wood-shake_0.55s_ease-in-out]' : ''
                }`}
                style={{
                  background:
                    'linear-gradient(135deg, #42291a 0%, #613c23 35%, #42291a 70%, #2b180d 100%)',
                  boxShadow:
                    '0 16px 28px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,230,170,0.3), inset 0 -4px 8px rgba(0,0,0,0.6)',
                }}
              >
                {/* 筒身双道鎏金箍圈 */}
                <div className="absolute top-4 inset-x-0 h-1.5 bg-gradient-to-r from-[#d4af37] via-[#f7e2a3] to-[#b38827] shadow-xs" />
                <div className="absolute bottom-5 inset-x-0 h-1.5 bg-gradient-to-r from-[#d4af37] via-[#f7e2a3] to-[#b38827] shadow-xs" />

                {/* 签筒内错落插列的竹签群 */}
                <div className="absolute -top-10 inset-x-2 flex items-end justify-center gap-1.5 overflow-visible">
                  {[
                    { h: 48, red: false, anim: 'animate-[slip-jitter-1_0.55s]' },
                    { h: 56, red: true, anim: 'animate-[slip-jitter-2_0.55s]' },
                    { h: 44, red: false, anim: 'animate-[slip-jitter-3_0.55s]' },
                    { h: 62, red: true, anim: 'animate-[slip-jitter-1_0.55s]' },
                    { h: 52, red: false, anim: 'animate-[slip-jitter-2_0.55s]' },
                    { h: 58, red: true, anim: 'animate-[slip-jitter-3_0.55s]' },
                  ].map((slip, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 rounded-t-xs border border-[#3b2311] shadow-xs ${
                        slip.red
                          ? 'bg-gradient-to-t from-[#ecd9b5] via-[#ecd9b5] to-[#c0392b]'
                          : 'bg-gradient-to-t from-[#c8b48e] to-[#ecd9b5]'
                      } ${isCanisterShaking ? slip.anim : ''}`}
                      style={{ height: `${slip.h}px` }}
                    />
                  ))}
                </div>

                {/* 破鞘腾空拔起的特等大吉灵签 (ShakeCount=3 时触发) */}
                {isSlipEmerged && (
                  <div
                    className="absolute -top-14 left-1/2 -translate-x-1/2 w-14 h-48 rounded-xl bg-gradient-to-b from-[#c0392b] via-[#ecd8ae] to-[#d8b97e] border-2 border-[#f7e2a3] shadow-[0_0_30px_rgba(212,175,55,0.8)] z-30 flex flex-col items-center justify-between p-2 animate-[slip-fly-out_0.6s_cubic-bezier(0.2,0.8,0.2,1)_forwards]"
                  >
                    <span className="text-[10px] font-serif-sc font-black text-white px-1 rounded-xs bg-[#962619]">
                      特等大吉
                    </span>
                    <span className="text-xs font-serif-sc font-black text-[#42291a] writing-vertical tracking-widest my-auto">
                      {drawnSlipNumber ? `第${drawnSlipNumber}签` : '天机化权'}
                    </span>
                    <span className="text-[8px] font-mono text-[#5a381e]">
                      紫微星曜
                    </span>
                  </div>
                )}

                {/* 筒身朱砂金漆名牌牌位 */}
                <div className="absolute inset-x-4 top-10 bottom-10 rounded-lg bg-[#1e1008]/80 border border-[#d4af37]/40 flex flex-col items-center justify-center p-1 shadow-inner">
                  <span className="text-xs font-serif-sc font-black text-[#ecd8ae] tracking-widest writing-vertical">
                    紫微灵签
                  </span>
                </div>
              </div>

              {/* 摇动阶段仪式感提示 */}
              <div className="mt-6 text-xs font-serif text-[#8A5B21]">
                摇动契合度：
                <span className="font-bold font-mono ml-1 text-[#176f63]">
                  {shakeCount === 0
                    ? drawnSlipNumber
                      ? `已摇出第 ${drawnSlipNumber} 签！点击可继续摇取新签`
                      : '双手抱筒 · 静候摇动 (0/3)'
                    : shakeCount === 1
                    ? '第 1 摇 · 定心凝神，气机初通 (1/3)'
                    : shakeCount === 2
                    ? '第 2 摇 · 竹签松动，吉曜将显 (2/3)'
                    : '第 3 摇 · 灵签破鞘！(3/3)'}
                </span>
              </div>
            </div>

            <button
              onClick={handleShakeBamboo}
              disabled={isCanisterShaking}
              className="btn-xuanji px-8 py-2.5 rounded-full text-xs font-bold font-serif-sc shadow-md mx-auto cursor-pointer disabled:opacity-50"
            >
              🎋 摇动紫竹签筒 ({shakeCount}/3)
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          易数选号最终结果看板 (含灵签诗、吉方时辰、主选号码与5注组合)
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
                  <span className="text-[#879397] block text-[10px]">
                    吉利投注时辰
                  </span>
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
                onClick={() =>
                  handleCopyNumbers(result.redPicks, result.bluePicks)
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#176f63]/10 text-[#176f63] hover:bg-[#176f63] hover:text-white font-serif-sc font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
              >
                <span>{copied ? '✓ 已复制号码' : '📋 复制此注号码'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 flex-wrap">
              {result.redPicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#f25c4e] to-[#d93829] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    animationIterationCount: 1,
                  }}
                >
                  {formatBall(ball)}
                </div>
              ))}
              {result.bluePicks.map((ball, idx) => (
                <div
                  key={idx}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#3b87d9] to-[#1a68b5] text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md border-2 border-white/60 animate-bounce"
                  style={{
                    animationDelay: `${
                      (result.redPicks.length + idx) * 100
                    }ms`,
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
                  className="text-xs font-serif text-[#176f63] hover:underline cursor-pointer"
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
                      className="text-xs text-[#6d8980] hover:text-[#176f63] font-serif p-1 cursor-pointer"
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
