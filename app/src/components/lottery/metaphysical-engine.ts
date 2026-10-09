/* ============================================================
   玄机 · 玄学易数选号引擎 (Metaphysical Lottery Engine)
   - 融合五行河图洛书、周易六十四卦梅花易数、紫微财曜与奇门时空
   - 自动适配双色球、大乐透、福彩3D、排列3等不同彩种
   ============================================================ */

import type { LotteryType } from './lottery-data'
import { LOTTERY_CONFIGS } from './lottery-data'

export type MetaphysicalMethod =
  | 'bazi_elements'    // 五行河图洛书
  | 'iching_hexagram'  // 周易梅花易数
  | 'ziwei_stars'      // 紫微财帛星曜
  | 'qimen_timing'     // 奇门时空纳吉

export interface MetaphysicalResult {
  method: MetaphysicalMethod
  methodName: string
  title: string
  signPoem: string         // 灵签诗赋
  oracleInterpretation: string // 玄机解卦断语
  favorableDirection: string   // 迎财吉方 (如：正西兑位、东南巽位)
  auspiciousHours: string      // 吉利时辰 (如：申时 15:00-17:00)
  elementAffinity: string      // 气运五行归属 (如：水木相生·天一生水)
  redPicks: number[]           // 选出的红球/前区号码 (已升序排序)
  bluePicks: number[]          // 选出的蓝球/后区号码 (已升序排序)
  multipleSets?: Array<{ reds: number[]; blues: number[] }> // 多注推荐
  confidenceStars: number      // 灵动机数 (3-5星)
}

// 河图五行数理映射
const HETU_MAP: Record<'water' | 'fire' | 'wood' | 'metal' | 'earth', number[]> = {
  water: [1, 6, 11, 16, 21, 26, 31],
  fire:  [2, 7, 12, 17, 22, 27, 32],
  wood:  [3, 8, 13, 18, 23, 28, 33],
  metal: [4, 9, 14, 19, 24, 29, 34],
  earth: [5, 10, 15, 20, 25, 30, 35],
}

// 经典财运卦象库
interface HexagramData {
  name: string
  upper: string
  lower: string
  poem: string
  desc: string
  keyNumbers: number[]
}

const AUSPICIOUS_HEXAGRAMS: HexagramData[] = [
  {
    name: '地天泰卦',
    upper: '坤地',
    lower: '乾天',
    poem: '天地交泰万物生，小往大来福禄盈。云行雨施灵机至，暗合天数自通津。',
    desc: '阳气下交，阴气上升，主通泰舒和，灵码聚于中高位，顺水推舟，大吉之象。',
    keyNumbers: [1, 6, 8, 11, 18, 23, 28, 33],
  },
  {
    name: '火天大有卦',
    upper: '离火',
    lower: '乾天',
    poem: '日丽中天照四方，公亨大有富财强。顺天休命应时起，金火相融数未央。',
    desc: '日丽中天，照耀无私，主偏正财丰沛。宜选火金两局之数，气势磅礴。',
    keyNumbers: [2, 7, 9, 14, 17, 22, 29, 32],
  },
  {
    name: '风雷益卦',
    upper: '巽风',
    lower: '震雷',
    poem: '雷风相激增益祥，损上益下道悠长。乘木舟行通彼岸，灵数飞升自发芒。',
    desc: '风激雷鸣，损下益上，主意外机缘与跳跃性偏财，号段多分布于生门与跃马之位。',
    keyNumbers: [3, 4, 8, 13, 16, 20, 25, 31],
  },
  {
    name: '水地比卦',
    upper: '坎水',
    lower: '坤地',
    poem: '水附大地聚群源，亲比无虞乐自然。原筮元永贞吉应，玄数相亲结良缘。',
    desc: '水得地以流，地得水以柔，主众星拱月，号码连号或同尾数特征明显。',
    keyNumbers: [1, 5, 6, 10, 15, 21, 26, 30],
  },
  {
    name: '天火同人卦',
    upper: '乾天',
    lower: '离火',
    poem: '君子通同类族彰，光明磊落利涉江。文明以健应乎运，财数同辉映紫芒。',
    desc: '上下同德，光明刚健，主得贵人助力与天地正气照应，中轴号码强劲。',
    keyNumbers: [2, 7, 12, 17, 21, 27, 31, 35],
  },
  {
    name: '雷地豫卦',
    upper: '震雷',
    lower: '坤地',
    poem: '雷出地奋顺而动，鸣豫欢腾福祚同。先王作乐崇德重，顺势取数在其中。',
    desc: '顺时而动，悦豫生财，冷码复苏之势强烈，适宜大胆点取蓄势已久之数。',
    keyNumbers: [4, 8, 12, 18, 24, 27, 32],
  },
]

