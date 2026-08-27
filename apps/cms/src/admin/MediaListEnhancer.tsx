'use client'
/**
 * DnJourneysBali — Media Library list-view enhancer (Phase 4.11).
 *
 * Mounted globally via `admin.components.providers`. Self-hides on every
 * route EXCEPT the media list (`/admin/collections/media` — NOT a
 * per-doc edit). On the media list it:
 *
 *   1. Injects a "View" size selector (Detail · S · M · L) into the
 *      `.list-controls` toolbar so the user can switch between the
 *      default table and thumbnail grid modes.
 *   2. Writes `data-view-mode="detail|s|m|l"` on `.collection-list`
 *      (or `<body>` fallback). CSS in `media-list.css` reads this to:
 *        - default table for "detail"
 *        - CSS-grid transform of the same table for S/M/L
 *        - hide the "Columns" toggle (redundant with grid view)
 *   3. Persists the choice to localStorage.
 *
 * Performance notes (learned from Phase 4.8 EditSidebarToggle regression):
 *   - MutationObserver is SHALLOW — no `subtree` — and scoped to <body>
 *     to catch SPA route swaps only.
 *   - No scroll listener, no rAF measurement loop.
 *   - Query DOM only when the route matches.
 */
import React, { useEffect } from 'react'

const STORAGE_KEY = 'dnj-media-view-mode'
const ATTR = 'data-view-mode'
const HOLDER_ID = 'dnj-media-view-holder'

type Mode = 'detail' | 's' | 'm' | 'l'
const MODES: Array<{ key: Mode; label: string; title: string }> = [
  { key: 'detail', label: 'Detail', title: 'Table view' },
  { key: 's',      label: 'S',      title: 'Small thumbnails' },
  { key: 'm',      label: 'M',      title: 'Medium thumbnails' },
  { key: 'l',      label: 'L',      title: 'Large thumbnails' },
]

const readMode = (): Mode => {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as Mode | null
    if (s && MODES.some((m) => m.key === s)) return s
  } catch { /* noop */ }
  return 'detail'
}
const writeMode = (m: Mode) => {
  try { localStorage.setItem(STORAGE_KEY, m) } catch { /* noop */ }
}

const isMediaListRoute = (): boolean => {
  const p = window.location.pathname
  return /\/admin\/collections\/media\/?$/.test(p)
}

const applyMode = (mode: Mode) => {
  const root =
    document.querySelector<HTMLElement>('.collection-list') ??
    (document.body as HTMLElement)
  root.setAttribute(ATTR, mode)
  document.body.setAttribute(ATTR, mode)
  // Repaint buttons
  document.querySelectorAll<HTMLButtonElement>('.dnj-media-view__btn').forEach((btn) => {
    const key = btn.dataset.mode as Mode
    btn.setAttribute('aria-pressed', key === mode ? 'true' : 'false')
    btn.classList.toggle('dnj-media-view__btn--active', key === mode)
  })
}

const buildHolder = (): HTMLDivElement => {
  const holder = document.createElement('div')
  holder.id = HOLDER_ID
  holder.className = 'dnj-media-view'
  holder.setAttribute('role', 'group')
  holder.setAttribute('aria-label', 'Media view size')
  const label = document.createElement('span')
  label.className = 'dnj-media-view__label'
  label.textContent = 'View'
  holder.appendChild(label)
  const group = document.createElement('div')
  group.className = 'dnj-media-view__group'
  MODES.forEach((m) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'dnj-media-view__btn'
    btn.dataset.mode = m.key
    btn.title = m.title
    btn.textContent = m.label
    btn.addEventListener('click', () => {
      writeMode(m.key)
      applyMode(m.key)
    })
    group.appendChild(btn)
  })
  holder.appendChild(group)
  return holder
}

const ensureHolder = () => {
  if (!isMediaListRoute()) {
    document.getElementById(HOLDER_ID)?.remove()
    document.body.removeAttribute(ATTR)
    return
  }
  // list-controls is Payload's toolbar row (search/columns/sort/etc.).
  const controls = document.querySelector<HTMLElement>('.list-controls')
  if (!controls) return // list not rendered yet — mutation observer will retry

  if (!document.getElementById(HOLDER_ID)) {
    const holder = buildHolder()
    // Insert as the FIRST child of .list-controls → left of the sort/where/columns cluster.
    controls.appendChild(holder)
  }
  applyMode(readMode())
}

const MediaListEnhancer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    ensureHolder()

    // SHALLOW body observer catches SPA route swaps — no subtree/deep obs.
    const obs = new MutationObserver(() => {
      requestAnimationFrame(ensureHolder)
    })
    obs.observe(document.body, { childList: true })

    // Also observe one level deeper into the Next app wrap so intra-collection
    // navigation (list ⇄ create ⇄ edit) is caught without paying deep-tree cost.
    const app = document.querySelector<HTMLElement>('.template-default__wrap, main')
    const appObs = app ? new MutationObserver(() => requestAnimationFrame(ensureHolder)) : null
    if (app && appObs) appObs.observe(app, { childList: true })

    return () => {
      obs.disconnect()
      appObs?.disconnect()
      document.getElementById(HOLDER_ID)?.remove()
      document.body.removeAttribute(ATTR)
    }
  }, [])

  return <>{children}</>
}

export default MediaListEnhancer
