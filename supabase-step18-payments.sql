-- KHIP STEP 18: manual online payment (CIB, InstaPay, Vodafone Cash, Fawry) with admin approval.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER steps 1 to 17.
-- Safe to run again: every statement is idempotent (your prices and account details are NOT overwritten).
--
-- No payment gateway. The user pays in their own app, uploads the receipt / QR screenshot, you approve.
--  1. Adds the "6 months" duration to subscription_periods.
--  2. payment_packages: weekly (free), 6 months, 1 year, 2 years. You enter the prices in admin > Payments.
--  3. payment_methods: the four ways to pay, with your account details, instructions and QR image.
--  4. subscription_requests: what users ask for. Users cannot write to it directly: they call
--     request_subscription(). Admin approves with approve_subscription_request(), which creates the
--     subscription periods (renewals start the day after the current period ends).
--  5. Buckets: payment-receipts (PRIVATE, owner + admin only) and payment-assets (public, for QR images).

-- 1. 6 months -----------------------------------------------------------------------------------
alter table public.subscription_periods drop constraint if exists subscription_periods_duration_check;
alter table public.subscription_periods
  add constraint subscription_periods_duration_check check (duration in ('1 week', '6 months', '1 year', '2 years'));

create or replace function public.set_period_end()
returns trigger language plpgsql
as $$
begin
  new.end_date := (new.start_date
    + case new.duration when '1 week'   then interval '1 week'
                        when '6 months' then interval '6 months'
                        when '1 year'   then interval '1 year'
                        else interval '2 years' end
    - interval '1 day')::date;
  return new;
end $$;

-- 2. Packages -----------------------------------------------------------------------------------
create table if not exists public.payment_packages (
  code                text primary key,
  duration            text not null check (duration in ('1 week', '6 months', '1 year', '2 years')),
  name                text not null,
  name_ar             text,
  price               numeric(10,2) not null default 0 check (price >= 0),   -- per sector; 0 = free (admin approval only)
  currency            text not null default 'EGP',
  active              boolean not null default true,
  max_per_user_sector int,                                                    -- e.g. 1 = the free week can be taken once per sector
  sort_order          int not null default 100,
  updated_at          timestamptz not null default now()
);
alter table public.payment_packages enable row level security;

insert into public.payment_packages (code, duration, name, name_ar, price, max_per_user_sector, sort_order) values
  ('week', '1 week',   'Weekly (free trial)', 'أسبوعي (تجريبي مجاني)', 0, 1, 10),
  ('6m',   '6 months', '6 months',            '6 أشهر',               0, null, 20),
  ('1y',   '1 year',   '1 year',              'سنة',                  0, null, 30),
  ('2y',   '2 years',  '2 years',             'سنتان',                0, null, 40)
on conflict (code) do nothing;

drop policy if exists "Everyone reads active packages" on public.payment_packages;
create policy "Everyone reads active packages" on public.payment_packages for select to anon, authenticated
using (active or public.is_admin());
drop policy if exists "Admins manage packages" on public.payment_packages;
create policy "Admins manage packages" on public.payment_packages for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- 3. Payment methods ----------------------------------------------------------------------------
create table if not exists public.payment_methods (
  code            text primary key,
  name            text not null,
  name_ar         text,
  account_name    text,            -- who the money goes to
  account_number  text,            -- card / IBAN / InstaPay address / wallet number / Fawry code
  instructions    text,
  instructions_ar text,
  qr_path         text,            -- file name inside the public payment-assets bucket
  active          boolean not null default false,   -- turn on in admin once the details are filled in
  sort_order      int not null default 100,
  updated_at      timestamptz not null default now()
);
alter table public.payment_methods enable row level security;

insert into public.payment_methods (code, name, name_ar, sort_order) values
  ('cib',           'CIB bank transfer', 'تحويل بنكي (CIB)', 10),
  ('instapay',      'InstaPay',          'إنستا باي',        20),
  ('vodafone_cash', 'Vodafone Cash',     'فودافون كاش',      30),
  ('fawry',         'Fawry',             'فوري',             40)
on conflict (code) do nothing;

