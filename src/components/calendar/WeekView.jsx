import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import dayjs, { getWeekDays, timeToMinutes, colorClass } from '../../utils/dateUtils'
import EventModal from './EventModal'

const HOUR_HEIGHT = 56   // px per hour
const START_HOUR = 6     // 从 06:00 开始显示
const END_HOUR = 23      // 到 23:00

export default function WeekView() {
  const { events } = useAppStore()
  const [current, setCurrent] = useState(dayjs())
  const [modal, setModal] = useState(null)
  const scrollRef = useRef(null)
  const today = dayjs().format('YYYY-MM-DD')
  const weekDays = getWeekDays(current)

  // 初始滚动到当前时间附近
  React.useEffect(() => {
    if (scrollRef.current) {
      const now = dayjs()
      const offset = (now.hour() - START_HOUR - 1) * HOUR_HEIGHT
      scrollRef.current.scrollTop = Math.max(0, offset)
    }
  }, [])

  const eventsOnDay = (dateStr) =>
    events.filter((e) => e.date === dateStr)

  // 计算事件在时间轴上的位置和高度
  const getEventStyle = (ev) => {
    const start = timeToMinutes(ev.startTime)
    const end = timeToMinutes(ev.endTime)
    const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT
    const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 22)
    return { top, height }
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  return (
    <div className="flex flex-col h-full">
      {/* 周导航 */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.subtract(1, 'week'))}
          aria-label="上一周"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-white/70" />
        </button>
        <button
          className="text-base font-semibold text-gray-800 dark:text-white"
          onClick={() => setCurrent(dayjs())}
        >
          {weekDays[0].format('M月D日')} – {weekDays[6].format('M月D日')}
        </button>
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.add(1, 'week'))}
          aria-label="下一周"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-white/70" />
        </button>
      </div>

      {/* 星期头 + 日期 */}
      <div className="flex flex-shrink-0 pl-10 pr-2 gap-0.5">
        {weekDays.map((day) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const weekLabels = ['一','二','三','四','五','六','日']
          const idx = day.isoWeekday() - 1
          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center py-1">
              <span className="text-[10px] text-gray-400 dark:text-white/40">
                {weekLabels[idx]}
              </span>
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold mt-0.5
                ${isToday
                  ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-700 dark:text-white/75'
                }`}>
                {day.date()}
              </div>
            </div>
          )
        })}
      </div>

      {/* 时间轴主体 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex pr-2" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>

          {/* 时间刻度列 */}
          <div className="w-10 flex-shrink-0 relative">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-[10px] text-gray-400 dark:text-white/35 -mt-2">
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* 每天一列 */}
          {weekDays.map((day) => {
            const dateStr = day.format('YYYY-MM-DD')
            const dayEvs = eventsOnDay(dateStr)

            return (
              <div
                key={dateStr}
                className="flex-1 relative border-l border-white/20 dark:border-white/5"
                onClick={(e) => {
                  // 点击空白区域 → 计算点击时间
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const clickedHour = Math.floor(y / HOUR_HEIGHT) + START_HOUR
                  const hh = String(clickedHour).padStart(2, '0')
                  setModal({ defaultDate: dateStr, defaultTime: `${hh}:00` })
                }}
                role="button"
                aria-label={`${dateStr} 点击添加课程`}
              >
                {/* 水平分割线 */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-white/10 dark:border-white/5"
                    style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* 当前时间红线 */}
                {day.format('YYYY-MM-DD') === today && (() => {
                  const now = dayjs()
                  const mins = now.hour() * 60 + now.minute()
                  const top = ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT
                  return (
                    <div
                      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                      style={{ top: `${top}px` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 flex-shrink-0" />
                      <div className="flex-1 h-px bg-rose-500" />
                    </div>
                  )
                })()}

                {/* 课程块 */}
                {dayEvs.map((ev) => {
                  const { top, height } = getEventStyle(ev)
                  return (
                    <div
                      key={ev.id}
                      className={`absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-pointer
                        text-white text-[11px] font-medium overflow-hidden
                        hover:brightness-110 active:scale-95 transition-all duration-150 z-20
                        ${colorClass[ev.color] ?? 'bg-blue-400/80'}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setModal({ event: ev })
                      }}
                      role="button"
                      aria-label={`编辑：${ev.title}`}
                    >
                      <div className="truncate">{ev.title}</div>
                      {height > 30 && (
                        <div className="text-white/75 text-[10px] truncate">
                          {ev.startTime}
                          {ev.location ? ` · ${ev.location}` : ''}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* 弹窗 */}
      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.defaultDate}
          defaultTime={modal.defaultTime}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
