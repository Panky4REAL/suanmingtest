/* ============================================================
   扶桑 · 档案管理中心 (BirthProfiles)
   对标 lifekline.ai/profile/birth-profiles
   - 多命盘档案展示与分类筛选
   - 一键切换排盘 (自动同步 K 线、分身、运势与十二宫盘)
   - 设为默认、编辑、删除与新增档案
   ============================================================ */

import { useState } from 'react'
import {
  useProfileStore,
  useChartStore,
  type BirthProfile,
  type RelationType,
} from '@/stores'
import { generateChart, type BirthInfo } from '@/lib/astro'
import { ProfileModal } from './ProfileModal'

interface BirthProfilesProps {
  onSwitchToKline?: () => void
  onSwitchToMatch?: (profile: BirthProfile) => void
}

const RELATION_LABELS: Record<RelationType, { label: string; color: string }> = {
  self: { label: '本人', color: 'bg-[#176f63]/15 text-[#176f63]' },
  partner: { label: '伴侣', color: 'bg-rose-100 text-rose-700' },
  father: { label: '父亲', color: 'bg-blue-100 text-blue-700' },
  mother: { label: '母亲', color: 'bg-purple-100 text-purple-700' },
  child: { label: '子女', color: 'bg-amber-100 text-amber-700' },
  friend: { label: '挚友', color: 'bg-emerald-100 text-emerald-700' },
  business: { label: '合伙人', color: 'bg-indigo-100 text-indigo-700' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
}

export function BirthProfiles({ onSwitchToKline, onSwitchToMatch }: BirthProfilesProps) {
  const { profiles, deleteProfile, setDefaultProfile, setMBTIResult } = useProfileStore()
  const { setBirthInfo, setChart } = useChartStore()

  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<BirthProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤档案
  const filteredProfiles = profiles.filter((p) => {
    if (activeFilter !== 'all' && p.relation !== activeFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.mbti && p.mbti.toLowerCase().includes(q))
      )
    }
    return true
  })

  // 一键切换排盘
  const handleSwitchChart = (p: BirthProfile) => {
    const bInfo: BirthInfo = {
      year: p.year,
      month: p.month,
      day: p.day,
      hour: p.hour,
      gender: p.gender,
    }
    const newChart = generateChart(bInfo)
    setBirthInfo(bInfo)
    setChart(newChart)

    if (p.mbti) {
      setMBTIResult(p.mbti)
    }

    onSwitchToKline?.()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 弹窗 */}
      {modalOpen && (
        <ProfileModal
          initialData={editingProfile}
          onClose={() => {
            setModalOpen(false)
            setEditingProfile(null)
          }}
        />
      )}

      {/* 头部标题与新建按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dcd3c1]/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="fusang-seal text-xs">档案中心</span>
            <h2 className="font-serif-sc font-bold text-xl sm:text-2xl text-[#1e2f34]">
              命理档案库 · 多人排盘管理
            </h2>
          </div>
          <p className="text-xs text-[#789087] font-serif mt-1">
            已收录 <span className="font-mono font-bold text-[#176f63]">{profiles.length}</span> 位命理人物，支持一键切换百年K线与双人合盘
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProfile(null)
            setModalOpen(true)
          }}
          className="btn-fusang px-4 py-2.5 rounded-2xl text-xs font-bold font-serif-sc shadow-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>＋ 新建生辰档案</span>
        </button>
      </div>

      {/* 搜索与分类筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* 关系标签筛选 */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { key: 'all', label: '全部' },
            { key: 'self', label: '本人' },
            { key: 'partner', label: '伴侣' },
            { key: 'father', label: '长辈' },
            { key: 'child', label: '子女' },
            { key: 'friend', label: '亲友' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-colors
                ${activeFilter === tab.key
                  ? 'bg-[#176f63] text-white font-bold shadow-2xs'
                  : 'bg-white/80 text-[#52666a] border border-[#dcd3c1] hover:bg-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 关键字搜索 */}
        <div className="w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索姓名、MBTI或备注..."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#dcd3c1] bg-white/90 focus:outline-hidden focus:border-[#176f63] font-serif"
          />
        </div>
      </div>

      {/* 档案卡片列表 */}
      {filteredProfiles.length === 0 ? (
        <div className="p-12 text-center bg-white/60 backdrop-blur-xs rounded-3xl border border-dashed border-[#dcd3c1] space-y-3">
          <p className="text-sm font-serif text-[#52666a]">暂无匹配的命理档案</p>
          <button
            onClick={() => {
              setEditingProfile(null)
              setModalOpen(true)
            }}
            className="text-xs text-[#176f63] font-bold hover:underline"
          >
            ＋ 立即新建一个档案
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => {
            const relationInfo = RELATION_LABELS[p.relation] || RELATION_LABELS.other
            return (
              <div
                key={p.id}
                className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* 默认档案角标印章 */}
                {p.isDefault && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-[10px] font-serif-sc font-bold px-2 py-0.5 rounded-bl-xl bg-[#c58a28] text-white shadow-2xs">
                      默认主盘
                    </span>
                  </div>
                )}

                {/* 卡片头部：关系徽章与操作 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-serif font-semibold px-2.5 py-0.5 rounded-full ${relationInfo.color}`}>
                      {relationInfo.label}
                    </span>
                    <span className="text-xs text-[#879397] font-serif">
                      {p.gender === 'male' ? '♂ 乾造' : '♀ 坤造'}
                    </span>
                    {p.mbti && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#176f63]/10 text-[#176f63] font-bold">
                        {p.mbti}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingProfile(p)
                        setModalOpen(true)
                      }}
                      className="w-6 h-6 rounded-lg bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1]"
                      title="编辑档案"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要删除档案【${p.name}】吗？`)) {
                          deleteProfile(p.id)
                        }
                      }}
                      className="w-6 h-6 rounded-lg bg-[#f7f1e7] text-rose-500 flex items-center justify-center text-xs hover:bg-rose-100"
                      title="删除档案"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 档案核心信息 */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-serif-sc text-[#1e2f34]">
                    {p.name}
                  </h3>
                  <div className="text-xs text-[#52666a] font-mono flex items-center gap-1.5">
                    <span className="text-[#176f63]">📅</span>
                    <span>
                      {p.year}年{p.month}月{p.day}日 {p.hour}时
                    </span>
                    <span className="text-[10px] text-[#879397] font-serif">
                      ({p.calendar === 'solar' ? '公历' : '农历'})
                    </span>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-[#789087] font-serif line-clamp-2 pt-1 border-t border-[#dcd3c1]/50">
                      {p.notes}
                    </p>
                  )}
                </div>

                {/* 底部动作条 */}
                <div className="pt-2 border-t border-[#dcd3c1]/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSwitchChart(p)}
                    className="flex-1 btn-fusang py-2 rounded-xl text-xs font-bold font-serif-sc shadow-2xs flex items-center justify-center gap-1"
                  >
                    <span>⚡ 一键切换排盘</span>
                  </button>

                  {!p.isDefault && (
                    <button
                      onClick={() => setDefaultProfile(p.id)}
                      className="px-2.5 py-2 rounded-xl border border-[#dcd3c1] bg-white text-[11px] font-serif text-[#52666a] hover:bg-[#f7f1e7]"
                      title="设为默认排盘档案"
                    >
                      设为默认
                    </button>
                  )}

                  {onSwitchToMatch && p.relation !== 'self' && (
                    <button
                      onClick={() => onSwitchToMatch(p)}
                      className="px-2.5 py-2 rounded-xl border border-[#c58a28]/30 bg-[#c58a28]/10 text-[11px] font-serif text-[#8A5B21] hover:bg-[#c58a28]/20"
                      title="与此人进行合盘分析"
                    >
                      合盘
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
