/* ============================================================
   扶桑 · 个人中心主视图 (ProfileView)
   对标 lifekline.ai/profile 完整生态：
   - 顶部用户身份与功德概览
   - 五大子模块：
     1. 档案管理 (Birth Profiles - /profile/birth-profiles)
     2. 历史测算 (History - /history)
     3. 功德任务 (Tasks & Rewards)
     4. Pass 特权 (Subscription)
     5. 账号管理 (Account & Backup)
   ============================================================ */

import { useState } from 'react'
import { useProfileStore, type BirthProfile } from '@/stores'
import { BirthProfiles } from './BirthProfiles'
import { HistoryView } from './HistoryView'
import { TaskRewardModal } from './TaskRewardModal'
import { SubscriptionModal } from './SubscriptionModal'
import { AccountView } from './AccountView'

export type ProfileSubTab = 'birth-profiles' | 'history' | 'tasks' | 'subscription' | 'account'

interface ProfileViewProps {
  initialSubTab?: ProfileSubTab
  onSwitchToKline?: () => void
  onSwitchToMatch?: (profile: BirthProfile) => void
  onNavigateTab?: (tab: string) => void
}

const SUBTABS: Array<{ key: ProfileSubTab; label: string; icon: string }> = [
  { key: 'birth-profiles', label: '档案管理', icon: '🗂️' },
  { key: 'history', label: '历史测算', icon: '📜' },
  { key: 'tasks', label: '功德任务', icon: '🎁' },
  { key: 'subscription', label: 'Pass 特权', icon: '👑' },
  { key: 'account', label: '账号安全', icon: '⚙️' },
]

export function ProfileView({
  initialSubTab = 'birth-profiles',
  onSwitchToKline,
  onSwitchToMatch,
  onNavigateTab,
}: ProfileViewProps) {
  const { userName, userId, membershipTier, gongde, dailySignIn, lastSignInDate } = useProfileStore()

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>(initialSubTab)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const isTodaySignedIn = lastSignInDate === todayStr

  const handleQuickSignIn = () => {
    const res = dailySignIn()
    alert(res.message)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* 弹窗支持 */}
      {showTaskModal && (
        <TaskRewardModal
          onClose={() => setShowTaskModal(false)}
          onNavigateTab={(tab) => {
            setShowTaskModal(false)
            onNavigateTab?.(tab)
          }}
        />
      )}
      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}

      {/* 顶部身份大卡片 */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-[#dcd3c1]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,253,248,0.98) 0%, rgba(247,241,231,0.92) 100%)',
          boxShadow: '0 16px 40px rgba(111,82,35,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#176f63] to-[#c58a28] text-white flex items-center justify-center font-serif-sc font-black text-2xl shadow-sm shrink-0">
              桑
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif-sc text-[#1e2f34]">
                  {userName}
                </h1>
                <span className="text-[10px] font-bold font-serif-sc px-2.5 py-0.5 rounded-full bg-[#176f63] text-white">
                  {membershipTier === 'master' ? '扶桑天师 VIP' : membershipTier === 'pro' ? '寻道者 Pass' : '普通道友'}
                </span>
              </div>
              <p className="text-xs text-[#789087] font-mono mt-1">
                通行工牌: {userId} · 扶桑 AI 命运可视化
              </p>
            </div>
          </div>

          {/* 功德与快捷操作 */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-[#c58a28]/10 border border-[#c58a28]/30 flex items-center gap-3">
              <div className="text-center sm:text-left">
                <span className="block text-[10px] text-[#8A5B21] font-serif">功德福慧余额</span>
                <span className="font-mono text-xl font-black text-[#8A5B21]">{gongde}</span>
              </div>
              <button
                disabled={isTodaySignedIn}
                onClick={handleQuickSignIn}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors
                  ${isTodaySignedIn
                    ? 'bg-white/60 text-[#8A5B21]/60 cursor-not-allowed'
                    : 'bg-[#c58a28] text-white hover:opacity-90'
                  }
                `}
              >
                {isTodaySignedIn ? '今日已签' : '签到+10'}
              </button>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="btn-fusang px-4 py-3 rounded-2xl text-xs font-bold font-serif-sc shadow-xs flex items-center gap-1.5"
            >
              <span>🎁 功德任务</span>
            </button>
          </div>
        </div>
      </div>

      {/* 子导航 Tab 切换 */}
      <div className="flex items-center gap-2 border-b border-[#dcd3c1]/70 pb-2 overflow-x-auto custom-scrollbar">
        {SUBTABS.map((tab) => {
          const isActive = activeSubTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'tasks') {
                  setShowTaskModal(true)
                } else if (tab.key === 'subscription') {
                  setShowSubModal(true)
                } else {
                  setActiveSubTab(tab.key)
                }
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif-sc transition-all duration-150 shrink-0
                ${isActive && tab.key !== 'tasks' && tab.key !== 'subscription'
                  ? 'bg-[#176f63] text-white font-bold shadow-xs'
                  : 'text-[#55736b] hover:bg-white/70 hover:text-[#24453f]'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 子模块内容呈现 */}
      <div>
        {activeSubTab === 'birth-profiles' && (
          <BirthProfiles
            onSwitchToKline={onSwitchToKline}
            onSwitchToMatch={onSwitchToMatch}
          />
        )}

        {activeSubTab === 'history' && (
          <HistoryView onSwitchToKline={onSwitchToKline} />
        )}

        {activeSubTab === 'account' && <AccountView />}
      </div>
    </div>
  )
}
