import { z } from 'zod'
import { requiredPaths, type CollectionName, type FieldDef } from './fields'
import {
  MAX_ARRAY,
  focusPoint,
  inlineText,
  linkOptionalTarget,
  markdownBody,
  mediaRef,
  mediaRefOptional,
  slug as slugSchema,
  sortIndex,
} from './primitives'
import { draftObject } from './shape'

/*
 * Entries — the collections (spec §2.1). Each one is a row in `entries` with a
 * `collection` discriminator, so they share the storage shape and differ only
 * in `data`.
 *
 * `sort` is on every entry: the list order in the admin and on the site.
 * Slugs are unique per collection and immutable once published (spec §7).
 */

// --- services ---------------------------------------------------------------

export const serviceEntrySchema = draftObject({
  slug: slugSchema,
  title: inlineText(120),
  description: inlineText(),
  keywords: z.array(linkOptionalTarget).max(MAX_ARRAY),
  image: mediaRefOptional,
  sort: sortIndex,
  showOnHome: z.boolean(),
  /** The service page document this row links to, if any. */
  pageSlug: inlineText(80),
})

export type ServiceEntry = z.infer<typeof serviceEntrySchema>

export const serviceEntryFields: FieldDef[] = [
  { path: 'slug', type: 'text', label: 'Slug', required: true, help: 'Lowercase words separated by hyphens.' },
  { path: 'title', type: 'text', label: 'Title', required: true },
  { path: 'description', type: 'inline', label: 'Description', required: true },
  { path: 'keywords', type: 'list', of: 'link', label: 'Keywords', max: 20,
    help: 'A keyword with no link renders as a plain chip.' },
  { path: 'image', type: 'media', label: 'Image', accept: 'image' },
  { path: 'sort', type: 'number', label: 'Order', min: 0 },
  { path: 'showOnHome', type: 'toggle', label: 'Show on the home page' },
  { path: 'pageSlug', type: 'text', label: 'Service page slug',
    help: 'Links this row to a service page document.' },
]
export const serviceEntryRequired = requiredPaths(serviceEntryFields)

// --- projects ---------------------------------------------------------------

export const projectEntrySchema = draftObject({
  slug: slugSchema,
  title: inlineText(200),
  /** Service titles this project is tagged with (Work filters, carousels). */
  services: z.array(inlineText(120)).max(MAX_ARRAY),
  image: mediaRefOptional,
  cardFocus: focusPoint,
  /** An optional wide crop used by the home panel. */
  wideImage: mediaRefOptional,
  summary: inlineText(),
  body: markdownBody,
  gallery: z.array(mediaRef).max(MAX_ARRAY),
  featured: z.boolean(),
  sort: sortIndex,
})

export type ProjectEntry = z.infer<typeof projectEntrySchema>

export const projectEntryFields: FieldDef[] = [
  { path: 'slug', type: 'text', label: 'Slug', required: true },
  { path: 'title', type: 'text', label: 'Title', required: true },
  { path: 'services', type: 'multiselect', label: 'Services', optionsFrom: 'services',
    help: 'Must be existing service titles; the Work grid filters on these.' },
  { path: 'image', type: 'media', label: 'Card image', accept: 'image' },
  { path: 'cardFocus', type: 'group', label: 'Card focus point', fields: [
    { path: 'x', type: 'number', label: 'Horizontal', min: 0, max: 1, step: 0.01 },
    { path: 'y', type: 'number', label: 'Vertical', min: 0, max: 1, step: 0.01 },
  ] },
  { path: 'wideImage', type: 'media', label: 'Wide crop (optional)', accept: 'image' },
  { path: 'summary', type: 'inline', label: 'Summary' },
  { path: 'body', type: 'markdown', label: 'Body', help: 'Used by the future project detail pages.' },
  { path: 'gallery', type: 'list', of: 'media', label: 'Gallery', max: 30 },
  { path: 'featured', type: 'toggle', label: 'Featured' },
  { path: 'sort', type: 'number', label: 'Order', min: 0 },
]
export const projectEntryRequired = requiredPaths(projectEntryFields)

// --- testimonials -----------------------------------------------------------

export const testimonialEntrySchema = draftObject({
  quote: inlineText(),
  author: inlineText(120),
  company: inlineText(120),
  sort: sortIndex,
})

export type TestimonialEntry = z.infer<typeof testimonialEntrySchema>

export const testimonialEntryFields: FieldDef[] = [
  { path: 'quote', type: 'inline', label: 'Quote', required: true },
  { path: 'author', type: 'text', label: 'Author', required: true },
  { path: 'company', type: 'text', label: 'Company', required: true },
  { path: 'sort', type: 'number', label: 'Order', min: 0 },
]
export const testimonialEntryRequired = requiredPaths(testimonialEntryFields)

// --- clients ----------------------------------------------------------------

export const clientEntrySchema = draftObject({
  name: inlineText(120),
  logo: mediaRefOptional,
  url: z.string().max(2048),
  sort: sortIndex,
})

export type ClientEntry = z.infer<typeof clientEntrySchema>

export const clientEntryFields: FieldDef[] = [
  { path: 'name', type: 'text', label: 'Name', required: true },
  { path: 'logo', type: 'media', label: 'Logo', accept: 'image', required: true,
    help: 'SVG or PNG.' },
  { path: 'url', type: 'link', label: 'Website (optional)' },
  { path: 'sort', type: 'number', label: 'Order', min: 0 },
]
export const clientEntryRequired = requiredPaths(clientEntryFields)

// --- articles ---------------------------------------------------------------

export const articleEntrySchema = draftObject({
  slug: slugSchema,
  title: inlineText(200),
  date: z.string().max(10),
  excerpt: inlineText(),
  categories: z.array(inlineText(120)).max(MAX_ARRAY),
  image: mediaRefOptional,
  body: markdownBody,
  readTime: inlineText(40),
  sort: sortIndex,
})

export type ArticleEntry = z.infer<typeof articleEntrySchema>

export const articleEntryFields: FieldDef[] = [
  { path: 'slug', type: 'text', label: 'Slug', required: true },
  { path: 'title', type: 'text', label: 'Title', required: true },
  { path: 'date', type: 'date', label: 'Date', required: true, help: 'Used for ordering (newest first).' },
  { path: 'excerpt', type: 'inline', label: 'Excerpt', required: true },
  { path: 'categories', type: 'multiselect', label: 'Categories', optionsFrom: 'services' },
  { path: 'image', type: 'media', label: 'Image', accept: 'image' },
  { path: 'body', type: 'markdown', label: 'Body' },
  { path: 'readTime', type: 'text', label: 'Read time', help: 'e.g. "4 min read".' },
  { path: 'sort', type: 'number', label: 'Order', min: 0 },
]
export const articleEntryRequired = requiredPaths(articleEntryFields)

// --- Collection registry ----------------------------------------------------

/** The five collections, with their schema, catalog and publish requirements. */
export const COLLECTIONS = {
  services: { schema: serviceEntrySchema, fields: serviceEntryFields, required: serviceEntryRequired },
  projects: { schema: projectEntrySchema, fields: projectEntryFields, required: projectEntryRequired },
  testimonials: {
    schema: testimonialEntrySchema,
    fields: testimonialEntryFields,
    required: testimonialEntryRequired,
  },
  clients: { schema: clientEntrySchema, fields: clientEntryFields, required: clientEntryRequired },
  articles: { schema: articleEntrySchema, fields: articleEntryFields, required: articleEntryRequired },
} as const

export type Collections = typeof COLLECTIONS

export function isCollectionName(value: string): value is CollectionName {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, value)
}
