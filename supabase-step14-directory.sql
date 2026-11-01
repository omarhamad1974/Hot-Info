-- STEP 14 (phase 14a): Directory of companies, institutions and freelancers.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again.
-- Needs supabase-setup.sql (public.is_admin) to have been run before.
--
-- 1. directory_sectors: the business sectors used ONLY by the directory (separate from the tender sectors),
--    each with an English and an Arabic name. Anyone can read them. Only admins change them.
-- 2. directory_entries: one row per company / institution / freelancer. One sector each.
--    Status: pending (new, not shown) > approved (shown to everyone) > rejected (not shown).
--    Visitors who are not signed in can read APPROVED rows only. Only admins can add, edit, approve or delete.
-- 3. directory-images: a PUBLIC picture bucket (1 MB per file) so the pictures show for free visitors.
--    Only admins can upload, replace or delete.

-- 1. Sectors -----------------------------------------------------------------------------------
create table if not exists public.directory_sectors (
  id         text primary key check (id ~ '^[a-z0-9][a-z0-9-]*$'),
  name       text not null check (length(btrim(name)) > 0),
  name_ar    text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);
alter table public.directory_sectors enable row level security;

drop policy if exists "Anyone reads directory sectors" on public.directory_sectors;
create policy "Anyone reads directory sectors" on public.directory_sectors
for select to anon, authenticated using (true);

drop policy if exists "Admins manage directory sectors" on public.directory_sectors;
create policy "Admins manage directory sectors" on public.directory_sectors
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.directory_sectors (id, name, name_ar, sort_order) values
  ('construction',   'Construction & Contracting',  'المقاولات والإنشاءات',        10),
  ('engineering',    'Engineering & Consulting',    'الهندسة والاستشارات',         20),
  ('industry',       'Industry & Manufacturing',    'الصناعة والتصنيع',            30),
  ('trading',        'Trading & Supplies',          'التجارة والتوريدات',          40),
  ('it',             'IT & Software',               'تكنولوجيا المعلومات والبرمجيات', 50),
  ('medical',        'Medical & Health',            'الطب والصحة',                 60),
  ('education',      'Education & Training',        'التعليم والتدريب',            70),
  ('legal-finance',  'Legal & Finance',             'القانون والمال',              80),
  ('transport',      'Transport & Logistics',       'النقل والخدمات اللوجستية',    90),
  ('food-hospitality','Food & Hospitality',         'الأغذية والضيافة',            100),
  ('marketing-media','Marketing & Media',           'التسويق والإعلام',            110),
  ('real-estate',    'Real Estate',                 'العقارات',                    120),
  ('other',          'Other',                       'أخرى',                        900)
on conflict (id) do nothing;

-- 2. Entries -----------------------------------------------------------------------------------
create table if not exists public.directory_entries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(btrim(name)) > 0),
  name_ar       text,
  entry_type    text not null check (entry_type in ('company', 'institution', 'freelancer')),
  sector_id     text not null references public.directory_sectors(id) on update cascade on delete restrict,
  description   text,                    -- longer text for the detail page (supports the site's ** ## - formatting)
  address       text,
  city          text,
  phones        text[] not null default '{}',
  whatsapp      text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),   -- digits only, with country code, e.g. 201001234567
  email         text,
  website_url   text,
  social_url    text,                    -- Facebook / Instagram / LinkedIn page, etc.
  offer_title   text,                    -- short badge text on the card, e.g. "10% off for subscribers"
  offer_text    text,                    -- full offer, shown on the detail page
  offer_ends    date,                    -- empty = no end date
  image_path    text,                    -- file name inside the directory-images bucket
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists directory_entries_status_idx on public.directory_entries (status);
create index if not exists directory_entries_sector_idx on public.directory_entries (sector_id);
create index if not exists directory_entries_type_idx   on public.directory_entries (entry_type);

-- Keeps updated_at and approved_at correct without the page having to send them.
create or replace function public.directory_entries_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status <> 'approved' then
    new.approved_at := null;
  elsif tg_op = 'INSERT' then
    new.approved_at := coalesce(new.approved_at, now());
  elsif old.status is distinct from 'approved' then
    new.approved_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists directory_entries_touch_trg on public.directory_entries;
create trigger directory_entries_touch_trg
before insert or update on public.directory_entries
for each row execute function public.directory_entries_touch();

alter table public.directory_entries enable row level security;

-- Everyone (signed in or not) reads APPROVED entries only. The check is made here, not in the page.
drop policy if exists "Anyone reads approved directory entries" on public.directory_entries;
create policy "Anyone reads approved directory entries" on public.directory_entries
for select to anon, authenticated using (status = 'approved');

-- Admins see and change everything (pending and rejected too).
drop policy if exists "Admins manage directory entries" on public.directory_entries;
create policy "Admins manage directory entries" on public.directory_entries
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3. Pictures ----------------------------------------------------------------------------------
-- PUBLIC bucket: the picture address works for visitors who are not signed in. 1 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('directory-images', 'directory-images', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload directory images" on storage.objects;
create policy "Admins upload directory images" on storage.objects
for insert to authenticated with check (bucket_id = 'directory-images' and public.is_admin());

drop policy if exists "Admins update directory images" on storage.objects;
create policy "Admins update directory images" on storage.objects
for update to authenticated
using (bucket_id = 'directory-images' and public.is_admin())
with check (bucket_id = 'directory-images' and public.is_admin());

drop policy if exists "Admins delete directory images" on storage.objects;
create policy "Admins delete directory images" on storage.objects
for delete to authenticated using (bucket_id = 'directory-images' and public.is_admin());

drop policy if exists "Admins list directory images" on storage.objects;
create policy "Admins list directory images" on storage.objects
for select to authenticated using (bucket_id = 'directory-images' and public.is_admin());

-- Check: should print the 13 starter sectors, 0 entries, and the bucket row.
select count(*) as directory_sectors from public.directory_sectors;
select count(*) as directory_entries from public.directory_entries;
select id, public, file_size_limit from storage.buckets where id = 'directory-images';
