# Phase 15: compact filters, hero width, header colours and logo

## 15a: Compact filters (DONE)
- **Front** (tenders.html, directory.html): the filter card is now two slim lines. Line 1: search, publishing entity, sector (tenders) / search, sector, "special offers only" (directory). Line 2: dates and result count and Clear (tenders) / type chips, count and Clear (directory). Labels became icons and placeholders; smaller boxes; wraps neatly on phones.
- **Admin**: one shared compact box style (`inpc`). Users, Leads, Directory and Payments now keep the status chips, search and dropdowns on one line. HOT Info issues: one slim bar (search, sector, source, tender date range, published date range, Clear). Tenders > Classification: period, from, to, show on one line. Buttons are a little smaller.
- Files: tenders.html, directory.html, admin.html.

## 15b: Brand and hero controls (DONE)
- **Header logo upload (separate)**: admin > Brand (and General) > "Header logo". Empty = the main logo is used in the header as before. Optional **Header logo height** slider (20 to 96 px, "automatic" button resets it). The main logo stays for the home page and About page.
- **Header colours**: admin > Brand > Header colours: background, text and menu links, current page / hover, bottom line, background strength (0 to 100%), live preview, and "Back to the default header". Colours come from the brand palette or any colour. Nothing chosen = the header looks exactly as before.
- **Hero (picture carousel) full width**: admin > Sections > Home page: Picture carousel: tick "Full screen width" (edge to edge, no rounded corners) and choose Height: Standard / Tall (70% of the screen) / Full screen height.
- Files: theme.js, brand.js, styles.css, admin.html. Saved in app-data.json as `brand.headerImage`, `brand.headerLogoHeight`, `theme.header.{bg,text,active,border,opacity}`, `theme.sections["home-carousel"].{fullWidth,heroHeight}`.
- After a save in admin the website picks the values up on the next page load (no database change needed).

## 15c: Hero height, bottom bar width, payment page links (DONE)
- **Hero height**: admin > Sections > Home page: Picture carousel: height in pixels for phone, tablet and desktop (empty = standard 240 / 320 / 432), or "Fill the whole screen height". (The earlier Standard/Tall/Full select was replaced by these.)
- **Bottom bar width** (WhatsApp box + buttons): admin > Sections > "Bottom bar width": sliders for tablet and desktop (40 to 100% of the screen; "Standard" = the old fixed width). Phones stay full width.
- **External payment page per method**: run `supabase-step20-payment-links.sql` once, then admin > Payments > Payment methods: new field "External payment page" for each of CIB, InstaPay, Vodafone Cash, Fawry (https link, checked). Users see an **Open the payment page** button on subscribe.html (English and Arabic texts `pay_open_page`, `pay_open_hint` in lang.js), pay there, then upload the receipt as before. A method can now be switched on with just a link (no account number or QR needed).
- Files: admin.html, theme.js, styles.css, subscribe.html, lang.js, scripts/validate.js, supabase-step20-payment-links.sql (new).

## 15d: Side (hamburger) menu (DONE)
- admin > Menu > **Side menu (hamburger)** (appears after "Customise the menu"): turn it on, choose the side (left / right, flipped in Arabic) and optionally replace the top menu links so only the button shows.
- Each menu item has a new tick **In the side menu**. Only ticked items appear in it; the item's name (English / Arabic), destination and icon are the same as for the other menus. "Hide it" still hides an item everywhere.
- The button sits in the header; the menu slides in over a dimmed page. It closes with the X, a tap outside, or Esc. Works on phone, tablet and desktop, English and Arabic, and follows the header colours.
- Files: menu.js, styles.css, theme.js, admin.html. Saved in app-data.json as `menu.side.{enabled,position,only}` and `menu.items[].side`.
