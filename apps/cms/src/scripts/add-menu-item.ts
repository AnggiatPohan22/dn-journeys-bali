/**
 * Update main-navigation menu — append "Villa" item (idempotent).
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/add-menu-item.ts
 * NOTE: matikan `pnpm dev` CMS dulu (SQLite lock).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const NEW_ITEM = {
  label: 'Villa',
  type: 'custom_url' as const,
  url: '/villa',
  target: '_self' as const,
}

const run = async () => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'main-navigation' } },
    limit: 1,
  })

  const menu = result.docs[0]
  if (!menu) {
    process.stderr.write('❌ Menu "main-navigation" not found. Create it first in CMS admin.\n')
    process.exit(1)
  }

  const items = Array.isArray(menu.items) ? menu.items : []
  const already = items.some((it: any) => it.url === NEW_ITEM.url || it.label === NEW_ITEM.label)

  if (already) {
    process.stdout.write(`✓ Menu already has "${NEW_ITEM.label}" — no change.\n`)
    process.exit(0)
  }

  // Insert Villa after "Home" (position 1) or at end if not found
  const homeIdx = items.findIndex((it: any) => it.label?.toLowerCase() === 'home')
  const insertAt = homeIdx >= 0 ? homeIdx + 1 : items.length
  const newItems = [...items.slice(0, insertAt), NEW_ITEM, ...items.slice(insertAt)]

  await payload.update({
    collection: 'menus',
    id: menu.id,
    data: { items: newItems as any },
  })

  process.stdout.write(`✓ Added "${NEW_ITEM.label}" → ${NEW_ITEM.url} to main-navigation (position ${insertAt + 1}).\n`)
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`)
  process.exit(1)
})
