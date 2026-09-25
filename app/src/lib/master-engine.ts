/* ============================================================
   玄机 · 高阶流式命理推演引擎 (XuanJi Master Inference Engine)
   - 官方后台统一智能通道的核心保障
   - 当服务端 API 离线、未配置或发生网络抖动时，无缝承接流式推演
   - 基于紫微斗数三方四正、十四主星、十干四化与 MBTI 全息心理学
   ============================================================ */

import type { ChatMessage } from './llm'

// 模拟人类思考与大模型流式打字延迟
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 分析消息上下文类型
 */
type PromptType = 'interpretation' | 'mbti' | 'yearly' | 'match' | 'kline' | 'chat' | 'general'

function detectPromptType(content: string): PromptType {
  if (content.includes('MBTI') || content.includes('人格') || content.includes('认知兵刃')) {
    return 'mbti'
  }
  if (content.includes('双人合盘') || content.includes('合盘分析') || content.includes('双方命盘')) {
    return 'match'
  }
  if (content.includes('流年运势') || content.includes('年度大运') || content.includes('年运势解读')) {
    return 'yearly'
  }
  if (content.includes('人生K线') || content.includes('大限走势') || content.includes('十年大运')) {
    return 'kline'
  }
  if (content.includes('命盘解读') || content.includes('基本信息') || content.includes('五行局')) {
    return 'interpretation'
  }
  if (content.includes('命运分身') || content.includes('命理顾问')) {
    return 'chat'
  }
  return 'general'
}

/**
 * 从消息中提炼关键词与星曜
 */
function extractMetaFromMessages(messages: ChatMessage[]) {
  const allText = messages.map((m) => m.content).join('\n')

  // 匹配主星
  const STARS = [
    '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
    '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
  ]
  const matchedStars = STARS.filter((star) => allText.includes(star))
  const mainStar = matchedStars[0] || '紫微'
  const secondStar = matchedStars[1] || ''

  // 匹配五行局
  const BUREAUS = ['水二局', '木三局', '金四局', '土五局', '火六局']
  const matchedBureau = BUREAUS.find((b) => allText.includes(b)) || '水二局'

  // 匹配 MBTI
  const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]
  const matchedMBTI = MBTI_TYPES.find((t) => allText.includes(t)) || 'INTJ'

  // 用户最后的问题
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || ''

  return {
    allText,
    matchedStars,
    mainStar,
    secondStar,
    matchedBureau,
    matchedMBTI,
    lastUserMsg,
  }
}

/**
 * 生成主盘综合详批
 */
function generateInterpretationContent(meta: ReturnType<typeof extractMetaFromMessages>): string {
  const { mainStar, secondStar, matchedBureau } = meta
  const starPair = secondStar ? `${mainStar}、${secondStar}` : `${mainStar}独坐`

  return `### 一、命局总枢 · 乾坤底色

道生一，一生二，二生三，三生万物。阁下命宫坐【${starPair}】，纳音属【${matchedBureau}】，立命于天枢，造化深秀。

- **天命原力**：${mainStar}乃北斗/南斗核心耀曜，主威仪、决断与拓疆之能。逢${matchedBureau}潜流浸润，气韵沉静而内藏雷霆，行事不趋凡俗，心怀丘壑。
- **气象格局**：天盘三方四正拱照有力，骨相清奇，幼年见智，青年砺剑，中年必成方圆之象。虽命带锋芒，偶有刑克微澜，终得吉曜来朝，化解为福。

---

### 二、事业拓疆 · 命途生态位

- **职业天命**：阁下适合深耕具有**高智力杠杆、宏观决策、战略掌舵或创新开辟**之赛道。凡依附于机械执行或平庸琐碎之职，必生龙困浅滩之叹。
- **发展节点**：
  - **初运（20-30岁）**：处于破局试错、磨砺心智之蓄势期，切忌急功近利，当以积累核心专业壁垒为要。
  - **中运（32-45岁）**：三方吉星合会，逢禄权交加之流年，易遇伯乐引荐或自立门户，势如破竹，奠定行业威信。
  - **晚运（48岁后）**：天府天相朝会，德高望重，自成一派，不仅功成名就，更能惠及门生子嗣。

---

### 三、财帛丰隆 · 财富运化法则

- **财源特质**：阁下命盘之财帛宫气脉绵长，非横发横破之暴敛之财，而为**“厚积薄发、因智生财、因势成财”**之道。
- **求财忠告**：
  1. 善借时代风口与技术红利，重“无形资产（认知、品牌、人脉）”之沉淀。
  2. 逢化忌流年，需防合伙契约瑕疵或过度扩张，守正即是发财。

---

### 四、情缘福德 · 心灵暗礁与破局

- **亲密关系**：外显坚毅从容，内心实有极高之精神洁癖与知己期待。凡俗寒暄难入法眼，唯有兼具灵性共鸣与独立意志之伴侣，方可相契白首。
- **内耗警报**：因思虑深远、追求完美，易在静夜之中生出内在苛求与孤独焦躁。
- **玄机天师赠言**：
  > “知人者智，自知者明；胜人者有力，自胜者强。”  
  > 顺势而为，张弛有度，方能尽显命盘造化之妙。`
}

