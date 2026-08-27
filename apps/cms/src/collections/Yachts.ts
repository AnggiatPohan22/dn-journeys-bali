import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { makePreview } from '../fields/preview'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'

export const Yachts: CollectionConfig = {
  slug: 'yachts',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'yachtType', 'capacity', 'status'],
    preview: makePreview('/yacht'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    // Sidebar (Phase 4.9 — tabbed: General / SEO / Publishing)
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(statusField,     'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'subtitle', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'yachtType', type: 'select', admin: { width: '50%' }, options: [
                  { label: '⛵ Catamaran', value: 'catamaran' }, { label: '🚤 Speedboat', value: 'speedboat' },
                  { label: '⛵ Sailing Yacht', value: 'sailing' }, { label: '🛥️ Motor Yacht', value: 'motor_yacht' },
                  { label: '🚢 Phinisi', value: 'phinisi' },
                ]},
                { name: 'capacity', type: 'number', min: 1, admin: { width: '50%', description: 'Max guests' } },
              ],
            },
            { name: 'destination', type: 'relationship', relationTo: 'destinations', admin: { description: 'Departure port / area' } },
            { name: 'description', type: 'richText', required: true },
          ],
        },
        {
          label: 'Media',
          fields: [
            { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true },
            { name: 'gallery', type: 'array', fields: [
              { name: 'image', type: 'upload', relationTo: 'media', required: true },
              { name: 'caption', type: 'text' },
            ]},
          ],
        },
        {
          label: 'Quick Specs',
          fields: [
            {
              name: 'quickSpecs', type: 'array', maxRows: 4,
              fields: [{
                type: 'row',
                fields: [
                  { name: 'iconName', type: 'select', required: true, options: iconOptions, admin: { width: '40%' } },
                  { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
                  { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                ],
              }],
            },
          ],
        },
        {
          label: 'Amenities',
          fields: [
            {
              name: 'amenities', type: 'array',
              admin: { description: 'On-board amenities (bar, sun deck, chef, dsb).' },
              fields: [
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                  { name: 'icon', type: 'select', options: iconOptions, admin: { width: '40%' } },
                ]},
              ],
            },
          ],
        },
        {
          label: 'Specifications',
          fields: [
            {
              name: 'specifications', type: 'group',
              fields: [
                { type: 'row', fields: [
                  { name: 'length', type: 'text', admin: { width: '25%', description: 'Mis: "24m"' } },
                  { name: 'engine', type: 'text', admin: { width: '25%' } },
                  { name: 'crewSize', type: 'number', admin: { width: '25%' } },
                  { name: 'yearBuilt', type: 'text', admin: { width: '25%' } },
                ]},
              ],
            },
          ],
        },
        {
          label: 'Cruise Packages',
          description: 'Charter packages dgn duration + price.',
          fields: [
            {
              name: 'packages', type: 'array', label: 'Packages',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'duration', type: 'text', admin: { description: 'Mis: "4 hours", "Full day"' } },
                { name: 'description', type: 'textarea' },
                { name: 'includes', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
                { type: 'row', fields: [
                  { name: 'price', type: 'number', min: 0, admin: { width: '50%' } },
                  { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '25%' }, options: [{ label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' }] },
                  { name: 'priceNote', type: 'text', admin: { width: '25%' } },
                ]},
              ],
            },
          ],
        },
        {
          label: '🔒 Custom Sections',
          fields: [
            {
              name: 'additionalBlocks', type: 'blocks', label: 'Additional Blocks',
              access: { update: superAdminFieldAccess },
              blocks,
            },
          ],
        },
        { label: 'Booking', fields: [whatsappField] },
      ],
    },

    withSidebarTab(seoFields, 'seo'),
  ],
}
