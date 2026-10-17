// ── Gemini AI Editorial Enrichment Service ──────────────────────────────────
// Server-side only. Used for:
// 1. "Why this matters to you" single-sentence reader synthesis
// 2. Intelligent topic tagging
// Cached in-memory and in edition snapshot — NEVER called repeatedly per page view.
// Graceful fallback: If Gemini fails, times out, or key is missing, returns deterministic editorial text.

interface WhyItMattersInput {
  title: string
  summary: string
  categories: string[]
  readerPersona?: string
  readerTopics?: string[]
}

// In-memory cache to guarantee zero redundant API calls
const cache = new Map<string, string>()

export async function generateWhyItMatters(input: WhyItMattersInput): Promise<string> {
  const { title, summary, categories, readerPersona = 'Pakistani university student', readerTopics = ['Technology', 'Climate', 'Business'] } = input

  // Cache key based on article title
  const cacheKey = `why_${title.slice(0, 40)}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return getFallbackWhyItMatters(categories, readerTopics)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000) // 4s timeout

    const prompt = `You are a distinguished newspaper editor for DAYBREAK. Write exactly ONE concise, thoughtful sentence (under 25 words) explaining why this story directly impacts a reader who is a ${readerPersona} interested in ${readerTopics.join(', ')}.

Headline: ${title}
Summary: ${summary}

Answer with only the single sentence. Do not include quotes, greetings, or prefixes.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 60,
          },
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      console.warn(`[gemini] API call returned status ${res.status}. Using fallback.`)
      return getFallbackWhyItMatters(categories, readerTopics)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (text) {
      cache.set(cacheKey, text)
      return text
    }

    return getFallbackWhyItMatters(categories, readerTopics)
  } catch (err) {
    console.warn('[gemini] Service unavailable or timed out. Falling back to editorial rule.')
    return getFallbackWhyItMatters(categories, readerTopics)
  }
}

function getFallbackWhyItMatters(categories: string[], readerTopics: string[]): string {
  const matched = categories.filter((c) =>
    readerTopics.map((t) => t.toLowerCase()).includes(c.toLowerCase())
  )
  if (matched.length > 0) {
    return `Directly impacts your monitored interests in ${matched.join(' and ')}, offering key context for regional developments.`
  }
  return `Broadens your perspective beyond routine coverage with key updates in ${categories.join(', ')}.`
}
