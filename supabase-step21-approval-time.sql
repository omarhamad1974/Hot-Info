-- Step 21: typical approval time (Phase 16f). Safe to run again.
-- Subscribers see "Typical approval time: about 5 hours" on their pending requests.
-- It is the median time between a request being sent and approved, over the last 90 days,
-- and only once there are at least 5 approved requests (until then nothing is shown).
-- It returns one number (hours) and no personal data. Without this step the site works as before, just without the estimate.
create or replace function public.typical_approval_hours()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select case when count(*) >= 5 then
    round((percentile_cont(0.5) within group (order by extract(epoch from (reviewed_at - created_at)) / 3600.0))::numeric, 1)
  end
  from public.subscription_requests
  where status = 'approved' and reviewed_at is not null and created_at > now() - interval '90 days'
$$;
revoke all on function public.typical_approval_hours() from public;
grant execute on function public.typical_approval_hours() to authenticated;
