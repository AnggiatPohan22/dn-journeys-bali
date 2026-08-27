import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { locationFields } from '../fields/location'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { sidebarTabsField, withSidebarTab } from '../fields/sidebarTabs'
import { makePreview } from '../fields/preview'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'

export const Venues: CollectionConfig = {
  slug: 'venues',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'venueType', 'status'],
    preview: makePreview('/venue'),
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
      admin: { className: 'dnj-main-tabs' }, // Phase 4.10 — root-tabs polish
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'subtitle', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'venueType', type: 'select', admin: { width: '50%' }, options: [
                  { label: '🏖️ Beach', value: 'beach' }, { label: '🌿 Garden', value: 'garden' },
                  { label: '🗻 Cliff', value: 'cliff' }, { label: '⛪ Chapel', value: 'chapel' },
                  { label: '💃 Ballroom', value: 'ballroom' }, { label: '🏡 Private Villa', value: 'villa_private' },
                  { label: '📦 Other', value: 'other' },
                ]},
                { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
              ],
            },
            { name: 'eventTypes', type: 'select', hasMany: true, options: [
              { label: '💒 Wedding', value: 'wedding' }, { label: '💍 Engagement', value: 'engagement' },
              { label: '🎂 Birthday', value: 'birthday' }, { label: '💼 Corporate', value: 'corporate' },
              { label: '💕 Anniversary', value: 'anniversary' }, { label: '🎉 Other', value: 'other' },
            ]},
            { name: 'description', type: 'richText', required: true },
            {
              name: 'capacity', type: 'group',
              fields: [
                { type: 'row', fields: [
                  { name: 'minGuests', type: 'number', min: 1, admin: { width: '50%' } },
                  { name: 'maxGuests', type: 'number', admin: { width: '50%' } },
                ]},
              ],
            },
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
          label: 'Features',
          fields: [
            {
              name: 'features', type: 'array',
              admin: { description: 'Venue features (bridal suite, sound system, parking, dsb).' },
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
          label: 'Packages',
          fields: [
            {
              name: 'packages', type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'description', type: 'richText' },
                { name: 'includes', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
                { type: 'row', fields: [
                  { name: 'startingPrice', type: 'number', min: 0, admin: { width: '60%' } },
                  { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '40%' }, options: [{ label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' }] },
                ]},
              ],
            },
          ],
        },
        {
          label: 'Location',
          fields: [locationFields],
        },
        {
          label: 'Testimonials',
          fields: [
            {
              name: 'testimonials', type: 'array',
              admin: { description: 'Couple/client testimonials.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'coupleName', type: 'text', admin: { width: '50%' } },
                  { name: 'eventDate', type: 'date', admin: { width: '30%' } },
                  { name: 'photo', type: 'upload', relationTo: 'media', admin: { width: '20%' } },
                ]},
                { name: 'quote', type: 'textarea' },
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
