import { resolveMedia } from './media'
import type { Env } from './types'

/*
 * Published-content reads. The single rule (spec §1): the public API only ever
 * reads `published_data` — never `data`. A record with no snapshot yet is
 * invisible to the site, which is exactly the draft/publish contract.
 */

/** Rows the public API may serve: published only, with a non-null snapshot. */
const PUBLISHED = 'status = ' + "'published'" + ' AND published_data IS NOT NULL'

export type StoredDocument = {
  slug: string
  type: string
  status: string
  data: string
  published_data: string | null
  published_at: string | null
}

export type StoredEntry = {
  id: string
  collection: string
  slug: string | null
  status: string
  sort: number
  data: string
  published_data: string | null
  published_at: string | null
}

/** An envelope row becomes its parsed snapshot. Returns null when unpublished. */
function snapshotOf<T>(row: { published_data: string | null }): T | null {
  if (!row.published_data) return null
  return JSON.parse(row.published_data) as T
}

/** One singleton document by slug (e.g. `_home`), or null when unpublished. */
export async function getDocument<T>(
  env: Env,
  slug: string,
): Promise<{ data: T | null }> {
  const row = await env.DB.prepare(
    `SELECT slug, type, status, data, published_data, published_at
       FROM documents WHERE slug = ? AND ${PUBLISHED}`,
  )
    .bind(slug)
    .first<StoredDocument>()

  return { data: row ? snapshotOf<T>(row) : null }
}

/** All published entries in a collection, ordered by `sort`, media resolved. */
export async function listEntries<T>(
  env: Env,
  collection: string,
  options: { limit?: number; resolveMediaRefs?: boolean } = {},
): Promise<T[]> {
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 500)
  const { results } = await env.DB.prepare(
    `SELECT id, collection, slug, status, sort, data, published_data, published_at
       FROM entries
      WHERE collection = ? AND ${PUBLISHED}
      ORDER BY sort ASC, slug ASC
      LIMIT ?`,
  )
    .bind(collection, limit)
    .all<StoredEntry>()

  const rows = results ?? []
  const items = rows
    .map((row) => snapshotOf<T>(row))
    .filter((item): item is T => item !== null)

  if (options.resolveMediaRefs === false) return items
  return resolveMedia(items, env)
}

/**
 * Published documents of a type (service pages, generic pages), resolved. Used
 * by the sitemap and by anything walking pages.
 */
export async function listDocumentsByType<T>(
  env: Env,
  type: string,
): Promise<{ slug: string; data: T }[]> {
  const { results } = await env.DB.prepare(
    `SELECT slug, type, status, data, published_data, published_at
       FROM documents
      WHERE type = ? AND ${PUBLISHED}
      ORDER BY slug ASC`,
  )
    .bind(type)
    .all<StoredDocument>()

  const out: { slug: string; data: T }[] = []
  for (const row of results ?? []) {
    const snapshot = snapshotOf<T>(row)
    if (snapshot !== null) out.push({ slug: row.slug, data: snapshot })
  }
  return out
}

/** Site settings wrapped with their document type (the site renders from this). */
export async function getSite<T>(env: Env): Promise<T | null> {
  const { data } = await getDocument<{ settings: T } & Record<string, unknown>>(env, '_site')
  return data ? ((data as { settings?: T }).settings ?? (data as unknown as T)) : null
}
