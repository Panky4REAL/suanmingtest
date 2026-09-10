/* ============================================================
   扶桑 · 功德任务中心 (TaskRewardModal)
   对标 lifekline.ai 核心侧边栏挂件：
   "Complete tasks for rewards - Earn Gongde and avatar subscription rewards"
   - 电子木鱼打坐功德机 (敲击发声动效与功德+1)
   - 每日打卡签到 (+10 功德)
   - 任务清单 (排盘、分身对话、MBTI测评、分享卡片)
   - 功德商城 (免费兑换 Pass 寻道者会员与详批特权)
   - 功德流水账簿
   ============================================================ */

import { useState } from 'react'
import { useProfileStore } from '@/stores'

interface TaskRewardModalProps {
  onClose: () => void
  onNavigateTab?: (tab: string) => void
}

export function TaskRewardModal({ onClose, onNavigateTab }: TaskRewardModalProps) {
  const {
    gongde,
    lastSignInDate,
    dailySignIn,
    addGongde,
    upgradeMembership,
    completedTasks,
    meritLogs,
  } = useProfileStore()

  const [floatingMerits, setFloatingMerits] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const isTodaySignedIn = lastSignInDate === todayStr

  // 敲击电子木鱼
  const handleHitWoodfish = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()

    addGongde(1, '敲击电子木鱼 · 涤除烦扰')
    setFloatingMerits((prev) => [...prev, { id, x, y }])

    // 播放敲击微音效 (Web Audio API 纯原生合成木鱼音色)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(480, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.13)
    } catch {
      // ignore
    }

    setTimeout(() => {
      setFloatingMerits((prev) => prev.filter((m) => m.id !== id))
    }, 900)
  }

  // 每日签到
  const handleDailySignIn = () => {
    const res = dailySignIn()
    setFeedbackMsg(res.message)
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  // 复制结缘链接
  const handleCopyInvite = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(`来扶桑体验 AI 命运可视化与人生K线：${url}`)
    setCopiedLink(true)
    addGongde(30, '分享结缘链接引荐同道')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // 功德商城兑换特权
  const handleRedeemPass = (tier: 'pro' | 'master', cost: number, days: number, title: string) => {
    if (gongde < cost) {
      alert(`当前功德为 ${gongde}，不足 ${cost} 功德，请继续完成任务积攒功德！`)
      return
    }
    addGongde(-cost, `功德兑换 · ${title}`)
    upgradeMembership(tier, days)
    alert(`🎉 恭喜！成功使用 ${cost} 功德开通【${title}】！`)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-[#1e2f34] max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c58a28] to-[#8A5B21] text-white flex items-center justify-center text-sm font-bold shadow-2xs">
              德
            </div>
            <div>
              <h3 className="font-serif-sc font-bold text-lg text-[#24453f] leading-tight">
                功德任务与特权赏赐
              </h3>
              <p className="text-[10px] text-[#789087] font-serif">
                Earn Gongde and avatar subscription rewards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f7f1e7] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#dcd3c1]"
          >
            ✕
          </button>
        </div>

        {/* 提示反馈信息 */}
        {feedbackMsg && (
          <div className="p-3 rounded-2xl bg-[#176f63]/10 border border-[#176f63]/30 text-xs font-serif text-[#176f63] font-bold text-center animate-fade-in">
            {feedbackMsg}
          </div>
        )}

        {/* 功德总览与电子木鱼 */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 border border-[#c58a28]/30 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(245,230,197,0.96) 0%, rgba(216,185,126,0.88) 100%)',
            boxShadow: '0 12px 30px rgba(111,82,35,0.12)',
            color: '#5B3F1F',
          }}
        >
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold font-serif-sc uppercase tracking-wider opacity-80">
                当前累积功德福慧
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 font-serif font-bold text-[#8A5B21]">
                永不过期
              </span>
            </div>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="font-mono text-4xl sm:text-5xl font-black text-[#5B3F1F] tracking-tight">
                {gongde}
              </span>
              <span className="text-sm font-serif-sc font-bold">功德</span>
            </div>
            <p className="text-xs opacity-85 font-serif">
              每日敲木鱼、签到打卡、排盘与测试皆可化现功德
            </p>
          </div>

          {/* 交互电子木鱼 */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleHitWoodfish}
              className="relative w-24 h-24 rounded-3xl bg-white/80 border-2 border-[#8A5B21]/30 hover:border-[#8A5B21] flex flex-col items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer group"
              title="点击敲击木鱼，功德+1"
            >
              <span className="text-3xl filter group-hover:scale-110 transition-transform">
                🪘
              </span>
              <span className="text-[10px] font-serif-sc font-bold mt-1 text-[#8A5B21]">
                敲击木鱼
              </span>

              {/* 浮动飘起的 +1 功德文字 */}
              {floatingMerits.map((m) => (
                <span
                  key={m.id}
                  className="absolute pointer-events-none font-serif-sc font-black text-sm text-[#8A5B21]"
                  style={{
                    left: m.x,
                    top: m.y - 20,
                    animation: 'fade-in 0.8s ease-out forwards',
                  }}
                >
                  功德+1
                </span>
              ))}
            </button>

            {/* 每日签到按钮 */}
            <button
              disabled={isTodaySignedIn}
              onClick={handleDailySignIn}
              className={`
                px-4 py-1.5 rounded-full text-xs font-serif-sc font-bold shadow-2xs transition-colors
                ${isTodaySignedIn
                  ? 'bg-white/60 text-[#8A5B21]/60 cursor-not-allowed'
                  : 'bg-[#176f63] text-white hover:bg-[#12584e]'
                }
              `}
            >
              {isTodaySignedIn ? '✓ 今日已签到' : '✦ 每日签到 (+10)'}
            </button>
          </div>
        </div>

        {/* 任务清单 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              今日修持任务 (Complete Tasks)
            </h4>
            <span className="text-[10px] text-[#789087] font-serif">每日 00:00 刷新</span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'generate_kline',
                title: '生成一次人生 K 线',
                reward: 15,
                tab: 'kline',
                actionLabel: '去排盘',
              },
              {
                id: 'mbti_test',
                title: '完成 MBTI 命理心法测评',
                reward: 20,
                tab: 'mbti',
                actionLabel: '去测评',
              },
              {
                id: 'chat_avatar',
                title: '与命运分身进行一次对话',
                reward: 10,
                tab: 'chat',
                actionLabel: '去对话',
              },
              {
                id: 'share_card',
                title: '生成并分享命运卡片',
                reward: 20,
                tab: 'share',
                actionLabel: '去分享',
              },
            ].map((task) => {
              const taskKey = `${task.id}_${todayStr}`
              const isDone = completedTasks.includes(taskKey)
              return (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl border border-[#dcd3c1] bg-[#fffdf9] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isDone ? '✓' : '○'}
                    </span>
                    <div>
                      <span className="font-serif-sc font-bold text-[#24453f]">
                        {task.title}
                      </span>
                      <span className="ml-2 font-mono text-[#c58a28] font-bold">
                        +{task.reward} 功德
                      </span>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="text-[11px] font-serif text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50">
                      已达成
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onClose()
                        onNavigateTab?.(task.tab)
                      }}
                      className="px-3 py-1 rounded-xl bg-[#176f63]/10 text-[#176f63] font-serif font-bold hover:bg-[#176f63]/20"
                    >
                      {task.actionLabel} →
                    </button>
                  )}
                </div>
              )
            })}

            {/* 分享结缘任务 */}
            <div className="p-3 rounded-2xl border border-[#c58a28]/30 bg-[#c58a28]/5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                  ★
                </span>
                <div>
                  <span className="font-serif-sc font-bold text-[#8A5B21]">
                    分享结缘 · 引荐同道好友
                  </span>
                  <span className="ml-2 font-mono text-[#c58a28] font-bold">
                    +30 功德
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyInvite}
                className="px-3 py-1 rounded-xl bg-[#c58a28] text-white font-serif font-bold hover:opacity-90 transition-opacity"
              >
                {copiedLink ? '已复制结缘链接' : '复制结缘链接'}
              </button>
            </div>
          </div>
        </div>

        {/* 功德兑换商城 */}
        <div className="space-y-2.5 pt-1 border-t border-[#dcd3c1]/70">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-sc font-bold text-sm text-[#1e2f34]">
              功德兑换商城 (Redeem Pass Rewards)
            </h4>
            <span className="text-[10px] text-[#789087] font-serif">功德抵现金 · 免费开通</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-[#176f63]/30 bg-[#176f63]/5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif-sc font-bold text-sm text-[#176f63]">
                    Pass 寻道者 7 天体验
                  </span>
                  <span className="font-mono text-xs font-black text-[#176f63]">
                    100 功德
                  </span>
                </div>
                <p className="text-[10px] text-[#55736b] mt-1 font-serif">
                  解锁无限次分身 AI 对话、50人档案库、双人合盘深度解析
                </p>
              </div>
              <button
                onClick={() => handleRedeemPass('pro', 100, 7, 'Pass 寻道者 7天卡')}
                className="w-full py-1.5 rounded-xl bg-[#176f63] text-white text-xs font-serif font-bold hover:opacity-90 shadow-2xs"
              >
                兑换开通
              </button>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#c58a28]/30 bg-[#c58a28]/5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif-sc font-bold text-sm text-[#8A5B21]">
                    扶桑天师 VIP 30 天卡
                  </span>
                  <span className="font-mono text-xs font-black text-[#8A5B21]">
                    300 功德
                  </span>
                </div>
                <p className="text-[10px] text-[#78592c] mt-1 font-serif">
                  尊享大师级定制 Prompt、百年大运逐年详批、终身命盘云同步
                </p>
              </div>
              <button
                onClick={() => handleRedeemPass('master', 300, 30, '扶桑天师 30天卡')}
                className="w-full py-1.5 rounded-xl bg-[#c58a28] text-white text-xs font-serif font-bold hover:opacity-90 shadow-2xs"
              >
                兑换开通
              </button>
            </div>
          </div>
        </div>

        {/* 功德明细折叠展示 */}
        <div className="pt-1 border-t border-[#dcd3c1]/70">
          <details className="text-xs font-serif text-[#789087]">
            <summary className="cursor-pointer font-serif-sc font-bold text-[#24453f] hover:text-[#176f63]">
              查看最近功德明细流水 ({meritLogs.length})
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {meritLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#f7f1e7]/60 text-[11px]"
                >
                  <span className="text-[#52666a] truncate">{log.title}</span>
                  <span className={`font-mono font-bold shrink-0 ${log.change >= 0 ? 'text-[#176f63]' : 'text-rose-600'}`}>
                    {log.change >= 0 ? `+${log.change}` : log.change}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
