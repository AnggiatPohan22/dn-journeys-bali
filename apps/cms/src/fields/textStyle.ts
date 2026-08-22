import type { Field } from 'payload'

/**
 * Reusable per-element text style field group generator.
 *
 * Dipakai di block yang punya text (Hero, CTA, Image, Gallery, RichText,
 * FAQ, dst). Setiap element (heading/subheading/paragraph/caption/dst)
 * dapat control color + animation-in sendiri, dgn default 'inherit'
 * supaya block-level entryAnimation di Advanced tab tetap berlaku.
 *
 * USAGE:
 *   Di block definition (tabs Advanced):
 *     buildTextStyleField(['heading', 'subheading'])
 *
 *   Frontend consume via block.textStyles.headingColor / headingAnimIn.
 */

const textColorOptions = [
  { label: '◽ Inherit (from block/theme)', value: 'inherit' },
  { label: '🟦 Ocean (primary teal)', value: 'ocean' },
  { label: '🟧 Coral (accent orange)', value: 'coral' },
  { label: '🟩 Leaf (secondary green)', value: 'leaf' },
  { label: '🟨 Sand (warm cream)', value: 'sand' },
  { label: '🟪 Stone (neutral)', value: 'stone' },
  { label: '⬛ Midnight (darkest)', value: 'midnight' },
  { label: '⬜ White', value: 'white' },
]

const textAnimInOptions = [
  { label: 'Inherit (from block Advanced)', value: 'inherit' },
  { label: 'None (no animation)', value: 'none' },
  { label: 'Fade', value: 'fade' },
  { label: 'Fade Up', value: 'fade-up' },
  { label: 'Fade Down', value: 'fade-down' },
  { label: 'Zoom In', value: 'zoom' },
  { label: 'Slide from Left', value: 'slide-left' },
  { label: 'Slide from Right', value: 'slide-right' },
  { label: 'Blur In', value: 'blur' },
]

export type TextElement =
  | 'heading' | 'subheading' | 'paragraph' | 'description'
  | 'caption' | 'eyebrow' | 'quote' | 'label'

/**
 * Build a `textStyles` group field with per-element color + animIn rows.
 * All fields default to 'inherit' → block-level defaults win when not set.
 */
export const buildTextStyleField = (elements: TextElement[]): Field => ({
  // Short group name (`ts`) prevents Payload's 63-char identifier limit
  // being exceeded on enum names for blocks with long table names. Full
  // name `textStyles` would generate enum names like
  // `enum_pages_blocks_value_props_banner_text_styles_subheading_color` (65).
  // With `ts`: `enum_pages_blocks_value_props_banner_ts_subheading_color` (54).
  // Frontend accesses via `block.ts.headingColor` etc.
  name: 'ts',
  type: 'group',
  label: 'Text Styles',
  admin: {
    description: 'Warna & animasi masuk per-element. Default "Inherit" = pakai theme/block-level.',
  },
  fields: elements.flatMap((el) => [
    {
      type: 'row' as const,
      fields: [
        {
          name: `${el}Color`,
          type: 'select' as const,
          defaultValue: 'inherit',
          options: textColorOptions,
          admin: { width: '50%', description: `Warna ${el}` },
        },
        {
          name: `${el}AnimIn`,
          type: 'select' as const,
          defaultValue: 'inherit',
          options: textAnimInOptions,
          admin: { width: '50%', description: `Animasi masuk ${el}` },
        },
      ],
    },
  ]),
})
