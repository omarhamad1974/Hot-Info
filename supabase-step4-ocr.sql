-- STEP 4: Tender images, Phase 3 (OCR). Run ONCE in Supabase > SQL Editor > New query > paste > Run,
-- AFTER supabase-step3-tender-images.sql. Safe to run again.
-- ocr_log has one row per reading attempt. The admin page counts it to show "this month" usage.

create table if not exists public.ocr_log (
  id         bigint generated always as identity primary key,
  image_id   uuid references public.tender_images(id) on delete set null,
  provider   text not null check (provider in ('ocrspace', 'gemini')),
  via        text not null default 'server' check (via in ('server', 'browser')),
  ok         boolean not null default true,
  chars      integer,
  error      text,
  created_at timestamptz not null default now()
);
create index if not exists ocr_log_created_idx on public.ocr_log (created_at desc);
alter table public.ocr_log enable row level security;

drop policy if exists "Admins manage ocr log" on public.ocr_log;
create policy "Admins manage ocr log" on public.ocr_log for all to authenticated
using (public.is_admin()) with check (public.is_admin());

select count(*) as ocr_log from public.ocr_log;
