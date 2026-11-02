# Admin improvements (one by one)

Keep this file. If a session ends, give it (with the zip) to Claude and say "continue with the next admin improvement".

| # | Improvement | State |
|---|---|---|
| 1 | "What's waiting" counters at the top of Tenders | DONE (this zip) |
| 9 | Real build number in the admin footer | DONE (this zip: "01-Nov-k") |
| 3 | Bulk approve the clean rows (no warnings) | DONE (this zip) |
| 4 | Warnings in the review table (past date, missing price, duplicate, unknown entity) | DONE (this zip) |
| 2 | One button read-text + make-rows, and batch processing | DONE (this zip) |
| 5 | Checklist and history before "Send tender notification update" | DONE (this zip) |
| 6 | Usage meters (OCR.space, Groq) at the top | DONE (this zip) |
| 7 | Repeated OCR fixes dictionary, layout memory per newspaper | dropped for now (not wanted) |
| 8 | Split admin.html into smaller files | dropped for now (not wanted) |
| 10 | Grouped top bar with red count badges | DONE (this zip, badges only; no grouping needed with 4 tabs) |
| 11 | Search across everything | DONE (this zip) |
| 12 | 30-day bin for deletes, Excel export buttons | Excel export DONE (this zip); bin dropped (not wanted) |
| 13 | One-line hint per tab | DONE (this zip) |

## 1. The counters (Tenders, Images and By sector screens)
Five boxes under the Tenders buttons, left to right = the order of the work:
1. **Waiting for text**: images whose text was not read yet. Click = list only those images.
2. **Text read, no rows**: text is ready, rows not made. Click = list only those.
3. **Rows to review**: images with rows waiting for approval. Click = list only those (press Review on each).
4. **Sector to confirm**: approved tenders whose sector is not confirmed (all dates). Click = opens By sector, approved tenders, all dates, with the Unclassified group open.
5. **Ready to notify**: tenders visible since the last notification update. Click = the same as the Send tender notification update button.
A grey box with a green tick = that stage is finished. Click an active box again (or "Show all images") to remove the filter. Counts come straight from the database, so they are not limited to the latest 60 images.
No SQL to run. Only admin.html changed.

## 3 and 4. Tags and "Approve clean" (review screen of one image)
Every row now shows tags (cards: under the number; table: new **Check** column). They update as you edit.
- **Red** (must fix): no entity, no subject.
- **Amber** (check it): subject very short; session date missing, not read, already passed, year guessed, or day/month swapped; booklet price empty; entity looks like a known one (did you mean); **possible duplicate** (same session date, nearly the same entity and subject, in the same image or in tenders entered in the last 30 days: it names the paper, page and date).
- **Grey** (information only): session date "not stated", price text with no number, new entity.
- **Looks clean** = no red or amber tag.
New buttons in the top bar of the review screen: **Warnings only** (hides the clean rows) and **Approve clean (N)** (approves only the rows with no red or amber tag; the rest stay drafts). The summary line also shows how many rows have warnings. **Approve all** still works as before.
Duplicate check needs a session date; rows without one are not compared. No SQL to run. Only admin.html changed. Footer build number: 01-Nov-k.

## 2. One button: read the text + make the rows (and batch)
- **Single image**: in the Read text window there is a new **Read + make rows** button. If the image has no text yet it reads it (OCR.space; if that fails, Groq AI once), then turns it into rows, in one go. If there is already text (or you typed some), the reading is skipped. The "several tenders" box is respected. Existing draft rows are replaced (approved rows stay), with the same warning as before.
- **All waiting images**: under the five counters a new button **Read + make rows for all waiting (N)** appears (N = images "Waiting for text" + "Text read, no rows"). It opens a window where you choose the reader (OCR.space, Groq or Gemini), whether to try another reader if one fails, whether the images hold several tenders (default: one image = one tender), and oldest/newest first.
- It works through the images one after the other (about 20 to 60 s each) and lists each one: rows made, which reader, how many need a closer look, or the error. A failed image is skipped, stays where it was, and can be retried. **Stop** finishes the current image and stops. Keep the window open while it runs; closing it also stops it.
- Rows are always saved as **drafts**; nothing is published until you review and approve them (use **Approve clean** from improvement 3 to speed that up). At the end press **Close and go to review**: the counters refresh.
- Uses at most 200 waiting images per run (oldest first); run it again for more.
No SQL to run. Only admin.html changed. Footer build number: 01-Nov-k.

## Wording change
In the tender screens the new buttons no longer say "rows": **Read text + add tender** (one image), **Read text + add all waiting tenders (N)** (batch) and **Add tender to tenders table** (was "Turn into rows"). The review table itself is unchanged.

