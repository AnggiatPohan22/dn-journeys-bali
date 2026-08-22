import type { Field } from 'payload'

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO Settings',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta Title',
      admin: {
        description: 'Override the default page title for search engines',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta Description',
      maxLength: 160,
      admin: {
        description: 'Recommended: 120-160 characters',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Social Share Image',
      admin: {
        description: 'Recommended: 1200x630px',
      },
    },
  ],
}
