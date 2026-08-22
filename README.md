# DnJourneysBali — Travel Website Template

Travel website with 7 service modules, built on **Astro + Tailwind + GSAP** (frontend) and **Payload CMS** (backend), deployed to **Cloudflare** (Pages + Workers).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 5, Tailwind CSS 4, GSAP 3, Alpine.js |
| CMS | Payload CMS 3, Lexical Editor |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Hosting | Cloudflare Pages (frontend) + Workers (CMS) |

## Service Modules

Tours & Activities · Villas & Hotels · Water Activities · Private Yacht · Restaurants · Weddings & Events · Rental Service

Each module can be toggled on/off in `apps/web/src/config/modules.ts`.

## Prerequisites

Sebelum mulai, pastikan sudah terpasang:

- **Node.js** ≥ 18 (rekomendasi 20+)
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Wrangler CLI** — sudah termasuk sebagai dependency (dipanggil via `pnpm`/`npx`)
- **Cloudflare account** (gratis) — wajib untuk menjalankan CMS karena butuh D1 & R2

## First-time Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup environment variables

```bash
cp apps/web/.env.example apps/web/.env
cp apps/cms/.env.example apps/cms/.env
```

- `apps/web/.env` — set `CMS_URL=http://localhost:3030`
- `apps/cms/.env` — ganti `PAYLOAD_SECRET` dengan string acak (`openssl rand -hex 32`)

Untuk dev lokal, CMS otomatis pakai SQLite file (`apps/cms/cms.db`). Langkah
Cloudflare (login + D1 + R2) hanya diperlukan saat deploy production.

### 3. (Opsional) Login ke Cloudflare — hanya untuk deploy

```bash
pnpm --filter @dn-journeys/cms exec wrangler login
```

### 4. (Opsional) Provision Cloudflare D1 & R2 — hanya untuk deploy

```bash
# Buat D1 database
pnpm --filter @dn-journeys/cms exec wrangler d1 create dn-journeys-db

# Buat R2 bucket
pnpm --filter @dn-journeys/cms exec wrangler r2 bucket create dn-journeys-media
```

Salin `database_id` yang muncul dari perintah `d1 create` ke `apps/cms/wrangler.toml`
pada field `database_id`. Lalu ganti `PAYLOAD_SECRET` dengan string acak 32 karakter
(bisa pakai `openssl rand -hex 32`).

### 5. Generate Payload types (opsional, setelah CMS jalan pertama kali)

```bash
pnpm generate:types
```

## Menjalankan Development

Jalankan di dua terminal terpisah:

```bash
# Terminal 1 — CMS (Payload di Cloudflare Workers)
pnpm dev:cms          # → http://localhost:3030/admin

# Terminal 2 — Frontend (Astro)
pnpm dev:web          # → http://localhost:4321
```

Saat pertama kali membuka `/admin`, Payload akan meminta pembuatan user admin.

## Project Structure

```
├── apps/web/         Astro frontend (Cloudflare Pages)
├── apps/cms/         Payload CMS (Cloudflare Workers)
├── packages/shared/  Shared types & utilities
├── ai/               AI agent rules
└── docs/             Documentation
```

## Deploy

```bash
# CMS → Cloudflare Workers
pnpm deploy:cms

# Frontend → Cloudflare Pages
pnpm deploy:web
# atau auto-deploy via GitHub integration
```

## New Client Setup

1. Clone repo
2. Update warna di `apps/web/tailwind.config.mjs`
3. Toggle modul di `apps/web/src/config/modules.ts`
4. Update `apps/cms/wrangler.toml` (worker name, D1 id, R2 bucket)
5. Deploy CMS → buat admin user → isi konten
6. Deploy frontend → arahkan domain → selesai

## Troubleshooting

- **`wrangler dev` error binding D1**: pastikan `database_id` di `wrangler.toml` sudah diisi dari hasil `wrangler d1 create`.
- **Frontend tidak dapat data dari CMS**: cek `CMS_URL` di `apps/web/.env` dan pastikan CMS sudah running di port 8787.
- **pnpm command not found**: install global dengan `npm install -g pnpm`.
