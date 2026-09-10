/* ============================================================
   扶桑 · 人生K线 (Fusang LifeKLine) - 主应用架构
   对标 lifekline.ai：
   - 东方古典羊皮纸水墨风 (Parchment & Jade-Gold Aesthetic)
   - SaaS 级左侧折叠边栏 (Sidebar) + 顶部状态 Bar
   - 包含：人生K线、命运分身原型、每日运势、分身对话、示例报告、全盘详解
   - “功德+1” 互动彩蛋与微挂件
   ============================================================ */

import { useState } from 'react'
import { BirthForm } from '@/components/BirthForm'
import { ChartDisplay } from '@/components/chart'
import { AIInterpretation } from '@/components/AIInterpretation'
import { SettingsPanel } from '@/components/SettingsPanel'
import { YearlyFortune, DailyFortune } from '@/components/fortune'
import { LifeKLine } from '@/components/kline'
import { DestinyAvatar } from '@/components/avatar'
import { SampleReports, type SampleCase } from '@/components/sample'
import { DestinyChat } from '@/components/chat'
import { MatchAnalysis } from '@/components/match'
import { ShareCard } from '@/components/share'
import { MBTIAnalysisView } from '@/components/mbti'
import { ProfileView, TaskRewardModal, SubscriptionModal, HistoryView } from '@/components/profile'
import { useChartStore, useProfileStore } from '@/stores'

type TabType =
  | 'kline'
  | 'avatar'
  | 'mbti'
  | 'fortune'
  | 'chat'
  | 'history'
  | 'profile'
  | 'sample'
  | 'chart'
  | 'yearly'
  | 'match'
  | 'share'

const NAV_ITEMS: Array<{
  key: TabType
  label: string
  sublabel: string
  icon: string
  badge?: string
}> = [
  { key: 'kline', label: '人生K线', sublabel: 'Life K-Line', icon: '📈' },
  { key: 'avatar', label: '命运分身', sublabel: 'Avatar Aura', icon: '🎭', badge: '160种' },
  { key: 'mbti', label: 'MBTI×命理', sublabel: 'Mind & Stars', icon: '🧠', badge: '全息' },
  { key: 'fortune', label: '每日运势', sublabel: 'Daily Fortune', icon: '📅', badge: '流日' },
  { key: 'chat', label: '分身对话', sublabel: 'Report Chat', icon: '💬', badge: 'AI' },
  { key: 'history', label: '历史测算', sublabel: 'History Archive', icon: '📜' },
  { key: 'profile', label: '档案中心', sublabel: 'Birth Profiles', icon: '🗂️' },
  { key: 'sample', label: '示例报告', sublabel: 'Sample Reports', icon: '🏛️', badge: '精选' },
  { key: 'chart', label: '十二宫盘', sublabel: 'Chart View', icon: '⛩️' },
  { key: 'yearly', label: '年度大运', sublabel: 'Yearly Trend', icon: '🌀' },
  { key: 'match', label: '双人合盘', sublabel: 'Synastry', icon: '👥' },
  { key: 'share', label: '分享卡片', sublabel: 'Share Card', icon: '🎨' },
]

