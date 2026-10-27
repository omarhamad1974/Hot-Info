# KHIP system manual (blueprint)

This manual covers everything needed to take the system from a folder of files to a working website with an admin area and a private client portal. Follow Part 2 once, in order. Part 3 is for day-to-day use.

---

## 1. How the system fits together

| Piece | What it does | Where it lives |
|---|---|---|
| Public website | Home, About, Patents, Trademarks, Translation, My files | Static files hosted on GitHub Pages (or any static host) |
| Website content | Text, news, services, jurisdictions, team, testimonials, carousel | `app-data.json` in the GitHub repository |
| Content admin | Edits `app-data.json` and uploads photos | `admin.html`, area **Website content**, talks to the GitHub API with your token |
| Client portal | Clients sign in and download their documents | `my-stuff.html`, talks to Supabase |
| Client admin | Invite clients, upload and delete their files | `admin.html`, area **Client files**, talks to Supabase |
| Invite function | Creates, re-invites and removes client logins safely | `supabase/functions/admin-clients` (runs inside Supabase) |

Rules the system relies on:
- There is **one** private bucket, `client-files`. Folders inside it are only name prefixes, not separate buckets.
- Private documents sit in a folder named after the client's lowercase email: `name@company.com/contract.pdf`.
- Shared documents sit in a **sector** library: `sectors/construction/...`, `sectors/engineering/...`. A client can read a sector only while subscribed to it, and can hold any number of subscriptions.
- A client sees their private folder and one card per subscribed sector on the My files page.
- A client can read only their own folder and the sectors they subscribe to. Only admins can upload, replace, delete or change subscriptions.
- Passwords are never stored by the site. Supabase handles them.

### Bottom bar buttons (final)
| Button | Goes to |
|---|---|
| Home | Top of the home page |
| IP Services | The **IP Services** section |
| News | The **Latest news** section |
| Jurisdiction | The **Jurisdictions** section (formerly Countries) |
| About | The main About page (about.html) |

The client sign-in pop-up is no longer in the bottom bar. Clients can still sign in by opening `my-stuff.html` directly.

On other pages (About, Patents, ...) the first four buttons take the visitor to the matching home page section.

### Staying signed in
After the first sign-in the browser keeps the session, and refreshes it automatically in the background, so clients are not asked again on the same device and browser. They are asked again only if they press sign-out, clear their browser data, use a private window, or you shorten session lifetimes in Supabase (see 2.9).

---

## 2. One-time setup (do these before launch)

Time needed: about 45 minutes. You need a GitHub account, a Supabase account (free plan is enough), and the email address you will use as admin.

### 2.1 GitHub: repository and hosting
1. Create a repository (private or public) and upload the contents of the project folder so that `index.html` and `admin.html` sit at the top level. Keep the folders `assets`, `scripts`, `supabase`, `.github`.
2. Turn on hosting: repository **Settings, Pages**, source **Deploy from a branch**, branch `main`, folder `/ (root)`. Note the site address (for example `https://yourname.github.io/KHNew`, or your own domain once connected).
3. If you use a custom domain, add it in the same Pages screen and tick **Enforce HTTPS**.
4. Check that the **Actions** tab is enabled. The workflow `Validate content` then runs on every save and flags broken content (a red cross on the commit).

### 2.2 GitHub: access token for the content admin
1. GitHub profile picture, **Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token**.
2. Name: `KHIP admin`. Expiration: choose a date you will remember (put a reminder in your calendar; when it expires the admin shows "The token was rejected").
3. **Repository access: Only select repositories**, pick the website repository.
4. **Repository permissions: Contents, Read and write.** Nothing else is needed.
5. Generate, copy the token (it is shown once) and store it in a password manager.

### 2.3 Supabase: create the project
1. At supabase.com, **New project**. Choose a strong database password (store it), and a region close to your clients (for Egypt and the Gulf, a Europe region such as Frankfurt is usually fastest).
2. Wait until the project finishes creating.
3. **Project Settings, API**: copy the **Project URL** and the **anon public** key. Never copy or use the `service_role` key outside Supabase.

