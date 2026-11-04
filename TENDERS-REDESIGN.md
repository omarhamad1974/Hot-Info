# Tenders redesign v2 (supersedes the T1 to T5 tab layout in TENDERS-PLAN.md)
If a session ends: give Claude this file and the latest zip and say "continue with Phase N".
Each phase is added on top of the previous one; the newest zip always has everything.

## Tabs (admin top bar)
1. **Input tender**: scan + read in ONE table. Image upload / camera, Excel import (template), typed rows, OCR per row or selected rows, column cutter (1 to 4 columns, read right to left).
2. **Classification & notification**: sectors (auto-classify by keywords, confirm), approve, notification update.
3. **Settings**: what is featured on the website (Hot News slider etc.).
4. **Generate file**: PDF / Excel / Word, default = tenders published today, date-range picker, all columns except sector / grouped items.

## Rules decided
- OCR text goes ONLY into Description. No automatic mapping of text to other cells.
- No auto-fill: new rows and imported rows are not filled from the row above or from the details bar. Empty stays empty.
- Excel import uses the template (Template button). No column mapping screen.
- Done (Input -> Classification) needs entity + description only. Sectors are chosen in tab 2.

## Phase 1 (DONE): Input tender + 4-tab skeleton
- admin.html only. No new SQL. Needs the existing step15, step16, step17, step18 (workflow) and step9 (columns) SQL already run.
- Old "Read & name" screen (internal tStep 1) and Newspaper images pipeline are no longer reachable from the menu (code kept).
- Tabs 3 and 4 show a "coming soon" placeholder.
## Phase 2 (DONE): Classification polish + Settings tab
- Tab 3 Settings: list of tenders featured in the Hot News slider (Remove), search + Feature for approved tenders with confirmed sectors, and a button to the website content (General) where "tenders per sector" is edited.
- Tab 2: slider star column and slider filter removed (moved to Settings); new filter "Needs sector" and bulk "Confirm sectors (selected)". Auto-classify, approve, notification update unchanged.
- admin.html only, no SQL (uses tenders.hot_featured from step18).
## Phase 3 (DONE): Generate file
- Tab 4. Date range (default today) on the PUBLISHING date, status filter (All / Approved / Drafts), column checkboxes, quick ranges (Today, Yesterday, Last 7 days, This month), live preview.
- Excel (.xlsx, right-to-left sheet), Word (.doc, HTML that Word opens, landscape, RTL), PDF (print window: choose Save as PDF; keeps Arabic shaping correct).
- Flat table, one row per tender, sorted by publishing date; no sector, no grouping. admin.html only, no SQL.
## Phase 4 (next): Cleanup (remove old screens), bulk actions, manual and README
