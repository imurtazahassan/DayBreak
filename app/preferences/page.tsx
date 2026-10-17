'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, REGIONS, RSS_SOURCES } from '@/lib/sources'
import { cn } from '@/lib/utils'
import type { ReaderProfile, ReadingDepth } from '@/lib/types'
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react'

const DEPTH_OPTIONS: { key: ReadingDepth; label: string; description: string }[] = [
  { key: 'brief', label: 'Quick briefing', description: '5–10 min · key points only' },
  { key: 'standard', label: 'Standard edition', description: '15–20 min · full summaries, balanced' },
  { key: 'deep', label: 'Deep read', description: '30+ min · comprehensive coverage' },
]

const AVOID_TAGS = ['violence', 'sports', 'celebrity', 'opinion', 'crypto', 'scandals']

export default function PreferencesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ReaderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // Form states
  const [topics, setTopics] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [depth, setDepth] = useState<ReadingDepth>('standard')
  const [avoid, setAvoid] = useState<string[]>([])
  const [preferredSources, setPreferredSources] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          const p: ReaderProfile = data.profile
          setProfile(p)
          setTopics(p.topics || [])
          setRegions(p.regions || [])
          setDepth(p.readingDepth || 'standard')
          setAvoid(p.contentToAvoid || [])
          setPreferredSources(p.preferredSources || [])
          setDisplayName(p.displayName || '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleArrayItem = <T extends string>(list: T[], setList: (val: T[]) => void, item: T) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleSave = async (rebuild = false) => {
    setSaving(true)
    setStatusMsg(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          topics,
          regions,
          readingDepth: depth,
          contentToAvoid: avoid,
          preferredSources,
        }),
      })

      if (!res.ok) throw new Error('Failed to update preferences')

      if (rebuild) {
        setStatusMsg('Rebuilding edition with new preferences…')
        await fetch('/api/edition/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceRebuild: true }),
        })
        setStatusMsg('Preferences saved & today’s edition updated!')
        router.push('/')
      } else {
        setStatusMsg('Preferences saved successfully.')
        setTimeout(() => setStatusMsg(null), 3500)
      }
    } catch {
      setStatusMsg('Error saving preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all reading preferences and learned weights to defaults?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: ['technology', 'business', 'climate', 'pakistan'],
          regions: ['pakistan', 'global', 'south-asia'],
          readingDepth: 'standard',
          preferredSources: ['dawn-pakistan', 'techcrunch', 'carbon-brief'],
          contentToAvoid: [],
          displayName: 'Demo Reader',
        }),
      })
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setTopics(data.profile.topics)
        setRegions(data.profile.regions)
        setDepth(data.profile.readingDepth)
        setAvoid(data.profile.contentToAvoid)
        setPreferredSources(data.profile.preferredSources)
        setDisplayName(data.profile.displayName || '')
      }
      setStatusMsg('Preferences reset to default persona.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-ink-faint font-mono text-sm">
        Loading preferences…
      </div>
    )
  }

  // Learned weights analysis
  const learnedTopics = profile?.topicWeights || []
  const boostedTopics = learnedTopics.filter((t) => t.weight > 0.55)
  const reducedTopics = learnedTopics.filter((t) => t.weight < 0.45)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Page Title */}
      <div className="border-b-2 border-ink pb-4 mb-8">
        <p className="kicker text-terracotta mb-1">Reader Settings</p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">Reading Preferences & Learning</h1>
        <p className="text-ink-soft text-sm mt-1">
          Customize how DAYBREAK curates your morning paper. All weights and editorial algorithms adapt to your interactions.
        </p>
      </div>

      {/* ── Section: What DAYBREAK has learned about you ── */}
      <section className="mb-12 bg-white border border-rule p-6 shadow-xs" aria-labelledby="learned-heading">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-forest" />
          <h2 id="learned-heading" className="font-serif text-2xl text-ink">
            What DAYBREAK Has Learned About You
          </h2>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed mb-6">
          Every time you read, save, skip, or vote on stories, DAYBREAK updates your preference vector with mathematical time decay.
          Weights naturally drift toward neutral after ~7 days of inactivity.
        </p>

        <div className="grid md:grid-cols-2 gap-6 border-t border-rule pt-4">
          {/* Boosted */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-mono font-medium text-forest uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4 text-forest" /> High Affinity Topics
            </h3>
            {boostedTopics.length === 0 ? (
              <p className="text-xs text-ink-faint italic">No elevated topic weights yet. Read and save stories to train your paper.</p>
            ) : (
              <ul className="space-y-2">
                {boostedTopics.map((item) => (
                  <li key={item.topic} className="flex items-center justify-between text-xs border-b border-rule/50 pb-1.5">
                    <span className="capitalize text-ink font-medium">{item.topic}</span>
                    <span className="font-mono text-forest bg-forest/10 px-2 py-0.5 font-semibold">
                      +{Math.round((item.weight - 0.5) * 100)}% bias
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reduced */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-mono font-medium text-terracotta uppercase tracking-wider mb-3">
              <TrendingDown className="w-4 h-4 text-terracotta" /> Deprioritized Topics
            </h3>
            {reducedTopics.length === 0 ? (
              <p className="text-xs text-ink-faint italic">No deprioritized topics yet. Skip stories or click &apos;Less like this&apos; to suppress topics.</p>
            ) : (
              <ul className="space-y-2">
                {reducedTopics.map((item) => (
                  <li key={item.topic} className="flex items-center justify-between text-xs border-b border-rule/50 pb-1.5">
                    <span className="capitalize text-ink">{item.topic}</span>
                    <span className="font-mono text-terracotta bg-terracotta/10 px-2 py-0.5 font-semibold">
                      {Math.round((item.weight - 0.5) * 100)}% bias
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-rule flex flex-wrap items-center justify-between gap-3 text-xs text-ink-faint font-mono">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Transparent heuristic scoring: interest × recency × source − diversity + exploration
          </span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-ink-soft hover:text-terracotta transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset learning model
          </button>
        </div>
      </section>

      {/* ── Form: Stated Preferences ── */}
      <div className="space-y-8">
        {/* Name / Persona */}
        <div className="border border-rule p-5 bg-white">
          <label className="block text-sm font-serif text-ink mb-1">Reader Name or Persona</label>
          <p className="text-xs text-ink-faint mb-3">Used in your personalized greeting and edition metadata.</p>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Murtaza Hassan"
            className="w-full max-w-md border border-rule px-3 py-2 text-sm text-ink focus:outline-none focus:border-forest"
          />
        </div>

        {/* Topics */}
        <div className="border border-rule p-5 bg-white">
          <h3 className="font-serif text-lg text-ink mb-1">Topics of Interest</h3>
          <p className="text-xs text-ink-faint mb-4">Select the coverage categories you want included in your paper.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const active = topics.includes(cat.key)
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => toggleArrayItem(topics, setTopics, cat.key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 text-xs border text-left transition-colors',
                    active
                      ? 'bg-forest text-paper border-forest font-medium'
                      : 'border-rule text-ink hover:border-ink-soft'
                  )}
                >
                  <span aria-hidden>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Regions */}
        <div className="border border-rule p-5 bg-white">
          <h3 className="font-serif text-lg text-ink mb-1">Geographic Focus</h3>
          <p className="text-xs text-ink-faint mb-4">Stories focusing on these regions receive a positive ranking boost.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGIONS.map((r) => {
              const active = regions.includes(r.key)
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => toggleArrayItem(regions, setRegions, r.key)}
                  className={cn(
                    'px-3 py-2 text-xs border text-left transition-colors',
                    active
                      ? 'bg-forest text-paper border-forest font-medium'
                      : 'border-rule text-ink hover:border-ink-soft'
                  )}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reading Depth */}
        <div className="border border-rule p-5 bg-white">
          <h3 className="font-serif text-lg text-ink mb-1">Reading Depth</h3>
          <p className="text-xs text-ink-faint mb-4">Determines target story count and layout density.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDepth(opt.key)}
                className={cn(
                  'p-4 border text-left transition-all',
                  depth === opt.key
                    ? 'border-forest bg-forest text-paper'
                    : 'border-rule text-ink hover:border-ink-soft'
                )}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className={cn('text-xs mt-1', depth === opt.key ? 'text-paper/80' : 'text-ink-soft')}>
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Sources */}
        <div className="border border-rule p-5 bg-white">
          <h3 className="font-serif text-lg text-ink mb-1">Preferred Sources</h3>
          <p className="text-xs text-ink-faint mb-4">Curated RSS feeds currently ingested into DAYBREAK.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {RSS_SOURCES.map((source) => {
              const active = preferredSources.includes(source.id)
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => toggleArrayItem(preferredSources, setPreferredSources, source.id)}
                  className={cn(
                    'flex items-center justify-between p-3 border text-xs text-left transition-colors',
                    active
                      ? 'border-forest bg-forest/5 text-forest font-medium'
                      : 'border-rule text-ink hover:border-ink-soft'
                  )}
                >
                  <div>
                    <span className="font-medium">{source.name}</span>
                    <span className="text-ink-faint font-mono text-[10px] block">{source.category} · {source.region}</span>
                  </div>
                  {active && <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Preferred</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content to Avoid */}
        <div className="border border-rule p-5 bg-white">
          <h3 className="font-serif text-lg text-ink mb-1">Content to Avoid</h3>
          <p className="text-xs text-ink-faint mb-4">Stories tagged with these topics will be filtered out before ranking.</p>
          <div className="flex flex-wrap gap-2">
            {AVOID_TAGS.map((tag) => {
              const active = avoid.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayItem(avoid, setAvoid, tag)}
                  className={cn(
                    'px-3 py-1.5 text-xs border capitalize transition-colors',
                    active
                      ? 'bg-terracotta text-paper border-terracotta'
                      : 'border-rule text-ink hover:border-ink-soft'
                  )}
                >
                  {active ? '✕ ' : '+ '}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-rule pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-ink px-5 py-2.5 text-sm text-ink hover:bg-ink hover:text-paper transition-colors font-medium"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-forest px-6 py-2.5 text-sm text-paper hover:bg-forest-light transition-colors font-medium shadow-xs"
          >
            <Sparkles className="w-4 h-4" /> Save & Rebuild Today&apos;s Paper
          </button>
        </div>

        {statusMsg && (
          <p className="text-center font-mono text-xs text-forest py-2 animate-in fade-in" role="status">
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  )
}
