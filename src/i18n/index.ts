import { createContext, useContext, useState, ReactNode, createElement } from 'react'
import type { Translations } from './types'
import { en } from './translations/en'
import { zhCN } from './translations/zh-CN'
import { zhTW } from './translations/zh-TW'
import { es } from './translations/es'
import { fr } from './translations/fr'
import { de } from './translations/de'
import { it } from './translations/it'
import { ja } from './translations/ja'
import { ko } from './translations/ko'
import { ru } from './translations/ru'
import { pt } from './translations/pt'
import { hi } from './translations/hi'
import { tr } from './translations/tr'
import { nl } from './translations/nl'
import { pl } from './translations/pl'
import { vi } from './translations/vi'
import { id } from './translations/id'
import { uk } from './translations/uk'
import { el } from './translations/el'
import { sv } from './translations/sv'

const TRANSLATION_MAP: Record<string, Translations> = {
  'en': en, 'zh-CN': zhCN, 'zh-TW': zhTW,
  'es': es, 'fr': fr, 'de': de, 'it': it,
  'ja': ja, 'ko': ko, 'ru': ru,
  'pt': pt, 'hi': hi, 'tr': tr, 'nl': nl, 'pl': pl,
  'vi': vi, 'id': id, 'uk': uk, 'el': el, 'sv': sv,
}

const STORAGE_KEY = 'readease-language'

function getDefaultLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && TRANSLATION_MAP[stored]) return stored
  } catch { /* ignore */ }
  // Browser language hint — exact match first so zh-TW isn't swallowed by zh-CN's 'zh' prefix
  const browserLang = navigator.language
  const exact = Object.keys(TRANSLATION_MAP).find((code) => browserLang === code)
  if (exact) return exact
  const prefix = Object.keys(TRANSLATION_MAP).find(
    (code) => browserLang.startsWith(code.split('-')[0])
  )
  return prefix ?? 'en'
}

interface LangContextValue {
  langCode: string
  t: Translations
  setLang: (code: string) => void
}

const LangContext = createContext<LangContextValue>({
  langCode: 'en',
  t: en,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [langCode, setLangCode] = useState(getDefaultLang)

  function setLang(code: string) {
    if (!TRANSLATION_MAP[code]) return
    setLangCode(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
  }

  return createElement(
    LangContext.Provider,
    { value: { langCode, t: TRANSLATION_MAP[langCode] ?? en, setLang } },
    children
  )
}

export function useLanguage() {
  return useContext(LangContext)
}

/** Simple placeholder interpolation: t.foo.replace('{score}', '72') */
export function interp(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce<string>(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template
  )
}
