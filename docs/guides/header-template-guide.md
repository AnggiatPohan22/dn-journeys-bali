# Header Template Guide

> Phase 3.24 — Header Template System. Every path, field name, and code snippet
> below is taken from the actual codebase (inspected 2026-08-25).

## Overview

The header is no longer a single hardcoded component. A **template registry**
(plain TypeScript, framework-agnostic) declares the available header layouts and
which content **slots** each one supports. A Super Admin picks a template in the
CMS; the frontend reads that choice and renders the matching Astro component.

```
packages/shared/src/template-registry.ts   ← single source of truth (id, name, slots, thumbnail)
        │                                            │
        ▼ (CMS imports, relative path)               ▼ (Astro imports, @shared alias)
apps/cms/src/globals/HeaderSettings.ts        apps/web/src/components/navigation/HeaderRenderer.astro
  - `template` select (options from registry)   - map templateId → HeaderTemplateN.astro
  - slot fields shown via admin.condition        - fetch header-settings + site-settings
        │                                          - resolve nav/cta/social → `ctx` props
        │  save                                    - <Template {...ctx} />
        ▼                                            ▲
   Payload DB (global `header-settings`)  ── GET /api/globals/header-settings ──┘
                                          (apps/web/src/lib/payload.ts → getHeaderSettings)
```

Fallback: if `header-settings.template` is empty/unreachable, HeaderRenderer uses
`defaultTemplateId('header')` → `header-1`.

## Current Templates

| ID | Name (registry) | Component file | Supported slots | Thumbnail |
|----|-----------------|----------------|-----------------|-----------|
| `header-1` | Classic — Logo · Menu · CTA | `apps/web/src/components/navigation/templates/HeaderTemplate1.astro` | `logo`, `primaryMenu`, `ctaButton` | `apps/cms/public/admin-thumbs/header-1.svg` |
| `header-2` | Search & Social — Logo · Search · Menu · Social | `apps/web/src/components/navigation/templates/HeaderTemplate2.astro` | `logo`, `searchToggle`, `primaryMenu`, `socialLinks` | `apps/cms/public/admin-thumbs/header-2.svg` |
| `header-3` | Top Bar — Address/Phone/Social + Logo · Menu · CTA | `apps/web/src/components/navigation/templates/HeaderTemplate3.astro` | `logo`, `primaryMenu`, `ctaButton`, `address`, `phone`, `socialLinks`, `customText` | `apps/cms/public/admin-thumbs/header-3.svg` |

Slot union (from `SlotKey` in the registry): `logo`, `primaryMenu`, `secondaryMenu`,
`ctaButton`, `searchToggle`, `socialLinks`, `address`, `phone`, `email`, `customText`,
plus footer-only slots. Not every slot maps to a CMS field — `logo`, `socialLinks`,
`address`, `phone` read their data from `SiteSettings`; the header global only stores
wiring/toggles.

## File Map

