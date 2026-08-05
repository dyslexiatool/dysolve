import { useState, useEffect, useRef } from 'react'
import { useWordDefinition, LANG_NAMES } from '../../hooks/useWordDefinition'
import { useLanguage } from '../../i18n'
import { LANGUAGES } from '../../i18n/languages'

// Derive app language codes from the LANGUAGES registry (all 20 languages)
// Use language codes (e.g. 'zh-CN', 'zh-TW') not ttsLang prefixes so both Chinese
// variants appear as distinct entries and map correctly through MYMEMORY_LANG.
const APP_LANG_CODES = LANGUAGES.map((l) => l.code).filter((code) => code in LANG_NAMES)

// Full BCP-47 locale fallbacks for languages that may have no installed voice
const LANG_LOCALE: Record<string, string> = {
  en: 'en-US', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', zh: 'zh-CN',
  es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', ja: 'ja-JP',
  ko: 'ko-KR', ru: 'ru-RU', pt: 'pt-BR', hi: 'hi-IN', tr: 'tr-TR',
  nl: 'nl-NL', pl: 'pl-PL', vi: 'vi-VN', id: 'id-ID', uk: 'uk-UA',
  el: 'el-GR', sv: 'sv-SE',
}

function speakWord(text: string, langCode: string) {
  const u = new SpeechSynthesisUtterance(text)
  const prefix = langCode.split('-')[0].toLowerCase()
  u.lang = LANG_LOCALE[langCode] ?? langCode
  u.rate = 0.75
  u.pitch = 1.0
  const voices = window.speechSynthesis.getVoices()
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(prefix))
  const preferred = langVoices.find(v =>
    v.name.includes('Google') || v.name.includes('Neural') ||
    v.name.includes('Natural') || v.name.includes('Premium') ||
    v.name.includes('Samantha') || v.name.includes('Daniel')
  ) ?? langVoices.find(v => v.localService) ?? langVoices[0] ?? null
  if (preferred) {
    u.voice = preferred
    u.lang = preferred.lang  // use the voice's own full locale
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
const MORE_LANGS = Object.keys(LANG_NAMES)
  .filter((l) => !APP_LANG_CODES.includes(l))
  .sort((a, b) => LANG_NAMES[a].localeCompare(LANG_NAMES[b]))

type Unit = 'word' | 'sentence' | 'paragraph'

interface PopupPosition { x: number; y: number }

interface WordDefinitionPopupProps {
  word: string
  sentence: string
  paragraph: string
  position: PopupPosition
  sourceLang: string
  wordIndex: number | null
  isBolded?: boolean
  onToggleBold?: () => void
  onClose: () => void
}

export function WordDefinitionPopup({
  word, sentence, paragraph, position, sourceLang, wordIndex, isBolded, onToggleBold, onClose,
}: WordDefinitionPopupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const p = t.popup
  const { state, lookup } = useWordDefinition()
  const [unit, setUnit] = useState<Unit>('word')
  const [targetLang, setTargetLang] = useState(sourceLang === 'en' ? 'en' : sourceLang)
  const [fromLang, setFromLang] = useState(sourceLang)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { setFromLang(sourceLang) }, [sourceLang])

  useEffect(() => {
    const textToLookup = unit === 'word' ? word : unit === 'sentence' ? sentence : paragraph
    if (textToLookup) lookup(textToLookup, fromLang, targetLang)
  }, [unit, fromLang, targetLang, word, sentence, paragraph]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const popupW = expanded ? Math.min(640, window.innerWidth - 24) : 440
  const bodyMaxH = expanded ? Math.floor(window.innerHeight * 0.65) : 320

  // Viewport-aware positioning
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    left: Math.max(8, Math.min(position.x - popupW / 2, window.innerWidth - popupW - 8)),
    top: position.y + 14,
    width: popupW,
    transition: 'width 0.2s ease',
  }
  if (position.y + 14 + 300 > window.innerHeight) {
    style.top = undefined
    style.bottom = window.innerHeight - position.y + 8
  }

  const labels = {
    word:        p?.wordTab      ?? 'Word / Phrase',
    sentence:    p?.sentenceTab  ?? 'Sentence',
    paragraph:   p?.paragraphTab ?? 'Paragraph',
    fromLabel:   p?.fromLabel    ?? 'From',
    toLabel:     p?.toLabel      ?? 'Translate to',
    loading:     p?.loading      ?? 'Translating…',
    notFound:    p?.notFound     ?? 'No result found',
    notFoundSub: p?.notFoundSub  ?? 'Try a different word, phrase or language',
    errorMsg:    p?.errorMsg     ?? 'Could not load result',
    errorSub:    p?.errorSub     ?? 'Check your internet connection and try again',
    englishDef:  p?.englishDef   ?? 'English Definition',
  }

  const units: Unit[] = ['word', 'sentence', 'paragraph']
  const unitLabels: Record<Unit, string> = {
    word: labels.word, sentence: labels.sentence, paragraph: labels.paragraph,
  }

  // All languages allowed as target including same-as-source (produces a native-language definition)
  const appToOptions = APP_LANG_CODES
  const moreToOptions = MORE_LANGS
  const srcForDisplay = state.status === 'found'
    ? (LANG_NAMES[state.sourceLang] ?? state.sourceLang)
    : (LANG_NAMES[fromLang] ?? fromLang)

  return (
    <div
      ref={ref}
      style={style}
      className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      role="dialog"
      aria-label={`Look up: ${word}`}
    >
      {/* ── Header ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500 shrink-0 mt-0.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span className="text-sm font-bold text-slate-800 truncate">{word}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Bold / Unbold — only for single-word clicks */}
            {wordIndex != null && onToggleBold && (
              <button
                onClick={onToggleBold}
                className={`transition-colors p-1.5 rounded-lg text-xs font-bold leading-none ${
                  isBolded
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
                aria-label={isBolded ? (p?.removeBold ?? 'Remove bold') : (p?.boldWord ?? 'Bold this word')}
                title={isBolded ? (p?.removeBold ?? 'Remove bold') : (p?.boldWord ?? 'Bold for revision')}
              >
                B
              </button>
            )}
            {/* Expand / Collapse */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-white/80"
              aria-label={expanded ? (p?.collapse ?? 'Collapse popup') : (p?.expandMore ?? 'Expand popup')}
              title={expanded ? (p?.collapse ?? 'Collapse') : (p?.expandMore ?? 'Expand for more space')}
            >
              {expanded ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                  <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              )}
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-white/80"
              aria-label="Close"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Unit tabs */}
        <div className="flex gap-1 mt-2.5">
          {units.map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                unit === u
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
              }`}
            >
              {unitLabels[u]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Language selectors ── */}
      <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/60 border-r border-slate-100">
          <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{labels.fromLabel}</span>
          <select
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
            className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-300 cursor-pointer"
          >
            <optgroup label={p?.appLangs ?? 'App languages'}>
              {APP_LANG_CODES.map((lang) => (
                <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>
              ))}
            </optgroup>
            <optgroup label={p?.moreLangs ?? 'More languages'}>
              {MORE_LANGS.map((lang) => (
                <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/40">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-400 shrink-0">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-300 cursor-pointer"
          >
            <optgroup label={p?.appLangs ?? 'App languages'}>
              {appToOptions.map((lang) => (
                <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>
              ))}
            </optgroup>
            <optgroup label={p?.moreLangs ?? 'More languages'}>
              {moreToOptions.map((lang) => (
                <option key={lang} value={lang}>{LANG_NAMES[lang]}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="px-4 py-3 overflow-y-auto transition-all duration-200"
        style={{ maxHeight: bodyMaxH }}
      >
        {state.status === 'loading' && (
          <div className="flex items-center justify-center gap-2 py-5">
            <div className="w-4 h-4 rounded-full border-2 border-sky-300 border-t-sky-600 animate-spin" />
            <span className="text-sm text-slate-400">{labels.loading}</span>
          </div>
        )}

        {state.status === 'not_found' && (
          <div className="py-4 text-center space-y-1">
            <p className="text-sm font-medium text-slate-500">{labels.notFound}</p>
            <p className="text-xs text-slate-400">{labels.notFoundSub}</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="py-4 text-center space-y-1">
            <p className="text-sm font-medium text-slate-500">{labels.errorMsg}</p>
            <p className="text-xs text-slate-400">{labels.errorSub}</p>
          </div>
        )}

        {state.status === 'found' && (
          <div className="space-y-3">

            {(state.sourceLang !== state.targetLang || state.sourceLang !== 'en') && state.translation && (
              <div className="bg-sky-50 rounded-xl px-3 py-2.5 border border-sky-100">
                <p className="text-xs font-semibold text-sky-500 uppercase tracking-wide mb-1.5">
                  {state.sourceLang === state.targetLang
                    ? `${srcForDisplay} ${p?.nativeDef ?? 'definition'}`
                    : `${srcForDisplay} → ${LANG_NAMES[state.targetLang] ?? state.targetLang}`}
                </p>
                <p className={`font-semibold text-slate-800 leading-snug ${expanded ? 'text-base' : 'text-sm'}`}>
                  {state.translation}
                </p>
              </div>
            )}

            {/* Pronunciation row — IPA for English, speaker button for all languages */}
            {unit === 'word' && (
              <div className="flex items-center gap-2">
                {state.sourceLang === 'en' && state.targetLang === 'en' && state.entries?.[0]?.phonetic && (
                  <>
                    <span className="text-xs text-slate-400">{p?.howToSay ?? 'How to say it:'}</span>
                    <span className="text-xs text-sky-500 font-mono">{state.entries[0].phonetic}</span>
                  </>
                )}
                <button
                  onClick={() => speakWord(word, fromLang)}
                  title={p?.hearWord ?? 'Hear pronunciation'}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}

            {state.entries && state.entries.length > 0 && (
              <div className="space-y-3">
                {(state.sourceLang !== state.targetLang || state.sourceLang !== 'en') && (
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {labels.englishDef}
                  </p>
                )}
                {state.entries.map((entry, i) => (
                  <div key={i} className={i > 0 ? 'pt-3 border-t border-slate-100' : ''}>
                    <span className="inline-block text-xs font-semibold text-white bg-sky-400 rounded-full px-2 py-0.5 mb-1.5">
                      {entry.partOfSpeech}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{entry.definition}</p>
                    {entry.example && (
                      <p className="mt-1.5 text-xs text-slate-400 italic leading-relaxed">
                        "{entry.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Footer: context text for sentence/paragraph tabs ── */}
      {unit !== 'word' && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          <p className={`text-xs text-slate-400 italic leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {unit === 'sentence' ? sentence : paragraph}
          </p>
        </div>
      )}
    </div>
  )
}
