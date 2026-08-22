# DB-SCHEMA-CHANGES.md — Panduan Menangani Perubahan Skema Database

Panduan self-service untuk menangani prompt & error yang muncul saat schema
Payload/Drizzle berubah (biasanya karena tambah/edit/hapus field di
`apps/cms/src/collections/` atau `apps/cms/src/blocks/`).

Baca ini setiap kali `pnpm dev` di `apps/cms` menampilkan:
- Prompt **"Is X column created or renamed…"**
- Error **"Exceeded max identifier length for table or enum name of 63 characters"**
- Error **"Cannot add NOT NULL column…"** atau schema push gagal di tengah jalan

---

## 1. Prompt "Created or renamed?"

### Kapan muncul
Drizzle mendeteksi ada kolom BARU dan kolom LAMA yang mungkin berkaitan
(nama mirip, tipe kompatibel). Dia tidak yakin apakah kamu:
- **Buat kolom baru** (dan kolom lama tetap ada / akan di-drop terpisah)
- **Rename kolom lama** (nama beda, tapi data sebenarnya sama)

Contoh output:
```
Is media_type column in tours_blocks_service_listing table created or renamed from another column?
❯ + media_type                                   create column
  ~ hero_background_type › media_type            rename column
  ~ hero_background_image_id › media_type        rename column
```

### Decision Tree

```
Apakah field lama & baru punya SEMANTIK yang sama?
(nilai/tipe/range/domain sama, cuma nama berubah)
│
├─ YA → Pilih "rename column"
│       Data lama tetap dipertahankan.
│       Contoh: `subtitle` → `tagline` (sama-sama text pendek)
│
└─ TIDAK → Pilih "+ create column"
        Kolom lama akan di-drop di prompt terpisah.
        Data lama HILANG (accept trade-off ini).
        Contoh: enum `{image, video}` → enum `{single, multiple, video, none}`
```

### Contoh Kasus Nyata

| Situasi | Pilih | Alasan |
|---------|-------|--------|
| Rename field CMS (`title` → `heading`), tipe sama | rename | Data lama valid untuk field baru |
| Ubah enum options (`{a,b}` → `{x,y}`) | create | Nilai lama tidak match enum baru |
| Ubah tipe (`text` → `richText`) | create | Bentuk data beda, migrasi manual perlu |
| Ubah struktur group (flat → grouped) | create | Path field beda |
| Field baru yang tidak ada padanan lama | create | Default option, tidak ada risiko |

### Kalau Ragu
**Pilih `create column`.** Aman jika kamu masih di fase development (data
belum production). Kalau data penting sudah ada di field lama, backup dulu
via `curl http://localhost:3030/api/[collection]` → simpan JSON → lakukan
"create column" → re-input via API/admin.

---

## 2. Error "Exceeded max identifier length of 63 characters"

### Penyebab
Postgres batasi nama tabel/kolom/enum maksimal **63 karakter**. Payload +
Drizzle auto-generate nama kolom/enum berdasarkan path field bersarang.

Contoh:
```
enum_water_activities_blocks_service_listing_image_slider_image_position
= 76 karakter ❌
```

Sumber panjang: `namaCollection_blocks_namaBlock_namaArray_namaField`.
Semakin dalam nesting + semakin panjang nama collection/block/field →
semakin besar risiko overflow.

### Fix Options

#### Option A — Shorten via `dbName`
Payload semua field type (array, group, select, upload) mendukung prop
`dbName` untuk override nama yang dipakai di DB tanpa mengubah nama field
di API/frontend.

```typescript
{
  name: 'imageSlider',
  type: 'array',
  dbName: 'slides',           // ← DB pakai 'slides', API tetap 'imageSlider'
  fields: [...],
}
```

Untuk field select yang panjang:
```typescript
{
  name: 'imagePosition',
  type: 'select',
  enumName: 'enum_sl_img_pos',  // ← override auto-generated enum name
  options: [...],
}
```

#### Option B — Shorten field name
Kalau field masih baru dan belum ada data:
```typescript
// Before
{ name: 'backgroundImage', type: 'upload', ... }
// After (jauh lebih pendek path-nya)
{ name: 'image', type: 'upload', ... }
```

#### Option C — Flatten struktur
Kalau field ada di dalam `group`, hoist ke parent level:
```typescript
// Before (path: block.heroBackground.overlayOpacity)
{ name: 'heroBackground', type: 'group', fields: [
  { name: 'overlayOpacity', type: 'number' },
]}
// After (path: block.heroOverlayOpacity)
{ name: 'heroOverlayOpacity', type: 'number' }
```

