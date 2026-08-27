'use client'
/**
 * DnJourneysBali — Sidebar tab bar (Phase 4.8, Goal 2).
 *
 * Registered as a `ui`-type field on Pages collection, `admin.position:
 * 'sidebar'` so it renders at the top of the RIGHT edit sidebar. Clicking
 * a tab writes `data-sidebar-tab="general" | "seo" | "status"` on the
 * document sidebar container (found by walking up from this button's DOM
 * host). CSS in `edit-view.css` shows/hides the corresponding sibling
 * field wrappers.
 *
 * Fields never unmount — only visibility toggles → form state safe.
 *
 * Persistence: activeTab is stored in localStorage per-collection so
 * jumping between rows keeps the last-used tab.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'

type TabKey = 'general' | 'seo' | 'status'
const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'seo',     label: 'SEO' },
  { key: 'status',  label: 'Publishing' },
]

const STORAGE_KEY = 'dnj-sidebar-tab'

const SidebarTabs: React.FC = () => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState<TabKey>('general')

  // Walk up from our host to Payload's sidebar container. We tag the closest
  // ancestor that contains `.document-fields__sidebar` markers with the
  // data attribute so CSS can scope to it.
  const findSidebarRoot = useCallback((): HTMLElement | null => {
    let node: HTMLElement | null = hostRef.current
    while (node && node !== document.body) {
      if (node.classList?.contains('document-fields__sidebar')) return node
      // Fallback: any ancestor holding both this UI field and other sidebar fields.
      if (node.parentElement?.classList?.contains('document-fields__sidebar')) return node.parentElement
      node = node.parentElement
    }
    // Last-ditch: query anywhere in the document.
    return document.querySelector<HTMLElement>('.document-fields__sidebar')
  }, [])

  // Restore persisted tab + apply once mounted.
  useEffect(() => {
    let init: TabKey = 'general'
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as TabKey | null
      if (stored && TABS.some((t) => t.key === stored)) init = stored
    } catch { /* noop */ }
    setActive(init)
  }, [])

  // Whenever `active` changes, write the attribute onto the sidebar root.
  useEffect(() => {
    const root = findSidebarRoot()
    if (root) root.setAttribute('data-sidebar-tab', active)
    try { localStorage.setItem(STORAGE_KEY, active) } catch { /* noop */ }
  }, [active, findSidebarRoot])

  return (
    <div className="dnj-sidebar-tabs" ref={hostRef} role="tablist" aria-label="Page settings sections">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`dnj-sidebar-tabs__tab${active === t.key ? ' dnj-sidebar-tabs__tab--active' : ''}`}
          onClick={() => setActive(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default SidebarTabs
