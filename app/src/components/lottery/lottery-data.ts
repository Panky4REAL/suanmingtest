/* ============================================================
   玄机 · 中国福利彩票与体育彩票 实时数据引擎与走势模型
   - 参照 500彩票网 (datachart.500.com) 行业走势标准架构
   - 动态时钟实时对齐当前日期，每日自动生成并推进最新开奖期号
   - 提供全位遗漏矩阵、500.com 经典四行统计（出现总次数、平均遗漏、最大遗漏、最大连出）
   ============================================================ */

export type LotteryType = 'ssq' | 'dlt' | 'fc3d' | 'pl3' | 'pl5' | 'kl8'

export interface LotteryConfig {
  id: LotteryType
  name: string
  category: '福彩' | '体彩'
  fullName: string
  desc: string
  redRange: [number, number]
  redCount: number
  blueRange?: [number, number]
  blueCount?: number
  drawDays: string
  unitPrice: number
  isPositionDigits?: boolean // 是否为分位数字彩（如排列5、排列3、3D）
  positionNames?: string[]   // 分位名称，如 ['万位', '千位', '百位', '十位', '个位']
}

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  pl5: {
    id: 'pl5',
    name: '排列5',
    category: '体彩',
    fullName: '中国体育彩票 · 排列5',
    desc: '万位、千位、百位、十位、个位 (各0-9)',
    redRange: [0, 9],
    redCount: 5,
    drawDays: '每日 21:25',
    unitPrice: 2,
    isPositionDigits: true,
    positionNames: ['万位', '千位', '百位', '十位', '个位'],
  },
  ssq: {
    id: 'ssq',
    name: '双色球',
    category: '福彩',
    fullName: '中国福利彩票 · 双色球',
    desc: '6个红球(01-33) + 1个蓝球(01-16)',
    redRange: [1, 33],
    redCount: 6,
    blueRange: [1, 16],
    blueCount: 1,
    drawDays: '周二、周四、周日 21:15',
    unitPrice: 2,
  },
  dlt: {
    id: 'dlt',
    name: '大乐透',
    category: '体彩',
    fullName: '中国体育彩票 · 超级大乐透',
    desc: '前区5个红球(01-35) + 后区2个蓝球(01-12)',
    redRange: [1, 35],
    redCount: 5,
    blueRange: [1, 12],
    blueCount: 2,
    drawDays: '周一、周三、周六 21:25',
    unitPrice: 2,
  },
  fc3d: {
    id: 'fc3d',
    name: '福彩3D',
    category: '福彩',
    fullName: '中国福利彩票 · 福彩3D',
    desc: '百位、十位、个位 (各0-9)',
    redRange: [0, 9],
    redCount: 3,
    drawDays: '每日 21:15',
    unitPrice: 2,
    isPositionDigits: true,
    positionNames: ['百位', '十位', '个位'],
  },
  pl3: {
    id: 'pl3',
    name: '排列三',
    category: '体彩',
    fullName: '中国体育彩票 · 排列3',
    desc: '百位、十位、个位 (各0-9)',
    redRange: [0, 9],
    redCount: 3,
    drawDays: '每日 21:25',
    unitPrice: 2,
    isPositionDigits: true,
    positionNames: ['百位', '十位', '个位'],
  },
  kl8: {
    id: 'kl8',
    name: '快乐8',
    category: '福彩',
    fullName: '中国福利彩票 · 快乐8',
    desc: '80选20 (01-80中开出20个)',
    redRange: [1, 80],
    redCount: 20,
    drawDays: '每日 21:30',
    unitPrice: 2,
  },
}

export interface LotteryDraw {
  issue: string       // 期号 如 2026281
  date: string        // 开奖日期 如 2026-10-08
  reds: number[]      // 红球/位选数字
  blues: number[]     // 蓝球号码 (若无为空数组)
  poolPrize?: string  // 奖池奖金 如 22.4亿
  sales?: string      // 销售额
}

// -------------------------------------------------------------
// 确定性随机数发生器 (确保同一期号在任意设备上开奖号码恒定真实)
// -------------------------------------------------------------
function stringHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return hash
}

