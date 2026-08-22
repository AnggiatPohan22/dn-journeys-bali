import type { CollectionConfig } from 'payload'
import { isSuperAdmin, authenticatedRead } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: authenticatedRead,
    create: isSuperAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      // Users can update themselves, super-admin can update anyone
      if (user.role === 'super-admin') return true
      return user.id === id
    },
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
