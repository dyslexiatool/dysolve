export interface QTranslation {
  category: string
  text: string
  options: [string, string, string, string]
}

export interface Translations {
  // Meta
  langName: string          // native name e.g. "中文（简体）"
  ocrLang: string           // Tesseract language code e.g. "chi_sim"
  ttsLangCode: string       // BCP-47 prefix for voice filtering e.g. "zh"

  nav: {
    screening: string
    resources: string
    loadText: string
    tagline?: string    // "Dyslexia-Friendly Reader"
    lightMode?: string  // "Light mode" (toggle tooltip)
    darkMode?: string   // "Dark mode" (toggle tooltip)
    preferencesBtn?: string // "Preferences" (gear button tooltip)
    allTests?: string   // "All Tests" (nav button)
  }

  hero: {
    badge: string
    h1a: string             // "Read with"
    h1b: string             // "Confidence"
    sub: string
    cta1: string            // "Start Reading"
    cta2: string            // "Take the Screening Test"
    featureFonts: [string, string]
    featureFocus: [string, string]
    featureTTS: [string, string]
    featureScreening: [string, string]
    freeNote: string
    featureTranslate?: [string, string]
    featureLang?: [string, string]
    statLangs?: string
    statTargets?: string
    statFonts?: string
    statPrivate?: string
    tagline?: string              // "Solve your reading challenges"
    everythingYouNeed?: string    // "Everything you need"
    allTestsBadge?: string        // "28 tests available now"
    allTestsTitle?: string        // "Explore Your Mind"
    allTestsSub?: string          // promo description
    allTestsCta?: string          // "Browse All Tests"
  }

  input: {
    title: string
    sub: string
    pasteTab: string
    imageTab: string
    cameraTab?: string       // "Camera / Scan"
    placeholder: string
    loadBtn: string
    sampleBtn: string
    dropTitle: string
    dropSub: string
    extracting: string
    wait: string
    success: string
    failed: string
    retryBtn: string
    cameraBtnCapture?: string  // "Take Photo"
    cameraBtnRetake?: string   // "Retake"
    cameraStart?: string       // "Start Camera"
    cameraError?: string       // "Camera not available"
    replaceImage?: string      // "Click or drop to replace"
    recentLabel?: string       // "Recent"
  }

  screening: {
    title: string
    sub: string
    notice: string
    stat1Label: string; stat1Sub: string
    stat2Label: string; stat2Sub: string
    stat3Label: string; stat3Sub: string
    startBtn: string
    backBtn: string
    nextBtn: string
    finishBtn: string
    lowRisk: string
    medRisk: string
    highRisk: string
    lowHeadline: string
    medHeadline: string
    highHeadline: string
    lowExplain: string      // use {score}
    medExplain: string      // use {score} {areas}
    highExplain: string     // use {score} {areas}
    breakdownTitle: string
    suggestionsTitle: string
    startReadingBtn: string
    retakeBtn: string
    disclaimer: string
    hookTitle?: string      // "Could it be dyslexia?"
    hookBadge?: string      // "Free · Private · 5 minutes"
    hookQ1?: string
    hookQ2?: string
    hookQ3?: string
    hookFamiliar?: string   // "If any of these feel familiar..."
    questions: QTranslation[]
  }

  plan: {
    title: string
    sub: string
    challengesLabel: string
    strengthsLabel: string
    setupTitle: string
    applyBtn: string
    appliedBtn: string
    strategyTitle: string
    weekTitle: string
    tipsTitle: string
    low: { strategy: string; weeks: [string, string, string, string]; tips: string[] }
    medium: { strategy: string; weeks: [string, string, string, string]; tips: string[] }
    high: { strategy: string; weeks: [string, string, string, string]; tips: string[] }
  }

