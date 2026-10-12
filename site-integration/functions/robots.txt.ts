import type { Env, PagesContext } from './api/_lib/types'

/*
 * GET /robots.txt — points crawlers at the generated sitemap; nothing to cache
 * hard since it is two lines.
 */
export const onRequestGet = async (context: PagesContext<Env>): Promise<Response> => {
  const origin = context.env.SITE_ORIGIN.replace(/\/+$/, '')
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
