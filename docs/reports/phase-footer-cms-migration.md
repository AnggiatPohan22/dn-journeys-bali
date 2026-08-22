## Phase: Footer & Utility Sections — Wiring ke CMS
**Tanggal**: 2026-08-07
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Menyelesaikan 4 "⚠️ Inkonsistensi" di `docs/03-CONTENT-MODEL.md` §2.9 — field
CMS yang sudah didefinisikan di schema `site-settings` tapi belum di-consume
oleh frontend. Semua field sekarang aktif: favicon, default meta SEO, OG image,
Google Analytics, Cloudflare Web Analytics, dan additionalScripts.

**Bukan buat Global baru** — semua target sudah ada di `site-settings`. Kerjaan
di phase ini murni **wiring frontend**, plus 1 field tambahan untuk CF Web
Analytics token (belum ada sebelumnya).

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteSettings.ts` | Tambah field `cloudflareWebAnalyticsToken` di `defaultSeo` group. |
| `apps/web/src/layouts/BaseLayout.astro` | Fetch `site-settings`, wire favicon/defaultSeo/GA/CF Analytics. Rewrite total (was 47 lines, sekarang ~80). Semua fallback tetap hardcoded aman kalau CMS unreachable. |
| `apps/web/src/components/navigation/Footer.astro` | Ekstrak `additionalScripts` dari settings + render via `<Fragment set:html={additionalScripts} />` di bawah `</footer>`. |

### Impact
- **Database**: 1 kolom text baru di globals row `site-settings` (`defaultSeo.cloudflareWebAnalyticsToken`). SQLite auto-migrate on next `pnpm dev`.
- **CMS**: Admin melihat field baru "Cloudflare Web Analytics Token" di Site Settings → Default SEO group.
- **Frontend**: BaseLayout + Footer sekarang consume 5 field CMS yang sebelumnya di-schema tapi tidak render.
- **Routes**: none
- **RBAC**: none (mengikuti access existing `site-settings` — update super-admin only)

### Sebelum vs Sesudah

| Elemen | Sebelum | Sesudah |
|---|---|---|
| Favicon | Hardcoded `/favicon.svg` | Cascade: CMS `site-settings.favicon` → hardcoded fallback |
| Default meta description | Hardcoded string "Your Bali Journey…" | Cascade: prop → CMS `defaultSeo.metaDescription` → hardcoded |
| OG image fallback | prop-only, no CMS fallback | Cascade: prop → CMS `defaultSeo.ogImage` |
| Google Analytics | Field di schema, tidak di-inject | GA4 gtag snippet auto-inject saat ID diisi |
| Cloudflare Web Analytics | (belum ada field) | Field baru + beacon auto-inject saat token diisi |
| Additional scripts (tracking/pixels) | Field di schema, tidak render | Render via `set:html` di akhir Footer |

### Testing
- [x] BaseLayout kompilasi: fallback bekerja saat CMS unreachable (settings=null) — verified via kode
- [x] GA4 snippet: hanya inject saat `gaId` truthy — verified
- [x] CF Analytics beacon: hanya inject saat token truthy — verified
- [x] Additional scripts: hanya render saat non-empty string — verified
- [ ] Manual di admin panel: isi `googleAnalyticsId=G-TEST123` → rebuild → view-source cek gtag script — **perlu manual**
- [ ] Manual: upload favicon di admin → rebuild → cek browser tab icon berubah — **perlu manual**
- [ ] Manual: isi `additionalScripts=<script>console.log('test')</script>` → rebuild → cek console output — **perlu manual**
- [ ] Manual: kosongkan semua field opsional → rebuild → verify fallback tetap jalan tanpa error — **perlu manual**

### Security Note
`additionalScripts` di-render via `set:html` (raw HTML injection). **Risiko XSS
mitigated** karena:
1. Field ini bagian dari `site-settings`
2. `site-settings` update access = `isSuperAdmin` (bukan editor biasa)
3. Trust model: super-admin trusted untuk inject script

Kalau di future access diturunkan ke `admin` atau `editor`, field ini harus
di-pindah ke access yang lebih ketat atau di-sanitize.

### Rollback
1. `SiteSettings.ts`: hapus `cloudflareWebAnalyticsToken` field (kolom DB bisa dibiarkan, harmless)
2. `BaseLayout.astro`: `git checkout` file untuk kembalikan hardcoded version
3. `Footer.astro`: hapus baris `additionalScripts` assignment + hapus `<Fragment set:html>` block

`git revert <commit>` cukup — semua perubahan additive/replace, tidak destructive.

### Dokumentasi yang Diupdate
- [x] `docs/03-CONTENT-MODEL.md` §2.9 — 4 ⚠️ inkonsistensi diganti dengan status CMS Hybrid/Dynamic + baris CF Web Analytics baru
- [x] `docs/PROGRESS.md` — Phase 3.10 baru (DONE)
- [x] `docs/reports/phase-footer-cms-migration.md` — file ini
- [x] `docs/reports/README.md` — tambah row ke index

### Next Steps
1. **Manual smoke test** di admin panel (checklist Testing).
2. **Regen types**: `pnpm dev` di apps/cms → `packages/shared/src/types/payload-types.ts` auto-update dengan field `cloudflareWebAnalyticsToken`. Setelah itu, hapus `as string | undefined` cast di BaseLayout.
3. **Content**: owner isi field wajib di admin — favicon, default OG image, meta description, GA/CF token (kalau mau tracking aktif).
4. **Property page** (`property.astro`) — masih hardcoded Bahasa Indonesia copy. Sengaja di-skip di phase ini; akan diganti saat modul Property jadi.
5. **Lanjut ke prompt-11**: migrasi hardcoded content di halaman-halaman (homepage fallback, empty-state text, etc).
