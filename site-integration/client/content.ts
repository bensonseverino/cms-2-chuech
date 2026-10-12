/*
 * The site's content client (site repo: `src/cms/content.ts`).
 *
 * Fetches published content from the same-origin public API. Every call takes a
 * fallback — the existing hard-coded `src/content` module — and returns it
 * whenever the API is missing, unpublished, or the network hiccups (spec §1
 * "works from the seed fallback when the API is down", §8.3).
 *
 * The site therefore NEVER blocks rendering on the CMS: render the fallback,
 * then re-render with live data when the fetch lands.
 */

export type ApiEnvelope<T> = { data: T; version: number }

function apiBase(): string {
  // Same origin in every environment; overridable for storybook/tests.
  return import.meta.env?.VITE_CMS_API_BASE ?? '/api/public'
}

/**
 * Fetch one endpoint's envelope. `null` on any failure — the caller renders its
 * fallback. A non-2xx or a malformed body is a failure by definition.
 */
export async function fetchEnvelope<T>(path: string): Promise<ApiEnvelope<T> | null> {
  try {
    const response = await fetch(`${apiBase()}${path}`, {
      headers: { Accept: 'application/json' },
      // Same-origin GET; no credentials needed for public content.
      credentials: 'omit',
    })
    if (!response.ok) return null

    const body = (await response.json()) as ApiEnvelope<T>
    if (!body || typeof body.version !== 'number' || body.data === undefined) return null
    return body
  } catch {
    return null
  }
}

/**
 * React hook: live content with the hard-coded module as the immediate
 * (and fallback) value.
 *
 *   const site = useCms('site', SITE_FALLBACK)
 *   // site.data === SITE_FALLBACK until the API answers, then the published doc
 *
 * The version in the result lets a page skip re-rendering when nothing changed.
 */
import { useEffect, useState } from 'react'

export function useCms<T>(path: string, fallback: T): { data: T; version: number | null } {
  const [state, setState] = useState<{ data: T; version: number | null }>({
    data: fallback,
    version: null,
  })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const envelope = await fetchEnvelope<T>(path)
      if (!cancelled && envelope) setState({ data: envelope.data, version: envelope.version })
    })()
    return () => {
      cancelled = true
    }
  }, [path])

  return state
}

// --- One typed helper per endpoint -------------------------------------------

export type SitePayload = {
  settings: unknown
  navigation: unknown
  footer: unknown
}

export type HomePayload = {
  home: unknown
  services: unknown[]
  projects: unknown[]
  testimonials: unknown[]
  clients: unknown[]
  articles: unknown[]
}

export function siteContent() {
  return fetchEnvelope<SitePayload>('/site')
}
export function homeContent() {
  return fetchEnvelope<HomePayload>('/home')
}
export function servicesPageContent() {
  return fetchEnvelope<{ index: unknown; services: unknown[] }>('/services-page')
}
export function workPageContent() {
  return fetchEnvelope<{ index: unknown; projects: unknown[] }>('/work-page')
}
export function collectionContent<T>(name: 'services' | 'projects' | 'testimonials' | 'clients' | 'articles') {
  return fetchEnvelope<T[]>(`/collections/${name}`)
}
export function pageContent(slug: string) {
  return fetchEnvelope<Record<string, unknown>>(`/pages/${encodeURIComponent(slug)}`)
}
