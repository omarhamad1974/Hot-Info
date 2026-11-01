# Phase 13b: HOT News with sectors and active tenders

Do these in order.

1. **Upload** this folder to GitHub (replace the files). Wait 1-2 minutes.
2. **Database step (once):** Supabase > SQL Editor > New query > paste `supabase-step13-hot-news.sql` > Run. It prints `ok`.
   It adds an Arabic-name column to the sectors and a public function that returns, for each sector, ONLY the
   description and the publishing entity of its active tenders. No dates, prices, links or documents are public.
3. **Arabic names of the sectors (optional):** admin.html > Users & sectors > Sectors > press the **ع** button
   next to a sector and type its Arabic name. Without it the Arabic site shows the English name.
4. **How many tenders per sector:** admin.html > General > "HOT News: how many tenders ..." (1 to 12, default 6).
5. Check the home page: the HOT News section lists the sectors that have active tenders (with the number of tenders),
   and under the chosen sector the newest tenders: the description (3 lines at most on a phone) and the publishing entity.
   "See all tenders" opens the tenders page (signed-in subscribers).

## Which tenders appear
A tender is shown when it is **Approved**, its sectors are **Confirmed** (the same rules as the tenders page), and it is
still active: its session date has not passed (no session date: published in the last 30 days).
A sector with no active tender is not shown; if no sector has one, the whole HOT News section is hidden.

## Other changes
- The countries (used by the About page map) are still edited in the tab now called **Countries (About page)**.
- The section can still be hidden, resized or given a background in the Sections tab ("Home page: HOT News").
