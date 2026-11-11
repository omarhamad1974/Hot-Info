# Phase 17: bring the rest of content-system into the site, and finish the tender admin
If a session ends: give Claude this file and the newest zip and say "continue with phase X".
Each phase is added on top of the previous one; the newest zip always has everything.

## Part 1: new content types (faq, items, gallery, section, site)
Data shapes (app-data.json, Arabic overlay in app-data.ar.json):
- `faq`     -> `faq[]`:     id, group, question, answer            (ar: question, answer)
- `items`   -> `cards[]`:   id, group, title, description, icon, image, link, badge, price, ctaText, ctaLink   (ar: title, description, badge, ctaText)
- `gallery` -> `gallery[]`: id, group, image, caption, alt         (ar: caption, alt)
Entries are matched by group + title (gallery: group + picture name) so importing twice updates instead of duplicating.

- **A (parser + export + tests)**: content-import.js, tests, IMPORT-GUIDE + templates. No screens yet.  [A: DONE in this zip]
- **B (import screen + pictures)**: admin-import.js: preview, pictures for cards and gallery, Word import.  [B: DONE in Phase17B zip]
- **C (admin editing)**: Website content tabs to add, edit, reorder, delete FAQ, Cards, Gallery entries; validate.js knows the new sections.  [C: DONE in Phase17C zip]
- **D (public site)**: render FAQ (accordion) and Gallery on the site (a "Sections" block that picks a group), Arabic included.
- **E (section + site)**: decide how `section` (page text blocks) and `site` (name, contact, social) map to the existing page-text and brand/contact settings.

## Part 2: tender admin (Revise & publish)
- **T1**: Revise tab: find duplicates (same entity + description + dates), compare side by side, keep one.
- **T2**: Revise tab: last entered tenders with pagination, quick edit, publish.
- **T3**: Send notifications to the subscribers of the concerned sectors from Revise.
- **T4**: Remove the old unreachable "Read & name" and Newspaper images code (separate, testable step).
