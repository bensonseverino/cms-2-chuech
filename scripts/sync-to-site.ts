/*
 * sync-to-site.ts — copy the Phase 6 drop-in into the site repo, once, in one
 * direction. The site repo owns nothing under these paths:
 *
 *   functions/            ← site-integration/functions/**   (all hand-written)
 *   public/_routes.json   ← site-integration/public/_routes.json
 *   wrangler.toml         ← site-integration/wrangler.toml
 *   src/cms/              ← site-integration/client/*.ts    (fetch + submit)
 *
 * Run it from the CMS repo root:
 *   node scripts/sync-to-site.ts            (default DEST)
 *   DEST=/path/to/site npm run sync:site
 *
 * It is intentionally dumb (no globs, no ambient config): a copy with printed
 * paths, so a reviewer can diff the two folders and see nothing else changed.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const SITE_INTEGRATION = join(REPO_ROOT, 'site-integration')

const DEST = process.env.DEST ? resolve(process.env.DEST) : resolve(import.meta.dirname, '../..', 'website/my-project')

if (!existsSync(join(DEST, 'package.json'))) {
  console.error(`sync-to-site: ${DEST} does not look like the site repo (no package.json).`)
  console.error('Set DEST=/path/to/site-repo and retry.')
  process.exit(1)
}

const COPIES = [
  { from: join(SITE_INTEGRATION, 'functions'), to: join(DEST, 'functions') },
  { from: join(SITE_INTEGRATION, 'public'), to: join(DEST, 'public') },
  { from: join(SITE_INTEGRATION, 'wrangler.toml'), to: join(DEST, 'wrangler.toml') },
  { from: join(SITE_INTEGRATION, 'client'), to: join(DEST, 'src', 'cms') },
]

for (const { from, to } of COPIES) {
  if (!existsSync(from)) {
    console.error(`sync-to-site: missing source ${from}`)
    process.exit(1)
  }

  mkdirSync(to, { recursive: true })

  if (statSync(from).isDirectory()) {
    // Whole-directory mirror: remove the destination copy first so deletions in
    // site-integration propagate (a copy alone would leave stale files).
    rmSync(to, { recursive: true, force: true })
    cpSync(from, to, { recursive: true })
  } else {
    cpSync(from, to)
  }

  console.log(`sync-to-site: ${relative(REPO_ROOT, from)} → ${relative(REPO_ROOT, to)}`)
}

// --- Audit: warn loudly if the site repo has other files under functions/ ----

const siteFunctionsDir = join(DEST, 'functions')
if (existsSync(siteFunctionsDir)) {
  const foreign = findForeign(siteFunctionsDir)
  if (foreign.length > 0) {
    console.warn(
      `\nsync-to-site: WARNING — the site repo's functions/ contains files that are NOT in ` +
        `site-integration/functions. If these pre-date the CMS integration, review them:\n\n` +
        foreign.map((f) => `  ${relative(DEST, f)}`).join('\n'),
    )
  }
}

function findForeign(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) findForeign(path, acc)
    else if (!existsSync(join(SITE_INTEGRATION, 'functions', relative(siteFunctionsDir, path)))) {
      acc.push(path)
    }
  }
  return acc
}

function relative(from: string, to: string): string {
  return to.startsWith(from) ? to.slice(from.length + 1) : to
}
