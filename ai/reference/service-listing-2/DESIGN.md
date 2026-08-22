---
name: Tropical Concierge
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#3e4949'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#6e797a'
  outline-variant: '#bdc9c9'
  surface-tint: '#00696e'
  primary: '#006065'
  on-primary: '#ffffff'
  primary-container: '#0d7a80'
  on-primary-container: '#c7fbff'
  inverse-primary: '#7dd4db'
  secondary: '#8b500f'
  on-secondary: '#ffffff'
  secondary-container: '#ffb069'
  on-secondary-container: '#784100'
  tertiary: '#585651'
  on-tertiary: '#ffffff'
  tertiary-container: '#716e69'
  on-tertiary-container: '#f6f1eb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#99f1f7'
  primary-fixed-dim: '#7dd4db'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#ffdcc1'
  secondary-fixed-dim: '#ffb779'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6c3a00'
  tertiary-fixed: '#e6e2dc'
  tertiary-fixed-dim: '#cac6c0'
  on-tertiary-fixed: '#1d1b18'
  on-tertiary-fixed-variant: '#484642'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  display-accent:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-xl-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-padding-desktop: 80px
  section-padding-mobile: 48px
  grid-gutter: 24px
  container-max-width: 1200px
---

## Brand & Style

The design system is crafted for a premium, boutique travel agency specializing in high-end Balinese experiences. The brand personality is **sophisticated, tranquil, and curated**, aiming to evoke a sense of effortless luxury and tropical serenity.

The visual style follows a **Modern Corporate** approach with **Editorial** flourishes. It utilizes high-quality imagery as a foundational element, employing generous whitespace and refined typography to create an "unhurried" browsing experience. The interface balances the vibrancy of the Indonesian landscape with the clean precision of a professional service provider.

- **Minimalism:** Used in the structural layout to prevent information overload during travel planning.
- **High-End Travel Aesthetic:** Large-scale hero sections, elegant serif accents, and a light, airy atmosphere.
- **Professionalism:** Grounded by a structured grid and clear information hierarchy for high-trust services like property and private charters.

## Colors

The palette is inspired by the natural contrast of Bali’s coastlines and volcanic sunsets.

- **Primary (Deep Teal):** Represents the ocean and professional reliability. Used for primary actions, navigation headers, and brand-heavy backgrounds.
- **Secondary (Sun-Kissed Orange):** An accent color used sparingly for calls-to-action (CTAs) and highlights, evoking warmth and the golden hour.
- **Tertiary (Warm Sand):** A soft, off-white background color used to provide warmth and depth, moving away from "sterile" pure white to something more organic.
- **Neutral (Charcoal):** Used for primary text and iconography to ensure high legibility and a grounded feeling.

**Status Colors:**
- Success: #43A047 (Deep Green)
- Warning: #FFB300 (Amber)
- Error: #D32F2F (Deep Red)

## Typography

This design system uses a pairing of a sophisticated serif and a modern geometric sans-serif to create an editorial feel.

- **Noto Serif** is used for headlines to convey heritage, luxury, and authority. The "Display Accent" role is specifically for highlighting emotional keywords (e.g., "The *Perfect* Trip") to add a human, curated touch.
- **Plus Jakarta Sans** is used for all functional text, UI labels, and body copy. Its soft curves complement the friendly nature of Balinese hospitality while remaining highly readable in dense service listings.

**Usage Notes:**
- Maintain high contrast for body text against warm sand backgrounds.
- Use the `display-accent` role sparingly for narrative impact.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model for desktop to maintain a premium, centered focus, transitioning to a **Fluid Grid** for tablet and mobile devices.

- **Desktop (1200px+):** 12-column grid with 24px gutters. Large 80px vertical margins between major sections to emphasize whitespace and premium positioning.
- **Tablet (768px - 1199px):** 8-column grid with 20px gutters and 32px side margins. 
- **Mobile (< 768px):** 4-column grid with 16px gutters and 16px side margins. 

**Island Filtering & Listings:**
Filtering systems for islands (Ceningan, Lembongan, etc.) should be presented as a horizontal scrolling pill-bar on mobile and a sidebar or top-aligned button group on desktop. Service listings use a card-based layout that shifts from 4 columns (desktop) to 2 columns (tablet) and 1 column (mobile).

## Elevation & Depth

Visual hierarchy is established primarily through **Tonal Layers** and **Ambient Shadows** to mimic the soft lighting of the tropics.

- **Level 0 (Base):** The `tertiary` (Warm Sand) background.
- **Level 1 (Cards/Surface):** Pure white surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)). This creates a "floating" effect without feeling heavy.
- **Interactions:** On hover, cards should lift slightly (transition to 0px 8px 30px rgba(0,0,0,0.08)) to indicate interactivity.
- **Navigation:** The header uses a semi-transparent blur (Glassmorphism) when scrolling over image-heavy sections to maintain legibility while keeping the "outdoor" feel of the imagery.

## Shapes

The design system uses a **Rounded** shape language to reflect the organic, approachable nature of the destination.

- **Standard Radius:** 0.5rem (8px) for buttons and input fields.
- **Card Radius:** 1rem (16px) for service and property cards to create a softer, high-end look.
- **Feature Radius:** 1.5rem (24px) for prominent hero elements or containers that hold testimonials.
- **Buttons:** Primary buttons use the standard radius, while secondary "Ghost" buttons or filters can use a more aggressive `rounded-xl` or pill-shape to distinguish them from functional inputs.

## Components

### Buttons
- **Primary:** Solid `primary_color_hex` with white text. 8px radius.
- **Secondary:** Solid `secondary_color_hex` with white text, used for high-conversion actions like "Book Now".
- **Ghost:** `primary_color_hex` border and text with transparent background, used for secondary actions like "View Details".

### Filtering System (Islands)
- **Selection Chips:** Pill-shaped (`rounded-xl`) with `tertiary_color` background. Active state uses `primary_color` with white text.

### Cards (Service & Property)
- **Structure:** Top-aligned image (16:9 ratio), followed by a 16px padded content area.
- **Typography:** Use `headline-sm` for titles and `body-md` for descriptions.
- **Iconography:** Use thin-stroke, circular-contained icons in the primary teal color for service categories.

### Input Fields
- **Style:** 1px solid border in a muted neutral-grey. Focus state uses a 2px `primary_color` border. 
- **Labels:** Use `label-md` positioned above the input field for clarity.

### Navigation
- **Top Bar:** High-contrast teal for urgency (e.g., "WhatsApp Booking").
- **Main Nav:** Clear serif text for top-level links with a subtle underline indicator for active states.