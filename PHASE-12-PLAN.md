# Phase 12: brand and design controls (plan and progress)

Keep this file. If a session ends, give it (with the zip) to Claude and say "continue with phase 12b".

## Done
- **12a (this zip): Brand**
  - Logo uploaded once, used tiny in the header, on the home page and on the About page (`brand.image`, `brand.js`).
  - Name after the vertical line is editable, English and Arabic (`brand.tagline`).
  - 7-color brand palette with default values (`theme.brand`), pickable in every color list as `brand:1` ... `brand:7`;
    button "Use this palette for the whole site" fills the Colors tab.
  - Fonts for H1, H2, H3 and body, each with a color; 27 built-in fonts (Google and system, with Arabic-friendly ones),
    plus your own uploaded fonts (`theme.fonts`, `theme.customFonts`, files in `assets/fonts/`).
  - Where: admin.html > Website content > **Brand** tab. Applied by `theme.js` and `brand.js`.

## Done (continued)
- **12b (this zip): Layout and contact**
  - Show / hide every section of every page (one switch per section).
  - Section width separately for tablet and desktop (today there is one global width).
  - Backgrounds: color (brand palette already selectable) or image, as today, in one place with the width and visibility.
  - Contact details (phones, emails, addresses), the WhatsApp business number and all social media links
    editable in one "Contact" tab and used by the footer bar, the About page and the header icons.
  - Where: admin.html > **Sections** tab and **Contact** tab. Applied by theme.js, contact.js, footer.js.
  - Files touched: theme.js, contact.js, styles.css, footer.js, lang.js, admin.html, all public pages, app-data.json (contact block), scripts/validate.js.

## Next
- **12c: Animation**
  - Animation type per section and per card group: standard (none, fade, fade-up, slide left/right, zoom)
    and advanced (duration, delay, stagger between cards, easing, play once or every time, hover effects).

## Files touched in 12a
theme.js, brand.js, styles.css, admin.html, all public .html pages (header), app-data.json (brand block),
scripts/validate.js, supabase/functions/* (earlier tender fixes), supabase-step12-repair.sql.
