import { contentVersion } from '../_lib/types'
import { listDocumentsByType } from '../_lib/content'
import type { Env, PagesContext } from '../_lib/types'

/*
 * GET /sitemap.xml — generated from published pages, not hard-coded, so a CMS
 * user's new page is crawlable without a redeploy (spec §2 Phase 2 step 7).
 */
export const onRequestGet = async (context: PagesContext<Env>): Promise<Response> => {
  const version = await contentVersion(context.env)
  const [servicePages, pages] = await Promise.all([
    listDocumentsByType<Record<string, unknown>>(context.env, 'service_page'),
    listDocumentsByType<Record<string, unknown>>(context.env, 'page'),
  ])

  const paths = ['/', '/services', '/work', '/blog', ...servicePages.map((page) => `/${page.slug}`), ...pages.map((page) => `/${page.slug}`)]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(context.env.SITE_ORIGIN)}${path}</loc></url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60',
      'X-Content-Version': String(version),
    },
  })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