### 2.4 Website: connect to Supabase
Open `supabase-config.js` and replace the two placeholders:
```js
window.KHIP_SUPABASE={
  url:'https://abcdefgh.supabase.co',
  anonKey:'eyJ...your anon key...',
  bucket:'client-files',
  allowSignUp:false
};
```
Commit the change. (The anon key is meant to be public; the database rules protect the data.)

### 2.5 Supabase: create your admin login
**Authentication, Users, Add user, Create new user.** Enter your admin email and a strong password and tick **Auto Confirm User**.

### 2.6 Supabase: run the database script
1. Open `supabase-setup.sql` and change `YOU@YOUR-DOMAIN.COM` (section 5) to your admin email.
2. Supabase **SQL Editor, New query**, paste the whole file, **Run**.
3. The last result should list one row: your email. If it is empty, the email did not match the user created in 2.5; fix it and run again (running again is safe).
4. Check **Storage**: a private bucket `client-files` should exist.

What the script does: creates the private bucket (50 MB per file), the `admins` list and the `is_admin()` check, a rule that lets each client read only their own folder, the `sectors` and `subscriptions` tables with the starter sectors Construction and Engineering, a rule that lets a client read a sector only while subscribed, and rules that let admins upload, replace and delete.

### 2.7 Supabase: deploy the invite function
The function lets the admin page invite, re-invite and remove client logins without exposing the secret service key. Run once on your computer (needs Node.js):
```
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF      # the code in your project URL
supabase functions deploy admin-clients
```
Run these from the project folder (the one containing `supabase/`). If you prefer no command line: **Edge Functions, Create a new function**, name it exactly `admin-clients`, paste the contents of `supabase/functions/admin-clients/index.ts`, and deploy. Leave "Verify JWT" on.

If you skip this, you can still upload to existing folders, but you must create client logins by hand in **Authentication, Users, Add user** (or Invite user).

### 2.8 Supabase: authentication settings
All under **Authentication**:
1. **Sign In / Providers, Email**: turn **off** "Allow new users to sign up". Keep "Confirm email" on. Without this anyone could create an account through the API.
2. **URL Configuration**:
   - **Site URL**: your site address (for example `https://www.yourdomain.com`).
   - **Redirect URLs**: add `https://www.yourdomain.com/my-stuff.html` and `https://www.yourdomain.com/admin.html`. While testing locally you may also add `http://localhost:8000/**`; remove it before launch.
   Invite and reset links only work for addresses on this list.
3. **Email Templates** (optional but recommended): edit **Invite user** and **Reset password** so the wording and sender name read like KHIP. Keep the `{{ .ConfirmationURL }}` link.
4. **Emails sent**: Supabase's built-in sender allows only a few emails per hour. For real use, add your own mail service under **Project Settings, Authentication, SMTP Settings** (any provider; use an address on your domain). Do this before inviting many clients.

### 2.9 Supabase: how long clients stay signed in
Under **Authentication, Sessions**, leave the defaults. Sessions then have no fixed end: the browser renews the short access token automatically (default 1 hour) and keeps the login until the user signs out. Do not enable "Time-box user sessions" or "Inactivity timeout" unless you want clients to be asked again after that period. Leave "Single session per user" off, so a client can be signed in on phone and laptop.

### 2.10 Final checks before launch
1. Open `https://YOUR-SITE/admin.html`.
2. **Client files** area: sign in with the admin email. You should see the client list (empty at first).
3. Invite a test address you own. You should receive an email; the link opens the site and asks for a new password; afterwards you land on My files.
4. In admin, open that client, upload a PDF (try one with an Arabic file name), then sign in as the test client on the public site and download it.
5. Confirm the test client cannot see other folders (they only ever see their own).
6. **Website content** area: connect with the GitHub token, edit the tagline, press **Save to GitHub**, and reload the site after a minute or two to see it.
7. Remove the test client (admin, person icon) and delete its files.

