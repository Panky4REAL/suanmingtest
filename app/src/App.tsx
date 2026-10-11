/* ============================================================
   玄机 · 人生K线 (XuanJi LifeKLine) - 主应用架构
   精简整合版 (5大核心心智导航)：
   1. 📈 人生K线 (含百年K线走势、正统十二宫盘切换、AI大运详批、海报分享)
   2. 🎭 原型×MBTI (含命运分身160种原型、MBTI全息分析、分身AI实时对话)
   3. 📅 时运指南 (含每日流日宜忌、当年大运流年四化、偏财彩数与周易起卦)
   4. 👥 关系合盘 (双人命盘契合度分析与相处秘笈)
   5. 🗂️ 档案中心 (多生辰档案库、历史测算快照、功德任务、Pass会员特权)
   ============================================================ */

import { useState } from 'react'
import { BirthForm } from '@/components/BirthForm'
import { ChartDisplay } from '@/components/chart'
import { AIInterpretation } from '@/components/AIInterpretation'
import { SettingsPanel } from '@/components/SettingsPanel'
import { YearlyFortune, DailyFortune } from '@/components/fortune'
import { LifeKLine } from '@/components/kline'
import { DestinyAvatar } from '@/components/avatar'
import { DestinyChat } from '@/components/chat'
import { MatchAnalysis } from '@/components/match'
import { ShareCard } from '@/components/share'
import { MBTIAnalysisView } from '@/components/mbti'
import { ProfileView, TaskRewardModal, SubscriptionModal } from '@/components/profile'
import { AuthModal } from '@/components/auth'
import { CheckoutModal } from '@/components/payment'
import { LotteryView } from '@/components/lottery'
import { useChartStore, useProfileStore } from '@/stores'
import { generateChart, type BirthInfo } from '@/lib/astro'

export type TabType = 'kline' | 'avatar' | 'fortune' | 'lottery' | 'match' | 'profile'

const NAV_ITEMS: Array<{
  key: TabType
  label: string
  sublabel: string
  icon: string
  badge?: string
}> = [
  { key: 'kline', label: '人生K线', sublabel: 'Life K-Line & Chart', icon: '📈', badge: '全景' },
  { key: 'avatar', label: '原型×MBTI', sublabel: 'Mind & Archetype', icon: '🎭', badge: '全息' },
  { key: 'fortune', label: '时运指南', sublabel: 'Daily & Yearly', icon: '📅', badge: '时运' },
  { key: 'lottery', label: '偏财彩数', sublabel: 'Wealth & Lottery', icon: '🎱', badge: '走势' },
  { key: 'match', label: '关系合盘', sublabel: 'Synastry', icon: '👥' },
  { key: 'profile', label: '档案中心', sublabel: 'Profiles & History', icon: '🗂️' },
]

