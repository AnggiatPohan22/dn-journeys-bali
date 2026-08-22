'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * RowLabel untuk menu item parent — tampil sebagai:
 *   📄 Home — /
 *   🔗 Special Offers — https://promo.example.com
 *   ⚓ Contact Section — #contact
 *   🧭 Tours Index — /tours
 *
 * Fallback saat label kosong: "🆕 Menu item baru — klik untuk edit".
 */

type Data = {
  label?: string
  type?: 'page' | 'service_index' | 'custom_url' | 'anchor' | 'none'
  url?: string
  page?: { slug?: string; title?: string } | string | null
  children?: unknown[]
}

const ICON: Record<NonNullable<Data['type']>, string> = {
  page: '📄',
  service_index: '🧭',
  custom_url: '🔗',
  anchor: '⚓',
  none: '🏷️',
}

export const MenuItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Data>()

  if (!data?.label) {
    return <span style={{ opacity: 0.6 }}>🆕 Menu item baru — klik untuk edit (#{String((rowNumber ?? 0) + 1).padStart(2, '0')})</span>
  }

  const icon = data.type ? (ICON[data.type] ?? '•') : '•'
  const preview =
    data.type === 'none'
      ? '(dropdown only)'
      : data.type === 'page' && typeof data.page === 'object' && data.page
        ? `/${data.page.slug ?? '…'}`
        : data.url || '—'

  const childCount = Array.isArray(data.children) ? data.children.length : 0

  return (
    <span>
      <strong>{icon} {data.label}</strong>
      <span style={{ opacity: 0.55, marginLeft: 8, fontWeight: 'normal' }}>{preview}</span>
      {childCount > 0 && (
        <span style={{ opacity: 0.55, marginLeft: 8, fontSize: 12 }}>· {childCount} sub-item</span>
      )}
    </span>
  )
}

export default MenuItemRowLabel
