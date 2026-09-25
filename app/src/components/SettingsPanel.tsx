/* ============================================================
   玄机 · 系统偏好与设置中心 (SettingsPanel)
   - 官方统一智能大模型通道已就绪，无需普通用户手动配置 API Key
   - 提供 AI 命理文风偏好（玄学典雅 / 通俗生动 / 现代心理学）
   - 深度思考慢逻辑开关、声音与动效偏好
   - 折叠收纳“开发者 / 站长私有化接口通道”
   ============================================================ */

import { useState } from 'react'
import { useSettingsStore, type AITone } from '@/stores'

interface SettingsPanelProps {
  onClose?: () => void
}

const TONE_OPTIONS: Array<{ value: AITone; label: string; desc: string; icon: string }> = [
  {
    value: 'classical',
    label: '玄学典雅 · 古赋今析',
    desc: '文白相济，融汇古籍经典辞赋与现代命理洞察，意境深邃',
    icon: '📜',
  },
  {
    value: 'modern',
    label: '通俗生动 · 直截了当',
    desc: '白话通俗晓畅，少堆砌八股玄学术语，直击现实职场与生活痛点',
    icon: '💡',
  },
  {
    value: 'psychological',
    label: '现代心理 · 认知全息',
    desc: '深度融合 MBTI 认知功能与心理学投射，聚焦潜意识动机与破局成长',
    icon: '🧠',
  },
]

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    aiTone,
    setAITone,
    enableThinking,
    setEnableThinking,
    soundEnabled,
    setSoundEnabled,
    enableWebSearch,
    setEnableWebSearch,
    serverEndpoint,
    serverApiKey,
    serverModel,
    setServerConfig,
  } = useSettingsStore()

  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false)
  const [localEndpoint, setLocalEndpoint] = useState(serverEndpoint)
  const [localApiKey, setLocalApiKey] = useState(serverApiKey)
  const [localModel, setLocalModel] = useState(serverModel)
  const [devSaved, setDevSaved] = useState(false)

  const handleSaveDevConfig = () => {
    setServerConfig({
      endpoint: localEndpoint.trim(),
      apiKey: localApiKey.trim(),
      model: localModel.trim(),
    })
    setDevSaved(true)
    setTimeout(() => setDevSaved(false), 2000)
  }

  return (
    <div className="w-full max-w-lg bg-[#fffdf9] border border-[#dcd3c1] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1e2f34] space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
      {/* 标题栏 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dcd3c1]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#176f63] text-white flex items-center justify-center text-sm font-bold font-serif-sc">
            玄
          </div>
          <div>
            <h3 className="font-serif-sc font-bold text-base text-[#1e2f34] leading-tight">
              系统与偏好设置
            </h3>
            <p className="text-[10px] text-[#789087] font-serif">
              XuanJi Preferences & AI Model Controls
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4eddf] text-[#52666a] flex items-center justify-center text-xs hover:bg-[#e4dbca] transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 官方算力专线卡片 */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#176f63]/10 via-[#176f63]/5 to-[#c58a28]/10 border border-[#176f63]/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#176f63] text-white flex items-center justify-center text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-sc font-bold text-xs text-[#176f63]">
                玄机官方 AI 专线
              </span>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                已连通
              </span>
            </div>
            <p className="text-[11px] text-[#55736b] font-serif mt-0.5">
              全网大模型算力已由后台统一托管调度，开箱即用，无需您自配 API Key
            </p>
          </div>
        </div>
      </div>

      {/* 1. AI 运势推演文风选择 */}
      <div className="space-y-2.5">
        <label className="text-xs font-serif-sc font-bold text-[#52666a] flex items-center gap-1.5">
          <span>AI 运势文风偏好</span>
          <span className="text-[10px] font-normal text-[#789087]">(影响详批与分身对白语气)</span>
        </label>
        <div className="space-y-2">
          {TONE_OPTIONS.map((opt) => {
            const isSelected = aiTone === opt.value
            return (
              <div
                key={opt.value}
                onClick={() => setAITone(opt.value)}
                className={`
                  p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3
                  ${isSelected
                    ? 'border-[#176f63] bg-[#176f63]/5 shadow-2xs'
                    : 'border-[#dcd3c1] bg-white hover:border-[#176f63]/40'}
                `}
              >
                <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-sc font-bold text-xs text-[#1e2f34]">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-[#176f63] font-bold">✓</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#789087] font-serif mt-0.5 leading-snug">
                    {opt.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. 推演机制与声音偏好 */}
      <div className="space-y-2.5">
        <label className="text-xs font-serif-sc font-bold text-[#52666a]">
          交互体验与声音
        </label>
        <div className="space-y-2">
          {/* 慢逻辑思考模式 */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#dcd3c1] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-serif-sc font-bold text-[#1e2f34]">深度推理与慢思考 (R1 Reasoning)</span>
              <p className="text-[11px] text-[#789087] font-serif">
                开启后，AI 推演将针对星曜吉凶生克进行多层思维链推演，分析更加透彻
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableThinking}
                onChange={(e) => setEnableThinking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#176f63]" />
            </label>
          </div>

          {/* 禅意木鱼音效 */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#dcd3c1] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-serif-sc font-bold text-[#1e2f34]">禅意木鱼声效</span>
              <p className="text-[11px] text-[#789087] font-serif">
                敲击木鱼积攒功德与操作时的物理音效反馈
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#176f63]" />
            </label>
          </div>

          {/* 联网检索增强 */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#dcd3c1] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-serif-sc font-bold text-[#1e2f34]">联网检索增强</span>
              <p className="text-[11px] text-[#789087] font-serif">
                遇到生僻格局或历史典故时，自动联网丰富星盘解读
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableWebSearch}
                onChange={(e) => setEnableWebSearch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#176f63]" />
            </label>
          </div>
        </div>
      </div>

      {/* 3. 开发者 / 站长私有化接口通道 (折叠区) */}
      <div className="pt-2 border-t border-[#dcd3c1]/70">
        <button
          onClick={() => setShowDeveloperOptions(!showDeveloperOptions)}
          className="flex items-center justify-between w-full text-xs text-[#789087] hover:text-[#176f63] font-serif py-1 transition-colors"
        >
          <span>🛠️ 开发者 / 站长私有化中转通道 (可选)</span>
          <span className="text-[10px]">{showDeveloperOptions ? '收起 ▲' : '展开 ▼'}</span>
        </button>

        {showDeveloperOptions && (
          <div className="mt-3 p-4 rounded-2xl bg-[#faf6ee] border border-[#dcd3c1] space-y-3 animate-fade-in text-xs">
            <p className="text-[11px] text-[#8A5B21] font-serif">
              仅供站长或私有部署接入专属商业大模型代理使用。留空则自动走官方统一通道。
            </p>

            <div className="space-y-1">
              <label className="text-[#52666a] font-serif">后端中转 Base URL</label>
              <input
                type="text"
                placeholder="例如: https://api.yourdomain.com/v1"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#dcd3c1] bg-white text-xs text-[#1e2f34] outline-none focus:border-[#176f63]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#52666a] font-serif">私有 API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#dcd3c1] bg-white text-xs text-[#1e2f34] outline-none focus:border-[#176f63]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#52666a] font-serif">指定大模型 (Model ID)</label>
              <input
                type="text"
                placeholder="例如: deepseek-chat 或 gemini-2.5-flash"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#dcd3c1] bg-white text-xs text-[#1e2f34] outline-none focus:border-[#176f63]"
              />
            </div>

            <button
              onClick={handleSaveDevConfig}
              className="px-4 py-1.5 rounded-xl bg-[#176f63] text-white text-xs font-serif font-bold shadow-2xs hover:bg-[#1d8274] transition-colors"
            >
              {devSaved ? '✓ 已保存私有配置' : '保存私有化配置'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