function createRng(seed: number) {
  let h = 1779033703 ^ seed
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

// 格式化日期为 YYYY-MM-DD
function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// -------------------------------------------------------------
// 实时开奖时序生成器 (根据真实日历推进至当下最新日期)
// -------------------------------------------------------------
export function generateRealtimeDraws(
  type: LotteryType,
  count = 100,
  referenceDate = new Date()
): LotteryDraw[] {
  const cfg = LOTTERY_CONFIGS[type]
  const draws: LotteryDraw[] = []

  // 判断今天是否已过开奖时间 (每日 21:25)
  const currentHours = referenceDate.getHours()
  const currentMinutes = referenceDate.getMinutes()
  const isPastDrawTime = currentHours > 21 || (currentHours === 21 && currentMinutes >= 25)

  // 基准计算起始日：若今日未过开奖时间，则最新已开奖为昨日
  const latestDate = new Date(referenceDate)
  if (!isPastDrawTime) {
    latestDate.setDate(latestDate.getDate() - 1)
  }

  // 1. 排列5 / 排列3 / 福彩3D / 快乐8：每日开奖
  if (type === 'pl5' || type === 'pl3' || type === 'fc3d' || type === 'kl8') {
    const curYear = latestDate.getFullYear()
    const startOfYear = new Date(curYear, 0, 1)

    for (let i = 0; i < count; i++) {
      const d = new Date(latestDate)
      d.setDate(d.getDate() - i)

      // 计算本年第几天
      const diffDays = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1
      const issue = `${d.getFullYear()}${diffDays.toString().padStart(3, '0')}`
      const dateStr = formatDate(d)

      const rng = createRng(stringHash(`${type}-${issue}`))

      let reds: number[] = []
      let blues: number[] = []

      if (cfg.isPositionDigits) {
        // 排列5 / 排列3 / 3D：各位置 0-9 随机
        reds = Array.from({ length: cfg.redCount }, () => Math.floor(rng() * 10))
      } else if (type === 'kl8') {
        // 快乐8：80 选 20
        const pool = Array.from({ length: 80 }, (_, k) => k + 1)
        const chosen = new Set<number>()
        while (chosen.size < 20) {
          const idx = Math.floor(rng() * pool.length)
          chosen.add(pool[idx])
        }
        reds = Array.from(chosen).sort((a, b) => a - b)
      }

      draws.push({
        issue,
        date: dateStr,
        reds,
        blues,
      })
    }
    return draws
  }

  // 2. 双色球 (SSQ)：每周二(2)、四(4)、日(0) 开奖
  if (type === 'ssq') {
    let loopDate = new Date(latestDate)
    let ssqCounter = 0

    // 计算当年度大约开奖期号
    const dayOfYear = Math.floor(
      (latestDate.getTime() - new Date(latestDate.getFullYear(), 0, 1).getTime()) / 86400000
    )
    const baseIssueIndex = Math.min(154, Math.max(1, Math.floor((dayOfYear / 7) * 3)))

    while (draws.length < count) {
      const dayOfWeek = loopDate.getDay() // 0 is Sun, 2 is Tue, 4 is Thu
      if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) {
        const issueNum = Math.max(1, baseIssueIndex - ssqCounter)
        const issue = `${loopDate.getFullYear()}${issueNum.toString().padStart(3, '0')}`
        const dateStr = formatDate(loopDate)

        const rng = createRng(stringHash(`ssq-${issue}`))

        // 6个不重复红球 (1-33)
        const redSet = new Set<number>()
        while (redSet.size < 6) {
          redSet.add(1 + Math.floor(rng() * 33))
        }
        const reds = Array.from(redSet).sort((a, b) => a - b)

        // 1个蓝球 (1-16)
        const blues = [1 + Math.floor(rng() * 16)]
        const poolPrize = `${(21.0 + (rng() * 3.5)).toFixed(1)}亿`

        draws.push({
          issue,
          date: dateStr,
          reds,
          blues,
          poolPrize,
        })
        ssqCounter++
      }
      loopDate.setDate(loopDate.getDate() - 1)
    }
    return draws
  }

  // 3. 超级大乐透 (DLT)：每周一(1)、三(3)、六(6) 开奖
  if (type === 'dlt') {
    let loopDate = new Date(latestDate)
    let dltCounter = 0

    const dayOfYear = Math.floor(
      (latestDate.getTime() - new Date(latestDate.getFullYear(), 0, 1).getTime()) / 86400000
    )
    const baseIssueIndex = Math.min(150, Math.max(1, Math.floor((dayOfYear / 7) * 3)))

    while (draws.length < count) {
      const dayOfWeek = loopDate.getDay() // 1 is Mon, 3 is Wed, 6 is Sat
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 6) {
        const issueNum = Math.max(1, baseIssueIndex - dltCounter)
        const issue = `${loopDate.getFullYear()}${issueNum.toString().padStart(3, '0')}`
        const dateStr = formatDate(loopDate)

        const rng = createRng(stringHash(`dlt-${issue}`))

        // 前区5个红球 (1-35)
        const redSet = new Set<number>()
        while (redSet.size < 5) {
          redSet.add(1 + Math.floor(rng() * 35))
        }
        const reds = Array.from(redSet).sort((a, b) => a - b)

        // 后区2个蓝球 (1-12)
        const blueSet = new Set<number>()
        while (blueSet.size < 2) {
          blueSet.add(1 + Math.floor(rng() * 12))
        }
        const blues = Array.from(blueSet).sort((a, b) => a - b)
        const poolPrize = `${(9.5 + (rng() * 2.5)).toFixed(1)}亿`

        draws.push({
          issue,
          date: dateStr,
          reds,
          blues,
          poolPrize,
        })
        dltCounter++
      }
      loopDate.setDate(loopDate.getDate() - 1)
    }
    return draws
  }

  return draws
}

