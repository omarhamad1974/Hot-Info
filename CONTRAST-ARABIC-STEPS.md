# Contrast + Arabic update (Phase 16g)

Files to replace on GitHub: tenders.html, my-stuff.html, lang.js, styles.css, admin.html, index.html, about.html, patents.html, trademarks.html, translation.html, subscribe.html, directory.html, directory-entry.html, submit-directory.html, contact.js. No SQL.

1. Upload the whole zip contents over the repo (replace all).
2. Open the site on your phone, switch to Arabic (EN | AR button), open Tenders and My files: they should be Arabic and right-to-left.
3. Check text looks darker and clearer on every page; check the carousel text on photos.
4. Admin: grey hint text is darker and small text is 12px. If a tab row now wraps badly on a small phone, tell me which tab.

Not included: Arabic admin interface (admin-i18n.js was not in the zip you sent).

## Phase 16h additions
- New file banner.js + styles.css: dark top banner with breadcrumbs and page title on every inner page (not the home page). My files shows Home > My files > sector > folder and the crumbs are clickable (the old in-page crumb line is hidden).
- Placeholders renamed to HOT INFORMATION: chat bar placeholder and rotating prompts, image placeholders, logo fallback text and alt, tab titles of the tender pages.
- The zip has NO assets folder files. Keep your current assets on GitHub; only upload the other files.
- New files to add: banner.js. Replace: the 10 inner pages, lang.js, footer.js, styles.css, app-data.sample.json.

## Phase 16i: Limited offers on the home page
- New section above the testimonials. English title "Limited offers", Arabic "عروض خاصة لعملاء هوت" (editable under Arabic > Interface text, key offers_title).
- It shows approved Directory entries that have an offer title (and have not passed the offer end date), soonest-ending first, max 12, as swipeable cards (picture, countdown, entity, offer title, short text, View offer). Hidden when there are none. "All offers" opens the Directory with "Special offers only" ticked.
- Offers are added in admin > Directory entries (offer title, offer text, end date). No SQL needed.
- The section background can be set in admin > Backgrounds ("Home page: Limited offers").
- Replace: index.html, directory.html, lang.js, theme.js, styles.css. No assets in the zip.
