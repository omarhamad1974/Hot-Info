# Phase 13: dynamic menu, HOT News, one-step tender reading and duplicate check

Keep this file. If a session ends, give it (with the zip) to Claude and say "continue with phase 13b".

## 13a: Menu and the name HOT News (DONE, this zip)
- The Jurisdictions section is now called **HOT News** (English) / **أخبار HOT** (Arabic) in the section title,
  the header menu, the bottom bar and the Sections list. (Its content is still the country cards until 13b.)
- New **Menu** tab in admin.html: one list of items drives the menu at the top of every page and the bottom bar.
  Each item: name in English and Arabic, destination, icon, shown in top menu / bottom bar / hidden, order, add, delete.
  Until "Customise the menu" is pressed, the pages keep their built-in menus.
- Files: menu.js (new), footer.js, lang.js, theme.js, index.html (+ script tag on all pages), admin.html, scripts/validate.js.
- Data: app-data.json > menu.items[] {id,en,ar,link,icon,header,bar,hidden}.

## 13b: HOT News content (DONE, this zip)
- The home section HOT News now lists **sectors** (with the number of active tenders) instead of countries. Under the chosen
  sector: the main description (max 3 lines on a phone) and the **publishing entity** of the newest active tenders, and a
  "See all tenders" button. Arabic sector names (new "ع" button in the sector list) and a "tenders per sector" setting (General tab).
- Database: `supabase-step13-hot-news.sql` adds `sectors.name_ar` and the public function `hot_news(p_per)`, which exposes only
  description and entity of Approved + sector-Confirmed tenders that are still active.
- Files: index.html, lang.js, admin.html, scripts/validate.js, supabase-step13-hot-news.sql, HOT-NEWS-STEPS.md.

## 13c: One-step reading and duplicate check (NEXT)
- One button in the tender image window: read the text (OCR) and turn it into rows in one step (no more two buttons).
- When the text of a new tender is ready, compare it with tenders entered in the last 30 days and mark possible
  duplicates; the admin can **reject** (delete the new one / do not save it) or keep it.
