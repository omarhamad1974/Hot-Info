-- STEP 16 (Tenders, phase T3): the Arabic dictionary used to underline unknown words in admin.html > Tenders.
-- Run ONCE in Supabase > SQL Editor > New query > paste > Run. Safe to run again.
--
--  tender_words        words you chose "Add to dictionary" (kind = added) or "Ignore" (kind = ignored)
--  tender_dict_chunks  an Arabic word list you upload with the Dictionary button (stored in a few big rows)
-- Admin only. Nothing here is visible to visitors or subscribers.

create table if not exists public.tender_words (
  word       text primary key,                 -- normalised form (no diacritics, one alef, ى=ي, ة=ه)
  kind       text not null default 'added' check (kind in ('added', 'ignored')),
  created_at timestamptz not null default now()
);
alter table public.tender_words enable row level security;
drop policy if exists "Admins manage tender words" on public.tender_words;
create policy "Admins manage tender words" on public.tender_words for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create table if not exists public.tender_dict_chunks (
  n          integer primary key,
  words      text not null,                    -- normalised words separated by spaces
  created_at timestamptz not null default now()
);
alter table public.tender_dict_chunks enable row level security;
drop policy if exists "Admins manage tender dictionary" on public.tender_dict_chunks;
create policy "Admins manage tender dictionary" on public.tender_dict_chunks for all to authenticated
using (public.is_admin()) with check (public.is_admin());

select (select count(*) from public.tender_words) as words, (select count(*) from public.tender_dict_chunks) as dictionary_chunks;
