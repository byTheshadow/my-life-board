import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import dayjs, { getMonthGrid, colorClass, WEEK_DAYS_CN } from '../../utils/dateUtils'
import EventModal from './EventModal'

export default function MonthView() {
  const { events } = useAppStore()
  const [current, setCurrent] = useState(dayjs())
  const [modal, setModal] = useState(null) // null | { event } | { defaultDate }

  const grid = getMonthGrid(current.year(), current.month() + 1)
  const today = dayjs().format('YYYY-MM-DD')

  const eventsOnDay = (dateStr) =>
    events.filter((e) => e.date === dateStr)

  return (
    <div className="flex flex-col h-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.subtract(1, 'month'))}
          aria-label="上个月"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-white/70" />
        </button>
        <button
          className="text-base font-semibold text-gray-800 dark:text-white"
          onClick={() => setCurrent(dayjs())}
        >
          {current.format('YYYY年 M月')}
        </button>
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.add(1, 'month'))}
          aria-label="下个月"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-white/70" />
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {WEEK_DAYS_CN.map((d) => (
          <div key={d} className="text-center text-[11px] text-gray-400 dark:text-white/40 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 flex-1 px-2 gap-y-1 overflow-y-auto">
        {grid.map((day) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const isCurrentMonth = day.month() === current.month()
          const dayEvents = eventsOnDay(dateStr)

          return (
            <div
              key={dateStr}
              className={`min-h-[52px] rounded-xl p-1 cursor-pointer transition-all duration-150
                hover:bg-white/30 dark:hover:bg-white/5 active:scale-95
                ${!isCurrentMonth ? 'opacity-30' : ''}`}
              onClick={() => setModal({ defaultDate: dateStr })}
              role="button"
              aria-label={`${dateStr}，点击添加课程`}
            >
              {/* 日期数字 */}
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mx-auto mb-0.5
                ${isToday
                  ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-700 dark:text-white/80'
                }`}>
                {day.date()}
              </div>

              {/* 事件点 / 条 */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className={`text-[10px] leading-tight px-1 py-0.5 rounded-md truncate text-white font-medium
                      ${colorClass[ev.color] ?? 'bg-blue-400/80'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setModal({ event: ev })
                    }}
                    role="button"
                    aria-label={`编辑：${ev.title}`}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-gray-400 dark:text-white/40 px-1">
                    +{dayEvents.length - 2}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 弹窗 */}
      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.defaultDate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
