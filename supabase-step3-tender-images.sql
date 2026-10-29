-- STEP 3: Tender images -> structured tenders (Phase 2: tables, private bucket, admin-only access).
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER supabase-setup.sql,
-- step1 and step2. Safe to run again: every statement is idempotent.
--
--  1. Private bucket "tender-images" (1 MB per file: the OCR.space free limit; the browser sends ~200 KB WebP).
--  2. tender_images: one row per uploaded newspaper image (source paper, page, publish date entered once).
--  3. tenders: many rows per image (entity, subject, booklet price, session date, bid bond, link, sectors).
--     Approved tenders keep their text after the image is deleted, so the 1 GB free storage lasts.
--  All of it is admin only for now. Subscriber access to approved tenders comes in Phase 6.

-- 1. Bucket --------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tender-images', 'tender-images', false, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read tender images" on storage.objects;
create policy "Admins read tender images" on storage.objects for select to authenticated
using (bucket_id = 'tender-images' and public.is_admin());

drop policy if exists "Admins upload tender images" on storage.objects;
create policy "Admins upload tender images" on storage.objects for insert to authenticated
with check (bucket_id = 'tender-images' and public.is_admin());

drop policy if exists "Admins update tender images" on storage.objects;
create policy "Admins update tender images" on storage.objects for update to authenticated
using (bucket_id = 'tender-images' and public.is_admin())
with check (bucket_id = 'tender-images' and public.is_admin());

drop policy if exists "Admins delete tender images" on storage.objects;
create policy "Admins delete tender images" on storage.objects for delete to authenticated
using (bucket_id = 'tender-images' and public.is_admin());

-- 2. One row per image ---------------------------------------------------------------------------
create table if not exists public.tender_images (
  id            uuid primary key default gen_random_uuid(),
  image_path    text,                       -- null after the image is deleted (the text stays)
  original_name text,
  size_bytes    integer,
  source_paper  text not null default '',   -- e.g. Al-Ahram
  page          text,                       -- text, so "12" or "12-13" both work
  publish_date  date,
  status        text not null default 'uploaded'
                check (status in ('uploaded', 'text_read', 'parsed', 'approved')),
  ocr_text      text,                       -- Phase 3
  ocr_provider  text,                       -- Phase 3: 'ocrspace' or 'gemini'
  created_by    uuid references auth.users(id) on delete set null default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tender_images_created_idx on public.tender_images (created_at desc);
create index if not exists tender_images_status_idx  on public.tender_images (status);
alter table public.tender_images enable row level security;

drop policy if exists "Admins manage tender images" on public.tender_images;
create policy "Admins manage tender images" on public.tender_images for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- 3. Many tenders per image ----------------------------------------------------------------------
create table if not exists public.tenders (
  id            uuid primary key default gen_random_uuid(),
  image_id      uuid references public.tender_images(id) on delete set null,
  entity        text not null default '',   -- the authority issuing the tender
  subject       text not null default '',
  booklet_price numeric(14, 2) check (booklet_price >= 0),
  session_date  date,
  bid_bond      text,                       -- text: can be an amount or a percentage
  source_paper  text,                       -- copied from the image row, kept after the image is deleted
  page          text,
  publish_date  date,
  link          text,
  sector_ids    text[] not null default '{}',  -- a tender can belong to several sectors (sectors.id)
  status        text not null default 'draft' check (status in ('draft', 'approved')),
  raw_text      text,                       -- the exact text this row was read from (for checking)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tenders_image_idx   on public.tenders (image_id);
create index if not exists tenders_status_idx  on public.tenders (status);
create index if not exists tenders_session_idx on public.tenders (session_date);
create index if not exists tenders_sectors_idx on public.tenders using gin (sector_ids);
alter table public.tenders enable row level security;

drop policy if exists "Admins manage tenders" on public.tenders;
create policy "Admins manage tenders" on public.tenders for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Check: the bucket line should show 1048576, and both counts should be 0.
select id, public, file_size_limit from storage.buckets where id = 'tender-images';
select count(*) as tender_images from public.tender_images;
select count(*) as tenders       from public.tenders;
