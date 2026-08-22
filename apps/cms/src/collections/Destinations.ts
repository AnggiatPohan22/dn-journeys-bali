import type { CollectionConfig } from 'payload'
import { authenticatedRead, adminCreate, authenticatedUpdate, superAdminDelete } from '../access/roles'
import { generateSlug } from '../hooks/generateSlug'
import { seoFields } from '../fields/seo'
import { statusField, sortOrderField } from '../fields/status'
import { locationFields } from '../fields/location'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'type', 'status', 'sortOrder'],
  },
  access: {
    read: () => true,
    create: adminCreate,
    update: authenticatedUpdate,
    delete: superAdminDelete,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Destination Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Island', value: 'island' },
        { label: 'Mainland', value: 'mainland' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Gallery',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    locationFields,
    seoFields,
    statusField,
    sortOrderField,
  ],
}
