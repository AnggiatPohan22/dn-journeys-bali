import type { Field } from 'payload'
import { adminFieldAccess } from '../access/roles'

export const statusField: Field = {
  name: 'status',
  type: 'select',
  label: 'Status',
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ],
  access: {
    update: adminFieldAccess,
  },
  admin: {
    position: 'sidebar',
  },
}

export const sortOrderField: Field = {
  name: 'sortOrder',
  type: 'number',
  label: 'Sort Order',
  defaultValue: 0,
  admin: {
    position: 'sidebar',
    description: 'Lower numbers appear first',
  },
}

export const isFeaturedField: Field = {
  name: 'isFeatured',
  type: 'checkbox',
  label: 'Featured',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Show on homepage and featured sections',
  },
}
