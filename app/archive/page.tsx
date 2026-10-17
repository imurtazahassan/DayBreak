// ── Archive page: /archive ────────────────────────────────────────────────────

import Link from 'next/link'
import { loadEditionIndex, loadEdition } from '@/lib/services/storage'
import { buildDemoEdition } from '@/lib/demo-data'
import { formatEditionDate } from '@/lib/utils'
import { DemoBadge } from '@/components/ui/demo-badge'
import { FileText, Download } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Archive' }
export const dynamic = 'force-dynamic'

export default function ArchivePage() {
  const index = loadEditionIndex()

  // If no editions built yet, show the demo edition in archive
  const demoEdition = buildDemoEdition()
  const editions =
    index.length > 0
      ? index.map((date) => loadEdition(date)).filter(Boolean)
      : [demoEdition]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 mb-8">
        <p className="kicker text-terracotta mb-1">Past Editions</p>
        <h1 className="font-serif text-4xl text-ink">Archive</h1>
        <p className="text-ink-soft text-sm mt-1">
          Each edition is an immutable snapshot — stories from that day, exactly as ranked.
        </p>
      </div>

      {editions.length === 0 && (
        <div className="text-center py-16 text-ink-faint">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-serif text-xl">No editions yet</p>
          <p className="text-sm mt-2">Build your first edition from the home page.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-forest underline">
            Go to today&apos;s paper
          </Link>
        </div>
      )}

      <div className="space-y-px">
        {editions.map((edition) => {
          if (!edition) return null
          const dateLabel = formatEditionDate(edition.editionDate)
          const isToday =
            edition.editionDate === new Date().toISOString().slice(0, 10)

          return (
            <div
              key={edition.id}
              className="flex items-center justify-between py-4 border-b border-rule group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="font-mono text-[10px] text-ink-faint uppercase tracking-wider">
                    Edition {edition.editionNumber}
                  </span>
                  {edition.isDemo && <DemoBadge />}
                  {isToday && (
                    <span className="font-mono text-[10px] bg-forest text-paper px-1.5 py-0.5 uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
                <Link href={`/?date=${edition.editionDate}`} className="block">
                  <h2 className="font-serif text-xl text-ink group-hover:text-forest transition-colors leading-snug">
                    {dateLabel}
                  </h2>
                </Link>
                <p className="text-xs text-ink-faint mt-1">
                  {edition.items.length} stories · {edition.totalReadingMinutes} min read ·{' '}
                  {edition.label === 'live' ? 'Live edition' : 'Demo edition'}
                </p>
                {/* Top 3 headlines preview */}
                <div className="mt-2 space-y-0.5">
                  {edition.items.slice(0, 3).map((item) => (
                    <p key={item.articleId} className="text-xs text-ink-soft truncate">
                      · {item.article.title}
                    </p>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link
                  href={`/?date=${edition.editionDate}`}
                  className="text-xs text-ink-soft border border-rule px-3 py-1.5 hover:border-ink-soft hover:text-ink transition-colors"
                >
                  Read
                </Link>
                <a
                  href={`/api/pdf/${edition.editionDate}`}
                  download
                  className="flex items-center gap-1.5 text-xs bg-forest text-paper px-3 py-1.5 hover:bg-forest-light transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
