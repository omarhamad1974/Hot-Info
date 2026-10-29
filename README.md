# KHIP website

**Start with [MANUAL.md](MANUAL.md)**: the full blueprint, including every step to do in GitHub and Supabase before launch. This file is the short version.

Static site (HTML + Tailwind CDN). Content lives in `app-data.json`; client documents live in a private Supabase bucket.

## Day to day: `admin.html`

Open `https://YOUR-SITE/admin.html`. It has two areas, switched from the dark bar at the top.

**Website content** (saves to `app-data.json` on GitHub)
- Sign in with a GitHub fine-grained token (Contents: read and write, for this repository only). The repository name field starts as `Hot-Info`; enter your GitHub username or organization once and the browser remembers it.
- Tabs: General, **Colors**, **Backgrounds**, Carousel, Jurisdictions, News, Services, Testimonials, Team.
- **Colors**: the site palette. Ten colors (titles, dark, gold, accent blue, sand, page and section backgrounds, body text) start at the colors the site always used; change any of them, pick a ready-made palette, or add your own named colors. Also sets the **section width** on tablet and desktop (67% is about two thirds).
- **Backgrounds**: give any section (home, About, Patents, Trademarks, Translation) a background color from the palette, or a photo that covers the section (with an optional darkening slider). Text turns light on dark backgrounds by itself; the "Text color" option overrides that.
- Text boxes support `**bold**`, `## subtitle` and `- bullet` (use the B, H and list buttons).
- Photos: upload from your device (large photos are shrunk automatically) or pick one already in `assets/`.
- Add, duplicate, reorder, delete, search (long lists), Ctrl+S to save, undo arrow to discard changes, download icon for a backup.

**Client files** (Supabase)
- Sign in with your admin email and password.
- Invite a client by email: they get a link, set a password, and see only their own folder on the My files page.
- Open a client to upload (button or drag and drop), create folders, download and delete.
- Arabic or other non-Latin file names are replaced with a safe name (Supabase storage rejects them); the original extension is kept.
- Re-send an invite, or send a password reset, with the envelope button. Remove an account with the person icon (their files stay until you delete them).

## Arabic (right-to-left) site, phase 2 of 3
Files: `lang.js` (language engine), `app-data.ar.json` (the Arabic content), `service-page.js`, plus `index.html`, `about.html`, `patents.html`, `trademarks.html`, `translation.html`, `footer.js`, `styles.css`, `rich.js`, `admin.html`.
- **Choose the languages:** admin, Website content, General tab, **Site languages**: English only, Arabic only, or both. With both, a button in the header (العربية / English) switches; the visitor's choice is remembered. Save to GitHub to apply.
- **Write the Arabic content:** in the admin use the **EN | عربي** switch at the top. The Arabic form has the same items as the English content, with the English text above each box. Images, dates, icons and ids are shared. Saving in Arabic mode writes only `app-data.ar.json`.
- **The placeholder "المحتوى العربي":** nothing is translated for you. On the About page, the Patents, Trademarks and Translation pages, the team and the testimonials, every piece of Arabic text that has not been written yet shows the placeholder **المحتوى العربي**. Write the Arabic in the admin and it replaces the placeholder. (Home page carousel, jurisdictions and news still show the English text when their Arabic is empty, as in phase 1.)
- **Phase 2 covers:**
  - **About page** (`about.html`): all its fixed text is written under Arabic > **Page text** > About page. The service cards and pop-ups use the Arabic of the Services tab; country names and filing guidelines use the Arabic of the Jurisdictions tab.
  - **Service pages** (`patents.html`, `trademarks.html`, `translation.html`): the introduction and cards come from Services > field **3. Dedicated page content** in Arabic (same `##` rules as English). Until then they show the placeholder, in as many cards as the English page has. The short fixed text (figures, headings, "Talk to our team" box) is under Arabic > **Page text** > the page. The page name in the menu follows the service's Arabic title.
  - **Team** and **Testimonials**: new tabs in the admin (English mode) to add, edit, reorder, duplicate and delete. Team photos are resized and cropped to a square automatically. Write each person's Arabic name and position, and each testimonial's Arabic name, role and text, in Arabic mode.
  - **Interface text** tab: now also holds the short words used on these pages (menu, Phone, Email, buttons). Suggested Arabic is built in; type your own to replace it.
- Still English only until phase 3: My files and the sign-in pop-up.