export default function App() {
  const { chart, birthInfo, clear, setBirthInfo, setChart } = useChartStore()
  const { userName, gongde, isLoggedIn, membershipTier } = useProfileStore()

  // 核心一级导航
  const [activeTab, setActiveTab] = useState<TabType>('kline')

  // 子功能状态整合
  const [klineViewMode, setKlineViewMode] = useState<'kline' | 'chart'>('kline')
  const [avatarSubTab, setAvatarSubTab] = useState<'persona' | 'mbti' | 'chat'>('persona')
  const [fortuneSubTab, setFortuneSubTab] = useState<'daily' | 'yearly'>('daily')

  // 全局弹窗
  const [showSettings, setShowSettings] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 免输入一键体验示例案例
  const handleQuickLoadSample = () => {
    const sampleBirth: BirthInfo = { year: 1992, month: 8, day: 15, hour: 12, gender: 'male' }
    const c = generateChart(sampleBirth)
    setBirthInfo(sampleBirth)
    setChart(c)
    setActiveTab('kline')
    setKlineViewMode('kline')
  }

  // 跨组件平滑跳转路由映射
  const handleNavigateTab = (tab: string) => {
    if (tab === 'chat') {
      setActiveTab('avatar')
      setAvatarSubTab('chat')
    } else if (tab === 'mbti') {
      setActiveTab('avatar')
      setAvatarSubTab('mbti')
    } else if (tab === 'avatar' || tab === 'persona') {
      setActiveTab('avatar')
      setAvatarSubTab('persona')
    } else if (tab === 'yearly') {
      setActiveTab('fortune')
      setFortuneSubTab('yearly')
    } else if (tab === 'daily' || tab === 'fortune') {
      setActiveTab('fortune')
      setFortuneSubTab('daily')
    } else if (tab === 'lottery') {
      setActiveTab('lottery')
    } else if (tab === 'chart') {
      setActiveTab('kline')
      setKlineViewMode('chart')
    } else if (tab === 'kline') {
      setActiveTab('kline')
      setKlineViewMode('kline')
    } else if (tab === 'share') {
      setActiveTab('kline')
      setShowShareModal(true)
    } else if (tab === 'history' || tab === 'profile') {
      setActiveTab('profile')
    } else if (tab === 'match') {
      setActiveTab('match')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4eddf] text-[#1e2f34] overflow-x-hidden font-sans selection:bg-[#176f63]/20">
      {/* 宣纸水墨背景光晕 */}
      <div className="fixed inset-0 da-parchment-texture pointer-events-none opacity-60 z-0" />
      <div className="fixed -top-24 -left-24 w-96 h-96 ink-wash-circle bg-[#176f63]/10 z-0" />
      <div className="fixed top-1/3 -right-24 w-80 h-80 ink-wash-circle bg-[#c58a28]/10 z-0" />

      {/* ============================================================
         左侧边栏 (Desktop Sidebar) - 5大精简导航
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
            <div className="w-10 h-10 rounded-2xl bg-[#176f63] border border-[#176f63]/25 flex items-center justify-center shadow-xs shrink-0 text-white">
              <span className="font-serif-sc font-black text-xl">玄</span>
            </div>

            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold font-serif-sc tracking-tight text-[#24453f] truncate">
                  玄机 · 人生K线
                </span>
                <span className="text-[10px] text-[#6d8980] tracking-wider uppercase font-serif truncate">
                  XuanJi Destiny · 全息命理
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5 大精简导航菜单 */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all duration-150 relative
                  ${isActive
                    ? 'bg-[#176f63] text-white shadow-sm font-medium'
                    : 'text-[#55736b] hover:bg-white/60 hover:text-[#24453f]'
                  }
                  ${sidebarCollapsed ? 'justify-center px-2' : ''}
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-serif-sc tracking-wide truncate font-bold">
                        {item.label}
                      </span>
                      <span className={`text-[10px] font-mono truncate ${isActive ? 'text-white/80' : 'text-[#879397]'}`}>
                        {item.sublabel}
                      </span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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

        {/* 底部功能区：功德任务与个人中心胶囊 */}
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
                    <p className="text-xs font-bold leading-tight font-serif-sc truncate">功德任务中心</p>
                    <span className="font-mono text-xs font-black text-[#8A5B21] ml-1">{gongde}</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-snug opacity-80 truncate">
                    敲木鱼·签到赚功德换会员
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

          {/* 2. 用户卡片与 Pass 胶囊 */}
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
                {userName.slice(0, 1) || '玄'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate text-[#24453f] leading-tight">{userName}</p>
                  <p className="text-[10px] truncate text-[#789087] leading-tight">档案中心 · 设置</p>
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
                <div className="w-8 h-8 rounded-xl bg-[#176f63] border border-[#176f63]/25 flex items-center justify-center text-white font-serif-sc font-black">
                  玄
                </div>
                <span className="font-serif-sc font-bold text-sm text-[#24453f]">玄机 · 人生K线</span>
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

            {/* 当前页面标题与动态子模块标语 */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-sc font-bold text-base sm:text-lg text-[#1e2f34]">
                  {activeTab === 'kline' && (klineViewMode === 'kline' ? '人生K线 · 大运走势' : '正统紫微 · 十二宫全盘')}
                  {activeTab === 'avatar' && (avatarSubTab === 'persona' ? '命运分身 · 人格原型' : avatarSubTab === 'mbti' ? 'MBTI×命理 · 双维全息' : '分身对话 · 智慧解惑')}
                  {activeTab === 'fortune' && (fortuneSubTab === 'daily' ? '每日流日 · 吉凶宜忌' : '年度大运 · 四化吉凶')}
                  {activeTab === 'lottery' && '偏财彩数 · 官方走势与周易灵机'}
                  {activeTab === 'match' && '关系合盘 · 深度契合'}
                  {activeTab === 'profile' && '档案中心 · 多盘与资产'}
                </span>
                <span className="text-[10px] text-[#879397] font-serif hidden sm:inline-block">
                  · 玄机 AI 全息命理
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
                  className="ml-1 text-[11px] text-[#176f63] font-semibold hover:underline cursor-pointer"
                >
                  重新排盘
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickLoadSample}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif border border-[#c58a28]/40 bg-[#c58a28]/10 text-[#8A5B21] hover:bg-[#c58a28]/20 transition-colors cursor-pointer"
              >
                <span>✦ 体验经典示例盘</span>
              </button>
            )}

            {/* 登录/账号快捷状态 */}
            {!isLoggedIn ? (
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif-sc font-bold border border-[#176f63] bg-[#176f63] text-white hover:bg-[#1d8274] transition-all shadow-xs cursor-pointer"
              >
                <span>🔑 登录 / 注册</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                  +100功德
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('profile')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif-sc bg-white/90 border border-[#dcd3c1] hover:border-[#176f63] transition-colors cursor-pointer"
                title="个人中心"
              >
                <span className="w-4 h-4 rounded-full bg-[#176f63] text-white text-[10px] flex items-center justify-center font-bold">
                  {userName.slice(0, 1) || '玄'}
                </span>
                <span className="font-medium text-[#24453f] max-w-[80px] truncate">{userName}</span>
              </button>
            )}

            {/* 会员开通 / 升级按钮 */}
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-serif-sc font-bold text-white shadow-2xs transition-opacity hover:opacity-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #176f63, #c58a28)' }}
              title="开通 Pass 订阅特权"
            >
              <span>{membershipTier === 'master' ? '🔱 天师' : membershipTier === 'pro' ? '👑 Pass' : '✦ 开通会员'}</span>
            </button>

            <button
              onClick={() => setShowTasks(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif border border-[#c58a28]/40 bg-[#c58a28]/10 text-[#8A5B21] hover:bg-[#c58a28]/20 transition-colors cursor-pointer"
              title="功德中心"
            >
              <span>🎁</span>
              <span className="font-mono font-bold">{gongde} 功德</span>
            </button>

            <button
              onClick={() => setShowFAQ(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-serif text-[#52666a] hover:text-[#176f63] hover:bg-white/60 transition-colors cursor-pointer"
              title="帮助与说明"
            >
              FAQ
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full border border-[#dcd3c1] bg-white flex items-center justify-center text-xs text-[#52666a] hover:text-[#176f63] hover:border-[#176f63] transition-colors cursor-pointer"
              title="偏好设置"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
          {/* ============================================================
             1. 人生 K 线 (整合：百年K线 + 十二宫盘切换 + 海报分享入口)
             ============================================================ */}
          {activeTab === 'kline' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onQuickLoadSample={handleQuickLoadSample} />
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* 顶部视图切换：百年K线 vs 正统十二宫盘 + 分享按钮 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 border border-[#dcd3c1] p-2.5 sm:p-3 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-1.5 p-1 bg-[#f4eddf] rounded-xl border border-[#dcd3c1]/60">
                    <button
                      onClick={() => setKlineViewMode('kline')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-serif-sc font-bold transition-all cursor-pointer ${
                        klineViewMode === 'kline'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34]'
                      }`}
                    >
                      📈 百年K线图谱
                    </button>
                    <button
                      onClick={() => setKlineViewMode('chart')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-serif-sc font-bold transition-all cursor-pointer ${
                        klineViewMode === 'chart'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34]'
                      }`}
                    >
                      ⛩️ 正统十二宫盘
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#c58a28]/40 bg-[#c58a28]/10 text-[#8A5B21] hover:bg-[#c58a28]/20 text-xs font-serif-sc font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>🎨</span>
                      <span>生成水墨分享长图</span>
                    </button>
                  </div>
                </div>

                {/* 内容渲染 */}
                {klineViewMode === 'kline' ? <LifeKLine /> : <ChartDisplay />}

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

          {/* ============================================================
             2. 原型×MBTI (整合：命运原型 + MBTI全息分析 + 分身AI对话)
             ============================================================ */}
          {activeTab === 'avatar' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onQuickLoadSample={handleQuickLoadSample} />
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* 顶部三段式子导航 */}
                <div className="flex items-center justify-center">
                  <div className="p-1 rounded-2xl bg-white/80 border border-[#dcd3c1] shadow-2xs flex items-center gap-1.5">
                    <button
                      onClick={() => setAvatarSubTab('persona')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-serif-sc text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        avatarSubTab === 'persona'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
                      }`}
                    >
                      <span>🎭</span>
                      <span>命运原型</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">160种</span>
                    </button>

                    <button
                      onClick={() => setAvatarSubTab('mbti')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-serif-sc text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        avatarSubTab === 'mbti'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
                      }`}
                    >
                      <span>🧠</span>
                      <span>MBTI×全息</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#c58a28] text-white font-mono">共振</span>
                    </button>

                    <button
                      onClick={() => setAvatarSubTab('chat')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-serif-sc text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        avatarSubTab === 'chat'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
                      }`}
                    >
                      <span>💬</span>
                      <span>分身对话</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#176f63]/20 text-[#176f63] font-mono">AI</span>
                    </button>
                  </div>
                </div>

                {avatarSubTab === 'persona' && <DestinyAvatar />}
                {avatarSubTab === 'mbti' && <MBTIAnalysisView />}
                {avatarSubTab === 'chat' && <DestinyChat />}
              </div>
            )
          )}

          {/* ============================================================
             3. 时运指南 (整合：每日流日 + 当年大运)
             ============================================================ */}
          {activeTab === 'fortune' && (
            !chart ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh]">
                <BirthForm onQuickLoadSample={handleQuickLoadSample} />
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* 顶部二段式时运子导航 */}
                <div className="flex items-center justify-center">
                  <div className="p-1 rounded-2xl bg-white/80 border border-[#dcd3c1] shadow-2xs flex items-center gap-1.5">
                    <button
                      onClick={() => setFortuneSubTab('daily')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-serif-sc text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        fortuneSubTab === 'daily'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
                      }`}
                    >
                      <span>📅</span>
                      <span>每日流日</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#176f63]/20 text-[#176f63] font-mono">今日</span>
                    </button>

                    <button
                      onClick={() => setFortuneSubTab('yearly')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-serif-sc text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        fortuneSubTab === 'yearly'
                          ? 'bg-[#176f63] text-white shadow-xs'
                          : 'text-[#55736b] hover:text-[#1e2f34] hover:bg-black/5'
                      }`}
                    >
                      <span>🌀</span>
                      <span>年度大运</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#c58a28] text-white font-mono">流年</span>
                    </button>
                  </div>
                </div>

                {fortuneSubTab === 'daily' && <DailyFortune />}
                {fortuneSubTab === 'yearly' && <YearlyFortune />}
              </div>
            )
          )}

          {/* ============================================================
             4. 偏财彩数 (独立一级核心模块，免输入生辰直接把玩)
             ============================================================ */}
          {activeTab === 'lottery' && (
            <div className="space-y-6 animate-fade-in">
              <LotteryView />
            </div>
          )}

          {/* ============================================================
             4. 关系合盘 (保持独立核心)
             ============================================================ */}
          {activeTab === 'match' && <MatchAnalysis />}

          {/* ============================================================
             5. 档案中心 (包含档案管理、历史测算足迹、备份与会员)
             ============================================================ */}
          {activeTab === 'profile' && (
            <ProfileView
              onSwitchToKline={() => setActiveTab('kline')}
              onSwitchToMatch={() => setActiveTab('match')}
              onNavigateTab={handleNavigateTab}
            />
          )}
        </main>
      </div>

      {/* ============================================================
         水墨长图分享弹窗 (替代原本独立的分享页面)
         ============================================================ */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#dcd3c1] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f4eddf] text-[#52666a] hover:bg-[#dcd3c1] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="mb-4">
              <span className="fusang-seal text-xs mb-1 inline-block">海报分享</span>
              <h3 className="text-lg font-bold font-serif-sc text-[#1e2f34]">
                命运图鉴 · 水墨长图分享
              </h3>
            </div>
            <ShareCard />
          </div>
        </div>
      )}

      {/* ============================================================
         功德任务弹窗 (TaskRewardModal)
         ============================================================ */}
      {showTasks && (
        <TaskRewardModal
          onClose={() => setShowTasks(false)}
          onNavigateTab={(tab) => {
            setShowTasks(false)
            handleNavigateTab(tab)
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
         ============================================================ */}
      {showFAQ && (
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
                <span className="xuanji-seal text-xs">玄机问答</span>
                <h3 className="font-serif-sc font-bold text-lg">常见问题与算法说明</h3>
              </div>
              <button
                onClick={() => setShowFAQ(false)}
                className="w-7 h-7 rounded-full bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1] cursor-pointer"
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
                <strong className="text-[#1e2f34] block font-serif-sc">Q3: 我需要自己配置 AI 模型的 API Key 吗？</strong>
                <p className="mt-0.5">
                  不需要！玄机已在云端后台全额统一部署了高性能大模型推理算力专线，所有用户即开即用。您的排盘生辰与档案数据保存在您本地沙盒中，安全隐私无忧。
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFAQ(false)}
              className="w-full btn-xuanji py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* 统一登录/注册弹窗 */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* 商业化收银台与付费弹窗 */}
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  )
}
