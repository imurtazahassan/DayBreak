// ── API: Profile (onboarding save + read) ────────────────────────────────────

import { NextResponse } from 'next/server'
import type { ReaderProfile } from '@/lib/types'
import { loadProfile, saveProfile } from '@/lib/services/storage'
import { DEFAULT_PROFILE } from '@/lib/demo-data'
import { nanoid } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const profile = loadProfile('default') ?? {
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
    }
    return NextResponse.json({ profile })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const existing = loadProfile('default')
    const now = new Date().toISOString()

    const profile: ReaderProfile = {
      ...DEFAULT_PROFILE,
      ...existing,
      ...body,
      id: existing?.id ?? nanoid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      hasCompletedOnboarding: true,
    }

    saveProfile(profile)
    return NextResponse.json({ success: true, profile })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
