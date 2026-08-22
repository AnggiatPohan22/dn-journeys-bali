import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { locationFields } from '../fields/location'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'

export const Restaurants: CollectionConfig = {
  slug: 'restaurants',
  admin: { useAsTitle: 'name', group: 'Services', defaultColumns: ['name', 'locationType', 'priceRange', 'status'] },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } },
    statusField, sortOrderField, isFeaturedField,

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
          label: 'Menu Highlights',
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
          label: 'Location & Hours',
          fields: [
            locationFields,
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
        {
          label: '🔒 Custom Sections',
          fields: [
            {
              name: 'additionalBlocks', type: 'blocks', label: 'Additional Blocks',
              access: { update: superAdminFieldAccess },
              blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel'].includes(b.slug)),
            },
          ],
        },
        { label: 'Booking', fields: [whatsappField] },
      ],
    },

    seoFields,
  ],
}
