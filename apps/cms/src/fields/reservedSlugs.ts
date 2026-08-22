import type { TextFieldSingleValidation } from 'payload'

/**
 * Reserved page slugs — URL yang di-handle file statis Astro di
 * `apps/web/src/pages/` dan akan MENANG atas CMS Page ber-slug sama, karena
 * catch-all `[...slug].astro` sengaja jalan setelah route statis. Bikin Page
 * dgn salah satu slug ini = Page-nya ke-shadow diam-diam (tidak pernah tampil).
 *
 * Lihat `docs/reports/hardcoded-pages-audit.md` §C.2.
 *
 * DILARANG untuk Page — hanya single-segment root yang punya file statis:
 *   listing roots (tours, accommodations, restaurants, rentals, weddings,
 *   water-activities, yacht) + utility (property, 404).
 *
 * TIDAK di-reserve (sengaja tersedia untuk CMS Page):
 *   - Slug singular bare (tour, villa, restaurant, rental, venue,
 *     water-activity) → dialokasikan untuk landing page per service
 *     (lihat `apps/web/src/lib/serviceTypes.ts` KEY_TO_SLUG).
 *   - `home` → homepage memang consume Page slug `home`.
 */
export const RESERVED_PAGE_SLUGS = [
  'tours',
  'accommodations',
  'restaurants',
  'rentals',
  'weddings',
  'water-activities',
  'yacht',
  'property',
  '404',
] as const

/**
 * Field `validate` untuk slug Pages. Jalan SETELAH `generateSlug` memformat
 * value, jadi membandingkan slug final. Mengembalikan pesan error (string)
 * kalau reserved; `true` kalau lolos.
 *
 * Catatan: tetap kembalikan `true` untuk value kosong — biar aturan
 * required/unique bawaan field yang menangani kasus itu (kita hanya menambah
 * cek reserved di atasnya).
 */
export const validateReservedSlug: TextFieldSingleValidation = (value) => {
  if (
    typeof value === 'string' &&
    (RESERVED_PAGE_SLUGS as readonly string[]).includes(value)
  ) {
    return `Slug "${value}" sudah dipakai halaman statis (reserved) dan akan ke-override oleh file di apps/web/src/pages/. Pilih slug lain.`
  }
  return true
}
