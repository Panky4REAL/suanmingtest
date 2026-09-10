/* ============================================================
   生辰输入表单 - 扶桑东方雅致羊皮纸风格
   ============================================================ */

import { useState } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { generateChart, getShichenOptions, type BirthInfo, type Gender } from '@/lib/astro'
import { useChartStore, useProfileStore } from '@/stores'

const currentYear = new Date().getFullYear()

const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}年`,
}))

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}月`,
}))

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}日`,
}))

const HOUR_OPTIONS = getShichenOptions()

const GENDER_OPTIONS = [
  { value: 'male', label: '乾造 · 男命', icon: '♂' },
  { value: 'female', label: '坤造 · 女命', icon: '♀' },
]

interface BirthFormProps {
  onGoToSample?: () => void
}

export function BirthForm({ onGoToSample }: BirthFormProps) {
  const { setBirthInfo, setChart } = useChartStore()
  const { profiles, addHistory, completeTask, setMBTIResult, mbtiType } = useProfileStore()

  const [name, setName] = useState('灵官 (本人)')
  const [year, setYear] = useState(1995)
  const [month, setMonth] = useState(8)
  const [day, setDay] = useState(18)
  const [hour, setHour] = useState(12)
  const [gender, setGender] = useState<Gender>('male')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const birthInfo: BirthInfo = { year, month, day, hour, gender }
      const chart = generateChart(birthInfo)

      setBirthInfo(birthInfo)
      setChart(chart)

      // 提取命宫星曜记录至历史
      const lifePalace = chart.palaces.find((p) => p.name === '命宫')
      const stars = lifePalace ? lifePalace.majorStars.map((s) => s.name) : []

      addHistory({
        name: name.trim() || '客官',
        birthInfo,
        lifePalaceMajorStars: stars,
        bureau: chart.fiveElementsClass || '五行局',
        zodiac: `${chart.chineseDate} · ${chart.solarDate}`,
        mbti: mbtiType,
      })

      completeTask('generate_kline', 15, '生成人生 K 线与大运排盘')
    } catch (error) {
      console.error('排盘失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 从已有档案库快速选择填入
  const handleSelectProfile = (p: (typeof profiles)[0]) => {
    setName(p.name)
    setYear(p.year)
    setMonth(p.month)
    setDay(p.day)
    setHour(p.hour)
    setGender(p.gender)
    if (p.mbti) {
      setMBTIResult(p.mbti)
    }
  }

  // 快速载入演示案例
  const handleQuickDemo = () => {
    const demoInfo: BirthInfo = { year: 1992, month: 8, day: 15, hour: 12, gender: 'male' }
    const chart = generateChart(demoInfo)
    setBirthInfo(demoInfo)
    setChart(chart)

    addHistory({
      name: '示范案例 (壬申天同天梁)',
      birthInfo: demoInfo,
      lifePalaceMajorStars: ['天同', '天梁'],
      bureau: '水二局',
      zodiac: '1992年 猴',
      mbti: mbtiType,
    })
    completeTask('generate_kline', 15, '生成人生 K 线')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative w-full max-w-lg p-6 sm:p-8
        bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl
        shadow-[0_16px_40px_rgba(111,82,35,0.08)]
      "
    >
      {/* 顶部印章与标题 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="fusang-seal text-xs">扶桑算法</span>
          <span className="text-xs font-serif text-[#879397]">中州派安星诀 · 纯正太阴历</span>
        </div>
        <h2
          className="text-2xl font-bold font-serif-sc text-[#1e2f34] tracking-tight"
        >
          输入出生时间 · 排定人生K线
        </h2>
        <p className="text-xs sm:text-sm text-[#52666a] mt-1">
          将生辰八字转化为百年大运K线与命运分身
        </p>
      </div>

      {/* 快速体验快捷入口 */}
      <div className="mb-6 p-3 rounded-2xl bg-[#f7f1e7]/70 border border-[#dcd3c1]/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <span className="text-xs text-[#52666a]">初次使用？无需输入即可试用</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#176f63]/10 text-[#176f63] font-semibold hover:bg-[#176f63]/20 transition-colors"
          >
            一键载入样例
          </button>
          {onGoToSample && (
            <button
              type="button"
              onClick={onGoToSample}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#c58a28]/15 text-[#8A5B21] font-semibold hover:bg-[#c58a28]/25 transition-colors"
            >
              浏览案例库 →
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* 档案库快捷选择与姓名 */}
        <div className="space-y-2">
          {profiles.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[11px] font-serif text-[#789087] shrink-0">从档案载入:</span>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProfile(p)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-serif bg-white border border-[#dcd3c1] text-[#24453f] hover:border-[#176f63] hover:text-[#176f63] shrink-0 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-serif-sc font-medium text-[#52666a] mb-1">
              测算人姓名 / 称谓
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：灵官、伴侣、父亲"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-white focus:outline-hidden focus:border-[#176f63] font-serif"
            />
          </div>
        </div>

        {/* 出生日期区块 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif-sc font-medium text-[#52666a]">
              出生公历（阳历）日期
            </span>
            <span
              className="
                text-[10px] px-2 py-0.5 rounded-full
                bg-[#176f63]/10 text-[#176f63] border border-[#176f63]/20
              "
            >
              自动转农历
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Select
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
            <Select
              options={MONTH_OPTIONS}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
            <Select
              options={DAY_OPTIONS}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            />
          </div>
        </div>

        {/* 出生时辰 */}
        <Select
          label="出生时辰 (23:00后为晚子时自动归属次日)"
          options={HOUR_OPTIONS}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
        />

        {/* 性别选择 */}
        <div className="space-y-1.5">
          <span className="text-xs font-serif-sc font-medium text-[#52666a]">
            命造性别 (决定顺逆大运流向)
          </span>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  group relative flex-1 py-2.5 px-4 rounded-xl
                  flex items-center justify-center gap-2
                  cursor-pointer transition-all duration-200 border
                  ${gender === opt.value
                    ? 'bg-[#176f63] border-[#176f63] text-white shadow-sm'
                    : 'bg-white border-[#dcd3c1] text-[#52666a] hover:border-[#176f63]/40'
                  }
                `}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={gender === opt.value}
                  onChange={() => setGender(opt.value as Gender)}
                  className="sr-only"
                />
                <span className="text-sm font-serif-sc font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 出生地（可选） */}
        <Input
          label="出生城市（可选，用于校正真太阳时）"
          placeholder="例如：北京、上海、成都、深圳"
        />

        {/* 提交按钮 */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full btn-fusang font-serif-sc font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                正在严密排星推算中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>生成完整人生K线与命盘</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 底部提示 */}
      <p className="text-[11px] text-[#879397] text-center mt-5 font-serif">
        系统尊重隐私，所有生辰运算与命盘推演完全在您本地浏览器端执行
      </p>
    </form>
  )
}
