-- STEP 17 (Tenders, phase T4): front-page tender preview with a "More" button.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again. Run supabase-step15 and step13 first.
--
-- hot_news()   now also returns each tender's publishing date and governorate and a longer description (the page shows
--              the first 50 words, the publishing entity and the publishing date).
-- hot_tender() NEW public function used by the "More" window: the whole description, entity, governorate, publishing date
--              and session date of ONE active tender. Booklet price, bid bond, link and documents stay subscribers-only.
-- A tender is public only when it is Approved, its sectors are Confirmed and it is still active (same rule as before:
-- session date not passed, or no session date and published within the last 30 days).

alter table public.tenders add column if not exists governorate text;

create or replace function public.hot_news(p_per integer default 6)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with active as (
    select t.id, t.entity, t.subject, t.governorate, t.publish_date, t.sector_ids,
           coalesce(t.released_at, t.created_at) as ts
      from public.tenders t
     where t.status = 'approved'
       and coalesce(t.sectors_confirmed, false)
       and coalesce(array_length(t.sector_ids, 1), 0) > 0
       and btrim(coalesce(t.subject, '')) <> ''
       and ( t.session_date >= public.today_cairo()
          or (t.session_date is null and coalesce(t.publish_date, t.created_at::date) >= public.today_cairo() - 30) )
  ), per as (
    select s.id as sid, s.name, s.name_ar, a.id as tid, a.entity, a.subject, a.governorate, a.publish_date, a.ts,
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
                  'id', p.tid, 'entity', btrim(coalesce(p.entity, '')), 'subject', left(btrim(p.subject), 700),
                  'publish_date', p.publish_date, 'governorate', nullif(btrim(coalesce(p.governorate, '')), '')
               ) order by p.rn)
             ) as j
        from per p
       where p.rn <= greatest(1, least(coalesce(p_per, 6), 20))
       group by p.sid, p.name, p.name_ar
    ) x;
$$;

revoke all on function public.hot_news(integer) from public;
grant execute on function public.hot_news(integer) to anon, authenticated;

create or replace function public.hot_tender(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
           'id', t.id,
           'entity', btrim(coalesce(t.entity, '')),
           'subject', btrim(t.subject),
           'governorate', nullif(btrim(coalesce(t.governorate, '')), ''),
           'publish_date', t.publish_date,
           'session_date', t.session_date)
    from public.tenders t
   where t.id = p_id
     and t.status = 'approved'
     and coalesce(t.sectors_confirmed, false)
     and coalesce(array_length(t.sector_ids, 1), 0) > 0
     and btrim(coalesce(t.subject, '')) <> ''
     and ( t.session_date >= public.today_cairo()
        or (t.session_date is null and coalesce(t.publish_date, t.created_at::date) >= public.today_cairo() - 30) );
$$;

revoke all on function public.hot_tender(uuid) from public;
grant execute on function public.hot_tender(uuid) to anon, authenticated;

select 'ok' as result;
