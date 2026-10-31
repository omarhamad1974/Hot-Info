-- STEP 12: repair + Groq. Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again.
-- It only ADDS what may be missing (columns, permissions, the Groq name in the usage log).

-- 1) columns the admin page uses
alter table public.tender_images
  add column if not exists ocr_text     text,
  add column if not exists ocr_provider text,
  add column if not exists columns      integer not null default 1,
  add column if not exists col_splits   jsonb;
alter table public.tenders
  add column if not exists position           integer not null default 0,
  add column if not exists session_date_raw   text,
  add column if not exists booklet_price_raw  text,
  add column if not exists flags              text,
  add column if not exists session_time       time;

-- 2) the usage log must accept 'groq'
do $$ begin
  if to_regclass('public.ocr_log') is not null then
    alter table public.ocr_log drop constraint if exists ocr_log_provider_check;
    alter table public.ocr_log add constraint ocr_log_provider_check
      check (provider in ('ocrspace', 'gemini', 'groq'));
  end if;
end $$;

-- 3) permissions (row-level security still limits everything to admins)
grant select, insert, update, delete on public.tender_images to authenticated;
grant select, insert, update, delete on public.tenders       to authenticated;
do $$ begin
  if to_regclass('public.ocr_log') is not null then
    execute 'grant select, insert, update, delete on public.ocr_log to authenticated';
  end if;
end $$;

select 'ok' as result;
