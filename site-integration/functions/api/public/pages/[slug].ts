import { dataResponse, error, contentVersion, withEdgeCache } from '../../_lib/types'
import { resolveMedia } from '../../_lib/media'
import type { Env, PagesContext } from '../../_lib/types'

const DOCUMENT_TYPES = new Set(['service_page', 'page']);

/*
 * GET /api/public/pages/:slug — a service page or generic (markdown) page
 * document, by its slug. `_site`, `_home` etc. have their own endpoints; this
 * handles the slugged pages created from the CMS.
 */
export const onRequestGet = async (
  context: PagesContext<Env> & { params: { slug: string } },
): Promise<Response> => {
  const raw = context.params.slug
  const slug = typeof raw === 'string' ? raw : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return error('not_found', 'No such page')
  }

  const version = await contentVersion(context.env)
  return withEdgeCache(context.request, context, version, async () => {
    // Look in documents directly so we can reject unpublished without leaking
    // whether a draft exists (a 404 either way).
    const row = await context.env.DB.prepare(
      `SELECT slug, type, status, data, published_data, published_at
         FROM documents
        WHERE slug = ? AND status = 'published' AND published_data IS NOT NULL`,
    )
      .bind(slug)
      .first<{ slug: string; type: string; published_data: string }>()

    if (!row || !DOCUMENT_TYPES.has(row.type)) {
      return error('not_found', 'No such page')
    }

    const page = JSON.parse(row.published_data) as Record<string, unknown>
    const resolved = await resolveMedia(page, context.env)
    return dataResponse({ slug: row.slug, type: row.type, ...resolved }, version)
  })
}
