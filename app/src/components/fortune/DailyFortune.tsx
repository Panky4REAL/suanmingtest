/* ============================================================
   扶桑 · 每日运势 (Daily Fortune)
   对标 lifekline.ai 的 /daily-fortune 功能：
   推算今日公历/农历干支流日、今日运势得分、吉凶方位、
   时辰宜忌、流日四化与当日决策指引。
   ============================================================ */

import { useMemo, useState } from 'react'
import { useChartStore } from '@/stores'

const SHICHEN_NAMES = [
  '子时 (23:00-01:00)',
  '丑时 (01:00-03:00)',
  '寅时 (03:00-05:00)',
  '卯时 (05:00-07:00)',
  '辰时 (07:00-09:00)',
  '巳时 (09:00-11:00)',
  '午时 (11:00-13:00)',
  '未时 (13:00-15:00)',
  '申时 (15:00-17:00)',
  '酉时 (17:00-19:00)',
  '戌时 (19:00-21:00)',
  '亥时 (21:00-23:00)',
]

export function DailyFortune() {
  const { chart } = useChartStore()
  const [selectedShichen, setSelectedShichen] = useState<number>(new Date().getHours() >= 23 ? 0 : Math.floor((new Date().getHours() + 1) / 2) % 12)

  const todayInfo = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]

    // 天干地支算法 (简易公历转换)
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    // 基于天数生成平滑伪随机种子
    const daySeed = year * 365 + month * 31 + date
    const ganIndex = (daySeed + 6) % 10
    const zhiIndex = (daySeed + 2) % 12
    const todayGanZhi = `${tianGan[ganIndex]}${diZhi[zhiIndex]}`

    // 运势分与吉凶状态
    const scoreBase = 72 + ((daySeed * 17) % 25)
    const level = scoreBase >= 85 ? '大吉' : scoreBase >= 75 ? '小吉' : scoreBase >= 60 ? '顺遂' : '平稳'

    // 今日四化
    const sihuaMap: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
      甲: { lu: '廉贞化禄', quan: '破军化权', ke: '武曲化科', ji: '太阳化忌' },
      乙: { lu: '天机化禄', quan: '天梁化权', ke: '紫微化科', ji: '太阴化忌' },
      丙: { lu: '天同化禄', quan: '天机化权', ke: '文昌化科', ji: '廉贞化忌' },
      丁: { lu: '太阴化禄', quan: '天同化权', ke: '天机化科', ji: '巨门化忌' },
      戊: { lu: '贪狼化禄', quan: '太阴化权', ke: '右弼化科', ji: '天机化忌' },
      己: { lu: '武曲化禄', quan: '贪狼化权', ke: '天梁化科', ji: '文曲化忌' },
      庚: { lu: '太阳化禄', quan: '武曲化权', ke: '太阴化科', ji: '天同化忌' },
      辛: { lu: '巨门化禄', quan: '太阳化权', ke: '文曲化科', ji: '文昌化忌' },
      壬: { lu: '天梁化禄', quan: '紫微化权', ke: '左辅化科', ji: '武曲化忌' },
      癸: { lu: '破军化禄', quan: '巨门化权', ke: '太阴化科', ji: '贪狼化忌' },
    }
    const currentGan = tianGan[ganIndex]
    const todaySihua = sihuaMap[currentGan] || sihuaMap['甲']

    // 宜忌清单
    const dos = [
      '宜 · 深度战略复盘与重要文案推敲',
      '宜 · 约见长线合作伙伴与智囊引荐',
      '宜 · 处理银行资产沉淀与财帛规划',
      '宜 · 散步冥想吸收天地山川清气',
    ]

    const donts = [
      '忌 · 情绪上头进行不可逆的冲动决断',
      '忌 · 涉足边界模糊的高杠杆投机交易',
      '忌 · 晚睡熬夜耗散心肾相交之神气',
      '忌 · 与认知维度不符之人进行言辞辩驳',
    ]

    // 12 时辰吉凶流速
    const shichenScores = Array.from({ length: 12 }, (_, i) => {
      const s = 60 + ((daySeed + i * 19) % 36)
      return {
        shichen: SHICHEN_NAMES[i],
        name: SHICHEN_NAMES[i].slice(0, 2),
        score: s,
        status: s >= 80 ? '吉' : s >= 68 ? '平' : '慎',
        tip: s >= 80 ? '谋定而动，诸事多合' : s >= 68 ? '和顺自然，按部就班' : '宜守勿动，谨慎核查',
      }
    })

    return {
      dateStr: `${year}年${month}月${date}日 ${dayOfWeek}`,
      todayGanZhi,
      score: scoreBase,
      level,
      todaySihua,
      dos,
      donts,
      luckyDirection: ['正东 (青龙)', '东南 (巽吉)', '西南 (申吉)'][daySeed % 3],
      luckyColor: ['黛绿 / 青碧', '琥珀金 / 杏黄', '玄墨 / 霜白'][daySeed % 3],
      shichenScores,
    }
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* 顶部标题区 */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#176f63]/25 bg-[#176f63]/5 text-[#176f63] text-xs font-serif mb-3">
          <span>❖ 扶桑 · 天地节律</span>
          <span className="opacity-40">|</span>
          <span>今日流日干支星象</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34] tracking-tight">
          每日运势 · 时辰吉凶与行止宜忌
        </h2>
        <p className="mt-2 text-sm text-[#52666a]">
          “万物负阴而抱阳，冲气以为和。” 顺应天地流日星象转机，知所进退。
        </p>
      </div>

      {/* 今日总体运势主卡片 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#dcd3c1]/70">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="fusang-seal text-xs">今日值日</span>
              <span className="text-sm font-serif-sc font-bold text-[#1e2f34]">
                {todayInfo.dateStr}
              </span>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[#c58a28]/15 text-[#8A5B21]">
                {todayInfo.todayGanZhi}日
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
              今日天象总览：天地中和，{todayInfo.level}之象
            </h3>
            <p className="text-xs sm:text-sm text-[#52666a]">
              {chart?.palaces.find((p) => p.name === '命宫')?.majorStars?.[0]?.name
                ? `命主坐【${chart.palaces.find((p) => p.name === '命宫')?.majorStars?.[0]?.name}】：今日气场逢吉星护持，动静相宜，从容笃定。`
                : '适宜守正出奇，以温润之气协调人际，抓住突如其来的灵感顿悟。'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-[#879397] block font-serif">今日运势指数</span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl sm:text-4xl font-black font-serif-sc text-[#176f63]">
                  {todayInfo.score}
                </span>
                <span className="text-xs font-bold text-[#8A5B21]">/ 100</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#176f63]/10 border border-[#176f63]/20 text-center">
              <span className="text-xs text-[#55736b] block">综合定性</span>
              <span className="text-base font-serif-sc font-bold text-[#176f63]">
                {todayInfo.level}
              </span>
            </div>
          </div>
        </div>

        {/* 吉凶方位与流日四化 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60">
            <p className="text-xs text-[#879397] font-semibold">今日吉方</p>
            <p className="text-base font-serif-sc font-bold text-[#1e2f34] mt-1">
              {todayInfo.luckyDirection}
            </p>
            <p className="text-[11px] text-[#52666a] mt-0.5">利商务洽谈与外出</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60">
            <p className="text-xs text-[#879397] font-semibold">喜神幸运色</p>
            <p className="text-base font-serif-sc font-bold text-[#1e2f34] mt-1">
              {todayInfo.luckyColor}
            </p>
            <p className="text-[11px] text-[#52666a] mt-0.5">提升个人气场与从容感</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60">
            <p className="text-xs text-[#879397] font-semibold">流日化禄</p>
            <p className="text-base font-serif-sc font-bold text-[#176f63] mt-1">
              ✦ {todayInfo.todaySihua.lu}
            </p>
            <p className="text-[11px] text-[#52666a] mt-0.5">财帛通达与机缘眷顾</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/60">
            <p className="text-xs text-[#879397] font-semibold">流日化忌 (慎)</p>
            <p className="text-base font-serif-sc font-bold text-[#c0392b] mt-1">
              ⚠ {todayInfo.todaySihua.ji}
            </p>
            <p className="text-[11px] text-[#52666a] mt-0.5">此领域需保持谨严戒骄</p>
          </div>
        </div>

        {/* 宜忌对照榜 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 宜 */}
          <div className="p-5 rounded-2xl bg-[#176f63]/5 border border-[#176f63]/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#176f63] text-white text-xs flex items-center justify-center font-bold">
                宜
              </span>
              <h4 className="font-serif-sc font-bold text-sm text-[#176f63]">
                今日顺应之道 (Recommended)
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#1e2f34] pt-1">
              {todayInfo.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#176f63] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 忌 */}
          <div className="p-5 rounded-2xl bg-[#c0392b]/5 border border-[#c0392b]/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#c0392b] text-white text-xs flex items-center justify-center font-bold">
                忌
              </span>
              <h4 className="font-serif-sc font-bold text-sm text-[#c0392b]">
                今日避坑防范 (Avoid)
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#1e2f34] pt-1">
              {todayInfo.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#c0392b] font-bold">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 十二时辰流变时轴 */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#dcd3c1] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif-sc text-[#1e2f34]">
            十二时辰节律流转 (Hourly Energy Flow)
          </h3>
          <span className="text-xs text-[#879397]">点击时辰查看具体吉凶指引</span>
        </div>

        {/* 12时辰胶囊横向流 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {todayInfo.shichenScores.map((sc, i) => {
            const isSelected = selectedShichen === i
            return (
              <button
                key={i}
                onClick={() => setSelectedShichen(i)}
                className={`
                  p-2.5 rounded-xl border text-center transition-all duration-150
                  ${isSelected
                    ? 'bg-[#176f63] text-white border-[#176f63] shadow-sm'
                    : 'bg-[#f7f1e7]/60 border-[#dcd3c1] hover:bg-white text-[#1e2f34]'
                  }
                `}
              >
                <p className="text-xs font-bold font-serif-sc">{sc.name}</p>
                <p className={`text-[11px] mt-1 font-mono font-bold ${isSelected ? 'text-[#f5e6c5]' : sc.score >= 80 ? 'text-[#176f63]' : 'text-[#879397]'}`}>
                  {sc.score}分
                </p>
                <span className={`text-[10px] px-1.5 py-0.2 rounded mt-1 inline-block ${
                  isSelected ? 'bg-white/20 text-white' : sc.status === '吉' ? 'bg-[#176f63]/10 text-[#176f63]' : 'bg-[#dcd3c1]/40 text-[#52666a]'
                }`}>
                  {sc.status}
                </span>
              </button>
            )
          })}
        </div>

        {/* 选中时辰详情 */}
        <div className="p-4 rounded-2xl bg-[#f7f1e7]/70 border border-[#dcd3c1]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#8A5B21] mr-2">
              【{todayInfo.shichenScores[selectedShichen].shichen}】
            </span>
            <span className="text-sm font-serif-sc text-[#1e2f34] font-semibold">
              运势状态：{todayInfo.shichenScores[selectedShichen].status} ({todayInfo.shichenScores[selectedShichen].score}分)
            </span>
          </div>
          <p className="text-xs text-[#52666a]">
            时辰行止指引：{todayInfo.shichenScores[selectedShichen].tip}
          </p>
        </div>
      </div>
    </div>
  )
}
