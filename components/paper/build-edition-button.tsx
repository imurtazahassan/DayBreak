'use client'

import { useState, useCallback } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type BuildState = 'idle' | 'loading' | 'success' | 'error'

// ── Component ────────────────────────────────────────────────────────────────

export default function BuildEditionButton() {
  const [state, setState] = useState<BuildState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleBuild = useCallback(async () => {
    if (state === 'loading') return

    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/edition/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRebuild: true }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      setState('success')

      // Reset to idle after 3 s
      setTimeout(() => setState('idle'), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(message)
      setState('error')
      // Reset error state after 4 s
      setTimeout(() => {
        setState('idle')
        setErrorMsg(null)
      }, 4000)
    }
  }, [state])

  const isLoading = state === 'loading'
  const isSuccess = state === 'success'
  const isError = state === 'error'

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleBuild}
        disabled={isLoading}
        aria-label="Build new edition"
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1',
          'text-xs font-mono transition-colors duration-150',
          'border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
          // default / error
          !isSuccess &&
            'border-forest/30 text-forest hover:bg-forest hover:text-paper disabled:cursor-not-allowed disabled:opacity-60',
          // success
          isSuccess && 'border-forest bg-forest text-paper cursor-default',
          // error override
          isError && 'border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-paper',
        )}
      >
        {/* Icon slot */}
        {isLoading && (
          <Loader2 size={12} className="animate-spin shrink-0" aria-hidden="true" />
        )}
        {isSuccess && (
          <CheckCircle2 size={12} className="shrink-0" aria-hidden="true" />
        )}

        {/* Label */}
        {isLoading && 'Building…'}
        {isSuccess && 'Edition Built!'}
        {isError && 'Build Failed'}
        {state === 'idle' && 'Build Edition'}
      </button>

      {/* Sub-labels */}
      {isSuccess && (
        <span className="text-[10px] font-mono text-ink-faint" aria-live="polite">
          Refresh to see new edition
        </span>
      )}
      {isError && errorMsg && (
        <span className="text-[10px] font-mono text-terracotta" aria-live="assertive">
          {errorMsg}
        </span>
      )}
    </div>
  )
}

export { BuildEditionButton }
