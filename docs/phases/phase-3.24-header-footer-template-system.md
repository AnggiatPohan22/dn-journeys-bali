# Phase 3.24: Header & Footer Template System + Import/Export (AUDIT & PLAN)

**Status:** 📋 Planned — audit selesai, belum diimplementasikan
**Timeline:** dibuat 2026-08-25
**Depends on:** [Phase 3.23 Dynamic Destination Types](phase-3.23-dynamic-destination-types.md)
**Branch:** `feature/header-footer-service-fixes`

> Dokumen ini **hanya perencanaan**. Tidak ada source code yang diubah.
> Semua temuan berbasis inspeksi kode aktual per 2026-08-25.

---

## 1. Overview & Goals

Mengubah Header & Footer dari **satu layout hardcoded** menjadi **sistem template**:
developer/agent membuat beberapa template (komponen Astro), Super Admin memilih
template dari admin, lalu mengisi content slot yang **dinamis mengikuti template
terpilih**. Plus import/export config JSON antar-project, dan konvensi porting
template dari framework lain.

**6 goal:** (1) Header template system, (2) Footer template system, (3) Template
registry di code, (4) Import/Export config JSON, (5) Cross-framework porting,
(6) Access control (SA pilih template + import/export; admin/editor isi content saja).

---

## 2. Phase A — Inspeksi Implementasi Saat Ini

### 2.1 Header
- **CMS:** global [`HeaderSettings`](apps/cms/src/globals/HeaderSettings.ts) (slug
  `header-settings`, group Settings, `access.update: isAdmin`, `hidden` utk editor).
  Field: `primaryMenu` (rel→menus), `stickyOnScroll`, `transparentOnTop`,
  `showCtaButton`, `ctaText`, `ctaType` (select whatsapp/custom), `ctaCustomLink`.
  **Sudah pakai `admin.condition`** (ctaText/ctaType muncul kalau showCtaButton;
  ctaCustomLink kalau ctaType=custom).
- **Astro:** [`Header.astro`](apps/web/src/components/navigation/Header.astro) — **satu
  layout hardcoded**. Fetch `getSiteSettings()` (brand/logo/WA) + `getHeaderSettings()`
  (menu wiring + CTA) + fallback `getMenuBySlug('main-navigation')`. Render: logo,
  desktop nav (dropdown), CTA, mobile drawer (Alpine-less, vanilla JS).
- **Brand (logo/siteName) dari `SiteSettings`**, bukan HeaderSettings (no-dupe).

### 2.2 Footer
- **CMS:** global [`FooterSettings`](apps/cms/src/globals/FooterSettings.ts) (slug
  `footer-settings`, akses sama Header). Field: `showBrandColumn`,
  `brandTaglineOverride`, `columns[]` (array: columnLabel + menu rel), Services
  column (show/label/servicesMenu), Contact column (show/label), `bottomBarRightText`,
  `showNewsletter` (reserved). Pakai `collapsible` + toggle.
- **Astro:** [`Footer.astro`](apps/web/src/components/navigation/Footer.astro) — **satu
  layout 4-kolom hardcoded**. Fetch `getSiteSettings()` + `getFooterSettings()` +
  `getResolvedServiceTypes()`. Kolom brand/social/contact dari SiteSettings; menu
  columns dari FooterSettings; services cascade (servicesMenu → ServiceTypes → modules.ts).

### 2.3 Titik pasang (render point)
- [`PageLayout.astro`](apps/web/src/layouts/PageLayout.astro): `<Header transparent={transparentHeader} />`
  dan `<Footer />` — **satu titik** untuk seluruh site. (BaseLayout membungkus.)

### 2.4 Pola existing yang relevan
- **Template-select + conditional slots + build-time dispatch SUDAH ADA** di block
  `serviceListing`: [`blocks/index.ts:716`](apps/cms/src/blocks/index.ts) `layout`
  select (`editorial-featured`/`hero-immersive`) + `admin.condition: sib?.layout === 'hero-immersive'`
  ([:782](apps/cms/src/blocks/index.ts)), lalu
  [`ServiceListingBlock.astro`](apps/web/src/components/blocks/ServiceListingBlock.astro)
  dispatch komponen di build-time. **Ini blueprint langsung untuk Goal 1–3.**