## Leads, HOT Info Issues, sector-only access (step 2)
Run `supabase-step2-leads-and-issues.sql` once in the Supabase SQL Editor (safe to run again), then reload `admin.html`. The top bar now has **Website content | Leads | Users & sectors | HOT Info Issues**.
- **Leads**: start of the funnel. Add a lead (Name and Mobile Number are required; Email and Company optional) or **Import from Excel** (.xlsx, .xls or .csv with the headers Name, Email, Mobile Number, Company; the **Template** button downloads an example). Imported leads get status *Lead*; rows without a name or mobile, and mobiles already in Leads, are skipped and reported before you confirm. Change a lead to *Potential* with the status drop-down and write its situation in the description box (both save automatically). **Subscribe** creates the user (email required), subscribes the sectors you pick and marks the lead *Converted*; from then on it is a normal user.
- **HOT Info Issues**: a spreadsheet-style table of tenders (Sector, Source, Tender brief, Tender source, TB price, Tender date, Publishing date, Insurance value, Image). Cells save when you leave them; Enter moves down one row. Search and filter by text, sector, source, tender date and publishing date; click a header to sort. **Docs** opens the issue's document folder, which lives inside its sector library (`sectors/<sector>/issues/issue-00012`), so users subscribed to that sector see the documents in My files. Changing an issue's sector moves its documents too.
- **Users now get files only through sector subscriptions.** The private per-user folders are retired: no folder is created for new users, the Files button is gone, and My files shows only the sector cards. Files already stored in `<email>/` folders are not deleted; they are no longer shown to users (remove them in Supabase, Storage).
- **My files** was redesigned: greeting, one card per active sector with its end date, folders and documents with file type, size, "Added 3 days ago", a New badge and Open / Download.

## Services: three editable parts
In admin, Services tab, each service has three text parts (Patents, Trademarks and Translation are filled in already):
1. **Brief**: the short text on the home page card (also the top of the pop-up).
2. **Pop-up content**: the extra information in the pop-up that opens from the home page card or from the About page cards.
3. **Dedicated page content**: the text of the full page (`patents.html`, `trademarks.html`, `translation.html`). Text before the first `## ` line is the introduction; each `## Heading` becomes a card. Leave it empty to keep the text written in the page itself.
The **Dedicated page file** field (for example `patents.html`) connects a service to its page and shows the "More information" button.

## Site navigation (bottom bar)
Home, IP Services (IP Services section), News (Latest news section), Jurisdiction (Jurisdictions section, formerly Countries), About (about.html). The round paper-plane Send button sits inside the WhatsApp text box.
Client sign-in is no longer in the bar: clients open `my-stuff.html` directly, which offers a Login button when signed out. Sessions persist in the browser (auto-refreshed), so clients sign in once per device until they sign out.

## One-time Supabase setup

1. **Create the project** at supabase.com. Copy *Project URL* and the *anon public* key (Project Settings, API) into `supabase-config.js`. Never use the `service_role` key anywhere in this repository.
2. **Create your admin login**: Authentication, Users, Add user, tick *Auto Confirm User*.
3. **Run `supabase-setup.sql`**: SQL Editor, New query. First change `YOU@YOUR-DOMAIN.COM` in step 5 of the script to your admin email. The last query should show one row with your email. It is safe to run again.
4. **Deploy the invite function** (needed for inviting, listing, re-inviting and removing accounts):
   ```
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   supabase functions deploy admin-clients
   ```
   Without it, the Client files area still works for uploading to existing folders, and you can create logins in the dashboard.
5. **Authentication settings** (Authentication, ...). Also see MANUAL.md 2.8 and 2.9 (own email sender, session length):
   - *Sign In / Providers, Email*: turn **off** "Allow new users to sign up" and keep "Confirm email" on. This stops strangers creating accounts.
   - *URL Configuration*: set *Site URL* to your site, and add `https://YOUR-SITE/my-stuff.html` and `https://YOUR-SITE/admin.html` to *Redirect URLs*.
   - *Email Templates* (optional): edit the "Invite user" text so it reads like KHIP.
6. Keep `allowSignUp:false` in `supabase-config.js`.

### How access works
- Files sit in the private `client-files` bucket. Users have no private folders any more; they read only the sector libraries they are subscribed to.
- Shared **sectors** (starter: Construction, Engineering) live in `sectors/<id>/...`. A client reads a sector only while subscribed; any number of subscriptions per client. Manage them in admin: **Client files, Sectors** tab (libraries) and the sector buttons under each client (subscriptions).
- Only accounts listed in `public.admins` can upload, replace or delete. To add another admin, create the user in the dashboard and run `insert into public.admins (user_id,email) select id,email from auth.users where email='them@khip.com';`

## Client area: users and subscriptions (in steps)
- **Step 1 (done)**: run `supabase-step1-subscriptions.sql` once in Supabase (SQL Editor). In the admin, Client files > Users: create, edit and delete users (email, name, mobile, company), subscribe one or more sectors for 1 week, 1 year or 2 years from a start date you choose (the end date is calculated), and renew at any time: a new period can only start after the current one ends. Sectors can be added, renamed, deleted and filled with files and folders. Users see only their running sectors under **My files**, with the date it is available until.
- **Passwords**: in New user you can type a password (or press Generate) instead of sending an invitation; the account is created ready to use. Edit user lets you set a new password later. Users change their own password with the key icon on the My files page. This needs the updated `admin-clients` function: run `supabase functions deploy admin-clients` again.
- **Status filter** (Users tab): currently subscribed, ends in 5 days, ended, starts later, no subscription.
- **Step 2 (next)**: the "renewal reminder" email for users whose subscription ends in 5 days.

