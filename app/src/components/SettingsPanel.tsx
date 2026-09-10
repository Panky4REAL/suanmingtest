/* ============================================================
   设置面板组件
   配置 API Key、模型选择等
   ============================================================ */

import { useState } from 'react'
import { useSettingsStore } from '@/stores'
import { Button, Input, Select } from '@/components/ui'
import type { ModelProvider } from '@/lib/llm'
import { PROVIDER_CONFIGS, RECOMMENDED_MODELS, getEffectiveModel, discoverGeminiModels } from '@/lib/llm'

/* ------------------------------------------------------------
   厂商选项
   ------------------------------------------------------------ */

const PROVIDER_OPTIONS: Array<{ value: ModelProvider; label: string }> = [
  { value: 'gemini', label: 'Gemini (Google 3.8 Flash / 3.0 Pro - 推荐)' },
  { value: 'deepseek', label: 'DeepSeek (V4.1 Flash / R1 推理)' },
  { value: 'claude', label: 'Claude (Anthropic Claude 5 / Sonnet 5)' },
  { value: 'kimi', label: 'Kimi (月之暗面 K3 / 100万长文本)' },
  { value: 'openai', label: 'OpenAI (GPT-6 Astra / o4-mini)' },
  { value: 'custom', label: '自定义 (OpenAI 兼容中转)' },
]

const API_DOCS: Record<ModelProvider, string> = {
  deepseek: 'https://platform.deepseek.com',
  claude: 'https://console.anthropic.com',
  gemini: 'https://aistudio.google.com/apikey',
  kimi: 'https://platform.moonshot.cn',
  openai: 'https://platform.openai.com/api-keys',
  custom: '',
}

/* ------------------------------------------------------------
   设置面板
   ------------------------------------------------------------ */