Launch checklist: [ ] token created and stored  [ ] `supabase-config.js` filled  [ ] SQL run, one admin row  [ ] function deployed  [ ] sign-ups off  [ ] Site URL and Redirect URLs set  [ ] SMTP set  [ ] test invite and download done  [ ] localhost redirect removed.

---

## 3. Daily use

### 3.1 Editing website content
Open `admin.html`, area **Website content**, enter owner, repository, branch (`main`) and the token. Tick "Keep me signed in for this browser tab" to avoid retyping while the tab is open.

- **General**: home page text, tagline, LinkedIn and YouTube links, and the suggestions typed into the WhatsApp box (one per line).
- **Colors**: change the site palette (ten colors, starting at the current ones), choose a ready-made palette, add your own named colors, and set the section width on tablet and desktop. The small arrow next to a color puts it back to its default.
- **Backgrounds**: for each section choose Default, a Color from the palette, or a Photo that covers the section (upload or pick from `assets/`, optionally darkened). Save to GitHub to publish.
- **Carousel, Jurisdictions, News, Services, Products, Testimonials, Team**: add, duplicate, reorder with arrows, delete. Required fields are marked with a red star.
- Formatting inside text boxes: `**bold**`, a line starting with `## ` is a subtitle, a line starting with `- ` is a bullet. The B, H and list buttons insert them. Card previews on the site show plain text; the full pop-up shows the formatting.
- Photos: use the upload button, or type a file name already in `assets/`. Large photos are reduced automatically; the limit after reduction is 3 MB.
- **Save to GitHub** (or Ctrl+S) publishes. The site updates in one to two minutes. The undo arrow discards unsaved changes; the download icon saves a backup copy of the data file.
- If you see "The file changed on GitHub", someone else saved first: press the undo arrow, then redo your edit.

Page text that is not in the admin (About page paragraphs, Patents, Trademarks, Translation, phone numbers, email, offices) is edited directly in the HTML files on GitHub.

### 3.2 Adding a client
1. `admin.html`, area **Client files**, sign in.
2. Type the client's email under **Invite a new client**, press **Send invite**. Use the email the client will actually sign in with; the folder name is that email in lowercase.
3. The client receives an email, sets a password, and lands on **My files**.
4. Open the client's row, upload their documents. Create folders (for example one per matter) if useful; clients see folders and can download everything inside.

Status labels: **Invite pending** (has not set a password yet), **Active**, **Folder only** (a folder exists but no login; press Invite to create one).

### 3.3 Sectors and subscriptions
Sectors are shared libraries (the starter ones are Construction and Engineering). Upload a document once and every subscriber sees it.

**Example:** Alice subscribes to both sectors, Bob only to Construction. Alice sees two sector cards plus her own files; Bob sees one sector card plus his own files; a client with no subscription sees only their own files.

1. `admin.html`, **Client files**, tab **Sectors**: add a sector (for example "Oil & Gas"), open **Files** to upload and organise its documents, or delete a sector (this also deletes its files).
2. Tab **Clients**: under each client with a login, the sector buttons toggle that client's subscriptions. Blue with a tick means subscribed. A change takes effect the next time the client opens or refreshes My files.
3. The Sectors tab shows how many subscribers each sector has.
4. To end a subscription, press the sector button again. The client keeps their private folder; only the shared sector disappears for them.

Notes: a sector name becomes its folder name (lowercase, letters, numbers and dashes). Only clients with a login can be subscribed. Subscriptions can be changed at any time without re-inviting.

### 3.4 Managing files
- Upload: button, or drag files onto the page. Maximum 50 MB per file on the free plan.
- File names with spaces or non-Latin letters are converted to safe names (for example an Arabic name becomes `file-xxxx.pdf`). Name important files in Latin letters before uploading if the name matters.
- If a name already exists, `-2`, `-3` ... is added; nothing is overwritten.
- Download opens a temporary link (valid for one minute). Delete asks for confirmation and cannot be undone.

