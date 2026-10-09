/* ============================================================
   玄机 · 福彩体彩走势图鉴与玄学选号主视图 (LotteryView)
   - 包含走势图鉴（双色球、大乐透、福彩3D、排列3、快乐8）
   - 包含玄学数理选号（易经梅花易数、五行河图洛书、紫微星曜、奇门遁甲）
   ============================================================ */

import { useState } from 'react'
import { LotteryTrendChart } from './LotteryTrendChart'
import { MetaphysicalPicker } from './MetaphysicalPicker'

type ActiveSection = 'trends' | 'metaphysical'

export function LotteryView() {
  const [section, setSection] = useState<ActiveSection>('trends')

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* 顶部主横幅 */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#176f63]/25 bg-[#176f63]/5 text-[#176f63] text-xs font-serif mb-3">
          <span>❖ 玄机 · 彩数易理</span>
          <span className="opacity-40">|</span>
          <span>福彩体彩大数据走势 × 周易玄学灵动选号</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34] tracking-tight">
          天数机变 · 走势图鉴与灵机定数
        </h2>
        <p className="mt-2 text-sm text-[#52666a]">
          观历史号码之冷热盛衰，参易数五行之生发克制。大数据理性分析与传统玄学灵签相融。
        </p>
      </div>

      {/* 走势 vs 选号 切换大Tab */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-white/80 border border-[#dcd3c1] shadow-2xs flex items-center gap-2">
          <button
            onClick={() => setSection('trends')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-serif-sc text-sm font-bold transition-all duration-200
              ${section === 'trends'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
              }
            `}
          >
            <span>📊</span>
            <span>号码走势图鉴</span>
          </button>
          <button
            onClick={() => setSection('metaphysical')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-serif-sc text-sm font-bold transition-all duration-200
              ${section === 'metaphysical'
                ? 'bg-[#176f63] text-white shadow-xs'
                : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
              }
            `}
          >
            <span>🔮</span>
            <span>玄学起卦选号</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#c58a28] text-white font-mono">
              灵签
            </span>
          </button>
        </div>
      </div>

      {/* 内容主体 */}
      {section === 'trends' ? <LotteryTrendChart /> : <MetaphysicalPicker />}
    </div>
  )
}
