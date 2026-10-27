-- STEP 2: Leads (start of the funnel), HOT Info Issues (tender table), and sector-only file access.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER supabase-setup.sql and
-- supabase-step1-subscriptions.sql. Safe to run again: every statement is idempotent.
--
--  1. leads: Name, Email, Mobile, Company, status (lead / potential / converted) and a status note.
--     Admin only. A lead becomes "converted" when you subscribe it as a user.
--  2. issues: one row per tender (sector, source, brief, prices, dates, image). Admin only.
--     Each issue has a document folder inside its sector library:
--       client-files/sectors/<sector-id>/issues/issue-00012/
--     so users who subscribe to that sector can open the documents from My files.
--     The tender image is kept in client-files/issue-images/<issue number>/ (admin only).
--  3. The old per-user private folders are retired: users read files ONLY through sector subscriptions.

-- 1. Leads -------------------------------------------------------------------------------------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(btrim(name)) > 0),
  email             text,
  mobile            text not null check (length(btrim(mobile)) > 0),
  company           text,
  status            text not null default 'lead' check (status in ('lead', 'potential', 'converted')),
  status_note       text,
  converted_user_id uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads (status);
alter table public.leads enable row level security;

drop policy if exists "Admins manage leads" on public.leads;
create policy "Admins manage leads" on public.leads for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- 2. HOT Info Issues ---------------------------------------------------------------------------
create table if not exists public.issues (
  issue_no        bigint generated always as identity primary key,
  sector_id       text not null references public.sectors(id) on delete restrict,
  source          text check (source in ('Newspapers', 'Manzooma', 'Private')),
  tender_brief    text not null default '',
  tender_source   text,
  tb_price        numeric(14, 2) check (tb_price >= 0),
  tender_date     date,
  publishing_date date,
  insurance_value numeric(14, 2) check (insurance_value >= 0),
  image_path      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists issues_sector_idx on public.issues (sector_id);
create index if not exists issues_publishing_idx on public.issues (publishing_date);
alter table public.issues enable row level security;

drop policy if exists "Admins manage issues" on public.issues;
create policy "Admins manage issues" on public.issues for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- 3. Retire the private per-user folders --------------------------------------------------------
-- Users no longer read anything under <their-email>/. Files already stored there are not deleted
-- (admins can still see them in Supabase > Storage > client-files); delete them there if you like.
drop policy if exists "Users read their own folder" on storage.objects;

-- Check: all three lines should return without an error.
select count(*) as leads  from public.leads;
select count(*) as issues from public.issues;
select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' order by 1;
