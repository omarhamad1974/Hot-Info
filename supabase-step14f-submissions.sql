-- STEP 14f: businesses submit their own directory entry (public form: submit-directory.html).
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again.
-- Needs supabase-setup.sql (public.admins, public.is_admin) and supabase-step14-directory.sql before it.
--
-- How it is kept safe:
--  * Visitors get NO write access to directory_entries. They can only call one function,
--    submit_directory_entry(), which checks every field, forces status = 'pending' (never approved),
--    never sets a picture, and stops after 30 submissions per hour for the whole site (anti-flood).
--  * The submitter's own contact details (name, phone, email) are stored in a SEPARATE table that only
--    admins can read, so they are never visible on the public pages.
--  * Nothing appears on the site until you press Approve in admin.html > Directory.

-- 1. Private contact details of the person who submitted -------------------------------------------
create table if not exists public.directory_submitters (
  entry_id      uuid primary key references public.directory_entries(id) on delete cascade,
  contact_name  text,
  contact_phone text,
  contact_email text,
  created_at    timestamptz not null default now()
);
alter table public.directory_submitters enable row level security;

drop policy if exists "Admins manage directory submitters" on public.directory_submitters;
create policy "Admins manage directory submitters" on public.directory_submitters
for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, update, delete on public.directory_submitters to authenticated;

-- 2. The only door for visitors ---------------------------------------------------------------------
create or replace function public.submit_directory_entry(p jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id     uuid := gen_random_uuid();
  v_name   text := btrim(coalesce(p->>'name', ''));
  v_name_ar text := nullif(btrim(coalesce(p->>'name_ar', '')), '');
  v_type   text := coalesce(p->>'entry_type', '');
  v_sector text := coalesce(p->>'sector_id', '');
  v_city   text := nullif(btrim(coalesce(p->>'city', '')), '');
  v_wa     text := nullif(regexp_replace(coalesce(p->>'whatsapp', ''), '\D', '', 'g'), '');
  v_email  text := nullif(btrim(coalesce(p->>'email', '')), '');
  v_web    text := nullif(btrim(coalesce(p->>'website_url', '')), '');
  v_soc    text := nullif(btrim(coalesce(p->>'social_url', '')), '');
  v_cname  text := nullif(btrim(coalesce(p->>'contact_name', '')), '');
  v_cphone text := nullif(btrim(coalesce(p->>'contact_phone', '')), '');
  v_cmail  text := nullif(btrim(coalesce(p->>'contact_email', '')), '');
  v_otitle text := nullif(btrim(coalesce(p->>'offer_title', '')), '');
  v_otext  text := nullif(btrim(coalesce(p->>'offer_text', '')), '');
  v_oends  date := null;
  v_phones text[] := '{}';
begin
  if length(v_name) = 0 or length(v_name) > 120 then raise exception 'bad_name'; end if;
  if v_type not in ('company', 'institution', 'freelancer') then raise exception 'bad_type'; end if;
  if not exists (select 1 from public.directory_sectors where id = v_sector) then raise exception 'bad_sector'; end if;
  if v_wa is not null and v_wa !~ '^[0-9]{8,15}$' then raise exception 'bad_whatsapp'; end if;
  if v_email is not null and v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'bad_email'; end if;
  if v_web is not null and v_web !~* '^https?://[^\s]+\.[^\s]+$' then raise exception 'bad_url'; end if;
  if v_soc is not null and v_soc !~* '^https?://[^\s]+\.[^\s]+$' then raise exception 'bad_url'; end if;
  if v_cphone is null and v_cmail is null then raise exception 'bad_contact'; end if;
  if v_cmail is not null and v_cmail !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'bad_email'; end if;

  begin v_oends := nullif(p->>'offer_ends', '')::date; exception when others then v_oends := null; end;
  if v_otitle is null and v_otext is null then v_oends := null; end if;

  if jsonb_typeof(p->'phones') = 'array' then
    select coalesce(array(select left(btrim(x), 30) from jsonb_array_elements_text(p->'phones') x where btrim(x) <> '' limit 6), '{}')
      into v_phones;
  end if;

  -- Same name and city already waiting or published: do not add it twice.
  if exists (select 1 from public.directory_entries
             where lower(btrim(name)) = lower(v_name) and coalesce(lower(city), '') = coalesce(lower(v_city), '')
               and status in ('pending', 'approved')) then
    return 'exists';
  end if;

  -- Anti-flood for the whole site.
  if (select count(*) from public.directory_submitters where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limit';
  end if;

  insert into public.directory_entries
    (id, name, name_ar, entry_type, sector_id, description, address, city, phones, whatsapp, email, website_url, social_url,
     offer_title, offer_text, offer_ends, image_path, status)
  values
    (v_id, v_name, left(v_name_ar, 120), v_type, v_sector, left(nullif(btrim(coalesce(p->>'description', '')), ''), 4000),
     left(nullif(btrim(coalesce(p->>'address', '')), ''), 250), left(v_city, 60), v_phones, v_wa, left(v_email, 120),
     left(v_web, 300), left(v_soc, 300), left(v_otitle, 80), left(v_otext, 1500), v_oends, null, 'pending');

  insert into public.directory_submitters (entry_id, contact_name, contact_phone, contact_email)
  values (v_id, left(v_cname, 120), left(v_cphone, 40), left(v_cmail, 120));

  return 'ok';
end;
$$;

revoke all on function public.submit_directory_entry(jsonb) from public;
grant execute on function public.submit_directory_entry(jsonb) to anon, authenticated;

-- Check: should print 0 submitters and "ok" for the function row.
select count(*) as directory_submitters from public.directory_submitters;
select proname, prosecdef as security_definer from pg_proc where proname = 'submit_directory_entry';
