// ── API: Feedback events ──────────────────────────────────────────────────────
// POST /api/feedback  — records a feedback event and updates profile weights

import { NextResponse } from 'next/server'
import type { FeedbackEvent } from '@/lib/types'
import { saveFeedbackEvent, loadProfile, saveProfile, loadArticles } from '@/lib/services/storage'
import { applyFeedbackToProfile } from '@/lib/services/learning'
import { DEFAULT_PROFILE } from '@/lib/demo-data'
import { nanoid } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, articleId, topic, sourceId, readerId = 'default', context } = body

    if (!type) {
      return NextResponse.json({ error: 'Missing feedback type' }, { status: 400 })
    }

    const event: FeedbackEvent = {
      id: nanoid(),
      readerId,
      articleId,
      topic,
      sourceId,
      type,
      timestamp: new Date().toISOString(),
      context,
    }

    // Persist event
    saveFeedbackEvent(event)

    // Update profile weights
    let profile = loadProfile(readerId)
    if (!profile) {
      profile = { ...DEFAULT_PROFILE, id: readerId, createdAt: new Date().toISOString() }
    }

    // Find article categories for context
    let articleCategories: string[] | undefined
    let articleSourceId: string | undefined

    if (articleId) {
      const articles = loadArticles()
      const article = articles.find((a) => a.id === articleId)
      if (article) {
        articleCategories = article.categories
        articleSourceId = article.sourceId
      }
    }

    const updatedProfile = applyFeedbackToProfile(
      profile,
      event,
      articleCategories,
      articleSourceId
    )

    saveProfile(updatedProfile)

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (err) {
    console.error('[/api/feedback]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
