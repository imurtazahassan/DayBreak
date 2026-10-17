'use client'

import { useState, useCallback } from 'react'
import { Bookmark, EyeOff, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  articleId: string
  articleSlug: string
  categories: string[]
  sourceId: string
}

async function postFeedback(type: string, articleId: string) {
  await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, articleId, readerId: 'default' }),
  })
}

export function StoryFeedback({ articleId, categories, sourceId }: Props) {
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }, [])

  const handleSave = useCallback(async () => {
    const next = !saved
    setSaved(next)
    await postFeedback(next ? 'saved' : 'unsaved', articleId)
    showToast(next ? 'Saved to your library' : 'Removed from library')
  }, [saved, articleId, showToast])

  const handleMore = useCallback(async () => {
    await postFeedback('more_like_this', articleId)
    showToast('Got it — more like this')
  }, [articleId, showToast])

  const handleLess = useCallback(async () => {
    await postFeedback('less_like_this', articleId)
    showToast('Got it — less like this')
  }, [articleId, showToast])

  return (
    <div className="flex items-center gap-1 border-y border-rule py-3 mb-6 relative">
      <span className="text-xs text-ink-faint mr-3 font-mono">This story:</span>

      <button
        onClick={handleSave}
        aria-label={saved ? 'Unsave story' : 'Save story'}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors',
          saved
            ? 'bg-forest text-paper border-forest'
            : 'text-ink-soft border-rule hover:border-ink-soft hover:text-ink'
        )}
      >
        <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
        {saved ? 'Saved' : 'Save'}
      </button>

      <button
        onClick={handleMore}
        aria-label="More stories like this"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-rule text-ink-soft hover:border-forest hover:text-forest transition-colors"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        More like this
      </button>

      <button
        onClick={handleLess}
        aria-label="Fewer stories like this"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-rule text-ink-soft hover:border-terracotta hover:text-terracotta transition-colors"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        Less like this
      </button>

      {/* Toast */}
      {toast && (
        <span className="absolute right-0 text-xs text-ink-soft bg-paper border border-rule px-3 py-1.5 font-mono animate-in fade-in duration-200">
          {toast}
        </span>
      )}
    </div>
  )
}
