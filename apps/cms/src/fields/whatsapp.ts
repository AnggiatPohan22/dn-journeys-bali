import type { Field } from 'payload'

export const whatsappField: Field = {
  name: 'whatsappMessage',
  type: 'textarea',
  label: 'WhatsApp Pre-filled Message',
  admin: {
    description: 'Template pesan WhatsApp yang akan terisi otomatis saat visitor klik tombol booking',
    rows: 5,
  },
}
