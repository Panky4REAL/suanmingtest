/* ============================================================
   玄机 · 玄学易数选号引擎 (Metaphysical Lottery Engine)
   - 融合周易六十四卦纳甲六爻、邵康节梅花易数心念报数、紫微财曜
   - 支持三枚铜钱 6 掷逐爻起卦、自定义灵感数字起卦、紫微摇签
   - 包含严谨的六爻点数(6/7/8/9)、动爻变卦与数理推导步骤
   ============================================================ */

import type { LotteryType } from './lottery-data'
import { LOTTERY_CONFIGS } from './lottery-data'

export type MetaphysicalMethod =
  | 'coins_six_yao'    // 三枚铜钱·六爻纳甲抛卦
  | 'meihua_mind'      // 梅花易数·心念报数
  | 'ziwei_bamboo'     // 紫微星垣·灵签竹筒
  | 'bazi_elements'    // 五行河图洛书
  | 'iching_hexagram'  // 周易梅花易数(快捷)
  | 'ziwei_stars'      // 紫微财曜照命
  | 'qimen_timing'     // 奇门时空纳吉

export interface MetaphysicalResult {
  method: MetaphysicalMethod
  methodName: string
  title: string
  signPoem: string              // 灵签诗赋
  oracleInterpretation: string      // 玄机解卦断语
  favorableDirection: string        // 迎财吉方
  auspiciousHours: string           // 吉利时辰
  elementAffinity: string           // 气运五行归属
  redPicks: number[]                // 选出的红球/前区号码 (已升序排序)
  bluePicks: number[]               // 选出的蓝球/后区号码 (已升序排序)
  multipleSets?: Array<{ reds: number[]; blues: number[] }> // 多注推荐
  confidenceStars: number           // 灵动机数 (3-5星)
  hexagramName?: string             // 本卦名称 (如 火天大有)
  bianHexagramName?: string         // 变卦名称 (如 火风鼎)
  upperTrigramName?: string         // 上卦名称 (如 离火)
  lowerTrigramName?: string         // 下卦名称 (如 乾天)
  movingYaos?: number[]             // 动爻序号列表 (1-6)
  yaos?: number[]                   // 六爻点数 [y1, y2, y3, y4, y5, y6] (6, 7, 8, 9)
  derivationSteps?: string[]        // 数理与爻辞推导具体步骤
}

// -------------------------------------------------------------
// 八卦先天与后天基础属性
// -------------------------------------------------------------
export interface TrigramMeta {
  index: number // 1-8
  name: string
  nature: string // 天、泽、火、雷、风、水、山、地
  element: 'metal' | 'wood' | 'water' | 'fire' | 'earth'
  elementZh: string
  lines: [number, number, number] // [bottom, mid, top], 1=阳, 0=阴
  hetuNums: number[]
}

export const TRIGRAMS: Record<number, TrigramMeta> = {
  1: { index: 1, name: '乾', nature: '天', element: 'metal', elementZh: '金', lines: [1, 1, 1], hetuNums: [1, 6, 9, 14, 19, 29] },
  2: { index: 2, name: '兑', nature: '泽', element: 'metal', elementZh: '金', lines: [1, 1, 0], hetuNums: [2, 7, 4, 12, 17, 24] },
  3: { index: 3, name: '离', nature: '火', element: 'fire',  elementZh: '火', lines: [1, 0, 1], hetuNums: [3, 9, 2, 13, 22, 27] },
  4: { index: 4, name: '震', nature: '雷', element: 'wood',  elementZh: '木', lines: [1, 0, 0], hetuNums: [4, 8, 3, 14, 18, 28] },
  5: { index: 5, name: '巽', nature: '风', element: 'wood',  elementZh: '木', lines: [0, 1, 1], hetuNums: [5, 4, 8, 15, 23, 31] },
  6: { index: 6, name: '坎', nature: '水', element: 'water', elementZh: '水', lines: [0, 1, 0], hetuNums: [1, 6, 11, 16, 21, 26] },
  7: { index: 7, name: '艮', nature: '山', element: 'earth', elementZh: '土', lines: [0, 0, 1], hetuNums: [5, 7, 10, 17, 20, 25] },
  8: { index: 8, name: '坤', nature: '地', element: 'earth', elementZh: '土', lines: [0, 0, 0], hetuNums: [2, 8, 10, 18, 20, 30] },
}

