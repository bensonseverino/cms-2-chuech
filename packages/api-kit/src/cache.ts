import type { Ctx, Env } from './types'

/*
 * Cache and cache-busting (spec §1, §4.5).
 *
 * `content_version` is a counter. The public API puts it in the cache key, so
 * publishing anything bumps the counter and every URL becomes a miss at once —
 * no purge, no TTL waiting.
 *
 * The counter's source of truth is `meta.content_version` in D1, which is
 * strongly consistent; KV is the fast global read the request path uses. Bumping
 * reads D1 (not KV) on purpose: KV is eventually consistent, so a
 * read-modify-write against KV would silently lose an increment under
 * concurrent publishes.
 */

const VERSION_KEY = 'content_version'

/** The current content version, read from KV with a short TTL. */
export async function contentVersion(env: Env): Promise<number> {
  try {
    const raw = await env.CACHE.get(VERSION_KEY, { cacheTtl: 30 })
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  } catch (cause) {
    console.error('[cache] contentVersion read failed', cause)
  }

  return readVersionFromDb(env)
}

/** Increment the version in D1 (authoritative) and mirror it into KV. */
export async function bumpContentVersion(env: Env): Promise<number> {
  const current = await readVersionFromDb(env)
  const next = current + 1

  await env.DB.prepare('UPDATE meta SET value = ? WHERE key = ?').bind(String(next), VERSION_KEY).run()
  await env.CACHE.put(VERSION_KEY, String(next))

  return next
}

async function readVersionFromDb(env: Env): Promise<number> {
  try {
    const row = await env.DB.prepare('SELECT value FROM meta WHERE key = ?')
      .bind(VERSION_KEY)
      .first<{ value: string }>()
    const parsed = Number(row?.value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  } catch (cause) {
    console.error('[cache] contentVersion db read failed', cause)
    return 1
  }
}

/** The Cache API, when the deployment exposes it (custom domains only). */
function edgeCache(): Cache | null {
  const candidate = (caches as unknown as { default?: Cache }).default
  return candidate ?? null
}

function cacheKey(request: Request, version: number): Request {
  const url = new URL(request.url)
  url.searchParams.set('__v', String(version))
  return new Request(url.toString(), { method: 'GET' })
}

/**
 * Serve a GET through the edge cache, keyed by URL + content version.
 *
 * Correctness must never depend on the cache (spec §4.5): the Cache API is
 * unavailable on some hostnames and throws on others, so every cache call is
 * guarded and a failure just calls through.
 */
export async function withEdgeCache(
  request: Request,
  ctx: Ctx,
  version: number,
  produce: () => Promise<Response>,
): Promise<Response> {
  const cache = edgeCache()
  const key = cacheKey(request, version)

  if (cache) {
    try {
      const hit = await cache.match(key)
      if (hit) return hit
    } catch (cause) {
      console.error('[cache] match failed', cause)
    }
  }

  const response = await produce()
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60')
  headers.set('X-Content-Version', String(version))

  const out = new Response(response.body, { status: response.status, headers })

  // Only cache a clean, anonymous 200/304.
  if (cache && (response.status === 200 || response.status === 304) && !response.headers.has('Set-Cookie')) {
    try {
      const snapshot = new Response(out.clone().body, out)
      ctx.waitUntil(cache.put(key, snapshot))
    } catch (cause) {
      console.error('[cache] put failed', cause)
    }
  }

  return out
}

// --- Form rate limiting -----------------------------------------------------

/**
 * Count a request against a key inside a window. Returns true when the caller
 * is UNDER the limit. Backed by KV: approximate, which is why the WAF rule
 * (spec §1) is the real ceiling and this is a cheap second net.
 */
export async function underRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`

  try {
    const raw = await env.CACHE.get(bucket)
    const count = Number(raw ?? '0')

    if (count >= limit) return false

    // KV's minimum TTL is 60s; windowSeconds is always >= that here.
    await env.CACHE.put(bucket, String(count + 1), {
      expirationTtl: Math.max(60, windowSeconds + 10),
    })
    return true
  } catch (cause) {
    // A broken counter must not block real submissions; the WAF still applies.
    console.error('[cache] rate limit failed', cause)
    return true
  }
}
