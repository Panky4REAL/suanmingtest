/* ============================================================
   扶桑 · 历史测算记录 (HistoryView)
   对标 lifekline.ai/history
   - 记录每次命盘排盘与K线生成快照
   - 一键重新载入命盘并跳转至人生K线
   - 支持历史记录搜索与一键清空
   ============================================================ */

import { useState } from 'react'
import { useProfileStore, useChartStore, type HistoryRecord } from '@/stores'
import { generateChart, type BirthInfo } from '@/lib/astro'

interface HistoryViewProps {
  onSwitchToKline?: () => void
}

export function HistoryView({ onSwitchToKline }: HistoryViewProps) {
  const { history, deleteHistory, clearHistory, setMBTIResult } = useProfileStore()
  const { setBirthInfo, setChart } = useChartStore()

  const [search, setSearch] = useState('')

  const filteredHistory = history.filter((h) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      h.name.toLowerCase().includes(q) ||
      h.lifePalaceMajorStars.some((s) => s.includes(q)) ||
      (h.mbti && h.mbti.toLowerCase().includes(q)) ||
      (h.zodiac && h.zodiac.includes(q))
    )
  })

  const handleRestoreChart = (record: HistoryRecord) => {
    const bInfo: BirthInfo = {
      year: record.birthInfo.year,
      month: record.birthInfo.month,
      day: record.birthInfo.day,
      hour: record.birthInfo.hour,
      gender: record.birthInfo.gender,
    }

    const newChart = generateChart(bInfo)
    setBirthInfo(bInfo)
    setChart(newChart)

    if (record.mbti) {
      setMBTIResult(record.mbti)
    }

    onSwitchToKline?.()
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 头部标题与清空操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dcd3c1]/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="fusang-seal text-xs">测算足迹</span>
            <h2 className="font-serif-sc font-bold text-xl sm:text-2xl text-[#1e2f34]">
              历史测算记录
            </h2>
          </div>
          <p className="text-xs text-[#789087] font-serif mt-1">
            已留存 <span className="font-mono font-bold text-[#176f63]">{history.length}</span> 条排盘档案快照，可随时恢复原盘与百年K线运势
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清空全部测算历史记录吗？此操作不可逆。')) {
                  clearHistory()
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-serif hover:bg-rose-100 transition-colors"
            >
              清空历史
            </button>
          )}
        </div>
      </div>

      {/* 搜索栏 */}
      {history.length > 0 && (
        <div className="max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名、命宫星曜 (如 紫微、天府) 或 MBTI..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-white/90 focus:outline-hidden focus:border-[#176f63] font-serif"
          />
        </div>
      )}

      {/* 历史卡片列表 */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white/60 backdrop-blur-xs rounded-3xl border border-dashed border-[#dcd3c1] space-y-3">
          <span className="text-3xl block">📜</span>
          <p className="text-sm font-serif text-[#52666a]">
            {search.trim() ? '未找到匹配的测算记录' : '暂无历史测算记录'}
          </p>
          <p className="text-xs text-[#879397] font-serif">
            在【人生K线】或【十二宫盘】中排盘后，系统将自动留存推演快照
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* 左侧主要信息 */}
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif-sc font-bold text-base text-[#1e2f34]">
                    {item.name}
                  </span>
                  <span className="text-xs text-[#879397] font-serif">
                    {item.birthInfo.gender === 'male' ? '♂ 乾造' : '♀ 坤造'}
                  </span>
                  {item.mbti && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#176f63]/10 text-[#176f63] font-bold">
                      {item.mbti}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7f1e7] border border-[#dcd3c1] text-[#8A5B21] font-serif">
                    {item.bureau || '五行局'} · {item.zodiac || '生肖'}
                  </span>
                  <span className="text-[11px] text-[#879397] font-serif ml-auto sm:ml-0">
                    🕒 {formatTime(item.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#52666a] font-serif">
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[#176f63]">📅</span>
                    <span>
                      {item.birthInfo.year}年{item.birthInfo.month}月{item.birthInfo.day}日 {item.birthInfo.hour}时
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[#c58a28]">✨</span>
                    <span>命宫主星：</span>
                    <strong className="text-[#176f63] font-serif-sc">
                      {item.lifePalaceMajorStars.length > 0 ? item.lifePalaceMajorStars.join(' ') : '借对宫安星'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 右侧动作 */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRestoreChart(item)}
                  className="btn-fusang px-4 py-2 rounded-xl text-xs font-bold font-serif-sc shadow-2xs flex items-center gap-1"
                >
                  <span>📈 重新查看K线</span>
                </button>
                <button
                  onClick={() => deleteHistory(item.id)}
                  className="w-8 h-8 rounded-xl border border-[#dcd3c1] bg-white text-[#879397] hover:text-rose-600 hover:border-rose-200 flex items-center justify-center text-xs transition-colors"
                  title="删除记录"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