// -------------------------------------------------------------
// 六十四卦经典典籍数据表 (Upper 1-8, Lower 1-8)
// -------------------------------------------------------------
interface HexagramRecord {
  name: string
  fullName: string
  upper: number
  lower: number
  poem: string
  oracle: string
  favorableDirection: string
  auspiciousHours: string
}

// 经典64卦精选字典
const HEXAGRAM_DICTIONARY: Record<string, HexagramRecord> = {
  '1-1': {
    name: '乾为天',
    fullName: '乾上乾下 · 乾为天',
    upper: 1, lower: 1,
    poem: '天行健健运元亨，六龙御天日月明。飞龙在天利大见，刚健中正大丰登。',
    oracle: '纯阳大吉之象。元亨利贞，天地刚健之气流注，万事大顺，选号宜走中高位强数。',
    favorableDirection: '西北乾天 / 正西金位',
    auspiciousHours: '辰时 (07:00-09:00) 飞龙在天',
  },
  '8-8': {
    name: '坤为地',
    fullName: '坤上坤下 · 坤为地',
    upper: 8, lower: 8,
    poem: '地势坤厚德载物，含弘光大万物苏。安贞吉亨承天施，金玉满仓福泽富。',
    oracle: '纯阴包容之象。地道温和，厚载无疆。号码多落入双数与连号温和之位。',
    favorableDirection: '西南坤地 / 正北水运',
    auspiciousHours: '未时 (13:00-15:00) 坤土当旺',
  },
  '8-1': {
    name: '地天泰',
    fullName: '坤上乾下 · 地天泰',
    upper: 8, lower: 1,
    poem: '天地交泰万物生，小往大来福禄盈。云行雨施灵机至，暗合天数自通津。',
    oracle: '阳气下交，阴气上升，主通泰舒和，灵码聚于中高位，顺水推舟，大吉之象。',
    favorableDirection: '东北艮山 / 西南吉位',
    auspiciousHours: '午时 (11:00-13:00) 日丽泰安',
  },
  '1-8': {
    name: '天地否',
    fullName: '乾上坤下 · 天地否',
    upper: 1, lower: 8,
    poem: '天地不交闭塞迟，否极泰来会有期。君子固穷守元道，晦暗已过现晨曦。',
    oracle: '否极泰来之象，黑暗退去转机暗藏，适合关注大冷码回补反弹之势。',
    favorableDirection: '西北生门 / 正东震方',
    auspiciousHours: '卯时 (05:00-07:00) 旭日初升',
  },
  '3-1': {
    name: '火天大有',
    fullName: '离上乾下 · 火天大有',
    upper: 3, lower: 1,
    poem: '日丽中天照四方，公亨大有富财强。顺天休命应时起，金火相融数未央。',
    oracle: '日丽中天，照耀无私，主偏正财丰沛。宜选火金两局之数，气势磅礴。',
    favorableDirection: '正南离火 / 西北金垣',
    auspiciousHours: '巳时 (09:00-11:00) 旭日高照',
  },
  '1-3': {
    name: '天火同人',
    fullName: '乾上离下 · 天火同人',
    upper: 1, lower: 3,
    poem: '君子通同类族彰，光明磊落利涉江。文明以健应乎运，财数同辉映紫芒。',
    oracle: '上下同德，光明刚健，主得贵人助力与天地正气照应，中轴号码强劲。',
    favorableDirection: '正南生门 / 正西兑泽',
    auspiciousHours: '申时 (15:00-17:00) 财禄归元',
  },
  '5-4': {
    name: '风雷益',
    fullName: '巽上震下 · 风雷益',
    upper: 5, lower: 4,
    poem: '雷风相激增益祥，损上益下道悠长。乘木舟行通彼岸，灵数飞升自发芒。',
    oracle: '风激雷鸣，损下益上，主意外机缘与跳跃性偏财，号段多分布于生门与跃马之位。',
    favorableDirection: '东南巽风 / 正东震雷',
    auspiciousHours: '寅时 (03:00-05:00) 或 卯时',
  },
  '6-8': {
    name: '水地比',
    fullName: '坎上坤下 · 水地比',
    upper: 6, lower: 8,
    poem: '水附大地聚群源，亲比无虞乐自然。原筮元永贞吉应，玄数相亲结良缘。',
    oracle: '水得地以流，地得水以柔，主众星拱月，号码连号或同尾数特征明显。',
    favorableDirection: '正北坎水 / 正西生发',
    auspiciousHours: '子时 (23:00-01:00) 天一生水',
  },
  '4-8': {
    name: '雷地豫',
    fullName: '震上坤下 · 雷地豫',
    upper: 4, lower: 8,
    poem: '雷出地奋顺而动，鸣豫欢腾福祚同。先王作乐崇德重，顺势取数在其中。',
    oracle: '顺时而动，悦豫生财，冷码复苏之势强烈，适宜大胆点取蓄势已久之数。',
    favorableDirection: '正东震雷 / 西南坤位',
    auspiciousHours: '酉时 (17:00-19:00) 金木相制',
  },
  '2-3': {
    name: '泽火革',
    fullName: '兑上离下 · 泽火革',
    upper: 2, lower: 3,
    poem: '水火相息顺天命，鼎故革新变律成。君子豹变通变数，奇策出奇见光明。',
    oracle: '变革突破之象。防旧局打破，走势出现断层或跳空跃迁之奇特形态。',
    favorableDirection: '正西兑泽 / 正南离位',
    auspiciousHours: '戌时 (19:00-21:00) 鼎革之火',
  },
  '3-5': {
    name: '火风鼎',
    fullName: '离上巽下 · 火风鼎',
    upper: 3, lower: 5,
    poem: '木上有火烹饪熟，鼎足三分气运促。圣人享上帝之吉，纳财聚宝自盈福。',
    oracle: '鼎盛纳吉之象。木火通明，三足鼎立，号码和值与跨度高度对称均匀。',
    favorableDirection: '东南生门 / 正南离火',
    auspiciousHours: '巳时 (09:00-11:00) 木火亨通',
  },
  '6-3': {
    name: '水火既济',
    fullName: '坎上离下 · 水火既济',
    upper: 6, lower: 3,
    poem: '水火相济功已成，阴阳得位泰然迎。初吉终乱须谨慎，和润之中定准星。',
    oracle: '阴阳调和，刚柔得位。各区号码平分秋色，奇偶与大小比例平衡。',
    favorableDirection: '正北坎水 / 正南离火',
    auspiciousHours: '午时 (11:00-13:00) 水火既济',
  },
  '8-4': {
    name: '地雷复',
    fullName: '坤上震下 · 地雷复',
    upper: 8, lower: 4,
    poem: '一阳初生在冬至，天心无改复归时。出入无疾朋来吉，静候生机转绿枝。',
    oracle: '一阳复始，枯木逢春。历史低频冷号迎来苏醒拐点，万物萌发。',
    favorableDirection: '正东震位 / 东北生门',
    auspiciousHours: '子时 (23:00-01:00) 一阳初生',
  },
  '2-1': {
    name: '泽天夬',
    fullName: '兑上乾下 · 泽天夬',
    upper: 2, lower: 1,
    poem: '泽上于天健决断，五阳去阴发利端。刚决柔者当明断，雷厉风行定泰安。',
    oracle: '决断果敢之象。大号区间强势集聚，宜取高位大码作为主攻核心。',
    favorableDirection: '正西金位 / 西北生门',
    auspiciousHours: '申时 (15:00-17:00) 金旺生水',
  },
}

