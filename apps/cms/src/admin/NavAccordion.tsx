'use client'
import { useEffect } from 'react'

/**
 * NavAccordion — perilaku accordion grup sidebar (Phase 4.5):
 *  1. First load: hanya grup yang memuat halaman aktif yang terbuka (sekali,
 *     ditandai localStorage). Grup lain di-collapse.
 *  2. Single-open: klik satu grup untuk MEMBUKA → grup lain otomatis tertutup.
 *
 * Payload menyimpan open-state grup dari preference server & default terbuka;
 * tidak ada API config untuk ini, jadi kita kelola lewat klik toggle native
 * (`.nav-group__toggle`) — animasi & persist tetap dari Payload.
 * Defensif: kalau DOM berubah, paling grup tetap terbuka; navigasi tak rusak.
 * Render null (slot afterNavLinks).
 */
const FLAG = 'dnj-nav-accordion-init'

const NavAccordion = () => {
  useEffect(() => {
    // ── 1. First-load collapse (only active group open) ──
    try {
      if (!localStorage.getItem(FLAG)) {
        const collapseOthers = (): boolean => {
          const groups = document.querySelectorAll<HTMLElement>('.nav-group')
          if (!groups.length) return false
          groups.forEach((g) => {
            const hasActive = g.querySelector('.nav__link.active, .nav__link-indicator')
            const collapsed = g.classList.contains('nav-group--collapsed')
            const toggle = g.querySelector<HTMLElement>('.nav-group__toggle')
            if (!hasActive && !collapsed && toggle) toggle.click()
          })
          localStorage.setItem(FLAG, '1')
          return true
        }
        if (!collapseOthers()) window.setTimeout(collapseOthers, 300)
      }
    } catch {
      /* no-op */
    }

    // ── 2. Single-open: opening one group closes the others ──
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const toggle = target?.closest?.('.nav-group__toggle')
      if (!toggle) return
      const group = toggle.closest('.nav-group')
      if (!group) return
      // Tunggu Payload update state, lalu tutup grup lain kalau ini terbuka.
      window.setTimeout(() => {
        if (group.classList.contains('nav-group--collapsed')) return // sedang menutup
        document.querySelectorAll<HTMLElement>('.nav-group').forEach((g) => {
          if (g !== group && !g.classList.contains('nav-group--collapsed')) {
            g.querySelector<HTMLElement>('.nav-group__toggle')?.click()
          }
        })
      }, 0)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}

export default NavAccordion
