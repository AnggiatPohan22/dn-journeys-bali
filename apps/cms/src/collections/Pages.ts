import type { CollectionConfig } from 'payload'
import { authenticatedUpdate, isSuperAdmin } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField } from '../fields/status'
import { validateReservedSlug } from '../fields/reservedSlugs'
import { blocks } from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'slug', 'template', 'status'] },
  access: {
    read: () => true,
    create: isSuperAdmin,     // Only super-admin can create pages
    update: authenticatedUpdate, // Editors can edit content
    delete: isSuperAdmin,     // Only super-admin can delete
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, validate: validateReservedSlug, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar', description: 'Auto dari title. Slug tertentu (tours, accommodations, yacht, dst) di-reserve halaman statis — lihat fields/reservedSlugs.ts.' } },
    { name: 'template', type: 'select', defaultValue: 'default', options: [
      { label: 'Default', value: 'default' },
      { label: 'About', value: 'about' },
      { label: 'Contact', value: 'contact' },
      { label: 'Landing Page', value: 'landing' },
      { label: 'Service Listing', value: 'service_listing' },
    ], admin: { position: 'sidebar' } },
    {
      name: 'content',
      type: 'blocks',
      label: 'Page Content',
      blocks,
    },
    { name: 'parent', type: 'relationship', relationTo: 'pages', label: 'Parent Page', admin: { position: 'sidebar' } },
    seoFields,
    statusField,
    sortOrderField,
  ],
}
