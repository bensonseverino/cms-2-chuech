import type { Env } from './types'

/*
 * resolveMedia — a straight port of `@marino/api-kit`'s media resolver
 * (packages/api-kit/src/media.ts), vendored so the site's functions have no
 * dependency on the CMS workspace. It walks a value, collects every
 * `{ mediaId }` reference, loads them in ONE query, and swaps each for the
 * resolved shape the site renders.
 *
 * An unknown/deleted id becomes `null` (never a throw, never a dangling
 * reference) so a page can still render and its component falls back.
 */

export type MediaKind = 'image' | 'video' | 'svg' | 'file'

export type ResolvedMedia = {
  url: string
  kind: MediaKind
  mime: string
  width: number | null
  height: number | null
  alt: string
  focus: { x: number; y: number } | null
  poster: ResolvedMedia | null
}

type MediaRow = {
  id: string
  r2_key: string
  kind: MediaRowKind
  mime: string
  width: number | null
  height: number | null
  alt: string
  focus_x: number | null
  focus_y: number | null
  poster_media_id: string | null
}

type MediaRowKind = 'image' | 'video' | 'svg' | 'file'

const SELECT_COLUMNS =
  'id, r2_key, kind, mime, width, height, alt, focus_x, focus_y, poster_media_id'

export async function resolveMedia<T>(value: T, env: Env): Promise<T> {
  const ids = collectMediaIds(value)
  if (ids.size === 0) return value

  const rows = await loadRows(env, [...ids])
  const byId = new Map(rows.map((row) => [row.id, row]))

  // Posters can point at media not referenced anywhere else in the payload.
  const posterIds = rows
    .map((row) => row.poster_media_id)
    .filter((id): id is string => typeof id === 'string' && !byId.has(id))

  const posterRows = posterIds.length > 0 ? await loadRows(env, [...new Set(posterIds)]) : []
  for (const row of posterRows) byId.set(row.id, row)

  return replaceRefs(value, byId, env) as T
}

async function loadRows(env: Env, ids: readonly string[]): Promise<MediaRow[]> {
  const placeholders = ids.map(() => '?').join(',')
  const statement = env.DB.prepare(
    `SELECT ${SELECT_COLUMNS} FROM media WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
  )

  const { results } = await statement.bind(...ids).all<MediaRow>()
  return results ?? []
}

function collectMediaIds(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, found)
    return found
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const id = record.mediaId
    if (typeof id === 'string') found.add(id)

    for (const child of Object.values(record)) collectMediaIds(child, found)
  }

  return found
}

function replaceRefs(
  value: unknown,
  byId: Map<string, MediaRow>,
  env: Env,
  seen = new Set<string>(),
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => replaceRefs(item, byId, env, seen))
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>

    if (typeof record.mediaId === 'string') {
      const row = byId.get(record.mediaId)
      if (!row) return null

      return resolveRow(row, byId, env, seen)
    }

    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(record)) {
      out[key] = replaceRefs(child, byId, env, seen)
    }
    return out
  }

  return value
}

function resolveRow(
  row: MediaRow,
  byId: Map<string, MediaRow>,
  env: Env,
  seen: Set<string>,
): ResolvedMedia {
  seen.add(row.id)

  const posterRow = row.poster_media_id ? byId.get(row.poster_media_id) : undefined
  const poster = posterRow && !seen.has(posterRow.id) ? resolveRow(posterRow, byId, env, seen) : null

  return {
    url: joinUrl(env.MEDIA_PUBLIC_BASE, row.r2_key),
    kind: row.kind as MediaKind,
    mime: row.mime,
    width: row.width,
    height: row.height,
    alt: row.alt,
    focus:
      row.focus_x !== null && row.focus_y !== null ? { x: row.focus_x, y: row.focus_y } : null,
    poster,
  }
}

function joinUrl(base: string, key: string): string {
  return `${base.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`
}
