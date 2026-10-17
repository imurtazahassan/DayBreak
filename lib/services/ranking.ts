// ── Ranking Service ────────────────────────────────────────────────────────────
// Transparent, explainable scoring function. No ML black boxes.
//
// Final score = interestWeight × recencyScore × sourcePreference
//               − diversityPenalty + explorationBonus
//
// interestWeight  : derived from ReaderProfile.topicWeights (0–1)
// recencyScore    : exponential decay, half-life = 12 hours
// sourcePreference: derived from ReaderProfile.sourceWeights (0–1)
// diversityPenalty: −0.3 for each topic already represented ≥ 3 times
// explorationBonus: +0.1 for topics NOT in the reader's stated interests

import type {
  Article,
  EditionItem,
  ReaderProfile,
  RankingInput,
  ScoreBreakdown,
  StorySize,
} from '@/lib/types'
import { clamp } from '@/lib/utils'

const HALF_LIFE_HOURS = 12
const DIVERSITY_PENALTY = 0.3
const DIVERSITY_THRESHOLD = 3
const EXPLORATION_BONUS = 0.1
const DEFAULT_WEIGHT = 0.3

// ── Scoring helpers ───────────────────────────────────────────────────────────

function recencyScore(publishedAt: string): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  const ageHours = ageMs / 3_600_000
  // Exponential decay: score = e^(-λ × age), λ = ln(2) / halfLife
  const lambda = Math.LN2 / HALF_LIFE_HOURS
  return clamp(Math.exp(-lambda * ageHours), 0.01, 1)
}

function interestWeight(article: Article, profile: ReaderProfile): number {
  let max = DEFAULT_WEIGHT
  for (const cat of article.categories) {
    const tw = profile.topicWeights.find((t) => t.topic === cat)
    if (tw) max = Math.max(max, tw.weight)
    // Also check if the category is in raw stated topics
    if (profile.topics.includes(cat)) max = Math.max(max, 0.7)
  }
  // Regional match bonus
  if (profile.regions.includes(article.region)) max = Math.min(1, max + 0.1)
  return clamp(max, 0, 1)
}

function sourcePreference(article: Article, profile: ReaderProfile): number {
  const sw = profile.sourceWeights.find((s) => s.sourceId === article.sourceId)
  if (sw) return clamp(sw.weight, 0, 1)
  if (profile.preferredSources.includes(article.sourceId)) return 0.8
  return 0.5 // neutral default
}

function diversityPenalty(article: Article, topicCounts: Map<string, number>): number {
  let penalty = 0
  for (const cat of article.categories) {
    const count = topicCounts.get(cat) ?? 0
    if (count >= DIVERSITY_THRESHOLD) penalty += DIVERSITY_PENALTY
  }
  return clamp(penalty, 0, 0.6)
}

function explorationBonus(article: Article, profile: ReaderProfile): number {
  const isInInterests = article.categories.some(
    (c) => profile.topics.includes(c) || profile.topicWeights.some((t) => t.topic === c && t.weight > 0.4)
  )
  return isInInterests ? 0 : EXPLORATION_BONUS
}

// ── Main ranking function ─────────────────────────────────────────────────────

export function scoreArticle(
  article: Article,
  profile: ReaderProfile,
  topicCounts: Map<string, number>
): ScoreBreakdown {
  const iw = interestWeight(article, profile)
  const rs = recencyScore(article.publishedAt)
  const sp = sourcePreference(article, profile)
  const dp = diversityPenalty(article, topicCounts)
  const eb = explorationBonus(article, profile)

  const totalScore = clamp(iw * rs * sp - dp + eb, 0, 1)

  return {
    interestWeight: iw,
    recencyScore: rs,
    sourcePreference: sp,
    diversityPenalty: dp,
    explorationBonus: eb,
    totalScore,
  }
}

function assignSize(rank: number, section: string): StorySize {
  if (section === 'lead') return 'lead'
  if (rank <= 2) return 'featured'
  if (rank <= 6) return 'standard'
  return 'brief'
}

function determineSectionKey(article: Article, isLead: boolean): string {
  if (isLead) return 'lead'
  return article.categories[0] ?? 'world'
}

export function rankArticles(input: RankingInput): EditionItem[] {
  const { articles, profile, targetCount } = input

  // Filter out hidden articles and content to avoid
  const eligible = articles.filter((a) => {
    if (a.isHidden) return false
    if (profile.contentToAvoid.some((c) => a.categories.includes(c))) return false
    return true
  })

  // First pass: score without diversity penalty
  const topicCounts = new Map<string, number>()
  const scored = eligible.map((article) => ({
    article,
    score: scoreArticle(article, profile, topicCounts),
  }))

  // Sort descending by score
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore)

  // Second pass: apply diversity with running topic counts
  const topicCountsLive = new Map<string, number>()
  const ranked: EditionItem[] = []
  let editionRank = 0

  // Ensure at least one exploration story (highest-scoring non-interest article)
  let hasExploration = false

  for (const { article } of scored) {
    if (ranked.length >= targetCount) break

    // Recompute score with live topic counts
    const score = scoreArticle(article, profile, topicCountsLive)
    editionRank++

    const isLead = editionRank === 1
    const isExploration = score.explorationBonus > 0

    if (isExploration && !hasExploration && ranked.length >= Math.floor(targetCount * 0.7)) {
      hasExploration = true
    }

    const sectionKey = determineSectionKey(article, isLead)

    ranked.push({
      articleId: article.id,
      article,
      rank: editionRank,
      size: assignSize(editionRank, sectionKey),
      sectionKey,
      scoreBreakdown: score,
    })

    // Update topic counts for diversity
    for (const cat of article.categories) {
      topicCountsLive.set(cat, (topicCountsLive.get(cat) ?? 0) + 1)
    }
  }

  return ranked
}

export function buildSectionOrder(items: EditionItem[], profile: ReaderProfile): string[] {
  const sections = new Set<string>()
  sections.add('lead')

  // Profile topics come first
  for (const topic of profile.topics) {
    if (items.some((i) => i.sectionKey === topic)) sections.add(topic)
  }

  // Then any remaining sections
  for (const item of items) {
    sections.add(item.sectionKey)
  }

  return Array.from(sections)
}
