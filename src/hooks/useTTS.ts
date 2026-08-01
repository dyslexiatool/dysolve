import { useState, useRef, useCallback, useEffect } from 'react'
import { TTSState } from '../types'

const VOICE_STORAGE_KEY = 'readease-tts-voice-uri'

function buildWordOffsets(text: string): number[] {
  const offsets: number[] = []
  let i = 0
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++
    if (i < text.length) {
      offsets.push(i)
      while (i < text.length && !/\s/.test(text[i])) i++
    }
  }
  return offsets
}

// Score a voice for quality — prefer Google/natural voices, then local, then network
function voiceQualityScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase()
  if (name.includes('google')) return 3
  if (name.includes('natural') || name.includes('enhanced') || name.includes('premium')) return 2
  if (v.localService) return 1
  return 0
}

// Find the best voice for a given BCP-47 language prefix (e.g. 'zh', 'en', 'fr')
function pickBestVoice(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | null {
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()))
  if (matching.length === 0) return null
  return matching.sort((a, b) => voiceQualityScore(b) - voiceQualityScore(a))[0]
}

export function useTTS(text: string, ttsLangCode = 'en', rate = 0.88) {
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: null,
  })
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string>(() => {
    try { return localStorage.getItem(VOICE_STORAGE_KEY) ?? '' } catch { return '' }
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordOffsetsRef = useRef<number[]>([])
  const boundaryFiredRef = useRef(false)
  const boundaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chromeKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const voiceURIRef = useRef(selectedVoiceURI)
  const prevLangCode = useRef(ttsLangCode)

  // Chrome bug: speechSynthesis silently stops after ~15s. pause()+resume() every 14s keeps it alive.
  function startChromeKeepAlive() {
    stopChromeKeepAlive()
    chromeKeepAliveRef.current = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause()
        speechSynthesis.resume()
      }
    }, 14000)
  }
  function stopChromeKeepAlive() {
    if (chromeKeepAliveRef.current) {
      clearInterval(chromeKeepAliveRef.current)
      chromeKeepAliveRef.current = null
    }
  }

  // Load voices and auto-select best voice for the current language
  useEffect(() => {
    function loadVoices() {
      const voices = speechSynthesis.getVoices()
      if (voices.length === 0) return

      // Sort: matching language first, then by quality score, then rest
      const sorted = [...voices].sort((a, b) => {
        const aMatch = a.lang.toLowerCase().startsWith(ttsLangCode.toLowerCase()) ? 1 : 0
        const bMatch = b.lang.toLowerCase().startsWith(ttsLangCode.toLowerCase()) ? 1 : 0
        if (bMatch !== aMatch) return bMatch - aMatch
        return voiceQualityScore(b) - voiceQualityScore(a)
      })
      setAvailableVoices(sorted)
    }
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [ttsLangCode])

  // When language changes, auto-select the best voice for that language
  useEffect(() => {
    if (prevLangCode.current === ttsLangCode) return
    prevLangCode.current = ttsLangCode

    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) return

    const best = pickBestVoice(voices, ttsLangCode)
    if (best) {
      setVoiceURI(best.voiceURI)
    }
    // Stop any ongoing speech when switching language
    speechSynthesis.cancel()
    setTtsState({ isPlaying: false, isPaused: false, currentWordIndex: null })
  }, [ttsLangCode])

  function setVoiceURI(uri: string) {
    voiceURIRef.current = uri
    setSelectedVoiceURIState(uri)
    try { localStorage.setItem(VOICE_STORAGE_KEY, uri) } catch { /* ignore */ }
  }

  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
      if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
      stopChromeKeepAlive()
    }
  }, [])

  useEffect(() => {
    speechSynthesis.cancel()
    setTtsState({ isPlaying: false, isPaused: false, currentWordIndex: null })
  }, [text])

  const speak = useCallback(() => {
    if (!text) return
    speechSynthesis.cancel()

    wordOffsetsRef.current = buildWordOffsets(text)
    boundaryFiredRef.current = false

    const utterance = new SpeechSynthesisUtterance(text)

    // Resolve voice — prefer stored, then best for current language
    const voices = speechSynthesis.getVoices()
    const stored = voiceURIRef.current
    if (stored) {
      const match = voices.find((v) => v.voiceURI === stored)
      if (match) {
        utterance.voice = match
      } else {
        // Stored voice not available — pick best for language
        const best = pickBestVoice(voices, ttsLangCode)
        if (best) utterance.voice = best
      }
    } else {
      const best = pickBestVoice(voices, ttsLangCode)
      if (best) utterance.voice = best
    }

    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onboundary = (event) => {
      boundaryFiredRef.current = true
      if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
      if (event.name !== 'word') return
      const charIdx = event.charIndex
      const offsets = wordOffsetsRef.current
      let wordIdx = offsets.length - 1
      for (let i = 0; i < offsets.length; i++) {
        if (offsets[i] > charIdx) { wordIdx = i - 1; break }
      }
      setTtsState((prev) => ({ ...prev, currentWordIndex: Math.max(0, wordIdx) }))
    }

    utterance.onend = () => {
      stopChromeKeepAlive()
      setTtsState({ isPlaying: false, isPaused: false, currentWordIndex: null })
    }
    utterance.onerror = () => {
      stopChromeKeepAlive()
      setTtsState({ isPlaying: false, isPaused: false, currentWordIndex: null })
    }

    utteranceRef.current = utterance

    boundaryTimerRef.current = setTimeout(() => {
      if (!boundaryFiredRef.current) {
        setTtsState((prev) => ({ ...prev, currentWordIndex: null }))
      }
    }, 2000)

    speechSynthesis.speak(utterance)
    startChromeKeepAlive()
    setTtsState({ isPlaying: true, isPaused: false, currentWordIndex: null })
  }, [text, ttsLangCode, rate])

  const pause = useCallback(() => {
    speechSynthesis.pause()
    setTtsState((prev) => ({ ...prev, isPlaying: false, isPaused: true }))
  }, [])

  const resume = useCallback(() => {
    speechSynthesis.resume()
    setTtsState((prev) => ({ ...prev, isPlaying: true, isPaused: false }))
  }, [])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
    stopChromeKeepAlive()
    setTtsState({ isPlaying: false, isPaused: false, currentWordIndex: null })
  }, [])

  const totalWords = wordOffsetsRef.current.length || text.trim().split(/\s+/).filter(Boolean).length

  return {
    speak, pause, resume, stop, ttsState, totalWords,
    availableVoices, selectedVoiceURI, setVoiceURI,
  }
}
