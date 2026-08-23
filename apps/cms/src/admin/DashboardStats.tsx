import React from 'react'
import type { ServerProps } from 'payload'

/**
 * DashboardStats — overview cards di atas dashboard admin Payload.
 * Server Component (async): query counts + recent activity langsung via
 * `payload` local API (no HTTP). Didaftarkan di config
 * `admin.components.beforeDashboard`.
 *
 * Styling pakai CSS variable tema Payload (`--theme-elevation-*`, `--theme-text`)
 * supaya konsisten di light & dark mode.
 */

type Payload = ServerProps['payload']

// Collections yang ikut "recent activity" — beserta field judulnya.
const ACTIVITY_COLLECTIONS: { slug: string; titleField: string; label: string }[] = [
  { slug: 'pages', titleField: 'title', label: 'Page' },
  { slug: 'service-types', titleField: 'name', label: 'Service Type' },
  { slug: 'testimonials', titleField: 'name', label: 'Testimonial' },
  { slug: 'accommodations', titleField: 'name', label: 'Accommodation' },
  { slug: 'tours', titleField: 'title', label: 'Tour' },
  { slug: 'water-activities', titleField: 'title', label: 'Water Activity' },
  { slug: 'yachts', titleField: 'name', label: 'Yacht' },
  { slug: 'restaurants', titleField: 'name', label: 'Restaurant' },
  { slug: 'venues', titleField: 'name', label: 'Venue' },
  { slug: 'rentals', titleField: 'title', label: 'Rental' },
  { slug: 'spa', titleField: 'title', label: 'Spa' },
  { slug: 'destinations', titleField: 'name', label: 'Destination' },
  { slug: 'media', titleField: 'alt', label: 'Media' },
]

const safeCount = async (payload: Payload, collection: string, where?: any): Promise<number> => {
  try {
    const res = await payload.count({ collection: collection as any, where })
    return res.totalDocs
  } catch {
    return 0
  }
}

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

type Recent = { collection: string; label: string; title: string; updatedAt: string; url: string }

const DashboardStats = async ({ payload }: ServerProps) => {
  // ── Counts ──────────────────────────────────────────────
  const [pagesPublished, pagesDraft, servicesActive, testimonials, media] = await Promise.all([
    safeCount(payload, 'pages', { status: { equals: 'published' } }),
    safeCount(payload, 'pages', { status: { equals: 'draft' } }),
    safeCount(payload, 'service-types', { status: { equals: 'active' } }),
    safeCount(payload, 'testimonials'),
    safeCount(payload, 'media'),
  ])

  // ── Recent activity (last 5 edits across collections) ───
  const recents: Recent[] = []
  await Promise.all(
    ACTIVITY_COLLECTIONS.map(async ({ slug, titleField, label }) => {
      try {
        const res = await payload.find({
          collection: slug as any,
          sort: '-updatedAt',
          limit: 5,
          depth: 0,
        })
        for (const doc of res.docs as any[]) {
          recents.push({
            collection: slug,
            label,
            title: String(doc?.[titleField] ?? doc?.title ?? doc?.name ?? doc?.slug ?? `#${doc?.id}`),
            updatedAt: doc?.updatedAt ?? '',
            url: `/admin/collections/${slug}/${doc?.id}`,
          })
        }
      } catch {
        /* skip collection kalau error */
      }
    }),
  )
  recents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const recent5 = recents.slice(0, 5)

  const stats: { label: string; value: number; sub?: string; accent: string }[] = [
    { label: 'Pages', value: pagesPublished + pagesDraft, sub: `${pagesPublished} published · ${pagesDraft} draft`, accent: '#1B3A4B' },
    { label: 'Active Services', value: servicesActive, sub: 'service types', accent: '#6B9080' },
    { label: 'Testimonials', value: testimonials, sub: 'total', accent: '#E07A5F' },
    { label: 'Media', value: media, sub: 'files', accent: '#3D405B' },
  ]

  const cardStyle: React.CSSProperties = {
    background: 'var(--theme-elevation-0)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    padding: '18px 20px',
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--theme-text)' }}>
        Overview
      </h2>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, borderLeft: `4px solid ${s.accent}` }}>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, color: 'var(--theme-text)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: 'var(--theme-text)' }}>
              {s.label}
            </div>
            {s.sub && (
              <div style={{ fontSize: 12, marginTop: 2, color: 'var(--theme-elevation-500)' }}>{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--theme-text)' }}>
          Recent Activity
        </div>
        {recent5.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>No activity yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {recent5.map((r, i) => (
              <li
                key={`${r.collection}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--theme-elevation-100)',
                }}
              >
                <a href={r.url} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--theme-elevation-100)',
                      color: 'var(--theme-elevation-600)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--theme-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.title}
                  </span>
                </a>
                <span style={{ fontSize: 12, color: 'var(--theme-elevation-500)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {relativeTime(r.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DashboardStats