#### Option D — Drop field yang tidak esensial
Kalau nested field yang overflow tidak wajib, hilangkan:
```typescript
// Array element originally had per-slide fit/position → drop, pakai
// block-level fit/position sebagai default untuk semua slide.
```

### Cara Menghitung Panjang Sebelum Push

Rumus enum name yang di-generate Payload:
```
enum_<collection>_blocks_<block>_<field_path_underscored>
```

Cek dengan grep collection terpanjang:
```bash
ls apps/cms/src/collections/ | awk '{ print length, $0 }' | sort -rn | head
```

Kalau ServiceListing block dipakai di `water_activities` (16 char) via
`additionalBlocks`, prefix tabel = `water_activities_blocks_service_listing`
= 40 char. Sisa untuk field path & prefix `enum_` = 23 char. Ketat sekali.

**Aturan praktis:** kalau block bisa nested via additionalBlocks di
collection dengan nama panjang (>10 char), semua field path di dalamnya
harus ≤ 18 char.

---

## 2.5. Prompt "created or renamed" MUNCUL BERULANG Setiap Restart

### Symptom
Kamu sudah jawab `+ create column` untuk semua prompt & konfirmasi `y` untuk
drop kolom lama. Restart CMS. Prompt yang SAMA muncul lagi. Berulang tanpa
progres.

### Root Cause
Drizzle-kit di SQLite adapter melakukan schema push via pattern:
1. Buat shadow table `__new_<tablename>` dengan schema baru
2. COPY data dari table lama → shadow
3. DROP table lama
4. RENAME `__new_<tablename>` → `<tablename>`

Kalau step 3 gagal (biasanya FK constraint, atau child table masih
reference table lama), migrasi rollback tapi **shadow `__new_*` tetap
tertinggal**. Setiap restart, Drizzle re-plan migration tapi tidak bisa
lanjut karena shadow menghalangi.

### Diagnosis
```powershell
# Dari apps/cms/, jalankan inspector (script sudah ada di src/scripts/)
pnpm tsx src/scripts/inspect-schema.ts __new
```
Kalau output menampilkan `__new_<sesuatu>` table, itu shadow orphan.

### Fix
```powershell
# 1. Stop CMS (Ctrl+C)
# 2. Bersihkan shadow tables:
pnpm tsx src/scripts/cleanup-shadow-tables.ts

# 3. Restart CMS
pnpm dev
```
Kalau prompt masih muncul, jawab `+ create column` untuk semua. Kali ini
migration bakal complete karena shadow sudah hilang.

### Kalau Masih Gagal
Kemungkinan besar table lama punya data yang bentrok dengan schema baru
(mis: NOT NULL column baru tanpa default, atau FK dari child table).
Backup data → clear rows → migrate → restore data:

```powershell
# 1. Backup rows via API sebelum clear
curl "http://localhost:3030/api/pages?depth=2&limit=100" > backup-pages.json

# 2. Clear rows di table yg bermasalah
pnpm tsx -e "
import { createClient } from '@libsql/client'
import path from 'path'
const c = createClient({ url: 'file:' + path.resolve('cms.db') })
await c.execute('DELETE FROM pages_blocks_service_listing_accommodation_types')
await c.execute('DELETE FROM pages_blocks_service_listing')
console.log('cleared')
process.exit(0)
"

# 3. Cleanup shadow lagi (biasanya masih ada dari attempt sebelumnya)
pnpm tsx src/scripts/cleanup-shadow-tables.ts

# 4. Restart CMS — migration bakal lancar karena table kosong
pnpm dev

# 5. Re-seed data (kalau ada seed script)
pnpm tsx src/scripts/seed-landing-pages.ts
```

---

## 3. Error "Payload initError" / Schema Push Gagal Mid-Way

### Symptom
CMS crash saat startup. Log berisi `payloadInitError: true` dan error
tentang column/table yang tidak konsisten (mis: kolom sudah ada tapi tipe
beda, atau enum yang seharusnya di-drop masih ter-reference).

### Kenapa
Drizzle push adalah operasi non-transactional untuk sebagian besar
perubahan. Kalau push kena error di tengah (mis: 63-char limit), sebagian
tabel/enum sudah dibuat, sebagian belum. Schema jadi "stuck in between".

