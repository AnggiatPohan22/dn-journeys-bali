/**
 * Seed Testimonials collection records — untuk test block source="collection".
 * Idempotent: upsert by name+quote hash (pakai name sebagai kunci sederhana).
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-testimonials.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (m: string) => process.stdout.write(m + '\n')

type T = {
  name: string; location: string; quote: string; rating: number
  sourceModule: string; destSlug?: string; isFeatured: boolean; date: string
}

const data: T[] = [
  { name: 'Sarah Mitchell', location: 'Sydney, Australia', quote: 'The sunrise trek to Mount Batur was life-changing. Our guide was phenomenal.', rating: 5, sourceModule: 'tours', destSlug: 'mainland-bali', isFeatured: true, date: '2026-07-10' },
  { name: 'James & Emma', location: 'London, UK', quote: 'Our villa in Lembongan exceeded every expectation. Concierge handled everything.', rating: 5, sourceModule: 'accommodations', destSlug: 'lembongan', isFeatured: true, date: '2026-06-22' },
  { name: 'Thomas Bergmann', location: 'Berlin, Germany', quote: 'Best snorkeling of my life at Nusa Penida — saw manta rays up close!', rating: 5, sourceModule: 'water-activities', destSlug: 'nusa-penida', isFeatured: true, date: '2026-07-01' },
  { name: 'Yuki Tanaka', location: 'Tokyo, Japan', quote: 'The cultural tour around Ubud gave us such deep appreciation for Balinese traditions.', rating: 5, sourceModule: 'tours', destSlug: 'mainland-bali', isFeatured: false, date: '2026-05-18' },
  { name: 'Maria Santos', location: 'São Paulo, Brazil', quote: 'Rented a scooter for a week — perfect condition, delivered to our hotel.', rating: 4, sourceModule: 'rentals', destSlug: 'mainland-bali', isFeatured: false, date: '2026-04-30' },
  { name: 'David & Lisa Chen', location: 'Singapore', quote: 'Our cliff-top wedding was a dream. The team coordinated flawlessly.', rating: 5, sourceModule: 'venues', destSlug: 'mainland-bali', isFeatured: true, date: '2026-08-02' },
  { name: 'Oliver Brooks', location: 'Auckland, NZ', quote: 'Yacht charter to hidden coves — professional crew, unforgettable day.', rating: 5, sourceModule: 'yachts', destSlug: 'nusa-penida', isFeatured: false, date: '2026-06-11' },
]

const run = async () => {
  const payload = await getPayload({ config })

  const dests = await payload.find({ collection: 'destinations', limit: 50 })
  const destMap: Record<string, number> = {}
  for (const d of dests.docs) destMap[(d as any).slug] = d.id as number

  for (const t of data) {
    const existing = await payload.find({ collection: 'testimonials', where: { name: { equals: t.name } }, limit: 1 })
    const doc: any = {
      name: t.name, location: t.location, quote: t.quote, rating: t.rating,
      sourceModule: t.sourceModule, isFeatured: t.isFeatured, status: 'published',
      date: t.date,
      destination: t.destSlug ? destMap[t.destSlug] ?? null : null,
    }
    if (existing.docs[0]) {
      await payload.update({ collection: 'testimonials', id: existing.docs[0].id, data: doc })
      log(`✓ updated "${t.name}"`)
    } else {
      await payload.create({ collection: 'testimonials', data: doc })
      log(`✓ created "${t.name}"`)
    }
  }
  log(`\nDone — ${data.length} testimonials seeded.`)
  process.exit(0)
}
run().catch((e) => { process.stderr.write(`Error: ${e.message}\n${e.stack}\n`); process.exit(1) })
