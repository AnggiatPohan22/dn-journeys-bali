import type { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const generateSlug: FieldHook = ({ value, data }) => {
  // If slug is manually set, use it
  if (typeof value === 'string' && value.length > 0) {
    return format(value)
  }
  // Otherwise generate from title/name
  const title = data?.title || data?.name
  if (typeof title === 'string' && title.length > 0) {
    return format(title)
  }
  return value
}
