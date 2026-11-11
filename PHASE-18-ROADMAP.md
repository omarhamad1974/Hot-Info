# Phase 18 roadmap (UI and admin improvements)

Keep this file. If a session ends, give it (with the latest zip) to Claude and say "continue with the next phase".
Every phase is delivered as a full site zip (all files, nothing to merge). Keep your own `assets/` folder: the zips do not contain it.

| Phase | What | State |
|---|---|---|
| P7 | Shadow for pictures and shapes: drop, cast (on the floor), extruded edge (see IMAGE-EFFECTS-STEPS.md) | DONE |
| P8 | Picture description (alt text), English and Arabic | DONE (Hot-Info-Phase18-P8-alt.zip) |
| P9 | Respect the visitor's "reduce motion" setting, plus a pause button | DONE (Hot-Info-Phase18-P9-motion.zip) |
| P10 | Preview unsaved changes + restore a previous version | planned |
| P11 | One site-wide shadow style (light direction, color, strength) | planned |
| P12 | Image-effect presets + "apply to all" | planned |

## P8: Picture description (alt text)
- New field **Picture description** (under the image) on: Carousel slides, News articles, Team members and Cards. Gallery already had **Alternative text**.
- It is read by screen readers (blind visitors) and by search engines. Write what the picture shows, in a short sentence. Leave it empty if the picture is only decoration: then it is skipped by screen readers, exactly as before.
- Team photos: leave it empty to use the member's name (as before).
- Arabic: open the Arabic version of the item and write the Arabic description. If it is empty, the English one is used.
- Where it shows: slide, news card, opened article, Related news, team card, Cards block. No SQL.
- Files: admin.html, index.html, about.html, blocks.js.

## P9: Reduced motion and a pause button
What was already there: the main pages already switched off fades, zooms and auto-advancing slides for visitors whose phone or computer is set to "reduce motion". What was missing, and is now added:
- **Smooth scrolling by script** (jumping to a section, back to top, the sign-up steps) now also follows the setting. It uses a new helper `kSmooth()` in theme.js.
- **Safety net in styles.css**: for visitors with "reduce motion", every other animation and transition on every page (directory, tenders, sign-up, effects...) ends at once and nothing loops.
- **Pause / play button** on the home carousel (top corner, follows the page direction in Arabic). It stops everything that moves by itself on the page: the carousel, testimonials, news, sectors, related news and the team slider. The choice is remembered on that device (`KPAUSE` in theme.js, saved as `khip-pause`). It is not shown to visitors who already asked for less motion, because nothing moves for them. Needed for accessibility (anything that moves for more than 5 seconds should be pausable).
- New words in lang.js, English and Arabic: pause_motion, play_motion.
- Not changed: hover effects you choose in the Animation tab (they still work for everyone who has not asked for less motion). No SQL.
- Files: theme.js, styles.css, lang.js, index.html, about.html, subscribe.html, submit-directory.html, footer.js.
