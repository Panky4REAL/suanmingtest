/* ============================================================
   扶桑 · Pass 会员与特权订阅中心 (SubscriptionModal)
   对标 lifekline.ai/avatar/subscription
   - 灵童客 (Free) / 寻道者 (Pass) / 扶桑天师 (Master) 三档特权
   - 权益对比表
   - 支持功德一键兑换开通
   ============================================================ */

import { useProfileStore, type MembershipTier } from '@/stores'

interface SubscriptionModalProps {
  onClose: () => void
}

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const { membershipTier, vipExpiresAt, gongde, addGongde, upgradeMembership } = useProfileStore()

  const handleRedeem = (tier: MembershipTier, cost: number, days: number, title: string) => {
    if (gongde < cost) {
      alert(`当前功德点数为 ${gongde}，不足 ${cost} 功德，请前往功德中心完成任务积攒！`)
      return
    }
    addGongde(-cost, `兑换开通 · ${title}`)
    upgradeMembership(tier, days)
    alert(`🎉 恭喜！成功开通【${title}】！`)
  }

  const formatExpiry = (ts: number | null) => {
    if (!ts) return '永久有效'
    const d = new Date(ts)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 到期`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 text-[#1e2f34] max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#176f63] to-[#c58a28] text-white flex items-center justify-center text-xs font-bold font-serif-sc">
              Pass
            </span>
            <div>
              <h3 className="font-serif-sc font-bold text-lg text-[#24453f] leading-tight">
                扶桑 Pass · 命运特权会员
              </h3>
              <p className="text-[10px] text-[#789087] font-serif">
                Avatar Pass & Advanced Destiny Privileges
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

        {/* 当前身份胶囊卡 */}
        <div className="p-4 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#789087] font-serif">当前会员身份：</span>
                <span className="font-serif-sc font-bold text-sm text-[#176f63]">
                  {membershipTier === 'master' ? '扶桑天师 VIP' : membershipTier === 'pro' ? '寻道者 Pass 会员' : '灵童客 (免费版)'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A5B21] font-serif mt-0.5">
                {membershipTier === 'free' ? '可使用功德点数免费兑换高级 Pass 会员特权' : `权益状态：${formatExpiry(vipExpiresAt)}`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#789087] font-serif">可用功德：</span>
            <span className="font-mono text-base font-bold text-[#c58a28] ml-1">{gongde}</span>
          </div>
        </div>

        {/* 三档会员卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. 灵童客 */}
          <div className="p-5 rounded-3xl border border-[#dcd3c1] bg-[#fffdf9] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-serif font-semibold">
                基础入门
              </span>
              <h4 className="text-xl font-bold font-serif-sc text-[#1e2f34]">灵童客</h4>
              <p className="text-xs text-[#789087] font-serif">
                体验东方紫微斗数与人生K线基础推演
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black font-mono text-[#24453f]">免费</span>
                <span className="text-xs text-[#879397] ml-1 font-serif">永久可用</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#52666a] font-serif border-t border-[#dcd3c1]/70 pt-3">
              <li className="flex items-center gap-1.5">✓ 基础十二宫排盘</li>
              <li className="flex items-center gap-1.5">✓ 百年大运人生K线趋势</li>
              <li className="flex items-center gap-1.5">✓ 每日运势与吉凶宜忌</li>
              <li className="flex items-center gap-1.5">✓ 3 个档案库容量</li>
              <li className="flex items-center gap-1.5 text-[#879397]">✕ 命运分身深度 AI 对话</li>
              <li className="flex items-center gap-1.5 text-[#879397]">✕ 双人合盘深度解析</li>
            </ul>

            <button
              disabled
              className="w-full py-2 rounded-xl border border-[#dcd3c1] bg-gray-100 text-gray-500 text-xs font-serif cursor-default"
            >
              当前等级
            </button>
          </div>

          {/* 2. 寻道者 Pass (主推) */}
          <div className="p-5 rounded-3xl border-2 border-[#176f63] bg-gradient-to-b from-[#176f63]/5 to-[#fffdf9] flex flex-col justify-between space-y-4 shadow-sm relative">
            <span className="absolute -top-3 right-5 text-[10px] font-bold font-serif-sc px-2.5 py-0.5 rounded-full bg-[#176f63] text-white shadow-2xs">
              ✦ 热门推荐 ✦
            </span>

            <div className="space-y-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#176f63]/15 text-[#176f63] font-serif font-semibold">
                进阶探索
              </span>
              <h4 className="text-xl font-bold font-serif-sc text-[#176f63]">寻道者 Pass</h4>
              <p className="text-xs text-[#55736b] font-serif">
                全方位解锁 AI 命运分身对话与高阶 K 线
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black font-mono text-[#176f63]">100</span>
                <span className="text-xs text-[#55736b] ml-1 font-serif">功德 / 7天</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#24453f] font-serif border-t border-[#176f63]/20 pt-3">
              <li className="flex items-center gap-1.5 font-semibold text-[#176f63]">✓ 无限次命运分身 AI 灵犀对话</li>
              <li className="flex items-center gap-1.5 font-semibold text-[#176f63]">✓ 50 位多命盘档案库容量</li>
              <li className="flex items-center gap-1.5 font-semibold text-[#176f63]">✓ 紫微 × MBTI 全息双维共振</li>
              <li className="flex items-center gap-1.5 font-semibold text-[#176f63]">✓ 双人合盘生克深度推演</li>
              <li className="flex items-center gap-1.5">✓ 尊享高阶大运 AI 详批</li>
            </ul>

            <button
              onClick={() => handleRedeem('pro', 100, 7, '寻道者 Pass 7天卡')}
              className="btn-fusang w-full py-2.5 rounded-xl text-xs font-bold font-serif-sc shadow-2xs"
            >
              使用 100 功德兑换
            </button>
          </div>

          {/* 3. 扶桑天师 VIP */}
          <div className="p-5 rounded-3xl border border-[#c58a28] bg-gradient-to-b from-[#c58a28]/10 to-[#fffdf9] flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c58a28]/20 text-[#8A5B21] font-serif font-semibold">
                至尊天师
              </span>
              <h4 className="text-xl font-bold font-serif-sc text-[#8A5B21]">扶桑天师 VIP</h4>
              <p className="text-xs text-[#78592c] font-serif">
                玄门大师级专属定制与流年万字详批
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black font-mono text-[#8A5B21]">300</span>
                <span className="text-xs text-[#78592c] ml-1 font-serif">功德 / 30天</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[#5B3F1F] font-serif border-t border-[#c58a28]/20 pt-3">
              <li className="flex items-center gap-1.5 font-bold text-[#8A5B21]">✓ 包含寻道者全部尊贵特权</li>
              <li className="flex items-center gap-1.5 font-bold text-[#8A5B21]">✓ 独家天师级 Prompt 命理模型</li>
              <li className="flex items-center gap-1.5 font-bold text-[#8A5B21]">✓ 百年流年逐年万字 AI 详批</li>
              <li className="flex items-center gap-1.5">✓ 终身无限多档案云备份</li>
              <li className="flex items-center gap-1.5">✓ 专属朱砂金印命理鉴章</li>
            </ul>

            <button
              onClick={() => handleRedeem('master', 300, 30, '扶桑天师 30天卡')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c58a28] to-[#8A5B21] text-white text-xs font-bold font-serif-sc shadow-2xs hover:opacity-90"
            >
              使用 300 功德兑换
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
