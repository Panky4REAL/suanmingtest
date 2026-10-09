/* ============================================================
   玄机 · 福彩体彩走势图鉴与双轨选号主视图 (LotteryView)
   - 包含三大核心板块：
     1. 📊 号码走势图鉴 (全维分位走势大表 + 冷热遗漏)
     2. 🧮 算法规律推荐 (和值均值回归、冷热温码、邻重号、012路余数)
     3. 🔮 周易互动起卦 (六爻掷铜钱、梅花易数报数、紫微摇签)
   ============================================================ */

import { useState } from 'react'
import { LotteryTrendChart } from './LotteryTrendChart'
import { AlgorithmicPicker } from './AlgorithmicPicker'
import { MetaphysicalPicker } from './MetaphysicalPicker'

type ActiveSection = 'trends' | 'algorithmic' | 'metaphysical'

export function LotteryView() {
  const [section, setSection] = useState<ActiveSection>('trends')

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* 顶部主横幅 */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#176f63]/25 bg-[#176f63]/5 text-[#176f63] text-xs font-serif mb-3">
          <span>❖ 玄机 · 彩数易理</span>
          <span className="opacity-40">|</span>
          <span>全维分位走势 × 科学量化算法 × 周易互动起卦</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34] tracking-tight">
          天数机变 · 走势图鉴与定数推演
        </h2>
        <p className="mt-2 text-sm text-[#52666a]">
          观历史号码之冷热盛衰，参易数五行之生发克制。大数据量化推演与周易亲手起卦相融。
        </p>
      </div>

      {/* 三大板块切换导航 */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-white/80 border border-[#dcd3c1] shadow-2xs flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
          <button
            onClick={() => setSection('trends')}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-serif-sc text-sm font-bold transition-all duration-200
              ${section === 'trends'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
              }
            `}
          >
            <span>📊</span>
            <span>分位走势大表</span>
          </button>

          <button
            onClick={() => setSection('algorithmic')}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-serif-sc text-sm font-bold transition-all duration-200
              ${section === 'algorithmic'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
              }
            `}
          >
            <span>🧮</span>
            <span>算法规律推荐</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#176f63]/20 text-[#176f63] font-mono">
              量化
            </span>
          </button>

          <button
            onClick={() => setSection('metaphysical')}
            className={`
              flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-serif-sc text-sm font-bold transition-all duration-200
              ${section === 'metaphysical'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
              }
            `}
          >
            <span>🔮</span>
            <span>周易互动起卦</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#c58a28] text-white font-mono">
              互动
            </span>
          </button>
        </div>
      </div>

      {/* 内容主体 */}
      {section === 'trends' && <LotteryTrendChart />}
      {section === 'algorithmic' && <AlgorithmicPicker />}
      {section === 'metaphysical' && <MetaphysicalPicker />}
    </div>
  )
}
