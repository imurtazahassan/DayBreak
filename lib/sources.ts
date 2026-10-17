// ── RSS Feed Sources — all verified publicly accessible ──────────────────────
// Rule: store title, summary, URL, source, publishedAt, imageUrl only.
// Never copy full article text.

import type { Source } from '@/lib/types'

export const RSS_SOURCES: Source[] = [
  {
    id: 'bbc-world',
    name: 'BBC News',
    url: 'https://www.bbc.com/news',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'dawn-pakistan',
    name: 'Dawn',
    url: 'https://www.dawn.com',
    feedUrl: 'https://www.dawn.com/feed',
    category: 'world',
    language: 'en',
    region: 'pakistan',
    isActive: true,
  },
  {
    id: 'reuters-business',
    name: 'Reuters Business',
    url: 'https://www.reuters.com',
    feedUrl: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'business',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    feedUrl: 'https://techcrunch.com/feed/',
    category: 'technology',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    url: 'https://arstechnica.com',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'carbon-brief',
    name: 'Carbon Brief',
    url: 'https://www.carbonbrief.org',
    feedUrl: 'https://www.carbonbrief.org/feed',
    category: 'climate',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'nasa-news',
    name: 'NASA News',
    url: 'https://www.nasa.gov/news',
    feedUrl: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'science',
    language: 'en',
    region: 'global',
    isActive: true,
  },
  {
    id: 'guardian-sport',
    name: 'The Guardian Sport',
    url: 'https://www.theguardian.com/sport',
    feedUrl: 'https://www.theguardian.com/sport/rss',
    category: 'sports',
    language: 'en',
    region: 'global',
    isActive: true,
  },
]

export const CATEGORIES = [
  { key: 'world',      label: 'World',           emoji: '🌍' },
  { key: 'pakistan',   label: 'Pakistan & South Asia', emoji: '🇵🇰' },
  { key: 'business',   label: 'Business',         emoji: '📈' },
  { key: 'technology', label: 'Technology & AI',  emoji: '💡' },
  { key: 'science',    label: 'Science',           emoji: '🔬' },
  { key: 'climate',    label: 'Climate',           emoji: '🌿' },
  { key: 'sports',     label: 'Sports',            emoji: '⚽' },
  { key: 'culture',    label: 'Culture',           emoji: '🎭' },
  { key: 'health',     label: 'Health',            emoji: '🫀' },
]

export const REGIONS = [
  { key: 'global',      label: 'Global' },
  { key: 'pakistan',    label: 'Pakistan' },
  { key: 'south-asia',  label: 'South Asia' },
  { key: 'middle-east', label: 'Middle East' },
  { key: 'us',          label: 'United States' },
  { key: 'uk',          label: 'United Kingdom' },
  { key: 'europe',      label: 'Europe' },
]
