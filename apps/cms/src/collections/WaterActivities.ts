import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'

export const WaterActivities: CollectionConfig = {
  slug: 'water-activities',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'activityType', 'status', 'updatedAtRelative'],
    preview: makePreview('/water-activity'),
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
                { name: 'subtitle', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'activityType', type: 'select', required: true, admin: { width: '50%' }, options: [
                      { label: '🤿 Snorkeling', value: 'snorkeling' }, { label: '🐠 Diving', value: 'diving' },
                      { label: '🏄 Surfing', value: 'surfing' }, { label: '🛶 Kayaking', value: 'kayaking' },
                      { label: '🪂 Parasailing', value: 'parasailing' }, { label: '🌊 Jet Ski', value: 'jetski' },
                      { label: '🍌 Banana Boat', value: 'banana_boat' }, { label: '🚀 Flyboard', value: 'flyboard' },
                      { label: '📦 Other', value: 'other' },
                    ]},
                    { name: 'difficultyLevel', type: 'select', admin: { width: '50%' }, options: [
                      { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' },
                      { label: 'Advanced', value: 'advanced' }, { label: 'All Levels', value: 'all_levels' },
                    ]},
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                    { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'water-activities' } }, admin: { width: '50%' } },
                  ],
                },
                { name: 'duration', type: 'text', admin: { description: 'Mis: "2 hours", "Full day"' } },
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

        // ── 3. Activity & Pricing (Coral) ───────────
        {
          label: 'Activity & Pricing',
          fields: [
            {
              type: 'collapsible',
              label: 'What to Bring',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--rooms section--includes' },
              fields: [
                {
                  name: 'whatToBring', type: 'array',
                  admin: { description: 'Items yg perlu dibawa peserta.' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'item', type: 'text', required: true, admin: { width: '60%' } },
                      { name: 'icon', type: 'select', options: iconOptions, admin: { width: '40%' } },
                    ]},
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Pricing',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--pricing' },
              fields: [pricingFields],
            },
            {
              type: 'collapsible',
              label: 'Booking (WhatsApp)',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--booking' },
              fields: [whatsappField],
            },
          ],
        },

        // ── 4. Safety & Requirements (Stone) ────────
        {
          label: 'Safety & Requirements',
          fields: [
            {
              type: 'collapsible',
              label: 'Safety & Requirements',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--policies section--safety' },
              fields: [
                { name: 'requirements', type: 'textarea', admin: { description: 'Age limits, health requirements' } },
                { name: 'safetyInfo', type: 'richText', admin: { description: 'Safety briefing, guides, insurance.' } },
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
                relatedServicesPerServiceFields('water-activities'),
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
                  blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel', 'serviceListing', 'trustBadges'].includes(b.slug)),
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
