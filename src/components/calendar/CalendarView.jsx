import React from 'react'
import { CalendarDays, Columns2, AlignJustify } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'

const VIEW_OPTIONS = [
  { key: 'month', icon: CalendarDays, label: '月' },
  { key: 'week',  icon: Columns2,     label: '周' },
  { key: 'day',   icon: AlignJustify, label: '日' },
]

export default function CalendarView() {
  const { calendarView, setCalendarView } = useAppStore()

  return (
    <div className="flex flex-col h-full">
      {/* 视图切换 Tab */}
      <div className="flex items-center justify-center gap-1 px-4 pt-3 pb-1 flex-shrink-0">
        <div className="glass-card flex p-1 gap-1">
          {VIEW_OPTIONS.map(({ key, icon: Icon, label }) => {
            const active = calendarView === key
            return (
              <button
                key={key}
                onClick={() => setCalendarView(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${active
                    ? 'bg-white/70 dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-white/45 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                aria-pressed={active}
                aria-label={`${label}视图`}
              >
                <Icon size={13} />
                {label}视图
              </button>
            )
          })}
        </div>
      </div>

      {/* 视图内容 */}
      <div className="flex-1 overflow-hidden">
        {calendarView === 'month' && <MonthView />}
        {calendarView === 'week'  && <WeekView />}
        {calendarView === 'day'   && <DayView />}
      </div>
    </div>
  )
}
