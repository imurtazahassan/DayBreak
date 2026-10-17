// ── RSS Ingestion Service ─────────────────────────────────────────────────────
// Fetches RSS/Atom feeds, normalises to Article shape.
// Falls back to local JSON if fetch fails (demo never breaks).
// Server-side only — never call from client components.

import type { Article, Source } from '@/lib/types'
import { nanoid } from '@/lib/utils'

// Dynamic import so the server bundle is not bloated on client
async function getParser() {
  const Parser = (await import('rss-parser')).default
  return new Parser({
    customFields: {
      item: ['media:content', 'media:thumbnail', 'enclosure'],
    },
    timeout: 8000,
  })
}

function slugify(title: string, id: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) +
    '-' +
    id.slice(0, 8)
  )
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function extractImageUrl(item: Record<string, any>): string | undefined {
  // Try media:content
  const mc = item['media:content']
  if (mc && typeof mc === 'object') {
    if (mc.$ && typeof mc.$.url === 'string') return mc.$.url
    if (typeof mc.url === 'string') return mc.url
  }
  // Try media:thumbnail
  const mt = item['media:thumbnail']
  if (mt && typeof mt === 'object') {
    if (mt.$ && typeof mt.$.url === 'string') return mt.$.url
    if (typeof mt.url === 'string') return mt.url
  }
  // Try enclosure
  const enc = item['enclosure']
  if (enc && typeof enc === 'object' && typeof enc.url === 'string' && enc.url.match(/\.(jpg|jpeg|png|webp)/i)) {
    return enc.url
  }
  return undefined
}

function cleanSummary(raw: string | undefined): string {
  if (!raw) return ''
  // Strip HTML tags
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400)
}

export async function ingestSource(source: Source): Promise<Article[]> {
  try {
    const parser = await getParser()
    const feed = await parser.parseURL(source.feedUrl)
    const now = new Date().toISOString()

    return feed.items
      .slice(0, 15) // max 15 items per source
      .map((item) => {
        const id = nanoid()
        const title = item.title?.trim() ?? 'Untitled'
        const summary = cleanSummary(item.contentSnippet ?? item.content ?? item.summary)
        const url = item.link ?? source.url
        const publishedAt = item.pubDate
          ? new Date(item.pubDate).toISOString()
          : now

        return {
          id,
          slug: slugify(title, id),
          title,
          summary,
          url,
          sourceName: source.name,
          sourceId: source.id,
          publishedAt,
          ingestedAt: now,
          categories: [source.category],
          language: source.language,
          region: source.region,
          imageUrl: extractImageUrl(item as any),
          imageAlt: title,
          imageCredit: source.name,
          readingTimeMinutes: estimateReadingTime(summary),
          label: 'live' as const,
        }
      })
  } catch (err) {
    console.warn(`[ingestion] Failed to fetch ${source.name}:`, (err as Error).message)
    return [] // caller will use fallback
  }
}

export async function ingestAllSources(sources: Source[]): Promise<Article[]> {
  const results = await Promise.allSettled(
    sources.filter((s) => s.isActive).map((s) => ingestSource(s))
  )

  const articles: Article[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return articles.filter((a) => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}
