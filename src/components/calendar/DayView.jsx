import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import dayjs, { timeToMinutes, colorClass } from '../../utils/dateUtils'
import EventModal from './EventModal'

const HOUR_HEIGHT = 64
const START_HOUR = 6
const END_HOUR = 23

export default function DayView() {
  const { events } = useAppStore()
  const [current, setCurrent] = useState(dayjs())
  const [modal, setModal] = useState(null)
  const scrollRef = useRef(null)
  const today = dayjs().format('YYYY-MM-DD')
  const dateStr = current.format('YYYY-MM-DD')
  const isToday = dateStr === today

  useEffect(() => {
    if (scrollRef.current) {
      const now = dayjs()
      const offset = (now.hour() - START_HOUR - 1) * HOUR_HEIGHT
      scrollRef.current.scrollTop = Math.max(0, offset)
    }
  }, [])

  const dayEvents = events.filter((e) => e.date === dateStr)
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  const getEventStyle = (ev) => {
    const start = timeToMinutes(ev.startTime)
    const end = timeToMinutes(ev.endTime)
    const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT
    const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 28)
    return { top, height }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 日期导航 */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.subtract(1, 'day'))}
          aria-label="前一天"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-white/70" />
        </button>
        <div className="text-center">
          <div className="text-base font-semibold text-gray-800 dark:text-white">
            {current.format('M月D日')}
            <span className="ml-2 text-sm font-normal text-gray-400 dark:text-white/50">
              {['周日','周一','周二','周三','周四','周五','周六'][current.day()]}
            </span>
          </div>
          {isToday && (
            <div className="text-xs text-rose-400 font-medium">今天</div>
          )}
        </div>
        <button
          className="glass-btn p-2"
          onClick={() => setCurrent((d) => d.add(1, 'day'))}
          aria-label="后一天"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-white/70" />
        </button>
      </div>

      {/* 时间轴 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2">
        <div className="flex" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>

          {/* 时间刻度 */}
          <div className="w-12 flex-shrink-0 relative">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-[11px] text-gray-400 dark:text-white/35 -mt-2">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* 事件区域 */}
          <div
            className="flex-1 relative border-l border-white/20 dark:border-white/5"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const y = e.clientY - rect.top
              const clickedHour = Math.floor(y / HOUR_HEIGHT) + START_HOUR
              const hh = String(clickedHour).padStart(2, '0')
              setModal({ defaultDate: dateStr, defaultTime: `${hh}:00` })
            }}
            role="button"
            aria-label="点击添加课程"
          >
            {/* 水平线 */}
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-white/10 dark:border-white/5"
                style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
              />
            ))}

            {/* 当前时间红线 */}
            {isToday && (() => {
              const now = dayjs()
              const mins = now.hour() * 60 + now.minute()
              const top = ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT
              return (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                  style={{ top: `${top}px` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 flex-shrink-0" />
                  <div className="flex-1 h-px bg-rose-500" />
                </div>
              )
            })()}

            {/* 课程块 */}
            {dayEvents.map((ev) => {
              const { top, height } = getEventStyle(ev)
              return (
                <div
                  key={ev.id}
                  className={`absolute left-1 right-1 rounded-xl px-3 py-1.5 cursor-pointer
                    text-white overflow-hidden z-20
                    hover:brightness-110 active:scale-[0.98] transition-all duration-150
                    ${colorClass[ev.color] ?? 'bg-blue-400/80'}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setModal({ event: ev })
                  }}
                  role="button"
                  aria-label={`编辑：${ev.title}`}
                >
                  <div className="font-semibold text-sm truncate">{ev.title}</div>
                  {height > 40 && (
                    <div className="text-white/75 text-xs mt-0.5">
                      {ev.startTime} – {ev.endTime}
                      {ev.location && <span className="ml-2">📍 {ev.location}</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
