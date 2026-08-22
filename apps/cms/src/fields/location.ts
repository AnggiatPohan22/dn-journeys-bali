import type { Field } from 'payload'

export const locationFields: Field = {
  name: 'location',
  type: 'group',
  label: 'Location',
  fields: [
    {
      name: 'address',
      type: 'text',
      label: 'Address',
    },
    {
      name: 'mapEmbed',
      type: 'text',
      label: 'Google Maps Embed URL',
      admin: {
        description: 'Paste the Google Maps embed URL here',
      },
    },
    {
      name: 'latitude',
      type: 'number',
      label: 'Latitude',
    },
    {
      name: 'longitude',
      type: 'number',
      label: 'Longitude',
    },
  ],
}