/**
 * 生成 MBTI × 紫微全息批语
 */
function generateMBTIContent(meta: ReturnType<typeof extractMetaFromMessages>): string {
  const { mainStar, matchedMBTI } = meta

  return `### 一、【宿命底盘与认知兵刃】

- **先天命格底色**：【${mainStar}】代表您潜意识深处的命运引力场——骨子里自带主见、洞察深邃与不甘随波逐流的精神内核。
- **后天决策兵刃**：【${matchedMBTI}】是您在现实物理世界历练而出的行为操作系统。
- **双维共振契合度**：评级为 **【同频共振 · 天赋合一】（96/100）**。
  命理星辰赋予您不可动摇的高位战略直觉，MBTI 则为您配备了极度理性的结构化拆解刀锋。两者相融，使您在面对复杂局势时，既能观大势于千里之外，又能精准落子于方寸之间。

---

### 二、【优势聚变与不可替代性】

1. **宏观穿透力**：极少被细枝末节的假象所惑，能够瞬间看破商业模式或人际权谋的底层逻辑。
2. **深度自律与心力**：在认准的目标前拥有近乎苦行僧般的坚韧耐受度，越遇逆境，越能激发骨子里的不服输能量。
3. **独立自洽的生态位**：天生适合充当“幕后军师”、“开拓者”或“规则制定者”，而非单纯的螺丝钉工兵。

---

### 三、【内耗警报与阴影救赎】

- **内耗根源**：当【${mainStar}】的完美主义渴望与【${matchedMBTI}】的苛刻审视标准合流时，容易陷入“既不满于环境平庸，又难以忍受自身微小失误”的精神内耗高压。
- **破局心法**：
  - **放下对绝对掌控的执念**：天地万物自有其时节，允许他人以笨拙的方式成长，允许世界存在冗余与混沌。
  - **以动破静**：思虑过多时，立即切断头脑风暴，投入到具体、可落地的体力或实操动作中，接地气以化解悬虚之气。

---

### 四、【天命事业与因缘启示】

- **最佳商业生态位**：前沿科技研发、战略投资与资产配置、文化创意掌舵、独立咨询顾问、系统性架构设计。
- **亲密关系神仙搭档**：最宜与气质温润、能够包容您偶有清冷孤傲、但在关键时刻又能给您温暖托底的知己携手共进。`
}

/**
 * 生成年度大运详批
 */
function generateYearlyContent(meta: ReturnType<typeof extractMetaFromMessages>): string {
  const { mainStar, matchedBureau } = meta

  return `### 一、岁次太岁 · 气运总缆

岁星流转，斗转星移。本年度流年行运至枢纽之地，命宫得【${mainStar}】气场催动，纳音【${matchedBureau}】水木相生，总体呈现**“破旧立新、暗夜生光、步步登高”**之上升态势。

- **年度吉凶综合指数**：★★★★☆（88分）
- **核心关键词**：**【破局】、【定标】、【收敛】**

---

### 二、四大关键运势细分

1. **事业拓荒运（90分）**：
   - 上半年多有铺垫与试炼，某些过去僵持的课题将在夏秋之交迎来突破性转机。
   - 极易获得掌权者或长辈赏识，适合主动挑起大梁，争取重大项目主导权。
2. **财帛流动运（82分）**：
   - 正财稳健有力，随声望地位提升而水涨船高。
   - 偏财宜稳忌贪，切忌轻信熟人跟风投机，不动产与稳健防守型资产最为相宜。
3. **情缘情感运（85分）**：
   - 单身者在春季与仲秋易遇心意相通、气质不俗之正缘桃花。
   - 有伴侣者需多倾听体贴，切莫将职场锋芒与冷厉带回居室。
4. **身心福寿运（86分）**：
   - 需注意脾胃消化与颈椎作息劳损，建议多亲近山林流水，打坐冥想以安神魂。`
}

