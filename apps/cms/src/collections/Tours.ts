import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { iconOptions } from '../fields/iconOptions'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { withStatusCell, updatedAtRelativeField } from '../fields/listCells'
import { makePreview } from '../fields/preview'
import { blocks } from '../blocks'
import { relatedServicesPerServiceFields } from '../fields/relatedServices'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    group: 'Services',
    defaultColumns: ['title', 'destination', 'status', 'isFeatured', 'updatedAtRelative'],
    preview: makePreview('/tour'),
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
                    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                    { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'tours' } }, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'duration', type: 'text', admin: { width: '40%', description: 'Mis: "Full Day", "3 Hours"' } },
                    { name: 'minParticipants', type: 'number', min: 1, defaultValue: 1, admin: { width: '30%' } },
                    { name: 'maxParticipants', type: 'number', admin: { width: '30%' } },
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
                        { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'Mis: "6 Hours"' } },
                        { name: 'subtitle', type: 'text', admin: { width: '30%' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Highlights',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--overview section--highlights' },
              fields: [
                {
                  name: 'highlights',
                  type: 'array',
                  admin: { description: 'Tour highlights (bullet points, max ~8).' },
                  fields: [
                    { name: 'text', type: 'text', required: true },
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
                { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Main hero image.' } },
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
            {
              type: 'collapsible',
              label: 'Video',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--media section--video' },
              fields: [
                { name: 'videoUrl', type: 'text', label: 'Video URL', admin: { description: 'YouTube atau Vimeo URL' } },
              ],
            },
          ],
        },

        // ── 3. Itinerary & Pricing (Coral) ──────────
        {
          label: 'Itinerary & Pricing',
          fields: [
            {
              type: 'collapsible',
              label: 'Itinerary',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--rooms section--itinerary' },
              fields: [
                {
                  name: 'itinerary',
                  type: 'array',
                  label: 'Itinerary Steps',
                  admin: { description: 'Urutan aktivitas tour (drag & drop untuk reorder).' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'time', type: 'text', admin: { width: '25%', description: 'Mis: "09:00" atau "1 hour"' } },
                        { name: 'title', type: 'text', required: true, admin: { width: '35%' } },
                        { name: 'iconName', type: 'select', options: iconOptions, admin: { width: '40%', description: 'Opsional icon' } },
                      ],
                    },
                    { name: 'description', type: 'textarea' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Meeting & Pickup',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--rooms section--meeting' },
              fields: [
                {
                  name: 'meetingPoint',
                  type: 'group',
                  admin: { description: 'Meeting point info.' },
                  fields: [
                    { name: 'name', type: 'text', admin: { description: 'Mis: "Ubud Palace Main Gate"' } },
                    {
                      type: 'row',
                      fields: [
                        { name: 'time', type: 'text', admin: { width: '30%', description: 'Mis: "08:00"' } },
                        { name: 'address', type: 'text', admin: { width: '70%' } },
                      ],
                    },
                    { name: 'mapEmbed', type: 'text', admin: { description: 'Google Maps embed URL (opsional)' } },
                  ],
                },
                {
                  name: 'pickupService',
                  type: 'group',
                  admin: { description: 'Pickup service info (kalau ada).' },
                  fields: [
                    { name: 'available', type: 'checkbox', defaultValue: false, admin: { description: 'Pickup service tersedia?' } },
                    { name: 'areas', type: 'textarea', admin: {
                      condition: (_, sib) => sib?.available === true,
                      description: 'List area pickup (mis: "Ubud, Canggu, Seminyak, Kuta")',
                    }},
                    { name: 'notes', type: 'text', admin: {
                      condition: (_, sib) => sib?.available === true,
                      description: 'Additional notes (mis: "Free pickup dalam 15km, di luar area kena charge")',
                    }},
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

        // ── 4. Inclusions & Info (Teal) ─────────────
        {
          label: 'Inclusions & Info',
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
              label: 'What\'s NOT Included',
              admin: { initCollapsed: true, className: 'accordion-section accordion-tab--amenities section--includes' },
              fields: [
                {
                  name: 'excludes',
                  type: 'array',
                  label: 'What\'s NOT Included',
                  fields: [{ name: 'item', type: 'text', required: true }],
                },
              ],
            },
          ],
        },

        // ── 5. Policies (Stone) ─────────────────────
        {
          label: 'Policies',
          fields: [
            {
              type: 'collapsible',
              label: 'Policies & Additional Info',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--policies section--policies' },
              fields: [
                { name: 'additionalInfo', type: 'richText', admin: { description: 'Additional info: dress code, restrictions, cancellation policy, dsb.' } },
              ],
            },
          ],
        },

        // ── 6. Custom Sections (Midnight) ───────────
        {
          label: '🔒 Custom Sections',
          fields: [
            {
              type: 'collapsible',
              label: 'Related Services',
              admin: { initCollapsed: false, className: 'accordion-section accordion-tab--custom section--related' },
              fields: [
                relatedServicesPerServiceFields('tours'),
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