// 通用卦象生成器：若无精细字典，自动按易理规则生成
function getHexagramInfo(upper: number, lower: number): HexagramRecord {
  const key = `${upper}-${lower}`
  if (HEXAGRAM_DICTIONARY[key]) return HEXAGRAM_DICTIONARY[key]

  const u = TRIGRAMS[upper] || TRIGRAMS[1]
  const l = TRIGRAMS[lower] || TRIGRAMS[1]
  const hexName = `${u.nature}${l.nature}卦`

  return {
    name: hexName,
    fullName: `${u.name}上${l.name}下 · ${hexName}`,
    upper,
    lower,
    poem: `${u.nature}气凌霄${l.nature}在渊，阴阳摩荡理通玄。万象生发循天序，灵码初凝契自然。`,
    oracle: `得${u.name}与${l.name}交感相契。${u.elementZh}${l.elementZh}生化，主运道平稳内敛，号码顺承自然节律，中轴稳健。`,
    favorableDirection: u.element === 'metal' ? '正西兑金' : u.element === 'wood' ? '正东震木' : u.element === 'water' ? '正北坎水' : u.element === 'fire' ? '正南离火' : '中央戊己',
    auspiciousHours: '申时 (15:00-17:00) 或 未时 (13:00-15:00)',
  }
}

