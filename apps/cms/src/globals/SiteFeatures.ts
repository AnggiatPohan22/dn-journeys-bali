import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'

/**
 * Site Features — master toggle untuk modul, section, dan fitur opsional.
 *
 * Kontrak:
 * - Structural metadata (label/slug/icon/collection) tetap di
 *   `apps/web/src/config/modules.ts` — itu bukan editorial.
 * - Global ini cuma menentukan `enabled` per modul, dan on/off untuk
 *   section & fitur opsional yang ada di frontend.
 *
 * Section/features tertentu diberi label "(reserved)" — checkbox sudah
 * tersedia untuk phase depan tapi komponennya belum dirender di frontend.
 *
 * Read: publik (frontend butuh fetch tanpa auth).
 * Update: Super Admin only — toggle modul = keputusan owner, bukan editor.
 */
export const SiteFeatures: GlobalConfig = {
  slug: 'site-features',
  label: 'Pengaturan Fitur',
  admin: {
    group: 'Settings',
    description: 'Enable/disable modul layanan, section halaman, dan fitur opsional. Hanya Super Admin.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    // ── Modul Layanan (7 service modules) ────────────────────────────────
    {
      name: 'modules',
      type: 'group',
      label: 'Modul Layanan',
      admin: {
        description: 'Matikan modul → hilang dari navigasi, homepage, sitemap, dan URL-nya 404.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'tours', type: 'checkbox', label: 'Tours & Activities', defaultValue: true, admin: { width: '50%' } },
            { name: 'accommodations', type: 'checkbox', label: 'Villas & Hotels', defaultValue: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'waterActivities', type: 'checkbox', label: 'Water Activities', defaultValue: true, admin: { width: '50%' } },
            { name: 'yacht', type: 'checkbox', label: 'Private Yacht', defaultValue: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'restaurants', type: 'checkbox', label: 'Restaurants', defaultValue: true, admin: { width: '50%' } },
            { name: 'weddings', type: 'checkbox', label: 'Weddings & Events', defaultValue: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'rentals', type: 'checkbox', label: 'Rental Service', defaultValue: true, admin: { width: '50%' } },
            { name: 'spa', type: 'checkbox', label: 'Spa & Wellness', defaultValue: true, admin: { width: '50%' } },
          ],
        },
      ],
    },

    // ── Section Halaman ──────────────────────────────────────────────────
    {
      name: 'sections',
      type: 'group',
      label: 'Section Halaman',
      admin: {
        description: 'Toggle section besar di homepage / landing pages.',
      },
      fields: [
        { name: 'testimonials', type: 'checkbox', label: 'Testimonials', defaultValue: true },
        { name: 'faq', type: 'checkbox', label: 'FAQ Section', defaultValue: true },
        // reserved — komponennya belum dirender
        { name: 'promoBanner', type: 'checkbox', label: 'Banner Promo (reserved — Phase 4)', defaultValue: false },
        { name: 'newsletter', type: 'checkbox', label: 'Newsletter Signup (reserved — Phase 4)', defaultValue: false },
      ],
    },

    // ── Fitur Opsional ───────────────────────────────────────────────────
    {
      name: 'features',
      type: 'group',
      label: 'Fitur Opsional',
      admin: {
        description: 'Toggle floating widget & fitur global lain.',
      },
      fields: [
        { name: 'whatsappFloat', type: 'checkbox', label: 'WhatsApp Floating Button', defaultValue: true },
        // reserved
        { name: 'announcementBar', type: 'checkbox', label: 'Announcement Bar (reserved — Phase 4)', defaultValue: false },
      ],
    },
  ],
}