  sidebar: {
    title: string
    resetBtn: string
    ttsSection: string
    speakBtn: string; pauseBtn: string; resumeBtn: string; stopBtn: string
    voiceLabel: string
    noVoices: string
    speaking: string
    firefoxNote: string
    wordProgress: string   // "{current} of {total}"
    focusSection: string
    enableFocus: string
    focusDesc: string
    stripHeight: string
    fontSection: string
    textSizeSection: string
    fontSizeLabel: string
    lineHeightLabel: string
    lineWidthLabel: string
    spacingSection: string
    letterSpacingLabel: string
    wordSpacingLabel: string
    soundsSection: string
    stopSoundBtn: string
    volumeLabel: string
    bgSection: string
    customLabel: string
    voiceSearch?: string   // "Search voice or language…"
    voiceNoMatch?: string  // "No voices match"
    readingSpeed?: string  // "Reading Speed"
    boldMode?: string      // "Bold Mode"
    boldModeDesc?: string  // "Click any word to bold it"
    followVoice?: string   // "Follow Voice"
    followVoiceDesc?: string // "Focus strip tracks the spoken word"
    bionicMode?: string    // "Bionic Reading"
    bionicModeDesc?: string // "Bold the first half of every word to guide the eye"
    printBtn?: string      // "Print / Save as PDF"
    dragHandle?: string    // "Drag"
    shareLink?: string     // "Share Link"
    linkCopied?: string    // "Link copied!"
    preferencesTitle?: string  // "Reading Preferences"
    languageSection?: string   // "Language"
    shortcutsTitle?: string    // "Keyboard Shortcuts"
    shortcutsNote?: string     // note text
    shortcutPlayPause?: string // "Play / Pause text-to-speech"
    shortcutStop?: string      // "Stop text-to-speech"
    shortcutHelp?: string      // "Show this shortcuts panel"
    streakLabel?: string       // "day streak"
    fontPresetsLabel?: string  // "Quick Size"
    speedNormal?: string       // "Normal"
    speedSlow?: string         // "Slow"
    speedFast?: string         // "Fast"
    chooseGallery?: string     // "Choose from Gallery"
    cameraDesc?: string        // "Scan a document with your camera"
    cameraSub?: string         // "Books, letters, menus, signs — anything with text"
    customColorLabel?: string  // "Custom:" (background colour)
    aiSummarySection?: string     // "AI Summary"
    aiSummaryLengthLabel?: string // "Summary length"
    aiSummaryBrief?: string       // "Brief"
    aiSummaryStandard?: string    // "Standard"
    aiSummaryDetailed?: string    // "Detailed"
    aiSummariseBtn?: string       // "Summarise Text"
    aiResummariseBtn?: string     // "Re-summarise"
    aiSummaryResultLabel?: string // "Summary"
    aiSummaryClear?: string       // "Clear summary"
    aiSummaryNote?: string        // footer note
    aiSummaryTooShort?: string    // error: text too short
    aiSummaryErrAuth?: string     // error: API key invalid
    aiSummaryErrRateLimit?: string // error: rate limit
    aiSummaryErrUnavailable?: string // error: service unavailable
    aiSummaryIllustrated?: string // "Illustrated"
    aiSummaryPlain?: string       // "Plain text"
    aiSummaryViewBtn?: string     // "View Summary"
    noTextYet?: string         // "Your text will appear here"
    wordsLabel?: string        // "words"
    minLabel?: string          // "min"
    flashcardBtn?: string      // "Create Flashcards"
    flashcardTitle?: string    // "Flashcard Revision"
    flashcardBolded?: string   // "{count} bolded words"
    flashcardTranslateTo?: string // "Translate to"
    flashcardLearned?: string  // "{learned}/{total} learned"
    flashcardAllDone?: string  // "All done!"
    flashcardReviewed?: string // "You reviewed all {count} words."
    flashcardRestart?: string  // "Restart"
    flashcardBack?: string     // "Back to reading"
    flashcardOf?: string       // "of"
    flashcardRemaining?: string // "remaining"
    flashcardFlipHint?: string // "Tap card or press Space to flip"
    flashcardTapReveal?: string  // "Tap to reveal"
    flashcardLoading?: string    // "Loading…"
    flashcardCantLoad?: string   // "Could not load definition"
    flashcardPrev?: string       // "Prev"
    flashcardNext?: string       // "Next"
    flashcardGotIt?: string      // "Got it"
    flashcardReveal?: string     // "Reveal answer"
    customColorTitle?: string    // "Pick a custom background colour" (tooltip)
    fontTagDyslexia?: string     // "Dyslexia"
    fontTagAccessibility?: string // "Accessibility"
    fontTagFriendly?: string     // "Friendly"
    fontTagRounded?: string      // "Rounded"
    fontTagClean?: string        // "Clean"
    fontTagMinimal?: string      // "Minimal"
    fontTagCompact?: string      // "Compact"
    fontTagSimple?: string       // "Simple"
    fontTagModern?: string       // "Modern"
    fontTagSerif?: string        // "Serif"
    fontTagReading?: string      // "Reading"
  }

