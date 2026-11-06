-- Step 20: an external payment page for each payment method (CIB, InstaPay, Vodafone Cash, Fawry...).
-- Run once in the Supabase SQL Editor (safe to run again). The admin enters the link in Payments > Payment methods;
-- users see an "Open the payment page" button on subscribe.html.
alter table public.payment_methods add column if not exists pay_url text;
alter table public.payment_methods drop constraint if exists payment_methods_pay_url_check;
alter table public.payment_methods add constraint payment_methods_pay_url_check
  check (pay_url is null or pay_url ~* '^https?://[^\s]+$');
select count(*) as methods_with_link from public.payment_methods where pay_url is not null;