// 辅助：从候选池中结合范围随机取若干不重复数字
function pickFromPool(
  preferred: number[],
  range: [number, number],
  count: number
): number[] {
  const [min, max] = range
  const validPreferred = preferred.filter((n) => n >= min && n <= max)
  const result = new Set<number>()

  // 优先选取 2-4 个意向吉祥数字
  const pickFromPrefCount = Math.min(
    validPreferred.length,
    Math.max(1, Math.floor(count * 0.6))
  )
  const shuffledPref = [...validPreferred].sort(() => Math.random() - 0.5)

  for (let i = 0; i < pickFromPrefCount && i < shuffledPref.length; i++) {
    result.add(shuffledPref[i])
  }

  // 其余从全集范围中按随机加权填充
  while (result.size < count) {
    const candidate = min + Math.floor(Math.random() * (max - min + 1))
    result.add(candidate)
  }

  return Array.from(result).sort((a, b) => a - b)
}

// 辅助：福彩3D / 排列3等按位生成
function pickDigits(preferred: number[], count: number): number[] {
  const digits: number[] = []
  for (let i = 0; i < count; i++) {
    if (Math.random() > 0.4 && preferred.length > 0) {
      const idx = Math.floor(Math.random() * preferred.length)
      digits.push(preferred[idx] % 10)
    } else {
      digits.push(Math.floor(Math.random() * 10))
    }
  }
  return digits
}

