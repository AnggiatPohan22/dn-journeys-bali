import type { Field } from 'payload'

/**
 * Reusable media field group — flexible media untuk Hero, Image, Gallery, CTA.
 *
 * mediaType branches:
 *   'single'   → 1 image (backward-compat friendly, paling umum)
 *   'multiple' → array 2-10 images dengan preset transisi (slider/carousel)
 *   'video'    → video URL (YouTube/Vimeo/direct) atau upload file
 *   'none'     → skip media (untuk block yang opt-out — misal Hero pure text)
 *
 * Semua field opsional (default aman) supaya existing block instances
 * tidak jadi invalid saat schema di-extend.
 *
 * Frontend memetakan preset ke class Tailwind/CSS di HeroBlock.astro (dan
 * block lain saat rollout Phase 3.6.3+).
 */

export const imageFitOptions = [
  { label: 'Cover (fill & crop) — default', value: 'cover' },
  { label: 'Contain (fit whole image, may letterbox)', value: 'contain' },
  { label: 'Fill (stretch, may distort)', value: 'fill' },
  { label: 'Scale-down (contain but never upscale)', value: 'scale-down' },
]

// 9-arah grid untuk object-position — kontrol area image mana yang
// dipertahankan saat cropping.
export const imagePositionOptions = [
  { label: '↖ Top Left', value: 'top-left' },
  { label: '↑ Top Center', value: 'top' },
  { label: '↗ Top Right', value: 'top-right' },
  { label: '← Center Left', value: 'left' },
  { label: '● Center (default)', value: 'center' },
  { label: '→ Center Right', value: 'right' },
  { label: '↙ Bottom Left', value: 'bottom-left' },
  { label: '↓ Bottom Center', value: 'bottom' },
  { label: '↘ Bottom Right', value: 'bottom-right' },
]

/**
 * Reusable fit+position row builder — untuk block yang cuma butuh 1 image
 * di luar mediaFields (mis: Image, Gallery item).
 */
export const buildFitPositionRow = (condition?: any): Field => ({
  type: 'row',
  ...(condition ? { admin: { condition } } : {}),
  fields: [
    {
      name: 'imageFit',
      type: 'select',
      defaultValue: 'cover',
      options: imageFitOptions,
      admin: { width: '50%' },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'center',
      options: imagePositionOptions,
      admin: { width: '50%' },
    },
  ],
})

// Single row for fit+position — active untuk single image dan video poster.
// (imageSlider punya per-slide fit/position sendiri di dalam array.)
const singleFitPositionRow: Field = {
  type: 'row',
  admin: {
    condition: (_, siblingData) =>
      siblingData?.mediaType === 'single' || siblingData?.mediaType === 'video',
  },
  fields: [
    {
      name: 'imageFit',
      type: 'select',
      defaultValue: 'cover',
      options: imageFitOptions,
      admin: { width: '50%' },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'center',
      options: imagePositionOptions,
      admin: { width: '50%' },
    },
  ],
}