// 根据爻象 [b, m, t] 判定对应的八卦索引 1-8
export function linesToTrigramIndex(lines: [number, number, number]): number {
  for (let i = 1; i <= 8; i++) {
    const t = TRIGRAMS[i]
    if (t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]) {
      return i
    }
  }
  return 1
}

// -------------------------------------------------------------
// 辅助推导：从数理与卦象中生成彩票号码
// -------------------------------------------------------------
function derivePicksFromHexagram(
  lotteryType: LotteryType,
  benUpper: number,
  benLower: number,
  bianUpper: number,
  bianLower: number,
  yaos: number[],
  movingYaos: number[]
): { reds: number[]; blues: number[]; derivationSteps: string[] } {
  const cfg = LOTTERY_CONFIGS[lotteryType]
  const is3D = lotteryType === 'fc3d' || lotteryType === 'pl3' || lotteryType === 'pl5'
  const derivationSteps: string[] = []

  const uMeta = TRIGRAMS[benUpper]
  const lMeta = TRIGRAMS[benLower]
  const bianUMeta = TRIGRAMS[bianUpper]
  const bianLMeta = TRIGRAMS[bianLower]

  derivationSteps.push(
    `初爻至三爻得【${lMeta.nature}${lMeta.name}】，四爻至上爻得【${uMeta.nature}${uMeta.name}】，合成本卦【${uMeta.nature}${lMeta.nature}卦】。`
  )

  if (movingYaos.length > 0) {
    derivationSteps.push(
      `感应得动爻位于第 ${movingYaos.join('、')} 爻，生出变卦【${bianUMeta.nature}${bianLMeta.nature}卦】。`
    )
  } else {
    derivationSteps.push(`六爻纯粹无动爻，以本卦中孚之气直断。`)
  }

  // 汇聚卦象数理候选池
  const candidatePool = new Set<number>()
  ;[...uMeta.hetuNums, ...lMeta.hetuNums, ...bianUMeta.hetuNums, ...bianLMeta.hetuNums].forEach((n) => {
    candidatePool.add(n)
  })

  // 动爻点数衍生数
  movingYaos.forEach((pos) => {
    candidatePool.add(pos)
    candidatePool.add(pos + 6)
    candidatePool.add(pos + 12)
    candidatePool.add(pos + 18)
    candidatePool.add(pos + 24)
  })

  // 六爻点数 (6,7,8,9) 和值
  const yaoSum = yaos.reduce((a, b) => a + b, 0)
  candidatePool.add(yaoSum % 33 || 33)
  candidatePool.add((yaoSum * 2) % 35 || 35)

  const poolArray = Array.from(candidatePool)
  derivationSteps.push(
    `提取本变两卦洛书河图数理与六爻生克，凝结出核心吉祥数理池 [${poolArray.slice(0, 8).join(', ')}...]。`
  )

  let reds: number[] = []
  let blues: number[] = []

  if (is3D) {
    // 3D / 排列3 / 排列5: 按位生成
    const digits: number[] = []
    for (let i = 0; i < cfg.redCount; i++) {
      const yaoVal = yaos[i % yaos.length] || 7
      const trigramNum = i < 3 ? lMeta.hetuNums[i % lMeta.hetuNums.length] : uMeta.hetuNums[i % uMeta.hetuNums.length]
      // 融合爻值与八卦数
      const digit = (yaoVal * 3 + trigramNum + i * 2) % 10
      digits.push(digit)
    }
    reds = digits
    derivationSteps.push(`按分位纳甲法则，推演得出各落位吉数：${reds.join(' - ')}。`)
  } else {
    // 乐透型：双色球 / 大乐透
    const [minRed, maxRed] = cfg.redRange
    const validReds = poolArray.filter((n) => n >= minRed && n <= maxRed)
    const pickedSet = new Set<number>()

    // 优先从卦象数理池选
    validReds.forEach((n) => {
      if (pickedSet.size < cfg.redCount) pickedSet.add(n)
    })

    // 数量不够时，按爻位公式补充
    let salt = yaoSum
    while (pickedSet.size < cfg.redCount) {
      salt = (salt * 13 + 7) % (maxRed - minRed + 1)
      pickedSet.add(minRed + salt)
    }

    reds = Array.from(pickedSet).sort((a, b) => a - b)

    // 蓝球生成
    if (cfg.blueCount && cfg.blueRange) {
      const [minBlue, maxBlue] = cfg.blueRange
      const blueCandidates = [
        movingYaos[0] || (benUpper % maxBlue) || 1,
        (benLower + 6) % maxBlue || 6,
        (yaoSum % maxBlue) || maxBlue,
      ].filter((n) => n >= minBlue && n <= maxBlue)

      const blueSet = new Set<number>(blueCandidates)
      while (blueSet.size < cfg.blueCount) {
        const next = minBlue + ((salt + blueSet.size * 3) % (maxBlue - minBlue + 1))
        blueSet.add(next)
      }
      blues = Array.from(blueSet).sort((a, b) => a - b)
    }

    derivationSteps.push(
      `合局定夺：红球/前区定为 ${reds.join(' ')}${blues.length > 0 ? `，蓝球/后区定为 ${blues.join(' ')}` : ''}。`
    )
  }

  return { reds, blues, derivationSteps }
}

