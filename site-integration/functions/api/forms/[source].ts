import { error, json } from '../_lib/types'
import {
  HONEYPOT_FIELD,
  getForm,
  hashIp,
  insertSubmission,
  isSameOrigin,
  underFormRateLimit,
  validatePayload,
  verifyTurnstile,
  type FormSubmissionPayload,
} from '../_lib/forms'
import type { Env, PagesContext } from '../_lib/types'

/*
 * POST /api/forms/:source — everything a visitor sends lands here (spec §6).
 *
 * Pipeline, in order, cheapest first:
 *   1. OPTIONS/GET short-circuit (405 with the Allow list)
 *   2. honeypot — bot-filled `_gotcha` returns 200 with `{ received: true }` so
 *      bots learn nothing (the submission is dropped, not stored)
 *   3. Origin check (CSRF)
 *   4. body parse + shape validation
 *   5. Turnstile server-side verification
 *   6. rate limit (5/IP/min per source; the WAF rule is the edge net)
 *   7. form row must exist and be enabled
 *   8. INSERT into D1; notification is a follow-on (Resend integration), not here
 *
 * Success returns 200 `{ ok: true, id, successMessage? }` — the form shows the
 * form's configured message, never an error detail.
 */

export const onRequest = async (context: PagesContext<Env>): Promise<Response> => {
  const { request, params } = context

  if (request.method === 'OPTIONS') return corsPreflight()
  if (request.method === 'POST') return handlePost(context, asString(params.source))

  return error('method_not_allowed', 'Use POST or OPTIONS on this route', {
    headers: { Allow: 'POST, OPTIONS' },
  })
}

async function handlePost(context: PagesContext<Env>, source: string): Promise<Response> {
  const { request, env } = context

  // --- 1. honeypot: pretend success, drop silently ---------------------------
  const parsed = await readJson(request)
  if (!parsed.ok) return parsed.response
  const body = parsed.body
  if (body && typeof body === 'object' && HONEYPOT_FIELD in body) {
    return json({ ok: true, received: true })
  }

  // --- 2. Origin (CSRF) ------------------------------------------------------
  if (!isSameOrigin(request, env)) {
    return error('forbidden', 'Request must come from the site')
  }

  // --- 3. payload ------------------------------------------------------------
  if (!body) {
    return error('bad_request', 'Body is required')
  }
  const fieldErrors = validatePayload(body)
  if (fieldErrors.length > 0) {
    return error('unprocessable', 'Some fields need attention', { fields: fieldErrors })
  }

  // --- 4. form exists and is enabled -----------------------------------------
  const form = await getForm(env, source)
  if (!form) {
    return error('not_found', 'This form is not configured')
  }
  if (form.enabled !== 1) {
    return error('unprocessable', 'This form is not accepting submissions right now')
  }

  const ip = clientIpOf(request)

  // --- 5. rate limit (per IP per source) --------------------------------------
  if (!(await underFormRateLimit(env, ip, source))) {
    return error('rate_limited', 'Too many submissions; try again shortly')
  }

  // --- 6. Turnstile ------------------------------------------------------------
  const turnstileOk = await verifyTurnstile(body.turnstileToken, request, env)
  if (!turnstileOk) {
    return error('forbidden', 'Captcha check failed; retry the widget')
  }

  // --- 7. INSERT ---------------------------------------------------------------
  const ipHash = await hashIp(ip, env)
  const result = await insertSubmission(env, source, body, {
    turnstileOk,
    ipHash,
    userAgent: request.headers.get('User-Agent'),
  })
  if (!result.ok) return result.response

  // Success path with the form's configured message (falls back to a default).
  return json({
    ok: true,
    id: result.id,
    successMessage: form.success_message || 'Thanks — your message has been received.',
  })
}

function corsPreflight(): Response {
  // Same-origin only: the site posts to itself. Keep the response small.
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// readJson / clientIpOf / asString are local shape helpers; readJson is
// deliberately NOT the admin-side parseBody: there is no zod record for a form
// payload, so a hand-rolled byte cap applies.

/** Pages Function params may be `string | string[]`; a repeated segment is a 404. */
function asString(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : ''
}
const MAX_FORM_BODY_BYTES = 100 * 1024 // generous cap for a form post
type ReadResult =
  | { ok: true; body: FormSubmissionPayload | null }
  | { ok: false; response: Response }

async function readJson(request: Request): Promise<ReadResult> {
  const contentType = request.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return { ok: false, response: error('bad_request', 'Send the body as application/json') }
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BODY_BYTES) {
    return { ok: false, response: error('payload_too_large', 'Body is too large') }
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { ok: false, response: error('bad_request', 'Body is not valid JSON') }
  }
  return { ok: true, body: raw as FormSubmissionPayload }
}function clientIpOf(request: Request): string | null {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    null
  )
}
