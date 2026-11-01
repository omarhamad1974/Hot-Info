-- STEP 13 (phase 13b): HOT News on the home page.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again.
--
-- 1. sectors.name_ar: the Arabic name of a sector (set it in admin.html > Users & sectors > Sectors > "ع" button).
-- 2. hot_news(): a PUBLIC function (visitors who are not signed in can call it) that returns, for each sector, how many
--    tenders are active and the newest few: ONLY the description and the publishing entity. Nothing else (no dates,
--    prices, links or documents) leaves the database. A tender is active when it is Approved, its sectors are
--    Confirmed, and its session date has not passed (no session date: published within the last 30 days).

alter table public.sectors add column if not exists name_ar text;

create or replace function public.hot_news(p_per integer default 6)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with active as (
    select t.id, t.entity, t.subject, t.sector_ids,
           coalesce(t.released_at, t.created_at) as ts
      from public.tenders t
     where t.status = 'approved'
       and coalesce(t.sectors_confirmed, false)
       and coalesce(array_length(t.sector_ids, 1), 0) > 0
       and btrim(coalesce(t.subject, '')) <> ''
       and ( t.session_date >= public.today_cairo()
          or (t.session_date is null and coalesce(t.publish_date, t.created_at::date) >= public.today_cairo() - 30) )
  ), per as (
    select s.id as sid, s.name, s.name_ar, a.id as tid, a.entity, a.subject, a.ts,
           row_number() over (partition by s.id order by a.ts desc, a.id) as rn,
           count(*)     over (partition by s.id) as cnt
      from active a
      join public.sectors s on s.id = any (a.sector_ids)
  )
  select coalesce(jsonb_agg(x.j order by x.cnt desc, x.name), '[]'::jsonb)
    from (
      select p.name, max(p.cnt) as cnt,
             jsonb_build_object(
               'id', p.sid, 'name', p.name, 'name_ar', p.name_ar, 'count', max(p.cnt),
               'tenders', jsonb_agg(jsonb_build_object(
                  'id', p.tid, 'entity', btrim(coalesce(p.entity, '')), 'subject', left(btrim(p.subject), 400)
               ) order by p.rn)
             ) as j
        from per p
       where p.rn <= greatest(1, least(coalesce(p_per, 6), 20))
       group by p.sid, p.name, p.name_ar
    ) x;
$$;

revoke all on function public.hot_news(integer) from public;
grant execute on function public.hot_news(integer) to anon, authenticated;

select 'ok' as result;
