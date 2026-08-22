## Phase: Menu Manager — UX & Fleksibilitas
**Tanggal**: 2026-08-07
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Perbaikan 4 masalah UX di Menu Manager (Payload CMS admin panel):
1. Row label "Item 01" → tampil informatif dgn ikon + label + preview URL + jumlah sub-item
2. Sub-menu belum punya `type` → sekarang punya 4 opsi (page/custom/anchor/none-label-only)
3. Panel scroll panjang → `initCollapsed: true` di items & children
4. Sub-menu tidak jelas visual → RowLabel child ada prefix `↳`, opacity muted, font kecil

Semua backward-compatible: children legacy tanpa `type` otomatis default `custom_url` — URL string tetap resolve seperti sebelumnya.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `apps/cms/src/components/MenuItemRowLabel.tsx` | **Baru** — client component `useRowLabel` untuk parent items. Icon per type: 📄/🧭/🔗/⚓. Preview URL/slug. Jumlah sub-item. |
| `apps/cms/src/components/MenuChildRowLabel.tsx` | **Baru** — variant untuk sub-menu. Prefix `↳`, opacity 0.9, fontSize 13. Icon: 📄/🔗/⚓/🏷️. |
| `apps/cms/src/collections/Menus.ts` | Rewrite: `initCollapsed: true`, `components.RowLabel` wired, `type/page` field ditambah di children (4 opsi termasuk `none` label-only), conditional fields per type, `type` di parent + child jadi ada di dalam `row` bersama `label` (compact). |
| `apps/cms/src/app/(payload)/admin/importMap.js` | **Auto-updated** by Payload — RowLabel components ter-register. |
| `apps/web/src/components/navigation/Header.astro` | `resolveChildUrl(c)` helper baru — handle `type: page/custom_url/anchor/none`. Render loop desktop + mobile dropdown handle `asSpan` (label-only jadi `<span>` bold uppercase). Parent tidak berubah. |

### Impact
- **Database**:
  - Kolom baru di subtable `menus_items_children`: `type`, `page` (relationship id)
  - Auto-migrate on next `pnpm dev` (SQLite)
  - Data lama: `type` = null di DB → Payload default value `custom_url` diterapkan pada read (form save). URL string existing tetap dipakai.
- **CMS Admin**: Menu editing sekarang dramatically lebih user-friendly. Row label langsung informatif, panel default collapsed, sub-menu punya type flexibility.
- **Frontend**: Header dropdown sekarang support:
  - Sub-item internal page → resolve dari `page.slug`
  - Sub-item label-only → render `<span>` bold uppercase (untuk group heading di dropdown)
  - Sub-item custom/anchor/legacy — unchanged behavior
- **Footer**: tidak terpengaruh (tidak baca children)
- **RBAC**: none (mengikuti Menus existing — super-admin only)

### Sebelum vs Sesudah

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Row label parent | "Item 01", "Item 02" | `📄 Home — / · 3 sub-item` |
| Row label child | "Item 01" | `↳ 🔗 Special Offers https://…` |
| Default state | Semua expanded → scroll panjang | Semua collapsed → satu klik untuk expand |
| Sub-menu type | Hanya URL text | 4 opsi: page relationship / custom URL / anchor / label-only |
| Label-only header di dropdown | Impossible | Type `none` → render `<span>` bold uppercase (grup heading) |
| Compact form | Label + type di baris terpisah | Label + type di 1 baris `row` (50/50) |

### Testing
- [x] importMap auto-updated saat CMS restart — verified (kedua entries ada)
- [x] Backward compat children lama: `type` default `custom_url`, `url` string tetap resolve — verified via kode
- [x] Header.astro `resolveChildUrl` handle 3 skenario + fallback — verified
- [x] Render loop desktop + mobile dropdown handle `asSpan` — verified
- [ ] Manual: buka Menus → main-navigation di admin → verify row label informatif, initial state collapsed — **perlu manual**
- [ ] Manual: tambah sub-menu type `page` → pilih Page → save → verify frontend dropdown link ke halaman — **perlu manual**
- [ ] Manual: tambah sub-menu type `none` label "Kategori" → verify frontend render sebagai span bold uppercase — **perlu manual**
- [ ] Manual: menu existing dgn sub-menu URL string → verify tetap tampil normal di frontend (backward compat) — **perlu manual**

### Rollback
1. Hapus `apps/cms/src/components/MenuItemRowLabel.tsx` + `MenuChildRowLabel.tsx`
2. `git checkout apps/cms/src/collections/Menus.ts` — revert ke schema lama
3. `git checkout apps/cms/src/app/(payload)/admin/importMap.js` — atau biarkan, Payload akan auto-regen
4. `git checkout apps/web/src/components/navigation/Header.astro`
5. DB: kolom baru `menus_items_children.type` dan `.page_id` boleh dibiarkan (harmless)

Additive schema — tidak destructive. `git revert` cukup.

### Dokumentasi yang Diupdate
- [x] `docs/06-MAINTENANCE-RUNBOOK.md` §1.5 — panduan Menu Manager updated dgn type options, collapsed default, label-only pattern
- [x] `docs/PROGRESS.md` — Phase 3.12 (DONE)
- [x] `docs/reports/phase-menu-manager-ux.md` — file ini
- [x] `docs/reports/README.md` — add row

### Follow-up Fix (2026-08-07, malam)

**Bug 1 — SQLite push tidak add kolom nested array**: Payload `push` mode miss deteksi kolom baru di `menus_items_children`. Fix: script one-shot `apps/cms/src/scripts/fix-menu-children-schema.mjs` untuk ALTER TABLE + backfill.
Jalankan sekali:
```bash
cd apps/cms && node src/scripts/fix-menu-children-schema.mjs
```

**Bug 2 — importMap path salah**: Root cause = Payload default resolve `/components/*` dari project root, bukan `src/`. Fix di [payload.config.ts](../../apps/cms/src/payload.config.ts) — tambah `admin.importMap.baseDir: dirname`. Manual patch importMap.js: `../../../../components/` → `../../../components/`.

**Enhancement — Parent type `none`**: Sekarang parent item juga bisa `🏷️ Dropdown Only` — tidak clickable, cuma trigger sub-menu di hover. Desktop render `<button>` (kalau ada children) atau `<span>` (kalau tidak ada). Mobile render `<span>` bold, sub-menu tetap muncul di bawahnya.
Files: [Menus.ts](../../apps/cms/src/collections/Menus.ts), [MenuItemRowLabel.tsx](../../apps/cms/src/components/MenuItemRowLabel.tsx), [Header.astro](../../apps/web/src/components/navigation/Header.astro).

### Next Steps
1. **Manual test** (checklist di atas) — buka admin panel, verify UX baru + backward compat.
2. **Regen types**: setelah `pnpm dev` di apps/cms, types akan include field `children[].type` + `children[].page`. Bisa hapus `any` cast di Header.astro `map((c: any) => ...)`.
3. **Content**: owner boleh restructure menu — misal ubah sub-menu ke type `page` (lebih maintainable karena Payload track relationship) atau tambah label-only header untuk group dropdown besar.
4. **Design polish opsional** (Phase 4): mobile drawer bisa dikasih visual indent + collapsible sub-menu per parent. Sekarang mobile drawer render children flat di bawah parent.