export default function App() {
  const { chart, birthInfo, clear } = useChartStore()
  const { userName, gongde } = useProfileStore()

  const [activeTab, setActiveTab] = useState<TabType>('kline')
  const [showSettings, setShowSettings] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSelectCase = (_c: SampleCase) => {
    setActiveTab('kline')
  }

  return (
    <div className="min-h-screen flex bg-[#f4eddf] text-[#1e2f34] overflow-x-hidden font-sans selection:bg-[#176f63]/20">
      {/* 宣纸水墨背景光晕 */}
      <div className="fixed inset-0 da-parchment-texture pointer-events-none opacity-60 z-0" />
      <div className="fixed -top-24 -left-24 w-96 h-96 ink-wash-circle bg-[#176f63]/10 z-0" />
      <div className="fixed top-1/3 -right-24 w-80 h-80 ink-wash-circle bg-[#c58a28]/10 z-0" />

      {/* ============================================================
         左侧边栏 (Desktop Sidebar)
         ============================================================ */}
      <aside
        className={`
          hidden md:flex flex-col shrink-0 z-30 h-screen sticky top-0
          border-r border-[#176f63]/16 transition-all duration-200
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[230px]'}
        `}
        style={{
          background: 'linear-gradient(180deg, #e6f1eb 0%, #f7f1e7 52%, #f6e6d8 100%)',
          boxShadow: 'inset -1px 0 0 rgba(23,111,99,0.12), 18px 0 60px rgba(133,92,46,0.06)',
        }}
      >
        {/* 顶部 Logo 与品牌标 */}
        <div className="relative border-b border-[#176f63]/15 px-3 py-4 group">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-3.5 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#176f63]/20 bg-[#fffdf8]/80 text-[#55736b] hover:text-[#176f63] hover:border-[#176f63] transition-colors"
            title={sidebarCollapsed ? '展开边栏' : '收起边栏'}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            {/* Logo 徽章 */}
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#176f63]/25 flex items-center justify-center shadow-xs shrink-0 text-[#176f63]">
              <span className="font-serif-sc font-black text-xl">桑</span>
            </div>

            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold font-serif-sc tracking-tight text-[#24453f] truncate">
                  扶桑 · 人生K线
                </span>
                <span className="text-[10px] text-[#6d8980] tracking-wider uppercase font-serif truncate">
                  Chart destiny
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 导航菜单列表 */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 relative
                  ${isActive
                    ? 'bg-[#176f63] text-white shadow-sm font-medium'
                    : 'text-[#55736b] hover:bg-white/60 hover:text-[#24453f]'
                  }
                  ${sidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-[13px] font-serif-sc tracking-wide truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/25 text-white' : 'bg-[#c58a28]/15 text-[#8A5B21]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* 底部功能区：对标 lifekline.ai 完整挂件 */}
        <div className="p-3 border-t border-[#176f63]/15 space-y-2">
          {/* 1. Complete tasks for rewards 金卡 */}
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setShowTasks(true)}
              className="w-full overflow-hidden rounded-2xl p-2.5 text-left transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(245,230,197,0.96), rgba(216,185,126,0.88))',
                boxShadow: '0 8px 24px rgba(111,82,35,0.14)',
                color: '#5B3F1F',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/80 text-[#8A5B21] text-xs font-bold shrink-0">
                  🎁
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold leading-tight font-serif-sc truncate">Complete tasks for rewards</p>
                    <span className="font-mono text-xs font-black text-[#8A5B21] ml-1">{gongde}</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-snug opacity-80 truncate">
                    Earn Gongde and avatar subscription rewards
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowTasks(true)}
              className="w-full flex justify-center py-2 rounded-xl bg-[#c58a28]/20 text-[#8A5B21] font-bold text-xs"
              title={`功德任务中心：当前 ${gongde} 功德`}
            >
              🎁
            </button>
          )}

          {/* 2. 用户卡片与 Pass 胶囊 (对标 lifekline.ai /profile pill) */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`
                flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-white/70 transition-colors
                ${activeTab === 'profile' ? 'bg-white/80 font-bold' : ''}
                ${sidebarCollapsed ? 'justify-center px-1' : ''}
              `}
              title="个人中心 · 档案与设置"
            >
              <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-xs bg-[#176f63] font-serif-sc font-bold shadow-2xs">
                {userName.slice(0, 1) || '灵'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate text-[#24453f] leading-tight">{userName}</p>
                  <p className="text-[10px] truncate text-[#789087] leading-tight">Profile · Settings</p>
                </div>
              )}
            </button>

            {!sidebarCollapsed && (
              <button
                onClick={() => setShowSubscription(true)}
                className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90 shadow-2xs"
                style={{ background: 'linear-gradient(135deg, #176f63, #c58a28)' }}
                title="查看 Pass 订阅会员权益"
              >
                Pass
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================
         移动端抽屉遮罩与侧边栏
         ============================================================ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full p-4 flex flex-col space-y-3"
            style={{
              background: 'linear-gradient(180deg, #e6f1eb 0%, #f7f1e7 52%, #f6e6d8 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#176f63]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#176f63]/25 flex items-center justify-center text-[#176f63] font-serif-sc font-black">
                  桑
                </div>
                <span className="font-serif-sc font-bold text-sm text-[#24453f]">扶桑 · 人生K线</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-white/70 text-[#52666a] flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key)
                    setMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-serif-sc
                    ${activeTab === item.key ? 'bg-[#176f63] text-white font-bold' : 'text-[#55736b] hover:bg-white/50'}
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-2 border-t border-[#176f63]/20 space-y-2">
              <button
                onClick={() => {
                  setShowTasks(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full py-2.5 rounded-xl bg-[#c58a28]/20 text-[#8A5B21] text-xs font-serif-sc font-bold flex items-center justify-center gap-1.5"
              >
                <span>🎁 功德任务中心 ({gongde})</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSubscription(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-serif-sc font-bold flex items-center justify-center gap-1 shadow-2xs"
                  style={{ background: 'linear-gradient(135deg, #176f63, #c58a28)' }}
                >
                  <span>👑 Pass 会员</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true)
                    setMobileMenuOpen(false)
                  }}
                  className="px-3 py-2 rounded-xl bg-white text-xs font-serif-sc text-[#24453f] border border-[#dcd3c1] flex items-center justify-center"
                  title="设置"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         主视窗容器
         ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen z-10">
        {/* 顶部状态栏 Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-[#f7f1e7]/85 border-b border-[#dcd3c1] px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 移动端汉堡菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[#dcd3c1] bg-white text-[#24453f]"
              aria-label="打开菜单"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 当前页面标题与标语 */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-sc font-bold text-base sm:text-lg text-[#1e2f34]">
                  {NAV_ITEMS.find((n) => n.key === activeTab)?.label}
                </span>
                <span className="text-[10px] text-[#879397] font-serif hidden sm:inline-block">
                  · 扶桑 AI 命运可视化
                </span>
              </div>
            </div>
          </div>

          {/* 状态指示与快捷操作 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {birthInfo ? (
              <div className="flex items-center gap-2 bg-white/80 border border-[#dcd3c1] px-3 py-1 rounded-full text-xs text-[#52666a]">
                <span className="w-2 h-2 rounded-full bg-[#176f63]" />
                <span className="font-mono">{birthInfo.year}年{birthInfo.month}月{birthInfo.day}日</span>
                <button
                  onClick={clear}
                  className="ml-1 text-[11px] text-[#176f63] font-semibold hover:underline"
                >
                  重新排盘
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('sample')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif border border-[#c58a28]/40 bg-[#c58a28]/10 text-[#8A5B21] hover:bg-[#c58a28]/20 transition-colors"
              >
                <span>✦ 浏览经典案例库</span>
              </button>
            )}

            <button
              onClick={() => setShowTasks(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif border border-[#c58a28]/40 bg-[#c58a28]/10 text-[#8A5B21] hover:bg-[#c58a28]/20 transition-colors"
              title="功德中心"
            >
              <span>🎁</span>
              <span className="font-mono font-bold">{gongde} 功德</span>
            </button>

            <button
              onClick={() => setShowFAQ(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-serif text-[#52666a] hover:text-[#176f63] hover:bg-white/60 transition-colors"
              title="帮助与说明"
            >
              FAQ
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full border border-[#dcd3c1] bg-white flex items-center justify-center text-xs text-[#52666a] hover:text-[#176f63] hover:border-[#176f63] transition-colors"
              title="设置"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
          {/* 1. 人生 K 线 */}
          {activeTab === 'kline' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onGoToSample={() => setActiveTab('sample')} />
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <LifeKLine />
                {/* 下方附加 AI 综合命盘批语 */}
                <div className="pt-4 border-t border-[#dcd3c1]/70">
                  <div className="mb-4 text-center">
                    <span className="fusang-seal text-xs mb-1 inline-block">命理师批注</span>
                    <h3 className="text-xl font-bold font-serif-sc text-[#1e2f34]">
                      大运人生剧本 · 深度解析
                    </h3>
                  </div>
                  <AIInterpretation />
                </div>
              </div>
            )
          )}

          {/* 2. 命运分身与气场画像 */}
          {activeTab === 'avatar' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onGoToSample={() => setActiveTab('sample')} />
              </div>
            ) : (
              <DestinyAvatar />
            )
          )}

          {/* 3. MBTI × 命理双维全息综合分析 */}
          {activeTab === 'mbti' && <MBTIAnalysisView />}

          {/* 4. 每日运势 */}
          {activeTab === 'fortune' && <DailyFortune />}

          {/* 5. 分身交互对话 (Report Chat) */}
          {activeTab === 'chat' && <DestinyChat />}

          {/* 6. 历史测算记录 (History) */}
          {activeTab === 'history' && (
            <HistoryView onSwitchToKline={() => setActiveTab('kline')} />
          )}

          {/* 7. 档案中心与个人主页 (Profile & Birth Profiles) */}
          {activeTab === 'profile' && (
            <ProfileView
              onSwitchToKline={() => setActiveTab('kline')}
              onSwitchToMatch={() => setActiveTab('match')}
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {/* 8. 示例报告中心 (免输入查看真实案例) */}
          {activeTab === 'sample' && (
            <SampleReports onLoadCase={handleSelectCase} />
          )}

          {/* 9. 十二宫完整排盘 */}
          {activeTab === 'chart' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onGoToSample={() => setActiveTab('sample')} />
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <ChartDisplay />
                <AIInterpretation />
              </div>
            )
          )}

          {/* 10. 年度大运 */}
          {activeTab === 'yearly' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onGoToSample={() => setActiveTab('sample')} />
              </div>
            ) : (
              <YearlyFortune />
            )
          )}

          {/* 11. 关系合盘 */}
          {activeTab === 'match' && <MatchAnalysis />}

          {/* 12. 分享卡片 */}
          {activeTab === 'share' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onGoToSample={() => setActiveTab('sample')} />
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                <ShareCard />
              </div>
            )
          )}
        </main>
      </div>

      {/* ============================================================
         功德任务弹窗 (TaskRewardModal)
         ============================================================ */}
      {showTasks && (
        <TaskRewardModal
          onClose={() => setShowTasks(false)}
          onNavigateTab={(tab) => {
            setShowTasks(false)
            setActiveTab(tab as TabType)
          }}
        />
      )}

      {/* ============================================================
         Pass 会员中心弹窗 (SubscriptionModal)
         ============================================================ */}
      {showSubscription && (
        <SubscriptionModal onClose={() => setShowSubscription(false)} />
      )}

      {/* ============================================================
         设置弹窗 (Settings Modal)
         ============================================================ */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div className="w-full max-w-md">
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {/* ============================================================
         FAQ 帮助弹窗
         ============================================================ */
      showFAQ && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowFAQ(false)}
        >
          <div
            className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xl space-y-4 text-[#1e2f34]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#dcd3c1]/70">
              <div className="flex items-center gap-2">
                <span className="fusang-seal text-xs">扶桑问答</span>
                <h3 className="font-serif-sc font-bold text-lg">常见问题与算法说明</h3>
              </div>
              <button
                onClick={() => setShowFAQ(false)}
                className="w-7 h-7 rounded-full bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#52666a] leading-relaxed font-serif max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <div>
                <strong className="text-[#1e2f34] block font-serif-sc">Q1: 人生K线是如何计算得出的？</strong>
                <p className="mt-0.5">
                  以中州派紫微斗数为内核，推演十年大限与百岁流年吉凶星耀组合（十四主星庙旺利陷、三方四正与年干四化互涉），通过数理量化算法输出开盘、最高、最低、收盘气数。
                </p>
              </div>
              <div>
                <strong className="text-[#1e2f34] block font-serif-sc">Q2: 为什么提示出生时间需要转换太阴历？</strong>
                <p className="mt-0.5">
                  紫微斗数传统上以农历（阴历太阴历）为基准，非太阳历干支节气。本系统输入公历后会自动精确换算农历与晚子时换日规则。
                </p>
              </div>
              <div>
                <strong className="text-[#1e2f34] block font-serif-sc">Q3: 我的 API Key 安全吗？</strong>
                <p className="mt-0.5">
                  系统采用纯前端运行架构，您的 API Key 以及排盘运算完全保留在您本地浏览器的 LocalStorage 中，绝不向任何第三方后端转存。
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFAQ(false)}
              className="w-full btn-fusang py-2.5 rounded-xl text-xs font-semibold"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
