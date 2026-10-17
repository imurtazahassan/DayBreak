// ── Vercel Cron: Build daily editions ─────────────────────────────────────────
// Triggered daily at 5:00 AM PKT (midnight UTC)
// Configured in vercel.json

import { NextResponse } from 'next/server'
import { buildEditionForProfile } from '@/lib/services/edition-builder'
import { loadProfile, saveProfile } from '@/lib/services/storage'
import { DEFAULT_PROFILE } from '@/lib/demo-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let profile = loadProfile('default')
    if (!profile) {
      profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }
      saveProfile(profile)
    }

    const edition = await buildEditionForProfile(profile, false)
    console.log(`[cron] Built edition ${edition.editionDate} with ${edition.items.length} items`)

    return NextResponse.json({
      success: true,
      editionDate: edition.editionDate,
      itemCount: edition.items.length,
      isDemo: edition.isDemo,
    })
  } catch (err) {
    console.error('[cron] Failed to build edition:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
