import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n'
import { LANGUAGES } from '../../i18n/languages'
import { LANG_NAMES } from '../../hooks/useWordDefinition'

const LANG_COUNT = LANGUAGES.length                  // 20
const TRANSLATION_TARGET_COUNT = Object.keys(LANG_NAMES).length  // 60+

// ── Animated number counter ──────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="text-3xl font-extrabold bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent leading-none">
      {display}{suffix}
    </div>
  )
}

// ── Marquee strip ────────────────────────────────────────────────────────────
function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  // Duplicate items to create seamless loop
  const items = [...LANGUAGES, ...LANGUAGES]
  return (
    <div className="marquee-container py-1 overflow-hidden">
      <div className={reverse ? 'animate-marquee-right' : 'animate-marquee-left'} style={{ display: 'flex', width: 'max-content' }}>
        {items.map((lang, i) => (
          <span
            key={`${lang.code}-${i}`}
            className="inline-flex items-center gap-1.5 mx-3 px-3 py-1.5 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-full border border-slate-100 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm whitespace-nowrap"
          >
            <span className="text-base leading-none">{lang.flag}</span>
            {lang.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
interface HeroSectionProps {
  onGetStarted: () => void
  onScreening: () => void
  onTests: () => void
}

export function HeroSection({ onGetStarted, onScreening, onTests }: HeroSectionProps) {
  const { t } = useLanguage()
  const h = t.hero

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      ),
      title: h.featureFonts[0],
      desc: h.featureFonts[1],
      color: 'sky',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
      ),
      title: h.featureFocus[0],
      desc: h.featureFocus[1],
      color: 'violet',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
        </svg>
      ),
      title: h.featureTTS[0],
      desc: h.featureTTS[1],
      color: 'emerald',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      title: h.featureScreening[0],
      desc: h.featureScreening[1],
      color: 'amber',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      title: h.featureTranslate?.[0] ?? 'Translate & Define',
      desc: h.featureTranslate?.[1] ?? `Tap any word or phrase for meaning, translation, and examples in ${TRANSLATION_TARGET_COUNT}+ languages`,
      color: 'rose',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5h7"/><path d="M9 3v2c0 4.418-2.239 8-5 8"/>
          <path d="M5 9c0 2.144 2.952 3.908 6.7 4"/><path d="M12 20l4-9 4 9"/><path d="M19.1 18h-6.2"/>
        </svg>
      ),
      title: h.featureLang?.[0] ?? `${LANG_COUNT} Languages`,
      desc: h.featureLang?.[1] ?? 'Full UI, dyslexia screening, and personalised reading plans in your language',
      color: 'sky',
    },
  ]

  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    sky:     { bg: 'bg-sky-50',     text: 'text-sky-500',     ring: 'ring-sky-100' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-500',  ring: 'ring-violet-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', ring: 'ring-emerald-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-500',   ring: 'ring-amber-100' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-500',    ring: 'ring-rose-100' },
  }

  const stats = [
    { target: LANG_COUNT,                 suffix: '+', label: h.statLangs    ?? 'Languages' },
    { target: TRANSLATION_TARGET_COUNT,   suffix: '+', label: h.statTargets  ?? 'Translation Targets' },
    { target: 25,                         suffix: '',  label: h.statFonts    ?? 'Reading Fonts' },
    { target: 100,                        suffix: '%', label: h.statPrivate  ?? 'Private & Free' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-12 relative overflow-hidden w-full">

      {/* Background photo */}
      <div className="theme-bg absolute inset-0 -z-20" />
      {/* White wash / dark overlay over photo */}
      <div className="theme-overlay absolute inset-0 -z-10" />

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-rose-200/15 blur-3xl" />
      </div>

      <div className="w-full max-w-4xl mx-auto text-center space-y-10 relative">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-900/40 border border-sky-100 dark:border-sky-800 rounded-full px-4 py-1.5 text-sm font-medium text-sky-700 dark:text-sky-300">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          {h.badge}
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <p className="text-lg sm:text-xl font-semibold tracking-wide uppercase text-sky-500">
            {h.tagline ?? 'Solve your reading challenges'}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            {h.h1a}{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              {h.h1b}
            </span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">{h.sub}</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGetStarted}
            className="animate-glow-pulse inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            {h.cta1}
          </button>
          <button
            onClick={onScreening}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 border border-slate-200 dark:border-slate-600 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {h.cta2}
          </button>
        </div>

        {/* Animated stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-4 shadow-sm text-center">
              <AnimatedNumber target={s.target} suffix={s.suffix} />
              <div className="text-xs font-medium text-slate-500 dark:text-slate-300 mt-1.5 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Language marquee */}
        <div className="space-y-2 -mx-4 sm:-mx-6">
          <MarqueeRow reverse={false} />
          <MarqueeRow reverse={true} />
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap px-2">
            {h.everythingYouNeed ?? 'Everything you need'}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Feature cards — 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => {
            const c = colorMap[f.color] ?? colorMap.sky
            return (
              <div
                key={f.title}
                className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700 p-5 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-3 ${c.text}`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* ── All Tests promo ───────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl shadow-violet-200/40 dark:shadow-violet-900/30 cursor-pointer group"
          onClick={onTests}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onTests()}
        >
          {/* Decorative orbs inside card */}
          <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 text-left">
            {/* Left: test icons grid */}
            <div className="flex-shrink-0 grid grid-cols-4 gap-2">
              {['🧠', '🎯', '❤️', '🔷', '🎨', '📖', '⭕', '💎'].map((ic, i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl group-hover:scale-105 transition-transform"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  {ic}
                </div>
              ))}
            </div>

            {/* Right: text + CTA */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {h.allTestsBadge ?? '28 tests available now'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                {h.allTestsTitle ?? 'Explore Your Mind'}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                {h.allTestsSub ?? 'IQ, MBTI, Attachment Style, DISC, Enneagram, ADHD screening, Depression screening, and 21 more — all free, private, and available in 20 languages.'}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onTests() }}
                className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-violet-50 active:scale-95 transition-all shadow-lg"
              >
                {h.allTestsCta ?? 'Browse All Tests'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Free note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">{h.freeNote}</p>
      </div>
    </div>
  )
}