// 核心玄学选号生成函数
export function generateMetaphysicalNumbers(
  lotteryType: LotteryType,
  method: MetaphysicalMethod,
  userElement?: string // 用户五行喜用神（如 水、木、火、金、土）
): MetaphysicalResult {
  const cfg = LOTTERY_CONFIGS[lotteryType]

  // 1. 五行河图洛书
  if (method === 'bazi_elements') {
    const elements: Array<'water' | 'fire' | 'wood' | 'metal' | 'earth'> = [
      'water',
      'fire',
      'wood',
      'metal',
      'earth',
    ]
    // 若用户有五行，转换匹配；否则取当季当令五行
    let primaryEl: 'water' | 'fire' | 'wood' | 'metal' | 'earth' = 'wood'
    if (userElement?.includes('水')) primaryEl = 'water'
    else if (userElement?.includes('火')) primaryEl = 'fire'
    else if (userElement?.includes('金')) primaryEl = 'metal'
    else if (userElement?.includes('土')) primaryEl = 'earth'
    else {
      // 随机选一个生旺五行
      primaryEl = elements[Math.floor(Math.random() * elements.length)]
    }

    // 相生五行
    const generatingMap = {
      water: { gen: 'wood', name: '水生木旺', desc: '天一生水，滋润万木' },
      wood:  { gen: 'fire', name: '木火通明', desc: '雷火丰沛，灵气通达' },
      fire:  { gen: 'earth', name: '火土相生', desc: '土载厚德，库藏聚宝' },
      earth: { gen: 'metal', name: '土生金发', desc: '山藏美玉，金石出露' },
      metal: { gen: 'water', name: '金水相涵', desc: '渊深澄澈，财源滔滔' },
    }
    const pair = generatingMap[primaryEl]
    const preferredPool = [
      ...HETU_MAP[primaryEl],
      ...HETU_MAP[pair.gen as keyof typeof HETU_MAP],
    ]

    const is3D = lotteryType === 'fc3d' || lotteryType === 'pl3'
    const reds = is3D
      ? pickDigits(preferredPool, cfg.redCount)
      : pickFromPool(preferredPool, cfg.redRange, cfg.redCount)

    const blues = cfg.blueCount && cfg.blueRange
      ? pickFromPool(HETU_MAP[primaryEl], cfg.blueRange, cfg.blueCount)
      : []

    // 生成5注推荐
    const multipleSets = Array.from({ length: 5 }, () => ({
      reds: is3D
        ? pickDigits(preferredPool, cfg.redCount)
        : pickFromPool(preferredPool, cfg.redRange, cfg.redCount),
      blues: cfg.blueCount && cfg.blueRange
        ? pickFromPool(HETU_MAP[primaryEl], cfg.blueRange, cfg.blueCount)
        : [],
    }))

    return {
      method,
      methodName: '五行河图洛书法',
      title: `${pair.name} · 数理纳吉`,
      signPoem: '天一生水地六成，河图奥秘契心灵。干支数理归元妙，五行生克纳百祥。',
      oracleInterpretation: `契合本命【${primaryEl.toUpperCase()}】局与【${pair.name}】之气。${pair.desc}。所聚吉数多落于相生经纬之中，气场平和悠远。`,
      favorableDirection: primaryEl === 'water' ? '正北坎位' : primaryEl === 'fire' ? '正南离位' : primaryEl === 'wood' ? '正东震位' : primaryEl === 'metal' ? '正西兑位' : '中央戊己',
      auspiciousHours: '未时 (13:00-15:00) 或 戌时 (19:00-21:00)',
      elementAffinity: `${pair.name} (${primaryEl})`,
      redPicks: reds,
      bluePicks: blues,
      multipleSets,
      confidenceStars: 5,
    }
  }

  // 2. 周易梅花易数
  if (method === 'iching_hexagram') {
    const hex = AUSPICIOUS_HEXAGRAMS[Math.floor(Math.random() * AUSPICIOUS_HEXAGRAMS.length)]
    const is3D = lotteryType === 'fc3d' || lotteryType === 'pl3'

    const reds = is3D
      ? pickDigits(hex.keyNumbers, cfg.redCount)
      : pickFromPool(hex.keyNumbers, cfg.redRange, cfg.redCount)

    const blues = cfg.blueCount && cfg.blueRange
      ? pickFromPool(hex.keyNumbers, cfg.blueRange, cfg.blueCount)
      : []

    const multipleSets = Array.from({ length: 5 }, () => ({
      reds: is3D
        ? pickDigits(hex.keyNumbers, cfg.redCount)
        : pickFromPool(hex.keyNumbers, cfg.redRange, cfg.redCount),
      blues: cfg.blueCount && cfg.blueRange
        ? pickFromPool(hex.keyNumbers, cfg.blueRange, cfg.blueCount)
        : [],
    }))

    return {
      method,
      methodName: '周易梅花易数起卦',
      title: `得【${hex.name}】(${hex.upper}/${hex.lower})`,
      signPoem: hex.poem,
      oracleInterpretation: hex.desc,
      favorableDirection: '东南巽位 / 正东震位 (纳风雷生发之气)',
      auspiciousHours: '午时 (11:00-13:00) 阳气极盛之时',
      elementAffinity: '乾健坤顺 · 易理流转',
      redPicks: reds,
      bluePicks: blues,
      multipleSets,
      confidenceStars: 5,
    }
  }

  // 3. 紫微财曜照命
  if (method === 'ziwei_stars') {
    const starsPool = [
      { star: '武曲化禄', desc: '正财大将，执掌权柄，数理刚毅方正，多聚中高位质数。', nums: [4, 7, 13, 19, 23, 29, 31] },
      { star: '贪狼化权', desc: '偏财灵动，善察风机，数理跳荡活泼，大小跨度极大。', nums: [1, 8, 14, 18, 26, 32, 34] },
      { star: '太阴化科', desc: '田宅富藏，月华内敛，数理柔和绵密，同尾数与连号显赫。', nums: [2, 6, 12, 16, 22, 28, 30] },
      { star: '禄存坐贵', desc: '天禄解厄，稳若泰山，数理对称规整，和值平衡适中。', nums: [3, 9, 15, 21, 25, 27, 33] },
    ]
    const chosen = starsPool[Math.floor(Math.random() * starsPool.length)]
    const is3D = lotteryType === 'fc3d' || lotteryType === 'pl3'

    const reds = is3D
      ? pickDigits(chosen.nums, cfg.redCount)
      : pickFromPool(chosen.nums, cfg.redRange, cfg.redCount)

    const blues = cfg.blueCount && cfg.blueRange
      ? pickFromPool(chosen.nums, cfg.blueRange, cfg.blueCount)
      : []

    const multipleSets = Array.from({ length: 5 }, () => ({
      reds: is3D
        ? pickDigits(chosen.nums, cfg.redCount)
        : pickFromPool(chosen.nums, cfg.redRange, cfg.redCount),
      blues: cfg.blueCount && cfg.blueRange
        ? pickFromPool(chosen.nums, cfg.blueRange, cfg.blueCount)
        : [],
    }))

    return {
      method,
      methodName: '紫微财曜照命法',
      title: `【${chosen.star}】气贯财帛`,
      signPoem: '紫微星垣照福宫，武曲禄马步从容。天机暗运逢吉曜，数里乾坤一点通。',
      oracleInterpretation: `${chosen.desc} 气数乘旺，可借助星曜照临之势，定夺关键胆码。`,
      favorableDirection: '西北乾天 / 东北艮山 (紫微星垣正宫)',
      auspiciousHours: '辰时 (07:00-09:00) 龙抬头吸水纳财',
      elementAffinity: '紫微帝垣 · 禄马交驰',
      redPicks: reds,
      bluePicks: blues,
      multipleSets,
      confidenceStars: 4,
    }
  }

  // 4. 奇门时空纳吉 (默认)
  const qimenPool = [3, 6, 8, 9, 15, 18, 21, 24, 27, 30, 33]
  const is3D = lotteryType === 'fc3d' || lotteryType === 'pl3'
  const reds = is3D
    ? pickDigits(qimenPool, cfg.redCount)
    : pickFromPool(qimenPool, cfg.redRange, cfg.redCount)

  const blues = cfg.blueCount && cfg.blueRange
    ? pickFromPool([1, 6, 8, 9, 12], cfg.blueRange, cfg.blueCount)
    : []

  const multipleSets = Array.from({ length: 5 }, () => ({
    reds: is3D
      ? pickDigits(qimenPool, cfg.redCount)
      : pickFromPool(qimenPool, cfg.redRange, cfg.redCount),
    blues: cfg.blueCount && cfg.blueRange
      ? pickFromPool([1, 6, 8, 9, 12], cfg.blueRange, cfg.blueCount)
      : [],
  }))

  return {
    method: 'qimen_timing',
    methodName: '奇门时空九星法',
    title: '生门得使 · 天心注照',
    signPoem: '奇门遁甲遁天机，九星飞伏吉星奇。生门得利开门泰，时空感应定元祺。',
    oracleInterpretation: '以当下时家奇门起局，值符加生门，丙奇顺行。号码多落入吉门所向之宫数，贵在心念清净，随缘偶得。',
    favorableDirection: '正南生门 / 东北天任吉位',
    auspiciousHours: '申时 (15:00-17:00) 或 亥时 (21:00-22:00)',
    elementAffinity: '奇门九宫 · 天地人神相合',
    redPicks: reds,
    bluePicks: blues,
    multipleSets,
    confidenceStars: 5,
  }
}
