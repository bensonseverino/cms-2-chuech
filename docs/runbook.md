# Runbook

Operational procedures for the Marino CMS. Written as each capability landed, so
it is **complete for Phases 0–5** and grows from Phase 6 onward (the full version
is a Phase 10 handover deliverable — see the marker at the end).

---

## 1. Restore the database after a bad migration

This is the rollback path for `migrations/*.sql`. **There is deliberately no
down-migration**: writing one for a schema that may already hold content is how
you lose data twice. Restore a point in time instead.

### 1a. Time Travel (remote: preview and production)

D1 keeps a rolling window of restore points and can rewind the whole database to
any second inside it.

```bash
# What can I restore to?
npx wrangler d1 time-travel info marino-cms            # production
npx wrangler d1 time-travel info marino-cms-preview    # preview

# Rewind (Unix seconds, or a bookmark from the output above)
npx wrangler d1 time-travel restore marino-cms --timestamp=1750000000
npx wrangler d1 time-travel restore marino-cms --bookmark=<bookmark>
```

Also available in the dashboard: **Workers & Pages → D1 → \<database\> → Time
Travel**, where the retention window for your plan is shown.

**Three things to know before you use it:**

1. **It rewinds the whole database, not one table.** A restore to 10:00 also
   discards submissions, submissions' status changes and audit rows written
   after 10:00. If all you need is a form you accidentally deleted, use the
   Admin API / inbox instead — do not rewind the database for it.
2. **Take the timestamp first.** Run `time-travel info` *before* the change you
   are worried about, so you have a known-good bookmark. A point after the
   damage is not a recovery.
3. **Nothing is lost twice.** Time Travel is non-destructive to the *existing*
   database beyond the rewind point — but once you rewind, the rows after that
   point are gone. Export anything you need first
   (`npx wrangler d1 export marino-cms --remote --output backup.sql`).

> **Not verified in this repo.** `wrangler d1 time-travel` operates on the
> remote database and requires an authenticated account. Running it here fails
> with `it's necessary to set a CLOUDFLARE_API_TOKEN environment variable`
> (exit 1). It needs `npx wrangler login` as the owner — see
> [`cloudflare-setup.md`](cloudflare-setup.md) §0. Confirm the command against
> the preview database before you ever need it in anger.

### 1b. Local rollback (development)

Local D1 is a SQLite file under `.wrangler/state` with no Time Travel. Delete the
state and re-apply; local data is disposable by definition.

```bash
rm -rf admin/.wrangler/state
npm run db:migrate:local
```

### 1c. If a migration itself is faulty

If `0001_init.sql` or a later file is wrong, **do not edit an applied file** —
wrangler tracks applied migrations by name and will not re-run one it has
already recorded. Add a new numbered migration that corrects it
(`0003_fix_….sql`) and apply that. Editing an applied migration silently
diverges local, preview and production.

---

## 2. Rotate a secret

Secrets are set per Pages project and are never readable back.

```bash
npx wrangler pages secret put CF_ACCESS_AUD  --project-name marino-cms
npx wrangler pages secret put TURNSTILE_SECRET --project-name marino-site
npx wrangler pages secret list --project-name marino-cms   # names only
```

Redeploy the project afterwards so the new value is bound. `PREVIEW_SECRET`
rotation invalidates outstanding preview links (they are HMAC-signed, 30 min).
`IP_HASH_SALT` rotation makes previously stored `ip_hash` values no longer
comparable to new ones — that is fine; the hashes are for abuse correlation, not
identity, and no raw IP is ever stored.

The **25 customer-variable limit** counts a name in both preview and production
twice. Check with `secret list` before adding.

---

## 3. Add a form to the site

No CMS code change and no migration (spec §4.5).

1. Register the source in the CMS **Forms** screen (`label`, `enabled`,
   notification emails, success message).
2. On the site, render the shared `ContactForm` with that `source`.
3. The intake endpoint accepts it immediately.

**Exception — service-page forms need nothing at all.** Publishing a
`service_page` auto-registers `<slug>-hero` and `<slug>-callback`
(`auto_registered = 1`), so a new service page gets working forms as a side
effect. The seven sources that exist today are seeded by
`migrations/0002_seed_forms.sql`.

---

## 4. Add a service page

1. In the CMS, **Pages → New page → Service page**. Give it the slug that should
   appear in the URL (`/ppc-manchester`), *not* the service collection's slug.
2. Fill the group that matches the reference design: hero, feature, projects,
   pillars, why, FAQ.
3. Publish. The public API serves it at `/api/public/pages/:slug`, so the site's
   catch-all `/:slug` route renders it with no route change and no deploy.

Its `projects.tag` (or `projects.slugs`) drives the carousel; a tag must match a
project's `services[]` values, which must themselves be existing service titles.

---

## 5. Add an editor

1. **Cloudflare Access → the `Marino CMS` application → Policies → Team** → add
   the person's email (or their identity-provider group). This lets them reach
   `cms.<domain>` at all.
2. **CMS → Users → invite by email**, choosing `editor` (or `viewer`). This is
   what gives them a role; Access alone only gets them to the login screen.

Both steps are required, and the API checks the `users` row on every request —
being in Access with no `users` row is a 403, by design. Deactivating a user in
the CMS takes effect immediately without touching Access.

`BOOTSTRAP_ADMIN_EMAIL` self-creates the **first** admin only, and only while the
`users` table is empty. It is not a backdoor afterwards.

---

## 6. Local development

```bash
npm run dev:admin   # admin SPA only (hot reload, :5174) — fastest for UI work
npm run dev:cms     # built SPA + Pages Functions (wrangler pages dev)
npm run db:migrate:local
```

The admin API bypasses Access **only** when the request host is loopback **and**
`admin/.dev.vars` sets `DEV_USER_EMAIL`. That file is git-ignored and must never
be set in Cloudflare; on any real hostname the API fails closed.

Health check while the server is up:
`curl http://127.0.0.1:8788/api/admin/health` — expect `ok: true` with all three
bindings reporting reachable.

---

## 6b. Sync the Phase 6 drop-in into the site repo

The site's public API and form intake are authored **here** (in
`site-integration/`) and copied into the site repo by the sync script — never
edit the copy on the site side; the next sync would wipe the edit.

```bash
npm run sync:site              # destination: ../website/my-project
DEST=/other/path npm run sync:site
npx tsc -p site-integration/tsconfig.json    # typecheck the drop-in
```

The script mirrors `functions/`, `public/_routes.json`, `wrangler.toml` and
`client/` → `src/cms/`, then warns if the site repo's `functions/` holds files
the drop-in does not own (sign of a hand-edit to review). The permanent local
end-to-end recipe (public GETs + a form POST against local D1/KV) is in
[`../site-integration/README.md`](../site-integration/README.md), § "Order of
operations".

After syncing, the site repo's `package.json` needs **no new dependencies**: the
functions are dependency-free TypeScript and the client imports React
(`useEffect`/`useState`), which the site already has.

---

## 7. Still to be written (Phase 10)

- Deploying both projects in release order (migrations → CMS → seed/import →
  site), including the parity capture from spec §8.3.
- Media: importing existing bucket objects, the soft-delete/trash path, and
  purging.
- Submissions: retention and the "purge older than…" action, plus the CSV
  export audit.
- Backing up and restoring the KV namespace and the R2 prefix.