// -------------------------------------------------------------
// 1. 三枚铜钱·六爻纳甲抛卦生成入口 (强交互)
// -------------------------------------------------------------
export function generateFromCoinToss(
  lotteryType: LotteryType,
  yaos: number[], // 长度6，初爻至上爻点数：6(老阴), 7(少阳), 8(少阴), 9(老阳)
  userElement?: string
): MetaphysicalResult {
  const safeYaos = yaos.length === 6 ? yaos : [7, 8, 7, 8, 9, 7]

  // 下卦 (初、二、三爻)
  const lowerLines: [number, number, number] = [
    safeYaos[0] === 7 || safeYaos[0] === 9 ? 1 : 0,
    safeYaos[1] === 7 || safeYaos[1] === 9 ? 1 : 0,
    safeYaos[2] === 7 || safeYaos[2] === 9 ? 1 : 0,
  ]
  // 上卦 (四、五、上爻)
  const upperLines: [number, number, number] = [
    safeYaos[3] === 7 || safeYaos[3] === 9 ? 1 : 0,
    safeYaos[4] === 7 || safeYaos[4] === 9 ? 1 : 0,
    safeYaos[5] === 7 || safeYaos[5] === 9 ? 1 : 0,
  ]

  const benLower = linesToTrigramIndex(lowerLines)
  const benUpper = linesToTrigramIndex(upperLines)

  // 寻找动爻与变卦 (6变阳1，9变阴0)
  const movingYaos: number[] = []
  const bianLowerLines = [...lowerLines] as [number, number, number]
  const bianUpperLines = [...upperLines] as [number, number, number]

  safeYaos.forEach((y, idx) => {
    if (y === 6 || y === 9) {
      movingYaos.push(idx + 1) // 1-6
      if (idx < 3) {
        bianLowerLines[idx] = y === 6 ? 1 : 0
      } else {
        bianUpperLines[idx - 3] = y === 6 ? 1 : 0
      }
    }
  })

  const bianLower = linesToTrigramIndex(bianLowerLines)
  const bianUpper = linesToTrigramIndex(bianUpperLines)

  const benHex = getHexagramInfo(benUpper, benLower)
  const bianHex = getHexagramInfo(bianUpper, bianLower)

  const { reds, blues, derivationSteps } = derivePicksFromHexagram(
    lotteryType,
    benUpper,
    benLower,
    bianUpper,
    bianLower,
    safeYaos,
    movingYaos
  )

  // 生成多注备选方案 (五注)
  const multipleSets = Array.from({ length: 5 }, (_, setIdx) => {
    // 微调六爻偏置生成衍生组合
    const shiftedYaos = safeYaos.map((y, i) => (y + setIdx + i) % 4 + 6)
    const { reds: r, blues: b } = derivePicksFromHexagram(
      lotteryType,
      benUpper,
      benLower,
      bianUpper,
      bianLower,
      shiftedYaos,
      movingYaos
    )
    return { reds: r, blues: b }
  })

  return {
    method: 'coins_six_yao',
    methodName: '三枚铜钱·六爻纳甲抛卦',
    title: `得【${benHex.name}】${movingYaos.length > 0 ? `之【${bianHex.name}】` : '本卦'}`,
    signPoem: benHex.poem,
    oracleInterpretation: benHex.oracle,
    favorableDirection: benHex.favorableDirection,
    auspiciousHours: benHex.auspiciousHours,
    elementAffinity: userElement ? `${userElement}相生 · 纳甲归元` : `${TRIGRAMS[benUpper].elementZh}${TRIGRAMS[benLower].elementZh}交泰 · 纳甲归元`,
    redPicks: reds,
    bluePicks: blues,
    multipleSets,
    confidenceStars: 5,
    hexagramName: benHex.name,
    bianHexagramName: movingYaos.length > 0 ? bianHex.name : undefined,
    upperTrigramName: `${TRIGRAMS[benUpper].nature}${TRIGRAMS[benUpper].name}`,
    lowerTrigramName: `${TRIGRAMS[benLower].nature}${TRIGRAMS[benLower].name}`,
    movingYaos,
    yaos: safeYaos,
    derivationSteps,
  }
}