## What changed in this version
- About page: the Contact card now includes a small Google Maps map of the office.
- Image uploads in the admin: carousel (about 15:8), news (2:1) and team (square) photos are resized and center-cropped to their frame before upload. The pages also show every image with "cover" fitting, so older images fill their frames too.
- News labels: each article has a **Category** (General, KHIP News, Intellectual Property, Patents, Trademarks, Translation by default). Edit the list under General > News categories. The label shows on the news card and in the article, and an open article ends with a **Related news** slider (same category) that moves every 5 seconds.
- Colors and backgrounds: new `theme.js` (loaded by every page) applies the palette, section backgrounds and section width saved in `app-data.json` under `theme`. New admin tabs **Colors** and **Backgrounds**. All titles use the "Titles" color (dark blue by default).
- Layout: on tablet and desktop the page sections are 2/3 of their previous width; the home logo is half its previous size; About page: logo above the title, "Our Regional Coverage", "KHIP Value", team slider (4 across, 1 on mobile, moves every 10 seconds), redesigned Contact with LinkedIn only; Team removed from the home menu.
- Pop-ups: the jurisdiction pop-up no longer repeats the Overview, and any long pop-up scrolls inside itself.
- Testimonials: one framed quote (a third of the screen wide on desktop) that fades out and in every 10 seconds.
- `admin.html`: two areas (Website content, Client files); duplicate, search, Ctrl+S, discard, automatic photo shrinking; client invites, uploads, folders, deletes.
- `supabase-setup.sql`: repeatable; adds the admin role and admin file rules. New `supabase/functions/admin-clients`.
- Public site: formatting (`**bold**`, `##`, `-`) renders; carousel arrows and swipe; YouTube icon; reduced-motion support; dynamic footer year; My files search and sort.
- New bottom bar (above), sign-in as a pop-up from My files, persistent sessions; sections renamed IP Services, Latest news, Jurisdictions.
- Sectors: shared libraries with per-client subscriptions; My files shows a card per subscribed sector.
- Validation script and workflow moved to where GitHub can run them.

## Checks

`node scripts/validate.js` checks `app-data.json` (required fields, duplicate ids, missing images, bad links) and `app-data.ar.json` (valid JSON, ids that exist in the English file, page text keys that exist in their page). GitHub runs it on every push (`.github/workflows/validate.yml`).

## Notes
- The site loads Tailwind from its CDN, which is fine for this size but is not meant for heavy production use. If pages feel slow, compile Tailwind once and replace the CDN script.
- Contact phone numbers, email and office text are written directly in the HTML pages (about, patents, trademarks, translation); change them there.
- `theme.js` must stay in the same folder as the pages. Without a `theme` block in `app-data.json` the site simply uses the default colors.

## Tender images (Phase 2)

1. Run `supabase-step3-tender-images.sql` once in the Supabase SQL Editor (safe to run again). It creates the private `tender-images` bucket (1 MB per file) and the `tender_images` and `tenders` tables, admin only.
2. Reload `admin.html`. The top bar now has **Tender images**.
3. Type the source paper, page and publish date once, then press **Choose image**. Use an image that is already cropped (JPG, PNG or WebP, up to 1 MB). It is uploaded as it is, with no resizing. The page number goes up by one after each upload.

### Reading the text (Phase 3)

1. Run `supabase-step4-ocr.sql` once in the SQL Editor (it adds the usage log).
2. Deploy the function: Supabase, Edge Functions, Create a new function, name it exactly `ocr-tender`, paste `supabase/functions/ocr-tender/index.ts`, Deploy. Leave "Verify JWT" on. (Or: `supabase functions deploy ocr-tender`.)
3. The secrets `OCR_SPACE_API_KEY` and `GEMINI_API_KEY` must exist. Optional secrets: `OCR_SPACE_ENGINE` (1 or 2, default 1) and `GEMINI_MODEL` (default `gemini-2.5-flash`).
4. In Tender images press **Read text** on an image, then **Read with OCR.space** (or **Read with Gemini**). The text appears in an editable box and is saved automatically; fix mistakes and press **Save text**.
5. If OCR.space refuses because of its per-IP limit, the message offers **Try from this browser**. That sends the OCR.space key to your own admin browser for that one call.
6. The counter on the page shows readings this month per provider (OCR.space allows 25,000 a month).

### Rows and review (Phase 4)

1. Run `supabase-step5-parse.sql` once in the SQL Editor.
2. Deploy the function `parse-tenders` the same way as `ocr-tender` (Edge Functions, Create a new function, paste `supabase/functions/parse-tenders/index.ts`, leave "Verify JWT" on). It uses the secret `GEMINI_API_KEY` (optional `GEMINI_PARSE_MODEL`).
3. In **Read text**, check the Arabic, then press **Turn into rows**. Gemini splits the text into tenders (text only). Arabic digits, prices and dates are then normalized by code, not by the model.
4. The review table opens: fix any cell (it saves when you leave it). Amber cells = date or price could not be read (hover to see what was printed). The file icon shows the original text of that tender. Press the circle to approve a row, or **Approve all**. A row needs entity and subject to be approved.
5. When every row of an image is approved, the page offers to delete the picture to save storage. The text and the tenders stay.
