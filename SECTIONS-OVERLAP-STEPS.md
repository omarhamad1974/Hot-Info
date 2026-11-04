# Section overlap (admin: Sections tab, each section)
Per section, under "Hide this section" and the width sliders:
- **Overlap with the next section (px):** Mobile, Tablet (768px and up), Desktop (1024px and up). Empty or 0 = none. Tablet empty = same as mobile; Desktop empty = same as tablet.
- **Order:** Above the next section (this one covers it) or Behind the next section (the next one covers this one). Default Above. Only saved when an overlap above 0 is set.
Saved in theme.sections.<section>.overlapMobile / overlapTablet / overlapDesktop / overlapOrder ("behind" only).
How it works (theme.js): the section gets a negative bottom margin equal to the overlap, so the next section moves up under or over it; z-index sets who is on top. Hidden sections are skipped when finding "the next section".
Tip: give the covering section a background (Sections tab) and enough bottom padding so its own text is not hidden by the next one. Blocks inside another section (the *-contact blocks) have no overlap setting.
No SQL. Files: admin.html, theme.js.
