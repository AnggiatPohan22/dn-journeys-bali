import type { CollectionConfig } from 'payload'
import { authenticatedRead, isAdmin } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Site Builder',
    // Phase 4.11 — grid mode CSS in `admin/media-list.css` reads from
    // `.cell-filename` (thumbnail + name), `.cell-mimeType` (badge),
    // `.cell-filesize` (subtext). Setting defaultColumns explicitly
    // guarantees those cells are always in the DOM.
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
    listSearchableFields: ['alt', 'caption', 'filename'],
  },
  access: {
    read: () => true, // Public — images need to be accessible
    create: authenticatedRead,
    update: authenticatedRead,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Describe the image for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photo Credit',
    },
  ],
}
