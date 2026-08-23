# Guideline: Menambahkan Service Baru

> Panduan step-by-step untuk developer/AI agent menambahkan **service type baru**
> ke DnJourneysBali (service ke-8 dan seterusnya).
>
> **Estimasi waktu:** 45–90 menit
> **Skill level:** Mid-level developer / AI agent (bukan pure-junior — ada ~13 file seam)
> **Risiko:** Rendah-menengah — semua perubahan **additive**, tapi menyentuh banyak
> titik hardcoded karena arsitektur sengaja dibuat "7 vertical fixed" (lihat
> [keputusan Phase 3.15](../phases/phase-3.14-cms-enhancement-sprint.md#phase-315--servicetypes-cms-collection-task-32)).

---

## ⚠️ Baca dulu: kenapa ini butuh code, bukan CMS saja

CMS `ServiceTypes` hanya menyimpan **metadata** (label, ikon, hero, SEO, WhatsApp)
untuk 7 vertical yang **sudah ada**. Menambah TIPE service baru = jalur "full
dynamic" yang **tidak dipilih** saat desain. Jadi service baru butuh:

1. **Collection CMS baru** (data produk/listing punya schema sendiri per tipe).
2. **Detail page code** (`pages/<svc>/[slug].astro`).
3. **~11 seam hardcoded** di frontend + CMS yang meng-enumerasi 7 tipe.

Listing page **BUKAN** file `.astro` — sejak [Phase 3.20](../phases/phase-3.20-service-listing-fixes.md)
semua listing (`/tour`, `/villa`, …) adalah **CMS Page** ber-block `serviceListing`,
di-render oleh catch-all [`pages/[...slug].astro`](../../apps/web/src/pages/%5B...slug%5D.astro).
Jadi listing service baru = bikin CMS Page, bukan file kode.

### 🔑 Tiga namespace key (SUMBER BUG PALING UMUM)

Satu service punya **tiga** identifier di lapisan berbeda. Untuk 7 service lama
ketiganya sengaja beda (alasan historis). **Untuk service baru: samakan ketiganya**
agar tidak perlu isi mapping tambahan.

| Namespace | Dipakai di | Contoh lama (Villa) | Rekomendasi service baru (Spa) |
|-----------|-----------|---------------------|-------------------------------|
| **Module key** (camelCase) | [`config/modules.ts`](../../apps/web/src/config/modules.ts) `ServiceModule` | `accommodations` | `spa` |
| **serviceType / collection key** | `ServiceTypes.key`, block `serviceType`, slug collection Payload | `accommodations` | `spa` |
| **Landing/URL slug** | URL listing + folder `pages/<slug>/` + detail base | `villa` | `spa` |

> Villa "rugi" karena module key `accommodations` ≠ URL slug `villa` → butuh
> `MODULE_TO_KEY` + `KEY_TO_SLUG`. Kalau service baru pakai string yang **sama**
> (`spa` di ketiga tempat), mapping itu jadi trivial (`spa → spa → spa`).

---

## LANGKAH 1 (referensi): Inventory pattern 7 service existing

| Service | Listing (CMS Page slug) | Detail file | serviceType/key | Module key (modules.ts) | Collection Payload | URL listing | URL detail | Template |
|---------|------------------------|-------------|-----------------|-------------------------|--------------------|-------------|-----------|----------|
| Tours | `tour` | [`pages/tour/[slug].astro`](../../apps/web/src/pages/tour/%5Bslug%5D.astro) | `tours` | `tours` | `tours` | `/tour` | `/tour/[slug]` | bento 12-col |
| Villa/Hotel | `villa` | [`pages/villa/[slug].astro`](../../apps/web/src/pages/villa/%5Bslug%5D.astro) | `accommodations` | `accommodations` | `accommodations` | `/villa` | `/villa/[slug]` | bento 12-col (pilot) |
| Water Activities | `water-activity` | `pages/water-activity/[slug].astro` | `water-activities` | `waterActivities` | `water-activities` | `/water-activity` | `/water-activity/[slug]` | bento 12-col |
| Yacht | `yacht` | `pages/yacht/[slug].astro` | `yachts` | `yacht` | `yachts` | `/yacht` | `/yacht/[slug]` | bento 12-col |
| Restaurant | `restaurant` | `pages/restaurant/[slug].astro` | `restaurants` | `restaurants` | `restaurants` | `/restaurant` | `/restaurant/[slug]` | bento 12-col |
| Weddings/Venue | `venue` | `pages/venue/[slug].astro` | `venues` | `weddings` | `venues` | `/venue` | `/venue/[slug]` | bento 12-col |
| Rental | `rental` | [`pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro) | `rentals` | `rentals` | `rentals` | `/rental` | `/rental/[slug]` | bento 12-col |

**Pola yang berlaku ke semua:**
- **Detail page**: `getStaticPaths()` → fetch collection (`get<Svc>s`) → map slug; guard `isModuleEnabled(<moduleKey>)`; layout "mirror villa" (hero bento + grid 12-col: 8 konten + 4 sidebar booking sticky); breadcrumbs + JSON-LD; WhatsApp via `getServiceWhatsApp(<key>, fallback)`.
- **Listing**: CMS Page + block `serviceListing` (`layout: hero-immersive`) + `trustBadges`.
- **Card → URL**: setiap block punya `detailRouteMap` / `hrefBaseMap` (serviceType → `/singular`).
- **SEO**: `SERVICE_SCHEMA_TYPE` + `SERVICE_DETAIL_BASE` di [`lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts).

---

## LANGKAH 2: Template service yang dipilih → **Rental**

Gunakan **Rental** ([`pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro))
sebagai template copy. Alasan:

- **Paling generic & self-contained**: hanya `description + gallery + pricingTiers +
  specifications + features + includes + requirements`. Tidak ada relasi lintas-collection
  rumit (bukan `rooms` seperti Villa, `itinerary/meetingPoint` seperti Tours, atau
  `packages/testimonials` seperti Venue).
- **Template layout standar** ("mirror villa" bento + 12-col) yang identik dengan 6
  service lain, jadi representatif.
- **Kode bersih & ber-komentar section** (Quick Specs / Features / Specifications /
  Requirements / Pricing Options / Includes) yang gampang di-rename ke domain baru.

> Kalau service baru butuh **rating bintang + amenities kompleks**, pakai Villa
> ([`pages/villa/[slug].astro`](../../apps/web/src/pages/villa/%5Bslug%5D.astro)) sebagai template.
> Kalau butuh **jadwal/itinerary**, pakai Tours.

---

## Prerequisites

- Akses codebase (git pull terbaru), berada di branch fitur baru.
- CMS running: `cd apps/cms && pnpm dev` (localhost:3030).
- Frontend running: `cd apps/web && pnpm dev` (localhost:4321).
- Sudah tentukan: **Service Name**, **key/slug** (samakan — lihat §Tiga namespace).

## Contoh yang Digunakan

Guideline ini memakai **"Spa & Wellness"** sebagai contoh. Ganti `spa` dengan key
service Anda saat mengikuti.

| Parameter | Contoh | Dipakai di |
|-----------|--------|-----------|
| Service Name | Spa & Wellness | display (CMS `name`) |
| Key (semua namespace) | `spa` | module key + serviceType + collection slug + URL slug |
| Listing URL | `/spa` | CMS Page slug `spa` |
| Detail URL | `/spa/[slug]` | folder `pages/spa/` |
| Collection Payload | `spa` | `apps/cms/src/collections/Spa.ts` |
| Schema.org type | `HealthAndBeautyBusiness` | pilih dari schema.org sesuai domain |

---

## Bagian A — CMS (apps/cms)

### Step A1: Buat Collection baru

- Copy [`apps/cms/src/collections/Rentals.ts`](../../apps/cms/src/collections/Rentals.ts) → `apps/cms/src/collections/Spa.ts`.
- Ganti:
  - `slug: 'rentals'` → `slug: 'spa'`
  - `labels`, `useAsTitle`, `admin.group: 'Services'` (biarkan group Services)
  - `rentalType` / field domain-spesifik → field yang relevan untuk spa (mis. `treatmentType`, `durationMinutes`). **Pertahankan** field generik reusable: `title`, `slug`, `featuredImage`, `gallery`, `description`, `destination`, `pricingFields`/`pricingTiers`, `subtitle`, `quickSpecs`, `features`, `additionalBlocks`, `seoFields`.
- ⚠️ **Schema push SQLite rawan** kalau nama identifier > 63 char (lihat pola recovery
  di [Phase 3.18](../phases/phase-3.14-cms-enhancement-sprint.md#phase-318--testimonials-block-dari-collection)).
  Jaga nama field pendek; hindari block sub-table dengan prefix panjang.

### Step A2: Register collection

- File: [`apps/cms/src/payload.config.ts`](../../apps/cms/src/payload.config.ts)
- Import: `import { Spa } from './collections/Spa'`
- Tambah `Spa` ke array `collections: [ ... ]` (kelompok Services, setelah `Rentals`).

### Step A3: Tambah `key` ke ServiceTypes

- File: [`apps/cms/src/collections/ServiceTypes.ts`](../../apps/cms/src/collections/ServiceTypes.ts) (field `key`, options ~line 67–75)
- Tambah option: `{ label: 'Spa & Wellness', value: 'spa' }`

### Step A4: Tambah `spa` ke select block

- File: [`apps/cms/src/blocks/index.ts`](../../apps/cms/src/blocks/index.ts)
- Tambah `{ label: 'Spa & Wellness', value: 'spa' }` di **dua** `serviceType` select:
  - **ServiceGrid** block (~line 426–430)
  - **ServiceListing** block (~line 740–748)
- Opsional: filter `svc` di Testimonials block (~line 32–42) kalau ingin testimonial per-spa.

### Step A5: Regen types

```
cd apps/cms
pnpm generate:types          # menambah interface Spa + slug 'spa' ke payload-types.ts
```
> Butuh CMS bisa baca schema; jalankan setelah collection ter-register. Kalau perlu
> schema push (tabel baru), stop `pnpm dev` dulu (SQLite lock).

---

## Bagian B — Frontend (apps/web)

### Step B1: Daftarkan module

- File: [`apps/web/src/config/modules.ts`](../../apps/web/src/config/modules.ts)
- Tambah `'spa'` ke union `ServiceModule`.
- Tambah entry ke `modules`:
  ```ts
  spa: { enabled: true, label: 'Spa & Wellness', slug: 'spa', icon: 'sparkles', collection: 'spa' },
  ```
  (`icon` = nama yang ada di `Icon.astro`; tambah ikon dulu kalau belum ada.)

### Step B2: Getter data

- File: [`apps/web/src/lib/payload.ts`](../../apps/web/src/lib/payload.ts) (setelah `getRentals`, ~line 140)
  ```ts
  export const getSpas = (opts?: Partial<FetchOptions>) =>
    fetchCollection<Spa>({ collection: 'spa', ...opts })
  export const getSpaBySlug = (slug: string) => fetchBySlug<Spa>('spa', slug)
  ```
  (import `Spa` dari `@shared/types/payload-types`.)

### Step B3: Resolver mapping

- File: [`apps/web/src/lib/serviceTypes.ts`](../../apps/web/src/lib/serviceTypes.ts)
  - `MODULE_TO_KEY`: `spa: 'spa'`
  - `KEY_TO_SLUG`: `spa: 'spa'`

### Step B4: SEO mapping

- File: [`apps/web/src/lib/structuredData.ts`](../../apps/web/src/lib/structuredData.ts)
  - `SERVICE_SCHEMA_TYPE`: `spa: 'HealthAndBeautyBusiness'` (pilih @type sesuai domain)
  - `SERVICE_DETAIL_BASE`: `spa: '/spa'`

### Step B5: Detail page

- Copy [`apps/web/src/pages/rental/[slug].astro`](../../apps/web/src/pages/rental/%5Bslug%5D.astro) → `apps/web/src/pages/spa/[slug].astro`
- Wajib diganti:
  - Import getter: `getRentals, getRentalBySlug` → `getSpas, getSpaBySlug`
  - `getStaticPaths()`: `isModuleEnabled('rentals')` → `isModuleEnabled('spa')`; `getRentals` → `getSpas`
  - Redirect kosong: `/rental` → `/spa`
  - `getRentalBySlug` → `getSpaBySlug`
  - WhatsApp: `getServiceWhatsApp('rentals', …)` → `getServiceWhatsApp('spa', …)`; ganti `rentalMessage` (lihat B7)
  - Breadcrumb: `{ name: 'Rentals', url: '/rental' }` → `{ name: 'Spa & Wellness', url: '/spa' }`; `detailUrl = /spa/${slug}`
  - `serviceItemSchema({ serviceType: 'rentals', … })` → `'spa'`
  - Recommended: `getRentals` filter `rentalType` → field domain spa (mis. `treatmentType`), href `/rental/` → `/spa/`
  - Ganti label/field domain (`rentalTypeLabel`, `specifications`, `pricingTiers`) sesuai schema Spa; rename heading section bila perlu.
- **Jangan ubah**: struktur layout (hero bento, grid 12-col, sidebar sticky), class Tailwind, pola `additionalBlocks` (super-admin custom sections).

### Step B6: Card component + route maps

- Copy [`apps/web/src/components/cards/RentalCard.astro`](../../apps/web/src/components/cards/RentalCard.astro) → `SpaCard.astro`; sesuaikan field & pertahankan prop `hrefBase` (default `/spa`) + `variant` (delegasi `DetailedCard`).
- Tambah `spa` ke **route map + card switch** di 3 block:
  - [`ServiceGridBlock.astro`](../../apps/web/src/components/blocks/ServiceGridBlock.astro): `fetch switch` (~44), `defaultViewAllHref` (~67), `hrefBaseMap` (~82), card switch (~129) → `{serviceType === 'spa' && <SpaCard spa={item} hrefBase={hrefBase} />}`
  - [`ServiceListingEditorial.astro`](../../apps/web/src/components/blocks/ServiceListingEditorial.astro): fetch switch (~49), `detailRouteMap` (~74), card switch (~324)
  - [`ServiceListingHeroImmersive.astro`](../../apps/web/src/components/blocks/ServiceListingHeroImmersive.astro): fetch switch (~48), `detailRouteMap` (~67), card switch (~378)
  - Setiap fetch switch tambah: `case 'spa': itemsPromise = getSpas(opts); break`

### Step B7 (opsional): WhatsApp message builder

- File: [`apps/web/src/lib/whatsapp.ts`](../../apps/web/src/lib/whatsapp.ts) — tambah `spaMessage(title)` (copy `rentalMessage`). Dipakai sebagai fallback di detail page kalau `ServiceType.whatsappTemplate` kosong.

### Step B8: ItemList JSON-LD listing page

- File: [`apps/web/src/pages/[...slug].astro`](../../apps/web/src/pages/%5B...slug%5D.astro) — tambah ke `fetchers` map (~line 48):
  `spa: () => getSpas({ limit: 50 }),`
  (Tanpa ini, listing `/spa` tidak emit ItemList schema — tapi tetap render.)

---

## Bagian C — Reserved Slugs & Redirects

### Step C1: Reserved slugs — biasanya TIDAK perlu

- File: [`apps/cms/src/fields/reservedSlugs.ts`](../../apps/cms/src/fields/reservedSlugs.ts)
- Slug singular landing (`spa`) **sengaja TIDAK di-reserve** — memang dipakai CMS Page
  (`[...slug].astro`), sama seperti `villa`/`tour`. **Jangan tambahkan `spa`.**
- Tambahkan ke `RESERVED_PAGE_SLUGS` **hanya kalau** Anda membuat rute **plural** statis/redirect
  (mis. `spas`) yang men-shadow CMS Page ber-slug sama.

### Step C2: `_redirects` — hanya kalau ada URL plural lama

- File: [`apps/web/public/_redirects`](../../apps/web/public/_redirects)
- Untuk service **baru** tidak ada URL plural legacy → **skip**.
- Tambah hanya kalau perlu alias, mis:
  ```
  /spas            /spa            301
  /spas/*          /spa/:splat     301
  ```

---

## Bagian D — Konten CMS (setelah code siap)

### Step D1: Buat ServiceType
CMS admin → **Service Types** → Create:
- name: `Spa & Wellness`, key: `spa`, slug: `spa`, order, description, coverImage, metaTitle/Description.
- status: **draft** dulu (aktifkan setelah semua code + test hijau).

### Step D2: Buat Listing Page (INI listing-nya)
CMS admin → **Pages** → Create:
- slug: `spa`, status: published.
- Blocks: **ServiceListing** (`serviceType: spa`, `layout: hero-immersive`) + **TrustBadges**.
- (Tip: contek isian Page `rental`/`villa` sebagai referensi bentuk block.)

### Step D3: Sample products
CMS admin → **Spa** (collection baru) → buat 2–3 entry `status: published`, `slug` unik,
`featuredImage`, `pricingTiers`/harga.

### Step D4: Activate + nav
- Set ServiceType `spa` → status **active**.
- (Opsional) tambah item nav `/spa` di CMS Menu `main-navigation`.

---

## Test Checklist

### CMS
- [ ] Collection **Spa** muncul di group Services; bisa create/publish entry.
- [ ] **Service Types** punya entry `spa`; `key` read-only untuk non-super-admin.
- [ ] Reserved-slug guard: bikin Page slug `spa` **boleh** (tidak di-reserve); slug plural yang di-reserve tetap ditolak.
- [ ] Block ServiceListing/ServiceGrid: dropdown `serviceType` punya opsi Spa.

### Frontend — Listing (`/spa`)
- [ ] `http://localhost:4321/spa` load, no error, no console error.
- [ ] Hero/heading dari CMS (block override → fallback `ServiceType.name`).
- [ ] Grid menampilkan sample products; card → `/spa/<slug>`.
- [ ] View source: `<title>`, `<meta name=description>`, `og:title` ter-set; ada JSON-LD `WebPage` + `BreadcrumbList` + (kalau B8) `ItemList` dengan URL `/spa/...`.
- [ ] Mobile 375px OK.

### Frontend — Detail (`/spa/<slug>`)
- [ ] Load, no error; data render (title, gambar, harga, deskripsi, sections).
- [ ] Breadcrumb: `Home / Spa & Wellness / <Product>`; link `/spa` berfungsi.
- [ ] JSON-LD detail = @type yang dipilih + `Offer` (kalau ada harga).
- [ ] Tombol WhatsApp benar (nomor `ServiceType.whatsappNumber` → SiteSettings fallback).
- [ ] Mobile OK, no console error.

### Navigasi & cross-service (regression)
- [ ] Card di ServiceGrid & ServiceListing block → `/spa` & `/spa/<slug>`.
- [ ] `/tour /villa /yacht /water-activity /restaurant /venue /rental` **semua masih** load & render.

### Build
- [ ] `cd apps/web && pnpm build` → **Complete!**, tanpa error.
- [ ] Output `dist/` memuat `/spa/index.html`? (hanya kalau CMS Page `spa` published) + `/spa/<slug>/index.html` per produk.
- [ ] `sitemap-index.xml` ter-generate.

---

## Troubleshooting

**Listing `/spa` → 404**
- CMS Page slug `spa` sudah `published`? Listing = CMS Page, bukan file.
- Astro dev cache: `touch apps/web/src/pages/[...slug].astro` (getStaticPaths cache). Prod build selalu fresh.

**Detail `/spa/<slug>` → 404**
- `getStaticPaths()` return slug benar? `isModuleEnabled('spa')` true (modules.ts `enabled: true`)?
- Minimal 1 produk `status: published`.
- Astro dev cache: `touch apps/web/src/pages/spa/[slug].astro`.

**Produk tidak muncul di grid / card link ke `/`**
- `serviceType` di block match `spa`? Fetch switch di 3 block sudah ada `case 'spa'`?
- `detailRouteMap`/`hrefBaseMap`/`defaultViewAllHref` sudah ada entry `spa`? (kalau tidak → `?? '/'`).
- Card switch di block sudah render `<SpaCard>`?

**Type error `Spa` tidak dikenal**
- Jalankan `pnpm generate:types` di apps/cms setelah collection ter-register.

**CMS 500 / schema push gagal saat bikin collection**
- Nama identifier > 63 char (SQLite). Pendekkan nama field/block. Lihat pola recovery drop-and-recreate di [Phase 3.18](../phases/phase-3.14-cms-enhancement-sprint.md#-schema-migration-recovery-payload-sqlite-push-bug).
- Jalankan schema push dengan `pnpm dev` CMS **stop** (SQLite exclusive lock).

**Kelas Tailwind tidak ter-styling di file baru**
- JIT cache stale untuk folder baru: `touch apps/web/tailwind.config.mjs`. Prod build fresh.

---

## Quick Reference — File Checklist

| # | File | Action | Wajib? |
|---|------|--------|--------|
| 1 | `apps/cms/src/collections/Spa.ts` | Create (copy Rentals.ts) | ✅ |
| 2 | `apps/cms/src/payload.config.ts` | Register collection | ✅ |
| 3 | `apps/cms/src/collections/ServiceTypes.ts` | Add `key` option `spa` | ✅ |
| 4 | `apps/cms/src/blocks/index.ts` | Add `spa` ke 2 select `serviceType` | ✅ |
| 5 | `apps/cms/` → `pnpm generate:types` | Regen payload-types | ✅ |
| 6 | `apps/web/src/config/modules.ts` | Add module `spa` | ✅ |
| 7 | `apps/web/src/lib/payload.ts` | Add `getSpas` + `getSpaBySlug` | ✅ |
| 8 | `apps/web/src/lib/serviceTypes.ts` | `MODULE_TO_KEY` + `KEY_TO_SLUG` | ✅ |
| 9 | `apps/web/src/lib/structuredData.ts` | `SERVICE_SCHEMA_TYPE` + `SERVICE_DETAIL_BASE` | ✅ |
| 10 | `apps/web/src/pages/spa/[slug].astro` | Create (copy rental) | ✅ |
| 11 | `apps/web/src/components/cards/SpaCard.astro` | Create (copy RentalCard) | ✅ |
| 12 | ServiceGridBlock + ServiceListingEditorial + ServiceListingHeroImmersive | Add `spa` (fetch switch + route map + card) | ✅ |
| 13 | `apps/web/src/pages/[...slug].astro` | Add `spa` ke `fetchers` (ItemList) | ✅ |
| 14 | `apps/web/src/lib/whatsapp.ts` | Add `spaMessage()` | Opsional |
| 15 | `apps/cms/src/fields/reservedSlugs.ts` | Add slug | Hanya jika ada plural route |
| 16 | `apps/web/public/_redirects` | Add redirect | Hanya jika ada URL plural |
| 17 | CMS: ServiceType + Page `spa` + sample products | Create konten | ✅ |

Item 1–13 + 17 = **wajib**. Item 14–16 = kondisional.

---

## Prompt untuk AI Agent

> Delegasikan ke Claude Code / AI agent dengan prompt di bawah. Ganti `Spa & Wellness`
> / `spa` dengan service Anda.

```
TASK: Tambahkan service baru "Spa & Wellness" (key: spa) ke DnJourneysBali.

Ikuti PERSIS docs/guides/adding-new-service.md. Aturan:
- JANGAN ubah 7 service existing; semua perubahan additive.
- Samakan ketiga namespace key = "spa" (module key = serviceType = collection slug = URL slug).
- Template detail page: copy apps/web/src/pages/rental/[slug].astro.
- Template collection: copy apps/cms/src/collections/Rentals.ts.
- Template card: copy apps/web/src/components/cards/RentalCard.astro.
- Schema.org @type untuk spa: HealthAndBeautyBusiness.

Kerjakan Bagian A (CMS: collection, register, ServiceTypes key, block selects, generate:types),
Bagian B (frontend: modules.ts, payload.ts getters, serviceTypes.ts maps, structuredData.ts maps,
detail page, SpaCard, 3 block route maps, [...slug].astro fetchers), dan Bagian C (reserved/redirects
— skip kecuali ada plural URL).

Untuk konten CMS (Bagian D: ServiceType, Page listing, sample products) — HANYA jika CMS bisa
di-stop untuk schema push; kalau tidak, siapkan seed script dan serahkan langkah run ke owner.

Setelah selesai: jalankan `cd apps/web && pnpm build` dan pastikan Complete! tanpa error.
Lapor via docs/phases/ + update dashboard docs/PROGRESS.md (lihat AGENTS.md §14).
Jangan sentuh ai/prompt/.
```

---

## Related

- [Phase 3.15 — ServiceTypes CMS Collection](../phases/phase-3.14-cms-enhancement-sprint.md#phase-315--servicetypes-cms-collection-task-32) — kenapa 7 tipe fixed
- [Phase 3.7 — Service Landing Pages](../phases/phase-3-cms-driven.md#phase-37--service-landing-pages--code--2-manual-test-villa-pending) — asal pola detail "mirror villa"
- [Phase 3.20 — Service Listing Fixes](../phases/phase-3.20-service-listing-fixes.md) — konsolidasi singular + SEO
- [service-listing-visual-audit.md](../reports/service-listing-visual-audit.md) — arsitektur listing/detail + SEO
