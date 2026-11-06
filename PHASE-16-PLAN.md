# Phase 16: admin and front-end improvements (in steps)

## 16a: Admin navigation and Search everything (DONE)
- **Five areas** replace the ten top-bar tabs: **Website**, **Tenders**, **Users & money**, **Directory**, **Settings**.
  - Tenders has a sub-menu: 1 Input tender, 2 Classification & notification, 3 Featured, 4 Generate file.
  - Users & money has a sub-menu: Users & sectors, Payments.
  - The red counters moved with their pages. The Tenders and Users & money buttons also show a total, so you see what waits without opening them.
  - Each area remembers the last page you used in it.
  - Leads and HOT Info Issues stay hidden as before (they are mapped to their areas for when they return).
- **Search everything (Ctrl+K, or Cmd+K on Mac, or the magnifier in the top bar)**:
  - "Go to" matches every page and setting (Website tabs, Tenders 1 to 4, Users, Sectors, Expiring, Payments, Directory, Settings, Entities, Keywords, Dictionary, Packages & prices, Payment methods). It also works from Website content before you sign in to Supabase.
  - Below that: users, tenders, tender images (newspaper name) and directory entries (when signed in). Press an arrow key to move, Enter to open, Esc to close.
  - The page address `#settings` now opens Settings directly.
- Files: admin.html only. No database change.

## 16e: Filters on phones (DONE)
- **Tenders and Directory, phones only (under 640 px wide)**: the filter box shows the search field and one **Filters (n)** button. Tap it to open the rest (entity, sector and dates on Tenders; sector, special offers and type on Directory); tap again to close. Tablets and desktops look exactly as before.
- **Chips**: every active filter inside the hidden part shows as a chip under the search box ("Roads", "Published: 1 Oct 2026 – ..."). Tap a chip to remove just that filter. n in the button counts those chips. The search text is not a chip because it stays visible in the box.
- The result count and **Clear** stay visible while the filters are closed.
- Arabic and English: new texts `dir_filters` and `dir_remove` in lang.js. (tenders.html is English only, as before.)
- Files: tenders.html, directory.html, lang.js. No database change.
