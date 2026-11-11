# Admin redesign (Phase 18): easier editing
If a session ends: give Claude this file and the newest zip and say "continue with phase X".
Each phase is added on top of the previous one; the newest zip always has everything (without assets/).

Goals
1. Brand, Colors and Contact become sub-tabs of General.
2. English and Arabic are written side by side (no more EN | عربي switch). Empty Arabic = English is used, as before.
3. One place per website section: its texts (EN | AR), its items and its style (background, width, overlap, hide, animation).

Phases
- **P1** General has sub-tabs: Basics | Brand | Colors | Contact.  [DONE]
- **P2** Side-by-side engine: one data model (English file + Arabic file loaded together), every translatable field shows EN | AR, one Save writes both files, EN/AR switch removed. Covers News, Services, Team, Testimonials, Carousel, Countries, FAQ, Cards, Gallery, Page blocks, General basics, tagline, address, news categories.  [DONE]
  - How it works: `D` = English data, `DA` = Arabic data kept in step with it (`mirror(D,DA)` after add/duplicate/delete/move). Arabic boxes use `data-p="ar:<path>"`. Save writes `app-data.json` and/or `app-data.ar.json`, only the ones that changed. Word/Markdown import merges into both.
  
- **P3** Page text and Interface text side by side (English reference | Arabic box), inside the Website area.  [DONE]
  - One tab "Site texts" with sub-tabs Page text | Interface text. English is a read-only box on the left, the Arabic box on the right, with a count of Arabic written. Both are in the Ctrl+K search.
- **P4** "Sections" editor: every section of the site (home, about, patents, trademarks, translation) is one card with Content (its texts and items, EN | AR) and Style (background, width, overlap, hide, animation) together. Old Sections/Animation per-section pages are replaced by it.  [DONE]
  - One tab "Sections": a "whole site" card (section width, bottom bar width, site animation) and one card per section (grouped by page). Each card has Content (EN | AR), Style and Animation blocks; bodies are built when a card is opened.
  - Content comes from: the data lists (carousel, services, news, testimonials, countries, team), General fields (home About text, HOT News count), the service linked to each service page, the fixed page texts and interface words found inside each `data-sec` of the page files.
  - Lists inside a section use the same add / duplicate / move / delete buttons (they carry `data-tab`).

## Image version (done with P4)
Every image address gets `?v=2` so browsers and the CDN fetch the newest file. The number lives in `tailwind-config.js` (`window.KIMG_V`, helper `kv()`) and in `admin.html` (`KIMG_V`, admin previews). After replacing a picture on GitHub under the same file name, change `2` to `3` in both places.
