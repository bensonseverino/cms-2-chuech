import type { FieldError, RecordSchema, ValidationLevel } from '@marino/content-schema'
import { validateRecord } from '@marino/content-schema'

/*
 * Response helpers. One error shape for both APIs (spec §4.5), so the admin's
 * error renderer and the site's form error handling read the same body:
 *
 *   { error: { code, message, fields? } }
 *
 * `code` is a stable machine string; `message` is for a human.
 */

export type ErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'method_not_allowed'
  | 'conflict'
  | 'payload_too_large'
  | 'unprocessable'
  | 'rate_limited'
  | 'server_error'

export type ApiError = {
  error: {
    code: ErrorCode
    message: string
    fields?: FieldError[]
  }
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  method_not_allowed: 405,
  conflict: 409,
  payload_too_large: 413,
  unprocessable: 422,
  rate_limited: 429,
  server_error: 500,
}

/**
 * A JSON response. Built with the constructor rather than the `Response.json`
 * static so it behaves identically on every runtime and lib target.
 */
export function json<T>(data: T, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), { ...init, headers })
}

/** A `{ data, version }` envelope (the public API's shape, spec §6). */
export function dataResponse<T>(data: T, version: number, init: ResponseInit = {}): Response {
  return json({ data, version }, init)
}

/** An error response in the shared shape. */
export function error(
  code: ErrorCode,
  message: string,
  options: { fields?: FieldError[]; status?: number; headers?: HeadersInit } = {},
): Response {
  const body: ApiError = { error: { code, message } }
  if (options.fields && options.fields.length > 0) body.error.fields = options.fields

  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(body), {
    status: options.status ?? STATUS_BY_CODE[code],
    headers,
  })
}

/** 405 with a helpful `Allow` list. */
export function methodNotAllowed(allowed: readonly string[]): Response {
  return error('method_not_allowed', `Use ${allowed.join(' or ')} on this route`, {
    headers: { Allow: allowed.join(', ') },
  })
}

/** The largest JSON body either API accepts. */
export const MAX_BODY_BYTES = 20 * 1024

export type ParseBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

/**
 * Read and validate a JSON request body.
 *
 * Rejects a wrong content type, an oversized body (spec §6 form intake step 1)
 * and schema failures — each with the right status and, for schema failures,
 * the field-level list the form renders.
 */
export async function parseBody<T>(
  request: Request,
  schema: RecordSchema<T>,
  level: ValidationLevel = 'draft',
  requiredPaths: readonly string[] = [],
): Promise<ParseBodyResult<T>> {
  const contentType = request.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return {
      ok: false,
      response: error('bad_request', 'Send the body as application/json'),
    }
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, response: error('payload_too_large', 'Body is too large') }
  }

  let raw: unknown
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) {
      return { ok: false, response: error('payload_too_large', 'Body is too large') }
    }
    raw = JSON.parse(text) as unknown
  } catch {
    return { ok: false, response: error('bad_request', 'Body is not valid JSON') }
  }

  const result = validateRecord(schema, requiredPaths, raw, level)
  if (!result.ok) {
    return {
      ok: false,
      response: error('unprocessable', 'Some fields need attention', { fields: result.errors }),
    }
  }

  return { ok: true, data: result.data }
}

/**
 * CSRF guard for mutations (spec §7): the browser must have sent an `Origin`
 * that matches the expected one. A missing Origin is rejected for mutations —
 * a same-origin `fetch` always sends it.
 */
export function isSameOrigin(request: Request, expectedOrigin: string): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return false
  return normalizeOrigin(origin) === normalizeOrigin(expectedOrigin)
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase()
}

/** Headers every `/api/admin/*` response must carry (spec §7). */
export const ADMIN_HEADERS: HeadersInit = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
}
