-- KHIP client area, STEP 1: user details + dated subscriptions.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER supabase-setup.sql.
-- Safe to run again: every statement is idempotent.
--
-- What it does
--  1. client_profiles: name, mobile and company for each client account.
--  2. subscription_periods: one row per client + sector + period (start date, end date).
--     The end date is calculated here from the duration (1 week, 1 year or 2 years), and the
--     database refuses two overlapping periods for the same client and sector, so a renewal
--     can only start after the current period ends.
--  3. Access by date: a client can read a sector (and its files) only while today (Cairo time)
--     is between the start and end date of one of their periods.
--  4. Your existing subscriptions are copied once as "1 year starting today" so nobody loses access.
--     The old table is kept, renamed to subscriptions_legacy.

create extension if not exists btree_gist;

-- Today's date in Cairo, used for every access check
create or replace function public.today_cairo()
returns date language sql stable
as $$ select (now() at time zone 'Africa/Cairo')::date $$;
grant execute on function public.today_cairo() to authenticated;

-- 1. Client details ---------------------------------------------------------------------------
create table if not exists public.client_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  mobile     text,
  company    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_profiles enable row level security;

drop policy if exists "Admins manage client profiles" on public.client_profiles;
create policy "Admins manage client profiles" on public.client_profiles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Clients read their own profile" on public.client_profiles;
create policy "Clients read their own profile" on public.client_profiles for select to authenticated
using (user_id = auth.uid());

-- 2. Subscription periods ---------------------------------------------------------------------
create table if not exists public.subscription_periods (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  sector_id        text not null references public.sectors(id) on delete cascade,
  duration         text not null check (duration in ('1 week', '1 year', '2 years')),
  start_date       date not null,
  end_date         date not null,                -- inclusive; calculated by the trigger below
  reminder_sent_at timestamptz,                  -- used by the renewal reminder (step 2)
  created_at       timestamptz not null default now(),
  check (end_date >= start_date),
  constraint subscription_no_overlap
    exclude using gist (user_id with =, sector_id with =, daterange(start_date, end_date, '[]') with &&)
);
create index if not exists subscription_periods_user_idx on public.subscription_periods (user_id);
alter table public.subscription_periods enable row level security;

-- end date = start + duration - 1 day (so a 1 year subscription from 27 Oct 2026 ends 26 Oct 2027)
create or replace function public.set_period_end()
returns trigger language plpgsql
as $$
begin
  new.end_date := (new.start_date
    + case new.duration when '1 week' then interval '1 week'
                        when '1 year' then interval '1 year'
                        else interval '2 years' end
    - interval '1 day')::date;
  return new;
end $$;
drop trigger if exists subscription_set_end on public.subscription_periods;
create trigger subscription_set_end before insert or update of start_date, duration
on public.subscription_periods for each row execute function public.set_period_end();

drop policy if exists "Admins manage subscription periods" on public.subscription_periods;
create policy "Admins manage subscription periods" on public.subscription_periods for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Clients read their own periods" on public.subscription_periods;
create policy "Clients read their own periods" on public.subscription_periods for select to authenticated
using (user_id = auth.uid());

-- 3. Access by date ---------------------------------------------------------------------------
drop policy if exists "Read own sectors" on public.sectors;
create policy "Read own sectors" on public.sectors for select to authenticated
using (
  public.is_admin()
  or exists (select 1 from public.subscription_periods p
             where p.sector_id = sectors.id and p.user_id = auth.uid()
               and public.today_cairo() between p.start_date and p.end_date)
);

drop policy if exists "Subscribers read their sectors" on storage.objects;
create policy "Subscribers read their sectors"
on storage.objects for select to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = 'sectors'
  and exists (
    select 1 from public.subscription_periods p
    where p.user_id = auth.uid() and p.sector_id = (storage.foldername(name))[2]
      and public.today_cairo() between p.start_date and p.end_date
  )
);

-- 4. Keep the subscriptions you already had (once), then retire the old table ---------------
do $$
begin
  if to_regclass('public.subscriptions') is not null then
    insert into public.subscription_periods (user_id, sector_id, duration, start_date, end_date)
    select s.user_id, s.sector_id, '1 year', public.today_cairo(), public.today_cairo()
    from public.subscriptions s
    where not exists (select 1 from public.subscription_periods p
                      where p.user_id = s.user_id and p.sector_id = s.sector_id);
    alter table public.subscriptions rename to subscriptions_legacy;
  end if;
end $$;

-- Check: both lines should return without an error.
select count(*) as profiles from public.client_profiles;
select count(*) as periods   from public.subscription_periods;
