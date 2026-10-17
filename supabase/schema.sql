-- ==============================================================================
-- DAYBREAK — Supabase Postgres Database Schema
-- NaSCon '26 Hackathon (Eynvision) · Category: Personal Morning Paper
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE: readers
-- Stores reader profiles, onboarding choices, and dynamically updated weights.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.readers (
    id TEXT PRIMARY KEY DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    display_name TEXT,
    topics TEXT[] DEFAULT ARRAY['technology', 'business', 'climate', 'pakistan']::TEXT[],
    regions TEXT[] DEFAULT ARRAY['pakistan', 'global', 'south-asia']::TEXT[],
    languages TEXT[] DEFAULT ARRAY['en']::TEXT[],
    reading_depth TEXT DEFAULT 'standard',
    preferred_sources TEXT[] DEFAULT ARRAY['dawn-pakistan', 'techcrunch', 'carbon-brief']::TEXT[],
    content_to_avoid TEXT[] DEFAULT ARRAY[]::TEXT[],
    topic_weights JSONB DEFAULT '[]'::JSONB,
    source_weights JSONB DEFAULT '[]'::JSONB,
    has_completed_onboarding BOOLEAN DEFAULT FALSE
);

-- ==============================================================================
-- TABLE: sources
-- Curated verified RSS and Atom news feeds.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    feed_url TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    region TEXT NOT NULL DEFAULT 'global',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: articles
-- Normalized article summaries ingested from feeds (never copies full article text).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    source_id TEXT NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    language TEXT NOT NULL DEFAULT 'en',
    region TEXT NOT NULL DEFAULT 'global',
    image_url TEXT,
    image_alt TEXT,
    image_credit TEXT,
    reading_time_minutes INTEGER NOT NULL DEFAULT 3,
    label TEXT NOT NULL DEFAULT 'live'
);

-- ==============================================================================
-- TABLE: editions
-- Immutable daily newspaper edition snapshots.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.editions (
    id TEXT PRIMARY KEY,
    edition_date DATE NOT NULL,
    edition_number INTEGER NOT NULL,
    reader_id TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    section_order TEXT[] NOT NULL DEFAULT ARRAY['lead']::TEXT[],
    total_reading_minutes INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL DEFAULT 'live',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_reader_edition_date UNIQUE (reader_id, edition_date)
);

-- ==============================================================================
-- TABLE: edition_items
-- Ordered snapshot of articles assigned to each edition, including score breakdowns.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.edition_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edition_id TEXT NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    size TEXT NOT NULL DEFAULT 'standard',
    section_key TEXT NOT NULL DEFAULT 'world',
    score_breakdown JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: feedback_events
-- User actions (open, read, save, skip, more/less like this, follow/unfollow).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feedback_events (
    id TEXT PRIMARY KEY,
    reader_id TEXT NOT NULL DEFAULT 'default',
    article_id TEXT,
    topic TEXT,
    source_id TEXT,
    type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    context JSONB DEFAULT '{}'::JSONB
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_categories ON public.articles USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_editions_date ON public.editions(edition_date DESC);
CREATE INDEX IF NOT EXISTS idx_edition_items_edition ON public.edition_items(edition_id, rank ASC);
CREATE INDEX IF NOT EXISTS idx_feedback_reader ON public.feedback_events(reader_id, timestamp DESC);

-- ==============================================================================
-- SEED DATA: 8 VERIFIED PUBLIC RSS FEEDS
-- ==============================================================================
INSERT INTO public.sources (id, name, url, feed_url, category, language, region, is_active)
VALUES
    ('bbc-world', 'BBC News', 'https://www.bbc.com/news', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'world', 'en', 'global', TRUE),
    ('dawn-pakistan', 'Dawn', 'https://www.dawn.com', 'https://www.dawn.com/feed', 'world', 'en', 'pakistan', TRUE),
    ('reuters-business', 'Reuters Business', 'https://www.reuters.com', 'https://feeds.reuters.com/reuters/businessNews', 'business', 'en', 'global', TRUE),
    ('techcrunch', 'TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', 'technology', 'en', 'global', TRUE),
    ('ars-technica', 'Ars Technica', 'https://arstechnica.com', 'https://feeds.arstechnica.com/arstechnica/index', 'technology', 'en', 'global', TRUE),
    ('carbon-brief', 'Carbon Brief', 'https://www.carbonbrief.org', 'https://www.carbonbrief.org/feed', 'climate', 'en', 'global', TRUE),
    ('nasa-news', 'NASA News', 'https://www.nasa.gov/news', 'https://www.nasa.gov/rss/dyn/breaking_news.rss', 'science', 'en', 'global', TRUE),
    ('guardian-sport', 'The Guardian Sport', 'https://www.theguardian.com/sport', 'https://www.theguardian.com/sport/rss', 'sports', 'en', 'global', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    feed_url = EXCLUDED.feed_url,
    category = EXCLUDED.category,
    region = EXCLUDED.region;

-- ==============================================================================
-- SEED DATA: DEFAULT READER PERSONA (Pakistani student into tech, business, climate)
-- ==============================================================================
INSERT INTO public.readers (
    id,
    display_name,
    topics,
    regions,
    languages,
    reading_depth,
    preferred_sources,
    content_to_avoid,
    topic_weights,
    source_weights,
    has_completed_onboarding
)
VALUES (
    'default',
    'Student Persona',
    ARRAY['technology', 'business', 'climate', 'pakistan']::TEXT[],
    ARRAY['pakistan', 'global', 'south-asia']::TEXT[],
    ARRAY['en']::TEXT[],
    'standard',
    ARRAY['dawn-pakistan', 'techcrunch', 'carbon-brief']::TEXT[],
    ARRAY[]::TEXT[],
    '[
        {"topic": "technology", "weight": 0.8, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "business", "weight": 0.75, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "climate", "weight": 0.7, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "pakistan", "weight": 0.9, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "science", "weight": 0.5, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "sports", "weight": 0.3, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"topic": "world", "weight": 0.6, "lastUpdated": "2026-10-17T00:00:00Z"}
    ]'::JSONB,
    '[
        {"sourceId": "dawn-pakistan", "weight": 0.9, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"sourceId": "techcrunch", "weight": 0.8, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"sourceId": "carbon-brief", "weight": 0.75, "lastUpdated": "2026-10-17T00:00:00Z"},
        {"sourceId": "reuters-business", "weight": 0.7, "lastUpdated": "2026-10-17T00:00:00Z"}
    ]'::JSONB,
    FALSE
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive read/write policies for anonymous sessions (no login required for demo).
-- ==============================================================================
ALTER TABLE public.readers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Allow public read on articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on articles" ON public.articles FOR ALL USING (true);
CREATE POLICY "Allow public read on editions" ON public.editions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on editions" ON public.editions FOR ALL USING (true);
CREATE POLICY "Allow public read on edition_items" ON public.edition_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on edition_items" ON public.edition_items FOR ALL USING (true);
CREATE POLICY "Allow public all on readers" ON public.readers FOR ALL USING (true);
CREATE POLICY "Allow public insert on feedback_events" ON public.feedback_events FOR ALL USING (true);
