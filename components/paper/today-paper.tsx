'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FileDown } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'

import { cn, relativeTime, truncateWords } from '@/lib/utils'
import type { Edition, EditionItem } from '@/lib/types'
import FeedbackBar from '@/components/paper/feedback-bar'
import DemoBadge from '@/components/ui/demo-badge'

// ── Props ─────────────────────────────────────────────────────────────────────

interface TodayPaperProps {
  edition: Edition
}

// ── Animation variants ────────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns stagger delay props for a given index */
function stagger(i: number) {
  return {
    variants: fadeInUp,
    initial: 'hidden',
    animate: 'visible',
    transition: { duration: 0.2, delay: i * 0.05, ease: 'easeOut' },
  } as const
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
        {title}
      </h2>
      <div className="h-px flex-1 bg-rule" aria-hidden="true" />
    </div>
  )
}

interface HeroImageProps {
  imageUrl?: string
  imageAlt?: string
  imageCredit?: string
  title: string
}

function HeroImage({ imageUrl, imageAlt, imageCredit, title }: HeroImageProps) {
  if (!imageUrl) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center bg-ink/10"
        aria-label={title}
        role="img"
      >
        <span className="px-6 text-center font-serif text-xl text-ink-faint">{title}</span>
      </div>
    )
  }

  return (
    <figure className="relative aspect-video w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={imageAlt ?? title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover"
      />
      {imageCredit && (
        <figcaption className="absolute bottom-0 right-0 bg-ink/60 px-2 py-0.5 font-mono text-[9px] text-paper/80">
          {imageCredit}
        </figcaption>
      )}
    </figure>
  )
}

// ── Lead Story ────────────────────────────────────────────────────────────────

function LeadStory({ item, isDemo }: { item: EditionItem; isDemo: boolean }) {
  const { article } = item

  return (
    <motion.article
      {...stagger(0)}
      className="mb-10 border-b border-rule pb-10"
      aria-label={`Lead story: ${article.title}`}
    >
      {/* Hero image */}
      <div className="mb-6">
        <HeroImage
          imageUrl={article.imageUrl}
          imageAlt={article.imageAlt}
          imageCredit={article.imageCredit}
          title={article.title}
        />
      </div>

      {/* Kicker */}
      <div className="mb-2 flex items-center gap-3">
        {article.categories[0] && (
          <span className="kicker text-terracotta font-mono text-[11px] uppercase tracking-widest">
            {article.categories[0]}
          </span>
        )}
        {isDemo && <DemoBadge />}
      </div>

      {/* Headline */}
      <Link
        href={`/story/${article.slug}`}
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <h1 className="mb-3 font-serif text-4xl leading-tight text-ink md:text-5xl group-hover:underline decoration-1 underline-offset-4">
          {article.title}
        </h1>
      </Link>

      {/* Summary */}
      <p className="mb-4 max-w-2xl text-base leading-relaxed text-ink-soft">{article.summary}</p>

      {/* Meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
        <span>{article.sourceName}</span>
        <span aria-hidden="true">·</span>
        <span>{article.readingTimeMinutes} min read</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt}>{relativeTime(article.publishedAt)}</time>
      </div>

      {/* Feedback bar */}
      <FeedbackBar
        articleId={article.id}
        articleSlug={article.slug}
        categories={article.categories}
        sourceId={article.sourceId}
        initialSaved={article.isSaved}
      />
    </motion.article>
  )
}

// ── Three Things ──────────────────────────────────────────────────────────────

const BRASS_NUMERALS = ['01', '02', '03']

