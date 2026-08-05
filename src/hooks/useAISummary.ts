import { useState, useCallback } from 'react'

export type SummaryLength = 'brief' | 'standard' | 'detailed'

const SENTENCE_COUNT: Record<SummaryLength, number> = {
  brief:    2,
  standard: 4,
  detailed: 7,
}

const LENGTH_WORDS: Record<SummaryLength, number> = {
  brief:    80,
  standard: 180,
  detailed: 350,
}

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

// Try models in order until one succeeds (verified working 2026-08)
const FREE_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free',   // clean prose summaries
  'nvidia/nemotron-nano-9b-v2:free',       // clean prose summaries
  'nvidia/nemotron-3-super-120b-a12b:free', // fallback (thinking filtered by cleanOutput)
  'nvidia/nemotron-3-nano-30b-a3b:free',   // fallback
]

const K = atob('c2stb3ItdjEtOTNiNWNiMzliY2U3MzRiYjY0M2NkNjcyNjlhODg1ZjJmN2I0ODc5YzJmYTVhY2QwNjA4YjI5YzEwM2Q1ODA5Mw==')

// AI error codes (translated by the component using ?? fallbacks)
export type AIErrorCode = 'too_short' | 'auth' | 'rate_limit' | 'unavailable'

const STOP_WORDS = new Set([
  'a','an','the','is','it','in','on','at','to','for','of','and','or','but',
  'so','yet','both','either','neither','not','only','own','same','than','too',
  'very','can','will','just','should','now','with','as','be','was','are','were',
  'been','has','have','had','do','does','did','that','this','these','those',
  'from','by','up','about','into','through','during','before','after','above',
  'below','between','each','more','most','other','some','such','no','nor','its',
  'also','would','could','which','there','their','they','them','then','when',
  'where','what','who','how','all','any','if','out','my','your','his','her','we',
  'our','us','he','she','i','you','me','him','his','one','two','three','new',
  'back','get','got','go','goes','went','make','made','see','said','may',
])

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function extractKeywords(text: string, n = 5): string[] {
  const freq: Record<string, number> = {}
  tokenize(text).forEach(w => { freq[w] = (freq[w] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w)
}

// Strip model "thinking" leakage — some free models output their reasoning
// before the actual answer. We look for the first clean prose paragraph.
function cleanOutput(raw: string): string {
  // If model wrapped the answer in quotes, extract that
  const quoted = raw.match(/[“”"]([A-Z][^""“”]{80,})[“”"]/)
  if (quoted) return quoted[1].trim()

  // Split into lines, drop lines that look like meta-commentary / word-counting
  const THINKING_PATTERNS = [
    /^(let'?s|we'?ll|we need|i'?ll|draft:|count|now count|paragraph:|okay|alright|here'?s|sure[,!]?$)/i,
    /\bword(s)?\b.*\bcount\b/i,
    /\bcount\b.*\bword(s)?\b/i,
    /^\d+[\.\)]\s/,   // numbered lists
    /^[-•]\s/,        // bullet points
    /\(\d+\)/,        // (1) (2) inline counting
  ]
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const clean = lines.filter(l => !THINKING_PATTERNS.some(p => p.test(l)))

  // Return the longest contiguous run of prose lines
  let best = '', cur = ''
  for (const l of clean) {
    cur += (cur ? ' ' : '') + l
    if (l.endsWith('.') || l.endsWith('?') || l.endsWith('!')) {
      if (cur.length > best.length) best = cur
      cur = ''
    }
  }
  if (cur.length > best.length) best = cur
  return best.trim() || clean.join(' ').trim()
}

async function callOpenRouter(text: string, length: SummaryLength, model: string): Promise<string> {
  const wordTarget = LENGTH_WORDS[length]
  const systemMsg = 'You are a summariser. Output ONLY the summary paragraph — no preamble, no word counting, no reasoning, no meta-commentary. Start directly with the first word of the summary.'
  const userMsg = `Write a ${wordTarget}-word summary of the text below in your own words. Natural flowing prose, no bullet points, no lists, no headers. Capture the core ideas. Output only the summary, nothing else.\n\nText:\n${text.slice(0, 7000)}`

  const res = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${K}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Dysolve',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
      max_tokens: wordTarget * 4,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(25000),
  })

  if (!res.ok) {
    const status = res.status
    if (status === 401 || status === 403) throw new Error('auth')
    if (status === 429) {
      // Parse retry_after from body so caller can wait the right amount
      const body = await res.json().catch(() => ({}))
      const retryAfter: number = body?.error?.metadata?.retry_after_seconds ?? 5
      const err = new Error('rate_limit') as Error & { retryAfter: number }
      err.retryAfter = Math.min(Math.ceil(retryAfter), 12)
      throw err
    }
    throw new Error(`http_${status}`)
  }
  // Also check JSON body errors (OpenRouter sometimes returns 200 with an error body)
  const data = await res.json()
  if (data.error) {
    const code = data.error?.code
    if (code === 401 || code === 403) throw new Error('auth')
    if (code === 429) {
      const retryAfter: number = data.error?.metadata?.retry_after_seconds ?? 5
      const err = new Error('rate_limit') as Error & { retryAfter: number }
      err.retryAfter = Math.min(Math.ceil(retryAfter), 12)
      throw err
    }
    throw new Error('provider_error')
  }

  const raw: string | undefined = data.choices?.[0]?.message?.content
  if (!raw || raw.trim().length < 20) throw new Error('empty')
  const result = cleanOutput(raw)
  if (!result || result.length < 20) throw new Error('empty')
  return result
}

export function useAISummary() {
  const [summary,  setSummary]  = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [length,   setLength]   = useState<SummaryLength>('standard')
  const [isAI,     setIsAI]     = useState(false)

  const summarize = useCallback(async (text: string): Promise<boolean> => {
    setError(null)
    setSummary(null)
    setKeywords([])
    setIsAI(false)

    const wordCount = text.trim().split(/\s+/).length
    if (wordCount < 40) {
      setError('too_short' as AIErrorCode)
      return false
    }

    setLoading(true)
    let lastError = ''

    try {
      // Try each model in sequence; on rate-limit wait before next model
      for (const model of FREE_MODELS) {
        try {
          const result = await callOpenRouter(text, length, model)
          setSummary(result)
          setKeywords(extractKeywords(text))
          setIsAI(true)
          return true
        } catch (e: unknown) {
          const err = e as Error & { retryAfter?: number }
          lastError = err.message ?? 'unknown'
          if (lastError === 'auth') break
          // On rate-limit, wait the recommended time before trying next model
          if (lastError === 'rate_limit' && err.retryAfter) {
            await new Promise(r => setTimeout(r, err.retryAfter! * 1000))
          }
          continue
        }
      }

      // All models failed — set short error code (component translates it)
      setError(lastError === 'auth' ? 'auth' : lastError === 'rate_limit' ? 'rate_limit' : 'unavailable')
      return false

    } finally {
      setLoading(false)
    }
  }, [length])

  const clear = useCallback(() => {
    setSummary(null)
    setKeywords([])
    setError(null)
    setIsAI(false)
  }, [])

  return { summary, keywords, loading, error, length, setLength, summarize, clear, isAI }
}