drop policy if exists "Everyone reads active methods" on public.payment_methods;
create policy "Everyone reads active methods" on public.payment_methods for select to authenticated
using (active or public.is_admin());
drop policy if exists "Admins manage methods" on public.payment_methods;
create policy "Admins manage methods" on public.payment_methods for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- 4. Requests -----------------------------------------------------------------------------------
create table if not exists public.subscription_requests (
  id            uuid primary key default gen_random_uuid(),
  ref           bigint generated always as identity,          -- short number shown to the user and in admin
  user_id       uuid not null references auth.users(id) on delete cascade,
  package_code  text not null references public.payment_packages(code),
  duration      text not null,
  sector_ids    text[] not null,
  amount        numeric(10,2) not null default 0,             -- total = price x number of sectors, calculated here
  currency      text not null default 'EGP',
  method_code   text references public.payment_methods(code),
  receipt_path  text,                                         -- path inside the private payment-receipts bucket
  user_note     text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  admin_note    text,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id)
);
create index if not exists subscription_requests_user_idx   on public.subscription_requests (user_id, created_at desc);
create index if not exists subscription_requests_status_idx on public.subscription_requests (status, created_at);
alter table public.subscription_requests enable row level security;

drop policy if exists "Users read own requests" on public.subscription_requests;
create policy "Users read own requests" on public.subscription_requests for select to authenticated
using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Admins manage requests" on public.subscription_requests;
create policy "Admins manage requests" on public.subscription_requests for all to authenticated
using (public.is_admin()) with check (public.is_admin());
-- (no insert / update policy for users: they only use the functions below)