interface SettingsPanelProps {
  onClose?: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    provider,
    providerSettings,
    enableThinking,
    enableWebSearch,
    searchApiKey,
    setProvider,
    updateCurrentProvider,
    setEnableThinking,
    setEnableWebSearch,
    setSearchApiKey,
  } = useSettingsStore()

  // 当前厂商的配置（带安全回退）
  const currentSettings = providerSettings[provider] || { apiKey: '', customBaseUrl: '', customModel: '' }

  const [localApiKey, setLocalApiKey] = useState(currentSettings.apiKey || '')
  const [localBaseUrl, setLocalBaseUrl] = useState(currentSettings.customBaseUrl || '')
  const [localModel, setLocalModel] = useState(currentSettings.customModel || '')
  const [localSearchApiKey, setLocalSearchApiKey] = useState(searchApiKey || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pendingProvider, setPendingProvider] = useState<ModelProvider | null>(null)
  const [discovering, setDiscovering] = useState(false)
  const [discoveredModels, setDiscoveredModels] = useState<string[] | null>(null)
  const [discoverMessage, setDiscoverMessage] = useState<string | null>(null)

  const handleAutoDiscover = async () => {
    if (!localApiKey.trim()) {
      setDiscoverMessage('请先在上方输入您的 Gemini API Key')
      return
    }
    setDiscovering(true)
    setDiscoverMessage('正在向 Google 查询您账号真实支持的可用模型列表...')
    try {
      const res = await discoverGeminiModels(localApiKey, localBaseUrl)
      if (res && res.models.length > 0) {
        setDiscoveredModels(res.models)
        setLocalModel(res.models[0])
        setDiscoverMessage(`✓ 成功检测到 ${res.models.length} 个可用模型，已自动选定 "${res.models[0]}"`)
      } else {
        setDiscoverMessage('未检测到可用模型，请检查 API Key 是否正确或网络是否可达')
      }
    } catch (e: any) {
      setDiscoverMessage(`检测失败: ${e.message || '网络或凭证异常'}`)
    } finally {
      setDiscovering(false)
    }
  }

  // 检查是否有未保存的修改
  const hasUnsavedChanges =
    localApiKey !== (currentSettings.apiKey || '') ||
    localBaseUrl !== (currentSettings.customBaseUrl || '') ||
    localModel !== (currentSettings.customModel || '') ||
    localSearchApiKey !== (searchApiKey || '')

  // 切换厂商时，检查是否有未保存修改
  const handleProviderChange = (newProvider: ModelProvider) => {
    if (newProvider === provider) return

    if (hasUnsavedChanges) {
      setPendingProvider(newProvider)
    } else {
      switchToProvider(newProvider)
    }
  }

  // 实际切换厂商
  const switchToProvider = (newProvider: ModelProvider) => {
    setProvider(newProvider)
    const newSettings = providerSettings[newProvider] || { apiKey: '', customBaseUrl: '', customModel: '' }
    setLocalApiKey(newSettings.apiKey || '')
    setLocalBaseUrl(newSettings.customBaseUrl || '')
    setLocalModel(newSettings.customModel || '')
    setPendingProvider(null)
  }

  // 保存并切换
  const handleSaveAndSwitch = () => {
    updateCurrentProvider({
      apiKey: localApiKey,
      customBaseUrl: localBaseUrl,
      customModel: localModel,
    })
    setSearchApiKey(localSearchApiKey)
    if (pendingProvider) {
      switchToProvider(pendingProvider)
    }
  }

  // 放弃修改并切换
  const handleDiscardAndSwitch = () => {
    if (pendingProvider) {
      switchToProvider(pendingProvider)
    }
  }

  // 当前厂商的默认配置
  const defaultConfig = PROVIDER_CONFIGS[provider]
  const docUrl = API_DOCS[provider]

  const handleSave = () => {
    updateCurrentProvider({
      apiKey: localApiKey,
      customBaseUrl: localBaseUrl,
      customModel: localModel,
    })
    setSearchApiKey(localSearchApiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // 判断是否有自定义值（用于高亮显示）
  const hasCustomBaseUrl = localBaseUrl.trim() !== ''
  const hasCustomModel = localModel.trim() !== ''

  return (
    <div className="glass p-6 w-full max-w-md relative">
      {/* 未保存修改确认对话框 */}
      {pendingProvider && (
        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10 p-4">
          <div className="bg-surface p-5 rounded-xl max-w-sm w-full space-y-4">
            <p className="text-text-secondary text-sm">
              当前配置有未保存的修改，切换厂商将丢失这些修改。
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDiscardAndSwitch}
                className="flex-1 !bg-white/10 hover:!bg-white/20"
              >
                放弃修改
              </Button>
              <Button onClick={handleSaveAndSwitch} className="flex-1">
                保存并切换
              </Button>
            </div>
            <button
              onClick={() => setPendingProvider(null)}
              className="w-full text-sm text-text-muted hover:text-text transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">设置</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 横幅提示 */}
      <div className="mb-4 p-3 rounded-lg bg-star/10 border border-star/20 text-sm text-text-secondary">
        <span className="text-star">ⓘ</span> 使用中转 API？展开下方「高级设置」修改 URL 和模型
      </div>

      <div className="space-y-4">
        {/* 厂商选择 */}
        <Select
          label="AI 厂商"
          options={PROVIDER_OPTIONS}
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
        />

        {/* API Key */}
        <Input
          label="API Key"
          type="password"
          placeholder="输入你的 API Key"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
        />

        {/* API 文档链接 */}
        {docUrl && (
          <p className="text-xs text-text-muted">
            获取 API Key:{' '}
            <a href={docUrl} target="_blank" rel="noopener" className="text-star hover:underline">
              {docUrl.replace('https://', '')}
            </a>
          </p>
        )}

        {/* 高级设置折叠区 */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors w-full"
          >
            <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            高级设置
            {(hasCustomBaseUrl || hasCustomModel) && (
              <span className="text-xs text-amber px-1.5 py-0.5 rounded bg-amber/10">已修改</span>
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* BaseURL */}
              <div>
                <label className="block text-xs font-serif-sc text-[#52666a] mb-1">
                  BaseURL
                  {hasCustomBaseUrl && <span className="text-[#c58a28] ml-2 text-[10px]">已覆盖</span>}
                </label>
                <input
                  type="text"
                  placeholder={defaultConfig.baseUrl}
                  value={localBaseUrl}
                  onChange={(e) => setLocalBaseUrl(e.target.value)}
                  className={`
                    w-full px-3 py-2 rounded-xl text-xs
                    bg-white/80 border transition-colors
                    placeholder:text-[#879397]
                    focus:outline-none focus:ring-1
                    ${hasCustomBaseUrl
                      ? 'border-[#c58a28] focus:border-[#c58a28] text-[#1e2f34]'
                      : 'border-[#dcd3c1] focus:border-[#176f63] text-[#1e2f34]'
                    }
                  `}
                />
                <p className="text-[10px] text-[#879397] mt-0.5">
                  默认: {defaultConfig.baseUrl}
                </p>
              </div>

              {/* Effective Model Indicator */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#176f63]/5 border border-[#176f63]/20 text-xs">
                <span className="text-[#52666a]">当前生效模型：</span>
                <span className="font-mono font-semibold text-[#176f63] bg-white/90 px-2 py-0.5 rounded border border-[#176f63]/20">
                  {getEffectiveModel(provider, localModel, enableThinking)}
                </span>
              </div>

              {/* Model */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-serif-sc text-[#52666a]">
                    Model
                    {hasCustomModel && <span className="text-[#c58a28] ml-2 text-[10px]">已自定义</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    {provider === 'gemini' && (
                      <button
                        type="button"
                        disabled={discovering}
                        onClick={handleAutoDiscover}
                        className="text-[10px] text-[#176f63] font-semibold hover:underline flex items-center gap-1 bg-[#176f63]/10 hover:bg-[#176f63]/20 px-2 py-0.5 rounded transition-colors"
                      >
                        {discovering ? '⏳ 正在检测...' : '🔍 自动检测可用模型'}
                      </button>
                    )}
                    {hasCustomModel && (
                      <button
                        type="button"
                        onClick={() => setLocalModel('')}
                        className="text-[10px] text-[#52666a] hover:underline"
                      >
                        恢复默认
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={defaultConfig.defaultModel}
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  className={`
                    w-full px-3 py-2 rounded-xl text-xs
                    bg-white/80 border transition-colors
                    placeholder:text-[#879397]
                    focus:outline-none focus:ring-1
                    ${hasCustomModel
                      ? 'border-[#c58a28] focus:border-[#c58a28] text-[#1e2f34]'
                      : 'border-[#dcd3c1] focus:border-[#176f63] text-[#1e2f34]'
                    }
                  `}
                />

                {discoverMessage && (
                  <p className="text-[11px] p-2 rounded-lg bg-[#176f63]/10 text-[#176f63] mt-2 border border-[#176f63]/20">
                    {discoverMessage}
                  </p>
                )}

                {/* 动态探测到的可用模型 */}
                {discoveredModels && discoveredModels.length > 0 && (
                  <div className="mt-2 space-y-1 bg-[#176f63]/5 p-2 rounded-xl border border-[#176f63]/20">
                    <span className="text-[10px] text-[#176f63] font-bold block">
                      ✓ 您账号实测可用模型（点击一键选用）：
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {discoveredModels.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setLocalModel(m)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-md border transition-all ${
                            localModel.trim() === m
                              ? 'bg-[#176f63] text-white border-[#176f63] font-semibold'
                              : 'bg-white/90 border-[#176f63]/30 text-[#176f63] hover:bg-[#176f63]/15'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 推荐模型一键选取 */}
                {RECOMMENDED_MODELS[provider]?.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <span className="text-[10px] text-[#879397] block">
                      最新官方推荐模型（点击一键选用）：
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {RECOMMENDED_MODELS[provider].map((item) => {
                        const isCurrent =
                          (localModel.trim() === item.id) ||
                          (!localModel.trim() && item.id === defaultConfig.defaultModel)
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setLocalModel(item.id)}
                            className={`
                              text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left flex items-center gap-1.5
                              ${isCurrent
                                ? 'bg-[#176f63] text-white border-[#176f63] shadow-sm font-medium'
                                : 'bg-white/80 hover:bg-[#176f63]/10 border-[#dcd3c1] text-[#1e2f34]'
                              }
                            `}
                            title={item.description}
                          >
                            <span>{item.name}</span>
                            {item.tag && (
                              <span
                                className={`text-[9px] px-1 py-0.5 rounded leading-none ${
                                  isCurrent ? 'bg-white/20 text-white' : 'bg-[#c58a28]/15 text-[#c58a28]'
                                }`}
                              >
                                {item.tag}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-[#879397] mt-1.5">
                  默认: {defaultConfig.defaultModel}
                </p>
              </div>

              {/* 思考模式开关 */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`
                    w-10 h-6 rounded-full relative transition-colors
                    ${enableThinking ? 'bg-star' : 'bg-white/10'}
                  `}
                  onClick={() => setEnableThinking(!enableThinking)}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${enableThinking ? 'left-5' : 'left-1'}
                    `}
                  />
                </div>
                <div>
                  <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                    启用深度思考
                  </span>
                  <p className="text-xs text-text-muted">
                    需模型支持 (Claude/DeepSeek/Gemini 等)
                  </p>
                </div>
              </label>

              {/* 联网搜索开关 */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`
                    w-10 h-6 rounded-full relative transition-colors
                    ${enableWebSearch ? 'bg-star' : 'bg-white/10'}
                  `}
                  onClick={() => setEnableWebSearch(!enableWebSearch)}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${enableWebSearch ? 'left-5' : 'left-1'}
                    `}
                  />
                </div>
                <div>
                  <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                    启用联网搜索
                  </span>
                  <p className="text-xs text-text-muted">
                    {provider === 'kimi' || provider === 'gemini'
                      ? '使用原生搜索能力'
                      : '需配置 Tavily API'}
                  </p>
                </div>
              </label>

              {/* Tavily API Key (非 Kimi/Gemini 显示) */}
              {enableWebSearch && provider !== 'kimi' && provider !== 'gemini' && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    Tavily API Key
                    {localSearchApiKey.trim() && <span className="text-amber ml-2 text-xs">已配置</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="输入 Tavily API Key"
                    value={localSearchApiKey}
                    onChange={(e) => setLocalSearchApiKey(e.target.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg text-sm
                      bg-white/5 border transition-colors
                      placeholder:text-text-muted/50
                      focus:outline-none focus:ring-1
                      ${localSearchApiKey.trim()
                        ? 'border-amber/50 focus:border-amber focus:ring-amber/30 text-text'
                        : 'border-white/10 focus:border-star focus:ring-star/30 text-text-secondary'
                      }
                    `}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    获取 API Key:{' '}
                    <a
                      href="https://tavily.com"
                      target="_blank"
                      rel="noopener"
                      className="text-star hover:underline"
                    >
                      tavily.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        <Button onClick={handleSave} className="w-full" disabled={!hasUnsavedChanges && !saved}>
          {saved ? '✓ 已保存' : hasUnsavedChanges ? '保存设置 *' : '保存设置'}
        </Button>

        {/* 隐私提示 */}
        <p className="text-xs text-text-muted text-center">
          API Key 仅保存在你的浏览器本地，不会上传到任何服务器。
        </p>
      </div>
    </div>
  )
}
