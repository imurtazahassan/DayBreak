import { scoreArticle, rankArticles, buildSectionOrder } from '../lib/services/ranking'
import { DEMO_ARTICLES, DEFAULT_PROFILE } from '../lib/demo-data'
import type { Article, ReaderProfile } from '../lib/types'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${msg}`)
}

console.log('--- Testing DAYBREAK Transparent Ranking Engine ---')

// 1. Recency Decay
const recentArticle: Article = {
  ...DEMO_ARTICLES[0],
  publishedAt: new Date().toISOString(), // 0 hours old
}
const oldArticle: Article = {
  ...DEMO_ARTICLES[0],
  publishedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 48 hours old
}

const topicCounts = new Map<string, number>()
const recentScore = scoreArticle(recentArticle, DEFAULT_PROFILE, topicCounts)
const oldScore = scoreArticle(oldArticle, DEFAULT_PROFILE, topicCounts)

assert(
  recentScore.recencyScore > oldScore.recencyScore,
  `Recent article recency (${recentScore.recencyScore.toFixed(3)}) > 48h article recency (${oldScore.recencyScore.toFixed(3)})`
)

// 2. Interest Weighting
const highInterestArticle: Article = {
  ...DEMO_ARTICLES[0],
  categories: ['technology'], // in profile
}
const lowInterestArticle: Article = {
  ...DEMO_ARTICLES[0],
  categories: ['sports'], // low weight in profile
}

const highIntScore = scoreArticle(highInterestArticle, DEFAULT_PROFILE, topicCounts)
const lowIntScore = scoreArticle(lowInterestArticle, DEFAULT_PROFILE, topicCounts)

assert(
  highIntScore.interestWeight > lowIntScore.interestWeight,
  `Technology interest weight (${highIntScore.interestWeight}) > sports interest weight (${lowIntScore.interestWeight})`
)

// 3. Diversity Penalty
const countWithoutThreshold = new Map<string, number>([['technology', 1]])
const countWithThreshold = new Map<string, number>([['technology', 3]])

const scoreNoPenalty = scoreArticle(highInterestArticle, DEFAULT_PROFILE, countWithoutThreshold)
const scoreWithPenalty = scoreArticle(highInterestArticle, DEFAULT_PROFILE, countWithThreshold)

assert(
  scoreWithPenalty.diversityPenalty > scoreNoPenalty.diversityPenalty,
  `Diversity penalty active when topic count >= 3 (penalty: ${scoreWithPenalty.diversityPenalty})`
)

// 4. Exploration Bonus
const exploreArticle: Article = {
  ...DEMO_ARTICLES[0],
  categories: ['culture'], // not in profile
}
const exploreScore = scoreArticle(exploreArticle, DEFAULT_PROFILE, topicCounts)
assert(
  exploreScore.explorationBonus === 0.1,
  `Exploration bonus +0.1 applied for unfamiliar topic 'culture'`
)

// 5. Full Ranking & Story Size Assignment
const ranked = rankArticles({
  articles: DEMO_ARTICLES,
  profile: DEFAULT_PROFILE,
  existingTopicsToday: [],
  targetCount: 10,
})

assert(ranked.length > 0, `Ranked articles count (${ranked.length}) > 0`)
assert(ranked[0].size === 'lead', `Rank #1 article assigned story size 'lead'`)
assert(ranked[0].sectionKey === 'lead', `Rank #1 article sectionKey is 'lead'`)

// 6. Section Ordering
const sectionOrder = buildSectionOrder(ranked, DEFAULT_PROFILE)
assert(sectionOrder[0] === 'lead', `First section in paper order is 'lead'`)
assert(
  sectionOrder.includes('technology'),
  `Profile topic 'technology' is included in section order`
)

console.log('\nAll 6 Ranking Engine test suites PASSED!')
