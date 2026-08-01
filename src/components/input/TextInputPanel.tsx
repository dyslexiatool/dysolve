import { useState } from 'react'
import { PasteTextTab } from './PasteTextTab'
import { ImageUploadTab } from './ImageUploadTab'
import { CameraTab } from './CameraTab'
import { useLanguage } from '../../i18n'
import type { RecentText } from '../../hooks/useRecentTexts'

type Tab = 'paste' | 'image' | 'camera'

interface TextInputPanelProps {
  onTextLoaded: (text: string) => void
  onDismiss?: () => void
  hasText: boolean
  ocrLang?: string
  recent?: RecentText[]
  onRemoveRecent?: (id: string) => void
}

export function TextInputPanel({ onTextLoaded, onDismiss, hasText, ocrLang, recent, onRemoveRecent }: TextInputPanelProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>('paste')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'paste',
      label: t.input.pasteTab,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      ),
    },
    {
      id: 'image',
      label: t.input.imageTab,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      id: 'camera',
      label: t.input.cameraTab ?? 'Camera',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden w-full">
      <div className="theme-bg absolute inset-0 -z-20" />
      <div className="theme-overlay absolute inset-0 -z-10" />
      <div className="w-full max-w-2xl">
        {/* Panel header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t.input.title}</h2>
            <p className="text-slate-500 dark:text-slate-300 text-base mt-1">{t.input.sub}</p>
          </div>
          {hasText && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-1 flex gap-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
          {activeTab === 'paste' && <PasteTextTab onTextLoaded={onTextLoaded} recent={recent} onRemoveRecent={onRemoveRecent} />}
          {activeTab === 'image' && <ImageUploadTab onTextLoaded={onTextLoaded} ocrLang={ocrLang} />}
          {activeTab === 'camera' && <CameraTab onTextLoaded={onTextLoaded} ocrLang={ocrLang} />}
        </div>
      </div>
    </div>
  )
}
