import { dataResponse, error, contentVersion, withEdgeCache } from '../_lib/types'
import { getDocument, listEntries } from '../_lib/content'
import { resolveMedia } from '../_lib/media'
import type { Env, PagesContext } from '../_lib/types'

/*
 * GET /api/public/home — the `_home` document plus the collections the Home
 * panel reads in one round trip: featured projects, the services list
 * (showOnHome), testimonials, clients and the 4 insight articles.
 */
export const onRequestGet = async (context: PagesContext<Env>): Promise<Response> => {
  const version = await contentVersion(context.env)
  return withEdgeCache(context.request, context, version, async () => {
    const [home, services, projects, testimonials, clients, articles] = await Promise.all([
      getDocument<Record<string, unknown>>(context.env, '_home'),
      listEntries<Record<string, unknown>>(context.env, 'services'),
      listEntries<Record<string, unknown>>(context.env, 'projects', { limit: 50 }),
      listEntries<Record<string, unknown>>(context.env, 'testimonials'),
      listEntries<Record<string, unknown>>(context.env, 'clients'),
      listEntries<Record<string, unknown>>(context.env, 'articles', { limit: 4 }),
    ])

    if (!home.data) {
      return error('not_found', 'No published home content yet')
    }

    const data = {
      home: home.data,
      services,
      projects,
      testimonials,
      clients,
      articles,
    }
    const resolved = await resolveMedia(data, context.env)
    return dataResponse(resolved, version)
  })
}
