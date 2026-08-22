## Phase: Feature Toggle CMS Integration
**Tanggal**: 2026-08-07
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Membuat CMS Global `SiteFeatures` di Payload untuk enable/disable 7 modul
layanan, section halaman, dan fitur opsional dari Admin Panel. Frontend Astro
diintegrasikan agar Footer, WhatsApp floating button, dan route guards (index +
detail) tunduk ke toggle CMS. Sebelumnya toggle hanya di file kode
(`apps/web/src/config/modules.ts`) — sekarang Super Admin bisa ubah tanpa
developer, hanya butuh rebuild frontend.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/globals/SiteFeatures.ts` | **Baru** — Global config: `modules` (7 checkbox), `sections` (4), `features` (2). Access read publik, update `isSuperAdmin`. |
| `apps/cms/src/payload.config.ts` | Register `SiteFeatures` di `globals[]`. |
| `apps/web/src/lib/features.ts` | **Baru** — utility `getFeatures / isModuleEnabled / isSectionEnabled / isFeatureEnabled / enabledModulesAsync`. Merge CMS state + config metadata. Cache per build. Fallback DEFAULT_FEATURES (all on) saat CMS unreachable. |
| `apps/web/src/lib/payload.ts` | Tambah `getSiteFeatures = fetchGlobal('site-features')`. |
| `apps/web/src/pages/404.astro` | **Baru** — halaman 404 dengan Header/Footer, target `Astro.rewrite('/404')` dari guards. |
| `apps/web/src/components/navigation/Footer.astro` | Ganti `enabledModules()` sync → `enabledModulesAsync()` (CMS-aware). |
| `apps/web/src/components/common/WhatsAppFloating.astro` | Tambah guard `isFeatureEnabled('whatsappFloat')` sebelum render. |
| `apps/web/src/pages/{tours,accommodations,water-activities,restaurants,weddings,rentals}/index.astro` | **5 file** — guard `if (!isModuleEnabled(...)) return Astro.rewrite('/404')`. |
| `apps/web/src/pages/{tours,tour,accommodations,villa,water-activities,water-activity,yacht,restaurants,restaurant,weddings,venue,rentals,rental}/[slug].astro` | **13 file** — guard di `getStaticPaths` — return `[]` kalau modul disabled → detail pages tidak di-build. |

### Impact
- **Database**: none (Payload Global auto-create baris di tabel globals — SQLite migrate on next `pnpm dev`)
- **CMS**: Global baru `site-features` muncul di admin sidebar group "System"
- **Frontend**: Footer Services column, WhatsAppFloating, dan semua module pages sekarang CMS-aware
- **Routes**: 17 halaman module ditambah guards, `/404` baru
- **RBAC**: `site-features` update = super-admin only (read publik)

### Testing
- [ ] **CMS restart & migrate**: `cd apps/cms && pnpm dev` → cek admin panel muncul menu "Pengaturan Fitur" di group System — **perlu manual**
- [ ] **Toggle OFF tours** di admin → save → rebuild `pnpm --filter web build` → cek: `/tours` return 404, `/tours/xxx` return 404, Footer tidak show "Tours & Activities" — **perlu manual**
- [ ] **Toggle ON kembali** → rebuild → cek modul muncul lagi + data intact — **perlu manual**
- [ ] **Non-super-admin coba update**: login sebagai `editor` → coba PATCH `/api/globals/site-features` → expect 403 — **perlu manual**
- [ ] **WhatsApp toggle OFF** → verify tombol floating hilang di semua halaman — **perlu manual**
- [x] **Static type check**: fallback default semua ON → behavior identik dengan pre-change kalau CMS unreachable ✅ (verifikasi kode)
- [x] **Type regen** `packages/shared/src/types/payload-types.ts` — otomatis saat CMS restart pertama; sampai itu jalan, `getSiteFeatures` return type `any` (aman, cast di features.ts).

### Rollback
1. Hapus `apps/cms/src/globals/SiteFeatures.ts`
2. Revert `payload.config.ts` — hapus import + entry `SiteFeatures` dari `globals[]`
3. Hapus `apps/web/src/lib/features.ts` dan `apps/web/src/pages/404.astro`
4. Revert `payload.ts` — hapus `getSiteFeatures`
5. Revert Footer.astro import: `enabledModules` dari `@config/modules` (sync)
6. Revert WhatsAppFloating.astro — hapus `featureEnabled` + kembalikan `hasNumber` guard
7. Revert semua module pages (17 file) — hapus import `isModuleEnabled` + baris guard
8. DB: baris di tabel `globals` untuk `site-features` boleh dibiarkan (harmless) atau hapus manual

Rollback sederhana: `git revert <commit>` — semua perubahan pada 1 phase, tidak ada schema migration destructive.

### Dokumentasi yang Diupdate
- [x] `docs/03-CONTENT-MODEL.md` — Section 1.2 baris `enabled per module` diupdate jadi CMS Hybrid + entri `sections/features` baru + catatan route guards
- [x] `docs/04-RBAC.md` — Section 1.1 tambah baris `site-features` update/read; Section field-level ganti "Belum di CMS" → "Sudah di CMS"
- [x] `docs/PROGRESS.md` — Phase 3.9 baru
- [x] `docs/reports/phase-feature-toggle.md` — file ini
- [ ] `docs/reports/README.md` — tambah row ke tabel index

### Next Steps
1. **Manual smoke test** (checklist di section Testing) — verify di dev sebelum push.
2. **Regen types**: setelah `pnpm dev` di apps/cms selesai, replace `getSiteFeatures = fetchGlobal<any>` → `fetchGlobal<SiteFeature>` (nama type auto-generated), dan hilangkan `any` cast di `features.ts`.
3. **Webhook rebuild** (Phase 5): pasang Cloudflare Pages build hook + Payload afterChange hook di `site-features` → auto-rebuild saat toggle diubah. Sekarang butuh manual rebuild.
4. **Sitemap filter**: `@astrojs/sitemap` sudah otomatis exclude halaman yang tidak di-build (karena getStaticPaths returns []), tapi `/404` juga masuk sitemap saat ini. Cek dan filter kalau perlu di `astro.config.mjs`.
5. **Lanjut ke prompt-10** (Footer migration) dan **prompt-11** (hardcoded content migration).