// -------------------------------------------------------------
// 2. 邵康节梅花易数·心念自主报数起卦 (心念感应)
// -------------------------------------------------------------
export function generateFromMindNumbers(
  lotteryType: LotteryType,
  num1: number,
  num2: number,
  hourNum: number = 7 // 默认辰时或当下时辰
): MetaphysicalResult {
  const n1 = Math.abs(Math.floor(num1)) || 1
  const n2 = Math.abs(Math.floor(num2)) || 1
  const h = Math.abs(Math.floor(hourNum)) || 1

  // 上卦：数一 % 8，余0为8坤
  const upperIdx = (n1 % 8) || 8
  // 下卦：数二 % 8，余0为8坤
  const lowerIdx = (n2 % 8) || 8
  // 动爻：(数一 + 数二 + 时辰) % 6，余0为6爻
  const movingYao = ((n1 + n2 + h) % 6) || 6

  const benHex = getHexagramInfo(upperIdx, lowerIdx)

  // 变卦逻辑
  const uLines = [...TRIGRAMS[upperIdx].lines] as [number, number, number]
  const lLines = [...TRIGRAMS[lowerIdx].lines] as [number, number, number]

  if (movingYao <= 3) {
    lLines[movingYao - 1] = lLines[movingYao - 1] === 1 ? 0 : 1
  } else {
    uLines[movingYao - 4] = uLines[movingYao - 4] === 1 ? 0 : 1
  }

  const bianUpper = linesToTrigramIndex(uLines)
  const bianLower = linesToTrigramIndex(lLines)
  const bianHex = getHexagramInfo(bianUpper, bianLower)

  // 构造模拟六爻
  const simYaos = [
    lLines[0] ? 7 : 8,
    lLines[1] ? 7 : 8,
    lLines[2] ? 7 : 8,
    uLines[0] ? 7 : 8,
    uLines[1] ? 7 : 8,
    uLines[2] ? 7 : 8,
  ]
  simYaos[movingYao - 1] = simYaos[movingYao - 1] === 7 ? 9 : 6

  const { reds, blues, derivationSteps } = derivePicksFromHexagram(
    lotteryType,
    upperIdx,
    lowerIdx,
    bianUpper,
    bianLower,
    simYaos,
    [movingYao]
  )

  // 添加梅花报数独有的数学公式推导步骤
  derivationSteps.unshift(
    `以心念上数 ${n1} ÷ 8 余 ${n1 % 8 || 8} 得上卦【${TRIGRAMS[upperIdx].name}】；下数 ${n2} ÷ 8 余 ${n2 % 8 || 8} 得下卦【${TRIGRAMS[lowerIdx].name}】。`,
    `总和 (${n1} + ${n2} + 时数${h}) = ${n1 + n2 + h} ÷ 6 余 ${movingYao}，定于第 ${movingYao} 爻发动，化为【${bianHex.name}】。`
  )

  const multipleSets = Array.from({ length: 5 }, (_, setIdx) => {
    const shift = setIdx + 1
    const { reds: r, blues: b } = derivePicksFromHexagram(
      lotteryType,
      upperIdx,
      lowerIdx,
      bianUpper,
      bianLower,
      simYaos.map((y) => (y + shift) % 4 + 6),
      [movingYao]
    )
    return { reds: r, blues: b }
  })

  return {
    method: 'meihua_mind',
    methodName: '邵康节梅花易数·心念报数',
    title: `报数【${n1}, ${n2}】· 定【${benHex.name}】变【${bianHex.name}】`,
    signPoem: benHex.poem,
    oracleInterpretation: `心念感应契合天地之几。${benHex.oracle}`,
    favorableDirection: benHex.favorableDirection,
    auspiciousHours: benHex.auspiciousHours,
    elementAffinity: '梅花易数 · 体用生克',
    redPicks: reds,
    bluePicks: blues,
    multipleSets,
    confidenceStars: 5,
    hexagramName: benHex.name,
    bianHexagramName: bianHex.name,
    upperTrigramName: `${TRIGRAMS[upperIdx].nature}${TRIGRAMS[upperIdx].name}`,
    lowerTrigramName: `${TRIGRAMS[lowerIdx].nature}${TRIGRAMS[lowerIdx].name}`,
    movingYaos: [movingYao],
    yaos: simYaos,
    derivationSteps,
  }
}

