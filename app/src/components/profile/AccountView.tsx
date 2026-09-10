/* ============================================================
   扶桑 · 账号与数据中心 (AccountView)
   对标 lifekline.ai/profile 账号与云端同步模块：
   - 身份信息展示与昵称修改
   - 登录/注册与第三方绑定入口
   - 命理档案与历史记录 JSON 一键导出备份与导入还原
   - 纯前端隐私保护与本地缓存管理
   ============================================================ */

import { useState, useRef } from 'react'
import { useProfileStore } from '@/stores'

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
  } = useProfileStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(userName)
  const [copiedId, setCopiedId] = useState(false)
  const [showLoginSim, setShowLoginSim] = useState(false)
  const [simEmail, setSimEmail] = useState('')

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
      version: 1,
      exportTime: new Date().toISOString(),
      userId,
      userName,
      membershipTier,
      vipExpiresAt,
      gongde,
      profiles,
      history,
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fusang-destiny-backup-${new Date().toISOString().split('T')[0]}.json`
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
            gongde: Math.max(parsed.gongde || 108, useProfileStore.getState().gongde),
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

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* 隐秘文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* 顶部身份卡片 */}
      <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dcd3c1]/70">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#176f63] to-[#c58a28] text-white flex items-center justify-center font-serif-sc font-black text-2xl shadow-xs">
              桑
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="px-2.5 py-1 text-sm font-serif-sc font-bold border border-[#176f63] rounded-lg bg-white"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#176f63] text-white font-serif"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold font-serif-sc text-[#1e2f34]">
                      {userName}
                    </h3>
                    <button
                      onClick={() => {
                        setTempName(userName)
                        setIsEditingName(true)
                      }}
                      className="text-xs text-[#879397] hover:text-[#176f63]"
                      title="修改昵称"
                    >
                      ✎
                    </button>
                  </>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#176f63]/10 text-[#176f63] font-serif font-bold">
                  {membershipTier === 'master' ? '扶桑天师 VIP' : membershipTier === 'pro' ? '寻道者 Pass' : '普通功德会员'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-[#789087] font-mono">
                <span>工牌编号：{userId}</span>
                <button
                  onClick={handleCopyId}
                  className="text-[10px] text-[#176f63] hover:underline"
                >
                  {copiedId ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLoginSim(!showLoginSim)}
              className="px-4 py-2 rounded-xl border border-[#dcd3c1] bg-[#f7f1e7] text-xs font-serif text-[#52666a] hover:bg-[#eae1d0] transition-colors"
            >
              绑定邮箱 / 登录
            </button>
          </div>
        </div>

        {/* 模拟登录/注册折叠区 (对标 lifekline.ai/profile 登录入口) */}
        {showLoginSim && (
          <div className="p-4 rounded-2xl bg-[#f7f1e7]/80 border border-[#dcd3c1] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif-sc font-bold text-[#24453f]">
                邮箱登录 / 账号绑定 (对齐 Lifekline 登录生态)
              </span>
              <button
                onClick={() => setShowLoginSim(false)}
                className="text-xs text-[#879397]"
              >
                收起
              </button>
            </div>
            <p className="text-xs text-[#789087] font-serif">
              绑定邮箱后可在不同设备间享受档案历史互通与功德余额漫游
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="请输入您的邮箱地址..."
                value={simEmail}
                onChange={(e) => setSimEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#dcd3c1] bg-white"
              />
              <button
                onClick={() => {
                  if (simEmail) {
                    alert(`✅ 验证码已发送至 ${simEmail} (当前系统采用纯前端运行，已自动为您绑定本地访客账号)`)
                    setShowLoginSim(false)
                  }
                }}
                className="btn-fusang px-4 py-2 rounded-xl text-xs font-serif-sc font-bold"
              >
                发送验证码
              </button>
            </div>
          </div>
        )}

        {/* 统计指标 */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-[#52666a] font-serif">
          <div className="p-3 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/70">
            <span className="block text-[#879397] text-[11px]">收录命盘档案</span>
            <strong className="text-lg font-mono text-[#176f63] font-bold">{profiles.length}</strong> 份
          </div>
          <div className="p-3 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/70">
            <span className="block text-[#879397] text-[11px]">测算历史足迹</span>
            <strong className="text-lg font-mono text-[#176f63] font-bold">{history.length}</strong> 条
          </div>
          <div className="p-3 rounded-2xl bg-[#f7f1e7]/60 border border-[#dcd3c1]/70">
            <span className="block text-[#879397] text-[11px]">累积功德福慧</span>
            <strong className="text-lg font-mono text-[#c58a28] font-bold">{gongde}</strong> 点
          </div>
        </div>
      </div>

      {/* 数据安全与备份中心 */}
      <div className="bg-white/95 backdrop-blur-md border border-[#dcd3c1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#dcd3c1]/70">
          <span className="fusang-seal text-xs">数据主权</span>
          <h3 className="font-serif-sc font-bold text-base text-[#1e2f34]">
            纯前端隐私沙盒与数据导入导出
          </h3>
        </div>

        <p className="text-xs text-[#52666a] font-serif leading-relaxed">
          扶桑 · 人生K线 秉持严苛的隐私保护标准：您的生辰八字、API Key 以及档案库完全加密存储于您本地浏览器的 LocalStorage 中，绝不上报或转存至任何中心化数据库。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl border border-[#176f63]/30 bg-[#176f63]/5 hover:bg-[#176f63]/10 text-left transition-colors flex items-center justify-between group"
          >
            <div>
              <p className="font-serif-sc font-bold text-xs text-[#176f63]">
                💾 导出全盘数据 (JSON 备份)
              </p>
              <p className="text-[10px] text-[#789087] mt-1 font-serif">
                包含全部档案、历史测算记录及功德账簿
              </p>
            </div>
            <span className="text-[#176f63] text-sm group-hover:translate-x-0.5 transition-transform">
              ↓
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl border border-[#c58a28]/30 bg-[#c58a28]/5 hover:bg-[#c58a28]/10 text-left transition-colors flex items-center justify-between group"
          >
            <div>
              <p className="font-serif-sc font-bold text-xs text-[#8A5B21]">
                📂 导入并恢复备份文件
              </p>
              <p className="text-[10px] text-[#789087] mt-1 font-serif">
                从已有 JSON 备份文件恢复档案资料
              </p>
            </div>
            <span className="text-[#8A5B21] text-sm group-hover:translate-x-0.5 transition-transform">
              ↑
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
