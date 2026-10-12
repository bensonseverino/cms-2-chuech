import { dataResponse, error, contentVersion, withEdgeCache } from '../_lib/types'
import { getDocument, listEntries } from '../_lib/content'
import { resolveMedia } from '../_lib/media'
import type { Env, PagesContext } from '../_lib/types'

/*
 * GET /api/public/work-page — the `_work` index document (hero, pageSize) plus
 * the projects the grid pages through. Projects carry their own image + focus,
 * so the page can slice client-side by pageSize.
 */
export const onRequestGet = async (context: PagesContext<Env>): Promise<Response> => {
  const version = await contentVersion(context.env)
  return withEdgeCache(context.request, context, version, async () => {
    const [index, projects] = await Promise.all([
      getDocument<Record<string, unknown>>(context.env, '_work'),
      listEntries<Record<string, unknown>>(context.env, 'projects', { limit: 200 }),
    ])

    if (!index.data) {
      return error('not_found', 'No published work page yet')
    }

    const data = { index: index.data, projects }
    const resolved = await resolveMedia(data, context.env)
    return dataResponse(resolved, version)
  })
}
