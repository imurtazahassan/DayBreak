// ── Today's Paper — Home page ─────────────────────────────────────────────────
// Server component. Loads or builds today's edition, renders full newspaper.

import { Suspense } from 'react'
import Link from 'next/link'
import { loadLatestEdition, loadEdition } from '@/lib/services/storage'
import { getFallbackEdition } from '@/lib/services/edition-builder'
import { Masthead } from '@/components/shell/masthead'
import { TodayPaper } from '@/components/paper/today-paper'
import { BuildEditionButton } from '@/components/paper/build-edition-button'
import { todayKey, formatEditionDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  searchParams?: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const targetDate = params.date
  const today = todayKey()

  const edition = targetDate
    ? (loadEdition(targetDate) ?? (targetDate === today ? getFallbackEdition() : null) ?? loadLatestEdition() ?? getFallbackEdition())
    : (loadLatestEdition() ?? getFallbackEdition())

  const isArchivedView = targetDate && edition.editionDate !== today

  return (
    <div className="min-h-dvh bg-paper">
      {isArchivedView && (
        <div className="bg-brass/10 border-b border-brass/30 px-4 py-2.5 text-xs font-mono text-ink flex items-center justify-between">
          <span>
            📜 Viewing archived edition from <strong>{formatEditionDate(edition.editionDate)}</strong>
          </span>
          <Link
            href="/"
            className="text-forest hover:underline font-semibold flex items-center gap-1"
          >
            Back to Today&apos;s Paper &rarr;
          </Link>
        </div>
      )}

      <Masthead
        editionDate={edition.editionDate}
        editionNumber={edition.editionNumber}
        isDemo={edition.isDemo}
        totalReadingMinutes={edition.totalReadingMinutes}
      />

      {/* Build Edition button — visible for demo */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-rule">
        <p className="text-xs text-ink-faint font-mono">
          {edition.isDemo
            ? 'Showing demo edition — press button to ingest live RSS feeds'
            : isArchivedView
              ? `Archived edition · ${edition.items.length} stories`
              : `Live edition · ${edition.items.length} stories`}
        </p>
        {!isArchivedView && <BuildEditionButton />}
      </div>

      <Suspense fallback={<PaperSkeleton />}>
        <TodayPaper edition={edition} />
      </Suspense>
    </div>
  )
}

function PaperSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-64 bg-rule mb-6" />
      <div className="grid grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-rule w-1/3" />
            <div className="h-6 bg-rule" />
            <div className="h-4 bg-rule w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
