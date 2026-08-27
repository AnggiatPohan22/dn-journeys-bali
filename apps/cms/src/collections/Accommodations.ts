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

/**
 * Accommodations — villa / hotel / resort / guesthouse.
 *
 * Structured tabs for editor clarity. All frontend-displayed fields
 * (villa/[slug] detail page) are editable here.
 *
 * Villa/Hotel/Resort → detail route /villa/[slug].
 * Guesthouse → legacy detail /accommodations/[slug].
 */
export const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  admin: {
    useAsTitle: 'name',
    group: 'Services',
    defaultColumns: ['name', 'type', 'destination', 'status'],
    preview: makePreview('/villa'),
  },
  access: { read: () => true, create: adminCreate, update: authenticatedUpdate, delete: superAdminDelete },
  fields: [
    // Sidebar (Phase 4.9 — tabbed: General / SEO / Publishing)
    sidebarTabsField,
    withSidebarTab({ name: 'slug', type: 'text', required: true, unique: true, hooks: { beforeValidate: [generateSlug] }, admin: { position: 'sidebar' } }, 'general'),
    withSidebarTab(statusField,     'status'),
    withSidebarTab(sortOrderField,  'status'),
    withSidebarTab(isFeaturedField, 'status'),

    // Main tabs
    {
      type: 'tabs',
      tabs: [
        // ── Overview ──────────────────────────────────────────
        {
          label: 'Overview',
          description: 'Basic info yang tampil di hero + title area detail page.',
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
          ],
        },

        // ── Media ─────────────────────────────────────────────
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

        // ── Quick Specs (4 white stat boxes) ─────────────────
        {
          label: 'Quick Specs',
          description: '4 kotak putih besar di atas Amenities. Kalau kosong, frontend fallback auto-derive dari rooms/guests/rating/amenities count.',
          fields: [
            {
              name: 'quickSpecs',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Max 4 stat cards. Icon + big label + subtitle.' },
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
          ],
        },

        // ── Amenities & Highlights ────────────────────────────
        {
          label: 'Amenities & Highlights',
          description: 'Amenity grid + highlight tag chips (sidebar).',
          fields: [
            {
              name: 'highlightTags',
              type: 'array',
              maxRows: 6,
              admin: { description: 'Tag chips di sidebar booking (max 6). Kalau kosong, otomatis pakai 4 amenity pertama.' },
              fields: [
                { name: 'text', type: 'text', required: true },
              ],
            },
            {
              name: 'amenities',
              type: 'array',
              admin: { description: 'Amenity list yg tampil di grid dgn icon bulat.' },
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
          ],
        },

        // ── Rooms & Pricing ───────────────────────────────────
        {
          label: 'Rooms & Pricing',
          description: 'Room types + check-in/out times. Cheapest room jadi "starting from" di sidebar.',
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
          ],
        },

        // ── Location & Experiences ────────────────────────────
        {
          label: 'Location & Experiences',
          description: 'Alamat + map embed + nearby landmarks + curated experiences.',
          fields: [
            { name: 'locationType', type: 'select', options: [
              { label: 'Island', value: 'island' }, { label: 'Mainland', value: 'mainland' },
            ]},
            locationFields,
            {
              name: 'nearbyLandmarks',
              type: 'array',
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
              maxRows: 8,
              admin: { description: 'Curated experiences yg bisa di-arrange (max 8). Tampil di section Location kolom kanan.' },
              fields: [
                { name: 'name', type: 'text', required: true, admin: { description: 'Mis: "Private Cliffside Dinner", "In-Villa Spa"' } },
              ],
            },
          ],
        },

        // ── Policies ──────────────────────────────────────────
        {
          label: 'Policies',
          description: 'Cancellation, house rules, etc.',
          fields: [
            { name: 'policies', type: 'richText' },
          ],
        },

        // ── Custom Sections (super-admin only) ────────────────
        // Extra blocks yg dirender di bawah Room Options di detail page.
        // Editor biasa read-only (bisa lihat tapi tidak edit).
        //
        // NOTE: exclude 3 block dgn slug panjang yg bikin enum name > 63 char
        // saat di-prefix `accommodations_blocks_`:
        //   - valuePropsBanner (slug 18 char)
        //   - testimonialsCarousel (slug 21 char)
        //   - serviceListing (slug 15 char)
        // Ketiga block ini tetap available di CMS Page.content.
        {
          label: '🔒 Custom Sections',
          description: 'Super-admin only. Tambah block extra (CTA, Gallery, RichText, dst) di bawah Room Options.',
          fields: [
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

        // ── Booking ───────────────────────────────────────────
        {
          label: 'Booking',
          description: 'WhatsApp integration.',
          fields: [
            whatsappField,
          ],
        },
      ],
    },

    // seoFields → sidebar (position: 'sidebar' set di helper)
    withSidebarTab(seoFields, 'seo'),
  ],
}