-- 5. Buckets ------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('payment-receipts', 'payment-receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('payment-assets',   'payment-assets',   true,  2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- receipts: each user writes and reads only inside a folder named after their own user id; admins read / delete all
drop policy if exists "Users upload own receipts" on storage.objects;
create policy "Users upload own receipts" on storage.objects for insert to authenticated
with check (bucket_id = 'payment-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users read own receipts" on storage.objects;
create policy "Users read own receipts" on storage.objects for select to authenticated
using (bucket_id = 'payment-receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "Admins delete receipts" on storage.objects;
create policy "Admins delete receipts" on storage.objects for delete to authenticated
using (bucket_id = 'payment-receipts' and public.is_admin());

-- QR images: public to read (public bucket), admin only to write
drop policy if exists "Admins write payment assets" on storage.objects;
create policy "Admins write payment assets" on storage.objects for insert to authenticated
with check (bucket_id = 'payment-assets' and public.is_admin());
drop policy if exists "Admins update payment assets" on storage.objects;
create policy "Admins update payment assets" on storage.objects for update to authenticated
using (bucket_id = 'payment-assets' and public.is_admin()) with check (bucket_id = 'payment-assets' and public.is_admin());
drop policy if exists "Admins delete payment assets" on storage.objects;
create policy "Admins delete payment assets" on storage.objects for delete to authenticated
using (bucket_id = 'payment-assets' and public.is_admin());
drop policy if exists "Admins list payment assets" on storage.objects;
create policy "Admins list payment assets" on storage.objects for select to authenticated
using (bucket_id = 'payment-assets' and public.is_admin());

-- 6. Functions ----------------------------------------------------------------------------------
-- A user sends a request. The amount is calculated here from the package price, never taken from the browser.
create or replace function public.request_subscription(
  p_package text, p_sectors text[], p_method text default null, p_receipt text default null, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_pkg  public.payment_packages%rowtype;
  v_secs text[];
  v_id   uuid := gen_random_uuid();
begin
  if v_uid is null then raise exception 'Please sign in first.'; end if;
  select * into v_pkg from public.payment_packages where code = p_package and active;
  if not found then raise exception 'This package is not available.'; end if;

  select coalesce(array_agg(distinct s.id), '{}') into v_secs from public.sectors s where s.id = any(coalesce(p_sectors, '{}'));
  if coalesce(array_length(v_secs, 1), 0) = 0 then raise exception 'Choose at least one sector.'; end if;
  if array_length(v_secs, 1) > 30 then raise exception 'Too many sectors in one request.'; end if;

  if (select count(*) from public.subscription_requests where user_id = v_uid and status = 'pending') >= 5 then
    raise exception 'You already have 5 requests waiting for approval. Please wait for them to be reviewed.';
  end if;
  if exists (select 1 from public.subscription_requests r
             where r.user_id = v_uid and r.status = 'pending' and r.package_code = v_pkg.code and r.sector_ids && v_secs) then
    raise exception 'You already have a pending request for this package and one of these sectors.';
  end if;

  if v_pkg.max_per_user_sector is not null then
    if exists (
      select 1 from unnest(v_secs) x(sid)
      where (select count(*) from public.subscription_requests r
             where r.user_id = v_uid and r.package_code = v_pkg.code and r.status in ('pending', 'approved') and x.sid = any(r.sector_ids))
            >= v_pkg.max_per_user_sector
    ) then
      raise exception 'The free trial can be used only once for each sector.';
    end if;
  end if;

  if v_pkg.price > 0 then
    if p_method is null or not exists (select 1 from public.payment_methods where code = p_method and active) then
      raise exception 'Choose how you paid.';
    end if;
    if p_receipt is null or p_receipt not like v_uid::text || '/%' then
      raise exception 'Upload your receipt or QR screenshot.';
    end if;
  end if;

  insert into public.subscription_requests (id, user_id, package_code, duration, sector_ids, amount, currency, method_code, receipt_path, user_note)
  values (v_id, v_uid, v_pkg.code, v_pkg.duration, v_secs, v_pkg.price * array_length(v_secs, 1), v_pkg.currency,
          case when v_pkg.price > 0 then p_method end, case when v_pkg.price > 0 then p_receipt end,
          nullif(left(btrim(coalesce(p_note, '')), 500), ''));
  return v_id;
end $$;
revoke all on function public.request_subscription(text, text[], text, text, text) from public, anon;
grant execute on function public.request_subscription(text, text[], text, text, text) to authenticated;

-- A user withdraws their own pending request.
create or replace function public.cancel_subscription_request(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.subscription_requests set status = 'cancelled', reviewed_at = now()
  where id = p_id and user_id = auth.uid() and status = 'pending';
  if not found then raise exception 'This request can no longer be cancelled.'; end if;
end $$;
revoke all on function public.cancel_subscription_request(uuid) from public, anon;
grant execute on function public.cancel_subscription_request(uuid) to authenticated;

-- Admin approves: creates one subscription period per sector. Start = today (or p_start), but never before the day
-- after the user's last period for that sector ends, so renewals simply continue.
create or replace function public.approve_subscription_request(p_id uuid, p_start date default null, p_note text default null)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  r public.subscription_requests%rowtype;
  v_sid text; v_start date; v_last date; v_n int := 0;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  select * into r from public.subscription_requests where id = p_id for update;
  if not found then raise exception 'Request not found.'; end if;
  if r.status <> 'pending' then raise exception 'This request was already handled (%).', r.status; end if;

  foreach v_sid in array r.sector_ids loop
    if not exists (select 1 from public.sectors where id = v_sid) then continue; end if;  -- sector deleted meanwhile
    select max(end_date) into v_last from public.subscription_periods where user_id = r.user_id and sector_id = v_sid;
    v_start := greatest(coalesce(p_start, public.today_cairo()), coalesce(v_last + 1, public.today_cairo()));
    insert into public.subscription_periods (user_id, sector_id, duration, start_date, end_date)
    values (r.user_id, v_sid, r.duration, v_start, v_start);   -- end_date is recalculated by the trigger
    v_n := v_n + 1;
  end loop;
  if v_n = 0 then raise exception 'None of the requested sectors exist any more.'; end if;

  update public.subscription_requests
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(), admin_note = nullif(btrim(coalesce(p_note, '')), '')
  where id = p_id;
  return v_n;
end $$;
revoke all on function public.approve_subscription_request(uuid, date, text) from public, anon;
grant execute on function public.approve_subscription_request(uuid, date, text) to authenticated;

create or replace function public.reject_subscription_request(p_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  update public.subscription_requests
  set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), admin_note = nullif(btrim(coalesce(p_note, '')), '')
  where id = p_id and status = 'pending';
  if not found then raise exception 'This request was already handled.'; end if;
end $$;
revoke all on function public.reject_subscription_request(uuid, text) from public, anon;
grant execute on function public.reject_subscription_request(uuid, text) to authenticated;

-- Check: 4 packages, 4 methods, 0 requests, two buckets, four functions.
select count(*) as packages from public.payment_packages;
select count(*) as methods  from public.payment_methods;
select count(*) as requests from public.subscription_requests;
select id, public from storage.buckets where id in ('payment-receipts', 'payment-assets');
select proname from pg_proc where proname in ('request_subscription', 'cancel_subscription_request', 'approve_subscription_request', 'reject_subscription_request');