export const mediaFields: Field[] = [
  {
    name: 'mediaType',
    type: 'select',
    defaultValue: 'single',
    required: true,
    options: [
      { label: 'Single Image', value: 'single' },
      { label: 'Multiple Images (Slider)', value: 'multiple' },
      { label: 'Video', value: 'video' },
      { label: 'None (no media)', value: 'none' },
    ],
  },

  // ── single mode ─────────────────────────────────────────
  {
    name: 'singleImage',
    type: 'upload',
    relationTo: 'media',
    admin: { condition: (_, siblingData) => siblingData?.mediaType === 'single' },
  },
  // Fit + position — shown for both single mode AND video mode (poster/file frame).
  singleFitPositionRow,

  // ── multiple mode (slider/carousel) ─────────────────────
  {
    name: 'imageSlider',
    type: 'array',
    minRows: 2,
    maxRows: 10,
    admin: {
      condition: (_, siblingData) => siblingData?.mediaType === 'multiple',
      description: '2–10 images. Urutan drag & drop = urutan tampil. Fit & position bisa diset per-slide.',
    },
    fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      {
        type: 'row',
        fields: [
          {
            name: 'imageFit',
            type: 'select',
            defaultValue: 'cover',
            options: imageFitOptions,
            admin: { width: '50%' },
          },
          {
            name: 'imagePosition',
            type: 'select',
            defaultValue: 'center',
            options: imagePositionOptions,
            admin: { width: '50%' },
          },
        ],
      },
      { name: 'caption', type: 'text' },
    ],
  },
  {
    name: 'imageTransition',
    type: 'select',
    defaultValue: 'fade',
    admin: {
      condition: (_, siblingData) => siblingData?.mediaType === 'multiple',
      description: 'Animasi antar slide. Blur/Wipe/Parallax adalah preset premium untuk kesan cinematic.',
    },
    options: [
      { label: 'Fade (classic)', value: 'fade' },
      { label: 'Slide (horizontal)', value: 'slide' },
      { label: 'Zoom (Ken Burns)', value: 'zoom' },
      { label: '✨ Blur (cinematic crossfade)', value: 'blur' },
      { label: '✨ Wipe (curtain reveal)', value: 'wipe' },
      { label: '✨ Parallax (subtle depth)', value: 'parallax' },
      { label: 'None (instant jump)', value: 'none' },
    ],
  },
  {
    type: 'row',
    admin: { condition: (_, siblingData) => siblingData?.mediaType === 'multiple' },
    fields: [
      {
        name: 'transitionInterval',
        type: 'number',
        defaultValue: 5,
        min: 2,
        max: 20,
        admin: { width: '50%', description: 'Detik per slide (2–20).' },
      },
      {
        name: 'sliderAutoStart',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          width: '50%',
          description: 'Jika ON, transisi pertama langsung jalan saat load (tidak menunggu interval penuh). Cocok untuk continuous Ken Burns / smooth crossfade.',
        },
      },
    ],
  },

  // ── video mode ──────────────────────────────────────────
  {
    name: 'videoSource',
    type: 'select',
    defaultValue: 'url',
    admin: { condition: (_, siblingData) => siblingData?.mediaType === 'video' },
    options: [
      { label: 'URL (YouTube/Vimeo/direct .mp4)', value: 'url' },
      { label: 'Upload File', value: 'file' },
    ],
  },
  {
    name: 'videoUrl',
    type: 'text',
    admin: {
      condition: (_, siblingData) =>
        siblingData?.mediaType === 'video' && siblingData?.videoSource === 'url',
      description: 'YouTube (https://youtu.be/...), Vimeo, atau direct file URL (.mp4/.webm).',
    },
  },
  {
    name: 'videoFile',
    type: 'upload',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) =>
        siblingData?.mediaType === 'video' && siblingData?.videoSource === 'file',
    },
  },
  {
    name: 'videoPoster',
    type: 'upload',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) => siblingData?.mediaType === 'video',
      description: 'Fallback image sebelum video load. Rekomendasi: aspect ratio sama dgn video.',
    },
  },
  {
    name: 'videoOptions',
    type: 'group',
    admin: { condition: (_, siblingData) => siblingData?.mediaType === 'video' },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'autoplay', type: 'checkbox', defaultValue: true, admin: { width: '25%' } },
          {
            name: 'muted',
            type: 'checkbox',
            defaultValue: true,
            admin: { width: '25%', description: 'WAJIB true kalau autoplay=true.' },
          },
          { name: 'loop', type: 'checkbox', defaultValue: true, admin: { width: '25%' } },
          {
            name: 'controls',
            type: 'checkbox',
            defaultValue: false,
            admin: { width: '25%', description: 'Tampilkan play/pause.' },
          },
        ],
      },
    ],
  },

  // ── universal ───────────────────────────────────────────
  {
    name: 'lazyLoad',
    type: 'checkbox',
    defaultValue: true,
    admin: {
      condition: (_, siblingData) => siblingData?.mediaType !== 'none',
      description: 'Load media hanya saat mendekati viewport (recommended).',
    },
  },
]
