// ── Learning Service ──────────────────────────────────────────────────────────
// Updates per-topic and per-source weights based on FeedbackEvents.
// Time decay: weights drift back toward 0.5 if no recent signal.
// All logic is deterministic and testable.

import type { FeedbackEvent, ReaderProfile, TopicWeight, SourceWeight } from '@/lib/types'
import { clamp } from '@/lib/utils'

// Weight adjustments per feedback type
const WEIGHT_DELTA: Record<string, number> = {
  opened:          +0.03,
  read:            +0.05,
  saved:           +0.10,
  more_like_this:  +0.15,
  less_like_this:  -0.20,
  skipped:         -0.05,
  topic_follow:    +0.25,
  topic_unfollow:  -0.30,
  source_follow:   +0.25,
  source_unfollow: -0.30,
}

// Time decay constant — weights decay toward neutral (0.5) over time
// Half-life: ~7 days
const DECAY_RATE = 0.1 // per day, applied when weight is updated

function decayedWeight(weight: number, lastUpdated: string): number {
  const daysSince = (Date.now() - new Date(lastUpdated).getTime()) / 86_400_000
  const decayFactor = Math.exp(-DECAY_RATE * daysSince)
  // Lerp toward 0.5 (neutral)
  return 0.5 + (weight - 0.5) * decayFactor
}

function updateTopicWeight(
  weights: TopicWeight[],
  topic: string,
  delta: number
): TopicWeight[] {
  const now = new Date().toISOString()
  const existing = weights.find((w) => w.topic === topic)

  if (existing) {
    const decayed = decayedWeight(existing.weight, existing.lastUpdated)
    return weights.map((w) =>
      w.topic === topic
        ? { ...w, weight: clamp(decayed + delta, 0, 1), lastUpdated: now }
        : w
    )
  }

  // New topic
  return [
    ...weights,
    { topic, weight: clamp(0.5 + delta, 0, 1), lastUpdated: now },
  ]
}

function updateSourceWeight(
  weights: SourceWeight[],
  sourceId: string,
  delta: number
): SourceWeight[] {
  const now = new Date().toISOString()
  const existing = weights.find((w) => w.sourceId === sourceId)

  if (existing) {
    const decayed = decayedWeight(existing.weight, existing.lastUpdated)
    return weights.map((w) =>
      w.sourceId === sourceId
        ? { ...w, weight: clamp(decayed + delta, 0, 1), lastUpdated: now }
        : w
    )
  }

  return [
    ...weights,
    { sourceId, weight: clamp(0.5 + delta, 0, 1), lastUpdated: now },
  ]
}

export function applyFeedbackToProfile(
  profile: ReaderProfile,
  event: FeedbackEvent,
  articleCategories?: string[],
  articleSourceId?: string
): ReaderProfile {
  const delta = WEIGHT_DELTA[event.type] ?? 0
  if (delta === 0) return profile

  let { topicWeights, sourceWeights } = profile

  // Update topic weights
  const topics = event.topic
    ? [event.topic]
    : articleCategories ?? []

  for (const topic of topics) {
    topicWeights = updateTopicWeight(topicWeights, topic, delta)
  }

  // Update source weights
  const sourceId = event.sourceId ?? articleSourceId
  if (sourceId) {
    sourceWeights = updateSourceWeight(sourceWeights, sourceId, delta)
  }

  return {
    ...profile,
    topicWeights,
    sourceWeights,
    updatedAt: new Date().toISOString(),
  }
}

export function applyAllFeedback(
  profile: ReaderProfile,
  events: FeedbackEvent[],
  articleMap: Map<string, { categories: string[]; sourceId: string }>
): ReaderProfile {
  let updated = profile
  for (const event of events) {
    const article = event.articleId ? articleMap.get(event.articleId) : undefined
    updated = applyFeedbackToProfile(
      updated,
      event,
      article?.categories,
      article?.sourceId
    )
  }
  return updated
}

// ── "What DAYBREAK has learned" summary ────────────────────────────────────────

export interface LearnedInsight {
  label: string
  direction: 'more' | 'less'
  strength: 'strong' | 'moderate' | 'mild'
  weight: number
}

export function buildLearnedInsights(profile: ReaderProfile): LearnedInsight[] {
  const insights: LearnedInsight[] = []

  for (const tw of profile.topicWeights) {
    const deviation = tw.weight - 0.5
    if (Math.abs(deviation) < 0.1) continue // ignore neutral

    const direction: 'more' | 'less' = deviation > 0 ? 'more' : 'less'
    const absDeviation = Math.abs(deviation)
    const strength: 'strong' | 'moderate' | 'mild' =
      absDeviation > 0.3 ? 'strong' : absDeviation > 0.15 ? 'moderate' : 'mild'

    insights.push({
      label: tw.topic,
      direction,
      strength,
      weight: tw.weight,
    })
  }

  // Sort: strong first, then by absolute deviation
  return insights.sort((a, b) => {
    const strengthOrder = { strong: 0, moderate: 1, mild: 2 }
    return strengthOrder[a.strength] - strengthOrder[b.strength]
  })
}