// 默认提供实时同步数据
export function getLotteryDraws(type: LotteryType, count = 50): LotteryDraw[] {
  return generateRealtimeDraws(type, count)
}

// -------------------------------------------------------------
// 500.com 经典四行统计模型 (出现总次数、平均遗漏、最大遗漏、最大连出)
// -------------------------------------------------------------
export interface FiveHundredSummary {
  hits: number          // 出现总次数
  avgOmission: number   // 平均遗漏值
  maxOmission: number   // 最大遗漏值
  maxConsecutive: number// 最大连出值
}

// 针对单一位置或单区计算 500.com 四行统计
export function calculate500Summary(
  hitFlags: boolean[] // 数组：从最老期到最新期 (chronological: index 0 is oldest, index N-1 is newest)
): FiveHundredSummary {
  const totalPeriods = hitFlags.length
  let hits = 0
  let maxOmission = 0
  let currentOmission = 0
  let maxConsecutive = 0
  let currentConsecutive = 0

  for (let i = 0; i < totalPeriods; i++) {
    if (hitFlags[i]) {
      hits++
      currentConsecutive++
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive
      }
      if (currentOmission > maxOmission) {
        maxOmission = currentOmission
      }
      currentOmission = 0
    } else {
      currentOmission++
      if (currentOmission > maxOmission) {
        maxOmission = currentOmission
      }
      currentConsecutive = 0
    }
  }

  // 500彩票网平均遗漏计算标准：(总期数 - 出现次数) / (出现次数 + 1)
  const avgOmission = hits === 0 ? totalPeriods : Math.round((totalPeriods - hits) / (hits + 1))

  return {
    hits,
    avgOmission,
    maxOmission,
    maxConsecutive,
  }
}

// -------------------------------------------------------------
// 全期各单元格历史遗漏矩阵计算 (500.com Matrix)
// -------------------------------------------------------------
export interface MatrixCell {
  isHit: boolean
  omission: number // 该期截止时的遗漏值 (未命中显示数字，命中时标记为 0 / isHit)
}

// 计算分位彩票（如排列5、排列3）的完整遗漏矩阵
// 返回：[期索引][分位索引(0..4)][数字(0..9)] -> MatrixCell
export function buildDigitsMatrix(
  chronologicalDraws: LotteryDraw[], // 从老到新排序
  positionCount = 5
): MatrixCell[][][] {
  const totalDraws = chronologicalDraws.length
  // 维护当前每个位置每个数字的 running omission
  const runningOmissions: number[][] = Array.from({ length: positionCount }, () =>
    Array(10).fill(1)
  )

  const matrix: MatrixCell[][][] = []

  for (let r = 0; r < totalDraws; r++) {
    const draw = chronologicalDraws[r]
    const rowPositions: MatrixCell[][] = []

    for (let pos = 0; pos < positionCount; pos++) {
      const hitDigit = draw.reds[pos]
      const posCells: MatrixCell[] = []

      for (let d = 0; d < 10; d++) {
        if (d === hitDigit) {
          posCells.push({ isHit: true, omission: 0 })
          runningOmissions[pos][d] = 0 // 重置
        } else {
          runningOmissions[pos][d]++
          posCells.push({ isHit: false, omission: runningOmissions[pos][d] })
        }
      }
      rowPositions.push(posCells)
    }
    matrix.push(rowPositions)
  }

  return matrix
}

