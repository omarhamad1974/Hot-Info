-- KHIP STEP 19: self sign-up goes straight into Leads, and orders with one package PER SECTOR.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER supabase-step18-payments.sql.
-- Safe to run again: every statement is idempotent.
--
--  1. A person who creates an account on the website gets a profile (name, mobile, company) and is added
--     to Leads automatically (status "Lead"). When they send a subscription request the lead becomes
--     "Potential"; when you approve a request it becomes "Converted".
--  2. subscription_requests gets an "items" column: one line per sector with its own package and price.
--     The old columns stay, so requests made before this step keep working.
--  3. request_subscription_items(): the user sends the lines, the database calculates every price and the total.
--  4. approve_subscription_request(): creates one subscription period per line (each with its own duration).
--  5. Realtime is switched on for subscription_requests so the admin page can alert you at once.

-- 1. Sign-up -> profile + lead ------------------------------------------------------------------
create or replace function public.handle_web_signup()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email  text  := lower(btrim(coalesce(new.email, '')));
  v_name   text;
  v_mobile text;
  v_comp   text;
begin
  -- only people who used the website sign-up form (it sends signup = 'web'); invited clients are handled by the admin page
  if coalesce(m->>'signup', '') <> 'web' then return new; end if;
  begin
    v_name   := nullif(left(btrim(coalesce(m->>'full_name', '')), 120), '');
    v_mobile := nullif(left(btrim(coalesce(m->>'mobile', '')), 40), '');
    v_comp   := nullif(left(btrim(coalesce(m->>'company', '')), 120), '');
    insert into public.client_profiles (user_id, email, full_name, mobile, company)
    values (new.id, v_email, v_name, v_mobile, v_comp)
    on conflict (user_id) do nothing;
    if v_email <> '' and not exists (select 1 from public.leads where lower(email) = v_email) then
      insert into public.leads (name, email, mobile, company, status, status_note)
      values (coalesce(v_name, split_part(v_email, '@', 1)), v_email, coalesce(v_mobile, '-'), v_comp, 'lead', 'Signed up on the website');
    end if;
  exception when others then
    null;   -- never block a sign-up because of the lead record
  end;
  return new;
end $$;
revoke all on function public.handle_web_signup() from public, anon, authenticated;

drop trigger if exists khip_web_signup on auth.users;
create trigger khip_web_signup after insert on auth.users
for each row execute function public.handle_web_signup();

-- 2. Orders: one package per sector -----------------------------------------------------------------
alter table public.subscription_requests add column if not exists items jsonb;
-- items = [{"sector_id":"...","package":"6m","duration":"6 months","price":500}, ...]
-- package_code / duration stay filled only when every line uses the same package (older requests always do)
alter table public.subscription_requests alter column package_code drop not null;
alter table public.subscription_requests alter column duration drop not null;

-- how many requests (old or new style) a user has for one sector + package, in the given statuses
create or replace function public.sub_req_count(p_uid uuid, p_sid text, p_pkg text, p_st text[])
returns int
language sql stable security definer set search_path = public
as $$
  select count(*)::int from public.subscription_requests r
  where r.user_id = p_uid and r.status = any(p_st)
    and ( (r.items is null and r.package_code = p_pkg and p_sid = any(r.sector_ids))
       or (r.items is not null and exists (select 1 from jsonb_array_elements(r.items) i
                                           where i->>'sector_id' = p_sid and i->>'package' = p_pkg)) );
$$;
revoke all on function public.sub_req_count(uuid, text, text, text[]) from public, anon, authenticated;

