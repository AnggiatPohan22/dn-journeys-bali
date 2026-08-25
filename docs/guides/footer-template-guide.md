# Footer Template Guide

> Phase 3.24 — Footer Template System. Every path, field name, and code snippet
> below is taken from the actual codebase (inspected 2026-08-25). It mirrors the
> [Header Template Guide](header-template-guide.md); footer-specific differences
> are called out explicitly.

## Overview

Like the header, the footer is template-driven. The same **template registry**
declares footer layouts and their content **slots**. A Super Admin picks a footer
template in the CMS; the frontend reads the choice and renders the matching Astro
component.

```
packages/shared/src/template-registry.ts   ← single source of truth (FOOTER_TEMPLATES)
        │                                            │
        ▼ (CMS imports, relative path)               ▼ (Astro imports, @shared alias)
apps/cms/src/globals/FooterSettings.ts        apps/web/src/components/navigation/FooterRenderer.astro
  - `template` select (options from registry)   - map templateId → FooterTemplateN.astro
  - slot fields shown via admin.condition        - fetch footer-settings + site-settings + service-types
        │                                          - resolve columns/services/social → `ctx` props
        │  save                                    - <Template {...ctx} />
        ▼                                            ▲
   Payload DB (global `footer-settings`)  ── GET /api/globals/footer-settings ──┘
                                          (apps/web/src/lib/payload.ts → getFooterSettings)
```

