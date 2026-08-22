# Phase Reports

Folder ini berisi laporan untuk setiap fase/task yang dikerjakan di
DnJourneysBali.

## Aturan

- Setiap fase yang selesai → buat file `phase-[nama-fase].md`
- Format wajib mengikuti template di [`AGENTS.md` Section 14](../../AGENTS.md)
- Setelah membuat report, update `docs/PROGRESS.md` dan docs lain
  yang relevan (lihat matrix di AGENTS.md Section 14)

## Format Nama File

```
phase-[nama-fase-kebab-case].md
```

Contoh:
- `phase-feature-toggle.md`
- `phase-footer-migration.md`
- `phase-hardcoded-content-migration.md`

## Daftar Report

| File | Phase | Tanggal | Status |
|------|-------|---------|--------|
| [hardcoded-pages-audit.md](hardcoded-pages-audit.md) | Audit — Halaman Hardcoded vs CMS-Managed (read-only, 23 route) | 2026-08-20 | Selesai |
| [phase-menu-manager-ux.md](phase-menu-manager-ux.md) | Menu Manager — UX & Fleksibilitas (RowLabel, initCollapsed, sub-menu type) | 2026-08-07 | Selesai |
| [phase-hardcoded-migration.md](phase-hardcoded-migration.md) | Migrasi Konten Hardcoded ke CMS (Homepage + Testimonials + errorPages + cleanup) | 2026-08-07 | Selesai |
| [phase-footer-cms-migration.md](phase-footer-cms-migration.md) | Footer & Utility Sections — Wiring ke CMS | 2026-08-07 | Selesai |
| [phase-feature-toggle.md](phase-feature-toggle.md) | Feature Toggle CMS Integration | 2026-08-07 | Selesai |

> Tambahkan baris baru ke tabel ini setiap kali membuat report baru,
> newest-first di atas.

## Referensi

- **Aturan reporting & template lengkap** → [`AGENTS.md`](../../AGENTS.md) Section 14
- **Progress overview keseluruhan** → [`docs/PROGRESS.md`](../PROGRESS.md)
- **Development workflow** → [`WORKFLOW.md`](../../WORKFLOW.md) (root)
