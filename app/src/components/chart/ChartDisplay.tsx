/* ============================================================
   命盘可视化组件 - 扶桑东方雅致羊皮纸风格
   对齐文墨天机中州派标准：
   - 完整星曜 + 亮度（庙旺平陷）
   - 宫干 + 大限范围
   - 博士/长生十二神 + 杂曜
   - 命主/身主 + 纳音五行
   ============================================================ */

import { useState } from 'react'
import { useChartStore } from '@/stores'
import type { FunctionalAstrolabe } from '@/lib/astro'

/* ------------------------------------------------------------
   十二宫位置映射 (顺时针外周)
   ------------------------------------------------------------ */

const PALACE_POSITIONS: Record<string, { row: number; col: number }> = {
  '巳': { row: 0, col: 0 }, '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 }, '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 }, '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 }, '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 }, '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 }, '亥': { row: 3, col: 3 },
}

/* ------------------------------------------------------------
   纳音五行表
   ------------------------------------------------------------ */

const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

function getNayin(ganZhi: string): string {
  return NAYIN_TABLE[ganZhi] || ''
}

const BRIGHTNESS_STYLE: Record<string, string> = {
  '庙': 'text-[#176f63] font-bold',
  '旺': 'text-[#c58a28] font-bold',
  '得': 'text-[#55736b]',
  '利': 'text-[#55736b]',
  '平': 'text-[#879397]',
  '不': 'text-[#c0392b]/70',
  '陷': 'text-[#c0392b] font-bold',
}

interface StarData {
  name: string
  brightness?: string
  mutagen?: string
}

interface PalaceData {
  name: string
  stem: string
  branch: string
  majorStars: StarData[]
  minorStars: StarData[]
  adjectiveStars: string[]
  decadal: { range: [number, number] }
  boshi12: string
  changsheng12: string
  isLife: boolean
  isBody: boolean
}

function StarTag({ star, showBrightness = true }: { star: StarData; showBrightness?: boolean }) {
  const { name, brightness, mutagen } = star
  const brightnessStyle = brightness ? BRIGHTNESS_STYLE[brightness] || '' : ''

  const mutagenBadge = {
    '禄': 'bg-[#176f63] text-white',
    '权': 'bg-[#c58a28] text-white',
    '科': 'bg-[#2563eb] text-white',
    '忌': 'bg-[#c0392b] text-white',
  }[mutagen || ''] || ''

  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] px-1 py-0.5 rounded bg-white/70 border border-[#dcd3c1]/60 text-[#1e2f34]">
      <span className="font-serif-sc font-medium">{name}</span>
      {showBrightness && brightness && (
        <span className={`text-[9px] ${brightnessStyle}`}>{brightness}</span>
      )}
      {mutagen && (
        <span className={`text-[9px] px-1 rounded-xs font-bold ${mutagenBadge}`}>
          {mutagen}
        </span>
      )}
    </span>
  )
}

