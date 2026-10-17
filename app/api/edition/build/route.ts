// ── API: Build Edition (manual trigger + cron target) ─────────────────────────
// POST /api/edition/build  — builds today's edition
// GET  /api/edition/build  — returns today's edition (or builds if missing)

import { NextResponse } from 'next/server'
import { buildEditionForProfile, getFallbackEdition } from '@/lib/services/edition-builder'
import { loadProfile, saveProfile } from '@/lib/services/storage'
import { DEFAULT_PROFILE } from '@/lib/demo-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let profile = loadProfile('default')
    if (!profile) {
      profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }
      saveProfile(profile)
    }

    const edition = await buildEditionForProfile(profile)
    return NextResponse.json({ success: true, edition })
  } catch (err) {
    console.error('[/api/edition/build GET]', err)
    const fallback = getFallbackEdition()
    return NextResponse.json({ success: true, edition: fallback, fallback: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const forceRebuild = body?.forceRebuild === true

    let profile = loadProfile('default')
    if (!profile) {
      profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }
      saveProfile(profile)
    }

    const edition = await buildEditionForProfile(profile, forceRebuild)
    return NextResponse.json({ success: true, edition })
  } catch (err) {
    console.error('[/api/edition/build POST]', err)
    const fallback = getFallbackEdition()
    return NextResponse.json(
      { success: false, error: String(err), edition: fallback, fallback: true },
      { status: 500 }
    )
  }
}
