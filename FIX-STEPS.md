# Fixing the tender reader (read this first)

## What was wrong
1. Supabase still ran an OLD or MIXED version of the two functions (`ocr-tender`, `parse-tenders`),
   so the page and the functions did not speak the same language.
2. The functions were stored in GitHub as loose files. Supabase needs `supabase/functions/<name>/index.ts`.
3. Gemini 2.5 was switched off by Google and Gemini is often busy. Groq (free) is now the main AI.

## Steps, in this order
1. **Upload this whole folder to GitHub** (replace the files). Wait for the site to update (1-2 minutes).
2. **Groq key (free):** go to console.groq.com, sign up, create an API key.
3. **Supabase > Edge Functions > Secrets:** add `GROQ_API_KEY` = your key.
   Also check `OCR_SPACE_API_KEY` is there. `GEMINI_API_KEY` is optional (backup only).
   If you have a secret called `GEMINI_MODEL` or `GEMINI_PARSE_MODEL` with `gemini-2.5-flash`, delete it.
4. **Deploy the two functions** (leave "Verify JWT" ON):
   - Dashboard way: Edge Functions > `ocr-tender` > Code > select all, paste the content of
     `supabase/functions/ocr-tender/index.ts` > Deploy. Do the same for `parse-tenders`.
   - Command way: `supabase functions deploy ocr-tender` then `supabase functions deploy parse-tenders`.
5. **SQL:** Supabase > SQL Editor > paste `supabase-step12-repair.sql` > Run. It should print `ok`.
6. **Test:** hard-refresh the admin page (Ctrl+Shift+R) > Tender images > "Read text" on an image >
   press **Check setup**. You should see both functions "deployed (2026-10-31 ...)" and the keys "set".
7. Press **Read with OCR.space** (best for Arabic print). The text must appear in the box.
   Then tick "several tenders" if needed, press **Preview rows**, then **Turn into rows**.

## What each message means
- "an OLD version is deployed" -> step 4 was not done for that function.
- Key shows MISSING -> step 3.
- "Groq free limit reached" -> wait one minute and press again.
- "model not found" -> add secret `GROQ_MODEL` (text) or `GROQ_VISION_MODEL` (image) with a current model name from console.groq.com.
- "Could not save the rows ... column" -> run step 5.
- Rows saved but not visible -> run step 5 (it also fixes permissions), then press Refresh.
