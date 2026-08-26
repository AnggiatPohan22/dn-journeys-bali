'use client'
import React from 'react'

/**
 * Provider ringan yang meng-inject stylesheet brand global ke SELURUH
 * route admin (termasuk login & semua collection view) — satu-satunya cara
 * memuat CSS global di Payload v3 (tidak ada opsi `admin.css`).
 *
 * Didaftarkan di `admin.components.providers`. Hanya me-render children;
 * seluruh rule di `admin-global.css` bersifat additive & reversible
 * (menyentuh hanya class Payload tertentu: nav aktif + tombol login).
 */
import './admin-global.css'

const AdminStyles: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export default AdminStyles