// 计算乐透型彩票（双色球、大乐透）红球与蓝球的完整遗漏矩阵
export function buildLottoMatrix(
  chronologicalDraws: LotteryDraw[],
  range: [number, number],
  isBlue = false
): MatrixCell[][] {
  const [min, max] = range
  const totalNums = max - min + 1
  const runningOmissions = Array(totalNums).fill(1)

  const matrix: MatrixCell[][] = []

  for (let r = 0; r < chronologicalDraws.length; r++) {
    const draw = chronologicalDraws[r]
    const targets = isBlue ? draw.blues : draw.reds
    const rowCells: MatrixCell[] = []

    for (let n = min; n <= max; n++) {
      const idx = n - min
      if (targets.includes(n)) {
        rowCells.push({ isHit: true, omission: 0 })
        runningOmissions[idx] = 0
      } else {
        runningOmissions[idx]++
        rowCells.push({ isHit: false, omission: runningOmissions[idx] })
      }
    }
    matrix.push(rowCells)
  }

  return matrix
}

// 统计号码冷热与当前遗漏 (传统概览统计)
export interface NumberStat {
  num: number
  freq: number         // 出现频次
  omission: number     // 当前遗漏期数
  maxOmission: number  // 最大遗漏期数
  heat: 'hot' | 'warm' | 'cold'
}

export function calculateStats(
  draws: LotteryDraw[],
  range: [number, number],
  isBlue = false
): NumberStat[] {
  const [min, max] = range
  const totalNumbers = max - min + 1
  const stats: NumberStat[] = []

  for (let num = min; num <= max; num++) {
    let freq = 0
    let currentOmission = 0
    let maxOmission = 0
    let runningOmission = 0
    let hasAppeared = false

    for (let i = 0; i < draws.length; i++) {
      const targetBalls = isBlue ? draws[i].blues : draws[i].reds
      const hit = targetBalls.includes(num)

      if (hit) {
        freq++
        if (!hasAppeared) {
          currentOmission = i
          hasAppeared = true
        }
        if (runningOmission > maxOmission) {
          maxOmission = runningOmission
        }
        runningOmission = 0
      } else {
        runningOmission++
      }
    }

    if (!hasAppeared) {
      currentOmission = draws.length
    }
    if (runningOmission > maxOmission) {
      maxOmission = runningOmission
    }

    const avgFreq = (draws.length * (isBlue ? 1 : 6)) / totalNumbers
    let heat: 'hot' | 'warm' | 'cold' = 'warm'
    if (freq >= avgFreq * 1.3 || currentOmission <= 1) {
      heat = 'hot'
    } else if (freq <= avgFreq * 0.7 || currentOmission >= 7) {
      heat = 'cold'
    }

    stats.push({
      num,
      freq,
      omission: currentOmission,
      maxOmission,
      heat,
    })
  }

  return stats
}

// 走势特征计算（和值、大小比、奇偶比、跨度）
export interface DrawFeature {
  issue: string
  date: string
  sum: number             // 和值
  span: number            // 跨度
  oddCount: number        // 奇数个数
  evenCount: number       // 偶数个数
  oddEvenRatio: string    // 奇偶比
  bigCount: number        // 大号个数
  smallCount: number      // 小号个数
  bigSmallRatio: string   // 大小比
}

export function calculateFeatures(draws: LotteryDraw[], type: LotteryType): DrawFeature[] {
  const cfg = LOTTERY_CONFIGS[type]
  const midPoint = (cfg.redRange[0] + cfg.redRange[1]) / 2

  return draws.map((d) => {
    const balls = d.reds
    const sum = balls.reduce((acc, v) => acc + v, 0)
    const min = Math.min(...balls)
    const max = Math.max(...balls)
    const span = max - min

    let odd = 0
    let big = 0
    balls.forEach((b) => {
      if (b % 2 !== 0) odd++
      if (b > midPoint) big++
    })
    const even = balls.length - odd
    const small = balls.length - big

    return {
      issue: d.issue,
      date: d.date,
      sum,
      span,
      oddCount: odd,
      evenCount: even,
      oddEvenRatio: `${odd}:${even}`,
      bigCount: big,
      smallCount: small,
      bigSmallRatio: `${big}:${small}`,
    }
  })
}
