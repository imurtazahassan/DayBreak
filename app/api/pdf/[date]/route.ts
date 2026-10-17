// ── API: PDF generation ───────────────────────────────────────────────────────
// GET /api/pdf/[date]  — streams a PDF for the given edition date

import { NextResponse } from 'next/server'
import { loadEdition, loadLatestEdition } from '@/lib/services/storage'
import { getFallbackEdition } from '@/lib/services/edition-builder'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params
    const edition =
      date === 'latest'
        ? (loadLatestEdition() ?? getFallbackEdition())
        : (loadEdition(date) ?? getFallbackEdition())

    // Dynamically import to avoid bundling @react-pdf/renderer on client
    const { renderEditionPDF } = await import('@/lib/services/pdf-renderer')
    const pdfBuffer = await renderEditionPDF(edition)

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="daybreak-${edition.editionDate}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[/api/pdf]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
