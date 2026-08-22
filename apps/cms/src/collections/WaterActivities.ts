import type { CollectionConfig } from 'payload'
import { adminCreate, authenticatedUpdate, superAdminDelete, superAdminFieldAccess } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { pricingFields } from '../fields/pricing'
import { whatsappField } from '../fields/whatsapp'
import { statusField, sortOrderField, isFeaturedField } from '../fields/status'
import { iconOptions } from '../fields/iconOptions'
import { blocks } from '../blocks'

export const WaterActivities: CollectionConfig = {
  slug: 'water-activities',
  admin: { useAsTitle: 'title', group: 'Services', defaultColumns: ['title', 'activityType', 'status'] },
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
          description: 'Stat cards di top detail page. Kosong = auto-derive.',
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
          label: 'What to Bring & Safety',
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
            { name: 'requirements', type: 'textarea', admin: { description: 'Age limits, health requirements' } },
            { name: 'safetyInfo', type: 'richText', admin: { description: 'Safety briefing, guides, insurance.' } },
          ],
        },
        {
          label: 'Pricing',
          description: 'Adult/child/infant per person.',
          fields: [pricingFields],
        },
        {
          label: '🔒 Custom Sections',
          description: 'Super-admin only.',
          fields: [
            {
              name: 'additionalBlocks', type: 'blocks', label: 'Additional Blocks',
              access: { update: superAdminFieldAccess },
              // Filter block dgn nama panjang: enum_water_activities_blocks_* prefix 29 char,
              // sisa max 34 char untuk `<slug>_ts_<longest_element>_anim_in`.
              // Trust_badges (12) + _ts_description_anim_in (23) = 35 → OVER by 1.
              blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel', 'serviceListing', 'trustBadges'].includes(b.slug)),
            },
          ],
        },
        { label: 'Booking', fields: [whatsappField] },
      ],
    },

    seoFields,
  ],
}