### 3.5 Client problems
- Did not get the email: check spam; then press the envelope button on the client row (re-sends the invite, or sends a reset email if they already have a password).
- Forgot password: client uses **Forgot password?** in the sign-in pop-up, or you press the envelope button.
- Changed email address: invite the new address, move or re-upload files into the new folder, then remove the old account.
- Stop access: remove the account (person icon). Their files stay until you delete them.

### 3.6 What clients see
Bottom bar, **My files**: if not signed in a sign-in pop-up opens; after signing in they go to their files: one card for each subscribed sector, then their private folders and files. Afterwards the same browser opens My files directly. The small sign-out icon appears in the header when signed in.

### 3.7 Adding another admin
Create the user in Supabase (**Authentication, Users**), then in the SQL Editor:
```sql
insert into public.admins (user_id, email)
select id, email from auth.users where lower(email) = lower('colleague@khip.com');
```
To remove an admin: `delete from public.admins where lower(email) = lower('colleague@khip.com');`

---

## 4. Troubleshooting

| What you see | Cause and fix |
|---|---|
| Admin: "The token was rejected" | Token expired or mistyped. Create a new one (2.2). |
| Admin: "The token cannot write..." | Token lacks Contents: Read and write, or does not include this repository. |
| Admin: "Repository, branch or file not found" | Check owner, repository, branch and file name (`app-data.json`). |
| Client files: "Supabase is not connected yet" | `supabase-config.js` still has the placeholders (2.4). |
| "Could not check admin rights" | SQL not run, or run without your email (2.6). |
| "...is not an admin" | That account is not in the `admins` table. |
| "Account tools are not deployed yet" | Deploy the function (2.7). |
| Invite link opens but says expired or invalid | Link already used or the address is not in Redirect URLs (2.8). Send a new one. |
| "email rate limit exceeded" | Built-in email limit; set up SMTP (2.8). |
| "Sectors are not set up yet" in admin | Run the latest `supabase-setup.sql` (2.6); it is safe to run again. |
| Client does not see a sector | They are not subscribed (3.3), or they have not refreshed My files since you changed it. |
| Client sees "No files here yet" | Folder name does not match their email exactly (lowercase) or nothing uploaded. |
| Upload fails with "Invalid key" | File name has unsupported characters; the admin renames most automatically. Rename and retry. |
| Upload fails with "exceeded the maximum allowed size" | File over 50 MB. Compress or split it. |
| Content saved but site unchanged | Wait two minutes, hard refresh; check Actions tab for a failed deploy or validation. |
| Validation failed in Actions | Open the failed run; it lists the item and field (missing text, duplicate id, image not found). |

---

## 5. Security and care
- Treat the GitHub token like a password; use a short expiry, one repository, Contents permission only.
- Never paste the Supabase `service_role` key into any file in the repository.
- Keep sign-ups off. Use a strong, unique admin password (a password manager, plus two-factor on GitHub and Supabase accounts).
- Do not send sensitive files through the website's WhatsApp box; it only opens WhatsApp.
- Backups: use the download icon in the content admin regularly; the repository history also keeps every version. For client files, keep your original copies; consider a periodic download of the bucket from Supabase **Storage**.
- Free-plan Supabase projects pause after a week without activity. If the portal says it cannot load files, open the Supabase dashboard and restore the project.
- When a team member leaves: remove them as admin (3.7), revoke their GitHub token, and change shared passwords.

## 6. File map
| File | Purpose |
|---|---|
| `index.html`, `about.html`, `patents.html`, `trademarks.html`, `translation.html` | Public pages |
| `my-stuff.html` | Client file portal |
| `admin.html` | Admin (content and client files) |
| `app-data.json` | All editable content (`app-data.sample.json` is a fuller example) |
| `supabase-config.js` | Your Supabase URL and anon key |
| `supabase-setup.sql` | Database, sectors and storage rules, run once (safe to repeat) |
| `supabase/functions/admin-clients/index.ts` | Invite function |
| `auth.js`, `footer.js`, `rich.js`, `styles.css`, `tailwind-config.js` | Shared scripts and styles |
| `scripts/validate.js`, `.github/workflows/validate.yml` | Automatic content check |
| `assets/` | Images |
