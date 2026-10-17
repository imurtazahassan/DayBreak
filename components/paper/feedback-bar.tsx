'use client'

import { useState, useCallback } from 'react'
import { Bookmark, EyeOff, ThumbsUp, ThumbsDown } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { cn } from '@/lib/utils'
import type { FeedbackType } from '@/lib/types'

// ── Types ────────────────────────────────────────────────────────────────────

interface FeedbackBarProps {
  articleId: string
  articleSlug: string
  categories: string[]
  sourceId: string
  initialSaved?: boolean
  onSkipped?: () => void
}

interface ToastState {
  message: string
  id: number
}

// ── API helper ───────────────────────────────────────────────────────────────

async function postFeedback(
  type: FeedbackType,
  articleId: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, articleId, ...extra }),
  })
}

// ── Toast ────────────────────────────────────────────────────────────────────

function InlineToast({ message }: { message: string }) {
  return (
    <motion.span
      key={message}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="ml-2 font-mono text-[10px] text-forest select-none"
      aria-live="polite"
    >
      {message}
    </motion.span>
  )
}

// ── Icon button ──────────────────────────────────────────────────────────────

interface IconBtnProps {
  onClick: () => void
  label: string
  active?: boolean
  activeClassName?: string
  children: React.ReactNode
}

function IconBtn({ onClick, label, active, activeClassName, children }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        // 32 px touch target, no border/bg by default
        'flex h-8 w-8 items-center justify-center border-0 bg-transparent',
        'text-ink-faint transition-colors duration-150',
        'hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        active && activeClassName,
      )}
    >
      {children}
    </button>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FeedbackBar({
  articleId,
  articleSlug: _articleSlug,
  categories: _categories,
  sourceId: _sourceId,
  initialSaved = false,
  onSkipped,
}: FeedbackBarProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [hidden, setHidden] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Auto-dismiss toast after 1.5 s
  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToast({ message, id })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 1500)
  }, [])

  const handleSave = useCallback(async () => {
    const next = !saved
    setSaved(next)
    showToast(next ? 'Saved' : 'Removed')
    try {
      await postFeedback(next ? 'saved' : 'unsaved', articleId)
    } catch {
      // Rollback on failure
      setSaved(!next)
      showToast('Error — try again')
    }
  }, [saved, articleId, showToast])

  const handleSkip = useCallback(async () => {
    showToast('Skipped')
    try {
      await postFeedback('skipped', articleId)
    } finally {
      // Give toast a moment to show, then hide
      setTimeout(() => {
        setHidden(true)
        onSkipped?.()
      }, 600)
    }
  }, [articleId, onSkipped, showToast])

  const handleMoreLike = useCallback(async () => {
    showToast('Got it!')
    await postFeedback('more_like_this', articleId).catch(() => void 0)
  }, [articleId, showToast])

  const handleLessLike = useCallback(async () => {
    showToast('Got it!')
    await postFeedback('less_like_this', articleId).catch(() => void 0)
  }, [articleId, showToast])

  if (hidden) return null

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex items-center" role="group" aria-label="Story feedback actions">
        {/* Bookmark */}
        <IconBtn
          onClick={handleSave}
          label={saved ? 'Unsave story' : 'Save story'}
          active={saved}
          activeClassName="text-forest"
        >
          <Bookmark
            size={15}
            strokeWidth={1.75}
            className={cn('transition-all duration-150', saved && 'fill-forest')}
          />
        </IconBtn>

        {/* Skip */}
        <IconBtn onClick={handleSkip} label="Skip story">
          <EyeOff size={15} strokeWidth={1.75} />
        </IconBtn>

        {/* More like this */}
        <IconBtn onClick={handleMoreLike} label="More stories like this">
          <ThumbsUp size={15} strokeWidth={1.75} />
        </IconBtn>

        {/* Less like this */}
        <IconBtn onClick={handleLessLike} label="Less stories like this">
          <ThumbsDown size={15} strokeWidth={1.75} />
        </IconBtn>

        {/* Inline toast */}
        <AnimatePresence mode="wait">
          {toast && <InlineToast key={toast.id} message={toast.message} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

export { FeedbackBar }
