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

export const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'type', 'destination', 'status', 'updatedAtRelative'],
    preview: makePreview('/villa'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    // Sidebar (Phase 4.9 — tabbed: General / SEO / Publishing)
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(withStatusCell(statusField), 'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),
    updatedAtRelativeField,

    // Main tabs (6-tab structure — Phase 4.18)
    {
      type: 'tabs',
      admin: { className: 'dnj-main-tabs' },
      tabs: [
        // ── 1. Overview ──────────────────────────────────────
        {
          label: 'Overview',
          description: 'Basic info, quick specs, dan highlight tags.',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'subtitle', type: 'text', admin: { description: 'Short tagline di bawah title (opsional, mis: "Cliffside sanctuary in Uluwatu")' } },
            {
              type: 'row',
              fields: [
                { name: 'type', type: 'select', required: true, admin: { width: '50%' }, options: [
                  { label: 'Villa', value: 'villa' }, { label: 'Hotel', value: 'hotel' },
                  { label: 'Resort', value: 'resort' }, { label: 'Guesthouse', value: 'guesthouse' },
                ]},
                { name: 'starRating', type: 'number', min: 1, max: 5, label: 'Star Rating', admin: { width: '50%', description: '1-5, opsional' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true, admin: { width: '50%' } },
                { name: 'category', type: 'relationship', relationTo: 'categories', filterOptions: { module: { equals: 'accommodations' } }, admin: { width: '50%' } },
              ],
            },
            { name: 'description', type: 'richText', required: true, admin: { description: 'Description panjang. Yg tampil di detail = teks plain (200 char untuk featured).' } },
            {
              name: 'quickSpecs',
              type: 'array',
              label: 'Quick Specs',
              maxRows: 4,
              admin: { description: '4 kotak stat di atas amenities. Kosong = frontend auto-derive. Icon + label + subtitle.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'iconName', type: 'select', required: true, options: iconOptions, admin: { width: '40%', description: 'Pilih icon' } },
                    { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'Big label (mis: "5 Rooms")' } },
                    { name: 'subtitle', type: 'text', admin: { width: '30%', description: 'Small text di bawah (mis: "King Suites")' } },
                  ],
                },
              ],
            },
            {
              name: 'highlightTags',
              type: 'array',
              label: 'Highlight Tags',
              maxRows: 6,
              admin: { description: 'Tag chips di sidebar booking (max 6). Kosong = otomatis pakai 4 amenity pertama.' },
              fields: [
                { name: 'text', type: 'text', required: true },
              ],
            },
          ],
        },

        // ── 2. Media ─────────────────────────────────────────
        {
          label: 'Media',
          description: 'Hero bento gallery — featuredImage jadi main image (big), first 2 dari gallery jadi side.',
          fields: [
            { name: 'featuredImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Main hero image (big, kiri). Rekomendasi landscape 16:9 min 1600px.' } },
            { name: 'gallery', type: 'array', admin: { description: 'Additional photos. First 2 = side bento. Sisanya diakses via "Show all photos".' }, fields: [
              { name: 'image', type: 'upload', relationTo: 'media', required: true },
              { name: 'caption', type: 'text' },
            ]},
          ],
        },

        // ── 3. Rooms & Pricing ───────────────────────────────
        {
          label: 'Rooms & Pricing',
          description: 'Room types, check-in/out, dan WhatsApp booking.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'checkInTime', type: 'text', label: 'Check-in Time', admin: { width: '50%', description: 'Mis: "14:00" atau "2 PM"' } },
                { name: 'checkOutTime', type: 'text', label: 'Check-out Time', admin: { width: '50%', description: 'Mis: "12:00"' } },
              ],
            },
            {
              name: 'roomTypes',
              type: 'array',
              label: 'Room Types',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'bedType', type: 'text', admin: { width: '50%', description: 'Mis: "King Bed", "2 Queen"' } },
                    { name: 'maxGuests', type: 'number', min: 1, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'pricePerNight', type: 'number', min: 0, admin: { width: '60%' } },
                    { name: 'currency', type: 'select', defaultValue: 'IDR', admin: { width: '40%' }, options: [
                      { label: 'IDR', value: 'IDR' }, { label: 'USD', value: 'USD' },
                    ]},
                  ],
                },
                { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
              ],
            },
            whatsappField,
          ],
        },

        // ── 4. Amenities & Location ──────────────────────────
        {
          label: 'Amenities & Location',
          description: 'Amenity grid, facilities, lokasi, dan curated experiences.',
          fields: [
            {
              name: 'amenities',
              type: 'array',
              label: 'Amenities',
              admin: { description: 'Amenity list yg tampil di grid dgn icon bulat (mis: Pool, WiFi, AC).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                    { name: 'icon', type: 'select', options: iconOptions, admin: { width: '40%', description: 'Pilih icon (fallback star kalau kosong)' } },
                  ],
                },
              ],
            },
            {
              name: 'facilities',
              type: 'array',
              label: 'Facilities',
              admin: { description: 'Fasilitas detail per kategori (seperti Booking.com). Mis: "Outdoor" → Pool, Garden; "Getting Around" → Car park, Shuttle.' },
              fields: [
                { name: 'category', type: 'text', required: true, label: 'Category Name', admin: { description: 'Mis: "Languages Spoken", "Outdoor", "Getting Around", "Things to Do"' } },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Items',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { description: 'Mis: "Swimming pool", "Car park [free of charge]"' } },
                  ],
                },
              ],
            },
            { name: 'locationType', type: 'select', label: 'Location Type', options: [
              { label: 'Island', value: 'island' }, { label: 'Mainland', value: 'mainland' },
            ]},
            locationFields,
            {
              name: 'nearbyLandmarks',
              type: 'array',
              label: 'Nearby Landmarks',
              maxRows: 8,
              admin: { description: 'Landmarks di sekitar (max 8). Tampil di section Location kolom kiri.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '65%', description: 'Mis: "Uluwatu Temple"' } },
                    { name: 'distance', type: 'text', admin: { width: '35%', description: 'Mis: "10 mins" atau "2 km"' } },
                  ],
                },
              ],
            },
            {
              name: 'curatedExperiences',
              type: 'array',
              label: 'Curated Experiences',
              maxRows: 8,
              admin: { description: 'Curated experiences yg bisa di-arrange (max 8). Tampil di section Location kolom kanan.' },
              fields: [
                { name: 'name', type: 'text', required: true, admin: { description: 'Mis: "Private Cliffside Dinner", "In-Villa Spa"' } },
              ],
            },
          ],
        },

        // ── 5. Policies ──────────────────────────────────────
        {
          label: 'Policies',
          description: 'Cancellation, house rules, etc.',
          fields: [
            { name: 'policies', type: 'richText' },
          ],
        },

        // ── 6. Custom Sections (super-admin only) ────────────
        {
          label: '🔒 Custom Sections',
          description: 'Super-admin only. Tambah block extra (CTA, Gallery, RichText, dst) di bawah Room Options.',
          fields: [
            relatedServicesPerServiceFields('accommodations'),
            {
              name: 'additionalBlocks',
              type: 'blocks',
              label: 'Additional Blocks',
              admin: { description: 'Block dirender berurutan di detail page setelah Room Options.' },
              access: {
                update: superAdminFieldAccess,
              },
              blocks: blocks.filter((b) => !['valuePropsBanner', 'testimonialsCarousel', 'serviceListing'].includes(b.slug)),
            },
          ],
        },
      ],
    },

    withSidebarTab(seoFields, 'seo'),
  ],
}
