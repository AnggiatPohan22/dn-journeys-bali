# Project Progress — DnJourneysBali

> Dashboard tingkat tinggi. Detail tiap fase ada di [`docs/phases/`](phases/).
> Konten detail lama (1067 baris) diarsipkan utuh di
> [`docs/archive/progress-archive-2026-08-23.md`](archive/progress-archive-2026-08-23.md).
>
> **Last updated:** 2026-08-23

## Project Overview

Website multi-layanan pariwisata Bali (**DnJourneysBali**) — 7 modul layanan (Tours,
Villa/Hotel, Water Activities, Yacht, Restaurant, Wedding & Event, Rental) dengan
booking via WhatsApp. Stack: **Astro** (frontend SSG) + **Payload CMS** (backend, RBAC
multi-user) + **Cloudflare** (Pages + Workers, target $5/bln). Tujuan: situs
CMS-driven yang fully manageable client, plus dipaketkan sebagai template reusable.

```
Overall progress:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░  ~97% code · pra-deploy
Current phase:     Phase 3.20 selesai (build 46 pages OK) → siap Phase 4 Polish & Launch
```

## Phase Status Dashboard

| Phase | Nama | Status | Detail |
|-------|------|--------|--------|
| 0–1 | Planning & Foundation | ✅ Complete | [phase-1-foundation.md](phases/phase-1-foundation.md) |
| 2 | Service Modules (7 modul) | ✅ Complete | [phase-2-service-modules.md](phases/phase-2-service-modules.md) |
| 3 (–3.13) | CMS-Driven Features & Content | ✅ Code · 🔨 manual test | [phase-3-cms-driven.md](phases/phase-3-cms-driven.md) |
| 3.14–3.19 | CMS Enhancement Sprint | ✅ Complete (build 76 pages OK) | [phase-3.14-cms-enhancement-sprint.md](phases/phase-3.14-cms-enhancement-sprint.md) |
| 3.20 | Service Listing Fixes (Consolidation + SEO) | ✅ Code + data · build 46 pages OK · belum merge | [phase-3.20-service-listing-fixes.md](phases/phase-3.20-service-listing-fixes.md) |
| 4 | Polish & Launch | ⬜ Not Started (SEO technical sebagian ✅) | [phase-4-polish-launch.md](phases/phase-4-polish-launch.md) |
| 5 | Production Deploy (+ 6 Packaging) | ⬜ Not Started | [phase-5-deploy.md](phases/phase-5-deploy.md) |

**Legenda:** ✅ Complete · 🔨 In Progress · ⬜ Not Started · ⏸️ Paused

## Current Focus

[Phase 3.20](phases/phase-3.20-service-listing-fixes.md) **selesai** di branch
`feature/service-listing-fixes` — konsolidasi rute plural→singular + SEO technical
(JSON-LD, breadcrumbs, canonical/OG), 2 data-seed sudah di-apply & diverifikasi, build
bersih (46 pages, sitemap auto-generated). Sisa: **merge ke `main`**, lalu mulai
Phase 4 Polish & Launch.

## Quick Links

- [All Reports](reports/README.md) — audit & phase reports
- [Post-Deploy TODO](post-deploy-todo.md) — item yang hanya bisa diverifikasi di produksi
- [Dev Reference](dev-reference.md) — foundational decision log, known issues/tech-debt, quick commands
- [Archived full progress](archive/progress-archive-2026-08-23.md) — snapshot PROGRESS.md lama (utuh)
- [AGENTS.md](../AGENTS.md) — AI agent rules & reporting template (Section 14)
- Reference docs: [Overview](00-PROJECT-OVERVIEW.md) · [Architecture](01-ARCHITECTURE.md) · [DB Schema](02-DATABASE-SCHEMA.md) · [Content Model](03-CONTENT-MODEL.md) · [RBAC](04-RBAC.md) · [Infra](05-INFRA.md) · [Runbook](06-MAINTENANCE-RUNBOOK.md) · [Decision Log](07-DECISION-LOG.md)

## Blockers / Decisions Needed

- **Merge branch** — `feature/service-listing-fixes` sudah code+data complete & build
  bersih; belum di-merge ke `main`. Phase 4 sebaiknya mulai dari main yang bersih.
- **Manual test butuh login CMS** — beberapa verifikasi role/sidebar/dashboard tidak
  bisa diotomasi (password entry). Perlu owner.
- **Konten dummy** — sebagian data masih demo/draft (SiteSettings kontak sudah terisi);
  real content final di-input saat Phase 5.

---

## Known Issues & Commands

Ringkasan tech-debt dan perintah cepat dipindah ke [Dev Reference](dev-reference.md).
Highlight yang perlu diingat:

- Astro dev cache `getStaticPaths()` → touch `[slug].astro` setelah publish entry baru (produksi fresh).
- Tailwind JIT cache stale saat tambah file di folder baru → touch `tailwind.config.mjs` (produksi tidak terpengaruh).
- Seed CMS harus dijalankan saat `pnpm dev` CMS **stop** (SQLite exclusive lock).
