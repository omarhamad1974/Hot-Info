# KHIP website

**Start with [MANUAL.md](MANUAL.md)**: the full blueprint, including every step to do in GitHub and Supabase before launch. This file is the short version.

Static site (HTML + Tailwind CDN). Content lives in `app-data.json`; client documents live in a private Supabase bucket.

## Day to day: `admin.html`

Open `https://YOUR-SITE/admin.html`. It has two areas, switched from the dark bar at the top.

**Website content** (saves to `app-data.json` on GitHub)
- Sign in with a GitHub fine-grained token (Contents: read and write, for this repository only).
- Tabs: General, **Colors**, **Backgrounds**, Carousel, Jurisdictions, News, Services, Products, Testimonials, Team.
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
- Files sit in the private `client-files` bucket under `client-email@example.com/...` (lowercase email).
- A client can read only inside the folder named after their own email.
- Shared **sectors** (starter: Construction, Engineering) live in `sectors/<id>/...`. A client reads a sector only while subscribed; any number of subscriptions per client. Manage them in admin: **Client files, Sectors** tab (libraries) and the sector buttons under each client (subscriptions).
- Only accounts listed in `public.admins` can upload, replace or delete. To add another admin, create the user in the dashboard and run `insert into public.admins (user_id,email) select id,email from auth.users where email='them@khip.com';`

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

`node scripts/validate.js` checks `app-data.json` (required fields, duplicate ids, missing images, bad links). GitHub runs it on every push (`.github/workflows/validate.yml`).

## Notes
- The site loads Tailwind from its CDN, which is fine for this size but is not meant for heavy production use. If pages feel slow, compile Tailwind once and replace the CDN script.
- Contact phone numbers, email and office text are written directly in the HTML pages (about, patents, trademarks, translation); change them there.
- `theme.js` must stay in the same folder as the pages. Without a `theme` block in `app-data.json` the site simply uses the default colors.
