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
import { relatedServicesPerServiceFields } from '../fields/relatedServices'

export const Rentals: CollectionConfig = {
  slug: 'rentals',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'rentalType', 'status', 'updatedAtRelative'],
    preview: makePreview('/rental'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),
    updatedAtRelativeField,

    {
      type: 'tabs',
      admin: { className: 'dnj-main-tabs' },
      tabs: [
        // ── 1. Overview (Ocean) ──────────────────────
        {
          label: 'Overview',
          fields: [
            {
              type: 'collapsible',
              label: 'Overview & Description',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--overview section--overview-desc' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'subtitle', type: 'text', admin: { description: 'Short tagline (opsional)' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'rentalType', type: 'select', required: true, admin: { width: '50%' }, options: [
                      { label: '🏍️ Motorbike', value: 'motorbike' },
                      { label: '🚗 Car', value: 'car' },
                      { label: '🚴 Bicycle', value: 'bicycle' },
                      { label: '🚤 Boat', value: 'boat' },
                      { label: '🏄 Surfboard', value: 'surfboard' },
                      { label: '🤿 Snorkel Gear', value: 'snorkel_gear' },
                      { label: '📷 Camera/Drone', value: 'camera' },
                      { label: '📦 Other', value: 'other' },
                    ]},
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', admin: { width: '50%' } },
                  ],
                },
                { name: 'description', type: 'richText', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: 'Quick Specs',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--overview section--quick-specs' },
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
          ],
        },

        // ── 2. Media (Leaf) ─────────────────────────
        {
          label: 'Media',
          fields: [
            {
              type: 'collapsible',
              label: 'Featured Image',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--media section--featured-img' },
              fields: [
                { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: 'Gallery',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--media section--gallery' },
              fields: [
                { name: 'gallery', type: 'array', fields: [
                  { name: 'image', type: 'upload', relationTo: 'media', required: true },
                  { name: 'caption', type: 'text' },
                ]},
              ],
            },
          ],
        },

        // ── 3. Rental & Pricing (Coral) ─────────────
        {
          label: 'Rental & Pricing',
          fields: [
            {
              type: 'collapsible',
              label: 'Specifications',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--rooms section--specs' },
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
              ],
            },
            {
              type: 'collapsible',
              label: 'Features',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--features' },
              fields: [
                {
                  name: 'features',
                  type: 'array',
                  admin: { description: 'Feature list dgn icon (mis: AC, GPS, Helmet, Insurance).' },
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
            {
              type: 'collapsible',
              label: 'Pricing Tiers',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--pricing' },
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
                          { label: 'Hourly', value: 'hourly' },
                          { label: 'Half Day', value: 'half_day' },
                          { label: 'Full Day', value: 'full_day' },
                          { label: 'Weekly', value: 'weekly' },
                          { label: 'Monthly', value: 'monthly' },
                        ]},
                        { name: 'price', type: 'number', min: 0, required: true, admin: { width: '35%' } },
                        { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '30%' }, options: [
                          { label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' },
                        ]},
                      ],
                    },
                    { name: 'note', type: 'text', admin: { description: 'Opsional note (mis: "Min 3 days")' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Booking (WhatsApp)',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--booking' },
              fields: [whatsappField],
            },
          ],
        },

        // ── 4. Includes & Requirements (Teal) ───────
        {
          label: 'Includes & Requirements',
          fields: [
            {
              type: 'collapsible',
              label: 'What\'s Included',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--amenities section--includes' },
              fields: [
                {
                  name: 'includes',
                  type: 'array',
                  label: 'What\'s Included',
                  fields: [{ name: 'item', type: 'text', required: true }],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Requirements',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--amenities section--safety' },
              fields: [
                { name: 'requirements', type: 'textarea', admin: { description: 'License, deposit, age, dsb.' } },
              ],
            },
          ],
        },

        // ── 5. Custom Sections (Midnight) ───────────
        {
          label: '🔒 Custom Sections',
          fields: [
            {
              type: 'collapsible',
              label: 'Related Services',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--custom section--related' },
              fields: [
                relatedServicesPerServiceFields('rentals'),
              ],
            },
            {
              type: 'collapsible',
              label: 'Content Blocks',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--custom section--blocks' },
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
          ],
        },
      ],
    },

    withSidebarTab(seoFields, 'seo'),
  ],
}
