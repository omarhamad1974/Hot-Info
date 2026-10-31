-- STEP 11: Tenders page for users + "Send tender notification update".
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run, AFTER the earlier steps
-- (setup, step1 ... step10). Safe to run again: every statement is idempotent.
--
--  1. Users read tenders ONLY through two functions (my_tenders, my_tender_filters). The functions
--     check the signed-in user's ACTIVE sector subscriptions, so a user never sees a tender outside
--     the sectors they subscribe to. Admins see every sector (handy to preview the page).
--     A tender is visible to users only when it is  Approved  AND  its sectors are  Confirmed.
--  2. tenders.released_at = the moment a tender became visible to users (approved + sectors
--     confirmed). A trigger sets it, so the admin screens need no change.
--  3. tender_broadcasts: one row each time the admin presses "Send tender notification update".
--  4. tender_user_state: when each user last looked, so the page can say
--     "N new tenders since your last visit".
--  5. A subscriber may open the picture of a tender (the "View" link) when the picture holds
--     exactly one tender and that tender is in one of their active sectors.

-- 0. Columns this step relies on (no-op when they already exist) -------------------------------
alter table public.tenders
  add column if not exists sectors_confirmed boolean not null default false,
  add column if not exists released_at       timestamptz;

create index if not exists tenders_released_idx on public.tenders (released_at desc);
create index if not exists tenders_publish_idx  on public.tenders (publish_date desc);

-- 1. released_at is set the first time a tender is approved with confirmed sectors --------------
create or replace function public.set_tender_released_at()
returns trigger language plpgsql
as $$
begin
  if new.status = 'approved' and coalesce(new.sectors_confirmed, false)
     and coalesce(array_length(new.sector_ids, 1), 0) > 0 then
    if new.released_at is null then new.released_at := now(); end if;
  end if;
  return new;
end $$;
drop trigger if exists tenders_set_released_at on public.tenders;
create trigger tenders_set_released_at before insert or update on public.tenders
for each row execute function public.set_tender_released_at();

-- Tenders that are already visible keep a sensible date (their last edit), once.
update public.tenders
   set released_at = coalesce(updated_at, created_at)
 where released_at is null and status = 'approved' and coalesce(sectors_confirmed, false)
   and coalesce(array_length(sector_ids, 1), 0) > 0;

-- 2. Notification broadcasts (admin only) ---------------------------------------------------------
create table if not exists public.tender_broadcasts (
  id        bigint generated always as identity primary key,
  sent_at   timestamptz not null default now(),
  sent_by   uuid references auth.users(id) on delete set null default auth.uid(),
  note      text
);
alter table public.tender_broadcasts enable row level security;
drop policy if exists "Admins manage tender broadcasts" on public.tender_broadcasts;
create policy "Admins manage tender broadcasts" on public.tender_broadcasts for all to authenticated
using (public.is_admin()) with check (public.is_admin());
grant select, insert, delete on public.tender_broadcasts to authenticated;

-- Baseline: tenders released before this step never count as "new" (once).
insert into public.tender_broadcasts (note)
select 'Baseline (step 11)' where not exists (select 1 from public.tender_broadcasts);

-- 3. Last visit of each user ----------------------------------------------------------------------
create table if not exists public.tender_user_state (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);
alter table public.tender_user_state enable row level security;   -- no policies: only the functions below touch it

-- Helper: the sectors the signed-in user can read today (admins: all sectors) --------------------
create or replace function public.my_tender_sector_ids()
returns text[] language sql stable security definer set search_path = public
as $$
  select case
    when public.is_admin() then coalesce((select array_agg(id) from public.sectors), '{}')
    else coalesce((select array_agg(distinct p.sector_id) from public.subscription_periods p
                   where p.user_id = auth.uid()
                     and public.today_cairo() between p.start_date and p.end_date), '{}')
  end
$$;
revoke all on function public.my_tender_sector_ids() from public;
grant execute on function public.my_tender_sector_ids() to authenticated;