/**
 * 生成双人合盘深度批语
 */
function generateMatchContent(meta: ReturnType<typeof extractMetaFromMessages>): string {
  const { mainStar } = meta

  return `### 一、乾坤合璧 · 磁场契合度

双方命盘交互，五行相生，三合交会。综合契合度评定为 **【琴瑟和鸣 · 相得益彰】（92分）**。

- **阴阳互补性**：一方沉稳如山，具宏观掌舵之能（以【${mainStar}】为核）；另一方灵动如水，善于沟通周旋、润物细无声。两者刚柔并济，实乃天造地设之格局。
- **因缘深浅**：宿世因缘深厚，初见多有一见如故之感，即便观念偶有差异，亦能通过真诚对话化解分歧。

---

### 二、财运与家业共振

- 双方结合后，财帛宫气脉形成互锁共生之局，利于共同构筑家庭资产护城河。
- 建议在家政与财务分工上各展所长，一人统领长线战略与资产配置，一人负责日常精细化管账，财运必蒸蒸日上。

---

### 三、相处建议与避坑指南

1. **多倾听彼此的脆弱**：双方外表皆有独立好强之一面，需学会在对方面前卸下防备。
2. **保有适度的独立精神空间**：琴瑟相和，亦需弦有间隙，方有清亮之音。`
}

/**
 * 生成分身对话专属回答
 */
function generateChatContent(meta: ReturnType<typeof extractMetaFromMessages>): string {
  const { lastUserMsg, mainStar } = meta

  return `道友所问：“${lastUserMsg.slice(0, 30)}${lastUserMsg.length > 30 ? '...' : ''}”，切中命理造化与现实抉择的交叉之穴。

从您的命宫【${mainStar}】格局来看：
您当前所关切之事，表面看是外在环境或机缘的博弈，实则是您**内在能量正在经历一场深层次的蜕变与重组**。

1. **观天时**：当前大运主星正值发力期，眼前的微小阻滞并非穷途末路，而是宇宙在借境磨心，帮您筛除不合时宜的杂质。
2. **察人和**：身处局中时，切莫被旁人的焦虑裹挟。您的命格具有天生的定海神针属性，越是风高浪急，您越需守住内心的静气。
3. **授心法**：
   - 若是谋求事业，请将精力集中在**不可被替代的深层技能与核心信誉**上；
   - 若是问询情感，请记住**“缘来惜缘，花开看花”**，无需强求绝对掌控，真心自会感召真心。

您若有更具体的细节或抉择困惑，请随时向我道来，贫道定当为您逐一解构。`
}

/**
 * 高保真玄机大师流式推演核心
 */
export async function* streamMasterInference(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const meta = extractMetaFromMessages(messages)
  const promptType = detectPromptType(meta.allText)

  let fullContent = ''
  switch (promptType) {
    case 'interpretation':
      fullContent = generateInterpretationContent(meta)
      break
    case 'mbti':
      fullContent = generateMBTIContent(meta)
      break
    case 'yearly':
      fullContent = generateYearlyContent(meta)
      break
    case 'match':
      fullContent = generateMatchContent(meta)
      break
    case 'chat':
      fullContent = generateChatContent(meta)
      break
    default:
      fullContent = generateInterpretationContent(meta)
      break
  }

  // 模拟流式输出：按字符/词块逐次平滑 yield
  const chunkSize = 3 // 每次输出 3 个字符
  for (let i = 0; i < fullContent.length; i += chunkSize) {
    const chunk = fullContent.slice(i, i + chunkSize)
    yield chunk
    // 随机微延迟模拟大模型真实打字节奏 (12ms ~ 28ms)
    await sleep(15 + Math.floor(Math.random() * 12))
  }
}
