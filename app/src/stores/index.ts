/* ============================================================
   全局状态管理
   ============================================================ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FunctionalAstrolabe } from '@/lib/astro'
import type { BirthInfo } from '@/lib/astro'
import type { LifetimeKLinePoint } from '@/lib/fortune-score'
import type { ModelProvider } from '@/lib/llm'

/* ------------------------------------------------------------
   命盘状态
   ------------------------------------------------------------ */

interface ChartState {
  birthInfo: BirthInfo | null
  chart: FunctionalAstrolabe | null
  setBirthInfo: (info: BirthInfo) => void
  setChart: (chart: FunctionalAstrolabe) => void
  clear: () => void
}

export const useChartStore = create<ChartState>()((set) => ({
  birthInfo: null,
  chart: null,
  setBirthInfo: (info) => set({ birthInfo: info }),
  setChart: (chart) => set({ chart }),
  clear: () => {
    set({ birthInfo: null, chart: null })
    // 同时清除内容缓存
    useContentCacheStore.getState().clearAll()
  },
}))

/* ------------------------------------------------------------
   内容缓存状态 (AI解读、K线等)
   ------------------------------------------------------------ */

interface KLineCache {
  lifetime: LifetimeKLinePoint[]  // 1-100 岁完整数据
  isGenerating: boolean           // 是否正在生成 reason
}

interface ContentCacheState {
  // AI 命盘解读
  aiInterpretation: string | null
  setAiInterpretation: (content: string) => void

  // 年度运势解读 (按年份缓存)
  yearlyFortune: Record<number, string>
  setYearlyFortune: (year: number, content: string) => void

  // K 线数据
  klineCache: KLineCache | null
  setKlineCache: (cache: KLineCache) => void
  updateKlineReasons: (reasons: { age: number; reason: string }[]) => void
  setKlineGenerating: (isGenerating: boolean) => void

  // 清除所有缓存
  clearAll: () => void
}

export const useContentCacheStore = create<ContentCacheState>()((set) => ({
  aiInterpretation: null,
  yearlyFortune: {},
  klineCache: null,

  setAiInterpretation: (content) => set({ aiInterpretation: content }),

  setYearlyFortune: (year, content) => set((state) => ({
    yearlyFortune: { ...state.yearlyFortune, [year]: content },
  })),

  setKlineCache: (cache) => set({ klineCache: cache }),

  updateKlineReasons: (reasons) => set((state) => {
    if (!state.klineCache) return state
    const updatedLifetime = state.klineCache.lifetime.map(point => {
      const found = reasons.find(r => r.age === point.age)
      return found ? { ...point, reason: found.reason } : point
    })
    return {
      klineCache: {
        ...state.klineCache,
        lifetime: updatedLifetime,
        isGenerating: false,
      },
    }
  }),

  setKlineGenerating: (isGenerating) => set((state) => {
    if (!state.klineCache) return state
    return {
      klineCache: { ...state.klineCache, isGenerating },
    }
  }),

  clearAll: () => set({
    aiInterpretation: null,
    yearlyFortune: {},
    klineCache: null,
  }),
}))

/* ------------------------------------------------------------
   设置状态
   ------------------------------------------------------------ */

export interface ProviderSettings {
  apiKey: string
  customBaseUrl: string
  customModel: string
}

export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
  apiKey: '',
  customBaseUrl: '',
  customModel: '',
}

export type AITone = 'classical' | 'modern' | 'psychological'

interface SettingsState {
  provider: ModelProvider
  providerSettings: Record<ModelProvider, ProviderSettings>
  enableThinking: boolean
  enableWebSearch: boolean   // 启用联网搜索
  searchApiKey: string       // 第三方搜索 API (Tavily)

  // 玄机平台官方统一通道与用户偏好
  aiTone: AITone
  soundEnabled: boolean
  serverEndpoint: string
  serverApiKey: string
  serverModel: string

