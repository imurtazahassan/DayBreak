// ── PDF Renderer ──────────────────────────────────────────────────────────────
// Renders an Edition to a PDF buffer using @react-pdf/renderer.
// Server-side only. Never import from client components.
// A4, custom masthead, date, lead story, multi-column sections, page numbers.

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import React from 'react'
import type { Edition, EditionItem } from '@/lib/types'

// ── Styles ────────────────────────────────────────────────────────────────────
const PAPER = '#F7F4ED'
const INK = '#202722'
const INK_SOFT = '#4A5150'
const FOREST = '#25483D'
const TERRACOTTA = '#B84B37'
const RULE = '#D4CFC6'
const BRASS = '#D9B66F'

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    color: INK,
    fontSize: 9,
  },
  // Masthead
  mastheadRule: {
    borderTopWidth: 3,
    borderTopColor: INK,
    marginBottom: 4,
  },
  mastheadTitle: {
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: 8,
    color: INK,
    marginBottom: 2,
  },
  mastheadTagline: {
    fontSize: 8,
    textAlign: 'center',
    color: INK_SOFT,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  mastheadMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: RULE,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 3,
    marginBottom: 10,
  },
  mastheadMetaText: {
    fontSize: 7,
    color: INK_SOFT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  demoBadge: {
    fontSize: 7,
    color: TERRACOTTA,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: TERRACOTTA,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  // Section header
  sectionHeader: {
    borderTopWidth: 2,
    borderTopColor: INK,
    marginTop: 12,
    marginBottom: 4,
    paddingTop: 3,
  },
  sectionTitle: {
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: FOREST,
    fontFamily: 'Helvetica-Bold',
  },
  // Lead story
  leadContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingBottom: 10,
  },
  leadImage: {
    width: '100%',
    height: 160,
    objectFit: 'cover',
    marginBottom: 6,
  },
  leadKicker: {
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: TERRACOTTA,
    marginBottom: 2,
  },
  leadHeadline: {
    fontSize: 22,
    lineHeight: 1.2,
    color: INK,
    marginBottom: 4,
  },
  leadSummary: {
    fontSize: 9.5,
    lineHeight: 1.6,
    color: INK_SOFT,
  },
  leadSource: {
    fontSize: 7,
    color: INK_SOFT,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Standard story
  storyContainer: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  storyKicker: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: TERRACOTTA,
    marginBottom: 1,
  },
  storyHeadline: {
    fontSize: 11,
    lineHeight: 1.3,
    color: INK,
    marginBottom: 2,
  },
  storySummary: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: INK_SOFT,
  },
  storyMeta: {
    fontSize: 7,
    color: INK_SOFT,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Brief story
  briefContainer: {
    marginBottom: 4,
    paddingBottom: 4,
  },
  briefHeadline: {
    fontSize: 9,
    color: INK,
    lineHeight: 1.3,
  },
  briefMeta: {
    fontSize: 7,
    color: INK_SOFT,
    fontStyle: 'italic',
  },
  // Columns
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 3,
  },
  footerText: {
    fontSize: 7,
    color: INK_SOFT,
  },
})

// ── Components ────────────────────────────────────────────────────────────────