**Difference vs header:** the footer has **no mobile toggle/overlay**. It is not a
collapsible menu — it is a responsive grid that stacks on small screens (Tailwind
`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). There are no `_HeaderMobile` /
`_HeaderNavDesktop` / `_HeaderNavMobile` equivalents in the footer.

Fallback: if `footer-settings.template` is empty/unreachable, FooterRenderer uses
`defaultTemplateId('footer')` → `footer-1`.

## Current Templates

| ID | Name (registry) | Component file | Supported slots | Thumbnail |
|----|-----------------|----------------|-----------------|-----------|
| `footer-1` | Multi-column — Brand · Columns · Services · Contact | `apps/web/src/components/navigation/templates/FooterTemplate1.astro` | `logo`, `columns`, `socialLinks`, `address`, `phone`, `email`, `copyrightText`, `newsletterToggle` | `apps/cms/public/admin-thumbs/footer-1.svg` |
| `footer-2` | Simple — Logo · Copyright · Social | `apps/web/src/components/navigation/templates/FooterTemplate2.astro` | `logo`, `copyrightText`, `socialLinks` | `apps/cms/public/admin-thumbs/footer-2.svg` |
| `footer-3` | Minimal — Copyright · Legal Links | `apps/web/src/components/navigation/templates/FooterTemplate3.astro` | `copyrightText`, `legalLinks` | `apps/cms/public/admin-thumbs/footer-3.svg` |

Footer-only slots (from `SlotKey` in the registry): `columns`, `copyrightText`,
`newsletterToggle`, `legalLinks` (plus shared `logo`, `socialLinks`, `address`, `phone`, `email`).
As with the header, several slots pull data from `SiteSettings` (logo, social, contact,
copyright) — `footer-settings` mostly stores column structure and toggles.

## File Map

| File | Role |
|------|------|
| `packages/shared/src/template-registry.ts` | Registry incl. `FOOTER_TEMPLATES` and shared helpers/contract (same file as header) |
| `apps/cms/src/globals/FooterSettings.ts` | Payload global `footer-settings`: `template` select + slot fields (conditional) + `importExport` UI field |
| `apps/cms/src/components/TemplatePickerField.tsx` | Shared custom picker (reads `custom.templateKind: 'footer'`) |
| `apps/cms/src/components/TemplateImportExport.tsx` | Shared export/import panel (reads `custom.kind: 'footer'`, `custom.slug: 'footer-settings'`) |
| `apps/cms/public/admin-thumbs/footer-*.svg` | Footer thumbnails |
| `apps/cms/src/scripts/seed-header-footer-templates.ts` | Sets `footer-settings.template` default on existing record |
| `apps/web/src/components/navigation/FooterRenderer.astro` | Fetches data, builds `ctx`, dispatches to the selected `FooterTemplateN` |
| `apps/web/src/components/navigation/templates/FooterTemplate1.astro` | Multi-column layout |
| `apps/web/src/components/navigation/templates/FooterTemplate2.astro` | Simple centered layout |
| `apps/web/src/components/navigation/templates/FooterTemplate3.astro` | Minimal one-row layout |
| `apps/web/src/components/navigation/templates/_FooterSocial.astro` | Footer social icons (dark style) — **footer-only** (header uses `_SocialIcons.astro`) |
| `apps/web/src/lib/payload.ts` | `getFooterSettings()` → `fetchGlobal('footer-settings')`; also `getResolvedServiceTypes()` for the services column |
| `apps/web/src/layouts/PageLayout.astro` | Imports `FooterRenderer.astro` as `Footer`, renders `<Footer />` |
| `apps/web/src/pages/404.astro` | Also imports `FooterRenderer.astro` as `Footer` |
| `packages/shared/src/types/payload-types.ts` | Generated types (`FooterSetting.template: 'footer-1' \| 'footer-2' \| 'footer-3'`, slot fields) |

> Note: `apps/web/src/components/navigation/Footer.astro` is the pre-3.24 footer and is
> no longer imported anywhere. `FooterTemplate1` is its replica.

## The `ctx` props passed to every footer template

`FooterRenderer.astro` builds one object and spreads it into the chosen template
(`<Template {...ctx} />`):

```ts
// Shape assembled in FooterRenderer.astro (loose — templates read what they need)
interface FooterCtx {
  siteName: string
  brandTagline: string                       // footerCfg.brandTaglineOverride || SiteSettings.tagline
  logoUrl: string
  logoAlt: string
  contact: { email: string; phone: string; address: string }   // from SiteSettings.contact
  businessHours?: string
  social: { instagram: string; facebook: string; tiktok: string; youtube: string }  // resolved URLs
  showSocial: boolean                        // footerCfg.showSocialLinks !== false
  copyright?: string                         // SiteSettings.footer.copyrightText
  footerColumns: { label: string; items: { label: string; url: string; target?: string }[] }[]
  useFallbackQuickLinks: boolean             // true when footerColumns is empty
  showBrand: boolean; showServices: boolean; servicesLabel: string
  servicesItems: { label: string; url: string; target?: string }[]  // servicesMenu → ServiceTypes → modules
  showContact: boolean; contactLabel: string
  legalLinks: { label: string; url: string; target?: string }[]     // footer-3
  bottomRight: string                        // footerCfg.bottomBarRightText
  showNewsletter: boolean                    // footerCfg.showNewsletter === true (reserved)
  currentYear: number
}
```

Note: `additionalScripts` (tracking HTML from `SiteSettings.footer.additionalScripts`)
is rendered by `FooterRenderer.astro` itself via `<Fragment set:html={...} />`, not by the
templates.

---

## How to Add a New Footer Template

Example: adding `footer-4` ("Two-column — links left, contact right").

### Step 1: Create the component file

- **Directory:** `apps/web/src/components/navigation/templates/`
- **Naming:** `FooterTemplate<N>.astro`. For a 4th: `FooterTemplate4.astro`.
- Start from the **simplest** footer (`FooterTemplate3.astro`) or the closest layout.
  Boilerplate based on the real templates:

```astro
---
// FooterTemplate4 — "Two-column". Receives ctx props from FooterRenderer.
import Icon from '@components/common/Icon.astro'      // if rendering contact icons
import FooterSocial from './_FooterSocial.astro'       // footer social icons (dark)
const { siteName, brandTagline, logoUrl, logoAlt, contact = {}, social = {}, showSocial = true,
        footerColumns = [], copyright, bottomRight, currentYear } = Astro.props as any
---
<footer class="bg-ocean text-white/85">
  <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
    {/* Slot: columns */}
    <div>
      {footerColumns.map((col: any) => (
        <div class="mb-8">
          <h4 class="font-display text-white text-sm uppercase tracking-widest mb-4">{col.label}</h4>
          <ul class="space-y-2 text-sm">
            {col.items.map((it: any) => (
              <li><a href={it.url} class="text-white/70 hover:text-white no-underline">{it.label}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    {/* Slot: address/phone/email + social */}
    <div class="text-sm space-y-3">
      {contact.phone && <p><a href={`tel:${contact.phone}`} class="text-white/70 hover:text-white no-underline">{contact.phone}</a></p>}
      {contact.email && <p><a href={`mailto:${contact.email}`} class="text-white/70 hover:text-white no-underline">{contact.email}</a></p>}
      {contact.address && <p class="text-white/70">{contact.address}</p>}
      {showSocial && <div class="pt-2"><FooterSocial social={social} /></div>}
    </div>
  </div>
  {/* Slot: copyrightText (bottom bar) */}
  <div class="border-t border-white/10 py-5 text-center text-xs text-white/50">
    &copy; {currentYear} {copyright ?? `${siteName}. All rights reserved.`} · {bottomRight}
  </div>
</footer>
```

**Props/slots interface:** see [The `ctx` props](#the-ctx-props-passed-to-every-footer-template)
above — destructure only the props matching the template's declared slots.

**Required sections:** a single root `<footer>` element and (for the bottom bar) the
copyright line. Everything else is optional per slot.

**Conditional slots:** footer templates typically *always* render their declared slots
(the slot list already scopes what data is passed), but you can still guard optional
pieces with the ctx toggles: `{showBrand && ...}`, `{showServices && servicesItems.length > 0 && ...}`,
`{showContact && ...}`, `{showSocial && ...}`, `{showNewsletter && ...}`.

**Responsive:** use Tailwind grid stacking, e.g. `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
There is **no** mobile drawer/toggle for footers — they stack naturally.

**Social icons:** use `<FooterSocial social={social} />` (footer's dark-styled partial). Do
**not** use `<Icon name="instagram" />` (no brand icons in the Icon lookup).

### Step 2: Register the template

- **File:** `packages/shared/src/template-registry.ts` — add to `FOOTER_TEMPLATES`:

```ts
export const FOOTER_TEMPLATES: TemplateDef[] = [
  // ...existing footer-1, footer-2, footer-3...
  {
    templateId: 'footer-4',                 // unique + matches renderer map key
    name: 'Two-column — links left, contact right',
    kind: 'footer',                         // MUST be 'footer'
    slots: ['columns', 'address', 'phone', 'email', 'socialLinks', 'copyrightText'],
    thumbnail: '/admin-thumbs/footer-4.svg',
  },
]
```

- **File:** `apps/web/src/components/navigation/FooterRenderer.astro` — import + map:

```astro
import FooterTemplate4 from './templates/FooterTemplate4.astro'   // add import
// ...
const TEMPLATES: Record<string, any> = {
  'footer-1': FooterTemplate1,
  'footer-2': FooterTemplate2,
  'footer-3': FooterTemplate3,
  'footer-4': FooterTemplate4,   // add map entry (key === templateId)
}
```

### Step 3: Add to Payload CMS config

- **File:** `apps/cms/src/globals/FooterSettings.ts`
- The `template` select options come from `toSelectOptions('footer')` (registry-driven) —
  **no manual dropdown edit needed**.
- Only edit if your template introduces a **new slot** without an existing field. The file
  already defines the helper:

```ts
const supports = (slot) => (data) => templateSupports(data?.template, slot)
```

Existing footer slot→field mapping (for reference when reusing slots):

| Slot | CMS field(s) in FooterSettings.ts | Condition |
|------|-----------------------------------|-----------|
| `logo` | `showBrandColumn`, `brandTaglineOverride` (Brand collapsible) | `supports('logo')` |
| `socialLinks` | `showSocialLinks` | `supports('socialLinks')` |
| `columns` | `columns` array; Services collapsible (`showServicesColumn`, `servicesColumnLabel`, `servicesMenu`) | `supports('columns')` |
| `address` | Contact collapsible (`showContactColumn`, `contactColumnLabel`) | `supports('address')` |
| `newsletterToggle` | `showNewsletter` | `supports('newsletterToggle')` |
| `legalLinks` | `legalLinks` (relationship → menus) | `supports('legalLinks')` |
| (always) | `bottomBarRightText` | none |

### Step 4: Add preview thumbnail

- **Directory:** `apps/cms/public/admin-thumbs/`
- **Naming:** `<templateId>.svg` → `footer-4.svg` (match the registry `thumbnail`).
- **Format/size:** existing footer thumbnails are SVG `viewBox="0 0 320 130"` (≈320×130).

### Step 5: Build & verify
```bash
cd apps/cms && pnpm generate:types       # registry change → update select union
cd apps/cms && pnpm generate:importmap   # only if custom admin components changed
cd apps/cms && pnpm dev                   # schema push only if new fields added
cd apps/web && pnpm dev                   # or pnpm --filter @dn-journeys/web build
```
- **Admin:** `Footer Settings` → picker shows the new thumbnail; only declared slot fields appear.
- **Frontend:** select `footer-4`, reload → new layout; shrink viewport → columns stack.

---

## How to Remove a Footer Template

### Pre-removal checklist
- **Active?** Removing the currently selected footer makes the renderer fall back to
  `TEMPLATES[templateId] ?? FooterTemplate1` and `footerCfg?.template || defaultTemplateId('footer')`
  → `footer-1`. Re-point the CMS to a valid template first (the `FooterSetting.template`
  union will otherwise error on type-check until re-saved).
- **Saved data:** slot values (columns, legalLinks, etc.) remain in the DB, unrendered.

### Step 1: Check active usage
```bash
curl -s "http://localhost:3030/api/globals/footer-settings?depth=0" \
  | python -c "import sys,json;print(json.load(sys.stdin).get('template'))"
```

### Step 2: Remove from CMS config
- `apps/cms/src/globals/FooterSettings.ts` — remove any fields you added solely for this
  template. `template` options are registry-driven (nothing to remove there).

### Step 3: Remove from registry
- `packages/shared/src/template-registry.ts` — delete the `FOOTER_TEMPLATES` entry.
- `apps/web/src/components/navigation/FooterRenderer.astro` — remove import + `TEMPLATES` entry.

### Step 4: Delete the component file
- Delete `apps/web/src/components/navigation/templates/FooterTemplate<N>.astro`.

### Step 5: Clean up
- Delete `apps/cms/public/admin-thumbs/footer-<N>.svg`.
- Remove any footer-only `SlotKey` you added solely for it.
- `cd apps/cms && pnpm generate:types`, then build both apps.

---

## How to Modify an Existing Footer Template

### Changing layout/structure
- Edit the component file (e.g. `FooterTemplate1.astro`). Applies to all sites using it.
- Test: run `apps/web` dev, select that footer template in the CMS, reload, and check
  desktop + a narrow viewport (columns should stack, not overflow).

### Adding a new configurable option (e.g. column count / background)
Example: add a `dark` background toggle to footer-2.
1. **Payload field** — `apps/cms/src/globals/FooterSettings.ts`:
```ts
{ name: 'darkVariant', type: 'checkbox', defaultValue: false, admin: { condition: supports('logo') } }
```
2. **Types** — `cd apps/cms && pnpm generate:types`.
3. **ctx** — in `FooterRenderer.astro`: `darkVariant: footerCfg?.darkVariant === true`.
4. **Component** — in `FooterTemplate2.astro`:
```astro
const { /* ... */, darkVariant = false } = Astro.props as any
<footer class:list={['', darkVariant ? 'bg-midnight' : 'bg-ocean', 'text-white/85']}>
```

### Changing which slots a template supports
1. Update the `slots` array for that entry in `packages/shared/src/template-registry.ts`.
2. Add/remove the matching conditional field(s) in `FooterSettings.ts` (see the slot→field table).
3. Update the component + add any new prop to `ctx` in `FooterRenderer.astro`.
4. `pnpm generate:types` + restart CMS.

---

## Troubleshooting

**Template not appearing in CMS dropdown**
- Entry missing from `FOOTER_TEMPLATES`, or `kind` isn't `'footer'`. Options come from
  `toSelectOptions('footer')`. Regenerate types + restart CMS.

**Template selected but frontend shows wrong/old template**
- `templateId` mismatch with `FooterRenderer.astro`'s `TEMPLATES` map key → falls back to `footer-1`.
- Frontend is static — rebuild `apps/web` / reload dev after changing the CMS selection.

**Content (slot) fields not showing after selecting template**
- Slot not in that template's `slots` array → `admin.condition` (`supports(...)`) hides the field.
- For `columns`/services/contact, remember they are inside `collapsible` fields — expand them.

**Build fails after adding/removing template**
- `FooterRenderer.astro` imports a deleted component or the `TEMPLATES` map references a
  missing import. Keep registry + import + map in sync.
- `FooterSetting.template` union no longer includes a stored value → re-save the global.

**Import fails because template not found**
- `validateExport(data, 'footer')` returns `template not found` when the JSON `templateId`
  isn't in the registry (or `kind` ≠ `footer`). Add the template or fix the JSON.

**Custom picker / import-export panel not rendering** (`getFromImportMap: PayloadComponent not found`)
- Run `cd apps/cms && pnpm generate:importmap`, restart CMS.

**Active template deleted — footer "broken"**
- Renderer falls back to `footer-1`, so the page still renders. If the type union errors on
  build: re-add the template to the registry OR set `footer-settings.template` to a valid id
  (admin or `pnpm tsx src/scripts/seed-header-footer-templates.ts`), then `pnpm generate:types`.

**Footer layout not stacking / overflowing on mobile**
- Ensure the grid uses `grid-cols-1 md:grid-cols-2 ...` (mobile-first). Unlike the header,
  the footer has no toggle/overlay — responsiveness is purely grid stacking.

**Services column empty**
- `servicesItems` cascades: `footerCfg.servicesMenu` → `getResolvedServiceTypes()` → `modules`.
  If empty, check that ServiceTypes exist/active or a `servicesMenu` is set.

---

## Known Limitations (found during inspection)

1. **Single footer per site.** `footer-settings` is a Payload **global** (one record) → footer
   is site-wide.
2. **Two separate social-icon components.** The footer uses `_FooterSocial.astro`
   (dark-styled, renders **Instagram/Facebook/YouTube only — no TikTok**), while the header
   uses `_SocialIcons.astro` (all four brands, class-configurable). A footer template that
   needs TikTok must use `_SocialIcons` with dark classes instead of `_FooterSocial`.
   *(Inconsistency between header and footer systems.)*
3. **`newsletterToggle` is reserved.** `showNewsletter` exists and is passed as `showNewsletter`,
   but no shipped footer template renders a newsletter form (Phase 4).
4. **`email` slot has no dedicated CMS field.** Email is read from `SiteSettings.contact.email`
   via the Contact column; there is no footer-level email field.
5. **Removing the active template can break the type-check** (`FooterSetting.template` union)
   until the global is re-saved, even though runtime falls back to `footer-1`.
6. **`additionalScripts` injection** is done by `FooterRenderer.astro` (raw `set:html`), not by
   templates — trusted because `SiteSettings` is admin-only, but templates cannot control it.
7. **Import/Export is an in-page UI field**, not a standalone admin view/route.
8. **CMS↔shared import is a deep relative path** and relies on Next `experimental.externalDir: true`
   (`apps/cms/next.config.mjs`) — same as the header system.
