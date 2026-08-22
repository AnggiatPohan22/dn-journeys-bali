import type { Field } from 'payload'

export const pricingFields: Field = {
  name: 'pricing',
  type: 'group',
  label: 'Pricing',
  fields: [
    {
      name: 'adultPrice',
      type: 'number',
      label: 'Adult Price',
      min: 0,
    },
    {
      name: 'childPrice',
      type: 'number',
      label: 'Child Price',
      min: 0,
    },
    {
      name: 'infantPrice',
      type: 'number',
      label: 'Infant Price',
      min: 0,
    },
    {
      name: 'currency',
      type: 'select',
      label: 'Currency',
      defaultValue: 'IDR',
      options: [
        { label: 'IDR (Rupiah)', value: 'IDR' },
        { label: 'USD (Dollar)', value: 'USD' },
      ],
    },
    {
      name: 'priceNote',
      type: 'text',
      label: 'Price Note',
      admin: {
        description: 'e.g. "per person", "per group", "per night"',
      },
    },
    {
      name: 'discountLabel',
      type: 'text',
      label: 'Discount Label',
      admin: {
        description: 'e.g. "Early Bird -10%", "Group Discount"',
      },
    },
  ],
}
