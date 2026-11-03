# Tenders redesign (Phases T1 to T5)

Keep this file. If a session ends, give it (with the latest zip) to Claude and say "continue with phase T2".
Rule: every phase is added to the previous full version, so the newest zip always has everything.

## Decisions
- The admin top-bar tab **Tender images** is renamed **Tenders**. Its default screen is a spreadsheet-like table (Arabic data entry).
- The older screens are kept, as sub-views next to the table: **Tenders table** (new, default) | **Newspaper images** (the old Images/OCR/review pipeline) | **By sector**.
- The table writes to the same `tenders` table the rest of the system already uses (entity, subject = the description, publish_date, session_date, booklet_price, bid_bond, status, sector_ids, sectors_confirmed). New column: `governorate`.
- Entities come from the existing `known_entities` list (Entities button). Governorates are a fixed list of the 27 Egyptian governorates plus "All governorates" (in the admin code).
- A row is shown to subscribers only when it is Approved and its sectors are Confirmed (unchanged rule). In the table, the **Publish** button approves the row; the **Sector** cell picks the sectors and confirms them.
- Public "More" (T4) shows the full description, entity, governorate, publishing date and session date. Booklet price, bid bond, link and documents stay for subscribers only (change in step16 if you want otherwise).

## T1: Tenders tab and the table (DONE)
- `supabase-step15-tenders-table.sql` (new): column `governorate`.
- Tab renamed Tenders (icon gavel). Sub-nav: Tenders table | Newspaper images | By sector. Pipeline counters and usage meters appear only in Newspaper images.
- Table: one row per tender; cells edit in place and save when you leave them. Entity (type-ahead from the entity list, "known / did you mean / new" hint), Governorate (drop-down), Publishing date and Session date (calendar), Description (wide Arabic text box, grows as you type), Booklet price, Bid bond, Sector (chips + picker), Publish toggle, row buttons (delete; "Read from image" arrives in T2).
- New row copies the publishing date and governorate of the row above. Keyboard: Tab moves right, Enter in a one-line cell moves down, Ctrl+Enter adds a row.
- Search (Arabic-friendly) and a status filter (All | Draft | Published | Needs sector).
- Files: admin.html, supabase-step15-tenders-table.sql.

## T0: Admin tidy-up (DONE, this zip)
- The global **Search** button (and Ctrl+K) is hidden for now. To bring it back: un-comment the button in the top bar and set `SEARCH_ON=true` in admin.html.
- The Tenders table uses the full screen width; its toolbar is one line (count, search, filters, Dictionary, Entities, Add row); the long help text became a 3-step "How to enter tenders" fold-out.
- Newspaper images: source paper, page, date and the four buttons (Choose image, Take photo, Keywords, Entities) now sit on one line.

## T2: Read from image, per row (DONE, this zip)
- Every row has a **قراءة من صورة** button: **Choose image** or **Take photo**. The picture is shrunk to fit 1 MB (optional "Brighten paper"), stored in the private `tender-images` bucket (a `tender_images` row with source "Tenders table"), and read by the existing `ocr-tender` function: OCR.space first, then Groq, then Gemini if "Try another reader" is ticked.
- The text goes into the row's **Description** (lines joined into one paragraph, Arabic digits converted like the rest of the table). The raw reading is kept in `tenders.raw_text` and the picture is linked by `tenders.image_id`. If the row already has a description you choose: OK = replace, Cancel = add after it.
- A row that was never saved is saved first as a draft. After reading, a picture button on the row opens the picture again.
- No SQL needed (uses step3 columns). Files: admin.html.

## T3: Words outside the Arabic dictionary (DONE, this zip)
- Unknown words in the Description are underlined in red while typing and after reading from an image; a red chip list under the cell shows them. Click a chip (or double-click the word) = **Add to dictionary** or **Ignore**.
- Dictionary = built-in starter vocabulary of tender language (`tender-dict.js`, about 900 words) + every word in PUBLISHED tenders + entity names + words you add/ignore + an **uploaded word list** (Dictionary button: plain text one word per line, or a Hunspell `ar.dic`). A word also counts as known with a common prefix or ending (والتوريد, للمناقصة, مناقصاتها...).
- IMPORTANT: the built-in list is only a starter. Upload a large Arabic word list once (Dictionary button) for good coverage. It could not be downloaded in the building session.
- `supabase-step16-tender-words.sql` (new): tables `tender_words` and `tender_dict_chunks` (admin only). Without it everything still works; added words are then kept in this browser only.
- Files: admin.html, tender-dict.js (new), supabase-step16-tender-words.sql (new).

## T4: Front page preview (DONE, this zip)
- HOT News cards on index.html show at most 50 words of the description (then ...), the publishing entity and the publishing date, and a **More** button. **More** opens the whole tender: entity, publishing date, governorate, session date and the full description. Booklet price, bid bond and documents stay for subscribers.
- `supabase-step17-hot-news-more.sql` (new): `hot_news()` also returns publish date, governorate and a longer description; new public function `hot_tender(id)` (only for active, approved, sector-confirmed tenders).
- Strings `hot_more`, `hot_pub`, `hot_entity`, `hot_gov`, `hot_session`, `hot_gone`, `hot_sub_only` in English and Arabic (lang.js).
- Files: index.html, lang.js, supabase-step17-hot-news-more.sql. Until step17 is run, the cards still show but without dates and More shows the preview text.

## T5: Polish (NEXT)
- Excel export/import of the Tenders table, bulk publish, paging for old rows, manual and README.
- Optional: the same 50-word preview + More on tenders.html for subscribers; spell-check also on the Entity cell.
- Run order for the new SQL: step15 (if not yet), step16, step17.
