/* ============================================================
   多模型适配层
   支持 Kimi / Gemini / Claude / DeepSeek / 自定义 OpenAI 兼容
   ============================================================ */

export type ModelProvider = 'kimi' | 'gemini' | 'claude' | 'deepseek' | 'openai' | 'custom'

export interface LLMConfig {
  provider: ModelProvider
  apiKey: string
  baseUrl?: string
  model?: string
  enableThinking?: boolean
  enableWebSearch?: boolean
  searchApiKey?: string  // Tavily API Key
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

/* ------------------------------------------------------------
   Provider 配置与推荐模型（导出供设置面板使用）
   ------------------------------------------------------------ */

export interface ModelOption {
  id: string
  name: string
  tag?: string
  description: string
}

export const PROVIDER_CONFIGS: Record<ModelProvider, { baseUrl: string; defaultModel: string; label: string }> = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    label: 'Gemini (Google)',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-flash',
    label: 'DeepSeek (深度求索)',
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-5',
    label: 'Claude (Anthropic)',
  },
  kimi: {
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'kimi-k3',
    label: 'Kimi (月之暗面)',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-6-astra',
    label: 'OpenAI',
  },
  custom: {
    baseUrl: '',
    defaultModel: '',
    label: '自定义 (OpenAI 兼容)',
  },
}

export const RECOMMENDED_MODELS: Record<ModelProvider, ModelOption[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: '推荐·稳定通用', description: 'Google AI Studio 主力极速思考模型，全面开放，无 404 权限障碍' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: '经典稳定', description: '最稳定普及度极高的多模态模型' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: '2026前沿·自动降级', description: 'Google 2026年9月最新前沿模型（需白名单权限，未开放时系统自动平滑降级）' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', tag: '深度推理', description: 'Google 3.x 深度推理旗舰' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: '高智力旗舰', description: '高智商复杂星盘推演旗舰' },
  ],
  deepseek: [
    { id: 'deepseek-flash', name: 'DeepSeek-V4.1-Flash', tag: '最新旗舰·2026-09', description: '2026年9月最新 V4.1 架构，超高吞吐，原生多模态理解与古籍命理分析' },
    { id: 'deepseek-chat', name: 'DeepSeek-Chat', tag: '通用接口', description: '官方标准对话模型（自动路由最新生成能力，紫微文笔出众）' },
    { id: 'deepseek-reasoner', name: 'DeepSeek-R1', tag: '深度推理', description: '强逻辑慢思考推理模型，层层剖析吉凶互制与化忌暗礁' },
  ],
  claude: [
    { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', tag: '最新主力·2026', description: 'Anthropic 2026 主力大模型，文辞雅致、格局洞察深邃，支持自适应思考' },
    { id: 'claude-opus-5', name: 'Claude Opus 5', tag: '重型旗舰', description: 'Anthropic 重型最强推理大模型，针对复杂大运流年深度推演' },
    { id: 'claude-fable-5-1', name: 'Claude Fable 5.1', tag: '前沿研究·2026-09', description: '2026年9月1日最新前沿超强推理模型' },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', tag: '经典版', description: '经典混合推理模型' },
  ],
  kimi: [
    { id: 'kimi-k3', name: 'Kimi K3', tag: '最新旗舰·2026-07', description: '月之暗面 2.8T 原生多模态旗舰模型，100万超长上下文' },
    { id: 'kimi-k2.7', name: 'Kimi K2.7', tag: '专项模型', description: '专项代码与逻辑能力优化' },
    { id: 'moonshot-v1-auto', name: 'Moonshot v1 Auto', tag: '历史兼容', description: '经典长文本模型' },
  ],
  openai: [
    { id: 'gpt-6-astra', name: 'GPT-6 Astra', tag: '最新旗舰·2026-09', description: 'OpenAI 2026年9月最新代际跃升旗舰模型' },
    { id: 'o4-mini', name: 'o4-mini', tag: '最新推理', description: '2026 最新轻量深度逻辑慢思考推理模型' },
    { id: 'gpt-5.5', name: 'GPT-5.5', tag: '全能主力', description: '高效稳健的通用大模型' },
    { id: 'gpt-4o', name: 'GPT-4o', tag: '经典版', description: '经典全能多模态模型' },
  ],
  custom: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Google 2.5', description: '稳定可用的 Google 2.5 Flash' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Google 3.8', description: '谷歌最新 3.8 Flash' },
    { id: 'deepseek-flash', name: 'DeepSeek-V4.1-Flash', tag: 'DeepSeek V4.1', description: '最新 DeepSeek V4.1 Flash' },
    { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', tag: 'Claude 5', description: 'Anthropic 最新 Sonnet 5' },
    { id: 'gpt-6-astra', name: 'GPT-6 Astra', tag: 'GPT-6', description: 'OpenAI 最新旗舰' },
  ],
}

