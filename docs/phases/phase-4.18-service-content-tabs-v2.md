# Phase 4.18 — Service Content Tabs V2 (6-Tab Structure)

> **Status:** 🔨 In Progress — Accommodations trial implemented · Astro build 50 pages OK · ⏳ CMS visual verify  
> **Branch:** `feature/phase4-polish-launch`  
> **Trial:** Accommodations collection ONLY  

---

## 0. Tujuan

Konsolidasi tab editor CMS dari 8–9 tab menjadi **6 tab** yang lebih terstruktur dan
intuitif. Penambahan field **Facilities** (grouped/categorized) untuk detail fasilitas
ala Booking.com.

**Prinsip:**
- Unnamed/interfaceOnly tabs — ZERO database impact untuk field yang dipindah
- Field name, type, validation TIDAK berubah — existing data tetap utuh
- Frontend (Astro) TIDAK dimodifikasi
- Trial di Accommodations dulu, replikasi ke 7 service lain setelah approved

---

## 1. Audit — Accommodations (Sebelum)

### Tab Structure Lama (9 tab)

| # | Tab Label | Field Count | Fields |
|---|-----------|:-----------:|--------|
| 1 | Overview | 5 | name, subtitle, type+starRating (row), destination+category (row), description |
| 2 | Media | 2 | featuredImage, gallery |
| 3 | Quick Specs | 1 | quickSpecs (array, max 4) |
| 4 | Amenities & Highlights | 2 | highlightTags (array), amenities (array) |
| 5 | Rooms & Pricing | 2 | checkInTime+checkOutTime (row), roomTypes (array) |
| 6 | Location & Experiences | 4 | locationType, locationFields, nearbyLandmarks, curatedExperiences |
| 7 | Policies | 1 | policies (richText) |
| 8 | 🔒 Custom Sections | 2 | relatedServices (Phase 4.17), additionalBlocks |
| 9 | Booking | 1 | whatsappField |

**Total: 9 tab, 20 field groups**

### Sidebar Fields (tidak diubah)
- sidebarTabsField (General/SEO/Publishing tabs — Phase 4.9)
- slug, status, sortOrder, isFeatured, updatedAtRelative
- seoFields

---

## 2. Tab Structure Baru (6 tab)

| # | Tab Label | Fields | Perubahan |
|---|-----------|--------|-----------|
| 1 | **Overview** | name, subtitle, type+starRating, destination+category, description, quickSpecs, highlightTags | ← Gabung: Overview + Quick Specs + highlightTags dari Amenities |
| 2 | **Media** | featuredImage, gallery | Tidak berubah |
| 3 | **Rooms & Pricing** | checkInTime+checkOutTime, roomTypes, whatsappField | ← Gabung: Rooms & Pricing + Booking |
| 4 | **Amenities & Location** | amenities, **facilities (NEW)**, locationType, locationFields, nearbyLandmarks, curatedExperiences | ← Gabung: amenities dari Amenities & Highlights + Location & Experiences + NEW facilities |
| 5 | **Policies** | policies | Tidak berubah |
| 6 | **🔒 Custom Sections** | relatedServices, additionalBlocks | Tidak berubah |

### Perubahan Detail

| Field | Tab Lama | Tab Baru | DB Impact |
|-------|----------|----------|-----------|
| quickSpecs | Tab 3 (Quick Specs) | Tab 1 (Overview) | NONE — repositioned |
| highlightTags | Tab 4 (Amenities & Highlights) | Tab 1 (Overview) | NONE — repositioned |
| amenities | Tab 4 (Amenities & Highlights) | Tab 4 (Amenities & Location) | NONE — repositioned |
| locationType, locationFields, nearbyLandmarks, curatedExperiences | Tab 6 (Location & Experiences) | Tab 4 (Amenities & Location) | NONE — repositioned |
| whatsappField | Tab 9 (Booking) | Tab 3 (Rooms & Pricing) | NONE — repositioned |
| **facilities** | — | Tab 4 (Amenities & Location) | **YES — new field** |

---

## 3. Field Baru: Facilities

### Desain

```typescript
{
  name: 'facilities',
  type: 'array',
  label: 'Facilities',
  fields: [
    { name: 'category', type: 'text', required: true, label: 'Category Name' },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      fields: [
        { name: 'name', type: 'text', required: true },
      ],
    },
  ],
}
```

