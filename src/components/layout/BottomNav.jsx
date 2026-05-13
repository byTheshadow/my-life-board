import React from 'react'
import { CalendarDays, PawPrint, BarChart2, Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { key: 'calendar', icon: CalendarDays, label: '日程' },
  { key: 'pet',      icon: PawPrint,     label: '宠物' },
  { key: 'stats',    icon: BarChart2,    label: '统计' },
  { key: 'settings', icon: Settings,     label: '设置' },
]

export default function BottomNav() {
  const { currentPage, setCurrentPage } = useAppStore()

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around px-2 safe-area-pb">
      {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
        const active = currentPage === key
        return (
          <button
            key={key}
            onClick={() => setCurrentPage(key)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200
              ${active
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-white/35 hover:text-gray-600 dark:hover:text-white/60'
              }`}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.2 : 1.6}
              className={active ? 'scale-110 transition-transform' : ''}
            />
            <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-60'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
