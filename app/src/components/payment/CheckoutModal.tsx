/* ============================================================
   玄机 · 收银台与商业付费结算中心 (CheckoutModal)
   - 支持月卡/季卡/年卡/终身天师多梯度套餐
   - 功德抵扣现金计算
   - 微信支付 / 支付宝原生视觉收银台
   - 动态二维码、倒计时、模拟支付回调与权益即时到账
   ============================================================ */

import { useState, useEffect } from 'react'
import { useProfileStore, type MembershipTier } from '@/stores'

export interface CheckoutPlan {
  id: string
  name: string
  tier: MembershipTier
  durationDays: number
  price: number
  originalPrice: number
  badge?: string
  bonusMerit: number
  features: string[]
}

export const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    id: 'pass_monthly',
    name: '寻道者 Pass · 月度会员',
    tier: 'pro',
    durationDays: 30,
    price: 19.9,
    originalPrice: 39,
    bonusMerit: 50,
    features: ['无限次 AI 命运分身灵犀对话', '50位多命盘档案库容量', '紫微 × MBTI 全息双维共振'],
  },
  {
    id: 'pass_quarterly',
    name: '寻道者 Pass · 季度特惠',
    tier: 'pro',
    durationDays: 90,
    price: 49,
    originalPrice: 117,
    badge: '省 ¥68',
    bonusMerit: 150,
    features: ['包含月卡全部尊享特权', '双人合盘生克深度推演', '赠送 150 功德点数'],
  },
  {
    id: 'pass_yearly',
    name: '寻道者 Pass · 年度尊享',
    tier: 'pro',
    durationDays: 365,
    price: 129,
    originalPrice: 468,
    badge: '最受欢迎 · 折扣 72%',
    bonusMerit: 500,
    features: ['高阶大运 AI 流年详批', '极速专属算力通道', '终身命盘云备份', '赠送 500 功德点数'],
  },
  {
    id: 'master_lifetime',
    name: '玄机天师 · 终身永久合伙人',
    tier: 'master',
    durationDays: 36500, // 永久100年
    price: 298,
    originalPrice: 598,
    badge: '至尊买断 · 限时5折',
    bonusMerit: 1000,
    features: ['终身尊享天师级慢思考推理模型', '百年流年逐年万字命书导出', '专属朱砂金印命理鉴章', '终身所有新功能永久免费'],
  },
]

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  initialPlanId?: string
}