### Contoh Data

```
├── Category: "Languages Spoken"
│   └── Items: English, Chinese, Indonesian, Malay
├── Category: "Outdoor"
│   └── Items: Bicycles, Garden, Swimming pool
├── Category: "Getting Around"
│   └── Items: Car park, Shuttle service, Taxi
└── Category: "Things to Do"
    └── Items: Billiards, Diving, Fitness center, Spa
```

### Analisis: Facilities vs Amenities

| Aspek | Amenities | Facilities |
|-------|-----------|------------|
| Struktur | Flat list (name + icon) | Grouped by category (category → items) |
| UI | Icon grid bulat | Kolom-kolom dengan header kategori |
| Tujuan | Quick visual overview | Detail breakdown (ala Booking.com) |
| Contoh | "Pool", "WiFi", "AC" | "Outdoor" → Pool, Garden, BBQ area |

**Keputusan:** Keduanya TETAP ada — Amenities untuk quick visual, Facilities untuk detail.
Category free-text (bukan predefined select) agar fleksibel per properti.

---

## 4. File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `apps/cms/src/collections/Accommodations.ts` | 9 tab → 6 tab, tambah facilities field |
| `docs/PROGRESS.md` | Tambah Phase 4.18 row |

**TIDAK dimodifikasi:** Frontend (Astro), sidebar fields, field names/types/validation.

---

## 5. Verifikasi

- [x] TypeScript compile — no new errors (pre-existing errors only)
- [x] Astro build — 50 pages OK
- [ ] CMS list view — accommodations list loads
- [ ] CMS edit — 6 tabs render, existing data loads
- [ ] Save — no data loss
- [ ] New record — all tabs accessible
- [ ] Sidebar tabs — General/SEO/Publishing still work
- [ ] Frontend — villa/[slug] pages render correctly (no frontend changes)

---

## 6. Proposed Tab Mapping — All 8 Services

> **Belum diimplementasi.** Tabel ini referensi untuk replikasi setelah Accommodations trial approved.

| Tab | Accommodations | Tours | Yachts | Restaurants | Spa | Venues | Rentals | Water Activities |
|-----|---------------|-------|--------|-------------|-----|--------|---------|-----------------|
| 1 | Overview | Overview | Overview | Overview | Overview | Overview | Overview | Overview |
| 2 | Media | Media | Media | Media | Media | Media | Media | Media |
| 3 | Rooms & Pricing | Itinerary & Pricing | Charter & Pricing | Menu & Pricing | Treatments & Pricing | Packages & Pricing | Rental & Pricing | Schedule & Pricing |
| 4 | Amenities & Location | Inclusions & Location | Amenities & Location | Facilities & Location | Amenities & Location | Amenities & Location | Specs & Location | Facilities & Location |
| 5 | Policies | Policies | Policies | Policies | Policies | Policies | Policies | Policies |
| 6 | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections | 🔒 Custom Sections |

### Per-Service Notes

| Service | Current Tabs | Unique Fields | Facilities Applicable? | Tab 3 Content |
|---------|:------------:|---------------|:----------------------:|---------------|
| **Accommodations** | 9 → 6 ✅ | roomTypes, starRating, checkIn/Out | Yes — property amenities | roomTypes + checkIn/Out + whatsapp |
| **Tours** | 9 | itinerary, duration, difficulty, includes/excludes, pricing (adult/child) | No — inclusions list sufficient | itinerary + pricing + whatsapp |
| **Yachts** | 9 | specifications (length/capacity/crew), charter options | Yes — yacht amenities | charter options + pricing + whatsapp |
| **Restaurants** | 9 | menuCategories, cuisineType, openingHours, priceRange | Yes — restaurant facilities | menu + pricing + whatsapp |
| **Spa** | 9 | treatmentType, specifications, pricingTiers | Yes — spa amenities | treatments + pricing + whatsapp |
| **Venues** | 10 | venueType, eventTypes, capacity, packages, testimonials, location | Yes — venue facilities | packages + capacity + whatsapp |
| **Rentals** | 9 | rentalType, specifications, pricingTiers | Partial — specs overlap | specs + pricing + whatsapp |
| **Water Activities** | 9 | activityType, schedule, requirements, includes | No — inclusions sufficient | schedule + pricing + whatsapp |

