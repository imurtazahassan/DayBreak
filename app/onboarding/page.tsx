// ── Onboarding: /onboarding ───────────────────────────────────────────────────
// Multi-step interactive onboarding flow.
// Steps: Welcome → Topics → Regions → Reading Depth → Sources → Preview

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { cn } from '@/lib/utils'
import { CATEGORIES, REGIONS } from '@/lib/sources'
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2, Newspaper } from 'lucide-react'
import type { ReadingDepth } from '@/lib/types'

const STEPS = ['Welcome', 'Topics', 'Regions', 'Reading', 'Done']

const DEPTH_OPTIONS: { key: ReadingDepth; label: string; description: string }[] = [
  { key: 'brief', label: 'Quick briefing', description: '5–10 min · headlines + key points only' },
  { key: 'standard', label: 'Standard edition', description: '15–20 min · full summaries, balanced coverage' },
  { key: 'deep', label: 'Deep read', description: '30+ min · extended summaries, more stories' },
]

const AVOID_OPTIONS = ['violence', 'sports', 'celebrity', 'opinion', 'crypto']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [topics, setTopics] = useState<string[]>(['technology', 'business'])
  const [regions, setRegions] = useState<string[]>(['global', 'pakistan'])
  const [depth, setDepth] = useState<ReadingDepth>('standard')
  const [avoid, setAvoid] = useState<string[]>([])
  const [name, setName] = useState('')

  const toggleSet = useCallback(<T extends string>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          regions,
          readingDepth: depth,
          contentToAvoid: avoid,
          displayName: name || undefined,
          hasCompletedOnboarding: true,
          topicWeights: topics.map((t) => ({
            topic: t,
            weight: 0.75,
            lastUpdated: new Date().toISOString(),
          })),
        }),
      })
      // Trigger edition build
      await fetch('/api/edition/build', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error(err)
      router.push('/')
    } finally {
      setSaving(false)
    }
  }, [topics, regions, depth, avoid, name, router])

  const canContinue = step === 0 || topics.length > 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-paper flex flex-col">
        {/* Progress bar */}
        <div className="h-0.5 bg-rule">
          <motion.div
            className="h-full bg-forest"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  i < step ? 'bg-forest' : i === step ? 'bg-ink' : 'bg-rule'
                )}
              />
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-rule" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center py-8">
                  <Newspaper className="w-12 h-12 mx-auto text-forest mb-6" />
                  <h1 className="font-serif text-4xl text-ink mb-4">
                    Welcome to DAYBREAK
                  </h1>
                  <p className="text-ink-soft text-lg leading-relaxed mb-8 max-w-md mx-auto">
                    A personal morning paper, shaped entirely around you. It takes about 2 minutes to set up.
                  </p>
                  <div className="border border-rule p-4 text-left text-sm text-ink-soft bg-white/50 mb-8 max-w-md mx-auto">
                    <p className="font-medium text-ink mb-2">How it works:</p>
                    <ul className="space-y-1">
                      <li>· You tell us what matters to you</li>
                      <li>· We ingest live RSS feeds and rank stories by your interests</li>
                      <li>· Your paper is rebuilt every morning</li>
                      <li>· The more you read and react, the better it gets</li>
                    </ul>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm text-ink-soft mb-2 text-left max-w-xs mx-auto">
                      Your name (optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ahmad"
                      className="w-full max-w-xs border border-rule bg-white px-3 py-2 text-ink placeholder:text-ink-faint text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Topics */}
              {step === 1 && (
                <div>
                  <p className="kicker text-terracotta mb-2">Step 2 of {STEPS.length}</p>
                  <h2 className="font-serif text-3xl text-ink mb-2">What do you care about?</h2>
                  <p className="text-ink-soft text-sm mb-6">Select all that interest you. You can change this any time.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const active = topics.includes(cat.key)
                      return (
                        <button
                          key={cat.key}
                          onClick={() => toggleSet(setTopics, cat.key)}
                          aria-pressed={active}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 border text-left text-sm transition-all',
                            active
                              ? 'bg-forest text-paper border-forest'
                              : 'bg-paper text-ink border-rule hover:border-ink-soft'
                          )}
                        >
                          <span className="text-base" aria-hidden>{cat.emoji}</span>
                          <span className={active ? 'font-medium' : ''}>{cat.label}</span>
                          {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                  {topics.length === 0 && (
                    <p className="text-xs text-terracotta mt-3">Please select at least one topic.</p>
                  )}
                </div>
              )}

              {/* Step 2: Regions */}
              {step === 2 && (
                <div>
                  <p className="kicker text-terracotta mb-2">Step 3 of {STEPS.length}</p>
                  <h2 className="font-serif text-3xl text-ink mb-2">Which regions matter to you?</h2>
                  <p className="text-ink-soft text-sm mb-6">Stories from your selected regions will be prioritised.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REGIONS.map((r) => {
                      const active = regions.includes(r.key)
                      return (
                        <button
                          key={r.key}
                          onClick={() => toggleSet(setRegions, r.key)}
                          aria-pressed={active}
                          className={cn(
                            'px-4 py-3 border text-left text-sm transition-all',
                            active
                              ? 'bg-forest text-paper border-forest'
                              : 'bg-paper text-ink border-rule hover:border-ink-soft'
                          )}
                        >
                          {r.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Reading depth */}
              {step === 3 && (
                <div>
                  <p className="kicker text-terracotta mb-2">Step 4 of {STEPS.length}</p>
                  <h2 className="font-serif text-3xl text-ink mb-2">How deep do you want to go?</h2>
                  <p className="text-ink-soft text-sm mb-6">This sets your morning reading budget.</p>
                  <div className="space-y-3">
                    {DEPTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setDepth(opt.key)}
                        aria-pressed={depth === opt.key}
                        className={cn(
                          'w-full flex items-start gap-4 px-4 py-4 border text-left transition-all',
                          depth === opt.key
                            ? 'bg-forest text-paper border-forest'
                            : 'bg-paper text-ink border-rule hover:border-ink-soft'
                        )}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className={cn('text-xs mt-0.5', depth === opt.key ? 'text-paper/70' : 'text-ink-soft')}>
                            {opt.description}
                          </p>
                        </div>
                        {depth === opt.key && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-ink-soft mb-3">Content to avoid (optional):</p>
                    <div className="flex flex-wrap gap-2">
                      {AVOID_OPTIONS.map((opt) => {
                        const active = avoid.includes(opt)
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleSet(setAvoid, opt)}
                            aria-pressed={active}
                            className={cn(
                              'px-3 py-1.5 text-xs border transition-colors capitalize',
                              active
                                ? 'bg-terracotta text-paper border-terracotta'
                                : 'border-rule text-ink-soft hover:border-ink-soft'
                            )}
                          >
                            {active ? '✕ ' : ''}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Done / preview */}
              {step === 4 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-forest mb-6" />
                  <h2 className="font-serif text-4xl text-ink mb-4">You&apos;re all set{name ? `, ${name}` : ''}!</h2>
                  <p className="text-ink-soft mb-8 leading-relaxed max-w-md mx-auto">
                    DAYBREAK will now build your first personalized edition using live RSS feeds.
                    Your paper improves every day as you read and react.
                  </p>
                  <div className="border border-rule p-4 text-left text-sm text-ink-soft mb-8 max-w-sm mx-auto">
                    <p className="font-medium text-ink mb-2">Your preferences:</p>
                    <p>· Topics: {topics.join(', ')}</p>
                    <p>· Regions: {regions.join(', ')}</p>
                    <p>· Reading depth: {depth}</p>
                    {avoid.length > 0 && <p>· Avoiding: {avoid.join(', ')}</p>}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="border-t border-rule bg-paper px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink disabled:opacity-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <span className="font-mono text-xs text-ink-faint">
              {step + 1} / {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
                className="flex items-center gap-1.5 text-sm bg-forest text-paper px-4 py-2 hover:bg-forest-light disabled:opacity-40 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-sm bg-forest text-paper px-6 py-2 hover:bg-forest-light disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Building your paper…
                  </>
                ) : (
                  <>
                    <Newspaper className="w-4 h-4" />
                    Create my paper
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