function ThreeThings({ items }: { items: EditionItem[] }) {
  const slice = items.slice(0, 3)
  if (slice.length === 0) return null

  return (
    <motion.section
      {...stagger(1)}
      className="mb-10 border-b border-rule pb-10"
      aria-labelledby="three-things-heading"
    >
      <SectionHeader title="3 Things to Know" />

      <ol className="flex flex-col gap-6" id="three-things-heading">
        {slice.map((item, i) => (
          <li key={item.articleId} className="flex gap-5">
            {/* Large brass numeral */}
            <span
              className="shrink-0 font-serif text-4xl leading-none text-brass select-none"
              aria-hidden="true"
            >
              {BRASS_NUMERALS[i]}
            </span>

            <div>
              <Link
                href={`/story/${item.article.slug}`}
                className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <h3 className="mb-1 font-serif text-xl leading-snug text-ink group-hover:underline decoration-1 underline-offset-4">
                  {item.article.title}
                </h3>
              </Link>
              <p className="text-sm leading-relaxed text-ink-soft">
                {truncateWords(item.article.summary, 20)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  )
}

// ── Section story cards ───────────────────────────────────────────────────────

interface StoryCardProps {
  item: EditionItem
  animIndex: number
}

function FeaturedCard({ item, animIndex }: StoryCardProps) {
  const { article } = item
  return (
    <motion.article {...stagger(animIndex)} aria-label={article.title}>
      {article.imageUrl && (
        <div className="relative mb-3 aspect-[3/2] w-full overflow-hidden bg-ink/5">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}
      {article.categories[0] && (
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-terracotta">
          {article.categories[0]}
        </span>
      )}
      <Link
        href={`/story/${article.slug}`}
        className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <h3 className="mb-2 font-serif text-xl leading-snug text-ink group-hover:underline decoration-1 underline-offset-4">
          {article.title}
        </h3>
      </Link>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">{article.summary}</p>
      <div className="flex items-center gap-2 font-mono text-[10px] text-ink-faint">
        <span>{article.sourceName}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt}>{relativeTime(article.publishedAt)}</time>
      </div>
    </motion.article>
  )
}

function StandardCard({ item, animIndex }: StoryCardProps) {
  const { article } = item
  return (
    <motion.article {...stagger(animIndex)} aria-label={article.title}>
      {article.categories[0] && (
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-terracotta">
          {article.categories[0]}
        </span>
      )}
      <Link
        href={`/story/${article.slug}`}
        className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <h3 className="mb-1.5 font-serif text-lg leading-snug text-ink group-hover:underline decoration-1 underline-offset-4">
          {article.title}
        </h3>
      </Link>
      <p className="mb-2 text-sm leading-relaxed text-ink-soft">
        {truncateWords(article.summary, 25)}
      </p>
      <div className="flex items-center gap-2 font-mono text-[10px] text-ink-faint">
        <span>{article.sourceName}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt}>{relativeTime(article.publishedAt)}</time>
      </div>
    </motion.article>
  )
}

function BriefCard({ item, animIndex }: StoryCardProps) {
  const { article } = item
  return (
    <motion.article
      {...stagger(animIndex)}
      className="border-l-2 border-rule pl-3"
      aria-label={article.title}
    >
      <Link
        href={`/story/${article.slug}`}
        className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <h3 className="mb-1 text-sm font-medium leading-snug text-ink group-hover:underline decoration-1 underline-offset-4">
          {article.title}
        </h3>
      </Link>
      <span className="font-mono text-[10px] text-ink-faint">{article.sourceName}</span>
    </motion.article>
  )
}

// ── Section renderer ──────────────────────────────────────────────────────────

interface SectionBlockProps {
  sectionKey: string
  items: EditionItem[]
  baseAnimIndex: number
}

function SectionBlock({ sectionKey, items, baseAnimIndex }: SectionBlockProps) {
  if (items.length === 0) return null

  const title = sectionKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  // Determine card type from the first item's size as a heuristic for the section
  const size = items[0]?.size ?? 'standard'

  let gridClass = 'grid gap-6'
  if (size === 'featured') gridClass = cn(gridClass, 'md:grid-cols-2')
  else if (size === 'brief') gridClass = cn(gridClass, 'sm:grid-cols-2 lg:grid-cols-4')
  else gridClass = cn(gridClass, 'sm:grid-cols-2 lg:grid-cols-3')

  return (
    <motion.section
      {...stagger(baseAnimIndex)}
      className="mb-10 border-b border-rule pb-10 last:border-0"
      aria-labelledby={`section-${sectionKey}`}
    >
      <div id={`section-${sectionKey}`}>
        <SectionHeader title={title} />
      </div>

      <div className={gridClass}>
        {items.map((item, i) => {
          const animIndex = baseAnimIndex + i + 1
          if (size === 'featured') {
            return <FeaturedCard key={item.articleId} item={item} animIndex={animIndex} />
          }
          if (size === 'brief') {
            return <BriefCard key={item.articleId} item={item} animIndex={animIndex} />
          }
          return <StandardCard key={item.articleId} item={item} animIndex={animIndex} />
        })}
      </div>
    </motion.section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TodayPaper({ edition }: TodayPaperProps) {
  // Lead story
  const lead =
    edition.items.find((i) => i.sectionKey === 'lead') ?? edition.items[0]

  // 3 Things items (items[1..3] by rank, excluding lead)
  const threeThings = edition.items
    .filter((i) => i.articleId !== lead?.articleId)
    .slice(0, 3)

  // Remaining items excluding lead and 3-things
  const usedIds = new Set([
    lead?.articleId,
    ...threeThings.map((i) => i.articleId),
  ])

  // Group remaining items by section using sectionOrder
  const sectionMap = new Map<string, EditionItem[]>()
  for (const key of edition.sectionOrder) {
    if (key === 'lead') continue
    sectionMap.set(key, [])
  }
  for (const item of edition.items) {
    if (usedIds.has(item.articleId)) continue
    if (!sectionMap.has(item.sectionKey)) {
      sectionMap.set(item.sectionKey, [])
    }
    sectionMap.get(item.sectionKey)!.push(item)
  }

  let globalAnimIndex = 3 // lead=0, threeThings=1, gap=2

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Lead */}
        {lead && <LeadStory item={lead} isDemo={edition.isDemo} />}

        {/* Three Things to Know */}
        <ThreeThings items={threeThings} />

        {/* Sections */}
        {Array.from(sectionMap.entries()).map(([key, items]) => {
          if (items.length === 0) return null
          const base = globalAnimIndex
          globalAnimIndex += items.length + 1
          return (
            <SectionBlock
              key={key}
              sectionKey={key}
              items={items}
              baseAnimIndex={base}
            />
          )
        })}

        {/* PDF download */}
        <motion.div
          {...stagger(globalAnimIndex)}
          className="mt-10 flex justify-center border-t border-rule pt-8"
        >
          <Link
            href={`/api/pdf/${edition.editionDate}`}
            className={cn(
              'inline-flex items-center gap-2 bg-forest px-5 py-2.5 text-paper',
              'font-mono text-sm transition-colors duration-150 hover:bg-forest-light',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
            )}
            aria-label={`Download PDF edition for ${edition.editionDate}`}
          >
            <FileDown size={16} aria-hidden="true" />
            Download PDF Edition
          </Link>
        </motion.div>
      </main>
    </MotionConfig>
  )
}

export { TodayPaper }
