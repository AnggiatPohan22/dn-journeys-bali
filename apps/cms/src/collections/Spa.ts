import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'

/**
 * Spa — motorbike, car, bicycle, boat, gear.
 *
 * Structured tabs (Phase 3.7.3) mirror Accommodations pattern:
 * Overview / Media / Quick Specs / Specifications / Includes & Requirements /
 * Pricing Tiers / Custom Sections (super-admin) / Booking.
 */
export const Spa: CollectionConfig = {
  slug: 'spa',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'treatmentType', 'status', 'updatedAtRelative'],
    preview: makePreview('/spa'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    // Sidebar
    // Sidebar (Phase 4.9 — tabbed: General / SEO / Publishing)
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),
    updatedAtRelativeField,

    {
      type: 'tabs',
      admin: { className: 'dnj-main-tabs' }, // Phase 4.10 — root-tabs polish
      tabs: [
        // ── Overview ──────────────────────────────
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'text', admin: { description: 'Short tagline (opsional)' } },
            {
              type: 'row',
              fields: [
                { name: 'treatmentType', type: 'select', required: true, admin: { width: '50%' }, options: [
                  { label: '🏍️ Star' , value: 'Balines Spa' },
                  { label: '🚗 Star', value: 'Traditional Massage' },
                  { label: '🚴 Star', value: 'Thai massage' },
                  { label: '🚤 Star', value: 'Honeymoon package' },
                  { label: '📦 Other', value: 'other' },
                ]},
                { name: 'destination', type: 'relationship', relationTo: 'destinations', admin: { width: '50%' } },
              ],
            },
            { name: 'description', type: 'richText', required: true },
          ],
        },

        // ── Media ─────────────────────────────────
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

        // ── Quick Specs ───────────────────────────
        {
          label: 'Quick Specs',
          description: 'Stat cards di top detail page. Kosong = frontend auto-derive.',
          fields: [
            {
              name: 'quickSpecs',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Max 4 stat cards.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'iconName', type: 'select', required: true, options: iconOptions, admin: { width: '40%' } },
                    { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                  ],
                },
              ],
            },
          ],
        },

        // ── Specifications ────────────────────────
        {
          label: 'Specifications',
          description: 'Brand/model/year + features list.',
          fields: [
            {
              name: 'specifications',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'brand', type: 'text', admin: { width: '33%' } },
                    { name: 'model', type: 'text', admin: { width: '33%' } },
                    { name: 'year', type: 'text', admin: { width: '34%' } },
                  ],
                },
                { name: 'details', type: 'textarea', admin: { description: 'Additional spec details' } },
              ],
            },
            {
              name: 'features',
              type: 'array',
              admin: { description: 'All Detail Package listing Spa Wellness' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                    { name: 'icon', type: 'select', options: iconOptions, admin: { width: '40%' } },
                  ],
                },
              ],
            },
          ],
        },

        // ── Includes & Requirements ───────────────
        {
          label: 'Includes & Requirements',
          fields: [
            {
              name: 'includes',
              type: 'array',
              label: 'What\'s Included',
              fields: [{ name: 'item', type: 'text', required: true }],
            },
            { name: 'requirements', type: 'textarea', admin: { description: 'Welcome drink, Cake and etc' } },
          ],
        },

        // ── Pricing Tiers ─────────────────────────
        {
          label: 'Pricing Tiers',
          description: 'Tiers berdasarkan package spa and massage',
          fields: [
            {
              name: 'pricingTiers',
              type: 'array',
              label: 'Pricing',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'duration', type: 'select', admin: { width: '35%' }, options: [
                      { label: 'One Hour', value: 'hourly' },
                      { label: 'One Hour thirty', value: 'hourly' },
                      { label: 'Two Hour', value: 'hourly' },
                      { label: 'Honeymoon', value: 'package' },
                      { label: 'Couple', value: 'package' },
                    ]},
                    { name: 'price', type: 'number', min: 0, required: true, admin: { width: '35%' } },
                    { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '30%' }, options: [
                      { label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' },
                    ]},
                  ],
                },
                { name: 'note', type: 'text', admin: { description: 'Opsional note (mis: "Combine deals")' } },
              ],
            },
          ],
        },

        // ── Custom Sections (super-admin) ─────────
        {
          label: '🔒 Custom Sections',
          description: 'Super-admin only. Extra block di bawah main sections detail page.',
          fields: [
            {
              name: 'additionalBlocks',
              type: 'blocks',
              label: 'Additional Blocks',
              admin: { description: 'Block dirender berurutan setelah main sections.' },
              access: { update: superAdminFieldAccess },
              blocks,
            },
          ],
        },

        // ── Booking ───────────────────────────────
        {
          label: 'Booking',
          fields: [whatsappField],
        },
      ],
    },

    withSidebarTab(seoFields, 'seo'),
  ],
}
