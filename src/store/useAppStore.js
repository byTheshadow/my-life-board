import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 课程颜色选项
export const EVENT_COLORS = ['blue', 'green', 'purple', 'coral', 'amber']

// 生成唯一 ID
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── 主题 ──────────────────────────────────────────
      theme: 'light',          // 'light' | 'dark'
      bgImageUrl: '',          // 背景图 URL

      setTheme: (theme) => set({ theme }),
      setBgImageUrl: (url) => set({ bgImageUrl: url }),

      // ── 当前页面 ──────────────────────────────────────
      currentPage: 'calendar', // 'calendar' | 'pet' | 'stats' | 'settings'
      setCurrentPage: (page) => set({ currentPage: page }),

      // ── 日历视图 ──────────────────────────────────────
      calendarView: 'week',    // 'month' | 'week' | 'day'
      setCalendarView: (view) => set({ calendarView: view }),

      // ── 课程数据 ──────────────────────────────────────
      events: [],

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: genId() }],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      // 批量删除
      deleteEvents: (ids) =>
        set((state) => ({
          events: state.events.filter((e) => !ids.includes(e.id)),
        })),
    }),
    {
      name: 'my-life-board',
      // 只持久化数据，不持久化 UI 状态
      partialize: (state) => ({
        theme: state.theme,
        bgImageUrl: state.bgImageUrl,
        events: state.events,
      }),
    }
  )
)
