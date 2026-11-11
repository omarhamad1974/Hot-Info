# Admin redesign (Phase 18): easier editing
If a session ends: give Claude this file and the newest zip and say "continue with phase X".
Each phase is added on top of the previous one; the newest zip always has everything (without assets/).

Goals
1. Brand, Colors and Contact become sub-tabs of General.
2. English and Arabic are written side by side (no more EN | عربي switch). Empty Arabic = English is used, as before.
3. One place per website section: its texts (EN | AR), its items and its style (background, width, overlap, hide, animation).

Phases
- **P1** General has sub-tabs: Basics | Brand | Colors | Contact.  [DONE]
- **P2** Side-by-side engine: one data model (English file + Arabic file loaded together), every translatable field shows EN | AR, one Save writes both files, EN/AR switch removed. Covers News, Services, Team, Testimonials, Carousel, Countries, FAQ, Cards, Gallery, Page blocks, General basics, tagline, address, news categories.
- **P3** Page text and Interface text side by side (English reference | Arabic box), inside the Website area.
- **P4** "Sections" editor: every section of the site (home, about, patents, trademarks, translation) is one card with Content (its texts and items, EN | AR) and Style (background, width, overlap, hide, animation) together. Old Sections/Animation per-section pages are replaced by it.