## 5. Checklist and history before sending the notification
**Send tender notification update** now opens a window instead of a plain question:
- Checklist: images waiting for text, text with no tender added, tenders waiting for approval, approved tenders with an unconfirmed sector, and how many new tenders will be announced. Green tick = done, amber = something is left. Warnings do not block sending.
- Optional note (for you only) saved with the update.
- History: the last 10 updates with date, how many tenders each one announced, and the note.
No SQL to run (uses the existing `tender_broadcasts.note` column). Only admin.html changed. Build 01-Nov-k.

## 6. Usage meters
Four small meters under the five counters (Images screen): OCR.space this month of 25,000 (bar turns amber at 70% and red at 90%), Groq AI and Gemini this month with today's count, and images uploaded this month of about 1,000. Counts come from the existing `ocr_log` table and update as you read images. "Today" uses the UTC day. No SQL to run. Only admin.html changed. Build 01-Nov-k.

## 10 and 13. Red badges and a hint line in the dark top bar
- **Tender images** shows a red number = images waiting for you (waiting for text + text with no tender added + tenders to approve). **Directory** shows a red number = entries waiting for approval. They refresh when you sign in, open the tender screens, or approve/reject a directory entry. Hidden when 0.
- A small grey line under the top bar describes the tab you are on.
- Grouping the tabs was left out: there are only four visible tabs (Leads and HOT Info Issues are still hidden). No SQL to run. Only admin.html changed. Build 01-Nov-k.

## 15. The brand logo also shows in the admin bar
The logo chosen in General > Logo now replaces the "KH" box at the left of the dark top bar of the admin page. It updates as soon as you pick or change the logo (before saving), and falls back to "KH" if the image cannot load. Only admin.html changed. No SQL.

## 14. Progress bars while reading images, and a width slider for each section
**Progress while reading and adding tenders** (Tender images)
- Every slow step now shows a bar with "Step x of y", what is happening, the seconds passed and a percentage: reading the text (one image, columns, or from the browser), "Read text + add tender", Add tender to tenders table, Preview rows, and "Read the rows again" on the review screen (a small card at the bottom of the screen there).
- The bar moves by estimate and stays under 100% until the step really ends. After about 1.5 times the usual time it says it is taking longer but still working. It turns green when done and red if it stops.
- **Read text + add all waiting tenders** (batch) has an overall bar: "Image 3 of 12", the percentage, time passed and an estimated time left that improves as images finish.

**Width of each section**: the Tablet and Desktop drop-downs inside each section (Colors > Sections) are now sliders (50 to 100%). Tick **Same as site** to follow the whole-site width. Saved per section as before.
No SQL to run. Only admin.html changed.

## 13. Import a Markdown (.md) file into any text box
Every formatted text box in the Website content area (news "Full article" and "Short summary", services, About text, and so on, in English or Arabic) has a new **Import .md** button next to B, H and the bullet button.
- Only the **structure** is imported. Fonts, colours and sizes always come from the site.
- `# Title` becomes the item's Title if that box is still empty (otherwise a subtitle). `##`, `###` and deeper become subtitles (the site has one subtitle level). Paragraphs, `-`, `*`, `+` and numbered lists (become bullets), and **bold** are kept. Italic, links, images, code marks, quotes, rules and tables are simplified to plain text; the text of links and tables is kept.
- If the box already has text you choose: OK = replace, Cancel = add after it. Then check the text and save as usual.
- File limit 1 MB, UTF-8 (Arabic works). No SQL to run. Only admin.html changed.

## 12. Excel export buttons (the 30-day bin was dropped)
- **Directory > Export to Excel**: downloads exactly the entries you see (status chips, search, sector and type filters apply). Columns match the import template plus Status, Submitted by and Added on.
- **Tenders > By sector > Export to Excel (N)**: downloads the tenders of the current period and filter (entity, subject, sectors, confirmed, booklet price, session date and time, bid bond, link, paper, page, publish date, status). The sheet opens right-to-left for Arabic.
- Subscriptions export already existed under Users & sectors.
No SQL to run. Only admin.html changed. Build 01-Nov-k.

## 11. Search across everything
New **Search** button in the dark top bar (or press **Ctrl+K**). Type 2 or more letters; results appear as you type, grouped:
- **Users**: name, email, mobile, company.
- **Tenders**: entity or subject (Arabic works). Click = opens that tender's image in the review screen.
- **Tender images**: newspaper name. Click = opens its review screen.
- **Directory**: name, Arabic name, city, email, WhatsApp. Click = opens the Directory tab filtered to it.
Users are searched among the users already loaded; the rest are searched in the database (up to 8 per group). No SQL to run. Only admin.html changed. Build 01-Nov-k.
