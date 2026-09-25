/* ============================================================
   扶桑 · 个人中心与档案管理 Store (Profile, Birth Profiles, History & Gongde)
   - 多命盘档案库 (Birth Profiles CRUD)
   - 测算历史足迹 (History Records)
   - 功德与任务系统 (Tasks, Sign-in & Woodfish)
   - Pass 会员体系 (Avatar Pass & Subscriptions)
   - MBTI 测评与人格档案联动
   ============================================================ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Gender } from '@/lib/astro'

export type RelationType =
  | 'self'       // 本人
  | 'partner'    // 伴侣 / 配偶
  | 'father'     // 父亲
  | 'mother'     // 母亲
  | 'child'      // 子女
  | 'friend'     // 挚友
  | 'business'   // 商业合伙人
  | 'other'      // 其他

export interface BirthProfile {
  id: string
  name: string
  relation: RelationType
  gender: Gender
  calendar: 'solar' | 'lunar'
  year: number
  month: number
  day: number
  hour: number
  minute?: number
  mbti?: string
  isDefault: boolean
  notes?: string
  createdAt: number
}

export interface HistoryRecord {
  id: string
  name: string
  birthInfo: {
    year: number
    month: number
    day: number
    hour: number
    gender: Gender
  }
  lifePalaceMajorStars: string[]
  bureau: string
  zodiac: string
  mbti?: string
  createdAt: number
}

export interface MeritLog {
  id: string
  title: string
  change: number // +10, -50 等
  timestamp: number
}

export type MembershipTier = 'free' | 'pro' | 'master'
export type LoginMethod = 'phone' | 'wechat' | 'email' | 'guest'

export interface OrderRecord {
  orderId: string
  planName: string
  tier: MembershipTier
  durationDays: number
  price: number // 实付金额
  originalPrice: number // 原价
  gongdeDeducted: number // 功德抵扣额
  paymentMethod: 'wechat' | 'alipay' | 'gongde'
  status: 'paid' | 'pending' | 'cancelled'
  createdAt: number
  paidAt?: number
}

interface ProfileState {
  // 用户基础身份与登录认证
  isLoggedIn: boolean
  loginMethod: LoginMethod
  userPhone: string
  userEmail: string
  avatarUrl: string

  userId: string
  userName: string
  avatarBadge: string
  membershipTier: MembershipTier
  vipExpiresAt: number | null

  // 功德与任务
  gongde: number
  lastSignInDate: string // YYYY-MM-DD
  completedTasks: string[]
  meritLogs: MeritLog[]

  // MBTI 测评状态
  mbtiType: string
  mbtiDimensions: {
    E: number
    I: number
    S: number
    N: number
    T: number
    F: number
    J: number
    P: number
  }

  // 档案库与历史记录
  profiles: BirthProfile[]
  history: HistoryRecord[]

  // 订单与付费流水
  orders: OrderRecord[]

  // 动作 Actions
  login: (params: { method: LoginMethod; account?: string; nickname?: string }) => void
  logout: () => void
  bindPhone: (phone: string) => void
  bindEmail: (email: string) => void
  createAndPayOrder: (order: Omit<OrderRecord, 'orderId' | 'status' | 'createdAt' | 'paidAt'>) => OrderRecord

  updateUserName: (name: string) => void
  addProfile: (profile: Omit<BirthProfile, 'id' | 'createdAt'>) => string
  updateProfile: (id: string, updates: Partial<BirthProfile>) => void
  deleteProfile: (id: string) => void
  setDefaultProfile: (id: string) => void
  addHistory: (record: Omit<HistoryRecord, 'id' | 'createdAt'>) => void
  deleteHistory: (id: string) => void
  clearHistory: () => void

  addGongde: (amount: number, reason: string) => void
  dailySignIn: () => { success: boolean; reward: number; message: string }
  completeTask: (taskId: string, reward: number, taskName: string) => boolean
  upgradeMembership: (tier: MembershipTier, days: number) => void
  setMBTIResult: (type: string, dimensions?: ProfileState['mbtiDimensions']) => void
}

// 预设档案样本 (真实可用的示范数据)
const INITIAL_PROFILES: BirthProfile[] = [
  {
    id: 'prof_default_self',
    name: '灵官 (我的命盘)',
    relation: 'self',
    gender: 'male',
    calendar: 'solar',
    year: 1995,
    month: 8,
    day: 18,
    hour: 12,
    minute: 0,
    mbti: 'INTJ',
    isDefault: true,
    notes: '命宫紫微七杀在巳，大运火贪同度，天生破局者',
    createdAt: 1704067200000,
  },
  {
    id: 'prof_sample_partner',
    name: '知己 (佳偶天成)',
    relation: 'partner',
    gender: 'female',
    calendar: 'solar',
    year: 1996,
    month: 6,
    day: 12,
    hour: 8,
    minute: 30,
    mbti: 'ENFP',
    isDefault: false,
    notes: '命宫天府文曲在亥，温柔明达，气度从容',
    createdAt: 1704153600000,
  },
  {
    id: 'prof_sample_parent',
    name: '至亲 (堂上慈严)',
    relation: 'father',
    gender: 'male',
    calendar: 'solar',
    year: 1968,
    month: 3,
    day: 5,
    hour: 6,
    minute: 0,
    mbti: 'ISTJ',
    isDefault: false,
    notes: '命宫太阳巨门在寅，德高望重，持家笃实',
    createdAt: 1704240000000,
  },
]

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // 登录与账号体系
      isLoggedIn: true,
      loginMethod: 'phone',
      userPhone: '138****6688',
      userEmail: 'xuanji@destiny.ai',
      avatarUrl: '',

      userId: 'XJ-' + Math.floor(10000000 + Math.random() * 90000000),
      userName: '玄机道友',
      avatarBadge: '玄',
      membershipTier: 'free',
      vipExpiresAt: null,

      gongde: 168,
      lastSignInDate: '',
      completedTasks: [],
      meritLogs: [
        {
          id: 'log_init',
          title: '初入玄机福慧迎新',
          change: 168,
          timestamp: Date.now() - 86400000,
        },
      ],

      mbtiType: 'INTJ',
      mbtiDimensions: {
        E: 30,
        I: 70,
        S: 25,
        N: 75,
        T: 85,
        F: 15,
        J: 80,
        P: 20,
      },

      profiles: INITIAL_PROFILES,
      history: [
        {
          id: 'hist_init_demo',
          name: '玄机道友 (我的命盘)',
          birthInfo: {
            year: 1995,
            month: 8,
            day: 18,
            hour: 12,
            gender: 'male',
          },
          lifePalaceMajorStars: ['紫微', '七杀'],
          bureau: '火六局',
          zodiac: '生肖猪',
          mbti: 'INTJ',
          createdAt: Date.now() - 3600000 * 2,
        },
      ],

      orders: [
        {
          orderId: 'ORD-88239012',
          planName: '玄机体验礼包 (迎新赠送)',
          tier: 'free',
          durationDays: 365,
          price: 0,
          originalPrice: 99,
          gongdeDeducted: 0,
          paymentMethod: 'gongde',
          status: 'paid',
          createdAt: Date.now() - 86400000,
          paidAt: Date.now() - 86400000,
        },
      ],

      // 登录与账号操作
      login: ({ method, account, nickname }) => {
        const currentPhone = method === 'phone' && account ? account : get().userPhone || '138****6688'
        const currentEmail = method === 'email' && account ? account : get().userEmail || 'xuanji@destiny.ai'
        const displayName = nickname || (account ? `道友_${account.slice(-4)}` : '玄机道友')
        set({
          isLoggedIn: true,
          loginMethod: method,
          userPhone: currentPhone,
          userEmail: currentEmail,
          userName: displayName,
          avatarBadge: displayName.slice(0, 1) || '玄',
        })
        get().addGongde(66, '玄机道友登录结缘福利')
      },

      logout: () => {
        set({
          isLoggedIn: false,
          loginMethod: 'guest',
          userName: '访客道友',
          userPhone: '',
          userEmail: '',
          avatarBadge: '客',
        })
      },

      bindPhone: (phone) => set({ userPhone: phone }),
      bindEmail: (email) => set({ userEmail: email }),

      createAndPayOrder: (orderParams) => {
        const orderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900)
        const newOrder: OrderRecord = {
          ...orderParams,
          orderId,
          status: 'paid',
          createdAt: Date.now(),
          paidAt: Date.now(),
        }

        // 功德抵扣扣减
        if (orderParams.gongdeDeducted > 0) {
          get().addGongde(-orderParams.gongdeDeducted, `开通 ${orderParams.planName} 功德抵扣`)
        }

        // 升级会员天数
        get().upgradeMembership(orderParams.tier, orderParams.durationDays)

        // 赠送额外功德
        const bonus = orderParams.tier === 'master' ? 300 : 80
        get().addGongde(bonus, `开通 ${orderParams.planName} 赠送功德`)

        // 沉淀订单记录
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }))

        return newOrder
      },

      updateUserName: (name: string) => set({ userName: name.trim() || '玄机道友' }),

      addProfile: (profileData) => {
        const id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
        const newProfile: BirthProfile = {
          ...profileData,
          id,
          createdAt: Date.now(),
        }

        set((state) => {
          let updatedList = [...state.profiles]
          if (newProfile.isDefault) {
            updatedList = updatedList.map((p) => ({ ...p, isDefault: false }))
          }
          return { profiles: [newProfile, ...updatedList] }
        })

        get().addGongde(15, `新建档案 · ${newProfile.name}`)
        return id
      },

      updateProfile: (id, updates) => {
        set((state) => {
          let updatedList = state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p))
          if (updates.isDefault) {
            updatedList = updatedList.map((p) => (p.id === id ? { ...p, isDefault: true } : { ...p, isDefault: false }))
          }
          return { profiles: updatedList }
        })
      },

      deleteProfile: (id) => {
        set((state) => {
          const filtered = state.profiles.filter((p) => p.id !== id)
          if (filtered.length > 0 && !filtered.some((p) => p.isDefault)) {
            filtered[0].isDefault = true
          }
          return { profiles: filtered }
        })
      },

      setDefaultProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        }))
      },

      addHistory: (recordData) => {
        const id = 'hist_' + Date.now()
        const newRecord: HistoryRecord = {
          ...recordData,
          id,
          createdAt: Date.now(),
        }

        set((state) => {
          // 限制历史记录最多保留 50 条
          const updated = [newRecord, ...state.history.filter((h) => h.name !== newRecord.name || Math.abs(h.createdAt - newRecord.createdAt) > 60000)].slice(0, 50)
          return { history: updated }
        })
      },

      deleteHistory: (id) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      addGongde: (amount, reason) => {
        set((state) => {
          const newTotal = Math.max(0, state.gongde + amount)
          const newLog: MeritLog = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            title: reason,
            change: amount,
            timestamp: Date.now(),
          }
          return {
            gongde: newTotal,
            meritLogs: [newLog, ...state.meritLogs].slice(0, 50),
          }
        })
      },

      dailySignIn: () => {
        const state = get()
        const todayStr = new Date().toISOString().split('T')[0]

        if (state.lastSignInDate === todayStr) {
          return {
            success: false,
            reward: 0,
            message: '今日已完成签到，功德常在，明日再来！',
          }
        }

        const reward = 10
        state.addGongde(reward, '每日打卡签到 · 福慧双增')
        set({ lastSignInDate: todayStr })

        return {
          success: true,
          reward,
          message: `签到成功！功德 +${reward}`,
        }
      },

      completeTask: (taskId, reward, taskName) => {
        const state = get()
        const todayStr = new Date().toISOString().split('T')[0]
        const taskKey = `${taskId}_${todayStr}`

        if (state.completedTasks.includes(taskKey)) {
          return false
        }

        state.addGongde(reward, `完成任务: ${taskName}`)
        set({ completedTasks: [...state.completedTasks, taskKey] })
        return true
      },

      upgradeMembership: (tier, days) => {
        const msToAdd = days * 86400000
        const currentExp = get().vipExpiresAt
        const baseTime = currentExp && currentExp > Date.now() ? currentExp : Date.now()

        set({
          membershipTier: tier,
          vipExpiresAt: baseTime + msToAdd,
        })
      },

      setMBTIResult: (type, dimensions) => {
        set((state) => ({
          mbtiType: type,
          mbtiDimensions: dimensions || state.mbtiDimensions,
        }))
        get().completeTask('mbti_test', 20, '完成 MBTI 命理心理全息测评')
      },
    }),
    {
      name: 'fusang-profile-store',
      version: 1,
    }
  )
)
