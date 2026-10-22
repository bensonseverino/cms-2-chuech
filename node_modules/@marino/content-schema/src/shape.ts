import { z } from 'zod'

/*
 * Draft-level schemas are "types and lengths only, everything optional" (spec
 * §4.2). Rather than hand-writing `.optional()` on every leaf — and forgetting
 * one — every record is declared with `draftObject`, which makes each top-level
 * key optional and is used recursively for nested groups.
 *
 * Requiredness at PUBLISH time is NOT expressed here. It is derived from the
 * FieldDef catalog (`requiredPaths`) so the admin form's asterisks and the
 * publish gate can never disagree — one list, two consumers.
 */

type OptionalShape<T extends z.ZodRawShape> = {
  [K in keyof T]: z.ZodOptional<T[K]>
}

/** Make every key of a raw shape optional. */
export function optionalShape<T extends z.ZodRawShape>(shape: T): OptionalShape<T> {
  const result: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(shape)) {
    result[key] = withOptional(field)
  }
  return result as unknown as OptionalShape<T>
}

/**
 * `.optional()` exists on every zod schema at runtime, but zod v4's base
 * `ZodType` type (which `ZodRawShape`'s values widen to) does not declare it.
 * Casting here keeps the constraint honest without widening the whole shape.
 */
function withOptional(field: unknown): unknown {
  return (field as { optional(): unknown }).optional()
}

/**
 * A draft-level object: every field optional, still typed and length-checked
 * when present. Use for records and for every nested group, so a half-finished
 * draft always saves.
 */
export function draftObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(optionalShape(shape))
}