- **Custom admin components SUDAH DIPAKAI**: [`Menus.ts:33/68`](apps/cms/src/collections/Menus.ts)
  `components: {...}` + `payload.config.ts` `admin.components` + `importMap`. → picker
  thumbnail & tombol import/export (custom admin UI) **feasible**.
- **Field-level access**: `superAdminFieldAccess` / `adminFieldAccess`
  ([roles.ts](apps/cms/src/access/roles.ts)) — untuk Goal 6.
- **Globals fetch**: `fetchGlobal()` ([payload.ts:107](apps/web/src/lib/payload.ts)),
  relationship (menu.items) ter-populate otomatis.

---

## 3. Phase B — Feasibility Analysis

### Per-goal

| Goal | Feasible | Payload/Astro support | Reuse | Build baru |
|------|----------|----------------------|-------|-----------|
| **1 Header templates** | ✅ YES | `select` + `admin.condition` (proven); build-time dispatch (proven) | pola serviceListing; HeaderSettings | registry; slot fields ber-condition; HeaderRenderer + N komponen template |
| **2 Footer templates** | ✅ YES | idem | pola serviceListing; FooterSettings | idem footer |
| **3 Template registry (code)** | ✅ YES | TS config (spt modules.ts/serviceTypes) | `config/modules.ts`, `lib/serviceTypes.ts` | registry di `packages/shared` (dipakai CMS utk options+condition & Astro utk dispatch) |
| **4 Import/Export JSON** | 🟡 PARTIAL→YES | REST global GET/PATCH sudah ada; custom admin view (proven) | REST API bawaan | custom admin button/view (download/upload + validasi templateId) |
| **5 Cross-framework porting** | ✅ YES (konvensi) | config JSON framework-agnostic | JSON schema Goal 4 | tidak ada fitur code — hanya konvensi + agent convert React→Astro |
| **6 Access control** | ✅ YES | field-level access (proven) | `superAdminFieldAccess` | `template` field = SA-only; slot fields = admin; import/export = SA |

### Jawaban pertanyaan teknis spesifik

1. **Bisakah Payload conditional fields handle dynamic slot rendering per template?**
   **YA.** `admin.condition(data, siblingData)` sudah dipakai di project (HeaderSettings
   + blocks). Pola: semua slot yang mungkin dideklarasikan di global, tiap slot/grup
   diberi `condition` yang cek apakah `template` terpilih memuat slot itu (baca dari
   registry: `condition: (_, s) => templateSupports(s?.template, 'ctaButton')`).
   Batasan: **semua slot harus dideklarasi di global** (global jadi besar) → mitigasi
   dgn grup/collapsible + condition. Alternatif lebih rapi: field `blocks` (Payload
   Blocks) di mana tiap slot = block, tapi lebih kompleks utk validasi per-template.

2. **Struktur registry?** **TS config file** di `packages/shared` (framework-agnostic,
   diimpor CMS + Astro). Tiap entri: `{ templateId, name, type: 'header'|'footer',
   slots: SlotKey[], thumbnail: string }`. **Bukan** CMS/JSON seed — supaya menambah
   template = tambah komponen + daftar di registry + deploy (sesuai Goal 3).
   Catatan: opsi `select` di Payload harus statis di config → generate dari registry
   (import array registry → map ke options) supaya sinkron otomatis.

3. **Globals atau Collections?** **Globals** (tetap). Header & Footer singleton
   per-site. Collection hanya perlu kalau butuh banyak header/footer berbeda per-halaman
   (di luar scope).

4. **Astro resolve template di build-time?** Map statis di renderer:
   `const HEADER_TEMPLATES = { 'header-1': HeaderTemplate1, ... }`; baca
   `headerCfg.template` → render komponen terpilih (persis pola ServiceListingBlock).
   Tree-shaking Astro hanya bundle komponen yang diimpor.

