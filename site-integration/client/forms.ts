/*
 * The site's form submitter (site repo: `src/cms/forms.ts`).
 *
 * POSTs a form to /api/forms/:source with the Turnstile token, the honeypot
 * passthrough and UTM attribution. The response contract matches
 * functions/api/forms/[source].ts exactly: `unprocessable` returns field-level
 * errors; `rate_limited` and `forbidden` are user-facing copy the form shows.
 */

export type SubmitFormInput = {
  source: string
  name?: string
  email?: string
  phone?: string
  message?: string
  /** Any extra inputs the form defines (budget, checkbox groups, …). */
  fields?: Record<string, unknown>
  turnstileToken?: string
  /** Honeypot value from the hidden input; bots fill it. */
  _gotcha?: unknown
  /** Attribution, read by the form component from location.search. */
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
  /** Current SPA route, e.g. '/web-design'. Stored for the inbox. */
  pagePath?: string
  referrer?: string
}

export type SubmitFormResult =
  | { ok: true; id: string; successMessage: string }
  | { ok: false; code: string; message: string; fields?: { path: string; message: string }[] }

export async function submitForm(input: SubmitFormInput): Promise<SubmitFormResult> {
  try {
    const response = await fetch(`/api/forms/${encodeURIComponent(input.source)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Same origin. Do NOT send credentials: the public API is anonymous.
      credentials: 'omit',
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        fields: input.fields,
        turnstileToken: input.turnstileToken,
        _gotcha: input._gotcha,
        utm: input.utm,
        pagePath: input.pagePath,
        referrer: input.referrer,
      }),
    })

    const body = (await response.json().catch(() => null)) as
      | { ok?: true; id?: string; successMessage?: string }
      | { error?: { code: string; message: string; fields?: { path: string; message: string }[] } }
      | null

    if (response.ok && body && 'ok' in body && body.ok && body.id) {
      return {
        ok: true,
        id: body.id,
        successMessage: body.successMessage ?? 'Thanks — your message has been received.',
      }
    }

    if (body && 'error' in body && body.error) {
      return {
        ok: false,
        code: body.error.code,
        message: body.error.message,
        fields: body.error.fields,
      }
    }

    return { ok: false, code: 'server_error', message: 'Something went wrong; please try again.' }
  } catch {
    return { ok: false, code: 'network_error', message: 'You may be offline; please try again.' }
  }
}

/** Pull `?utm_*` out of the page URL, if present. */
export function utmFromLocation(search: string): SubmitFormInput['utm'] {
  const params = new URLSearchParams(search)
  const pick = (key: string) => params.get(`utm_${key}`) ?? undefined
  const utm = {
    source: pick('source'),
    medium: pick('medium'),
    campaign: pick('campaign'),
    term: pick('term'),
    content: pick('content'),
  }
  return Object.values(utm).some(Boolean) ? utm : undefined
}
