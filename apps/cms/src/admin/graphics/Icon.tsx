import React from 'react'

/**
 * Brand Icon kecil untuk header sidebar admin (menggantikan icon default).
 * Didaftarkan di `admin.components.graphics.Icon`.
 * Badge monogram gradient (ocean→leaf) — versi ringkas dari Logo.
 */
const Icon = () => (
  <svg width="28" height="28" viewBox="0 0 64 64" role="img" aria-label="DnJourneysBali">
    <defs>
      <linearGradient id="dnj-icon-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1b3a4b" />
        <stop offset="1" stopColor="#6b9080" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#dnj-icon-grad)" />
    <text
      x="32"
      y="34"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="Geist, system-ui, sans-serif"
      fontSize="28"
      fontWeight="700"
      fill="#ffffff"
      letterSpacing="-1"
    >
      DJ
    </text>
  </svg>
)

export default Icon