5. **Preview thumbnail di admin?** Gambar statis (di `apps/web/public/admin-thumbs/`
   atau di-serve CMS). Opsi: (a) **custom admin `Field` component** (radio bergambar) —
   feasible krn custom components sudah dipakai; (b) sederhana: `select` biasa + custom
   `Description` component yang menampilkan thumbnail template terpilih. Rekomendasi:
   mulai (b), upgrade ke (a) kalau perlu.

6. **Import/Export approach?** **Custom admin view/button** (paling robust & UX jelas):
   - Export: baca global via REST `GET /api/globals/header-settings` → serialize JSON
     (templateId + semua slot values) → download file.
   - Import: upload JSON → validasi `templateId ∈ registry` (kalau tidak → error
     "template not found") → `PATCH /api/globals/header-settings`.
   - Alternatif minimal tanpa UI: dokumentasikan cara pakai REST langsung + script.

---

## 4. Phase C — Risk Assessment

| Risiko | Level | Penjelasan & Mitigasi |
|--------|-------|----------------------|
| Merusak render Header/Footer saat migrasi | 🟠 MEDIUM | Satu render point (PageLayout). Mitigasi: buat template pertama = **replika layout sekarang** (`header-1`/`footer-1`) sbg default → migrasi additive, perilaku identik. |
| Keterbatasan conditional fields utk slot dinamis | 🟢 LOW–🟠 MEDIUM | `admin.condition` works, tapi banyak slot → global verbose. **Naming 63-char**: grup/array slot bersarang di `header_settings_*` bisa panjang → pakai `dbName` pendek (lihat [DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md)). |
| Kompleksitas resolusi template build-time (Astro) | 🟢 LOW | Pola dispatch sudah terbukti (ServiceListingBlock). |
| Edge case validasi import/export | 🟠 MEDIUM | templateId tak dikenal, versi schema beda, ref media/menu (id) tak ada di target project. Mitigasi: schema ber-`version`, validasi templateId + strip/So-warn broken relationship, import "content only" (bukan media binary). |
| Granularitas akses (template vs content) | 🟢 LOW | field-level `superAdminFieldAccess` pada `template`; slot fields `isAdmin`. Terbukti dipakai. |
| Perf build dgn banyak komponen template | 🟢 LOW | Astro tree-shake; hanya template yang dipakai ter-bundle. Beberapa komponen ringan → dampak minim. |
| Migrasi setting lama → struktur baru | 🟠 MEDIUM | Map field HeaderSettings/FooterSettings existing → slot values `header-1`/`footer-1`. Script migrasi + backup DB. |
| Kompleksitas rollback | 🟠 MEDIUM | Schema global berubah. Mitigasi: branch terpisah, backup `cms.db`, template-1 = perilaku lama → revert mudah. |

**Kesimpulan:** Feasible, risiko manageable. Titik sensitif: **migrasi setting lama**
& **verbositas/naming conditional slots**. Sisanya LOW.

---

## 5. Phase D — Rencana Implementasi

### Arsitektur

```
packages/shared/template-registry.ts   ← SUMBER KEBENARAN (framework-agnostic)
   [{ templateId, name, type, slots[], thumbnail }]
        │                                   │
        ▼ (CMS import)                       ▼ (Astro import)
Payload Globals                         Astro Renderer
 header-settings / footer-settings       HeaderRenderer.astro / FooterRenderer.astro
  - template: select (opsi dari registry)   - map templateId → HeaderTemplateN.astro
  - slot fields (admin.condition per slot)   - baca global.template → render + pass slots
        │                                   ▲
        └───────── data (JSON) ─────────────┘
                     │
             Import/Export (custom admin view)
              GET/PATCH REST global + validasi templateId
```

### Langkah berurut (dengan dependensi)

