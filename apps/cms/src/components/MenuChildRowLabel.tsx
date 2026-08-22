'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * RowLabel untuk sub-menu (child). Sama pola dgn parent tapi:
 * - Prefix "↳ " untuk visual indent
 * - Warna sedikit muted (opacity 0.85)
 * - Font size lebih kecil (kalau UI Payload menghormati)
 */

type Data = {
  label?: string
  type?: 'page' | 'custom_url' | 'anchor' | 'none'
  url?: string
  page?: { slug?: string; title?: string } | string | null
}

const ICON: Record<NonNullable<Data['type']>, string> = {
  page: '📄',
  custom_url: '🔗',
  anchor: '⚓',
  none: '🏷️',
}

export const MenuChildRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Data>()

  if (!data?.label) {
    return <span style={{ opacity: 0.55, fontSize: 13 }}>↳ 🆕 Sub-item baru — klik untuk edit (#{String((rowNumber ?? 0) + 1).padStart(2, '0')})</span>
  }

  const icon = data.type ? (ICON[data.type] ?? '•') : '🔗'
  const preview =
    data.type === 'none'
      ? '(label saja, tanpa link)'
      : data.type === 'page' && typeof data.page === 'object' && data.page
        ? `/${data.page.slug ?? '…'}`
        : data.url || '—'

  return (
    <span style={{ opacity: 0.9, fontSize: 13 }}>
      ↳ {icon} <strong>{data.label}</strong>
      <span style={{ opacity: 0.55, marginLeft: 6, fontWeight: 'normal' }}>{preview}</span>
    </span>
  )
}

export default MenuChildRowLabel