export function CheckoutModal({ isOpen, onClose, initialPlanId }: CheckoutModalProps) {
  const { gongde, createAndPayOrder } = useProfileStore()

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || 'pass_yearly')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [useGongdeDeduction, setUseGongdeDeduction] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'qrcode' | 'success'>('select')
  const [timeLeft, setTimeLeft] = useState(900) // 15分钟倒计时
  const [paying, setPaying] = useState(false)

  const selectedPlan = CHECKOUT_PLANS.find((p) => p.id === selectedPlanId) || CHECKOUT_PLANS[2]

  // 功德抵扣规则：最多抵扣原价 20%，每 100 功德抵扣 5 元
  const maxDeductibleYuan = Math.floor(selectedPlan.price * 0.2)
  const availableGongdeYuan = Math.floor(gongde / 20)
  const actualDeductYuan = useGongdeDeduction ? Math.min(maxDeductibleYuan, availableGongdeYuan) : 0
  const actualDeductGongde = actualDeductYuan * 20
  const finalPrice = Math.max(0.01, +(selectedPlan.price - actualDeductYuan).toFixed(2))

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId)
    }
  }, [initialPlanId])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (paymentStep === 'qrcode' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [paymentStep, timeLeft])

  if (!isOpen) return null

  // 格式化倒计时
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 点击前往收银台扫码
  const handleProceedToQR = () => {
    setPaymentStep('qrcode')
    setTimeLeft(900)
  }

  // 模拟支付完成
  const handleSimulatePaymentSuccess = () => {
    setPaying(true)
    setTimeout(() => {
      createAndPayOrder({
        planName: selectedPlan.name,
        tier: selectedPlan.tier,
        durationDays: selectedPlan.durationDays,
        price: finalPrice,
        originalPrice: selectedPlan.price,
        gongdeDeducted: actualDeductGongde,
        paymentMethod,
      })
      setPaying(false)
      setPaymentStep('success')
    }, 1000)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#fffdf9] border border-[#dcd3c1] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1e2f34] relative max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#176f63] to-[#c58a28] text-white flex items-center justify-center text-xs font-serif-sc font-bold shadow-2xs">
              收银
            </span>
            <div>
              <h3 className="font-serif-sc font-bold text-lg text-[#1e2f34] leading-tight">
                玄机收银台 · 开通会员特权
              </h3>
              <p className="text-[11px] text-[#789087] font-serif">
                安全加密支付 · 实时到账 · 随时可补退
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4eddf] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#e4dbca] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: 选择套餐与支付方式 */}
        {paymentStep === 'select' && (
          <div className="space-y-6 pt-2">
            {/* 套餐方案列表 */}
            <div className="space-y-2.5">
              <label className="text-xs font-serif-sc font-bold text-[#52666a]">
                选择会员订阅方案
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHECKOUT_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`
                        p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between
                        ${isSelected
                          ? 'border-[#176f63] bg-[#176f63]/5 shadow-sm'
                          : 'border-[#dcd3c1] bg-white hover:border-[#176f63]/40'}
                      `}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-bold font-serif-sc px-2 py-0.5 rounded-full bg-gradient-to-r from-[#c58a28] to-[#8A5B21] text-white shadow-2xs">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-serif-sc font-bold text-sm text-[#1e2f34]">
                            {plan.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#789087] font-serif mt-0.5">
                          赠送 +{plan.bonusMerit} 功德点数
                        </p>
                      </div>

                      <div className="pt-3 flex items-baseline gap-1.5 border-t border-[#dcd3c1]/60 mt-3">
                        <span className="text-xs text-[#c58a28] font-bold">¥</span>
                        <span className="text-2xl font-black font-mono text-[#176f63]">
                          {plan.price}
                        </span>
                        <span className="text-xs text-[#879397] line-through font-mono">
                          ¥{plan.originalPrice}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 功德抵扣开关 */}
            <div className="p-3.5 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-serif-sc font-bold text-[#1e2f34]">功德抵扣优惠</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#c58a28]/20 text-[#8A5B21] font-mono">
                      可用 {gongde} 功德
                    </span>
                  </div>
                  <p className="text-[11px] text-[#789087] font-serif">
                    每 100 功德抵 ¥5 元，本单最高可抵扣 ¥{maxDeductibleYuan} 元
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGongdeDeduction}
                  onChange={(e) => setUseGongdeDeduction(e.target.checked)}
                  disabled={availableGongdeYuan <= 0}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#176f63]" />
              </label>
            </div>

            {/* 支付方式选择 */}
            <div className="space-y-2">
              <label className="text-xs font-serif-sc font-bold text-[#52666a]">
                选择支付通道
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('wechat')}
                  className={`
                    p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all
                    ${paymentMethod === 'wechat'
                      ? 'border-[#07c160] bg-[#07c160]/5 shadow-2xs'
                      : 'border-[#dcd3c1] bg-white hover:border-[#07c160]/50'}
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-[#07c160] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    微
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1e2f34] font-serif-sc">微信支付</p>
                    <p className="text-[10px] text-[#789087]">WeChat Pay</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('alipay')}
                  className={`
                    p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all
                    ${paymentMethod === 'alipay'
                      ? 'border-[#1677ff] bg-[#1677ff]/5 shadow-2xs'
                      : 'border-[#dcd3c1] bg-white hover:border-[#1677ff]/50'}
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1677ff] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    支
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1e2f34] font-serif-sc">支付宝</p>
                    <p className="text-[10px] text-[#789087]">Alipay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 结算底栏 */}
            <div className="pt-3 border-t border-[#dcd3c1] flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#52666a] font-serif">实付金额：</span>
                  <span className="text-xs text-[#c58a28] font-bold">¥</span>
                  <span className="text-3xl font-black font-mono text-[#c58a28]">
                    {finalPrice}
                  </span>
                  {actualDeductYuan > 0 && (
                    <span className="text-[11px] text-[#176f63] font-serif ml-1.5">
                      (已抵扣 ¥{actualDeductYuan})
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#879397] font-serif">
                  购买即代表同意《玄机增值服务协议》，支持7天无理由售后
                </p>
              </div>

              <button
                onClick={handleProceedToQR}
                className="btn-xuanji px-6 py-2.5 rounded-xl text-sm font-bold font-serif-sc tracking-wide shadow-sm hover:opacity-95"
              >
                立即支付 ¥{finalPrice}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 动态支付二维码收银台 */}
        {paymentStep === 'qrcode' && (
          <div className="space-y-6 pt-2 text-center">
            <div className="space-y-1">
              <span className="text-xs text-[#789087] font-serif">应付总额</span>
              <div className="text-3xl font-black font-mono text-[#176f63]">
                ¥ {finalPrice}
              </div>
              <p className="text-xs text-[#52666a] font-serif-sc">
                {selectedPlan.name} · 订单时效剩余 <span className="font-mono text-red-600 font-bold">{formatTime(timeLeft)}</span>
              </p>
            </div>

            {/* 动态二维码视觉 */}
            <div className="inline-block p-4 rounded-3xl bg-white border border-[#dcd3c1] shadow-md relative">
              <div className="w-52 h-52 bg-[#faf7f0] rounded-2xl flex flex-col items-center justify-center p-3 relative group">
                {/* 模拟官方收银台点阵 */}
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className={`w-12 h-12 border-4 ${paymentMethod === 'wechat' ? 'border-[#07c160]' : 'border-[#1677ff]'} p-1.5 flex items-center justify-center`}>
                      <div className={`w-5 h-5 ${paymentMethod === 'wechat' ? 'bg-[#07c160]' : 'bg-[#1677ff]'}`} />
                    </div>
                    <div className={`w-12 h-12 border-4 ${paymentMethod === 'wechat' ? 'border-[#07c160]' : 'border-[#1677ff]'} p-1.5 flex items-center justify-center`}>
                      <div className={`w-5 h-5 ${paymentMethod === 'wechat' ? 'bg-[#07c160]' : 'bg-[#1677ff]'}`} />
                    </div>
                  </div>
                  {/* 中间 Logo */}
                  <div className={`self-center w-14 h-14 rounded-full ${paymentMethod === 'wechat' ? 'bg-[#07c160]' : 'bg-[#1677ff]'} text-white flex items-center justify-center text-xs font-serif-sc font-bold border-2 border-white shadow-lg`}>
                    {paymentMethod === 'wechat' ? '微信支付' : '支付宝'}
                  </div>
                  <div className="flex justify-between">
                    <div className={`w-12 h-12 border-4 ${paymentMethod === 'wechat' ? 'border-[#07c160]' : 'border-[#1677ff]'} p-1.5 flex items-center justify-center`}>
                      <div className={`w-5 h-5 ${paymentMethod === 'wechat' ? 'bg-[#07c160]' : 'bg-[#1677ff]'}`} />
                    </div>
                    <div className="text-[10px] font-mono text-[#789087] flex items-end">
                      玄机官方
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[#52666a] font-serif">
                请打开手机 {paymentMethod === 'wechat' ? '微信' : '支付宝'} 扫一扫完成支付
              </p>
              <p className="text-[11px] text-[#879397] font-mono">
                商户订单号: ORD-{Date.now().toString().slice(-8)}
              </p>
            </div>

            {/* 模拟确认支付动作 */}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setPaymentStep('select')}
                className="px-4 py-2 rounded-xl text-xs font-serif-sc border border-[#dcd3c1] text-[#52666a] hover:bg-gray-50"
              >
                ← 返回修改套餐
              </button>
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={paying}
                className="btn-xuanji px-6 py-2 rounded-xl text-xs font-serif-sc font-bold shadow-xs flex items-center gap-1.5"
              >
                {paying ? (
                  <span>支付确认中...</span>
                ) : (
                  <span>✦ 模拟已完成支付</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 支付成功 */}
        {paymentStep === 'success' && (
          <div className="space-y-6 pt-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md">
              ✓
            </div>

            <div className="space-y-1">
              <h4 className="font-serif-sc font-bold text-xl text-[#1e2f34]">
                恭喜！支付成功，特权已开通
              </h4>
              <p className="text-xs text-[#176f63] font-serif">
                尊贵的【{selectedPlan.name}】已实时同步至您的账号，赠送的功德已入账！
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1] text-left text-xs font-serif space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-[#789087]">开通套餐：</span>
                <span className="font-bold text-[#1e2f34]">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#789087]">有效期：</span>
                <span className="text-[#176f63] font-bold">增加 {selectedPlan.durationDays} 天</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#789087]">实付金额：</span>
                <span className="font-mono text-[#c58a28] font-bold">¥ {finalPrice}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-xuanji px-8 py-2.5 rounded-xl text-sm font-bold font-serif-sc shadow-sm"
            >
              即刻体验全部高级特权
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