function PalaceCard({
  name, stem, branch, majorStars, minorStars, adjectiveStars, decadal,
  boshi12, changsheng12, isLife, isBody, isSelected, onClick,
}: PalaceData & { isSelected?: boolean; onClick?: () => void }) {
  const decadalRange = decadal?.range ? `${decadal.range[0]}-${decadal.range[1]}` : ''

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-2 lg:p-3 h-full min-h-[140px] lg:min-h-[175px] flex flex-col
        backdrop-blur-sm rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs
        ${isLife
          ? 'bg-[#176f63]/5 border-[#176f63] ring-1 ring-[#176f63]/50'
          : isBody
          ? 'bg-[#c58a28]/5 border-[#c58a28] ring-1 ring-[#c58a28]/50'
          : 'bg-white/90 border-[#dcd3c1] hover:border-[#176f63]/50 hover:bg-white'
        }
        ${isSelected ? 'ring-2 ring-[#176f63] shadow-md' : ''}
      `}
    >
      {/* 宫位头部: 宫干支 + 宫名 + 大限 */}
      <div className="flex items-center justify-between mb-1.5 text-[11px]">
        <span className="font-mono text-[#879397] font-semibold">{stem}{branch}</span>
        <div className="flex items-center gap-1">
          {decadalRange && (
            <span className="text-[#176f63] font-mono text-[10px]">{decadalRange}</span>
          )}
          <span className={`
            px-1.5 py-0.2 rounded font-serif-sc font-bold
            ${isLife ? 'bg-[#176f63] text-white text-[10px]' : ''}
            ${isBody && !isLife ? 'bg-[#c58a28] text-white text-[10px]' : ''}
            ${!isLife && !isBody ? 'text-[#1e2f34]' : ''}
          `}>
            {name}
          </span>
        </div>
      </div>

      {/* 主星 */}
      <div className="flex flex-wrap gap-1 mb-1">
        {majorStars.length > 0 ? (
          majorStars.map((star, i) => <StarTag key={i} star={star} />)
        ) : (
          <span className="text-[10px] text-[#879397] font-serif italic">无主星 (借对宫)</span>
        )}
      </div>

      {/* 辅星 */}
      <div className="flex flex-wrap gap-1 mb-1">
        {minorStars.map((star, i) => (
          <StarTag key={i} star={star} showBrightness={false} />
        ))}
      </div>

      {/* 杂曜 */}
      {adjectiveStars.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mb-1 flex-1">
          {adjectiveStars.slice(0, 4).map((starName, i) => (
            <span key={i} className="text-[9px] px-1 py-0.2 rounded bg-[#f7f1e7] text-[#879397]">
              {starName}
            </span>
          ))}
        </div>
      )}

      {/* 底部: 长生 + 博士 */}
      <div className="flex justify-between text-[10px] text-[#879397] mt-auto pt-1 border-t border-[#dcd3c1]/50 font-serif">
        <span>{changsheng12}</span>
        <span>{boshi12}</span>
      </div>
    </div>
  )
}

function CenterInfo({ chart, solarDate, gender }: { chart: FunctionalAstrolabe; solarDate: string; gender: string }) {
  const yearGanZhi = chart.chineseDate?.split(' ')[0] || ''
  const nayin = getNayin(yearGanZhi)

  return (
    <div className="
      relative h-full min-h-[280px] lg:min-h-[360px] p-4 lg:p-6
      flex flex-col items-center justify-center
      bg-gradient-to-br from-white/95 to-[#fbf8f1]
      backdrop-blur-md border border-[#dcd3c1] rounded-2xl shadow-sm
    ">
      <div className="flex items-center gap-2 mb-2">
        <span className="fusang-seal text-xs">中宫大统</span>
      </div>

      <h3 className="text-xl font-bold font-serif-sc text-[#1e2f34] mb-3">
        扶桑 · 紫微斗数命盘
      </h3>

      <div className="text-xs lg:text-sm text-[#52666a] space-y-1.5 text-center font-serif">
        <p><span className="text-[#879397]">公历：</span> <span className="text-[#1e2f34] font-medium">{solarDate}</span></p>
        <p><span className="text-[#879397]">农历：</span> <span className="text-[#1e2f34] font-medium">{chart.lunarDate}</span></p>
        <p><span className="text-[#879397]">四柱：</span> <span className="text-[#176f63] font-mono font-semibold">{chart.chineseDate}</span></p>
        <p><span className="text-[#879397]">时辰：</span> <span className="text-[#1e2f34]">{chart.time} ({chart.timeRange})</span></p>
        <p><span className="text-[#879397]">造命：</span> <span className="text-[#1e2f34] font-medium">{gender}命</span></p>
        {nayin && (
          <p><span className="text-[#879397]">纳音：</span> <span className="text-[#8A5B21] font-bold">{nayin}</span></p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#dcd3c1]/70 w-full text-center">
        <div className="flex justify-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/25">
            {chart.fiveElementsClass}
          </span>
        </div>
        <div className="flex justify-center gap-4 text-xs font-serif">
          <p><span className="text-[#879397]">命主：</span><strong className="text-[#8A5B21]">{chart.soul}</strong></p>
          <p><span className="text-[#879397]">身主：</span><strong className="text-[#176f63]">{chart.body}</strong></p>
        </div>
      </div>
    </div>
  )
}

function parsePalaces(chart: FunctionalAstrolabe): PalaceData[] {
  return (chart.palaces || []).map((palace) => {
    const majorStars: StarData[] = (palace.majorStars || []).map((s) => ({
      name: s.name as string,
      brightness: s.brightness as string | undefined,
      mutagen: s.mutagen as string | undefined,
    }))

    const minorStars: StarData[] = (palace.minorStars || []).map((s) => ({
      name: s.name as string,
      brightness: s.brightness as string | undefined,
      mutagen: s.mutagen as string | undefined,
    }))

    const adjectiveStars: string[] = ((palace as any).adjectiveStars || []).map(
      (s: any) => s.name as string
    )

    return {
      name: palace.name as string,
      stem: palace.heavenlyStem as string,
      branch: palace.earthlyBranch as string,
      majorStars,
      minorStars,
      adjectiveStars,
      decadal: palace.decadal as { range: [number, number] },
      boshi12: palace.boshi12 as string || '',
      changsheng12: palace.changsheng12 as string || '',
      isLife: palace.name === '命宫',
      isBody: palace.isBodyPalace === true,
    }
  })
}

export function ChartDisplay() {
  const { chart, birthInfo } = useChartStore()
  const [selectedPalace, setSelectedPalace] = useState<string | null>(null)

  if (!chart || !birthInfo) return null

  const palaceData = parsePalaces(chart)
  const grid: (PalaceData | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null))

  palaceData.forEach((p) => {
    const pos = PALACE_POSITIONS[p.branch]
    if (pos) grid[pos.row][pos.col] = p
  })

  const solarDate = `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日`
  const gender = birthInfo.gender === 'male' ? '乾造·男' : '坤造·女'

  const renderPalace = (palace: PalaceData | null, key: string) => {
    if (!palace) return <div key={key} />
    return (
      <PalaceCard
        key={key}
        {...palace}
        isSelected={selectedPalace === palace.name}
        onClick={() => setSelectedPalace(palace.name === selectedPalace ? null : palace.name)}
      />
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-fade-in">
      {/* 4x4 网格排盘 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Row 0: 巳 午 未 申 */}
        {renderPalace(grid[0][0], 'si')}
        {renderPalace(grid[0][1], 'wu')}
        {renderPalace(grid[0][2], 'wei')}
        {renderPalace(grid[0][3], 'shen')}

        {/* Row 1: 辰 + 中宫 (2x2) + 酉 */}
        {renderPalace(grid[1][0], 'chen')}
        <div className="col-span-2 row-span-2">
          <CenterInfo chart={chart} solarDate={solarDate} gender={gender} />
        </div>
        {renderPalace(grid[1][3], 'you')}

        {/* Row 2: 卯 + 戌 */}
        {renderPalace(grid[2][0], 'mao')}
        {renderPalace(grid[2][3], 'xu')}

        {/* Row 3: 寅 丑 子 亥 */}
        {renderPalace(grid[3][0], 'yin')}
        {renderPalace(grid[3][1], 'chou')}
        {renderPalace(grid[3][2], 'zi')}
        {renderPalace(grid[3][3], 'hai')}
      </div>
    </div>
  )
}