| File | Role |
|------|------|
| `packages/shared/src/template-registry.ts` | Registry: `TemplateKind`, `SlotKey`, `TemplateDef`, `HEADER_TEMPLATES`, `REGISTRY_ID`, `REGISTRY_VERSION`, helpers (`templatesByKind`, `getTemplate`, `templateSupports`, `toSelectOptions`, `defaultTemplateId`), export contract (`TemplateExport`, `validateExport`) |
| `apps/cms/src/globals/HeaderSettings.ts` | Payload global `header-settings`: `template` select + slot fields (conditional) + `importExport` UI field |
| `apps/cms/src/components/TemplatePickerField.tsx` | Custom admin Field — thumbnail radio picker for the `template` select |
| `apps/cms/src/components/TemplateImportExport.tsx` | Custom admin UI field — export/import JSON panel |
| `apps/cms/public/admin-thumbs/header-*.svg` | Thumbnails shown by the picker (served by CMS at `/admin-thumbs/*`) |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Payload import map (generated) — MUST include the two custom components |
| `apps/cms/src/scripts/seed-header-footer-templates.ts` | Sets `template` default on existing global records |
| `apps/web/src/components/navigation/HeaderRenderer.astro` | Fetches data, builds `ctx`, dispatches to the selected `HeaderTemplateN` |
| `apps/web/src/components/navigation/templates/HeaderTemplate1.astro` | Classic layout |
| `apps/web/src/components/navigation/templates/HeaderTemplate2.astro` | Search & Social layout |
| `apps/web/src/components/navigation/templates/HeaderTemplate3.astro` | Top Bar layout |
| `apps/web/src/components/navigation/templates/_HeaderNavDesktop.astro` | Shared desktop nav (click-to-open dropdowns) |
| `apps/web/src/components/navigation/templates/_HeaderNavMobile.astro` | Shared mobile nav (accordion sub-menus) |
| `apps/web/src/components/navigation/templates/_HeaderMobile.astro` | Shared full-screen mobile overlay (hosts `_HeaderNavMobile` + `<slot/>`) |
| `apps/web/src/components/navigation/templates/_SocialIcons.astro` | Shared brand social icons (IG/FB/TikTok/YouTube) |
| `apps/web/src/lib/payload.ts` | `getHeaderSettings()` → `fetchGlobal('header-settings')` (REST `GET /api/globals/header-settings`) |
| `apps/web/src/layouts/PageLayout.astro` | Imports `HeaderRenderer.astro` as `Header`, renders `<Header transparent={transparentHeader} />` |
| `apps/web/src/pages/404.astro` | Also imports `HeaderRenderer.astro` as `Header` |
| `packages/shared/src/types/payload-types.ts` | Generated types (`HeaderSetting.template: 'header-1' \| 'header-2' \| 'header-3'`, slot fields) |

> Note: `apps/web/src/components/navigation/Header.astro` is the pre-3.24 header and
> is no longer imported anywhere (kept as reference). `HeaderTemplate1` is its replica.

## The `ctx` props passed to every header template

`HeaderRenderer.astro` builds one object and spreads it into the chosen template
(`<Template {...ctx} />`). A new template receives exactly these props:

```ts
// Shape assembled in HeaderRenderer.astro (loose — templates read what they need)
interface HeaderCtx {
  siteName: string
  logoUrl: string
  logoAlt: string
  items: NavItem[]            // resolved nav (label, url, target, asSpan, children[])
  currentPath: string
  transparent: boolean
  cta: { show: boolean; text: string; href: string; external: boolean }
  showSearch: boolean         // headerCfg.showSearch !== false
  showSocial: boolean         // headerCfg.showSocialLinks !== false
  social: { instagram: string; facebook: string; tiktok: string; youtube: string }  // resolved URLs from SiteSettings
  topBar: { showAddress: boolean; showPhone: boolean; address: string; phone: string; text: string }
}
// NavItem: { label; url; target?; asSpan?; children?: NavItem[] }  (asSpan = dropdown-only, no link)
```

---

## How to Add a New Header Template

Example: adding `header-4` ("Centered — Logo center, menu split").

### Step 1: Create the component file

- **Directory:** `apps/web/src/components/navigation/templates/`
- **Naming:** `HeaderTemplate<N>.astro` (PascalCase, sequential N). For a 4th template: `HeaderTemplate4.astro`.
- Start from the **simplest** existing template (`HeaderTemplate1.astro`) and adjust. Boilerplate:

