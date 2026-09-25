/* ============================================================
   玄机 · 统一登录与账号认证中心 (AuthModal)
   - 支持手机验证码快速登录 / 注册
   - 支持微信扫码一键授权登录
   - 支持邮箱密码快捷登录
   - 支持免注册游客体验通道
   ============================================================ */

import { useState, useEffect } from 'react'
import { useProfileStore } from '@/stores'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type TabMode = 'phone' | 'wechat' | 'email'

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login } = useProfileStore()

  const [mode, setMode] = useState<TabMode>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(true)

  // 微信扫码倒计时模拟
  const [wechatScanStatus, setWechatScanStatus] = useState<'waiting' | 'scanned' | 'confirmed'>('waiting')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  if (!isOpen) return null

  // 发送短信验证码
  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      setMessage({ text: '请输入有效的11位手机号码', type: 'error' })
      return
    }
    setCountdown(60)
    setMessage({ text: `验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(-4)}，模拟验证码：8888`, type: 'info' })
  }

  // 手机号登录
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      setMessage({ text: '请先勾选并同意用户协议与隐私条款', type: 'error' })
      return
    }
    if (!phone || phone.length < 11) {
      setMessage({ text: '请输入有效的11位手机号码', type: 'error' })
      return
    }
    if (!code) {
      setMessage({ text: '请输入短信验证码（模拟请输入 8888）', type: 'error' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      login({
        method: 'phone',
        account: phone,
        nickname: `玄机行者_${phone.slice(-4)}`,
      })
      setLoading(false)
      setMessage({ text: '登录成功！已为您同步玄机云端命盘与赠送 66 功德', type: 'success' })
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    }, 600)
  }

  // 微信扫码模拟
  const handleWechatSimulate = () => {
    if (!agreeTerms) {
      setMessage({ text: '请先勾选并同意用户协议与隐私条款', type: 'error' })
      return
    }
    setWechatScanStatus('scanned')
    setTimeout(() => {
      setWechatScanStatus('confirmed')
      login({
        method: 'wechat',
        nickname: '微信道友·灵虚',
      })
      setMessage({ text: '微信快捷登录成功！', type: 'success' })
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    }, 1200)
  }

  // 邮箱登录
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      setMessage({ text: '请先勾选并同意用户协议与隐私条款', type: 'error' })
      return
    }
    if (!email || !email.includes('@')) {
      setMessage({ text: '请输入正确的邮箱地址', type: 'error' })
      return
    }
    if (!password || password.length < 6) {
      setMessage({ text: '密码长度至少6位', type: 'error' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      login({
        method: 'email',
        account: email,
        nickname: email.split('@')[0],
      })
      setLoading(false)
      setMessage({ text: '邮箱登录成功！', type: 'success' })
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
    }, 600)
  }

  // 游客继续
  const handleGuestContinue = () => {
    login({
      method: 'guest',
      nickname: '访客道友',
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fffdf9] border border-[#dcd3c1] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#1e2f34] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部背景装饰 */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#176f63]/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#c58a28]/10 rounded-full blur-xl pointer-events-none" />

        {/* 标题栏 */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#176f63] text-white flex items-center justify-center text-sm font-serif-sc font-black shadow-sm">
              玄
            </div>
            <div>
              <h3 className="font-serif-sc font-bold text-lg text-[#1e2f34] leading-tight">
                道友登录 · 玄机
              </h3>
              <p className="text-[11px] text-[#789087] font-serif">
                XuanJi Destiny · 登录云端保存命盘与权益
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

        {/* 登录方式 Tabs */}
        <div className="flex rounded-xl bg-[#f4eddf] p-1 text-xs font-serif-sc font-medium relative z-10">
          <button
            onClick={() => { setMode('phone'); setMessage(null) }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'phone' ? 'bg-white text-[#176f63] font-bold shadow-2xs' : 'text-[#789087] hover:text-[#24453f]'
            }`}
          >
            📱 手机快捷登录
          </button>
          <button
            onClick={() => { setMode('wechat'); setMessage(null) }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'wechat' ? 'bg-white text-[#176f63] font-bold shadow-2xs' : 'text-[#789087] hover:text-[#24453f]'
            }`}
          >
            💬 微信扫码
          </button>
          <button
            onClick={() => { setMode('email'); setMessage(null) }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'email' ? 'bg-white text-[#176f63] font-bold shadow-2xs' : 'text-[#789087] hover:text-[#24453f]'
            }`}
          >
            ✉️ 邮箱账号
          </button>
        </div>

        {/* 状态与提示反馈 */}
        {message && (
          <div
            className={`p-2.5 rounded-xl text-xs font-serif transition-all ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 1. 手机验证码登录 */}
        {mode === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-serif-sc text-[#52666a]">中国大陆手机号</label>
              <div className="flex rounded-xl border border-[#dcd3c1] bg-white overflow-hidden focus-within:border-[#176f63] transition-colors shadow-2xs">
                <span className="px-3 py-2 text-xs font-mono text-[#789087] border-r border-[#dcd3c1] flex items-center bg-[#faf6ee]">
                  +86
                </span>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="请输入手机号码"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 text-sm text-[#1e2f34] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif-sc text-[#52666a]">短信验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#dcd3c1] bg-white text-sm text-[#1e2f34] outline-none focus:border-[#176f63] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-3 py-2 rounded-xl text-xs font-serif-sc font-medium border border-[#176f63]/30 bg-[#176f63]/10 text-[#176f63] hover:bg-[#176f63]/20 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-xuanji w-full py-2.5 rounded-xl text-sm font-bold font-serif-sc tracking-wide shadow-sm"
            >
              {loading ? '正在验证入道...' : '立即登录 / 自动注册'}
            </button>
          </form>
        )}

        {/* 2. 微信扫码一键登录 */}
        {mode === 'wechat' && (
          <div className="space-y-4 text-center py-2 relative z-10">
            <div className="relative inline-block p-4 rounded-2xl bg-white border border-[#dcd3c1] shadow-inner">
              {/* 高保真水墨太极扫码二维码 */}
              <div className="w-44 h-44 bg-[#faf7f0] rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden group">
                {/* 模拟二维码点阵图案 */}
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-[#176f63] p-1 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#176f63]" />
                    </div>
                    <div className="w-10 h-10 border-4 border-[#176f63] p-1 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#176f63]" />
                    </div>
                  </div>
                  {/* 中间玄机徽标 */}
                  <div className="self-center w-12 h-12 rounded-full bg-[#176f63] text-white flex items-center justify-center text-xs font-serif-sc font-bold border-2 border-white shadow-md">
                    玄机
                  </div>
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-[#176f63] p-1 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#176f63]" />
                    </div>
                    <div className="text-[9px] font-mono text-[#789087] flex items-end">
                      扫码结缘
                    </div>
                  </div>
                </div>

                {/* 扫码中蒙层 */}
                {wechatScanStatus === 'scanned' && (
                  <div className="absolute inset-0 bg-[#176f63]/90 text-white flex flex-col items-center justify-center gap-2 animate-fade-in">
                    <span className="text-2xl animate-bounce">📱</span>
                    <span className="text-xs font-serif-sc font-bold">已扫描，请在手机上确认</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-[#52666a] font-serif">
              请打开微信扫一扫上方二维码，授权快捷登录
            </p>

            <button
              type="button"
              onClick={handleWechatSimulate}
              className="px-4 py-2 rounded-xl text-xs font-serif-sc font-semibold bg-[#07c160]/10 text-[#07c160] hover:bg-[#07c160]/20 border border-[#07c160]/30 transition-colors inline-flex items-center gap-1.5"
            >
              <span>✦ 模拟微信扫码成功</span>
            </button>
          </div>
        )}

        {/* 3. 邮箱密码登录 */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-serif-sc text-[#52666a]">道友邮箱</label>
              <input
                type="email"
                placeholder="example@destiny.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd3c1] bg-white text-sm text-[#1e2f34] outline-none focus:border-[#176f63] shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif-sc text-[#52666a]">通行密码</label>
              <input
                type="password"
                placeholder="至少6位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd3c1] bg-white text-sm text-[#1e2f34] outline-none focus:border-[#176f63] shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-xuanji w-full py-2.5 rounded-xl text-sm font-bold font-serif-sc tracking-wide shadow-sm"
            >
              {loading ? '验证中...' : '邮箱安全登录'}
            </button>
          </form>
        )}

        {/* 底部协议与游客模式 */}
        <div className="pt-2 border-t border-[#dcd3c1]/60 space-y-3 relative z-10">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#789087] font-serif">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded text-[#176f63] focus:ring-0"
            />
            <span>
              已阅读并同意 <a href="#terms" className="text-[#176f63] underline">用户服务协议</a> 与 <a href="#privacy" className="text-[#176f63] underline">隐私政策声明</a>
            </span>
          </label>

          <div className="flex items-center justify-between text-xs text-[#789087]">
            <span className="font-serif">新人结缘即送 100 功德</span>
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-[#176f63] font-semibold hover:underline"
            >
              免登录快速体验 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