-- 4. The list the page shows ---------------------------------------------------------------------
-- p_scope  'recent' = published in the last 7 days, 'older' = everything before that.
-- p_date_by 'publish' (publishing date) or 'session' (session date) for the date filter.
-- Newest first. Returns {"total": n, "rows": [...]}.
create or replace function public.my_tenders(
  p_scope   text    default 'recent',
  p_from    date    default null,
  p_to      date    default null,
  p_date_by text    default 'publish',
  p_entity  text    default null,
  p_sector  text    default null,
  p_q       text    default null,
  p_limit   integer default 30,
  p_offset  integer default 0
) returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  mine   text[] := public.my_tender_sector_ids();
  today  date   := public.today_cairo();
  lim    integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  result jsonb;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_sector is not null and p_sector <> '' and not (p_sector = any (mine)) then
    return jsonb_build_object('total', 0, 'rows', '[]'::jsonb);
  end if;

  with base as (
    select t.*,
           coalesce(t.publish_date, (t.released_at at time zone 'Africa/Cairo')::date) as pub,
           (select count(*) from public.tenders o where o.image_id = t.image_id) as image_tenders
      from public.tenders t
     where t.status = 'approved'
       and coalesce(t.sectors_confirmed, false)
       and t.sector_ids && mine
       and (coalesce(p_sector, '') = '' or p_sector = any (t.sector_ids))
       and (coalesce(p_entity, '') = '' or t.entity = p_entity)
       and (coalesce(p_q, '') = '' or t.entity ilike '%' || p_q || '%' or t.subject ilike '%' || p_q || '%')
  ), filtered as (
    select * from base
     where (p_from is null or (case when p_date_by = 'session' then session_date else pub end) >= p_from)
       and (p_to   is null or (case when p_date_by = 'session' then session_date else pub end) <= p_to)
       and (case when p_scope = 'older' then pub <  today - 7
                 else                        pub >= today - 7 end)
  ), page as (
    select * from filtered order by pub desc nulls last, released_at desc nulls last, id
     limit lim offset greatest(coalesce(p_offset, 0), 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'rows', coalesce((select jsonb_agg(jsonb_build_object(
        'id', g.id, 'entity', g.entity, 'subject', g.subject,
        'booklet_price', g.booklet_price, 'booklet_price_raw', to_jsonb(g)->'booklet_price_raw',
        'session_date', g.session_date, 'session_time', to_jsonb(g)->'session_time',
        'bid_bond', g.bid_bond, 'source_paper', g.source_paper, 'page', g.page,
        'publish_date', g.pub, 'released_at', g.released_at,
        'sector_ids', (select coalesce(jsonb_agg(s), '[]'::jsonb) from unnest(g.sector_ids) s where s = any (mine)),
        'link', g.link,
        'has_image', (g.image_id is not null and g.image_tenders = 1
                      and exists (select 1 from public.tender_images i where i.id = g.image_id and i.image_path is not null))
      ) order by g.pub desc nulls last, g.released_at desc nulls last, g.id) from page g), '[]'::jsonb))
  into result;
  return result;
end $$;
revoke all on function public.my_tenders(text, date, date, text, text, text, text, integer, integer) from public;
grant execute on function public.my_tenders(text, date, date, text, text, text, text, integer, integer) to authenticated;

-- Filter choices: the user's own sectors and the entities that appear in them --------------------
create or replace function public.my_tender_filters()
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare mine text[] := public.my_tender_sector_ids();
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  return jsonb_build_object(
    'sectors', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) order by s.name)
                           from public.sectors s where s.id = any (mine)), '[]'::jsonb),
    'entities', coalesce((select jsonb_agg(e order by e) from (
                   select distinct btrim(t.entity) as e from public.tenders t
                    where t.status = 'approved' and coalesce(t.sectors_confirmed, false)
                      and t.sector_ids && mine and btrim(coalesce(t.entity, '')) <> '') x), '[]'::jsonb));
end $$;
revoke all on function public.my_tender_filters() from public;
grant execute on function public.my_tender_filters() to authenticated;

-- 5. The notification --------------------------------------------------------------------------
-- Returns {"count": n, "since": <last visit>} : n = tenders in the user's sectors released after the
-- user's last visit and up to the admin's latest notification. n = 0 when there is nothing to tell.
create or replace function public.tender_notice()
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  uid   uuid := auth.uid();
  seen  timestamptz;
  sent  timestamptz;
  mine  text[];
  n     integer := 0;
begin
  if uid is null then return jsonb_build_object('count', 0); end if;
  insert into public.tender_user_state (user_id) values (uid) on conflict (user_id) do nothing;
  select last_seen_at into seen from public.tender_user_state where user_id = uid;
  select max(sent_at) into sent from public.tender_broadcasts;
  if sent is null or sent <= seen then return jsonb_build_object('count', 0, 'since', seen); end if;
  mine := public.my_tender_sector_ids();
  select count(*) into n from public.tenders t
   where t.status = 'approved' and coalesce(t.sectors_confirmed, false)
     and t.sector_ids && mine and t.released_at > seen and t.released_at <= sent;
  return jsonb_build_object('count', n, 'since', seen, 'sent_at', sent);
end $$;
revoke all on function public.tender_notice() from public;
grant execute on function public.tender_notice() to authenticated;

-- "I have seen it": the next notice only counts tenders released after this moment.
create or replace function public.tender_mark_seen()
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.tender_user_state (user_id, last_seen_at) values (auth.uid(), now())
  on conflict (user_id) do update set last_seen_at = now();
end $$;
revoke all on function public.tender_mark_seen() from public;
grant execute on function public.tender_mark_seen() to authenticated;

-- 6. The "View" link: a subscriber may open the picture of a tender they can read ---------------
create or replace function public.can_read_tender_image(p_path text)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.tender_images i
      join public.tenders t on t.image_id = i.id
     where i.image_path = p_path
       and t.status = 'approved' and coalesce(t.sectors_confirmed, false)
       and t.sector_ids && public.my_tender_sector_ids()
       and (select count(*) from public.tenders o where o.image_id = i.id) = 1)
$$;
revoke all on function public.can_read_tender_image(text) from public;
grant execute on function public.can_read_tender_image(text) to authenticated;

-- The page asks for the picture's file path by tender id; the path is handed out only when allowed.
create or replace function public.my_tender_image(p_tender uuid)
returns text language sql stable security definer set search_path = public
as $$
  select i.image_path from public.tenders t join public.tender_images i on i.id = t.image_id
   where t.id = p_tender and i.image_path is not null
     and t.status = 'approved' and coalesce(t.sectors_confirmed, false)
     and t.sector_ids && public.my_tender_sector_ids()
     and (select count(*) from public.tenders o where o.image_id = i.id) = 1
$$;
revoke all on function public.my_tender_image(uuid) from public;
grant execute on function public.my_tender_image(uuid) to authenticated;

drop policy if exists "Subscribers read their tender images" on storage.objects;
create policy "Subscribers read their tender images" on storage.objects for select to authenticated
using (bucket_id = 'tender-images' and public.can_read_tender_image(name));

-- Check: first line shows the baseline row, the second shows how many tenders are visible to users.
select count(*) as broadcasts from public.tender_broadcasts;
select count(*) as visible_tenders from public.tenders
 where status = 'approved' and coalesce(sectors_confirmed, false) and released_at is not null;
