// ── DAYBREAK core TypeScript types ──────────────────────────────────────────

export type Language = 'en' | 'ur' | 'ar'

export type ReadingDepth = 'brief' | 'standard' | 'deep'

export type FeedbackType =
  | 'opened'
  | 'read'
  | 'saved'
  | 'unsaved'
  | 'skipped'
  | 'more_like_this'
  | 'less_like_this'
  | 'topic_follow'
  | 'topic_unfollow'
  | 'source_follow'
  | 'source_unfollow'

export type StorySize = 'lead' | 'featured' | 'standard' | 'brief'

export type ContentLabel = 'live' | 'demo'

// ── Source ──────────────────────────────────────────────────────────────────

export interface Source {
  id: string
  name: string
  url: string
  feedUrl: string
  category: string          // 'world' | 'business' | 'technology' | etc.
  language: Language
  region: string            // 'global' | 'south-asia' | 'pakistan' | etc.
  isActive: boolean
  iconUrl?: string
}

// ── Article ─────────────────────────────────────────────────────────────────

export interface Article {
  id: string
  slug: string
  title: string
  summary: string           // RSS description / excerpt — NOT full text
  url: string               // original source URL
  sourceName: string
  sourceId: string
  publishedAt: string       // ISO 8601; use source date when available
  ingestedAt: string        // ISO 8601
  categories: string[]
  language: Language
  region: string
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  readingTimeMinutes: number
  label: ContentLabel       // 'live' | 'demo'
  // Reader state (per-session, not persisted server-side in MVP)
  isSaved?: boolean
  isRead?: boolean
  isHidden?: boolean
}

// ── Reader profile ───────────────────────────────────────────────────────────

export interface TopicWeight {
  topic: string
  weight: number            // 0–1, starts at interest level, updated by feedback
  lastUpdated: string       // ISO 8601
}

export interface SourceWeight {
  sourceId: string
  weight: number            // 0–1
  lastUpdated: string
}

export interface ReaderProfile {
  id: string                // anon UUID stored in localStorage / cookie
  createdAt: string
  updatedAt: string
  // Onboarding fields
  topics: string[]          // e.g. ['technology', 'business', 'climate']
  regions: string[]         // e.g. ['south-asia', 'global']
  languages: Language[]
  readingDepth: ReadingDepth
  preferredSources: string[] // source IDs
  contentToAvoid: string[]   // topic strings
  // Learning weights (updated by feedback)
  topicWeights: TopicWeight[]
  sourceWeights: SourceWeight[]
  // Display
  displayName?: string
  hasCompletedOnboarding: boolean
}

// ── Edition ──────────────────────────────────────────────────────────────────

export interface EditionItem {
  articleId: string
  article: Article
  rank: number              // 1-indexed, lower = more prominent
  size: StorySize
  sectionKey: string        // e.g. 'lead', 'technology', 'world'
  scoreBreakdown: ScoreBreakdown
}

export interface ScoreBreakdown {
  interestWeight: number
  recencyScore: number
  sourcePreference: number
  diversityPenalty: number
  explorationBonus: number
  totalScore: number
}

export interface Edition {
  id: string
  editionDate: string       // YYYY-MM-DD
  editionNumber: number
  readerId: string
  createdAt: string
  items: EditionItem[]
  sectionOrder: string[]    // ordered list of section keys
  totalReadingMinutes: number
  label: ContentLabel
  isDemo: boolean
}

// ── Feedback event ────────────────────────────────────────────────────────────

export interface FeedbackEvent {
  id: string
  readerId: string
  articleId?: string
  topic?: string
  sourceId?: string
  type: FeedbackType
  timestamp: string         // ISO 8601
  context?: Record<string, unknown>
}

// ── Ranking input ─────────────────────────────────────────────────────────────

export interface RankingInput {
  articles: Article[]
  profile: ReaderProfile
  existingTopicsToday: string[]   // for diversity penalty
  targetCount: number
}
