/**
 * Listing-page header resolver — CMS-first (ServiceTypes) dgn fallback
 * hardcoded. Menutup gap "header listing masih hardcoded" dari audit
 * `docs/reports/hardcoded-pages-audit.md` (Kategori D).
 *
 * Mapping field:
 * - heading         ← ServiceType.name
 * - intro           ← ServiceType.description (richText → plain text)
 * - metaTitle       ← ServiceType.metaTitle
 * - metaDescription ← ServiceType.metaDescription
 * - eyebrow         → SELALU hardcoded. ServiceTypes tidak punya field ini;
 *                     eyebrow murni dekoratif (label kecil di atas H1).
 *
 * Semua field CMS opsional → jatuh ke fallback kalau kosong/unreachable,
 * jadi build & preview tetap jalan tanpa data CMS (pola sama dgn helper lain).
 */
import { getServiceTypeByKey } from '@lib/serviceTypes'
import { lexicalToPlainText } from '@lib/lexical'

export interface ListingHeaderFallback {
  /** Label kecil dekoratif di atas H1. Selalu dari kode (tak ada field CMS). */
  eyebrow: string
  /** Fallback untuk H1 kalau ServiceType.name kosong. */
  heading: string
  /** Fallback untuk paragraf intro kalau ServiceType.description kosong. */
  intro: string
  /** Fallback untuk `<title>` kalau ServiceType.metaTitle kosong. */
  metaTitle: string
  /** Fallback untuk meta description kalau ServiceType.metaDescription kosong. */
  metaDescription: string
}

export interface ResolvedListingHeader {
  eyebrow: string
  heading: string
  intro: string
  metaTitle: string
  metaDescription: string
}

/**
 * Resolve header listing dari ServiceTypes by `key`
 * (tours | accommodations | water-activities | yachts | restaurants |
 *  venues | rentals), dgn fallback hardcoded per-halaman.
 */
export async function resolveListingHeader(
  key: string,
  fallback: ListingHeaderFallback,
): Promise<ResolvedListingHeader> {
  const svc = await getServiceTypeByKey(key).catch(() => null)
  const cmsIntro = svc?.description ? lexicalToPlainText(svc.description) : ''
  return {
    eyebrow: fallback.eyebrow,
    heading: svc?.name || fallback.heading,
    intro: cmsIntro || fallback.intro,
    metaTitle: svc?.metaTitle || fallback.metaTitle,
    metaDescription: svc?.metaDescription || fallback.metaDescription,
  }
}
