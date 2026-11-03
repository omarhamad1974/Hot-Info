-- STEP 15 (Tenders table, phase T1). Run ONCE in Supabase > SQL Editor > New query > paste > Run.
-- Safe to run again. Adds the governorate of a tender (chosen from a list in admin.html > Tenders).
alter table public.tenders
  add column if not exists governorate text;

create index if not exists tenders_governorate_idx on public.tenders (governorate);

select count(*) as tenders, count(governorate) as with_governorate from public.tenders;
