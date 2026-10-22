/*
 * @marino/content-schema — the single source of truth for what a record is.
 *
 * Three consumers, one definition (spec §1 "page structure"):
 *   * the admin editor renders each record's `fields` catalog,
 *   * both APIs validate with `schema` + `validateRecord`,
 *   * the site reads the same record shapes from the public API.
 */

export * from './primitives'
export * from './fields'
export * from './shape'
export * from './rich-inline'
export * from './validate'
export * from './documents'
export * from './entries'
export * from './registry'
