// ── Storage Service ────────────────────────────────────────────────────────────
// Thin abstraction over JSON file storage (local fallback).
// Drop-in: swap this module for a Supabase client later.
// Server-side only.

import fs from 'fs'
import path from 'path'
import type { Article, Edition, FeedbackEvent, ReaderProfile } from '@/lib/types'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Articles ──────────────────────────────────────────────────────────────────

export function saveArticles(articles: Article[]): void {
  const file = path.join(DATA_DIR, 'articles.json')
  const existing = readJson<Article[]>(file, [])
  const map = new Map(existing.map((a) => [a.url, a]))
  for (const a of articles) map.set(a.url, a)
  writeJson(file, Array.from(map.values()))
}

export function loadArticles(): Article[] {
  return readJson<Article[]>(path.join(DATA_DIR, 'articles.json'), [])
}

export function loadArticleBySlug(slug: string): Article | null {
  const articles = loadArticles()
  return articles.find((a) => a.slug === slug) ?? null
}

// ── Editions ──────────────────────────────────────────────────────────────────

export function saveEdition(edition: Edition): void {
  const dir = path.join(DATA_DIR, 'editions')
  ensureDir(dir)
  writeJson(path.join(dir, `${edition.editionDate}.json`), edition)
  // Index file
  const indexFile = path.join(DATA_DIR, 'editions-index.json')
  const index = readJson<string[]>(indexFile, [])
  if (!index.includes(edition.editionDate)) {
    index.unshift(edition.editionDate)
    index.sort((a, b) => b.localeCompare(a))
    writeJson(indexFile, index)
  }
}

export function loadEdition(date: string): Edition | null {
  const file = path.join(DATA_DIR, 'editions', `${date}.json`)
  if (!fs.existsSync(file)) return null
  return readJson<Edition>(file, null as unknown as Edition)
}

export function loadLatestEdition(): Edition | null {
  const index = readJson<string[]>(path.join(DATA_DIR, 'editions-index.json'), [])
  if (index.length === 0) return null
  return loadEdition(index[0])
}

export function loadEditionIndex(): string[] {
  return readJson<string[]>(path.join(DATA_DIR, 'editions-index.json'), [])
}

// ── Reader profiles ───────────────────────────────────────────────────────────
// In MVP: one anonymous profile, keyed by 'default'

export function loadProfile(id = 'default'): ReaderProfile | null {
  return readJson<ReaderProfile | null>(
    path.join(DATA_DIR, 'profiles', `${id}.json`),
    null
  )
}

export function saveProfile(profile: ReaderProfile): void {
  const dir = path.join(DATA_DIR, 'profiles')
  ensureDir(dir)
  writeJson(path.join(dir, `${profile.id}.json`), profile)
}

// ── Feedback events ───────────────────────────────────────────────────────────

export function saveFeedbackEvent(event: FeedbackEvent): void {
  const file = path.join(DATA_DIR, 'feedback.json')
  const events = readJson<FeedbackEvent[]>(file, [])
  events.push(event)
  // Keep last 1000 events
  writeJson(file, events.slice(-1000))
}

export function loadFeedbackEvents(readerId = 'default'): FeedbackEvent[] {
  const events = readJson<FeedbackEvent[]>(
    path.join(DATA_DIR, 'feedback.json'),
    []
  )
  return events.filter((e) => e.readerId === readerId)
}