### Estimated Effort (remaining 7 services)
- Per service: ~15 min (tab restructure) + ~5 min (facilities field if applicable)
- Total: ~2-3 hours
- Risk: LOW — same pattern as Accommodations, unnamed tabs, no DB impact for repositioning

---

## 7. Accordion Sections + Color-Coded Tabs

### Arsitektur

| Komponen | File | Fungsi |
|----------|------|--------|
| `AccordionSections.tsx` | `apps/cms/src/admin/` | Client component — MutationObserver, auto-close siblings, tab-switch reset |
| `accordion-sections.css` | `apps/cms/src/admin/` | Color-coded borders, icon badges, section styling |
| `AdminStyles.tsx` | `apps/cms/src/admin/` | Provider yang load CSS + wrap AccordionSections |

### Pendekatan

- **Accordion:** MutationObserver pada class changes di `.accordion-section` collapsibles. Saat satu section dibuka (class `collapsible--collapsed` dihapus), semua sibling section di tab yang sama di-close otomatis.
- **Tab reset:** Saat tab aktif berubah, section pertama auto-open, sisanya auto-close.
- **Scoping:** Hanya element dengan class `accordion-section` yang terpengaruh. Nested collapsibles (array items, sub-groups) TIDAK terpengaruh.

### Color System

| Tab | Color Name | CSS Variable | Light | Dark |
|-----|-----------|-------------|:-----:|:----:|
| Overview | Ocean | `--acc-overview` | `#1b3a4b` | `#5ba3c9` |
| Media | Leaf | `--acc-media` | `#6b9080` | `#8bd6b6` |
| Rooms & Pricing | Coral | `--acc-rooms` | `#e07a5f` | `#f0a08a` |
| Amenities & Location | Teal | `--acc-amenities` | `#1a8a7a` | `#5cd6c6` |
| Policies | Stone | `--acc-policies` | `#585860` | `#9494a0` |
| Custom Sections | Midnight | `--acc-custom` | `#0d1b2a` | `#7a8fa8` |

### Icon Map per Section

| Tab | Section | Icon | CSS Class |
|-----|---------|------|-----------|
| Overview | Overview & Description | FileText | `section--overview-desc` |
| Overview | Quick Specs | BarChart3 | `section--quick-specs` |
| Overview | Highlight Tags | Star | `section--highlights` |
| Media | Featured Image | Image | `section--featured-img` |
| Media | Gallery | Copy | `section--gallery` |
| Rooms & Pricing | Check-in & Check-out | Clock | `section--checkin` |
| Rooms & Pricing | Room Types | Bed | `section--rooms` |
| Rooms & Pricing | Booking (WhatsApp) | Phone | `section--booking` |
| Amenities & Location | Amenities | Sparkles | `section--amenities` |
| Amenities & Location | Facilities | Building | `section--facilities` |
| Amenities & Location | Location | MapPin | `section--location` |
| Amenities & Location | Nearby & Experiences | Compass | `section--experiences` |
| Policies | Booking Policies | Shield | `section--policies` |
| Custom Sections | Related Services | Radio | `section--related` |
| Custom Sections | Content Blocks | LayoutGrid | `section--blocks` |

### Behavior Rules

1. Accordion hanya di section level — nested array items expand/collapse independen
2. Section pertama auto-open saat switch tab
3. State TIDAK dipersist — reset saat navigasi
4. Transisi smooth via CSS transition
5. Tidak ada konflik dengan block badges di Custom Sections tab

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data hilang saat reposisi tab | NONE | Unnamed tabs = field tetap di root level DB |
| Facilities field pada record existing | NONE | Field optional, default kosong |
| Frontend rusak | NONE | Zero frontend changes, field names tidak berubah |
| Sidebar tabs konflik | NONE | Sidebar tabs terpisah dari main tabs |

---

## 8. Next Steps

1. ⏳ Owner verify: login CMS → buka Accommodations → cek 6 tab + existing data
2. ⏳ CMS schema push untuk `facilities` field baru (jawab `+ create column`)
3. Jika approved → replikasi ke 7 service lainnya (Phase 4.18 Pass 2)
4. Frontend: render Facilities section di detail page (Phase 4.18 Pass 3 atau Phase 4.19)
