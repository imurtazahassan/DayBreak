// ── Story page: /story/[slug] ──────────────────────────────────────────────────

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { loadArticleBySlug } from '@/lib/services/storage'
import { DEMO_ARTICLES } from '@/lib/demo-data'
import { relativeTime, formatEditionDate } from '@/lib/utils'
import { DemoBadge } from '@/components/ui/demo-badge'
import { StoryFeedback } from '@/components/story/story-feedback'
import { generateWhyItMatters } from '@/lib/services/gemini'
import { loadProfile } from '@/lib/services/storage'
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = loadArticleBySlug(slug) ?? DEMO_ARTICLES.find((a) => a.slug === slug)
  if (!article) return { title: 'Story Not Found' }
  return {
    title: article.title,
    description: article.summary,
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params
  const article = loadArticleBySlug(slug) ?? DEMO_ARTICLES.find((a) => a.slug === slug)

  if (!article) notFound()

  const profile = loadProfile('default')
  const whyItMatters = await generateWhyItMatters({
    title: article.title,
    summary: article.summary,
    categories: article.categories,
    readerPersona: profile?.displayName || 'Pakistani university student',
    readerTopics: profile?.topics || ['Technology', 'Climate', 'Business'],
  })

  return (
    <article className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-ink-faint hover:text-ink text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Today&apos;s paper
      </Link>

      {/* Kicker */}
      <div className="flex items-center gap-3 mb-3">
        <span className="kicker text-terracotta">{article.categories[0]}</span>
        {article.label === 'demo' && <DemoBadge />}
      </div>

      {/* Headline */}
      <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-faint font-mono mb-6 border-b border-rule pb-4">
        <span className="text-ink-soft font-medium">{article.sourceName}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readingTimeMinutes} min read
        </span>
        <span>{relativeTime(article.publishedAt)}</span>
        {article.region && <span className="uppercase tracking-wide">{article.region}</span>}
      </div>

      {/* Hero image */}
      {article.imageUrl && (
        <figure className="mb-8 -mx-4 md:mx-0">
          <div className="relative aspect-[16/9] bg-rule">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              onError={() => {/* next/image handles error gracefully */}}
            />
          </div>
          {article.imageCredit && (
            <figcaption className="text-[11px] text-ink-faint mt-1 px-4 md:px-0">
              Photo: {article.imageCredit}
            </figcaption>
          )}
        </figure>
      )}

      {/* Summary / lead */}
      <p className="text-ink text-lg leading-relaxed mb-6 font-medium">
        {article.summary}
      </p>

      {/* Why this matters */}
      <div className="border-l-2 border-brass pl-4 mb-8 bg-brass/5 py-3">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs kicker text-brass">Why this matters to you</p>
          <span className="font-mono text-[9px] bg-brass/20 text-ink-soft px-1.5 py-0.5 uppercase tracking-wider">
            AI Editorial Analysis
          </span>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed italic">
          &ldquo;{whyItMatters}&rdquo;
        </p>
      </div>

      {/* Feedback controls */}
      <StoryFeedback
        articleId={article.id}
        articleSlug={article.slug}
        categories={article.categories}
        sourceId={article.sourceId}
      />

      {/* Original source */}
      <div className="border-t border-rule pt-6 mt-6">
        <p className="text-xs text-ink-faint mb-3">
          DAYBREAK shows article summaries only. Read the full story at the original source:
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-forest text-paper px-4 py-2 text-sm hover:bg-forest-light transition-colors"
        >
          Read at {article.sourceName}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  )
}