function Masthead({ edition }: { edition: Edition }) {
  const dateStr = new Date(edition.editionDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()

  return (
    <View>
      <View style={styles.mastheadRule} />
      <Text style={styles.mastheadTitle}>DAYBREAK</Text>
      <Text style={styles.mastheadTagline}>A world of news, shaped around you</Text>
      <View style={styles.mastheadMeta}>
        <Text style={styles.mastheadMetaText}>{dateStr}</Text>
        {edition.isDemo && <Text style={styles.demoBadge}>DEMO EDITION</Text>}
        <Text style={styles.mastheadMetaText}>EDITION No. {edition.editionNumber}</Text>
      </View>
    </View>
  )
}

function LeadStory({ item }: { item: EditionItem }) {
  const { article } = item
  const hasImage = !!article.imageUrl

  return (
    <View style={styles.leadContainer} wrap={false}>
      {hasImage && (
        <Image
          src={article.imageUrl!}
          style={styles.leadImage}
        />
      )}
      <Text style={styles.leadKicker}>{article.categories[0] ?? 'News'}</Text>
      <Text style={styles.leadHeadline}>{article.title}</Text>
      <Text style={styles.leadSummary}>{article.summary}</Text>
      <Text style={styles.leadSource}>
        {article.sourceName} · {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
      </Text>
    </View>
  )
}

function StandardStory({ item }: { item: EditionItem }) {
  const { article } = item
  return (
    <View style={styles.storyContainer} wrap={false}>
      <Text style={styles.storyKicker}>{article.categories[0] ?? 'News'}</Text>
      <Text style={styles.storyHeadline}>{article.title}</Text>
      <Text style={styles.storySummary}>{article.summary}</Text>
      <Text style={styles.storyMeta}>
        {article.sourceName} · {article.readingTimeMinutes} min read
      </Text>
    </View>
  )
}

function BriefStory({ item }: { item: EditionItem }) {
  const { article } = item
  return (
    <View style={styles.briefContainer}>
      <Text style={styles.briefHeadline}>{article.title}</Text>
      <Text style={styles.briefMeta}>{article.sourceName}</Text>
    </View>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title.replace(/-/g, ' ')}</Text>
    </View>
  )
}

function PageFooter({ date, number }: { date: string; number: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>DAYBREAK · {date}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
        `${pageNumber} of ${totalPages}`
      } />
      <Text style={styles.footerText}>Edition No. {number}</Text>
    </View>
  )
}

// ── Main renderer ─────────────────────────────────────────────────────────────

function EditionDocument({ edition }: { edition: Edition }) {
  const leadItem = edition.items.find((i) => i.sectionKey === 'lead') ?? edition.items[0]
  const nonLeadItems = edition.items.filter((i) => i !== leadItem)

  // Group by section
  const sections = new Map<string, EditionItem[]>()
  for (const item of nonLeadItems) {
    const key = item.sectionKey
    if (!sections.has(key)) sections.set(key, [])
    sections.get(key)!.push(item)
  }

  const orderedSections = edition.sectionOrder
    .filter((s) => s !== 'lead' && sections.has(s))
    .map((s) => ({ key: s, items: sections.get(s)! }))

  const dateStr = new Date(edition.editionDate).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase()

  return (
    <Document
      title={`DAYBREAK — ${dateStr}`}
      author="DAYBREAK"
      subject="Personalized Morning Paper"
    >
      <Page size="A4" style={styles.page}>
        <Masthead edition={edition} />

        {leadItem && <LeadStory item={leadItem} />}

        {orderedSections.map(({ key, items }) => {
          const featured = items.filter((i) => i.size === 'featured' || i.size === 'standard')
          const briefs = items.filter((i) => i.size === 'brief')

          return (
            <View key={key}>
              <SectionHeader title={key} />
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  {featured.slice(0, Math.ceil(featured.length / 2)).map((item) => (
                    <StandardStory key={item.articleId} item={item} />
                  ))}
                </View>
                <View style={styles.column}>
                  {featured.slice(Math.ceil(featured.length / 2)).map((item) => (
                    <StandardStory key={item.articleId} item={item} />
                  ))}
                  {briefs.map((item) => (
                    <BriefStory key={item.articleId} item={item} />
                  ))}
                </View>
              </View>
            </View>
          )
        })}

        <PageFooter date={dateStr} number={edition.editionNumber} />
      </Page>
    </Document>
  )
}

export async function renderEditionPDF(edition: Edition): Promise<Buffer> {
  const doc = React.createElement(EditionDocument, { edition })
  return await renderToBuffer(doc as any)
}
