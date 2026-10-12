import { z } from 'zod'

/*
 * Shared field primitives. Every record schema is built from these, so a limit
 * or a rule is written once (spec §4.4).
 *
 * Two rules hold for everything here:
 *   1. No HTML is ever stored in an inline field (spec §2.3). Any field that
 *      lands in `src/components/primitives/RichText.tsx` on the site rejects
 *      `<` and `>`; the site escapes the rest when it renders.
 *   2. Media is a REFERENCE (`{ mediaId }`), never a URL. Resolution to a real
 *      URL happens server-side in `resolveMedia` (spec §4.5), so a stored
 *      record survives a bucket or custom-domain change.
 */

// --- Limits (spec §4.4) -----------------------------------------------------

/** Longest ordinary string. */
export const MAX_STRING = 5_000
/** Longest markdown body (articles, generic pages). */
export const MAX_BODY = 100_000
/** Longest array. */
export const MAX_ARRAY = 100
/** SEO title / description budgets, shown as counters in the admin. */
export const SEO_TITLE_MAX = 70
export const SEO_DESCRIPTION_MAX = 160

const HTML_PATTERN = /[<>]/
const HTML_MESSAGE = 'HTML is not allowed here — use the inline markup (**bold**, ==highlight==, [text](/path))'

/** Rejects any string carrying an HTML tag. */
export function hasNoHtml(value: string): boolean {
  return !HTML_PATTERN.test(value)
}

// --- Leaves -----------------------------------------------------------------

/** Plain text with no HTML. `max` defaults to the ordinary string limit. */
export const inlineText = (max: number = MAX_STRING) =>
  z.string().max(max).refine(hasNoHtml, HTML_MESSAGE)

/**
 * A visibility toggle that also reports whether a field is filled. Not a
 * schema concern — kept out on purpose.
 */

/** Markdown body (article/page). Converted to sanitised HTML at publish time. */
export const markdownBody = z.string().max(MAX_BODY)

/** A URL-safe slug: lowercase, digits and single hyphens (spec §7 slugs). */
export const slug = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')

/** An ISO calendar date, `YYYY-MM-DD` (article dates). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Not a real date')

const INTERNAL_PATH = /^\/(?:[a-z0-9._~-]+\/?)*$/
const HTTPS_URL = /^https:\/\/[^\s]+$/

/**
 * A link target: an internal path (`/work`, `/blog/post`) or an absolute
 * `https://` URL (spec §4.3). `mailto:`/`tel:` are deliberately excluded —
 * those live in the dedicated `email`/`phone` fields of the site settings, and
 * allowing them here would let a typo ship a dead link.
 */
export const linkTarget = z
  .string()
  .max(2048)
  .refine(
    (value) => INTERNAL_PATH.test(value) || HTTPS_URL.test(value),
    'Use an internal path (/work) or a full https:// URL',
  )

/** A labelled link. */
export const link = z.object({
  label: inlineText(200),
  to: linkTarget,
})

/** Optional link — used where the reference design omits the target. */
export const linkOptionalTarget = z.object({
  label: inlineText(200),
  to: linkTarget.optional(),
})

/** A media-library reference (spec §4.3). */
export const mediaRef = z.object({
  mediaId: z.string().regex(/^med_[0-9A-Z]{26}$/, 'Not a media id'),
  alt: inlineText(300).optional(),
})

/** An optional media reference (nothing published yet may reference media). */
export const mediaRefOptional = mediaRef.optional()

/** A focus point for cropping, both axes normalised to 0..1 (spec §2.1 media). */
export const focusPoint = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

/** A non-negative sort index. */
export const sortIndex = z.number().int().min(0)

/** SEO block shared by every document and page. */
export const seoBlock = z.object({
  title: inlineText(SEO_TITLE_MAX).optional(),
  description: inlineText(SEO_DESCRIPTION_MAX).optional(),
  image: mediaRefOptional,
})

/** A `titleTemplate` such as `%s | Marino` (site settings default SEO). */
export const titleTemplate = inlineText(SEO_TITLE_MAX).refine(
  (value) => value.includes('%s'),
  'Include %s where the page title goes, e.g. "%s | Marino"',
)
