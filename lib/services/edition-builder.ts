// ── Edition Builder ────────────────────────────────────────────────────────────
// Orchestrates: ingest → rank → snapshot → save
// Called by: /api/cron/build-edition, /api/edition/build (manual trigger)

import type { Edition, ReaderProfile } from '@/lib/types'
import { ingestAllSources } from '@/lib/services/ingestion'
import { rankArticles, buildSectionOrder } from '@/lib/services/ranking'
import {
  saveArticles,
  loadArticles,
  loadEdition,
  saveEdition,
  loadEditionIndex,
} from '@/lib/services/storage'
import { RSS_SOURCES } from '@/lib/sources'
import { DEMO_ARTICLES, buildDemoEdition } from '@/lib/demo-data'
import { toDateKey, nanoid } from '@/lib/utils'

export async function buildEditionForProfile(
  profile: ReaderProfile,
  forceRebuild = false
): Promise<Edition> {
  const today = toDateKey(new Date())

  // Return cached edition if already built today
  if (!forceRebuild) {
    const existing = loadEdition(today)
    if (existing) return existing
  }

  // 1. Ingest fresh articles
  let freshArticles = await ingestAllSources(RSS_SOURCES)

  // 2. Merge with any previously ingested articles
  saveArticles(freshArticles)
  const allArticles = loadArticles()

  // 3. Fall back to demo data if we have nothing
  const articles = allArticles.length > 0 ? allArticles : DEMO_ARTICLES
  const isDemo = allArticles.length === 0

  if (isDemo) {
    console.warn('[edition-builder] Using demo fallback data — RSS ingestion returned 0 articles')
  }

  // 4. Rank
  const items = rankArticles({
    articles,
    profile,
    existingTopicsToday: [],
    targetCount: 20,
  })

  // 5. Compute edition number
  const index = loadEditionIndex()
  const editionNumber = index.length + 1

  // 6. Build edition snapshot
  const edition: Edition = {
    id: nanoid(),
    editionDate: today,
    editionNumber,
    readerId: profile.id,
    createdAt: new Date().toISOString(),
    items,
    sectionOrder: buildSectionOrder(items, profile),
    totalReadingMinutes: items.reduce((s, i) => s + i.article.readingTimeMinutes, 0),
    label: isDemo ? 'demo' : 'live',
    isDemo,
  }

  // 7. Persist immutable snapshot
  saveEdition(edition)

  return edition
}

export function getFallbackEdition(): Edition {
  return buildDemoEdition()
}
