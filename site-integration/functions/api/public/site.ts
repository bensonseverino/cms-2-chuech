import { dataResponse, error, contentVersion, withEdgeCache } from '../_lib/types'
import { getDocument } from '../_lib/content'
import { resolveMedia } from '../_lib/media'
import type { Env, PagesContext } from '../_lib/types'

/*
 * GET /api/public/site — settings, navigation and footer in one read
 * (the site renders every page shell from this).
 */
export const onRequestGet = async (context: PagesContext<Env>): Promise<Response> => {
  const version = await contentVersion(context.env)
  return withEdgeCache(context.request, context, version, async () => {
    const [site, navigation, footer] = await Promise.all([
      getDocument<Record<string, unknown>>(context.env, '_site'),
      getDocument<Record<string, unknown>>(context.env, '_navigation'),
      getDocument<Record<string, unknown>>(context.env, '_footer'),
    ])

    if (!site.data && !navigation.data && !footer.data) {
      return error('not_found', 'No published settings yet')
    }

    const data = {
      settings: site.data ?? null,
      navigation: navigation.data ?? null,
      footer: footer.data ?? null,
    }
    const resolved = await resolveMedia(data, context.env)
    return dataResponse(resolved, version)
  })
}
