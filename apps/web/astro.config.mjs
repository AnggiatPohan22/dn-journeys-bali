import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://dnjourneysbali.com',
  output: 'static',

  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  image: {
    domains: ['dn-journeys-media.r2.cloudflarestorage.com'],
  },
})
