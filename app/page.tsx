// ── Today's Paper — Home page ─────────────────────────────────────────────────
// Server component. Loads or builds today's edition, renders full newspaper.

import { Suspense } from 'react'
import { loadLatestEdition } from '@/lib/services/storage'
import { getFallbackEdition } from '@/lib/services/edition-builder'
import { Masthead } from '@/components/shell/masthead'
import { TodayPaper } from '@/components/paper/today-paper'
import { BuildEditionButton } from '@/components/paper/build-edition-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const edition = loadLatestEdition() ?? getFallbackEdition()

  return (
    <div className="min-h-dvh bg-paper">
      <Masthead
        editionDate={edition.editionDate}
        editionNumber={edition.editionNumber}
        isDemo={edition.isDemo}
        totalReadingMinutes={edition.totalReadingMinutes}
      />

      {/* Build Edition button — always visible for demo */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-rule">
        <p className="text-xs text-ink-faint font-mono">
          {edition.isDemo
            ? 'Showing demo edition — press button to ingest live RSS feeds'
            : `Live edition · ${edition.items.length} stories`}
        </p>
        <BuildEditionButton />
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