  setAITone: (tone: AITone) => void
  setSoundEnabled: (enabled: boolean) => void
  setServerConfig: (config: { endpoint?: string; apiKey?: string; model?: string }) => void

  setProvider: (provider: ModelProvider) => void
  updateCurrentProvider: (settings: Partial<ProviderSettings>) => void
  setEnableThinking: (enable: boolean) => void
  setEnableWebSearch: (enable: boolean) => void
  setSearchApiKey: (key: string) => void

  // 便捷访问当前配置（自动兜底官方智能通道，免去用户手动配置门槛）
  getCurrentSettings: () => ProviderSettings
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      provider: 'deepseek',
      providerSettings: {
        deepseek: { ...DEFAULT_PROVIDER_SETTINGS },
        claude: { ...DEFAULT_PROVIDER_SETTINGS },
        gemini: { ...DEFAULT_PROVIDER_SETTINGS },
        kimi: { ...DEFAULT_PROVIDER_SETTINGS },
        openai: { ...DEFAULT_PROVIDER_SETTINGS },
        custom: { ...DEFAULT_PROVIDER_SETTINGS },
      },
      enableThinking: false,
      enableWebSearch: false,
      searchApiKey: '',

      aiTone: 'classical',
      soundEnabled: true,
      serverEndpoint: '',
      serverApiKey: '',
      serverModel: '',

      setAITone: (aiTone) => set({ aiTone }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setServerConfig: (config) => set((state) => ({
        serverEndpoint: config.endpoint !== undefined ? config.endpoint : state.serverEndpoint,
        serverApiKey: config.apiKey !== undefined ? config.apiKey : state.serverApiKey,
        serverModel: config.model !== undefined ? config.model : state.serverModel,
      })),

      setProvider: (provider) => set({ provider }),

      updateCurrentProvider: (settings) => set((state) => {
        const current = state.providerSettings[state.provider] || { ...DEFAULT_PROVIDER_SETTINGS }
        return {
          providerSettings: {
            ...state.providerSettings,
            [state.provider]: {
              ...current,
              ...settings,
            },
          },
        }
      }),

      setEnableThinking: (enable) => set({ enableThinking: enable }),
      setEnableWebSearch: (enable) => set({ enableWebSearch: enable }),
      setSearchApiKey: (key) => set({ searchApiKey: key }),

      getCurrentSettings: () => {
        const state = get()
        const custom = state.providerSettings[state.provider] || { ...DEFAULT_PROVIDER_SETTINGS }
        const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_API_KEY) || ''
        const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_API_URL) || ''
        const envModel = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_MODEL) || ''

        const effectiveKey =
          state.serverApiKey ||
          custom.apiKey ||
          envKey ||
          'xuanji-official-cloud-channel'

        const effectiveBaseUrl =
          state.serverEndpoint ||
          custom.customBaseUrl ||
          envUrl ||
          ''

        const effectiveModel =
          state.serverModel ||
          custom.customModel ||
          envModel ||
          ''

        return {
          apiKey: effectiveKey,
          customBaseUrl: effectiveBaseUrl,
          customModel: effectiveModel,
        }
      },
    }),
    {
      name: 'ziwei-settings',
      version: 2,
      migrate: (persistedState: any) => {
        const defaultSettings = {
          deepseek: { ...DEFAULT_PROVIDER_SETTINGS },
          claude: { ...DEFAULT_PROVIDER_SETTINGS },
          gemini: { ...DEFAULT_PROVIDER_SETTINGS },
          kimi: { ...DEFAULT_PROVIDER_SETTINGS },
          openai: { ...DEFAULT_PROVIDER_SETTINGS },
          custom: { ...DEFAULT_PROVIDER_SETTINGS },
        }
        if (!persistedState) return persistedState
        return {
          ...persistedState,
          providerSettings: {
            ...defaultSettings,
            ...(persistedState.providerSettings || {}),
          },
        }
      },
    }
  )
)

export * from './profile'