```astro
---
// HeaderTemplate4 — "Centered". Receives the ctx props from HeaderRenderer.
import Icon from '@components/common/Icon.astro'
import NavDesktop from './_HeaderNavDesktop.astro'   // desktop nav w/ click dropdowns
import HeaderMobile from './_HeaderMobile.astro'      // full-screen mobile overlay
import SocialIcons from './_SocialIcons.astro'        // only if template uses `socialLinks`
// Destructure only the ctx props this template's slots need:
const { siteName, logoUrl, logoAlt, items = [], currentPath = '/', transparent = false,
        cta = { show: false }, showSocial = true, social = {} } = Astro.props as any
const socials = [ social.instagram, social.facebook, social.tiktok, social.youtube ].filter(Boolean)
---
<header id="main-header" class:list={['fixed top-0 left-0 right-0 z-40 transition-all duration-300',
  transparent ? 'bg-transparent' : 'bg-white/85 backdrop-blur-md border-b border-sand-dark/20 shadow-sm']}>
  <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between h-20" aria-label="Main navigation">
      <a href="/" class="flex items-center gap-3 no-underline text-current">
        {logoUrl
          ? <img src={logoUrl} alt={logoAlt} class="h-10 w-10 rounded-full object-cover" />
          : <span class="h-10 w-10 rounded-full bg-ocean text-white flex items-center justify-center font-display font-bold">{siteName.slice(0,2)}</span>}
        <span class="font-display text-lg font-bold text-ocean hidden sm:inline">{siteName}</span>
      </a>

      {/* Desktop nav — ALWAYS use the shared partial so sub-menus/dropdowns work */}
      <NavDesktop items={items} currentPath={currentPath} />

      <div class="flex items-center gap-3">
        {/* Conditional slot: CTA (only if this template declares `ctaButton`) */}
        {cta.show && cta.href && (
          <a href={cta.href} target={cta.external ? '_blank' : undefined} rel={cta.external ? 'noopener noreferrer' : undefined}
             class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-ocean text-white text-sm font-semibold rounded-full no-underline">
            <Icon name="chat" class="w-4 h-4" /><span class="hidden md:inline">{cta.text}</span><span class="md:hidden">Book</span>
          </a>
        )}
        {/* Mobile toggle — id MUST be `mobile-toggle`; _HeaderMobile wires it */}
        <button id="mobile-toggle" type="button" class="lg:hidden p-2 text-ocean rounded-md hover:bg-sand"
                aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
          <Icon name="menu" class="w-6 h-6 mobile-toggle-open" />
          <Icon name="close" class="w-6 h-6 mobile-toggle-close hidden" />
        </button>
      </div>
    </nav>
  </div>
</header>

{/* Full-screen mobile overlay — MUST be OUTSIDE <header> (backdrop-blur on the
    header creates a containing block that would trap a fixed overlay). Pass slot
    extras (search/social/cta) as children. */}
<HeaderMobile items={items} currentPath={currentPath} siteName={siteName} logoUrl={logoUrl} logoAlt={logoAlt}>
  {cta.show && cta.href && (
    <a href={cta.href} class="mt-5 flex items-center justify-center gap-2 px-5 py-3 bg-ocean text-white text-base font-semibold rounded-full no-underline">
      <Icon name="chat" class="w-5 h-5" />{cta.text}
    </a>
  )}
</HeaderMobile>
<div class="h-20"></div>  {/* spacer = header height */}
```

