import { useState } from 'react'
import { useLanguage } from '../../i18n'
import { ALL_TESTS, COMING_SOON_TESTS } from '../../data/tests'
import type { TestDefinition, TestResult } from '../../data/tests/types'
import { TestRunner } from './TestRunner'
import { TestResultView } from './TestResultView'

interface Props {
  onBack: () => void
}

type HubView = 'hub' | 'running' | 'result'

const CATEGORY_ORDER = ['cognitive', 'personality', 'emotional', 'academic', 'mental-health', 'behavioral']

function TestCard({ test, onStart, startLabel, minLabel, questionsLabel, meta }: {
  test: TestDefinition
  onStart: () => void
  startLabel: string
  minLabel: string
  questionsLabel: string
  meta?: { name?: string; tagline?: string; description?: string }
}) {
  const name = meta?.name ?? test.name
  const tagline = meta?.tagline ?? test.tagline
  const description = meta?.description ?? test.description
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group">
      <div className={`h-2 bg-gradient-to-r ${test.color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{test.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">{name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tagline}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-slate-400">
            <span>⏱ ~{test.timeMinutes} {minLabel}</span>
            <span>· {test.questions.length} {questionsLabel}</span>
          </div>
          <button
            onClick={onStart}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${test.color} hover:opacity-90 active:scale-95 transition-all`}
          >
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ComingSoonCard({ item, badge, csMeta }: {
  item: (typeof COMING_SOON_TESTS)[number]
  badge: string
  csMeta?: { name?: string; tagline?: string }
}) {
  const name = csMeta?.name ?? item.name
  const tagline = csMeta?.tagline ?? item.tagline
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-5 opacity-70">
      <div className="flex items-start gap-3">
        <span className="text-2xl grayscale">{item.icon}</span>
        <div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400 text-sm">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tagline}</p>
        </div>
      </div>
      <div className="mt-3">
        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-medium">{badge}</span>
      </div>
    </div>
  )
}

export function AllTestsHub({ onBack }: Props) {
  const { t } = useLanguage()
  const tt = t.tests ?? {}

  const [hubView, setHubView] = useState<HubView>('hub')
  const [activeTest, setActiveTest] = useState<TestDefinition | null>(null)
  const [lastResult, setLastResult] = useState<TestResult | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categoryLabels: Record<string, string> = {
    cognitive:       tt.catCognitive    ?? 'Cognitive & Intelligence',
    personality:     tt.catPersonality  ?? 'Personality',
    emotional:       tt.catEmotional    ?? 'Emotional Intelligence',
    academic:        tt.catAcademic     ?? 'Academic Skills',
    'mental-health': tt.catMentalHealth ?? 'Mental Health Screening',
    behavioral:      tt.catBehavioral   ?? 'Behavioural',
  }

  function startTest(test: TestDefinition) {
    setActiveTest(test)
    setLastResult(null)
    setHubView('running')
  }

  function handleComplete(result: TestResult) {
    setLastResult(result)
    setHubView('result')
  }

  function handleRetake() {
    setLastResult(null)
    setHubView('running')
  }

  function handleBackToHub() {
    setHubView('hub')
    setActiveTest(null)
    setLastResult(null)
  }

  if (hubView === 'running' && activeTest) {
    return <TestRunner test={activeTest} onComplete={handleComplete} onBack={handleBackToHub} onBackToHub={handleBackToHub} />
  }

  if (hubView === 'result' && activeTest && lastResult) {
    return <TestResultView test={activeTest} result={lastResult} onRetake={handleRetake} onBack={handleBackToHub} />
  }

  const filteredTests = activeCategory === 'all'
    ? ALL_TESTS
    : ALL_TESTS.filter(t2 => t2.category === activeCategory)

  const filteredComingSoon = activeCategory === 'all'
    ? COMING_SOON_TESTS
    : COMING_SOON_TESTS.filter(t2 => t2.category === activeCategory)

  const usedCategories = CATEGORY_ORDER.filter(c =>
    ALL_TESTS.some(t2 => t2.category === c) || COMING_SOON_TESTS.some(t2 => t2.category === c)
  )

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ← {tt.backBtn ?? 'Back'}
          </button>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{tt.hubTitle ?? 'All Tests'}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm">
            {tt.hubSub ?? 'Explore your cognitive, emotional, and personality profile through a curated suite of research-inspired assessments.'}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5 text-xs text-amber-700 dark:text-amber-400">
            🎓 {tt.hubDisclaimer ?? 'Educational tools only · Not medical or clinical assessments'}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-300'
            }`}
          >
            {tt.allFilter ?? 'All'}
          </button>
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-300'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Available tests grid */}
        {filteredTests.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              {tt.availableNow ?? 'Available Now'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  onStart={() => startTest(test)}
                  startLabel={tt.startBtn ?? 'Start'}
                  minLabel={tt.minLabel ?? 'min'}
                  questionsLabel={tt.questionsLabel ?? 'questions'}
                  meta={tt.testMeta?.[test.id]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Coming soon grid */}
        {filteredComingSoon.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              {tt.comingSoon ?? 'Coming Soon'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComingSoon.map(item => (
                <ComingSoonCard key={item.id} item={item} badge={tt.comingSoonBadge ?? 'Coming soon'} csMeta={tt.comingSoonMeta?.[item.id]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
