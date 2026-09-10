/* ============================================================
   扶桑 · MBTI 交互测评问卷 (MBTI Quiz)
   - 16 道精炼情境题，每维度 4 题 (E/I, S/N, T/F, J/P)
   - 东方水墨宣纸美学与现代认知心理学思辨融合
   - 支持“直接选择已有 MBTI”极速通道
   - 答题完毕自动核算百分比并奖励 +20 功德
   ============================================================ */

import { useState } from 'react'
import {
  MBTI_QUESTIONS,
  MBTI_METAS,
  type MBTIType,
  type MBTIDimension,
} from '@/lib/mbti'
import { useProfileStore } from '@/stores'

interface MBTIQuizProps {
  onComplete: (mbti: MBTIType) => void
  onCancel?: () => void
}

export function MBTIQuiz({ onComplete, onCancel }: MBTIQuizProps) {
  const { setMBTIResult, mbtiType } = useProfileStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, MBTIDimension>>({})
  const [showQuickSelect, setShowQuickSelect] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [calculatedType, setCalculatedType] = useState<MBTIType | null>(null)

  const currentQ = MBTI_QUESTIONS[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / MBTI_QUESTIONS.length) * 100)

  // 处理选择
  const handleSelectOption = (dim: MBTIDimension) => {
    const updated = { ...answers, [currentQ.id]: dim }
    setAnswers(updated)

    if (currentIndex < MBTI_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // 计算最终 MBTI 类型与维度百分比
      computeAndFinish(updated)
    }
  }

  // 结算计算
  const computeAndFinish = (finalAnswers: Record<number, MBTIDimension>) => {
    let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0

    Object.values(finalAnswers).forEach((dim) => {
      if (dim === 'E') E++
      if (dim === 'I') I++
      if (dim === 'S') S++
      if (dim === 'N') N++
      if (dim === 'T') T++
      if (dim === 'F') F++
      if (dim === 'J') J++
      if (dim === 'P') P++
    })

    const dimResult = {
      E: Math.round((E / 4) * 100),
      I: Math.round((I / 4) * 100),
      S: Math.round((S / 4) * 100),
      N: Math.round((N / 4) * 100),
      T: Math.round((T / 4) * 100),
      F: Math.round((F / 4) * 100),
      J: Math.round((J / 4) * 100),
      P: Math.round((P / 4) * 100),
    }

    const typeStr = `${E >= I ? 'E' : 'I'}${N >= S ? 'N' : 'S'}${T >= F ? 'T' : 'F'}${J >= P ? 'J' : 'P'}` as MBTIType

    setCalculatedType(typeStr)
    setIsFinished(true)
    setMBTIResult(typeStr, dimResult)
  }

  // 极速直接选择已有 MBTI
  const handleQuickPick = (type: MBTIType) => {
    setCalculatedType(type)
    setMBTIResult(type)
    onComplete(type)
  }

  const allMBTIKeys = Object.keys(MBTI_METAS) as MBTIType[]

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* 快捷直选模态窗 */}
      {showQuickSelect && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQuickSelect(false)}
        >
          <div
            className="w-full max-w-xl bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1e2f34]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
              <div className="flex items-center gap-2">
                <span className="fusang-seal text-xs">速选档案</span>
                <h3 className="font-serif-sc font-bold text-lg text-[#24453f]">
                  直接选用已知 MBTI 类型
                </h3>
              </div>
              <button
                onClick={() => setShowQuickSelect(false)}
                className="w-7 h-7 rounded-full bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6e7d82] font-serif">
              若您曾完成过 MBTI 测验，可直接点击下方对应人格卡片，即刻跳过答题生成全息综合报告：
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {allMBTIKeys.map((key) => {
                const meta = MBTI_METAS[key]
                const isCurrent = mbtiType === key
                return (
                  <button
                    key={key}
                    onClick={() => handleQuickPick(key)}
                    className={`
                      p-3 rounded-2xl border text-left transition-all duration-150 relative group
                      ${isCurrent
                        ? 'border-[#176f63] bg-[#176f63]/10 ring-2 ring-[#176f63]/30'
                        : 'border-[#dcd3c1] bg-[#fffdfa] hover:border-[#176f63]/50 hover:bg-white hover:shadow-xs'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-base text-[#176f63]">
                        {key}
                      </span>
                      <span className="text-[10px] px-1 rounded bg-[#c58a28]/15 text-[#8A5B21] font-serif">
                        {meta.temperament.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs font-serif-sc font-bold text-[#24453f] mt-1 truncate">
                      {meta.chineseTitle.split('·')[0].trim()}
                    </p>
                    <p className="text-[10px] text-[#789087] mt-0.5 truncate">
                      {meta.archetype}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowQuickSelect(false)}
                className="px-4 py-2 rounded-xl text-xs font-serif text-[#52666a] hover:bg-black/5"
              >
                返回逐题答测
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 测评完成祝贺卡片 */}
      {isFinished && calculatedType ? (
        <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#176f63] to-[#c58a28] text-white flex items-center justify-center mx-auto shadow-md">
            <span className="text-2xl font-black font-serif-sc">印</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#176f63]/10 text-[#176f63] text-xs font-serif mb-2">
              <span>✦ 测评完成 · 功德 +20 ✦</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-sc text-[#1e2f34]">
              您的认知人格类型是：
              <span className="text-[#176f63] ml-2 font-mono">{calculatedType}</span>
            </h2>
            <p className="text-sm font-serif text-[#52666a] mt-1">
              【{MBTI_METAS[calculatedType].chineseTitle}】· {MBTI_METAS[calculatedType].archetype}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#52666a] leading-relaxed max-w-lg mx-auto font-serif bg-[#f7f1e7]/70 p-4 rounded-2xl border border-[#dcd3c1]">
            {MBTI_METAS[calculatedType].shortDesc}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onComplete(calculatedType)}
              className="btn-fusang px-6 py-3 rounded-2xl text-sm font-bold font-serif-sc shadow-md"
            >
              开启【紫微 × {calculatedType}】全息深度分析 →
            </button>
            <button
              onClick={() => {
                setIsFinished(false)
                setCurrentIndex(0)
                setAnswers({})
              }}
              className="px-5 py-3 rounded-2xl border border-[#dcd3c1] bg-white text-xs font-serif text-[#52666a] hover:bg-[#f7f1e7]"
            >
              重新作答
            </button>
          </div>
        </div>
      ) : (
        /* 作答主卡片 */
        <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* 顶栏进度与速选按钮 */}
          <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
            <div className="flex items-center gap-2">
              <span className="fusang-seal text-xs">扶桑心律</span>
              <span className="text-xs font-serif text-[#789087]">
                第 {currentIndex + 1} / {MBTI_QUESTIONS.length} 题
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickSelect(true)}
                className="text-xs font-serif px-2.5 py-1 rounded-lg bg-[#c58a28]/15 text-[#8A5B21] font-semibold hover:bg-[#c58a28]/25 transition-colors"
              >
                ⚡ 我已知晓，直接选择
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-[#879397] hover:text-[#176f63]"
                >
                  关闭
                </button>
              )}
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-[#e8e2d4] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#176f63] to-[#c58a28] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 题目情境与主干 */}
          <div className="space-y-2 text-center py-2">
            <span className="text-xs px-3 py-1 rounded-full bg-[#f7f1e7] text-[#8A5B21] border border-[#dcd3c1] font-serif inline-block">
              情境 · {currentQ.scenario}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-serif-sc text-[#1e2f34] pt-1 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* 选项 A & B */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleSelectOption(currentQ.optionA.dimension)}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border border-[#dcd3c1] bg-[#fffdf9] hover:border-[#176f63] hover:bg-[#176f63]/5 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-white border border-[#dcd3c1] group-hover:border-[#176f63] group-hover:bg-[#176f63] group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 text-[#52666a] transition-colors">
                  A
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif-sc font-bold text-[#1e2f34] group-hover:text-[#176f63]">
                    {currentQ.optionA.text}
                  </p>
                  <p className="text-xs text-[#789087] mt-1 font-serif">
                    {currentQ.optionA.subtext}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectOption(currentQ.optionB.dimension)}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border border-[#dcd3c1] bg-[#fffdf9] hover:border-[#c58a28] hover:bg-[#c58a28]/5 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-white border border-[#dcd3c1] group-hover:border-[#c58a28] group-hover:bg-[#c58a28] group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 text-[#52666a] transition-colors">
                  B
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif-sc font-bold text-[#1e2f34] group-hover:text-[#8A5B21]">
                    {currentQ.optionB.text}
                  </p>
                  <p className="text-xs text-[#789087] mt-1 font-serif">
                    {currentQ.optionB.subtext}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* 底部前后题切换 */}
          <div className="flex items-center justify-between pt-3 border-t border-[#dcd3c1]/70 text-xs font-serif text-[#789087]">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="hover:text-[#176f63] disabled:opacity-40 disabled:hover:text-[#789087]"
            >
              ← 上一题
            </button>
            <span className="font-mono">{progressPercent}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
