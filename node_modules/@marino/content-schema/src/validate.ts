/*
 * Two validation levels (spec §4.2):
 *
 *   draft   — types and lengths only. Everything may be missing, because an
 *             editor saves constantly while a section is half-written.
 *   publish — the same checks PLUS "the required fields are present", which is
 *             what stops a half-finished page going live.
 *
 * Both levels return the same `{ path, message }[]` shape, so the editor binds
 * one error renderer and the API returns one error body.
 *
 * The schema parameter is structurally typed (not `z.ZodType`) on purpose: zod
 * v4's generic types are covariant in the output but the registry stores
 * schemas of many different shapes side by side, and a structural
 * `safeParse` signature is the one interface every zod schema already
 * satisfies. Nothing here imports zod, so this module also runs anywhere.
 */

export type ValidationLevel = 'draft' | 'publish'

/** The part of a zod issue this module reads. */
export type IssueLike = {
  path: readonly PropertyKey[]
  message: string
}

/** The one method every zod schema has, at the precision this module needs. */
export type RecordSchema<T> = {
  safeParse(
    value: unknown,
  ):
    | { success: true; data: T }
    | { success: false; error: { issues: readonly IssueLike[] } }
}

/** One field-level problem, ready to render under an input. */
export type FieldError = {
  /**
   * Dot path within the record. A missing list is reported as `faq.items[]`;
   * a bad row points at the row, e.g. `faq.items[1].q`.
   */
  path: string
  message: string
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldError[] }

const PUBLISH_REQUIRED_MESSAGE = 'Required to publish'

/**
 * Validate `value` against `schema` at `level`.
 *
 * `requiredPaths` comes from the record's FieldDef catalog (`requiredPaths()`),
 * so the asterisks in the editor and this gate are the same list.
 */
export function validateRecord<T>(
  schema: RecordSchema<T>,
  requiredPaths: readonly string[],
  value: unknown,
  level: ValidationLevel,
): ValidationResult<T> {
  const parsed = schema.safeParse(value)

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map(toFieldError) }
  }

  if (level === 'draft') {
    return { ok: true, data: parsed.data }
  }

  const missing = requiredPaths.flatMap((path) => checkRequired(parsed.data, path))
  if (missing.length > 0) {
    return {
      ok: false,
      errors: missing.map((path) => ({ path, message: PUBLISH_REQUIRED_MESSAGE })),
    }
  }

  return { ok: true, data: parsed.data }
}

function toFieldError(issue: IssueLike): FieldError {
  return {
    path: issue.path.length > 0 ? issue.path.map(String).join('.') : '',
    message: issue.message,
  }
}

/** Returns the full dotted paths that are required but empty, if any. */
function checkRequired(root: unknown, path: string): string[] {
  return walk(root, path.split('.'), path).missing
}

type WalkResult = { missing: string[] }

function walk(node: unknown, segments: string[], fullPath: string): WalkResult {
  const [head, ...rest] = segments

  if (head === undefined) {
    return { missing: isFilled(node) ? [] : [fullPath] }
  }

  const arrayKey = /^(.*)\[\](\?)?$/.exec(head)

  if (arrayKey) {
    const key = arrayKey[1] ?? ''
    // `[]` is a required list; `[]?` applies its row rules only when present.
    const conditional = arrayKey[2] === '?'
    const collection = readKey(node, key)

    if (!Array.isArray(collection) || collection.length === 0) {
      // An empty (or absent) list is the failure for a required list. For a
      // conditional one it is fine, and either way we must not also report
      // every row's fields, which would bury the real problem.
      return { missing: conditional ? [] : [stripConditionalMarker(fullPath)] }
    }

    return {
      missing: collection.flatMap((row, index) =>
        // Point at the exact row (`links[1].label`), not the list, so the
        // editor can focus the offending input.
        walk(row, rest, withRowIndex(fullPath, index)).missing,
      ),
    }
  }

  const child = readKey(node, head)

  if (rest.length === 0) {
    return { missing: isFilled(child) ? [] : [fullPath] }
  }

  return walk(child, rest, fullPath)
}

/** `links[].label` + row 1 → `links[1].label`. */
function withRowIndex(path: string, index: number): string {
  return path.replace(/\[\]\??/, `[${index}]`)
}

/** Drop the internal `[]?` marker so messages read `links[].label`. */
function stripConditionalMarker(path: string): string {
  return path.replace(/\[\]\?/g, '[]')
}

function readKey(node: unknown, key: string): unknown {
  if (typeof node !== 'object' || node === null) return undefined
  return (node as Record<string, unknown>)[key]
}

/**
 * "Present" for publish purposes: a non-blank string, a non-empty array, a
 * non-empty object, or a real number/boolean. `0` and `false` are values, not
 * absences.
 */
function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}