**Props/slots interface:** see [The `ctx` props](#the-ctx-props-passed-to-every-header-template)
above — a template only destructures the props matching its declared slots.

**Required sections to include:**
1. `<header id="main-header" ...>` with the transparent/solid class logic.
2. Logo + `<NavDesktop items currentPath />` for desktop nav.
3. A `<button id="mobile-toggle">` with `.mobile-toggle-open` / `.mobile-toggle-close` icons.
4. `<HeaderMobile ...>` **outside** the `<header>` element.
5. A spacer `<div class="h-...">` equal to the header's height.

**Conditional slots:** gate each optional block behind the ctx flag it corresponds to:
`{cta.show && ...}` (ctaButton), `{showSearch && ...}` (searchToggle),
`{showSocial && socials.length > 0 && ...}` (socialLinks), `{topBar.showAddress && topBar.address && ...}`
(address), etc. Use `<SocialIcons social={social} linkClass="..." iconClass="..." />` for social —
do **not** use `<Icon name="instagram" />` (the Icon lookup has no brand icons).

**Responsive:** desktop nav is `hidden lg:flex` (inside `NavDesktop`); the mobile toggle is
`lg:hidden`; `_HeaderMobile` renders a `fixed inset-0` full-screen overlay with body
scroll-lock and an accordion (`_HeaderNavMobile`). You get all of this for free by using
the shared partials — do not hand-roll a mobile menu.

### Step 2: Register the template

- **File:** `packages/shared/src/template-registry.ts`
- Add an entry to the `HEADER_TEMPLATES` array:

```ts
export const HEADER_TEMPLATES: TemplateDef[] = [
  // ...existing header-1, header-2, header-3...
  {
    templateId: 'header-4',                 // must be unique + match the renderer map key
    name: 'Centered — Logo center, menu split',  // shown in the admin picker
    kind: 'header',                         // 'header' | 'footer'
    slots: ['logo', 'primaryMenu', 'ctaButton'],  // SlotKey[] — drives admin.condition
    thumbnail: '/admin-thumbs/header-4.svg',      // served by CMS
  },
]
```

- `templateId` is the join key everywhere (registry ↔ CMS select value ↔ renderer map).
- `name` is the human label in the CMS dropdown/picker.
- `slots` declares which content fields appear in the CMS for this template — the
  Payload `admin.condition` calls `templateSupports(template, slot)` against this list.

Then register the component in the renderer:

- **File:** `apps/web/src/components/navigation/HeaderRenderer.astro`

```astro
import HeaderTemplate4 from './templates/HeaderTemplate4.astro'   // add import
// ...
const TEMPLATES: Record<string, any> = {
  'header-1': HeaderTemplate1,
  'header-2': HeaderTemplate2,
  'header-3': HeaderTemplate3,
  'header-4': HeaderTemplate4,   // add map entry (key === templateId)
}
```

### Step 3: Add to Payload CMS config

- **File:** `apps/cms/src/globals/HeaderSettings.ts`
- The `template` select's options come from `toSelectOptions('header')`, which is
  derived from the registry — so **adding to the registry automatically adds the
  dropdown option**. No manual option edit needed.
- Only edit this file if your template introduces a **new slot** that has no field yet.
  Add a field gated by the slot. Existing helper in the file:

```ts
// Already defined at top of HeaderSettings.ts:
const supports = (slot) => (data) => templateSupports(data?.template, slot)

// Example: a template introduces a new `announcement` slot →
{
  name: 'announcementText',
  type: 'text',
  admin: {
    condition: supports('announcement'),   // only shows when selected template lists this slot
    description: 'Announcement bar text.',
  },
}
```

(You would also add `'announcement'` to the `SlotKey` union in the registry.)

### Step 4: Add preview thumbnail

- **Directory:** `apps/cms/public/admin-thumbs/`
- **Naming:** `<templateId>.svg` → `header-4.svg` (must match `thumbnail` in the registry entry).
- **Format/size:** existing thumbnails are SVG at `viewBox="0 0 320 90"` (≈320×90, ~2.4:1).
  PNG/JPG also work; keep it small and wireframe-like. Served at `http://localhost:3030/admin-thumbs/header-4.svg`.

### Step 5: Build & verify

```bash
# 1. Regenerate Payload types (registry change affects the select union)
cd apps/cms && pnpm generate:types

# 2. If you added/renamed custom admin components, regenerate the import map
cd apps/cms && pnpm generate:importmap

# 3. Restart CMS (schema push only if you added new fields)
cd apps/cms && pnpm dev

# 4. Frontend
cd apps/web && pnpm dev      # or: pnpm --filter @dn-journeys/web build
```

- **Admin:** open `Header Settings` → the picker shows the new thumbnail; selecting it
  shows only the slot fields it declares.
- **Frontend:** select `header-4`, reload `/` → the new layout renders.
- **Responsive:** shrink to <1024px → mobile toggle appears; open it → full-screen
  overlay; parent menu items expand on tap.

---

## How to Remove a Header Template

### Pre-removal checklist
- **Is it active?** Check the CMS global (see Step 1). If it is the currently selected
  template, switch to another template first.
- **Removing the active template:** the frontend falls back to
  `TEMPLATES[templateId] ?? HeaderTemplate1` and `headerCfg?.template || defaultTemplateId('header')`
  — so a stale/removed id renders `header-1`. But the CMS record still stores the removed
  id, and `HeaderSetting.template` type will no longer include it → **type error on build**
  until re-saved. Always re-point the CMS to a valid template before removing.
- **Saved content data:** slot field values (e.g. `topBarText`) stay in the DB even if the
  template no longer uses them; they are simply not rendered. No destructive migration.

### Step 1: Check active usage
```bash
curl -s "http://localhost:3030/api/globals/header-settings?depth=0" \
  | python -c "import sys,json;print(json.load(sys.stdin).get('template'))"
```
If it prints the id you want to remove, change it in the admin first.

### Step 2: Remove from CMS config
- **File:** `apps/cms/src/globals/HeaderSettings.ts` — only if you added slot-specific
  fields exclusively for this template, remove them. The `template` options are
  registry-driven, so nothing to remove there.

### Step 3: Remove from registry
- **File:** `packages/shared/src/template-registry.ts` — delete the entry from `HEADER_TEMPLATES`.
- **File:** `apps/web/src/components/navigation/HeaderRenderer.astro` — remove the import
  and the `TEMPLATES` map entry.

### Step 4: Delete the component file
- Delete `apps/web/src/components/navigation/templates/HeaderTemplate<N>.astro`.

### Step 5: Clean up
- Delete `apps/cms/public/admin-thumbs/header-<N>.svg`.
- Remove any slot key you added solely for this template from the `SlotKey` union.
- `cd apps/cms && pnpm generate:types` then build both apps to verify no type/import errors.

---

## How to Modify an Existing Header Template

### Changing layout/structure
- Edit the component file directly, e.g. `HeaderTemplate2.astro`.
- **Important:** the change applies to every site/build that selects this template.
- Test safely: run `apps/web` dev, switch the CMS to that template, reload, and check
  desktop + mobile before deploying.

### Adding a new configurable option (toggle / alignment / width)
Example: add a `compact` toggle to header-2.

1. **Payload field** — `apps/cms/src/globals/HeaderSettings.ts`:
```ts
{
  name: 'compact',
  type: 'checkbox',
  defaultValue: false,
  admin: { condition: supports('primaryMenu'), description: 'Compact height header.' },
}
```
2. **Types** — `cd apps/cms && pnpm generate:types` (adds `compact?: boolean | null`).
3. **Pass it through** — `apps/web/src/components/navigation/HeaderRenderer.astro`, add to `ctx`:
```ts
const ctx = { /* ...existing... */, compact: headerCfg?.compact === true }
```
4. **Use it** — in `HeaderTemplate2.astro`:
```astro
const { /* ... */, compact = false } = Astro.props as any
<nav class:list={['flex items-center gap-4', compact ? 'h-14' : 'h-20']}>
```

### Changing which slots a template supports
1. Update the `slots` array for that entry in `packages/shared/src/template-registry.ts`.
2. If adding a slot with no field yet, add a conditional field in `HeaderSettings.ts`
   (`admin.condition: supports('<slot>')`); if removing, delete/ungate the field.
3. Update the component to render (or stop rendering) that slot, and add the prop to
   `ctx` in `HeaderRenderer.astro` if it needs new data.
4. `pnpm generate:types` + restart CMS.

---

## Troubleshooting

**Template not appearing in CMS dropdown**
- Entry missing from `HEADER_TEMPLATES` (registry) or wrong `kind` (`'header'`). Options come
  from `toSelectOptions('header')`.
- Types stale → run `cd apps/cms && pnpm generate:types`, restart CMS.

**Template selected but frontend shows wrong/old template**
- `templateId` in the registry doesn't match the key in `HeaderRenderer.astro`'s `TEMPLATES` map
  → falls back to `HeaderTemplate1`.
- Frontend is static — rebuild `apps/web` (or reload dev) after changing the CMS selection.

**Content (slot) fields not showing after selecting template**
- The slot isn't in that template's `slots` array → `admin.condition` (`supports(...)`) hides the field.
- The field's `admin.condition` references the wrong slot key.

**Build fails after adding/removing template**
- `HeaderRenderer.astro` imports a deleted component, or the `TEMPLATES` map references a
  missing import. Keep import + map entry + registry in sync.
- `HeaderSetting.template` union no longer includes a value stored in the DB — re-save the
  global to a valid template.

**Import fails because template not found**
- `validateExport` returns `template not found` when the JSON's `templateId` isn't in the
  target project's registry. The target must register the same `templateId` (see
  Import/Export section in the phase doc / footer guide). Fix by adding the template or
  editing the JSON's `templateId`.

