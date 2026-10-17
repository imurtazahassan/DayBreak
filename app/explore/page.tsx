'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES } from '@/lib/sources'
import { DEMO_ARTICLES } from '@/lib/demo-data'
import { cn, relativeTime } from '@/lib/utils'
import type { Article, ReaderProfile } from '@/lib/types'
import { Compass, Sparkles, Plus, Check, Bookmark, ArrowRight } from 'lucide-react'

export default function ExplorePage() {
  const [profile, setProfile] = useState<ReaderProfile | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [followedTopics, setFollowedTopics] = useState<string[]>([])
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // Load profile
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile)
          setFollowedTopics(data.profile.topics || [])
        }
      })
      .catch(() => {})

    // Load available edition/articles
    fetch('/api/edition/build')
      .then((res) => res.json())
      .then((data) => {
        if (data.edition?.items) {
          const list: Article[] = data.edition.items.map((i: { article: Article }) => i.article)
          setArticles(list.length > 0 ? list : DEMO_ARTICLES)
        } else {
          setArticles(DEMO_ARTICLES)
        }
      })
      .catch(() => {
        setArticles(DEMO_ARTICLES)
      })
  }, [])

  const showFeedbackToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleToggleTopic = async (topicKey: string) => {
    const isFollowed = followedTopics.includes(topicKey)
    const next = isFollowed
      ? followedTopics.filter((t) => t !== topicKey)
      : [...followedTopics, topicKey]

    setFollowedTopics(next)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: isFollowed ? 'topic_unfollow' : 'topic_follow',
        topic: topicKey,
      }),
    })

    showFeedbackToast(
      isFollowed
        ? `Unfollowed #${topicKey} — paper will reflect this change`
        : `Following #${topicKey} — added to your morning paper topics`
    )
  }

  const handleSaveArticle = async (article: Article) => {
    const nextSaved = new Set(savedArticles)
    const isSaved = nextSaved.has(article.id)

    if (isSaved) {
      nextSaved.delete(article.id)
    } else {
      nextSaved.add(article.id)
    }
    setSavedArticles(nextSaved)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: isSaved ? 'unsaved' : 'saved',
        articleId: article.id,
      }),
    })

    showFeedbackToast(isSaved ? 'Removed from saved stories' : 'Story saved to reading list')
  }

  // Filter articles
  const filtered =
    selectedCategory === 'all'
      ? articles
      : articles.filter((a) => a.categories.includes(selectedCategory))

  // Beyond your bubble: stories in categories reader does NOT currently follow
  const bubbleExploration = articles.filter(
    (a) => !a.categories.some((c) => followedTopics.includes(c))
  )
  const spotlightStory = bubbleExploration[0] ?? articles[articles.length - 1]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="border-b-2 border-ink pb-4 mb-8">
        <div className="flex items-center gap-2 text-forest mb-1">
          <Compass className="w-5 h-5" />
          <p className="kicker text-forest">Editorial Discovery</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">Explore Beyond Your Bubble</h1>
        <p className="text-ink-soft text-sm mt-1 max-w-2xl">
          A dedicated room to discover perspectives and subjects outside your habitual daily reading.
          Serendipity by design — because great newspapers broaden minds, not just confirm them.
        </p>
      </div>

      {/* ── Spotlight: Beyond Your Bubble Feature ── */}
      {spotlightStory && (
        <section className="mb-12 border border-brass bg-brass/5 p-6 md:p-8" aria-label="Beyond your bubble story">
          <div className="flex items-center gap-2 text-brass font-mono text-xs uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Beyond Your Bubble · Curated Discovery</span>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            {spotlightStory.imageUrl && (
              <div className="md:col-span-5 relative aspect-[16/10] bg-rule overflow-hidden">
                <Image
                  src={spotlightStory.imageUrl}
                  alt={spotlightStory.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            )}

            <div className={spotlightStory.imageUrl ? 'md:col-span-7' : 'md:col-span-12'}>
              <div className="flex items-center gap-3 mb-2">
                <span className="kicker text-terracotta">{spotlightStory.categories[0]}</span>
                <span className="text-[11px] font-mono text-ink-faint">
                  {spotlightStory.sourceName} · {spotlightStory.readingTimeMinutes} min read
                </span>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight mb-3">
                <Link href={`/story/${spotlightStory.slug}`} className="hover:underline">
                  {spotlightStory.title}
                </Link>
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                {spotlightStory.summary}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={`/story/${spotlightStory.slug}`}
                  className="inline-flex items-center gap-1.5 bg-forest text-paper px-4 py-2 text-xs font-medium hover:bg-forest-light transition-colors"
                >
                  Read story <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleSaveArticle(spotlightStory)}
                  className="inline-flex items-center gap-1 text-xs border border-rule px-3 py-2 text-ink-soft hover:border-ink hover:text-ink transition-colors"
                >
                  <Bookmark
                    className={cn(
                      'w-3.5 h-3.5',
                      savedArticles.has(spotlightStory.id) && 'fill-current text-forest'
                    )}
                  />
                  {savedArticles.has(spotlightStory.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Topic Explorer & Follow controls ── */}
      <section className="mb-8" aria-label="Topic directory">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-ink">Explore & Follow Topics</h2>
          <span className="text-xs font-mono text-ink-faint">
            Click to follow/unfollow
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isFollowed = followedTopics.includes(cat.key)
            return (
              <button
                key={cat.key}
                onClick={() => handleToggleTopic(cat.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors',
                  isFollowed
                    ? 'bg-forest text-paper border-forest font-medium'
                    : 'bg-paper text-ink border-rule hover:border-ink-soft'
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {isFollowed ? (
                  <Check className="w-3 h-3 ml-1" />
                ) : (
                  <Plus className="w-3 h-3 ml-1 text-ink-faint" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Filtered Stories Grid ── */}
      <section className="border-t border-rule pt-8" aria-label="Stories catalog">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="font-serif text-xl text-ink">Worthwhile Reads</h2>

          {/* Filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-2.5 py-1 transition-colors',
                selectedCategory === 'all'
                  ? 'bg-ink text-paper font-medium'
                  : 'text-ink-soft hover:text-ink'
              )}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={cn(
                  'px-2.5 py-1 transition-colors capitalize whitespace-nowrap',
                  selectedCategory === c.key
                    ? 'bg-ink text-paper font-medium'
                    : 'text-ink-soft hover:text-ink'
                )}
              >
                {c.key}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => {
            const isSaved = savedArticles.has(article.id)
            return (
              <article
                key={article.id}
                className="border border-rule bg-white p-5 flex flex-col justify-between hover:border-ink-soft transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-faint mb-2">
                    <span className="kicker text-terracotta">{article.categories[0]}</span>
                    <span>{relativeTime(article.publishedAt)}</span>
                  </div>

                  <h3 className="font-serif text-lg text-ink leading-snug mb-2">
                    <Link href={`/story/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>

                <div className="border-t border-rule/60 pt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-ink-faint">
                    {article.sourceName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveArticle(article)}
                      aria-label={isSaved ? 'Unsave' : 'Save'}
                      className="text-ink-soft hover:text-ink p-1"
                    >
                      <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-current text-forest')} />
                    </button>
                    <Link
                      href={`/story/${article.slug}`}
                      className="text-forest hover:text-forest-light font-mono text-[11px]"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Feedback Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 right-8 z-50 bg-ink text-paper px-4 py-2 text-xs font-mono shadow-md animate-in fade-in duration-150">
          {toast}
        </div>
      )}
    </div>
  )
}
