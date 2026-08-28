'use client'
/**
 * DnJourneysBali — User avatar list cell (Phase 4.14 · Track A).
 *
 * Reads `rowData.avatar` (populated media doc when depth >= 1) and
 * renders a small circular thumbnail. Falls back to initials from
 * `rowData.name` / `rowData.email` — same visual as SidebarFooter's
 * avatar chip so both surfaces feel consistent.
 */
import React from 'react'

type Row = {
  avatar?: { url?: string | null; thumbnailURL?: string | null } | string | null
  name?: string | null
  email?: string | null
}

const initialsFor = (row?: Row): string => {
  const src = (row?.name || row?.email || 'U').toString().trim()
  return src
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

const urlFor = (row?: Row): string | null => {
  const a = row?.avatar
  if (!a || typeof a === 'string') return null
  return a.thumbnailURL || a.url || null
}

const UserAvatarCell: React.FC<{ rowData?: Row }> = ({ rowData }) => {
  const url = urlFor(rowData)
  return (
    <span className="dnj-user-avatar-cell" aria-hidden={url ? undefined : 'true'}>
      {url ? (
        <img className="dnj-user-avatar-cell__img" src={url} alt="" />
      ) : (
        <span className="dnj-user-avatar-cell__initials">{initialsFor(rowData)}</span>
      )}
    </span>
  )
}

export default UserAvatarCell