### Recovery — SQLite (dev lokal)
```powershell
# 1. Stop CMS
# 2. Backup database
Copy-Item apps/cms/dnjourneysbali.db apps/cms/dnjourneysbali.db.backup

# 3. Cek tabel yang bermasalah
sqlite3 apps/cms/dnjourneysbali.db ".schema" | grep "service_listing"

# 4. Drop tabel/kolom bermasalah manual
sqlite3 apps/cms/dnjourneysbali.db "DROP TABLE IF EXISTS pages_blocks_service_listing_hero_background;"

# 5. Restart CMS — Payload recreate fresh schema
cd apps/cms; pnpm dev
```

### Recovery — Postgres
```bash
# Cek tabel bermasalah
psql -c "\dt *service_listing*"

# Drop stale
psql -c "DROP TABLE IF EXISTS pages_blocks_service_listing_hero_background CASCADE;"
psql -c "DROP TYPE IF EXISTS enum_pages_blocks_service_listing_hero_background_type CASCADE;"

# Restart CMS
```

### Recovery — Production (Cloudflare D1)
Jangan pernah manual DROP di production tanpa backup + approval user.
Buat migration file di `apps/cms/src/migrations/` dan test di staging dulu.

---

## 4. Pre-Flight Checklist Sebelum Ubah Schema

Setiap kali kamu edit `apps/cms/src/collections/*` atau
`apps/cms/src/blocks/*` (terutama tambah/rename/hapus field), lakukan
checklist ini SEBELUM `pnpm dev`:

```
[ ] Field name yang baru tidak > 25 char (aman untuk nesting)
[ ] Kalau block, cek apakah dipakai di `additionalBlocks` collection
    manapun (grep: `additionalBlocks` di src/collections/)
[ ] Kalau iya, hitung: len('enum_') + len(collection) + len('_blocks_')
    + len(block_slug) + len('_') + len(field_path_underscored) ≤ 63
[ ] Field baru punya default value ATAU non-required (avoid NOT NULL
    error di rows existing)
[ ] Kalau rename field yang punya data, siap jawab prompt "rename"
[ ] Kalau ubah semantik enum, siap jawab "create" (data hilang)
[ ] Backup DB dev kalau eksperimen besar
```

---

## 5. Quick Reference — Prompt Answers

Ketika `pnpm dev` di apps/cms tampilkan prompt interaktif:

| Prompt | Kapan pilih apa |
|--------|----------------|
| `+ create column` | Field baru, ATAU semantik berubah, ATAU ragu |
| `~ rename column` | HANYA kalau nama berubah tapi data & tipe identik |
| `+ create table` | Array/relationship baru → selalu ini |
| `+ create enum` | Select field baru → selalu ini |
| `Drop column X?` (y/N) | `y` kalau field lama sudah tidak dipakai di config |
| `Drop table X?` (y/N) | `y` HANYA kalau yakin tabel legacy tidak dipakai |
| `Truncate table X?` (y/N) | `N` — jangan pernah kecuali eksplisit diminta |

Untuk task besar dengan banyak prompt: baca satu-per-satu, jangan spam
Enter — salah satu bisa drop table produksi.

---

## 6. When to Ask AI Agent for Help

Panggil AI agent kalau:
- Prompt yang muncul melibatkan kolom yang berisi data production
- Ada > 10 prompt sekaligus dan bingung urutannya
- Setelah recovery, CMS masih tidak start
- Perubahan skema akan di-deploy ke production (butuh migration file)

**Format melapor ke AI:**
```
Aku mau ubah [collection/block X].
Perubahan: [add field Y, rename Z → W, dst]
Prompt yang muncul: [copy paste log]
Ada data production di [table/field]? [ya/tidak]
```

Jangan panik & jawab `y` ke semua prompt tanpa baca — bisa hilangkan data.
Lebih baik `Ctrl+C` di CMS, tanya AI, baru retry.

---

## 7. Related Docs

- [AGENTS.md §11](../AGENTS.md) — Safety rules (jangan install package/ubah schema tanpa approval)
- [WORKFLOW.md §3](../WORKFLOW.md) — Workflow edit existing collection (rename field)
- [docs/06-MAINTENANCE-RUNBOOK.md](./06-MAINTENANCE-RUNBOOK.md) — Runbook maintenance lain
- [docs/PROGRESS.md](./PROGRESS.md) — Log fase, cek Known Issues untuk error pattern yang sudah pernah kena
