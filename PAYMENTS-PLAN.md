# Payments plan: manual online payment + admin approval

Keep this file. If a session ends, give it (with the zip) to Claude and say "continue with phase P2" (or P3, P4).

## What it does (no payment-gateway integration)
1. A signed-in user opens **subscribe.html**, picks sector(s) and a package.
2. For a paid package the page shows the payment methods you enter (CIB, InstaPay, Vodafone Cash, Fawry): account / number / QR + instructions and the exact amount.
3. The user pays in their own banking / wallet app, then **uploads the receipt or QR screenshot** (photo or PDF) and presses Send.
4. The request appears in admin > **Payments** as Pending. You check the receipt and press **Approve** (the subscription starts, renewals start after the current one ends) or **Reject** (with a reason the user can read).
5. The user sees the status on subscribe.html > My requests.

## Packages (you enter the prices)
| Package | Price | Approval |
|---|---|---|
| Weekly (7 days), per sector | Free (price 0 by default) | Admin approval, no receipt |
| 6 months | one price, same for every sector | receipt + approval |
| 1 year | one price, same for every sector | receipt + approval |
| 2 years | one price, same for every sector | receipt + approval |

Price is per sector. Choosing 2 sectors = 2 x price.
Decision: a user can take the free week **once per sector** (column `max_per_user_sector` in `payment_packages`; clear it in the admin to allow repeats).

## Decisions
- Amounts are always computed in the database, never trusted from the browser.
- Receipts live in a PRIVATE bucket `payment-receipts` (folder = the user's id, 5 MB, jpg/png/webp/pdf). Only the owner and admins can open them.
- Payment-method QR images live in a PUBLIC bucket `payment-assets` (admin writes).
- Users have no direct write access to requests: they call `request_subscription()`. Admin approves through `approve_subscription_request()` which creates the `subscription_periods` rows.
- Start date on approval = today, or the day after the user's current end date for that sector (renewal), whichever is later.
- Users still get their account from you (sign-up stays off). Optional later: allow self sign-up.

## P0: this plan (DONE)

## P1: Database (DONE)
- `supabase-step18-payments.sql`: adds the 6 months duration, tables `payment_packages` (4 starter rows), `payment_methods` (4 starter rows, hidden until you fill them in), `subscription_requests`, the two buckets, access rules, and the functions `request_subscription`, `cancel_subscription_request`, `approve_subscription_request`, `reject_subscription_request`.
- Run it once in Supabase SQL Editor (after steps 1 to 17). Nothing changes on the site yet.

## P2: Admin Payments tab (DONE)
- New **Payments** tab in admin.html: Requests (filters, receipt viewer, Approve / Reject), Packages (prices, on/off, Arabic names), Payment methods (account details, instructions, QR upload, on/off).
- Red badge with the number of pending requests. 6 months added to the manual Subscribe dialog.
- Files: admin.html.
- How to use: run `supabase-step18-payments.sql` first. Then open admin > Settings > Packages & prices (enter the 6 months / 1 year / 2 years price, the weekly package stays 0) and > Payment methods (account details, QR, switch On). Requests appear under Requests; Approve opens a dialog (optional start date and note), Reject needs a reason.

## P3: User page subscribe.html (DONE)
- New page: choose sectors, choose package, see price, pay-by instructions, upload receipt, send. Free week skips payment. My requests list with status and rejection reason, cancel for pending.
- English and Arabic (lang.js `pay_` texts). Link from My files and the bottom bar / menu.
- Files: subscribe.html (new), lang.js (`pay_` texts, English and Arabic), my-stuff.html (Subscribe or renew button + nav link), admin.html (menu destination "Subscribe page"). The bottom bar is not changed: add the Subscribe page in admin > Menu if you want it there.

## P4: Polish (DONE)
- validator checks, MANUAL.md section, README step.
- Ideas for later: email / WhatsApp alert to you on a new request, self sign-up, automatic renewal reminders pointing to subscribe.html.

## P5: Sign-up, per-sector orders, live alerts (DONE) - `supabase-step19-signup-and-orders.sql`
- Self sign-up on (`allowSignUp:true` + Supabase setting). The sign-up form sends name, mobile, company; a database trigger creates the profile and a Lead (status Lead). Sending a request makes it Potential, approving makes it Converted.
- An order has one line per sector with its own package: `subscription_requests.items` (jsonb). Old requests keep working. Prices and the total are calculated in `request_subscription_items()`.
- subscribe.html: sectors one by one with package chips, start / end date per sector, running total, payment details with Copy buttons, receipt upload required for paid orders.
- Admin: pending report, sector lines on each request, CSV download, live toast + badge (Supabase Realtime) + title counter.
- Still later: e-mail / WhatsApp alert when the admin page is closed (needs a mail service and an Edge Function), automatic renewal reminders.