// 自动将旧版/历史失效模型标识符平滑纠正为最新官方标准模型
export const OUTDATED_MODEL_MAPPINGS: Record<string, string> = {
  'kimi-k2-0905-preview': 'kimi-k3',
  'kimi-k2-thinking': 'kimi-k3',
  'claude-opus-4-5-20251124': 'claude-opus-5',
  'gemini-3.0-flash': 'gemini-2.5-flash',
  'deepseek-v3.2-speciale': 'deepseek-reasoner',
}

export function getEffectiveModel(
  provider: ModelProvider,
  model?: string,
  enableThinking?: boolean
): string {
  let chosen = model?.trim() || PROVIDER_CONFIGS[provider]?.defaultModel || 'gemini-2.5-flash'
  if (OUTDATED_MODEL_MAPPINGS[chosen]) {
    chosen = OUTDATED_MODEL_MAPPINGS[chosen]
  }
  if (enableThinking && (!model || model.trim() === '')) {
    if (provider === 'gemini') return 'gemini-2.5-pro'
    if (provider === 'deepseek') return 'deepseek-reasoner'
    if (provider === 'claude') return 'claude-opus-5'
    if (provider === 'kimi') return 'kimi-k3'
    if (provider === 'openai') return 'o4-mini'
  }
  return chosen
}

export interface DiscoveredGeminiConfig {
  baseUrl: string
  models: string[]
}

/**
 * 动态向 Google API (v1beta / v1) 查询该 API Key 真实支持且可用于文本生成的模型列表
 */
