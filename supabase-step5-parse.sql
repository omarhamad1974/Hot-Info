-- STEP 5: Tender images, Phase 4 (text -> rows, review and approval). Run ONCE in Supabase > SQL Editor
-- AFTER step3 and step4. Safe to run again.
-- Adds to tenders: position (order inside the image), the raw date and price as printed (so a reviewer can
-- compare when normalizing failed), and flags (what the parser was unsure about).
alter table public.tenders
  add column if not exists position           integer not null default 0,
  add column if not exists session_date_raw   text,
  add column if not exists booklet_price_raw  text,
  add column if not exists flags              text;

select count(*) as tenders from public.tenders;
