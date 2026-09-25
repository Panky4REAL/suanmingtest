/* ============================================================
   玄机 · 账号与数据中心 (AccountView)
   - 身份信息展示与快捷登录/退出切换
   - 手机号、微信、邮箱绑定管理
   - 会员特权与付费订单中心 (Order History)
   - 命理档案与历史记录 JSON 一键导出备份与导入还原
   ============================================================ */

import { useState, useRef } from 'react'
import { useProfileStore } from '@/stores'
import { AuthModal } from '@/components/auth'
import { CheckoutModal } from '@/components/payment'

export function AccountView() {
  const {
    userId,
    userName,
    updateUserName,
    membershipTier,
    vipExpiresAt,
    gongde,
    profiles,
    history,
    isLoggedIn,
    loginMethod,
    userPhone,
    userEmail,
    orders,
    logout,
  } = useProfileStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(userName)
  const [copiedId, setCopiedId] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUserName(tempName.trim())
    }
    setIsEditingName(false)
  }

  // 导出数据备份
  const handleExportBackup = () => {
    const backupData = {
      version: 2,
      platform: 'XuanJi Destiny',
      exportTime: new Date().toISOString(),
      userId,
      userName,
      membershipTier,
      vipExpiresAt,
      gongde,
      profiles,
      history,
      orders,
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xuanji-destiny-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导入数据备份
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        if (parsed.profiles && Array.isArray(parsed.profiles)) {
          useProfileStore.setState({
            profiles: parsed.profiles,
            history: parsed.history || [],
            gongde: Math.max(parsed.gongde || 168, useProfileStore.getState().gongde),
            orders: parsed.orders || useProfileStore.getState().orders,
          })
          alert(`✅ 成功恢复 ${parsed.profiles.length} 份命盘档案与 ${parsed.history?.length || 0} 条测算记录！`)
        } else {
          alert('⚠️ 备份文件格式有误，无法识别档案数据。')
        }
      } catch (err) {
        alert('⚠️ 文件解析失败，请确保上传正确的 JSON 备份文件。')
      }
    }
    reader.readAsText(file)
  }

  const formatExpiry = (ts: number | null) => {
    if (!ts) return '永久有效'
    const d = new Date(ts)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 到期`
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* 隐秘文件上传 input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* 1. 账号身份卡片 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#dcd3c1] shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#176f63] text-white flex items-center justify-center text-xl font-bold font-serif-sc shadow-md">
              {userName.slice(0, 1) || '玄'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={12}
                      className="px-2 py-0.5 rounded-lg border border-[#176f63] text-sm text-[#1e2f34] outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2 py-0.5 rounded-lg bg-[#176f63] text-white text-xs font-serif"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif-sc font-bold text-lg text-[#1e2f34]">{userName}</h3>
                    <button
                      onClick={() => {
                        setTempName(userName)
                        setIsEditingName(true)
                      }}
                      className="text-xs text-[#789087] hover:text-[#176f63]"
                      title="修改道号昵称"
                    >
                      ✎
                    </button>
                  </>
                )}
                <span className="text-[10px] font-bold font-serif-sc px-2 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63]">
                  {membershipTier === 'master' ? '🔱 玄机天师' : membershipTier === 'pro' ? '👑 寻道者 Pass' : '灵童客 (Free)'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#789087] font-mono">
                <span>玄机编号: {userId}</span>
                <button
                  onClick={handleCopyId}
                  className="text-[10px] hover:text-[#176f63]"
                  title="复制玄机道友编号"
                >
                  {copiedId ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>

          <div>
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl border border-[#dcd3c1] text-xs font-serif text-[#789087] hover:text-red-600 hover:border-red-300 transition-colors"
              >
                退出登录
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-xuanji px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold shadow-xs"
              >
                立即登录
              </button>
            )}
          </div>
        </div>

        {/* 账号关联状态 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#dcd3c1]/60">
          <div className="p-3 rounded-2xl bg-[#f7f1e7] flex items-center justify-between">
            <div className="text-xs">
              <p className="text-[#789087] font-serif">手机号</p>
              <p className="font-mono text-[#1e2f34] mt-0.5">{userPhone || '未绑定'}</p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-[11px] text-[#176f63] font-serif hover:underline"
            >
              {userPhone ? '换绑' : '绑定'}
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-[#f7f1e7] flex items-center justify-between">
            <div className="text-xs">
              <p className="text-[#789087] font-serif">微信快捷登录</p>
              <p className="text-[#1e2f34] mt-0.5">{loginMethod === 'wechat' ? '已绑定授权' : '未关联'}</p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-[11px] text-[#176f63] font-serif hover:underline"
            >
              {loginMethod === 'wechat' ? '已连接' : '去绑定'}
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-[#f7f1e7] flex items-center justify-between">
            <div className="text-xs">
              <p className="text-[#789087] font-serif">邮箱绑定</p>
              <p className="font-mono text-[#1e2f34] mt-0.5 truncate max-w-[120px]">{userEmail || '未绑定'}</p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-[11px] text-[#176f63] font-serif hover:underline"
            >
              {userEmail ? '换绑' : '绑定'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. 会员权益与续费中心 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#dcd3c1] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h4 className="font-serif-sc font-bold text-base text-[#1e2f34]">会员特权与付费中心</h4>
          </div>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="btn-xuanji px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold shadow-xs"
          >
            {membershipTier === 'free' ? '开通 Pass 会员' : '续费 / 升级会员'}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#789087] font-serif">当前方案：</span>
              <span className="font-serif-sc font-bold text-sm text-[#176f63]">
                {membershipTier === 'master' ? '玄机天师 VIP (至尊终身)' : membershipTier === 'pro' ? '寻道者 Pass 会员' : '灵童客 (基础版)'}
              </span>
            </div>
            <p className="text-xs text-[#52666a] font-serif mt-0.5">
              有效期状态：{formatExpiry(vipExpiresAt)} · 剩余可用功德：<span className="font-mono text-[#c58a28] font-bold">{gongde}</span> 点
            </p>
          </div>
        </div>
      </div>

      {/* 3. 付费订单记录 (Order History) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#dcd3c1] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <h4 className="font-serif-sc font-bold text-base text-[#1e2f34]">我的购买订单</h4>
          </div>
          <span className="text-xs text-[#789087] font-serif">共 {orders.length} 笔交易</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#879397] font-serif">
            暂无付费订单记录
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-3.5 rounded-2xl bg-[#f7f1e7] border border-[#dcd3c1]/70 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif-sc font-bold text-[#1e2f34]">{ord.planName}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      已支付
                    </span>
                  </div>
                  <p className="text-[11px] text-[#789087] font-mono">
                    单号: {ord.orderId} · {formatDate(ord.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-bold text-[#c58a28]">
                    {ord.price === 0 ? '免费' : `¥${ord.price}`}
                  </span>
                  <p className="text-[10px] text-[#789087] font-serif">
                    {ord.paymentMethod === 'wechat' ? '微信支付' : ord.paymentMethod === 'alipay' ? '支付宝' : '功德兑换'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. 命理档案与历史云端备份 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#dcd3c1] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💾</span>
          <h4 className="font-serif-sc font-bold text-base text-[#1e2f34]">数据沙盒与本地备份</h4>
        </div>
        <p className="text-xs text-[#52666a] font-serif leading-relaxed">
          玄机系统遵循严格的隐私沙盒准则。您的所有生辰八字、亲友档案库（当前 {profiles.length} 份）及测算历史足迹（当前 {history.length} 条）均安全密储于您本地浏览器中。您可以随时导出全量 JSON 备份，或在换机时一键无缝还原。
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex-1 py-2.5 rounded-xl border border-[#176f63] bg-[#176f63]/5 hover:bg-[#176f63]/10 text-[#176f63] font-serif-sc font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>📥 导出全量数据备份 (.json)</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 rounded-xl border border-[#dcd3c1] bg-white hover:bg-gray-50 text-[#52666a] font-serif-sc font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>📤 导入备份文件还原</span>
          </button>
        </div>
      </div>

      {/* 弹窗引用 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} />
    </div>
  )
}
