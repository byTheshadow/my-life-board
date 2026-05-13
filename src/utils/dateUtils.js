import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.locale('zh-cn')

export default dayjs

// 获取月视图的 6×7 日期格子
export function getMonthGrid(year, month) {
  const firstDay = dayjs(`${year}-${month}-01`)
  // 周一为第一天
  const startOffset = (firstDay.day() + 6) % 7
  const start = firstDay.subtract(startOffset, 'day')

  const grid = []
  for (let i = 0; i < 42; i++) {
    grid.push(start.add(i, 'day'))
  }
  return grid
}

// 获取周视图的 7 天
export function getWeekDays(date) {
  const monday = dayjs(date).startOf('isoWeek')
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'))
}

// 时间字符串 "HH:mm" → 分钟数
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 分钟数 → "HH:mm"
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// 课程颜色 → Tailwind class
export const colorClass = {
  blue:   'bg-blue-400/80',
  green:  'bg-emerald-400/80',
  purple: 'bg-violet-400/80',
  coral:  'bg-rose-400/80',
  amber:  'bg-amber-400/80',
}

export const colorDotClass = {
  blue:   'bg-blue-400',
  green:  'bg-emerald-400',
  purple: 'bg-violet-400',
  coral:  'bg-rose-400',
  amber:  'bg-amber-400',
}

export const WEEK_DAYS_CN = ['一', '二', '三', '四', '五', '六', '日']
export const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0–23