1. **Template registry** — `packages/shared/src/template-registry.ts`: tipe `SlotKey`,
   `TemplateDef`, array `HEADER_TEMPLATES`/`FOOTER_TEMPLATES`, helper
   `templateSupports(id, slot)`. *(prasyarat semua)*
2. **Restructure global Header** — tambah `template` select (opsi dari registry,
   `superAdminFieldAccess`), + semua slot field (logo/primaryMenu/secondaryMenu/
   ctaButton/searchToggle/socialLinks/address/phone/customText) masing-masing
   `admin.condition` berbasis registry. *(dep: 1)*
3. **Restructure global Footer** — `template` select + slot (logo/columns/copyrightText/
   socialLinks/address/phone/email/newsletterToggle/legalLinks) ber-condition. *(dep: 1)*
4. **Astro HeaderRenderer** — map templateId→komponen; buat `HeaderTemplate1.astro`
   (=replika Header sekarang) + template 2/3 contoh. PageLayout pakai HeaderRenderer. *(dep: 2)*
5. **Astro FooterRenderer** — idem footer (FooterTemplate1 = replika sekarang). *(dep: 3)*
6. **Import/Export** — custom admin view/button (`apps/cms/src/components/…`): export
   JSON (templateId+slots), import + validasi templateId ∈ registry. *(dep: 2,3)*
7. **Access control** — `template` field SA-only; slot fields admin; import/export view
   SA-only. *(dep: 2,3,6)*
8. **Migrasi setting lama** — script map HeaderSettings/FooterSettings existing →
   slot values template-1 + set `template='header-1'/'footer-1'`. Backup DB dulu. *(dep: 4,5)*

### Daftar dampak file (per area)

**[shared] baru:** `packages/shared/src/template-registry.ts`

**[cms] baru:** `apps/cms/src/components/TemplateImportExport.tsx` (custom admin view),
opsional `TemplatePicker.tsx` (Field/Description component thumbnail)

**[cms] diubah:** `globals/HeaderSettings.ts`, `globals/FooterSettings.ts`
(template select + slot fields + condition + field access), `payload.config.ts`
(register custom view/component + importMap), script migrasi baru
`scripts/migrate-header-footer-templates.ts`

**[web] baru:** `components/navigation/HeaderRenderer.astro`, `FooterRenderer.astro`,
`components/navigation/templates/HeaderTemplate1..N.astro`, `FooterTemplate1..N.astro`,
thumbnail statis di `public/admin-thumbs/`

**[web] diubah:** `layouts/PageLayout.astro` (pakai HeaderRenderer/FooterRenderer),
`lib/payload.ts` (helper kalau perlu)

**[shared] diubah (auto):** `packages/shared/src/types/payload-types.ts` (generate:types)

**[docs]:** `03-CONTENT-MODEL.md`, `04-RBAC.md`, `02-DATABASE-SCHEMA.md`, `05-INFRA`
(kalau perlu), `PROGRESS.md`, report phase.

### Strategi migrasi data (setting lama → struktur baru)

1. Backup `apps/cms/cms.db`.
2. Tambah field baru **additive** (template default `header-1`/`footer-1`; slot fields
   optional) — jangan hapus field lama dulu.
3. Script migrasi: baca HeaderSettings/FooterSettings lama → tulis ke slot fields
   template-1 (mis. `ctaText`→slot ctaButton.text; `columns`→slot columns).
4. Verifikasi render `header-1`/`footer-1` identik dgn sekarang.
5. Baru (opsional) hapus field lama yang sudah tergantikan (schema push hati-hati).

### Skema JSON config (import/export)

```json
{
  "schemaVersion": "1.0",
  "type": "header",
  "templateId": "header-3",
  "exportedAt": "2026-08-25T00:00:00Z",
  "content": {
    "logo": { "mediaRef": null, "alt": "Brand" },
    "primaryMenu": { "menuSlug": "main-navigation" },
    "ctaButton": { "show": true, "text": "WhatsApp Booking", "type": "whatsapp", "customLink": null },
    "socialLinks": { "instagram": "@brand", "facebook": "brand" },
    "topBar": { "address": "…", "phone": "…", "customText": "…" }
  }
}
```
- **Framework-agnostic**: hanya `templateId` + `content` (nilai slot). Komponen render
  (Astro/React) tidak masuk JSON (Goal 5).
