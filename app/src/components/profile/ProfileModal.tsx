/* ============================================================
   扶桑 · 档案新建/编辑弹窗 (ProfileModal)
   - 支持姓名、关系称谓、性别、历法、年月日时分设置
   - 关联 MBTI 认知人格类型
   - 支持设为默认优先排盘档案
   ============================================================ */

import { useState, useEffect } from 'react'
import { getShichenOptions, type Gender } from '@/lib/astro'
import { useProfileStore, type BirthProfile, type RelationType } from '@/stores'
import { MBTI_METAS, type MBTIType } from '@/lib/mbti'

interface ProfileModalProps {
  initialData?: BirthProfile | null
  onClose: () => void
  onSaved?: (id: string) => void
}

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

const RELATION_OPTIONS: Array<{ value: RelationType; label: string }> = [
  { value: 'self', label: '本人 (自己)' },
  { value: 'partner', label: '伴侣 (配偶/恋人)' },
  { value: 'father', label: '父亲 (堂上)' },
  { value: 'mother', label: '母亲 (慈严)' },
  { value: 'child', label: '子女 (晚辈)' },
  { value: 'friend', label: '挚友 (同道)' },
  { value: 'business', label: '合伙人 (商业伙伴)' },
  { value: 'other', label: '其他缘分' },
]

export function ProfileModal({ initialData, onClose, onSaved }: ProfileModalProps) {
  const { addProfile, updateProfile } = useProfileStore()

  const [name, setName] = useState('')
  const [relation, setRelation] = useState<RelationType>('self')
  const [gender, setGender] = useState<Gender>('male')
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar')
  const [year, setYear] = useState(1995)
  const [month, setMonth] = useState(8)
  const [day, setDay] = useState(18)
  const [hour, setHour] = useState(12)
  const [mbti, setMbti] = useState<string>('INTJ')
  const [isDefault, setIsDefault] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setRelation(initialData.relation)
      setGender(initialData.gender)
      setCalendar(initialData.calendar)
      setYear(initialData.year)
      setMonth(initialData.month)
      setDay(initialData.day)
      setHour(initialData.hour)
      setMbti(initialData.mbti || 'INTJ')
      setIsDefault(initialData.isDefault)
      setNotes(initialData.notes || '')
    } else {
      setName('')
      setRelation('self')
      setGender('male')
      setCalendar('solar')
      setYear(1995)
      setMonth(8)
      setDay(18)
      setHour(12)
      setMbti('INTJ')
      setIsDefault(false)
      setNotes('')
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (initialData) {
      updateProfile(initialData.id, {
        name: name.trim(),
        relation,
        gender,
        calendar,
        year,
        month,
        day,
        hour,
        mbti,
        isDefault,
        notes: notes.trim(),
      })
      onSaved?.(initialData.id)
    } else {
      const newId = addProfile({
        name: name.trim(),
        relation,
        gender,
        calendar,
        year,
        month,
        day,
        hour,
        mbti,
        isDefault,
        notes: notes.trim(),
      })
      onSaved?.(newId)
    }

    onClose()
  }

  const allMBTIKeys = Object.keys(MBTI_METAS) as MBTIType[]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1e2f34]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#dcd3c1]/70">
          <div className="flex items-center gap-2">
            <span className="fusang-seal text-xs">档案名录</span>
            <h3 className="font-serif-sc font-bold text-lg text-[#24453f]">
              {initialData ? '编辑命理档案' : '新建生辰档案'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 姓名与称谓 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
                姓名 / 备注称呼 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：灵官、伴侣、父亲"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
                关系称谓
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as RelationType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              >
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 性别与历法 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
                性别命造
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 text-xs font-serif-sc rounded-xl border transition-colors ${
                    gender === 'male'
                      ? 'border-[#176f63] bg-[#176f63] text-white font-bold'
                      : 'border-[#dcd3c1] bg-white text-[#52666a]'
                  }`}
                >
                  乾造 · 男
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 text-xs font-serif-sc rounded-xl border transition-colors ${
                    gender === 'female'
                      ? 'border-[#176f63] bg-[#176f63] text-white font-bold'
                      : 'border-[#dcd3c1] bg-white text-[#52666a]'
                  }`}
                >
                  坤造 · 女
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
                输入历法
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalendar('solar')}
                  className={`py-2 text-xs font-serif-sc rounded-xl border transition-colors ${
                    calendar === 'solar'
                      ? 'border-[#c58a28] bg-[#c58a28] text-white font-bold'
                      : 'border-[#dcd3c1] bg-white text-[#52666a]'
                  }`}
                >
                  公历 (阳历)
                </button>
                <button
                  type="button"
                  onClick={() => setCalendar('lunar')}
                  className={`py-2 text-xs font-serif-sc rounded-xl border transition-colors ${
                    calendar === 'lunar'
                      ? 'border-[#c58a28] bg-[#c58a28] text-white font-bold'
                      : 'border-[#dcd3c1] bg-white text-[#52666a]'
                  }`}
                >
                  农历 (阴历)
                </button>
              </div>
            </div>
          </div>

          {/* 出生年月日时 */}
          <div>
            <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
              出生时间 (年月日时)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-2 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              >
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-2 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              >
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="px-2 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              >
                {DAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="px-2 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63]"
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 关联 MBTI 类型 */}
          <div>
            <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
              认知心理型格 (MBTI)
            </label>
            <select
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63] font-mono"
            >
              {allMBTIKeys.map((k) => (
                <option key={k} value={k}>
                  {k} - {MBTI_METAS[k].chineseTitle}
                </option>
              ))}
            </select>
          </div>

          {/* 命理备注 */}
          <div>
            <label className="block text-xs font-serif-sc font-semibold text-[#24453f] mb-1">
              档案备注
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：命带文昌天魁，贵人旺盛..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-[#fffdf9] focus:outline-hidden focus:border-[#176f63] font-serif"
            />
          </div>

          {/* 设为默认 */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultProfile"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-[#dcd3c1] text-[#176f63] focus:ring-[#176f63]"
            />
            <label htmlFor="isDefaultProfile" className="text-xs font-serif text-[#52666a]">
              设为默认档案（系统优先以此档案载入K线大运）
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dcd3c1]/70">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-serif text-[#52666a] hover:bg-black/5"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-fusang px-5 py-2 rounded-xl text-xs font-bold font-serif-sc shadow-xs"
            >
              {initialData ? '保存修改' : '新建档案 (功德+15)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