**Custom picker / import-export panel not rendering** (`getFromImportMap: PayloadComponent not found`)
- Run `cd apps/cms && pnpm generate:importmap`, then restart the CMS. Required whenever
  `TemplatePickerField`/`TemplateImportExport` (or any custom admin component) is added/moved.

**Active template deleted — site "broken"**
- The renderer falls back to `header-1`, so the site still renders. If the CMS type union
  causes a build error: re-add the template to the registry OR set
  `header-settings.template` to a valid id (via admin or
  `pnpm tsx src/scripts/seed-header-footer-templates.ts`), then `pnpm generate:types`.

**Responsive / mobile layout issues with a new template**
- Mobile menu not full-screen / clipped to header height → you rendered `<HeaderMobile>`
  **inside** `<header>`; the header's `backdrop-blur` traps the fixed overlay. Move
  `<HeaderMobile>` to be a sibling **after** `</header>`.
- Toggle does nothing → the button must have `id="mobile-toggle"` and the two icons must
  have `.mobile-toggle-open` / `.mobile-toggle-close`.
- Sub-menu items missing on mobile → use `_HeaderMobile` (which renders `_HeaderNavMobile`),
  not a hand-written list.

---

## Known Limitations (found during inspection)

1. **Single header/footer per site.** `header-settings` is a Payload **global** (one record),
   so template + content are site-wide. Per-page headers would require a collection.
2. **No search backend.** The `searchToggle` slot renders a search `<input>` only; there is
   no search handler wired — it is presentational.
3. **`secondaryMenu` slot has no consumer.** The field exists (gated by `supports('secondaryMenu')`)
   but no shipped template lists `secondaryMenu`, so it never renders.
4. **Parent menu items with children are not links.** Both desktop (`_HeaderNavDesktop`) and
   mobile (`_HeaderNavMobile`) treat a parent-with-children as a toggle only; a parent that
   also has its own URL is not directly navigable — children carry the destinations.
5. **Removing the active template can break the type-check** (`HeaderSetting.template` union)
   until the global is re-saved, even though the runtime falls back to `header-1`.
6. **Icon set is a fixed lookup** (`apps/web/src/components/common/Icon.astro`) with no brand
   icons — use `_SocialIcons.astro` for social, not `<Icon>`.
7. **Import/Export is an in-page UI field**, not a standalone admin view/route.
8. **CMS↔shared import is a deep relative path** (`../../../../packages/shared/src/template-registry`)
   and relies on Next `experimental.externalDir: true` (`apps/cms/next.config.mjs`).
