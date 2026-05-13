import React, { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useAppStore, EVENT_COLORS } from '../../store/useAppStore'
import dayjs from '../../utils/dateUtils'

const COLOR_LABELS = {
  blue: '蓝',
  green: '绿',
  purple: '紫',
  coral: '珊瑚',
  amber: '琥珀',
}

const DEFAULT_FORM = {
  title: '',
  date: '',
  startTime: '08:00',
  endTime: '09:40',
  location: '',
  color: 'blue',
  repeat: 'none', // 'none' | 'weekly'
}

export default function EventModal({ event, defaultDate, onClose }) {
  const { addEvent, updateEvent, deleteEvent } = useAppStore()
  const isEdit = Boolean(event)

  const [form, setForm] = useState(() => {
    if (isEdit) return { ...DEFAULT_FORM, ...event }
    return {
      ...DEFAULT_FORM,
      date: defaultDate || dayjs().format('YYYY-MM-DD'),
    }
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  // 关闭时按 Esc
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    if (isEdit) {
      updateEvent(event.id, form)
    } else {
      addEvent(form)
    }
    onClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteEvent(event.id)
    onClose()
  }

  return (
    // 遮罩
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? '编辑课程' : '添加课程'}
    >
      <div className="glass-card w-full max-w-md p-5 animate-in slide-in-from-bottom-4 duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {isEdit ? '编辑课程' : '添加课程'}
          </h2>
          <button
            onClick={onClose}
            className="glass-btn p-1.5 text-gray-500 dark:text-white/60"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 课程名 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">课程名称 *</label>
            <input
              className="glass-input text-gray-800 dark:text-white"
              placeholder="例：高等数学"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">日期</label>
            <input
              type="date"
              className="glass-input text-gray-800 dark:text-white"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>

          {/* 时间段 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">开始时间</label>
              <input
                type="time"
                className="glass-input text-gray-800 dark:text-white"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">结束时间</label>
              <input
                type="time"
                className="glass-input text-gray-800 dark:text-white"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">地点（可选）</label>
            <input
              className="glass-input text-gray-800 dark:text-white"
              placeholder="例：教学楼 A301"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </div>

          {/* 颜色 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-2">颜色标签</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-all duration-150 event-${c}
                    ${form.color === c ? 'ring-2 ring-offset-2 ring-white/80 scale-110' : 'opacity-60 hover:opacity-90'}`}
                  aria-label={COLOR_LABELS[c]}
                  title={COLOR_LABELS[c]}
                />
              ))}
            </div>
          </div>

          {/* 重复 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">重复</label>
            <select
              className="glass-input text-gray-800 dark:text-white"
              value={form.repeat}
              onChange={(e) => set('repeat', e.target.value)}
            >
              <option value="none">不重复</option>
              <option value="weekly">每周重复</option>
            </select>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-1">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className={`glass-btn px-3 py-2 text-sm flex items-center gap-1.5 transition-colors
                  ${confirmDelete
                    ? 'bg-rose-500/80 text-white border-rose-400/50'
                    : 'text-rose-500 dark:text-rose-400'
                  }`}
              >
                <Trash2 size={14} />
                {confirmDelete ? '确认删除' : '删除'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 glass-btn py-2 text-sm font-medium text-gray-800 dark:text-white
                bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
            >
              {isEdit ? '保存修改' : '添加课程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