// -------------------------------------------------------------
// 3. 紫微灵签·心念摇签筒生成入口 (求签仪式)
// -------------------------------------------------------------
export function generateFromBambooSlip(
  lotteryType: LotteryType,
  slipIndex: number // 1-64
): MetaphysicalResult {
  const safeIdx = Math.max(1, Math.min(64, slipIndex))
  const u = ((safeIdx * 3) % 8) || 8
  const l = ((safeIdx * 7) % 8) || 8
  const benHex = getHexagramInfo(u, l)

  const yaos = [7, 8, 9, 7, 8, 7]
  const { reds, blues, derivationSteps } = derivePicksFromHexagram(
    lotteryType,
    u,
    l,
    u,
    l,
    yaos,
    [3]
  )

  derivationSteps.unshift(
    `虔诚晃动签筒，摇得第 ${safeIdx} 支上吉紫微神签。`,
    `签映紫微帝垣星宿，化出【${benHex.fullName}】祥瑞气数。`
  )

  const multipleSets = Array.from({ length: 5 }, (_, setIdx) => {
    const { reds: r, blues: b } = derivePicksFromHexagram(
      lotteryType,
      u,
      l,
      u,
      l,
      yaos.map((y) => (y + setIdx) % 4 + 6),
      [3]
    )
    return { reds: r, blues: b }
  })

  return {
    method: 'ziwei_bamboo',
    methodName: '紫微星垣·灵签摇筒法',
    title: `第 ${safeIdx} 签 · 【${benHex.name}】上吉签`,
    signPoem: benHex.poem,
    oracleInterpretation: `紫微财帛照临，摇得此灵签。${benHex.oracle}`,
    favorableDirection: benHex.favorableDirection,
    auspiciousHours: benHex.auspiciousHours,
    elementAffinity: '紫微星垣 · 财曜交照',
    redPicks: reds,
    bluePicks: blues,
    multipleSets,
    confidenceStars: 5,
    hexagramName: benHex.name,
    upperTrigramName: `${TRIGRAMS[u].nature}${TRIGRAMS[u].name}`,
    lowerTrigramName: `${TRIGRAMS[l].nature}${TRIGRAMS[l].name}`,
    derivationSteps,
  }
}

// -------------------------------------------------------------
// 4. 兼容老版本入口
// -------------------------------------------------------------
export function generateMetaphysicalNumbers(
  lotteryType: LotteryType,
  method: MetaphysicalMethod,
  userElement?: string
): MetaphysicalResult {
  if (method === 'coins_six_yao') {
    return generateFromCoinToss(lotteryType, [7, 8, 9, 7, 8, 7], userElement)
  }
  if (method === 'meihua_mind') {
    return generateFromMindNumbers(lotteryType, 168, 888, 7)
  }
  if (method === 'ziwei_bamboo') {
    return generateFromBambooSlip(lotteryType, 18)
  }
  // 默认调用三枚铜钱抛卦
  return generateFromCoinToss(lotteryType, [7, 8, 9, 7, 8, 7], userElement)
}
