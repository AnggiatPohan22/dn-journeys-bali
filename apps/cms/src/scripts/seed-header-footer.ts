/**
 * Seed defaults untuk Phase 3.8 — Header & Footer CMS sync.
 *
 * Idempotent. Creates:
 *   - Menu 'footer-quick-links' (kalau belum ada, dgn items default)
 *   - HeaderSettings global (link ke main-navigation, CTA "WhatsApp Booking")
 *   - FooterSettings global (1 column: Quick Links → footer-quick-links)
 *
 * Run: cd apps/cms && pnpm tsx src/scripts/seed-header-footer.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const log = (msg: string) => process.stdout.write(`${msg}\n`)

const run = async () => {
  const payload = await getPayload({ config })

  // ── 1. Ensure footer-quick-links menu ──────────────────────
  const existingMenu = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'footer-quick-links' } },
    limit: 1,
  })

  let footerMenuId: number
  const footerMenuData: any = {
    name: 'Footer Quick Links',
    slug: 'footer-quick-links',
    status: 'active',
    items: [
      { label: 'Home',        type: 'custom_url', url: '/',         target: '_self' },
      { label: 'About Us',    type: 'custom_url', url: '/about',    target: '_self' },
      { label: 'Contact',     type: 'custom_url', url: '/contact',  target: '_self' },
      { label: 'Property',    type: 'custom_url', url: '/property', target: '_self' },
    ],
  }

  if (existingMenu.docs[0]) {
    footerMenuId = existingMenu.docs[0].id as number
    log(`· Menu "footer-quick-links" already exists (id=${footerMenuId}) — skip create.`)
  } else {
    const created = await payload.create({ collection: 'menus', data: footerMenuData })
    footerMenuId = created.id as number
    log(`✓ Created menu "footer-quick-links" (id=${footerMenuId})`)
  }

  // ── 2. Get main-navigation menu id for HeaderSettings ──────
  const mainMenu = await payload.find({
    collection: 'menus',
    where: { slug: { equals: 'main-navigation' } },
    limit: 1,
  })
  const mainMenuId = mainMenu.docs[0]?.id as number | undefined
  if (!mainMenuId) log('⚠ Menu "main-navigation" tidak ada — HeaderSettings.primaryMenu tidak di-set.')

  // ── 3. Update HeaderSettings global ────────────────────────
  await payload.updateGlobal({
    slug: 'header-settings' as any,
    data: {
      primaryMenu: mainMenuId,
      stickyOnScroll: true,
      transparentOnTop: false,
      showCtaButton: true,
      ctaText: 'WhatsApp Booking',
      ctaType: 'whatsapp',
    } as any,
  })
  log('✓ HeaderSettings updated (primaryMenu → main-navigation, CTA WhatsApp)')

  // ── 4. Update FooterSettings global ────────────────────────
  await payload.updateGlobal({
    slug: 'footer-settings' as any,
    data: {
      columns: [
        { columnLabel: 'Quick Links', menu: footerMenuId },
      ],
      showNewsletter: false,
    } as any,
  })
  log('✓ FooterSettings updated (1 column: Quick Links → footer-quick-links)')

  log('\n📝 Done. Restart Astro to pickup new fetches.')
  process.exit(0)
}

run().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack}\n`)
  process.exit(1)
})
