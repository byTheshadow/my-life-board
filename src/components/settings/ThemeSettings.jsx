import React, { useState } from 'react'
import { Sun, Moon, Image, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import GlassCard from '../layout/GlassCard'

export default function ThemeSettings() {
  const { theme, setTheme, bgImageUrl, setBgImageUrl } = useAppStore()
  const [urlInput, setUrlInput] = useState(bgImageUrl)
  const [saved, setSaved] = useState(false)

  const handleSaveBg = () => {
    setBgImageUrl(urlInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-4 py-6 space-y-5 overflow-y-auto h-full">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">设置</h1>

      {/* 主题切换 */}
      <GlassCard className="p-4">
        <h2 className="text-sm font-medium text-gray-600 dark:text-white/60 mb-3">外观主题</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200
              ${theme === 'light'
                ? 'bg-white/70 border-white/80 shadow-sm text-gray-900'
                : 'bg-white/20 border-white/20 text-gray-500 dark:text-white/50'
              }`}
            aria-pressed={theme === 'light'}
          >
            <Sun size={20} />
            <span className="text-xs font-medium">浅色</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200
              ${theme === 'dark'
                ? 'bg-white/10 border-white/20 shadow-sm text-white'
                : 'bg-white/20 border-white/20 text-gray-500 dark:text-white/50'
              }`}
            aria-pressed={theme === 'dark'}
          >
            <Moon size={20} />
            <span className="text-xs font-medium">深色</span>
          </button>
        </div>
      </GlassCard>

      {/* 背景图 */}
      <GlassCard className="p-4">
        <h2 className="text-sm font-medium text-gray-600 dark:text-white/60 mb-1">背景图片</h2>
        <p className="text-xs text-gray-400 dark:text-white/35 mb-3">
          填入任意图片 URL，留空则使用纯色背景
        </p>

        {/* 预览 */}
        {urlInput && (
          <div
            className="w-full h-28 rounded-xl mb-3 bg-cover bg-center border border-white/20"
            style={{ backgroundImage: `url(${urlInput})` }}
            aria-label="背景图预览"
          />
        )}

        <div className="flex gap-2">
          <input
            className="glass-input flex-1 text-gray-800 dark:text-white"
            placeholder="https://example.com/bg.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            aria-label="背景图 URL"
          />
          <button
            onClick={handleSaveBg}
            className={`glass-btn px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-all
              ${saved
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-700 dark:text-white/70'
              }`}
            aria-label="保存背景图"
          >
            {saved ? <Check size={15} /> : <Image size={15} />}
            {saved ? '已保存' : '应用'}
          </button>
        </div>

        {/* 快速预设 */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 dark:text-white/35 mb-2">快速预设</p>
          <div className="flex gap-2 flex-wrap">
            {PRESET_BG.map((bg) => (
              <button
                key={bg.url}
                onClick={() => { setUrlInput(bg.url); setBgImageUrl(bg.url) }}
                className="w-12 h-12 rounded-lg bg-cover bg-center border-2 transition-all
                  hover:scale-105 active:scale-95"
                style={{
                  backgroundImage: `url(${bg.url})`,
                  borderColor: bgImageUrl === bg.url ? 'white' : 'transparent',
                }}
                aria-label={bg.label}
                title={bg.label}
              />
            ))}
            <button
              onClick={() => { setUrlInput(''); setBgImageUrl('') }}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs
                text-gray-400 dark:text-white/40 transition-all hover:scale-105
                ${!bgImageUrl ? 'border-white/60 bg-white/20' : 'border-white/20 bg-white/10'}`}
              aria-label="无背景"
              title="无背景"
            >
              无
            </button>
          </div>
        </div>
      </GlassCard>

      {/* 版本信息 */}
      <div className="text-center text-xs text-gray-400 dark:text-white/25 pb-4">
        My Life Board · Phase 1 · v0.1.0
      </div>
    </div>
  )
}

// 预设背景图（Unsplash 免费图）
const PRESET_BG = [
  {
    label: '山脉',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  },
  {
    label: '森林',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
  },
  {
    label: '海洋',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
  },
  {
    label: '城市夜景',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80',
  },
  {
    label: '樱花',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
  },
]
