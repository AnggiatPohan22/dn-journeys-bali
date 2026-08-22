## Sprint: CMS Enhancement (Sidebar, Content, Services, Quick Wins)
**Tanggal**: 2026-08-19 → 2026-08-20
**Status**: Selesai (semua sprint ✅)
**Dikerjakan oleh**: Claude Code
**Phase terkait di PROGRESS.md**: 3.14 – 3.19

### Ringkasan
Rangkaian 5 sprint untuk mendewasakan CMS: merapikan sidebar admin dengan
role-based visibility, seed konten demo lengkap, memindahkan service types &
testimonials ke collection CMS-editable, WhatsApp per-service, dan dashboard
overview. Semua perubahan **additive & backward-safe**; frontend build final
lolos (76 halaman).

---

### Sprint 0 — Technical Prerequisites ✅
| Item | Status | Bukti |
|------|--------|-------|
| 0.1 CMS restart + schema sync | ✅ | Beberapa siklus schema push (service_types, testimonials fields, block fields). Recovery dari Payload SQLite push bug (drop block tables → recreate) terdokumentasi di Phase 3.18 |
| 0.2 Generate types + verify frontend build | ✅ | `pnpm generate:types` tiap schema change. **`pnpm --filter @dn-journeys/web build` → 76 pages built, Complete! tanpa error** |

### Sprint 1 — Sidebar Reorganization ✅ (Phase 3.14.1–3.14.3)
| Item | Status | Detail |
|------|--------|--------|
| 1.1 Audit sidebar | ✅ | 14 collection + 5 global dipetakan → group/access/hidden |
| 1.2 Grouping | ✅ | Group baru: Content / Services / Site Builder / Administration / Settings |
| 1.3 Role-based visibility | ✅ | `admin.hidden`: Users & SiteFeatures = super-admin only; Menus + 4 global Settings = hidden dari editor. Admin bisa edit SiteSettings/Header/Footer (`update: isAdmin`) |
| 1.4 Ordering | ✅ | Urutan registrasi di payload.config.ts: Content→Services→Site Builder→Administration; globals SiteSettings→Header→Footer→Homepage→Features |

Catatan: Payload 3.x tidak punya custom nav icon bawaan → di-skip.

### Sprint 2 — Seed Content & Testing ✅ (Phase 3.14.4–3.14.5)
| Item | Status | Detail |
|------|--------|--------|
| 2.1 Block mapping per page | ✅ | Mapping 16 block → home/about/contact/privacy/terms + 7 service landing + explore-bali |
| 2.2 Seed script | ✅ | `seed-demo-content.ts` (5 pages), `seed-service-landing-content.ts` (6 landing + explore-bali). Fix: 6 landing kehilangan blok serviceListing → di-restore |
| 2.3 Frontend verification | ✅ | 13 page diverifikasi (desktop + mobile 375px, no overflow, links functional). Fix: homepage title pakai seo.metaTitle |

### Sprint 3 — Service Management ✅ (Phase 3.15–3.16)
| Item | Status | Detail |
|------|--------|--------|
| 3.1 Audit arsitektur | ✅ | Service TYPES hardcoded di 6 lapisan; LISTINGS sudah di 7 collection. Tidak ada collection "Services" |
| 3.2 Migrate to collection | ✅ | `ServiceTypes` collection (metadata editable): name/slug/key/status/order/icon/cover/description/WA/SEO. Frontend resolver CMS-first + fallback modules.ts |
| 3.3 CRUD verification | ✅ | Access enforcement terbukti via API (create/update/delete → 403 tanpa auth; read public). Draft filter diskriminatif. UI walkthrough per role = manual (perlu login) |

Batas: tetap 7 vertical fixed (`key` enum) — tambah tipe baru = path full-dynamic (tidak dipilih).

### Sprint 4 — Quick Wins ✅ (Phase 3.16–3.19)
| Item | Status | Detail |
|------|--------|--------|
| 4.1 WhatsApp per service | ✅ | `getServiceWhatsApp` + `renderWhatsAppTemplate` ({{serviceName}}/{{destination}}/{{date}}/…). 7 detail page: number+template dari ServiceType, fallback SiteSettings. Terbukti empiris (custom number 6280000000009, variable replacement) |
| 4.2 Testimonials as collection | ✅ | Collection sudah ada (3.11) + tambah destination/date. Block dapat `source` (inline/collection) + filter svc/dest/featured/limit. About page demo pakai collection featured |
| 4.3 Dashboard overview | ✅ | `beforeDashboard` Server Component: stat cards (Pages/Services/Testimonials/Media) + recent activity (5 edit lintas 12 collection). Data queries verified; visual render perlu login |

---

### File Utama yang Berubah
**CMS (collections/globals/blocks):**
- `collections/ServiceTypes.ts` (baru), `collections/Testimonials.ts` (+destination/date)
- `collections/Users.ts`, `Menus.ts`, `Pages.ts`, `Media.ts`, `Categories.ts` (group/hidden)
- `globals/{SiteSettings,HeaderSettings,FooterSettings,HomepageContent,SiteFeatures}.ts` (group/hidden/access)
- `blocks/index.ts` (testimonialSourceFields, block source toggle)
- `admin/DashboardStats.tsx` (baru), `payload.config.ts` (registrasi + grouping + ordering)

**CMS (scripts):** `seed-demo-content`, `seed-service-landing-content`, `seed-service-types`, `seed-testimonials` (+ package.json scripts)

**Frontend (apps/web):**
- `lib/serviceTypes.ts` (baru), `lib/whatsapp.ts` (renderWhatsAppTemplate), `lib/payload.ts` (getServiceTypes)
- `components/blocks/{ServiceListingBlock,ServiceListingEditorial,ServiceListingHeroImmersive,ServiceGridBlock,TestimonialsBlock,TestimonialsCarouselBlock}.astro`
- `components/navigation/Footer.astro`
- `pages/index.astro`, `pages/[...slug].astro`, 7× `pages/{villa,tour,rental,yacht,venue,restaurant,water-activity}/[slug].astro`

### Impact Database
- Collection baru: `service_types` (+ rels)
- Kolom baru: `testimonials.destination_id`, `testimonials.date`
- Block fields baru (testimonials/testimonialsCarousel): source/svc/maxItems/onlyFeatured/filterDest — lintas collection embedding
- Semua additive; identifier terpanjang < 63 char. Recovery push bug via drop-and-recreate block tables (data inline di-restore via re-seed)

### Verifikasi Akhir
- ✅ `pnpm --filter @dn-journeys/web build` → **76 pages, Complete!** (no error)
- ✅ API access control enforced (403 tanpa auth)
- ✅ CMS-driven confirmed: Footer, About testimonials, WA per-service (empiris)
- ✅ Regression: homepage inline testimonials, semua landing/detail render

### Pending / Manual (perlu login CMS — di luar kemampuan agent)
- [ ] CRUD UI walkthrough per role (super-admin/admin/editor) — matrix di Phase 3.14/3.15
- [ ] Visual render dashboard overview post-login
- [ ] Set whatsappNumber per ServiceType di admin → verify routing (logika sudah terbukti)
