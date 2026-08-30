import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { locationFields } from '../fields/location'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'

export const Restaurants: CollectionConfig = {
  slug: 'restaurants',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'locationType', 'priceRange', 'status', 'updatedAtRelative'],
    preview: makePreview('/restaurant'),
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
                { name: 'name', type: 'text', required: true },
                { name: 'subtitle', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'priceRange', type: 'select', admin: { width: '50%' }, options: [
                      { label: '💵 Budget ($)', value: 'budget' },
                      { label: '💰 Mid-range ($$)', value: 'mid_range' },
                      { label: '💎 Fine Dining ($$$)', value: 'fine_dining' },
                    ]},
                    { name: 'locationType', type: 'select', admin: { width: '50%' }, options: [
                      { label: 'Island', value: 'island' }, { label: 'Mainland', value: 'mainland' },
                    ]},
                  ],
                },
                { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true },
                { name: 'cuisineType', type: 'select', hasMany: true, options: [
                  { label: '🍛 Indonesian', value: 'indonesian' }, { label: '🍔 Western', value: 'western' },
                  { label: '🦞 Seafood', value: 'seafood' }, { label: '🥢 Fusion', value: 'fusion' },
                  { label: '🍣 Japanese', value: 'japanese' }, { label: '🍝 Italian', value: 'italian' },
                  { label: '☕ Cafe', value: 'cafe' }, { label: '🍹 Bar', value: 'bar' },
                ]},
                { name: 'description', type: 'richText', required: true },
              ],
            },
            {
              type: 'collapsible',
              label: 'Quick Specs',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--overview section--quick-specs' },
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

        // ── 3. Menu & Dining (Coral) ────────────────
        {
          label: 'Menu & Dining',
          fields: [
            {
              type: 'collapsible',
              label: 'Menu Highlights',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--rooms section--menu' },
              fields: [
                {
                  name: 'menuHighlights', type: 'array',
                  admin: { description: 'Signature dishes / recommendation.' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                      { name: 'price', type: 'number', admin: { width: '30%' } },
                      { name: 'image', type: 'upload', relationTo: 'media', admin: { width: '20%' } },
                    ]},
                    { name: 'description', type: 'text' },
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

        // ── 4. Features & Location (Teal) ───────────
        {
          label: 'Features & Location',
          fields: [
            {
              type: 'collapsible',
              label: 'Features',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--amenities section--features' },
              fields: [
                {
                  name: 'features', type: 'array',
                  admin: { description: 'Restaurant features (mis: outdoor seating, live music, sea view).' },
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
              type: 'collapsible',
              label: 'Location',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--amenities section--location' },
              fields: [
                locationFields,
              ],
            },
            {
              type: 'collapsible',
              label: 'Opening Hours',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--amenities section--hours' },
              fields: [
                {
                  name: 'openingHours', type: 'array', label: 'Opening Hours',
                  fields: [{
                    type: 'row',
                    fields: [
                      { name: 'day', type: 'select', admin: { width: '30%' }, options: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => ({ label: d, value: d.toLowerCase() })) },
                      { name: 'open', type: 'text', admin: { width: '25%', description: 'Mis: "11:00"' } },
                      { name: 'close', type: 'text', admin: { width: '25%', description: 'Mis: "22:00"' } },
                      { name: 'isClosed', type: 'checkbox', defaultValue: false, admin: { width: '20%' } },
                    ],
                  }],
                },
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
                relatedServicesPerServiceFields('restaurants'),
              ],
            },
            {
              type: 'collapsible',
              label: 'Content Blocks',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--custom section--blocks' },
              fields: [
                {
                  name: 'additionalBlocks', type: 'blocks', label: 'Additional Blocks',
                  access: { update: superAdminFieldAccess },
                  blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel'].includes(b.slug)),
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