-- 3. The user sends an order. Every price and the total are calculated HERE, never taken from the browser.
create or replace function public.request_subscription_items(
  p_items jsonb, p_method text default null, p_receipt text default null, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_id    uuid := gen_random_uuid();
  v_it    jsonb;
  v_sid   text;
  v_pkg   public.payment_packages%rowtype;
  v_items jsonb := '[]'::jsonb;
  v_secs  text[] := '{}';
  v_codes text[] := '{}';
  v_total numeric := 0;
  v_cur   text;
  v_mail  text;
begin
  if v_uid is null then raise exception 'Please sign in first.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Choose a package for at least one sector.';
  end if;
  if jsonb_array_length(p_items) > 30 then raise exception 'Too many sectors in one request.'; end if;

  for v_it in select * from jsonb_array_elements(p_items) loop
    v_sid := v_it->>'sector_id';
    if v_sid is null or not exists (select 1 from public.sectors where id = v_sid) then
      raise exception 'One of the sectors does not exist any more.';
    end if;
    if v_sid = any(v_secs) then raise exception 'Each sector can appear only once in a request.'; end if;
    select * into v_pkg from public.payment_packages where code = v_it->>'package' and active;
    if not found then raise exception 'One of the packages is not available.'; end if;

    if public.sub_req_count(v_uid, v_sid, v_pkg.code, array['pending']) > 0 then
      raise exception 'You already have a pending request for % in one of these sectors.', v_pkg.name;
    end if;
    if v_pkg.max_per_user_sector is not null
       and public.sub_req_count(v_uid, v_sid, v_pkg.code, array['pending', 'approved']) >= v_pkg.max_per_user_sector then
      raise exception 'The free trial can be used only once for each sector.';
    end if;

    v_secs  := v_secs || v_sid;
    v_codes := v_codes || v_pkg.code;
    v_total := v_total + v_pkg.price;
    v_cur   := coalesce(v_cur, v_pkg.currency);
    v_items := v_items || jsonb_build_object('sector_id', v_sid, 'package', v_pkg.code, 'duration', v_pkg.duration, 'price', v_pkg.price);
  end loop;

  if (select count(*) from public.subscription_requests where user_id = v_uid and status = 'pending') >= 5 then
    raise exception 'You already have 5 requests waiting for approval. Please wait for them to be reviewed.';
  end if;

  if v_total > 0 then
    if p_method is null or not exists (select 1 from public.payment_methods where code = p_method and active) then
      raise exception 'Choose how you paid.';
    end if;
    if p_receipt is null or p_receipt not like v_uid::text || '/%' then
      raise exception 'Upload your receipt or QR screenshot.';
    end if;
  end if;

  insert into public.subscription_requests
    (id, user_id, package_code, duration, sector_ids, amount, currency, method_code, receipt_path, user_note, items)
  values (v_id, v_uid,
          case when (select count(distinct c) from unnest(v_codes) c) = 1 then v_codes[1] end,
          case when (select count(distinct i->>'duration') from jsonb_array_elements(v_items) i) = 1 then v_items->0->>'duration' end,
          v_secs, v_total, coalesce(v_cur, 'EGP'),
          case when v_total > 0 then p_method end, case when v_total > 0 then p_receipt end,
          nullif(left(btrim(coalesce(p_note, '')), 500), ''), v_items);

  -- the lead moves forward: Lead -> Potential once a request is sent
  select lower(email) into v_mail from auth.users where id = v_uid;
  update public.leads set status = 'potential', updated_at = now()
  where status = 'lead' and lower(email) = v_mail;

  return v_id;
end $$;
revoke all on function public.request_subscription_items(jsonb, text, text, text) from public, anon;
grant execute on function public.request_subscription_items(jsonb, text, text, text) to authenticated;

-- the older one-package call now just builds the lines and uses the function above
create or replace function public.request_subscription(
  p_package text, p_sectors text[], p_method text default null, p_receipt text default null, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
begin
  return public.request_subscription_items(
    (select coalesce(jsonb_agg(jsonb_build_object('sector_id', s, 'package', p_package)), '[]'::jsonb)
     from (select distinct unnest(coalesce(p_sectors, '{}')) as s) x),
    p_method, p_receipt, p_note);
end $$;
revoke all on function public.request_subscription(text, text[], text, text, text) from public, anon;
grant execute on function public.request_subscription(text, text[], text, text, text) to authenticated;

-- 4. Admin approves: one subscription period per line, each with its own duration. Start = today (or p_start),
--    but never before the day after the user's last period for that sector ends, so renewals simply continue.
create or replace function public.approve_subscription_request(p_id uuid, p_start date default null, p_note text default null)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  r public.subscription_requests%rowtype;
  v_it jsonb; v_lines jsonb;
  v_sid text; v_dur text; v_start date; v_last date; v_n int := 0; v_mail text;
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  select * into r from public.subscription_requests where id = p_id for update;
  if not found then raise exception 'Request not found.'; end if;
  if r.status <> 'pending' then raise exception 'This request was already handled (%).', r.status; end if;

  v_lines := coalesce(r.items,
    (select jsonb_agg(jsonb_build_object('sector_id', s, 'duration', r.duration)) from unnest(r.sector_ids) s));

  for v_it in select * from jsonb_array_elements(coalesce(v_lines, '[]'::jsonb)) loop
    v_sid := v_it->>'sector_id'; v_dur := v_it->>'duration';
    if not exists (select 1 from public.sectors where id = v_sid) then continue; end if;   -- sector deleted meanwhile
    select max(end_date) into v_last from public.subscription_periods where user_id = r.user_id and sector_id = v_sid;
    v_start := greatest(coalesce(p_start, public.today_cairo()), coalesce(v_last + 1, public.today_cairo()));
    insert into public.subscription_periods (user_id, sector_id, duration, start_date, end_date)
    values (r.user_id, v_sid, v_dur, v_start, v_start);   -- end_date is recalculated by the trigger
    v_n := v_n + 1;
  end loop;
  if v_n = 0 then raise exception 'None of the requested sectors exist any more.'; end if;

  update public.subscription_requests
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(), admin_note = nullif(btrim(coalesce(p_note, '')), '')
  where id = p_id;

  -- the lead of this person becomes "Converted"
  select lower(email) into v_mail from auth.users where id = r.user_id;
  update public.leads set status = 'converted', converted_user_id = r.user_id, updated_at = now()
  where status <> 'converted' and lower(email) = v_mail;

  return v_n;
end $$;
revoke all on function public.approve_subscription_request(uuid, date, text) from public, anon;
grant execute on function public.approve_subscription_request(uuid, date, text) to authenticated;

-- 5. Realtime: the admin page hears about new requests immediately -----------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'subscription_requests') then
    alter publication supabase_realtime add table public.subscription_requests;
  end if;
end $$;

-- Check: the trigger, the new column, the functions, and realtime.
select tgname from pg_trigger where tgname = 'khip_web_signup';
select column_name from information_schema.columns where table_schema = 'public' and table_name = 'subscription_requests' and column_name = 'items';
select proname from pg_proc where proname in ('handle_web_signup', 'request_subscription_items', 'request_subscription', 'approve_subscription_request', 'sub_req_count');
select tablename from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'subscription_requests';