  popup?: {
    wordTab: string        // "Word / Phrase"
    sentenceTab: string    // "Sentence"
    paragraphTab: string   // "Paragraph"
    fromLabel: string      // "From"
    toLabel: string        // "Translate to"
    loading: string        // "Translating…"
    notFound: string       // "No result found"
    notFoundSub: string    // "Try a different word, phrase or language"
    errorMsg: string       // "Could not load result"
    errorSub: string       // "Check your internet connection and try again"
    englishDef: string     // "English Definition"
    appLangs?: string      // "App languages" (optgroup)
    moreLangs?: string     // "More languages" (optgroup)
    removeBold?: string    // "Remove bold" (tooltip)
    boldWord?: string      // "Bold for revision" (tooltip)
    collapse?: string      // "Collapse" (tooltip)
    expandMore?: string    // "Expand for more space" (tooltip)
    nativeDef?: string     // "definition" (e.g. "English definition")
    howToSay?: string      // "How to say it:" (before IPA phonetic)
    hearWord?: string      // "Hear pronunciation" (speaker button tooltip)
  }

  sounds?: {
    [soundId: string]: { label: string; desc: string }
  }

  tests?: {
    hubTitle?: string         // "All Tests"
    hubSub?: string           // "Explore your cognitive..."
    hubDisclaimer?: string    // "Educational tools only..."
    backBtn?: string          // "Back"
    allFilter?: string        // "All"
    availableNow?: string     // "Available Now"
    comingSoon?: string       // "Coming Soon" (section header)
    comingSoonBadge?: string  // "Coming soon" (card badge)
    startBtn?: string         // "Start"
    minLabel?: string         // "min"
    questionsLabel?: string   // "questions"
    questionOf?: string       // "Question {n} of {total}"
    nextBtn?: string          // "Next"
    seeResults?: string       // "See My Results"
    goBack?: string           // "Go back"
    continueBtn?: string      // "I understand — continue"
    importantNotice?: string  // "Important notice"
    yourResults?: string      // "Your Results"
    allTestsBtn?: string      // "All Tests" (back button in result)
    retakeBtn?: string        // "Retake"
    strengths?: string        // "Strengths"
    growthAreas?: string      // "Growth areas"
    withTendencies?: string   // "with {type} tendencies"
    bigFiveSub?: string       // "Your personality across the five core dimensions"
    catCognitive?: string     // "Cognitive & Intelligence"
    catPersonality?: string   // "Personality"
    catEmotional?: string     // "Emotional Intelligence"
    catAcademic?: string      // "Academic Skills"
    catMentalHealth?: string  // "Mental Health Screening"
    catBehavioral?: string    // "Behavioural"
    whatThisMeans?: string    // "What this means"
    nextSteps?: string        // "Next steps"
    quitTitle?: string        // "Quit this test?"
    quitSub?: string          // "Your progress will be lost..."
    continueTestBtn?: string  // "Keep going"
    quitBtn?: string          // "Quit"
    testMeta?: {
      [testId: string]: {
        name?: string
        tagline?: string
        description?: string
        disclaimer?: string
        questions?: Array<{ text: string; options: [string, string, string, string] }> | Record<string, { text: string; options: [string, string, string, string] }>
      }
    }
    comingSoonMeta?: {
      [id: string]: { name?: string; tagline?: string }
    }
  }
}
