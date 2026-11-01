# Phase 14: Directory (companies, institutions, freelancers)

Keep this file. If a session ends, give it (with the zip) to Claude and say "continue with phase 14b".

## Decisions
- One sector per entry (a dropdown, not several).
- Entries need approval: status pending > approved (shown) or rejected (hidden). Public sees approved only.
- Directory sectors are their own list (`directory_sectors`, English + Arabic names), separate from the tender sectors.
- Pictures live in a public bucket `directory-images` (1 MB each) so free visitors can see them.
- WhatsApp numbers are stored as digits with country code (e.g. 201001234567).

## 14a: Database (DONE)
- `supabase-step14-directory.sql`: tables `directory_sectors` (13 starters) and `directory_entries`, access rules, picture bucket.
- Nothing changes on the site yet.

## 14b: Admin Directory tab (DONE, this zip)
- New **Directory** tab in admin.html (top bar): list with search and filters (status chips, sector, type), add/edit form, picture upload (shrunk automatically to fit 1 MB),
  Approve / Reject / Unpublish buttons, delete, and a **Sectors** manager (add, rename, Arabic name, delete when unused).
- WhatsApp numbers are cleaned (01001234567 becomes 201001234567); website and social links get https:// added.
- Files: admin.html only.

## 14c: Public list page (DONE, this zip)
- New directory.html (open to everyone, no sign-in): cards with picture, type, sector, offer badge, city, phone, WhatsApp button, website and social icons.
- Filters: type chips, search (Arabic-friendly), sector, "special offers only", result count, clear. 24 cards at a time + Show more.
- English and Arabic (strings added to lang.js, editable in the admin Interface text tab). Directory link added to the header menu of every page and to the bottom bar (footer.js).
- Files: directory.html (new), lang.js, footer.js, and the header menu of index, about, patents, trademarks, translation, my-stuff, tenders.
- Not yet: the Details button (arrives with 14d).

## 14d: Detail page (DONE, this zip)
- New directory-entry.html?id=...: standard layout for every entry: big picture, type and sector, name (Arabic or English), special offer box (until its end date), About text (supports ** ## - formatting), and a Contact card with WhatsApp, phones, email, address + Google Maps link, website and social page.
- On the list page the picture, the name and a new Details link open it. Only approved entries open; anything else shows "This entry is not available".
- Files: directory-entry.html (new), directory.html, lang.js.

## 14e: Import and polish (DONE, this zip)
- **Excel / CSV import** in admin > Directory: **Import from Excel** and **Template** buttons. Columns (English or Arabic headers): Name, Name (Arabic), Type, Sector, City, Address, Phones, WhatsApp, Email, Website, Social media page, Description, Offer title, Offer details, Offer valid until.
  Preview before saving: counts, skipped rows with the reason, duplicates skipped (same name + city, or same WhatsApp), unknown sector goes to "Other", lost leading 0 of Egyptian numbers restored. Entries arrive as Pending approval, or Approved if the box is ticked. Pictures are added later per entry.
- **Offers first**: on directory.html entries with a running offer come first, then A to Z (also while searching).
- **Share button**: on every card and on the entry page (phone share sheet; copies the link on desktop). New texts `dir_share`, `dir_copied` in lang.js (English and Arabic).
- **Validator**: `scripts/validate.js` now checks that both directory pages and the step 14 SQL exist and that every `dir_` text used by the pages is written in English and Arabic in lang.js.
- Files: admin.html, directory.html, directory-entry.html, lang.js, scripts/validate.js.
- Known limit: a shared link shows no picture preview in WhatsApp (the page is built in the browser). Fixing that needs a server-side page; not planned.

## 14f: businesses submit their own entry (DONE, this zip)
- New public page **submit-directory.html** (no sign-in): the same fields as the admin form (no picture), an optional special offer, and the submitter's own contact details (private). English and Arabic. Linked from a new **Add your business** button on directory.html.
- `supabase-step14f-submissions.sql`: visitors get no table access. They can only call `submit_directory_entry()`, which validates everything, forces status Pending, never sets a picture, skips a name+city already listed or waiting, and stops after 30 submissions per hour for the whole site. The submitter's contact details go to a separate admin-only table `directory_submitters`.
- Admin > Directory: self-submitted entries show a purple "Self-submitted" pill and a "Submitted by" line (name, phone, email). Approve / Reject work as before.
- Spam: a hidden field and a 4-second minimum fill time (robots get a fake "thank you" and nothing is sent).
- Files: submit-directory.html (new), supabase-step14f-submissions.sql (new), directory.html, admin.html, lang.js, scripts/validate.js.

## Phase 14 is complete.
Ideas for later: email or WhatsApp alert to you when a submission arrives, submitters adding a picture, a "claim / edit my entry" link, Excel export of the directory.
