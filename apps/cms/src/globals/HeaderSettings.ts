import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/roles'

/**
 * Header Settings — kontrol structural Header (menu wiring + CTA + behavior).
 *
 * Konten brand (logo, siteName) tetap di SiteSettings — TIDAK duplikasi.
 * Kontak WhatsApp number tetap di SiteSettings — HeaderSettings hanya kontrol
 * SHOULD button muncul, text-nya apa, dan link-nya kemana.
 */
export const HeaderSettings: GlobalConfig = {
  slug: 'header-settings',
  label: 'Header Settings',
  admin: {
    group: 'Settings',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: 'primaryMenu',
      type: 'relationship',
      relationTo: 'menus',
      admin: { description: 'Menu utama di nav Header. Default: main-navigation.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'stickyOnScroll', type: 'checkbox', defaultValue: true, admin: { width: '50%', description: 'Header sticky saat scroll' } },
        { name: 'transparentOnTop', type: 'checkbox', defaultValue: false, admin: { width: '50%', description: 'Transparan di hero, solid setelah scroll (default: false — semua page)' } },
      ],
    },
    {
      name: 'showCtaButton',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Tampilkan tombol CTA di kanan atas Header' },
    },
    {
      type: 'row',
      admin: { condition: (_, sib) => sib?.showCtaButton !== false },
      fields: [
        { name: 'ctaText', type: 'text', defaultValue: 'WhatsApp Booking', admin: { width: '50%', description: 'Text button (mobile pakai "Book" auto-short)' } },
        {
          name: 'ctaType', type: 'select', defaultValue: 'whatsapp', admin: { width: '50%' },
          options: [
            { label: 'WhatsApp (pakai number dari SiteSettings)', value: 'whatsapp' },
            { label: 'Custom URL', value: 'custom' },
          ],
        },
      ],
    },
    {
      name: 'ctaCustomLink',
      type: 'text',
      admin: {
        condition: (_, sib) => sib?.showCtaButton !== false && sib?.ctaType === 'custom',
        description: 'Custom URL (mis: /contact atau https://booking.example.com)',
      },
    },
  ],
}
