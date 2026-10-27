-- KHIP client area: run ONCE in Supabase > SQL Editor > New query > paste > Run.
-- Safe to run again later: every statement is idempotent.
--
-- Before you run it, create your own admin login:
--   Authentication > Users > Add user > Create new user (tick "Auto Confirm User").
-- Then put that email in step 5 below.

-- 1. PRIVATE bucket for client files (50 MB per file is the free-plan ceiling)
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- 2. Who is an admin?
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- SECURITY DEFINER so the check works inside policies without recursion.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins see the admin list" on public.admins;
create policy "Admins see the admin list"
on public.admins for select to authenticated
using (public.is_admin());
-- No insert/update/delete policies: admins are added from this SQL editor only.

-- 3. Clients: read ONLY inside the folder named after their own email (lowercase)
drop policy if exists "Users read their own folder" on storage.objects;
create policy "Users read their own folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = lower(auth.jwt() ->> 'email')
);

-- 4. Admins: full control of the bucket (upload, list, replace, delete)
drop policy if exists "Admins read all client files" on storage.objects;
create policy "Admins read all client files"
on storage.objects for select to authenticated
using (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins upload client files" on storage.objects;
create policy "Admins upload client files"
on storage.objects for insert to authenticated
with check (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins update client files" on storage.objects;
create policy "Admins update client files"
on storage.objects for update to authenticated
using (bucket_id = 'client-files' and public.is_admin())
with check (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins delete client files" on storage.objects;
create policy "Admins delete client files"
on storage.objects for delete to authenticated
using (bucket_id = 'client-files' and public.is_admin());

-- 4b. SECTORS: shared libraries (for example "construction", "engineering").
-- Files live in  client-files/sectors/<sector-id>/...  and a client can read a sector
-- only while they are subscribed to it. One client can hold any number of subscriptions.
create table if not exists public.sectors (
  id   text primary key check (id ~ '^[a-z0-9][a-z0-9-]*$'),   -- folder name, e.g. construction
  name text not null,                                            -- display name, e.g. Construction
  created_at timestamptz not null default now()
);
create table if not exists public.subscriptions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  sector_id  text not null references public.sectors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, sector_id)
);
alter table public.sectors enable row level security;
alter table public.subscriptions enable row level security;

-- Clients see only the sectors they subscribe to (names included); admins see all.
drop policy if exists "Read own sectors" on public.sectors;
create policy "Read own sectors" on public.sectors for select to authenticated
using (public.is_admin() or exists (select 1 from public.subscriptions s where s.sector_id = sectors.id and s.user_id = auth.uid()));
drop policy if exists "Admins manage sectors" on public.sectors;
create policy "Admins manage sectors" on public.sectors for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Read own subscriptions" on public.subscriptions;
create policy "Read own subscriptions" on public.subscriptions for select to authenticated
using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions" on public.subscriptions for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Subscribers read the files of the sectors they subscribe to
drop policy if exists "Subscribers read their sectors" on storage.objects;
create policy "Subscribers read their sectors"
on storage.objects for select to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = 'sectors'
  and exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid() and s.sector_id = (storage.foldername(name))[2]
  )
);

-- 4c. Starter sectors. Rename, add or remove them later in admin.html > Client files > Sectors.
insert into public.sectors (id, name) values
  ('construction', 'Construction'),
  ('engineering',  'Engineering')
on conflict (id) do nothing;

-- 5. Make yourself the first admin (change the email, then run the whole script)
insert into public.admins (user_id, email)
select id, email from auth.users
where lower(email) = lower('omar.hamad@gmail.com')
on conflict (user_id) do nothing;

-- Check: this should return one row with your email.
select * from public.admins;
