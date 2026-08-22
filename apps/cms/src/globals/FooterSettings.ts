import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/roles'

/**
 * Footer Settings — kontrol STRUKTUR kolom menu di Footer.
 *
 * TIDAK duplikasi contact/social/copyright/tagline — semua sudah di SiteSettings.
 * Footer.astro fetch DUA sumber: FooterSettings (struktur menu kolom) +
 * SiteSettings (konten branding). Services column tetap dari
 * `apps/web/src/config/modules.ts` (struktur produk, per-toggle).
 */
export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  label: 'Footer Settings',
  admin: {
    group: 'Settings',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    // ── Brand column (logo/tagline/social — semua dari SiteSettings) ────
    {
      type: 'collapsible',
      label: 'Brand Column',
      admin: { description: 'Kolom kiri: logo, tagline, social icons. Data dari SiteSettings.', initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'showBrandColumn', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Tampilkan kolom brand?' } },
            { name: 'brandTaglineOverride', type: 'text', admin: { width: '50%', description: 'Override tagline khusus footer (kosong = pakai SiteSettings.tagline)' } },
          ],
        },
      ],
    },

    // ── Menu columns (Quick Links, Company, dst) ────────────────────────
    {
      name: 'columns',
      type: 'array',
      label: 'Menu Columns',
      minRows: 0,
      maxRows: 4,
      admin: { description: 'Kolom menu editorial di Footer (mis: Quick Links, Company, Legal). Bisa multiple.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'columnLabel', type: 'text', required: true, admin: { width: '40%', description: 'Mis: "Quick Links"' } },
            { name: 'menu', type: 'relationship', relationTo: 'menus', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },

    // ── Services column (from modules config OR custom menu) ────────────
    {
      type: 'collapsible',
      label: 'Services Column',
      admin: { description: 'Kolom services — default auto dari modules config. Override dgn menu CMS kalau butuh full kontrol.', initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'showServicesColumn', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
            { name: 'servicesColumnLabel', type: 'text', defaultValue: 'Our Services', admin: { width: '30%' } },
            { name: 'servicesMenu', type: 'relationship', relationTo: 'menus', admin: { width: '40%', description: 'Optional: override auto dgn menu CMS' } },
          ],
        },
      ],
    },

    // ── Contact column (from SiteSettings.contact) ──────────────────────
    {
      type: 'collapsible',
      label: 'Contact Column',
      admin: { description: 'Kolom kanan: phone/email/address/hours dari SiteSettings.contact.', initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'showContactColumn', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
            { name: 'contactColumnLabel', type: 'text', defaultValue: 'Contact Us', admin: { width: '50%' } },
          ],
        },
      ],
    },

    // ── Bottom bar ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Bottom Bar',
      admin: { description: 'Copyright + tagline tambahan bawah footer.', initCollapsed: true },
      fields: [
        { name: 'bottomBarRightText', type: 'text', defaultValue: 'Designed with ♥ in Bali', admin: { description: 'Text di kanan bawah (copyright text pakai SiteSettings.footer.copyrightText)' } },
      ],
    },

    {
      name: 'showNewsletter',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Reserved — newsletter signup (implementasi Phase 4)' },
    },
  ],
}