export async function discoverGeminiModels(
  apiKey: string,
  baseUrl?: string
): Promise<DiscoveredGeminiConfig | null> {
  const trimmedKey = apiKey?.trim()
  if (!trimmedKey) return null

  const baseUrlsToTry = [
    baseUrl ? baseUrl.trim().replace(/\/+$/, '') : null,
    'https://generativelanguage.googleapis.com/v1beta',
    'https://generativelanguage.googleapis.com/v1',
  ].filter(Boolean) as string[]

  for (const urlBase of baseUrlsToTry) {
    try {
      const res = await fetch(`${urlBase}/models?key=${trimmedKey}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data?.models)) {
        const models = (data.models as Array<{ name?: string; supportedGenerationMethods?: string[] }>)
          .filter(m =>
            m.supportedGenerationMethods?.includes('generateContent') ||
            m.supportedGenerationMethods?.includes('streamGenerateContent')
          )
          .map(m => (m.name || '').replace(/^models\//, ''))
          .filter(Boolean)
        if (models.length > 0) {
          return { baseUrl: urlBase, models }
        }
      }
    } catch (e) {
      console.warn('[Gemini] discoverModels failed for', urlBase, e)
    }
  }

  return null
}

/* ------------------------------------------------------------
   Tavily 搜索 (用于无原生搜索的模型)
   ------------------------------------------------------------ */

interface TavilyResult {
  title: string
  url: string
  content: string
}

async function searchWithTavily(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
      }),
    })

    if (!response.ok) {
      console.warn('Tavily search failed:', response.status)
      return ''
    }

    const data = await response.json()
    const results = data.results as TavilyResult[] || []

    if (results.length === 0) return ''

    // 格式化搜索结果
    const formatted = results.map((r, i) =>
      `[${i + 1}] ${r.title}\n${r.content}\n来源: ${r.url}`
    ).join('\n\n')

    return formatted
  } catch (err) {
    console.warn('Tavily search error:', err)
    return ''
  }
}

/* ------------------------------------------------------------
   智能搜索关键词提取 (用 LLM 提取精准搜索词)
   ------------------------------------------------------------ */

const KEYWORD_EXTRACTION_PROMPT = `你是紫微斗数搜索助手。从命盘信息中提取最有价值的搜索关键词，用于联网搜索增强解读准确性。

## 要求：
1. 提取 2-3 个最关键的搜索查询
2. 每个查询应该是独立的、有针对性的紫微斗数术语组合
3. 优先关注：命宫主星组合、重要四化、特殊格局
4. 格式：每行一个查询，不要编号，不要其他说明

## 示例输出：
紫微斗数 天机太阴 命宫 性格事业
紫微斗数 武曲化忌 财帛宫 影响化解
紫微斗数 机月同梁格 特点`

async function extractSearchKeywords(
  config: LLMConfig,
  chartContext: string
): Promise<string[]> {
  const { provider, apiKey, baseUrl, model } = config
  const providerConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.deepseek
  const useModel = getEffectiveModel(provider, model)

  try {
    // 使用非流式请求提取关键词
    if (provider === 'gemini') {
      // Gemini 非流式
      const cleanBaseUrl = (baseUrl?.trim() || providerConfig.baseUrl).replace(/\/+$/, '')
      const cleanModel = useModel.trim().replace(/^models\//, '')
      const url = `${cleanBaseUrl}/models/${cleanModel}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: chartContext }] }],
          systemInstruction: { parts: [{ text: KEYWORD_EXTRACTION_PROMPT }] },
        }),
      })

      if (!response.ok) return []
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return text.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)

    } else if (provider === 'claude') {
      // Claude 非流式
      const response = await fetch(`${baseUrl || providerConfig.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: useModel,
          max_tokens: 200,
          system: KEYWORD_EXTRACTION_PROMPT,
          messages: [{ role: 'user', content: chartContext }],
        }),
      })

      if (!response.ok) return []
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      return text.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)

    } else {
      // OpenAI 兼容 (DeepSeek, Kimi, OpenAI, Custom)
      const url = `${baseUrl || providerConfig.baseUrl}/chat/completions`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: useModel,
          messages: [
            { role: 'system', content: KEYWORD_EXTRACTION_PROMPT },
            { role: 'user', content: chartContext },
          ],
          max_tokens: 200,
        }),
      })

      if (!response.ok) return []
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      return text.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    }
  } catch (err) {
    console.warn('Keyword extraction failed:', err)
    return []
  }
}

/* ------------------------------------------------------------
   智能联网搜索 (先提取关键词，再搜索)
   ------------------------------------------------------------ */

async function performSmartSearch(
  config: LLMConfig,
  messages: ChatMessage[]
): Promise<string> {
  const { searchApiKey } = config

  if (!searchApiKey) return ''

  // 从 messages 中提取命盘上下文
  const userMessage = messages.find(m => m.role === 'user')?.content || ''

  // 用 LLM 提取搜索关键词
  const keywords = await extractSearchKeywords(config, userMessage)

  if (keywords.length === 0) {
    console.warn('No keywords extracted, skipping search')
    return ''
  }

  console.log('Search keywords:', keywords)

  // 对每个关键词进行搜索
  const allResults: string[] = []

  for (const keyword of keywords.slice(0, 3)) {
    const result = await searchWithTavily(keyword, searchApiKey)
    if (result) {
      allResults.push(`【${keyword}】\n${result}`)
    }
  }

  if (allResults.length === 0) return ''

  return `\n\n---\n【联网搜索参考资料】\n以下是针对命盘关键要素的搜索结果，请结合这些资料进行更准确的解读：\n\n${allResults.join('\n\n')}\n---\n\n`
}

/* ------------------------------------------------------------
   OpenAI 兼容格式请求 (Kimi, DeepSeek, Custom)
   ------------------------------------------------------------ */

async function* streamOpenAICompatible(
  config: LLMConfig,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const { provider, apiKey, baseUrl, model, enableThinking, enableWebSearch, searchApiKey } = config
  const providerConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.deepseek

  // 确定使用的模型（使用 getEffectiveModel 处理别名与思考模式）
  const useModel = getEffectiveModel(provider, model, enableThinking)

  const url = `${baseUrl || providerConfig.baseUrl}/chat/completions`

  // 构建请求体
  const requestBody: Record<string, unknown> = {
    model: useModel,
    messages,
    stream: true,
  }

  // Kimi 原生搜索
  if (enableWebSearch && provider === 'kimi') {
    requestBody.tools = [{
      type: 'builtin_function',
      function: { name: '$web_search' },
    }]
  }

  // 非 Kimi 且有 Tavily API，使用智能搜索
  let processedMessages = messages
  if (enableWebSearch && provider !== 'kimi' && searchApiKey) {
    const searchResult = await performSmartSearch(config, messages)
    if (searchResult) {
      processedMessages = messages.map((m, i) =>
        i === 0 && m.role === 'system'
          ? { ...m, content: m.content + searchResult }
          : m
      )
    }
    requestBody.messages = processedMessages
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

/* ------------------------------------------------------------
   Gemini API 请求 (支持 Gemini 2.5 Flash/Pro 及 SSE 流)
   ------------------------------------------------------------ */

async function* streamGemini(
  config: LLMConfig,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const { apiKey, model, baseUrl, enableThinking, enableWebSearch } = config
  const providerConfig = PROVIDER_CONFIGS.gemini

  let cleanBaseUrl = (baseUrl?.trim() || providerConfig.baseUrl).replace(/\/+$/, '')

  // 如果用户配置了第三方中转地址，且包含 /v1 且不是 googleapis 官方，自动按 OpenAI 兼容格式转发
  if (baseUrl && baseUrl.trim() && !cleanBaseUrl.includes('googleapis.com') && cleanBaseUrl.includes('/v1')) {
    yield* streamOpenAICompatible({ ...config, baseUrl: cleanBaseUrl }, messages)
    return
  }

  const rawModel = getEffectiveModel('gemini', model, enableThinking)
  const cleanModel = rawModel.trim().replace(/^models\//, '')

  // 转换消息格式
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const systemMessage = messages.find(m => m.role === 'system')

  // 候选模型尝试队列
  const candidateModels: string[] = [
    cleanModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-1.5-flash',
  ].filter((m, i, arr) => arr.indexOf(m) === i)

  let response: Response | null = null
  let lastErrorDetail = ''
  let hasAttemptedDiscovery = false
  let discoveredLiveList: string[] = []

  let index = 0
  while (index < candidateModels.length) {
    const testModel = candidateModels[index]
    index++

    const url = `${cleanBaseUrl}/models/${testModel}:streamGenerateContent?alt=sse&key=${apiKey}`
    const requestBody: Record<string, unknown> = {
      contents,
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
    }

    if (enableWebSearch) {
      requestBody.tools = [{ google_search: {} }]
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        response = res
        if (testModel !== cleanModel) {
          console.warn(`[Gemini] 模型 "${cleanModel}" 404，已自动切换为支持的模型 "${testModel}"`)
        }
        break
      }

      if (res.status === 404) {
        let errJson: any = null
        try {
          errJson = await res.json()
          lastErrorDetail = errJson?.error?.message || ''
        } catch {
          lastErrorDetail = await res.text().catch(() => '')
        }
        console.warn(`[Gemini] 模型 "${testModel}" 返回 404: ${lastErrorDetail}`)

        // 首次遇到 404 时，立即向 Google ListModels 查询该 API Key 真实支持的模型与接口版本
        if (!hasAttemptedDiscovery) {
          hasAttemptedDiscovery = true
          try {
            const discovered = await discoverGeminiModels(apiKey, cleanBaseUrl)
            if (discovered && discovered.models.length > 0) {
              cleanBaseUrl = discovered.baseUrl
              discoveredLiveList = discovered.models
              console.log(`[Gemini] 通过 ListModels 发现 ${discovered.models.length} 个可用模型:`, discovered.models)
              for (const liveM of discovered.models) {
                if (!candidateModels.includes(liveM)) {
                  candidateModels.push(liveM)
                }
              }
            }
          } catch (discoverErr) {
            console.warn('[Gemini] 自动探测可用模型失败:', discoverErr)
          }
        }
        continue
      } else {
        // 非 404 错误直接抛出
        let errDetail = ''
        try {
          const json = await res.json()
          errDetail = json?.error?.message || JSON.stringify(json)
        } catch {
          errDetail = await res.text().catch(() => '')
        }
        throw new Error(`Gemini API 错误 (${res.status}): ${errDetail || res.statusText}`)
      }
    } catch (err: any) {
      if (err.message?.startsWith('Gemini API 错误')) {
        throw err
      }
      lastErrorDetail = err.message || String(err)
    }
  }

  if (!response || !response.ok) {
    const hint = discoveredLiveList.length > 0
      ? `\n您的 API Key 真实可用的模型列表为：\n${discoveredLiveList.slice(0, 8).join('\n')}`
      : '\n无法通过 ListModels 检测到支持的生成模型，请检查 API Key 是否正确或已被 Google 停用。'

    throw new Error(
      `Gemini API 404 错误: 您的 API Key 无法访问模型 "${cleanModel}"。\n` +
      `服务端反馈: ${lastErrorDetail || 'Not Found'}${hint}\n\n` +
      `💡 解决建议：\n` +
      `1. 打开左下角「设置」→「高级设置」，点击「🔍 自动获取我账号可用模型」按钮，系统将自动读取您账号支持的模型并一键填入。\n` +
      `2. 或在模型输入框中手动填写上方检测出的可用模型名称。`
    )
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const parts = json.candidates?.[0]?.content?.parts
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part.text) yield part.text
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    // 兼容非 SSE 标准包装的直接 JSON 流
    if (!buffer.includes('data:')) {
      const matches = buffer.match(/\{[^{}]*"text"\s*:\s*"[^"]*"[^{}]*\}/g)
      if (matches) {
        for (const match of matches) {
          try {
            const json = JSON.parse(match)
            if (json.text) {
              yield json.text
              buffer = buffer.replace(match, '')
            }
          } catch {
            // 继续等待完整块
          }
        }
      }
    }
  }
}

/* ------------------------------------------------------------
   Claude API 请求（支持 Claude 3.7 Sonnet 及 extended thinking）
   ------------------------------------------------------------ */

async function* streamClaude(
  config: LLMConfig,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const { apiKey, model, baseUrl, enableThinking, enableWebSearch, searchApiKey } = config
  const providerConfig = PROVIDER_CONFIGS.claude

  const useModel = getEffectiveModel('claude', model, enableThinking)

  // 提取系统消息
  let systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = messages.filter(m => m.role !== 'system')

  // 如果启用搜索且有 Tavily API，使用智能搜索
  if (enableWebSearch && searchApiKey) {
    const searchResult = await performSmartSearch(config, messages)
    if (searchResult) {
      systemMessage += searchResult
    }
  }

  // 构建请求体
  const requestBody: Record<string, unknown> = {
    model: useModel,
    max_tokens: enableThinking ? 16000 : 4096,
    system: systemMessage,
    messages: chatMessages,
    stream: true,
  }

  // 现代 Claude 模型 (Claude 5, Claude 3.7) 支持 extended / adaptive thinking
  if (enableThinking && !useModel.includes('haiku')) {
    requestBody.thinking = {
      type: 'enabled',
      budget_tokens: 10000,
    }
  }

  const response = await fetch(`${baseUrl || providerConfig.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Claude API Error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6))
          // 处理普通文本输出
          if (json.type === 'content_block_delta') {
            if (json.delta?.type === 'text_delta') {
              yield json.delta.text || ''
            }
          }
        } catch {
          // 忽略
        }
      }
    }
  }
}

/* ------------------------------------------------------------
   统一流式接口
   ------------------------------------------------------------ */

export async function* streamChat(
  config: LLMConfig,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  switch (config.provider) {
    case 'gemini':
      yield* streamGemini(config, messages)
      break
    case 'claude':
      yield* streamClaude(config, messages)
      break
    case 'openai':
    case 'kimi':
    case 'deepseek':
    case 'custom':
    default:
      yield* streamOpenAICompatible(config, messages)
      break
  }
}

/* ------------------------------------------------------------
   便捷调用方法
   ------------------------------------------------------------ */

export async function chat(
  config: LLMConfig,
  messages: ChatMessage[],
  callbacks?: StreamCallbacks
): Promise<string> {
  let fullText = ''

  try {
    for await (const token of streamChat(config, messages)) {
      fullText += token
      callbacks?.onToken?.(token)
    }
    callbacks?.onComplete?.(fullText)
  } catch (error) {
    callbacks?.onError?.(error as Error)
    throw error
  }

  return fullText
}
