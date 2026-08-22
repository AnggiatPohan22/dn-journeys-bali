/**
 * Fallback site config — used when CMS data isn't available yet.
 * In production, all values come from CMS SiteSettings global.
 */
export const siteConfig = {
  name: 'DnJourneysBali',
  tagline: 'Your Bali Journey, Our Local Expertise',
  url: 'https://dnjourneysbali.com',

  contact: {
    email: 'hello@dnjourneysbali.com',
    phone: '+62-xxx-xxxx-xxxx',
    whatsapp: '62xxxxxxxxxxx',
    address: 'Bali, Indonesia',
  },

  social: {
    instagram: 'https://instagram.com/dnjourneysbali',
    facebook: '',
    tiktok: '',
    youtube: '',
    tripadvisor: '',
  },

  defaultSeo: {
    title: 'DnJourneysBali — Tours, Villas, Activities in Bali',
    description: 'Discover the best of Bali with local expertise. Tours, villa bookings, water activities, yacht charters, restaurants, weddings, and rental services.',
    ogImage: '/og-default.jpg',
  },
}
