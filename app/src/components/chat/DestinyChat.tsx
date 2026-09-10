/* ============================================================
   扶桑 · 命运分身问答对话 (Report Chat / Agent)
   对标 lifekline.ai 的 /lifekline-agent 功能：
   结合命盘三方四正与大运走势，提供多轮深度命理交互咨询。
   ============================================================ */

import { useState, useRef, useEffect, useMemo } from 'react'
import { useChartStore, useSettingsStore } from '@/stores'
import { streamChat, getEffectiveModel, type ChatMessage, type LLMConfig } from '@/lib/llm'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SUGGESTED_QUESTIONS = [
  '📊 我当前大运与未来三年的关键机遇在何处？',
  '💼 我的命盘最适合何种行业赛道与商业模式？',
  '💍 结合夫妻宫与四化，我的正缘特征何时显现？',
  '⚡ 我的性格中有哪些隐性暗礁与决策盲点需要防范？',
  '📈 人生K线中哪个十年是我的财富最高峰？',
]

export function DestinyChat() {
  const { chart, birthInfo } = useChartStore()
  const { provider, getCurrentSettings, enableThinking, enableWebSearch, searchApiKey } = useSettingsStore()

  const llmConfig: LLMConfig = useMemo(() => {
    const settings = getCurrentSettings()
    return {
      provider,
      apiKey: settings.apiKey,
      baseUrl: settings.customBaseUrl || undefined,
      model: settings.customModel || undefined,
      enableThinking,
      enableWebSearch,
      searchApiKey,
    }
  }, [provider, getCurrentSettings, enableThinking, enableWebSearch, searchApiKey])

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '“天行健，君子以自强不息；地势坤，君子以厚德载物。”\n\n欢迎来到**扶桑 · 命运分身顾问**。我已通览您的命盘格局与人生K线走势。您可以在此处就事业、财帛、情感正缘、大运转折等任何关切之惑向我垂询。',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 构建命盘系统上下文
  const buildSystemPrompt = () => {
    let contextStr = '命盘暂未生成，请以紫微斗数与人生哲学的一般原理进行温润解答。'
    if (chart) {
      const mingPalace = chart.palaces.find((p) => p.name === '命宫')
      const majorStars = mingPalace?.majorStars?.map((s) => s.name).join('、') || '无主星'
      contextStr = `
命主生辰：${birthInfo ? `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${birthInfo.hour}时 (${birthInfo.gender === 'male' ? '男' : '女'})` : '已知'}
命宫主星：${majorStars}
身宫：${chart.palaces.find((p) => p.isBodyPalace)?.name || '已知'}
十二宫概况：
${chart.palaces.map((p) => `- ${p.name}(${p.earthlyBranch}): 主星[${p.majorStars.map((s) => `${s.name}${s.mutagen ? `(${s.mutagen})` : ''}`).join(' ')}] 辅星[${p.minorStars.map((s) => s.name).join(' ')}]`).join('\n')}
`
    }

    return `你是「扶桑·人生K线」的顶级命理大师与命运分身顾问。你融合了中州派紫微斗数、现代心理学与商业宏观周期洞察。
你的风格：古雅温润、字字珠玑、直击本质、充满哲思，兼具现实可行性与心灵宽慰。
请结合以下命盘上下文，深入浅出地解答用户的提问。结构清晰，有理有据，避免机械罗列八股术语，多给出具有人生杠杆效应的明智建议。
命盘信息如下：
${contextStr}`
  }

  const handleSend = async (userQuestion?: string) => {
    const textToSend = userQuestion || input
    if (!textToSend.trim() || loading) return

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: textToSend },
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: buildSystemPrompt(),
      }

      const requestPayload = [systemMessage, ...newMessages]

      let assistantText = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      for await (const token of streamChat(llmConfig, requestPayload)) {
        assistantText += token
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: assistantText }
          return next
        })
      }
    } catch (err: any) {
      console.error('AI 对话失败:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `【推演受阻】${err?.message || '请检查是否已在设置中配置有效 API Key。'}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between pb-2 border-b border-[#dcd3c1]/70 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="fusang-seal text-xs">分身问答</span>
          <div>
            <h3 className="text-lg font-bold font-serif-sc text-[#1e2f34]">
              命运分身顾问 (Report Chat)
            </h3>
            <p className="text-xs text-[#52666a] flex items-center gap-1.5 mt-0.5">
              <span>当前模型：</span>
              <span className="font-semibold text-[#176f63] uppercase">{llmConfig.provider}</span>
              <span className="text-[#879397]">·</span>
              <span className="font-mono text-[#176f63] bg-white/80 px-1.5 py-0.5 rounded border border-[#dcd3c1]/80">
                {getEffectiveModel(llmConfig.provider, llmConfig.model, llmConfig.enableThinking)}
              </span>
              {llmConfig.enableThinking && (
                <span className="text-[10px] bg-[#c58a28]/15 text-[#c58a28] px-1.5 py-0.5 rounded-full">
                  深度思考
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content:
                  '对话已重新开启。请问您想探索命盘的哪一方面？',
              },
            ])
          }
          className="text-xs px-3 py-1.5 rounded-full border border-[#dcd3c1] bg-white text-[#52666a] hover:text-[#176f63] hover:border-[#176f63]/40 transition-colors"
        >
          清空对话
        </button>
      </div>

      {/* 快捷提问推荐气泡 */}
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 [scrollbar-width:none] shrink-0">
        <span className="text-xs text-[#879397] shrink-0 font-serif">推荐提问:</span>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full whitespace-nowrap bg-white/80 border border-[#dcd3c1] text-[#1e2f34] hover:border-[#176f63] hover:text-[#176f63] transition-colors shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 聊天消息区 */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar bg-white/60 backdrop-blur-sm rounded-2xl border border-[#dcd3c1]/70 p-4 sm:p-6 shadow-inner">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#176f63] text-white flex items-center justify-center text-xs font-serif shrink-0 shadow-sm mt-1">
                  桑
                </div>
              )}
              <div
                className={`
                  max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed
                  ${isUser
                    ? 'bg-[#176f63] text-white rounded-br-none shadow-sm'
                    : 'bg-white border border-[#dcd3c1] text-[#1e2f34] rounded-bl-none shadow-sm'
                  }
                `}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none text-[#1e2f34] prose-headings:font-serif-sc prose-headings:text-[#1e2f34] prose-p:my-2 prose-strong:text-[#176f63]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-[#c58a28] text-white flex items-center justify-center text-xs font-serif shrink-0 shadow-sm mt-1">
                  您
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#176f63] text-white flex items-center justify-center text-xs font-serif shrink-0 shadow-sm mt-1">
              桑
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#dcd3c1] text-[#52666a] text-xs flex items-center gap-2 shadow-sm">
              <span className="w-3.5 h-3.5 border-2 border-[#176f63] border-t-transparent rounded-full animate-spin" />
              <span>扶桑分身正在研析命盘星象...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入框 */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex gap-2 shrink-0 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="向扶桑命运分身提问（如：我今年适合跳槽或创业吗？）..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-[#dcd3c1] bg-white text-sm text-[#1e2f34] placeholder:text-[#879397] focus:outline-none focus:border-[#176f63] shadow-sm disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-fusang px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <span>发送</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  )
}
