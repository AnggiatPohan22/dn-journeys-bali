import type { CollectionConfig, Field } from 'payload'
import { authenticatedUpdate, isSuperAdmin } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField } from '../fields/status'
import { validateReservedSlug } from '../fields/reservedSlugs'
import { blocks } from '../blocks'

// ── Phase 4.8: sidebar tabs helpers ──────────────────────────────────
// Add a `sidebar-field--<tab>` className to each sidebar field so the
// SidebarTabs CSS can show/hide by active tab. Fields never unmount —
// only visibility toggles → form state stays intact.
const withSidebarTab = <T extends Field>(field: T, tab: 'general' | 'seo' | 'status'): T => ({
  ...field,
  admin: {
    ...(('admin' in field ? (field as any).admin : {}) || {}),
    className: [
      ((field as any).admin?.className ?? ''),
      `sidebar-field--${tab}`,
    ].filter(Boolean).join(' '),
  },
}) as T

// Sidebar tab bar — presentational `ui` field, rendered FIRST in sidebar.
const sidebarTabsField: Field = {
  name: 'sidebarTabs',
  type: 'ui',
  admin: {
    position: 'sidebar',
    components: {
      Field: '/admin/SidebarTabs#default',
    },
  },
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'template', 'status'],
    // Phase 4.8 · Goal 1 (Option A) — conditional Preview button.
    // Shown only when doc is published. Deep-links to the built page
    // (not true draft preview — see phase-4.8 doc §B/C Goal 1).
    // "home" slug maps to root URL. SITE_URL env for prod; localhost fallback.
    preview: (doc: any) => {
      if (!doc || doc.status !== 'published' || !doc.slug) return null
      const siteUrl = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/$/, '')
      const path = doc.slug === 'home' ? '' : `/${doc.slug}`
      return `${siteUrl}${path}`
    },
  },
  access: {
    read: () => true,
    create: isSuperAdmin,     // Only super-admin can create pages
    update: authenticatedUpdate, // Editors can edit content
    delete: isSuperAdmin,     // Only super-admin can delete
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    sidebarTabsField,
    withSidebarTab(
      { name: 'slug', type: 'text', required: true, unique: true, validate: validateReservedSlug, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', description: 'Auto dari title. Slug tertentu (tours, accommodations, yacht, dst) di-reserve halaman statis — lihat fields/reservedSlugs.ts.' } },
      'general',
    ),
    withSidebarTab(
      { name: 'template', type: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Service Listing', value: 'service_listing' },
      ], admin: { position: 'sidebar' } },
      'general',
    ),
    {
      name: 'content',
      type: 'blocks',
      label: 'Page Content',
      blocks,
    },
    withSidebarTab(
      { name: 'parent', type: 'relationship', relationTo: 'pages', label: 'Parent Page', admin: { position: 'sidebar' } },
      'general',
    ),
    withSidebarTab(seoFields, 'seo'),
    withSidebarTab(statusField, 'status'),
    withSidebarTab(sortOrderField, 'status'),
  ],
}
