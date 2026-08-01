import { useState, useCallback } from 'react'

export interface DefinitionEntry {
  word: string
  phonetic?: string
  partOfSpeech: string
  definition: string
  example?: string
}

export type DefinitionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; word: string; translation: string; sourceLang: string; targetLang: string; entries?: DefinitionEntry[] }
  | { status: 'not_found' }
  | { status: 'error' }

// Map language code → MyMemory BCP-47 tag
const MYMEMORY_LANG: Record<string, string> = {
  en: 'en-US', zh: 'zh-CN', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', es: 'es-ES', fr: 'fr-FR',
  de: 'de-DE', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', ru: 'ru-RU',
  ar: 'ar',     pt: 'pt-BR', hi: 'hi',    tr: 'tr',
  nl: 'nl',     pl: 'pl',    vi: 'vi',    th: 'th',
  id: 'id',     ms: 'ms',    sv: 'sv',    da: 'da',
  no: 'no',     fi: 'fi',    cs: 'cs',    hu: 'hu',
  ro: 'ro',     uk: 'uk',    he: 'he',    el: 'el',
  fa: 'fa',     bn: 'bn',    sw: 'sw',    tl: 'tl',
  ur: 'ur',     ta: 'ta',    te: 'te',    bg: 'bg',
  hr: 'hr',     sk: 'sk',    lt: 'lt',    lv: 'lv',
  et: 'et',     sl: 'sl',    sr: 'sr',    ca: 'ca',
  af: 'af',     sq: 'sq',    hy: 'hy',    az: 'az',
  ka: 'ka',     kk: 'kk',    mk: 'mk',    mn: 'mn',
  my: 'my',     km: 'km',    lo: 'lo',    si: 'si',
  ne: 'ne',     pa: 'pa',    gu: 'gu',    ml: 'ml',
}

export const LANG_NAMES: Record<string, string> = {
  // App languages
  en: 'English',     zh: 'Chinese',    'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
  es: 'Spanish',    fr: 'French',
  de: 'German',      it: 'Italian',    ja: 'Japanese',   ko: 'Korean',
  ru: 'Russian',
  // Major world languages
  ar: 'Arabic',      pt: 'Portuguese', hi: 'Hindi',      tr: 'Turkish',
  nl: 'Dutch',       pl: 'Polish',     vi: 'Vietnamese', th: 'Thai',
  id: 'Indonesian',  ms: 'Malay',      sv: 'Swedish',    da: 'Danish',
  no: 'Norwegian',   fi: 'Finnish',    cs: 'Czech',      hu: 'Hungarian',
  ro: 'Romanian',    uk: 'Ukrainian',  he: 'Hebrew',     el: 'Greek',
  fa: 'Persian',     bn: 'Bengali',    sw: 'Swahili',    tl: 'Filipino',
  ur: 'Urdu',        ta: 'Tamil',      te: 'Telugu',     bg: 'Bulgarian',
  hr: 'Croatian',    sk: 'Slovak',     lt: 'Lithuanian', lv: 'Latvian',
  et: 'Estonian',    sl: 'Slovenian',  sr: 'Serbian',    ca: 'Catalan',
  af: 'Afrikaans',   sq: 'Albanian',   hy: 'Armenian',   az: 'Azerbaijani',
  ka: 'Georgian',    kk: 'Kazakh',     mk: 'Macedonian', mn: 'Mongolian',
  my: 'Burmese',     km: 'Khmer',      lo: 'Lao',        si: 'Sinhala',
  ne: 'Nepali',      pa: 'Punjabi',    gu: 'Gujarati',   ml: 'Malayalam',
}

export const SUPPORTED_LANGS = Object.keys(LANG_NAMES)

async function translate(text: string, srcCode: string, targetCode: string): Promise<string | null> {
  const src = MYMEMORY_LANG[srcCode] ?? srcCode
  const tgt = MYMEMORY_LANG[targetCode] ?? targetCode
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const translated: string | undefined = data?.responseData?.translatedText
    if (!translated) return null
    // MyMemory echoes input when it can't translate
    if (translated.toLowerCase().trim() === text.toLowerCase().trim()) return null
    // MyMemory returns all-caps ASCII error strings on failure.
    // Only apply this check to Latin-script results — Chinese/Japanese/Korean/Arabic etc.
    // have no case distinction so they always appear "uppercase".
    const hasLatinLetters = /[a-zA-Z]/.test(translated)
    if (hasLatinLetters && translated === translated.toUpperCase() && translated.length > 20) return null
    return translated
  } catch {
    return null
  }
}

async function fetchEnglishDictEntries(word: string): Promise<DefinitionEntry[]> {
  if (word.includes(' ')) return []
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    )
    if (!res.ok) return []
    const data = await res.json()
    const entries: DefinitionEntry[] = []
    const phonetic =
      data[0]?.phonetic ?? data[0]?.phonetics?.find((p: { text?: string }) => p.text)?.text
    for (const item of data) {
      for (const meaning of item.meanings ?? []) {
        for (const def of meaning.definitions?.slice(0, 2) ?? []) {
          entries.push({
            word: item.word ?? word,
            phonetic,
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example,
          })
          if (entries.length >= 4) break
        }
        if (entries.length >= 4) break
      }
      if (entries.length >= 4) break
    }
    return entries
  } catch {
    return []
  }
}

export function useWordDefinition() {
  const [state, setState] = useState<DefinitionState>({ status: 'idle' })

  const lookup = useCallback(async (word: string, sourceLang: string, targetLang: string) => {
    // Strip leading/trailing punctuation but keep interior spaces (for phrases)
    const clean = word.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '').trim()
    if (!clean) return

    setState({ status: 'loading' })

    try {
      // English → English: show dictionary definition
      if (sourceLang === 'en' && targetLang === 'en') {
        const entries = await fetchEnglishDictEntries(clean)
        if (entries.length > 0) {
          setState({ status: 'found', word: clean, translation: clean, sourceLang, targetLang, entries })
        } else {
          setState({ status: 'not_found' })
        }
        return
      }

      // Any → English: translate then optionally enrich with dict
      if (targetLang === 'en') {
        const translation = sourceLang === 'en' ? clean : await translate(clean, sourceLang, 'en')
        if (!translation) { setState({ status: 'not_found' }); return }

        let entries: DefinitionEntry[] | undefined
        const words = translation.trim().split(/\s+/)
        if (words.length <= 2) {
          const dict = await fetchEnglishDictEntries(words[0])
          if (dict.length > 0) entries = dict
        }
        setState({ status: 'found', word: clean, translation, sourceLang, targetLang, entries })
        return
      }

      // Same language (non-English): explain the word in its own language by
      // translating to English then back — produces a native-language definition.
      if (sourceLang === targetLang && sourceLang !== 'en') {
        const englishMeaning = await translate(clean, sourceLang, 'en')
        if (!englishMeaning) { setState({ status: 'not_found' }); return }
        const nativeDef = await translate(englishMeaning, 'en', sourceLang)
        // Show the native definition; fall back to English meaning if back-translate fails
        setState({
          status: 'found',
          word: clean,
          translation: nativeDef ?? englishMeaning,
          sourceLang,
          targetLang,
        })
        return
      }

      // English → other language OR non-English → non-English: direct translation
      const translation = await translate(clean, sourceLang, targetLang)
      if (!translation) { setState({ status: 'not_found' }); return }
      setState({ status: 'found', word: clean, translation, sourceLang, targetLang })
    } catch {
      setState({ status: 'error' })
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, lookup, reset }
}
