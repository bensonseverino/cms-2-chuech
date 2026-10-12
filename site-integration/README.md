# site-integration — the drop-in for the public site repo

The Marino site and this CMS live in **two separate folders** (decision A in
`../docs/cms-inventory.md` §9). The admin app, the shared packages, the D1
migrations and (later) the seed scripts are all built **here**; this folder
holds the parts that must run **inside the site project**, kept in a form you
can copy across without re-deriving anything.

## What is here now

| Path | Goes to (site repo) | Why |
|---|---|---|
| `wrangler.toml` | `website/my-project/wrangler.toml` | Binds the same D1 (`DB`), R2 (`MEDIA`) and KV (`CACHE`) as the CMS. Without it the site cannot read content or record submissions. |
| `public/_routes.json` | `website/my-project/public/_routes.json` | Runs Pages Functions only for `/api/*`, `/sitemap.xml` and `/robots.txt`, so every other path stays a pure static asset (spec §2 Phase 2 step 7). |
| `functions/` | `website/my-project/functions/` | The Phase 6 public API and form intake (below). Vendored, self-contained TypeScript — no imports from the CMS workspace. |
| `client/` | `website/my-project/src/cms/` | The fetch layer the React components use: `content.ts` (live data with the hard-coded modules as fallback) and `forms.ts` (submit + UTM helper). |
| `tsconfig.json` | (stays here) | Typechecks `functions/` and `client/` under strict/noUncheckedIndexedAccess. Run from the CMS repo: `npx tsc -p site-integration/tsconfig.json`. |
| `scripts/sync-to-site.ts` (repo root) | — | Copies the four paths above into the site repo in one direction (`npm run sync:site`, or `DEST=… npm run sync:site`). It mirrors directories, so deletions propagate; it then warns about any file under the site's `functions/` that the drop-in does not own so hand-edits cannot happen silently. |

### The Phase 6 endpoints

| Route | File | Reads |
|---|---|---|
| `GET /api/public/site` | `functions/api/public/site.ts` | `_site`, `_navigation`, `_footer` |
| `GET /api/public/home` | `functions/api/public/home.ts` | `_home` + services / projects / testimonials / clients / articles (4) |
| `GET /api/public/services-page` | `functions/api/public/services-page.ts` | `_services` + services / projects / clients / testimonials |
| `GET /api/public/work-page` | `functions/api/public/work-page.ts` | `_work` + all published projects |
| `GET /api/public/pages/:slug` | `functions/api/public/pages/[slug].ts` | one `service_page` or `page` document |
| `GET /api/public/collections/:name` | `functions/api/public/collections/index.ts` | one collection (articles date-sorted, newest first) |
| `GET /sitemap.xml` | `functions/api/public/sitemap.xml.ts` | all published `service_page`/`page` slugs |
| `GET /robots.txt` | `functions/robots.txt.ts` | static + the sitemap URL |
| `POST /api/forms/:source` | `functions/api/forms/[source].ts` | the `forms` row + INSERT into `submissions` |

All `/api/public/*` responses are `{ data, version }` envelopes served through the edge cache keyed by URL + content version (60s browser / 300s edge / 60s SWR). Publishing anything bumps `content_version`, which is the cache key — no purge, no TTL waiting. Only `published_data` is ever read; a record that has never been published is invisible (a 404 or simply absent from a list).

The form intake pipeline is: honeypot (`_gotcha` — bots get a convincing 200 and their submission is dropped) → same-origin check → body cap (100 KB) + validation → the `forms` row must exist and be enabled → KV rate limit (5 submissions / IP / source / minute; the WAF rule is the edge net) → Turnstile siteverify (fails closed when the secret is missing; `TURNSTILE_BYPASS` short-circuits it for local `.dev.vars` only) → INSERT with the IP stored only as a salted SHA-256 hash. Success returns the form's configured success message; field errors come back as `{ path, message }[]` the form renders inline.

Notifications (Resend) are a follow-on and deliberately out of Phase 6: the submission row is the contract, and email can be replayed from it.

### Package resolution (decision recorded)

The functions need no npm dependencies at all — `functions/api/_lib/` is the vendored, slimmed copy of `@marino/api-kit`'s `http`/`cache`/`media`/`ids` shapes, and `client/*.ts` needs only React. That makes option 1 (vendored copy) moot in its original form: there is nothing to vendor from `node_modules`, and the sync script is the single mechanism keeping the site repo in step. The derivation rule stands: change an idea in `packages/api-kit`, then re-apply it here by hand — the comment at the top of `_lib/types.ts` cross-references the original.

## Order of operations (apply Phase 6 to the site repo)

1. From the CMS repo root: `npm run sync:site` (default destination is the
   sibling `../website/my-project`; set `DEST=…` if the checkout lives
   elsewhere).
2. Fill the `<...>` placeholders in the site's `wrangler.toml` from
   `../docs/cloudflare-setup.md` (same ids as `admin/wrangler.toml`).
3. Set the site's Pages secrets (`TURNSTILE_SECRET`, `IP_HASH_SALT`,
   `PREVIEW_SECRET`) and the `VITE_TURNSTILE_SITE_KEY` build variable.
4. Deploy. Then confirm Phase 6's `GET /api/public/site` responds before
   switching any component to the data layer (Phase 10).

Local verification without deploying (from the CMS repo root, after syncing and
applying migrations locally):

```
npx wrangler pages dev ../website/my-project --port 8799 \
  --d1 DB=marino-cms --r2 MEDIA=marino-media --kv CACHE=CACHE \
  --.binding MEDIA_PUBLIC_BASE=http://localhost:9000 \
  --binding SITE_ORIGIN=http://localhost:8799 \
  --binding TURNSTILE_BYPASS=1 --binding IP_HASH_SALT=dev
```

then `curl http://localhost:8799/api/public/site` and a POST to
`/api/forms/web-design-hero` with `Origin: http://localhost:8799`.