- **Relationship** (menu/media) diekspor sbg **slug/ref**, bukan id numerik — supaya
  portable antar-project. Import me-resolve slug→id; kalau tak ada → warn.
- **Validasi import**: `schemaVersion` cocok, `templateId ∈ registry` (else "template
  not found"), slot keys dikenal.

### Rollback plan

1. `git revert`/checkout file kode (branch terpisah).
2. Restore `cms.db` dari backup (kembalikan global lama).
3. `generate:types` + restart CMS.
4. PageLayout balik ke `<Header/>`/`<Footer/>` langsung.
   (template-1 = perilaku lama → rollback low-risk kalau field lama belum dihapus.)

### Acceptance criteria

- [ ] Registry mendeklarasikan ≥3 header + ≥3 footer template (id/name/type/slots/thumb).
- [ ] Admin: Super Admin bisa pilih `template`; admin/editor **tidak** bisa ubah template
  (field SA-only) tapi bisa isi slot content.
- [ ] Ganti template → slot fields yang muncul **berubah** sesuai registry (condition).
- [ ] Frontend render komponen sesuai template terpilih; `header-1`/`footer-1` identik
  dgn layout sekarang (regresi nol).
- [ ] Export menghasilkan JSON (templateId+content) valid; Import memuat & meng-apply;
  Import templateId asing → error "template not found".
- [ ] Slot relationship (menu/media) diekspor sbg slug/ref, import resolve/So-warn.
- [ ] `generate:types` sukses; build FE sukses; tak ada regresi Header/Footer existing.
- [ ] Porting: satu template React contoh dikonversi ke Astro memakai JSON schema yang sama.

### Estimasi effort per langkah

| Langkah | Estimasi |
|---------|----------|
| 1 Registry (shared) | 0.25 hari |
| 2 Header global restructure + condition | 0.5–0.75 hari |
| 3 Footer global restructure + condition | 0.5–0.75 hari |
| 4 HeaderRenderer + 3 template (1=replika) | 0.75–1 hari |
| 5 FooterRenderer + 3 template (1=replika) | 0.75–1 hari |
| 6 Import/Export custom admin view | 0.75–1 hari |
| 7 Access control | 0.25 hari |
| 8 Migrasi data + verifikasi | 0.5 hari |
| Docs + testing | 0.5 hari |
| **Total** | **~4.75–6.25 hari kerja** |

---

## 6. Keputusan Owner yang Diperlukan (sebelum implementasi)

1. **Cakupan template awal:** cukup 3 header + 3 footer (contoh di goal), atau set lain?
2. **Import/Export UI:** custom admin view penuh (download/upload + validasi) atau versi
   minimal (REST + script terdokumentasi) dulu?
3. **Thumbnail picker:** custom Field component bergambar, atau select + preview
   sederhana dulu?
4. **Slot storage:** semua slot sebagai field ber-condition di global (sederhana, verbose)
   atau pendekatan Payload Blocks (lebih rapi, lebih kompleks)? Rekomendasi: field ber-condition.
5. **Nasib field lama** HeaderSettings/FooterSettings: hapus setelah migrasi, atau
   pertahankan sebagai slot template-1?

---

## 7. Related Docs

- [Phase 3.23](phase-3.23-dynamic-destination-types.md) · [DB-SCHEMA-CHANGES.md](../DB-SCHEMA-CHANGES.md)
- Preseden: block `serviceListing` layout dispatch
  ([blocks/index.ts](apps/cms/src/blocks/index.ts) + [ServiceListingBlock.astro](apps/web/src/components/blocks/ServiceListingBlock.astro))
- Custom admin components: [Menus.ts](apps/cms/src/collections/Menus.ts)
