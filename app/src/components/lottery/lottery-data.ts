/* ============================================================
   玄机 · 中国福利彩票与体育彩票 数据定义与分析计算模型
   - 涵盖：双色球(SSQ)、大乐透(DLT)、福彩3D(3D)、排列三(P3)、快乐8(KL8)
   - 提供开奖记录、号码区间、冷热遗漏统计、和值/奇偶/大小计算
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
}

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
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
  },
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
  issue: string       // 期号 如 2026028
  date: string        // 开奖日期 如 2026-03-24
  reds: number[]      // 红球/前区号码
  blues: number[]     // 蓝球/后区号码 (若无为空数组)
  poolPrize?: string  // 奖池奖金 如 21.8亿
  sales?: string      // 销售额
}

// 模拟近 30 期的真实分布样例数据 (以双色球、大乐透、3D、排列3为主)
export const SSQ_RECENT_DRAWS: LotteryDraw[] = [
  { issue: '2026030', date: '2026-03-26', reds: [4, 9, 14, 18, 26, 31], blues: [7], poolPrize: '22.4亿' },
  { issue: '2026029', date: '2026-03-24', reds: [2, 11, 16, 21, 27, 33], blues: [12], poolPrize: '22.1亿' },
  { issue: '2026028', date: '2026-03-22', reds: [5, 8, 12, 19, 23, 29], blues: [4], poolPrize: '21.9亿' },
  { issue: '2026027', date: '2026-03-19', reds: [1, 7, 15, 22, 28, 30], blues: [15], poolPrize: '21.5亿' },
  { issue: '2026026', date: '2026-03-17', reds: [3, 10, 14, 18, 25, 32], blues: [9], poolPrize: '21.2亿' },
  { issue: '2026025', date: '2026-03-15', reds: [6, 12, 17, 20, 24, 29], blues: [6], poolPrize: '20.8亿' },
  { issue: '2026024', date: '2026-03-12', reds: [4, 9, 13, 21, 26, 31], blues: [11], poolPrize: '20.6亿' },
  { issue: '2026023', date: '2026-03-10', reds: [7, 11, 19, 23, 28, 33], blues: [2], poolPrize: '20.3亿' },
  { issue: '2026022', date: '2026-03-08', reds: [2, 8, 16, 22, 27, 30], blues: [14], poolPrize: '20.1亿' },
  { issue: '2026021', date: '2026-03-05', reds: [5, 14, 18, 20, 25, 32], blues: [8], poolPrize: '19.9亿' },
  { issue: '2026020', date: '2026-03-03', reds: [1, 9, 13, 17, 26, 29], blues: [5], poolPrize: '19.7亿' },
  { issue: '2026019', date: '2026-03-01', reds: [6, 10, 15, 21, 24, 31], blues: [13], poolPrize: '19.4亿' },
  { issue: '2026018', date: '2026-02-26', reds: [3, 12, 19, 23, 28, 30], blues: [7], poolPrize: '19.2亿' },
  { issue: '2026017', date: '2026-02-24', reds: [4, 8, 11, 18, 27, 33], blues: [16], poolPrize: '19.0亿' },
  { issue: '2026016', date: '2026-02-22', reds: [7, 14, 16, 22, 25, 29], blues: [3], poolPrize: '18.7亿' },
  { issue: '2026015', date: '2026-02-19', reds: [2, 9, 13, 20, 24, 32], blues: [10], poolPrize: '18.5亿' },
  { issue: '2026014', date: '2026-02-17', reds: [5, 11, 17, 21, 26, 31], blues: [1], poolPrize: '18.2亿' },
  { issue: '2026013', date: '2026-02-15', reds: [3, 8, 15, 19, 28, 30], blues: [12], poolPrize: '18.0亿' },
  { issue: '2026012', date: '2026-02-12', reds: [6, 10, 14, 23, 27, 33], blues: [6], poolPrize: '17.8亿' },
  { issue: '2026011', date: '2026-02-10', reds: [1, 7, 12, 18, 22, 29], blues: [9], poolPrize: '17.5亿' },
]

export const DLT_RECENT_DRAWS: LotteryDraw[] = [
  { issue: '2026032', date: '2026-03-25', reds: [3, 12, 18, 25, 34], blues: [2, 9], poolPrize: '10.5亿' },
  { issue: '2026031', date: '2026-03-23', reds: [5, 14, 22, 28, 31], blues: [6, 11], poolPrize: '10.2亿' },
  { issue: '2026030', date: '2026-03-21', reds: [1, 9, 16, 24, 35], blues: [4, 8], poolPrize: '10.1亿' },
  { issue: '2026029', date: '2026-03-18', reds: [8, 11, 19, 27, 32], blues: [3, 10], poolPrize: '9.8亿' },
  { issue: '2026028', date: '2026-03-16', reds: [4, 15, 21, 29, 33], blues: [1, 7], poolPrize: '9.6亿' },
  { issue: '2026027', date: '2026-03-14', reds: [2, 10, 17, 23, 30], blues: [5, 12], poolPrize: '9.4亿' },
  { issue: '2026026', date: '2026-03-11', reds: [7, 13, 20, 26, 34], blues: [2, 8], poolPrize: '9.2亿' },
  { issue: '2026025', date: '2026-03-09', reds: [6, 16, 22, 28, 35], blues: [4, 11], poolPrize: '9.0亿' },
  { issue: '2026024', date: '2026-03-07', reds: [3, 8, 14, 25, 31], blues: [3, 9], poolPrize: '8.8亿' },
  { issue: '2026023', date: '2026-03-04', reds: [5, 12, 19, 24, 32], blues: [6, 10], poolPrize: '8.6亿' },
  { issue: '2026022', date: '2026-03-02', reds: [2, 11, 18, 27, 33], blues: [1, 5], poolPrize: '8.4亿' },
  { issue: '2026021', date: '2026-02-28', reds: [9, 15, 23, 29, 34], blues: [7, 12], poolPrize: '8.2亿' },
]

export const FC3D_RECENT_DRAWS: LotteryDraw[] = [
  { issue: '2026078', date: '2026-03-25', reds: [4, 8, 2], blues: [] },
  { issue: '2026077', date: '2026-03-24', reds: [7, 1, 9], blues: [] },
  { issue: '2026076', date: '2026-03-23', reds: [3, 5, 0], blues: [] },
  { issue: '2026075', date: '2026-03-22', reds: [8, 2, 6], blues: [] },
  { issue: '2026074', date: '2026-03-21', reds: [1, 9, 4], blues: [] },
  { issue: '2026073', date: '2026-03-20', reds: [6, 3, 7], blues: [] },
  { issue: '2026072', date: '2026-03-19', reds: [0, 4, 8], blues: [] },
  { issue: '2026071', date: '2026-03-18', reds: [5, 2, 1], blues: [] },
  { issue: '2026070', date: '2026-03-17', reds: [9, 7, 3], blues: [] },
  { issue: '2026069', date: '2026-03-16', reds: [2, 8, 5], blues: [] },
]

export const PL3_RECENT_DRAWS: LotteryDraw[] = [
  { issue: '2026078', date: '2026-03-25', reds: [6, 2, 9], blues: [] },
  { issue: '2026077', date: '2026-03-24', reds: [3, 8, 1], blues: [] },
  { issue: '2026076', date: '2026-03-23', reds: [5, 0, 7], blues: [] },
  { issue: '2026075', date: '2026-03-22', reds: [9, 4, 2], blues: [] },
  { issue: '2026074', date: '2026-03-21', reds: [1, 6, 8], blues: [] },
  { issue: '2026073', date: '2026-03-20', reds: [7, 3, 5], blues: [] },
]

export const PL5_RECENT_DRAWS: LotteryDraw[] = [
  { issue: '2026078', date: '2026-03-25', reds: [6, 2, 9, 4, 1], blues: [] },
  { issue: '2026077', date: '2026-03-24', reds: [3, 8, 1, 7, 5], blues: [] },
  { issue: '2026076', date: '2026-03-23', reds: [5, 0, 7, 2, 8], blues: [] },
  { issue: '2026075', date: '2026-03-22', reds: [9, 4, 2, 6, 3], blues: [] },
  { issue: '2026074', date: '2026-03-21', reds: [1, 6, 8, 0, 9], blues: [] },
  { issue: '2026073', date: '2026-03-20', reds: [7, 3, 5, 8, 2], blues: [] },
  { issue: '2026072', date: '2026-03-19', reds: [4, 9, 0, 1, 6], blues: [] },
  { issue: '2026071', date: '2026-03-18', reds: [2, 5, 7, 3, 8], blues: [] },
  { issue: '2026070', date: '2026-03-17', reds: [8, 1, 4, 9, 0], blues: [] },
  { issue: '2026069', date: '2026-03-16', reds: [0, 7, 3, 5, 2], blues: [] },
]

export const KL8_RECENT_DRAWS: LotteryDraw[] = [
  {
    issue: '2026078',
    date: '2026-03-25',
    reds: [3, 7, 12, 16, 21, 25, 29, 34, 38, 42, 47, 51, 56, 60, 63, 67, 71, 74, 78, 80],
    blues: [],
  },
  {
    issue: '2026077',
    date: '2026-03-24',
    reds: [1, 5, 9, 14, 18, 22, 27, 31, 35, 40, 44, 49, 53, 58, 62, 65, 69, 73, 76, 79],
    blues: [],
  },
]

// 获取指定彩种的历史数据
export function getLotteryDraws(type: LotteryType): LotteryDraw[] {
  switch (type) {
    case 'ssq':
      return SSQ_RECENT_DRAWS
    case 'dlt':
      return DLT_RECENT_DRAWS
    case 'fc3d':
      return FC3D_RECENT_DRAWS
    case 'pl3':
      return PL3_RECENT_DRAWS
    case 'pl5':
      return PL5_RECENT_DRAWS
    case 'kl8':
      return KL8_RECENT_DRAWS
    default:
      return SSQ_RECENT_DRAWS
  }
}

// 统计号码冷热与当前遗漏
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

    // 从最新的开奖开始遍历
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

    // 热温冷判断 (根据频次与遗漏)
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
