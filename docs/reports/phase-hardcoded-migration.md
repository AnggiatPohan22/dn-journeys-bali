## Phase: Migrasi Konten Hardcoded ke CMS
**Tanggal**: 2026-08-07
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menyelesaikan semua item Grup A & B dari kategorisasi `docs/03-CONTENT-MODEL.md`
§3. Homepage fallback content sekarang editable via CMS Global; testimonials
punya collection sendiri; halaman 404 dan `/property` retain-with-fallback ke
`site-settings.errorPages.*`; empty-state text di listing pages
digenericize; `demo-filter.astro` dihapus.

- Total item hardcoded relevan: 15
- Berhasil dimigrasi ke CMS: 5 (Homepage fallback, Testimonials, 404 copy, /property copy, dan sub-item hero/stats/valueProps/CTA)
- Digenericize (tanpa CMS): 1 (empty-state)
- Dihapus: 1 (`demo-filter.astro`)
- Tetap hardcoded dgn alasan valid: 8 (siteConfig fallback, modules metadata, WA helpers, font preload, social SVG, BlockRenderer mapping, Card layouts, design tokens)

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/HomepageContent.ts` | **Baru** — hero/valueProps/stats/testimonials heading/CTA fields. Access: read publik, update super-admin. |
| `apps/cms/src/collections/Testimonials.ts` | **Baru** — name/location/quote/rating(1-5)/sourceModule/avatar + status/sortOrder/isFeatured. |
| `apps/cms/src/globals/SiteSettings.ts` | Extend: `errorPages.notFound` + `errorPages.propertyComingSoon` groups. |
| `apps/cms/src/payload.config.ts` | Register `HomepageContent`, `Testimonials`. |
| `apps/web/src/lib/payload.ts` | Tambah `getHomepageContent`, `getTestimonials` helpers. |
| `apps/web/src/pages/index.astro` | Rewrite — 3-level cascade: Page(slug=home) → HomepageContent + Testimonials → hardcoded defaults. Dummy Sarah/James/Maya jadi safety-net saja (kalau Testimonials collection kosong). |
| `apps/web/src/pages/404.astro` | Consume `site-settings.errorPages.notFound.{title,message,buttonText}` dgn hardcoded fallback. |
| `apps/web/src/pages/property.astro` | Consume `site-settings.errorPages.propertyComingSoon.*` dgn hardcoded fallback identik. |
| `apps/web/src/pages/{tours,accommodations,water-activities,restaurants,rentals,weddings}/index.astro` | Empty-state text digenericize (6 file) — instruksi "Buka CMS admin →" dihapus. |
| `apps/web/src/pages/demo-filter.astro` | **DIHAPUS** — dev preview, sesuai rekomendasi doc §3-🟢 dan §4.2. |

### Payload Globals/Collections Baru
- **Global `homepage-content`** — fallback copy homepage editable
- **Collection `testimonials`** — real client testimonials, reusable

### Impact
- **Database**:
  - Tabel `globals_homepage_content` (baru, + subtables untuk `valueProps`, `stats` arrays)
  - Tabel `testimonials` + `_versions` (baru)
  - Kolom baru di `globals_site_settings` untuk `errorPages.*` groups
  - Semua auto-migrate on next `pnpm dev` di apps/cms (SQLite)
- **CMS**: 2 menu baru di admin — "Homepage — Fallback Content" (group System), "Testimonials" (group Content)
- **Frontend**: Homepage bisa full CMS-driven bahkan tanpa buat Page(slug=home); 404 & /property editable; empty-state generic
- **Routes**: `/demo-filter` dihilangkan (404 mulai sekarang); tidak ada breaking change ke route production
- **RBAC**:
  - `homepage-content` update = super-admin
  - `testimonials` — read publik, create admin+, update authenticated, delete super-admin (sama pola dgn Categories)
  - `site-settings.errorPages` = ikut access existing (super-admin)

### Sebelum vs Sesudah

| Elemen | Sebelum | Sesudah |
|---|---|---|
| Hero copy | Hardcoded konstanta di index.astro | CMS Dynamic via `homepage-content.hero*` |
| Value props (4 items) | Hardcoded array | CMS Dynamic — array editable di admin |
| Stats (4 items) | Hardcoded array | CMS Dynamic — array editable |
| Testimonials | 3 dummy hardcoded (Sarah/James/Maya) | Collection nyata (isFeatured=true, max 6) → fallback dummy hanya kalau kosong |
| CTA text/link | Hardcoded, link fallback WA | CMS Dynamic — link overridable |
| 404 title/message/button | Hardcoded Bahasa Indonesia | CMS Hybrid (retain-with-fallback) |
| /property copy | Hardcoded 6 field | CMS Hybrid (retain-with-fallback) |
| Empty-state ("No X published yet — Buka CMS admin →") | Dev instructional text bocor ke production | Generic user-friendly ("Belum ada X tersedia. Silakan cek lagi nanti.") |
| /demo-filter | Live dev preview | Dihapus |

### Sisa Item Hardcoded (Grup C — tetap di kode)

| Item | Alasan Tetap Hardcoded |
|---|---|
| `siteConfig` fallback | Sengaja: safety-net saat CMS unreachable. Filosofinya harus di kode. |
| `modules.ts` metadata (label/slug/icon) | Structural — bukan editorial content. `enabled` flag sudah CMS-hybrid (Phase 3.9). |
| WhatsApp helpers (`generateWhatsAppLink`, message builders) | Logic bukan content — nomor & pesan sudah dari CMS. |
| Font preload | Technical asset di `public/fonts/`. |
| Social icon SVG paths | Design system inline — tidak editorial. |
| BlockRenderer mapping | Dispatch logic per `blockType` — code path. |
| Card component layouts | Design system components. |
| Design tokens Tailwind | CSS config, harus di kode. |

### Testing
- [x] Kompilasi: cascade fallback bekerja saat CMS unreachable (settings/home/testimonials null) — verified via kode
- [x] Testimonials collection kosong → fallback dummy tetap tampil — verified
- [x] HomepageContent field kosong → hardcoded default dipakai — verified
- [x] `demo-filter.astro` hilang dari filesystem — verified via `rm`
- [ ] Manual: `cd apps/cms && pnpm dev` → cek 2 menu baru + `errorPages` group di Site Settings — **perlu manual**
- [ ] Manual: buat 3-6 testimonial di admin (isFeatured=true) → rebuild → verify homepage pakai data nyata — **perlu manual**
- [ ] Manual: edit HomepageContent heroHeading → rebuild → verify override — **perlu manual**
- [ ] Manual: edit errorPages.notFound.title → visit `/nonexistent` → verify — **perlu manual**
- [ ] Manual: edit errorPages.propertyComingSoon.title → visit `/property` → verify — **perlu manual**
- [ ] Manual: visit `/demo-filter` → expect 404 — **perlu manual**

### Rollback
Per-batch rollback (semua reversible via `git revert`):

**Batch 1 (HomepageContent)**:
1. Hapus `apps/cms/src/globals/HomepageContent.ts`
2. Revert `payload.config.ts` (hilangkan import + entry)
3. Revert `pages/index.astro` — kembalikan konstanta fallback

**Batch 2 (Testimonials)**:
1. Hapus `apps/cms/src/collections/Testimonials.ts`
2. Revert `payload.config.ts`
3. Revert `pages/index.astro` — hapus fetch `getTestimonials`
4. Data di DB: `DROP TABLE testimonials;` kalau mau bersih (opsional)

**Batch 3 (errorPages)**:
1. Revert `SiteSettings.ts` — hapus `errorPages` group
2. Revert `pages/404.astro` dan `pages/property.astro` ke hardcoded

**Batch 4 (empty-state + delete demo-filter)**:
1. `git checkout` 6 module index.astro
2. Untuk restore `demo-filter.astro` → `git checkout HEAD~ -- apps/web/src/pages/demo-filter.astro`

Semua schema change additive — tidak ada column drop atau data loss.

### Dokumentasi yang Diupdate
- [x] `docs/03-CONTENT-MODEL.md` §2.3 (homepage), §2.5 (empty-state), §2.6 (property + 404)
- [x] `docs/PROGRESS.md` — Phase 3.11 baru (DONE)
- [x] `docs/reports/phase-hardcoded-migration.md` — file ini
- [x] `docs/reports/README.md` — tambah row ke index

### Next Steps
1. **Manual smoke test** (checklist Testing di atas)
2. **Regen types**: `pnpm dev` di apps/cms → types di `packages/shared/src/types/payload-types.ts` auto-update dengan `HomepageContent`, `Testimonial`, dan `errorPages` group. Setelah itu ganti `<any>` di helpers dan cast `as any` di consuming pages.
3. **Seed testimonials**: minimal 3 real testimonial dari client → set `isFeatured=true` + `status=published`.
4. **Content input**: owner isi copy `homepage-content` (opsional — default sudah reasonable) + `errorPages` (opsional — default identik dgn hardcoded lama).
5. **Update doc §3 & §4** kalau perlu — rekomendasi 3.1–3.8 sudah diimplementasi via phases 3.9, 3.10, 3.11.
6. **Update `siteConfig.ts` fallback** kalau perlu — sekarang jadi safety-net level 3 (di bawah CMS + hardcoded default di file page).
