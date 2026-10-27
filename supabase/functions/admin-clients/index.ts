// Edge Function: admin-clients
// Lets the KHIP admin page invite, list, re-invite and remove client accounts.
// These actions need the service_role key, which must NEVER reach the browser,
// so they run here. Every call is checked: the caller must be signed in AND listed in public.admins.
//
// Deploy:  supabase functions deploy admin-clients
// (SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided automatically.)
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization") ?? "";

  // 1. Who is calling?
  const caller = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json({ error: "Please sign in again." }, 401);
  const { data: isAdmin } = await caller.rpc("is_admin");
  if (isAdmin !== true) return json({ error: "This account is not an admin." }, 403);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  let b: Record<string, string> = {};
  try { b = await req.json(); } catch { /* empty body */ }
  const email = String(b.email ?? "").trim().toLowerCase();
  // The invite link may only return to the site the admin is using.
  const origin = req.headers.get("origin") ?? "";
  const redirectTo = b.redirectTo && origin && String(b.redirectTo).startsWith(origin) ? b.redirectTo : undefined;

  const findUser = async (mail: string) => {
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === mail);
      if (hit || data.users.length < 200) return hit ?? null;
    }
    return null;
  };

  try {
    switch (b.action) {
      case "list": {
        const users: Array<Record<string, unknown>> = [];
        for (let page = 1; page <= 20; page++) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) throw error;
          users.push(...data.users);
          if (data.users.length < 200) break;
        }
        const { data: admins } = await admin.from("admins").select("user_id");
        const adminIds = new Set((admins ?? []).map((a) => a.user_id));
        return json({
          clients: users.filter((u) => !adminIds.has(u.id as string)).map((u) => ({
            id: u.id,
            email: String(u.email ?? "").toLowerCase(),
            invited_at: u.invited_at ?? null,
            confirmed: !!(u.email_confirmed_at || u.confirmed_at),
            last_sign_in_at: u.last_sign_in_at ?? null,
            created_at: u.created_at,
          })),
        });
      }

      case "invite": {
        if (!EMAIL.test(email)) return json({ error: "Enter a valid email address." }, 400);
        const existing = await findUser(email);
        if (existing) return json({ error: "This email already has an account." }, 409);
        const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // Pending client (never signed in): send a fresh invite. Active client: send a password-reset email.
      case "resend": {
        if (!EMAIL.test(email)) return json({ error: "Enter a valid email address." }, 400);
        const u = await findUser(email);
        if (!u) return json({ error: "No account for this email." }, 404);
        if (u.email_confirmed_at || u.confirmed_at) {
          const { error } = await anon_reset(url, anon, email, redirectTo);
          if (error) return json({ error }, 400);
          return json({ ok: true, kind: "reset" });
        }
        const del = await admin.auth.admin.deleteUser(u.id);
        if (del.error) return json({ error: del.error.message }, 400);
        const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true, kind: "invite" });
      }

      case "remove": {
        if (!EMAIL.test(email)) return json({ error: "Enter a valid email address." }, 400);
        const u = await findUser(email);
        if (!u) return json({ ok: true });
        if (u.id === user.id) return json({ error: "You cannot remove your own account." }, 400);
        const { data: a } = await admin.from("admins").select("user_id").eq("user_id", u.id).maybeSingle();
        if (a) return json({ error: "Admin accounts are managed in the SQL editor." }, 400);
        const { error } = await admin.auth.admin.deleteUser(u.id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action." }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Check the function logs in Supabase." }, 500);
  }
});

async function anon_reset(url: string, anon: string, email: string, redirectTo?: string) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error?.message };
}
