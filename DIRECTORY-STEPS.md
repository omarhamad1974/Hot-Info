# Phase 14: Directory

## 14f (this zip): businesses add their own entry
1. **Run the SQL:** Supabase > SQL Editor > New query > paste `supabase-step14f-submissions.sql` > Run. It prints `0` and a row `submit_directory_entry | t`. (Safe to run again.)
2. **Upload** this folder to GitHub (new: `submit-directory.html`, `supabase-step14f-submissions.sql`; changed: `directory.html`, `admin.html`, `lang.js`, `scripts/validate.js`). Wait 1-2 minutes.
3. Open `directory.html`: there is an **Add your business** button. It opens `submit-directory.html` (you can also share that link directly, for example on WhatsApp).
4. Fill the form as a visitor (stay on the page at least 4 seconds, or it is treated as a robot). Required: name, type, sector, and a phone or email of yours (private).
5. In admin > Directory the new entry is **Pending approval** with a purple "Self-submitted" label and who sent it. Open it to complete it (add a picture, fix the text), then **Approve**, or **Reject**.
6. Limits: 30 submissions per hour for the whole site; the same name + city is not added twice.

## 14e (this zip): Excel import, offers first, share
1. **Upload** this folder to GitHub (changed: `admin.html`, `directory.html`, `directory-entry.html`, `lang.js`, `scripts/validate.js`). No SQL to run. Wait 1-2 minutes.
2. Admin > Directory > **Template**: downloads `directory-template.xlsx` (example rows, and a second sheet listing your sectors).
3. Fill it in (one row per entry; only Name is required), save, then press **Import from Excel** and choose the file.
4. A preview shows how many will be added and why any rows are skipped. Tick "Publish them right away" only if you have already checked the list; otherwise they arrive as **Pending approval** and you approve them in the list.
5. Sector: write the English or Arabic name exactly as in the Sectors list. Unknown or empty sectors go to "Other". Type: Company, Institution or Freelancer (or شركة / جهة / مستقل); empty means Company.
6. Offer valid until: a date (2027-06-30 or 30/06/2027); empty = no end date. Entries with a running offer now appear first on the public Directory.
7. The **share** icon on each card and on the entry page opens the phone's share sheet (on a computer it copies the link).

## 14d (this zip): the entry detail page
1. **Upload** this folder to GitHub (new: `directory-entry.html`; changed: `directory.html`, `lang.js`). Wait 1-2 minutes.
2. Open `directory.html`, press **Details** on a card (or its picture or name). The page opens at `directory-entry.html?id=...`.
3. Each entry page shows: picture, type, sector, name, special offer (while valid), About text, and a Contact card (WhatsApp, phones, email, address with a Google Maps link, website, social page). Sections you left empty are simply not shown.
4. In admin > Directory > Edit entry, the Description box supports `**bold**`, `## Subtitle` and `- bullet`.
5. An entry that is Pending, Rejected or deleted shows "This entry is not available".

## 14c (this zip): the public Directory page
1. **Upload** this folder to GitHub (new: `directory.html`; changed: `lang.js`, `footer.js`, and the header menu in `index`, `about`, `patents`, `trademarks`, `translation`, `my-stuff`, `tenders`). Wait 1-2 minutes.
2. Open `directory.html` on your site. It needs no sign-in. It shows only entries you have **Approved** in admin.html > Directory; until then it says the directory is being prepared.
3. Try it: approve one or two entries, then search, filter by type and sector, and press the WhatsApp button.
4. Arabic: the page follows the site language button. The words come from lang.js; change the Arabic wording in admin > Website content > Arabic > Interface text if you like.
5. The Directory link now appears in the top menu of every page and in the bottom bar (7 items on a phone). You can hide or reorder items later from the admin Menu tab.
6. The **Details** button on each card arrives in 14d.

## 14b (this zip): the Directory tab in admin.html
1. Make sure 14a is done: `supabase-step14-directory.sql` was run once in Supabase > SQL Editor (it printed 13 sectors and the bucket row).
2. **Upload** this folder to GitHub (only `admin.html` changed in 14b). Wait 1-2 minutes.
3. Open `admin.html`, sign in, press **Directory** in the dark top bar.
4. Press **Sectors** to check the 13 starter sectors; rename them or add Arabic names if you like.
5. Press **Add entry**. Required: name. Everything else is optional. A new entry starts as **Pending approval**.
6. On the list, press **Approve** to publish it (visible to everyone once the public page exists in 14c), **Reject** to hide it, or **Unpublish** to take an approved one back.

## Good to know
- WhatsApp: type 01001234567 or 201001234567; it is saved as digits with the country code (201001234567).
- Pictures: any JPG, PNG or WebP; they are shrunk in your browser and saved in the public `directory-images` bucket.
- A sector cannot be deleted while entries use it. An entry's special offer shows an "Offer" badge in the list until its end date passes.
- Nothing is visible to visitors yet: the public page comes in 14c.

## 14a (earlier): database
`supabase-step14-directory.sql`: tables `directory_sectors` and `directory_entries`, access rules (visitors read approved entries only; only admins write), public picture bucket.
