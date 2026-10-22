import {
  footerDocSchema,
  footerFields,
  footerRequired,
  homeDocSchema,
  homeFields,
  homeRequired,
  navigationDocSchema,
  navigationFields,
  navigationRequired,
  pageDocSchema,
  pageFields,
  pageRequired,
  servicePageDocSchema,
  servicePageFields,
  servicePageRequired,
  servicesIndexDocSchema,
  servicesIndexFields,
  servicesIndexRequired,
  siteDocSchema,
  siteFields,
  siteRequired,
  workIndexDocSchema,
  workIndexFields,
  workIndexRequired,
} from './documents'
import type { FieldDef } from './fields'
import type { RecordSchema } from './validate'

/*
 * The document registry: one entry per `documents.type`, with the schema, the
 * FieldDef catalog and the publish requirements. The admin's document editor and
 * both APIs look records up here, so a new document type is one entry — no new
 * screen, no new endpoint (spec §1 "page structure").
 */

export type DocumentType =
  | 'site'
  | 'navigation'
  | 'footer'
  | 'home'
  | 'services_index'
  | 'work_index'
  | 'service_page'
  | 'page'

/** Singleton documents have a fixed slug; pages and service pages do not. */
export const SINGLETON_SLUGS: Record<string, DocumentType> = {
  _site: 'site',
  _navigation: 'navigation',
  _footer: 'footer',
  _home: 'home',
  _services: 'services_index',
  _work: 'work_index',
}

export const SINGLETON_DOCUMENTS: Record<Exclude<DocumentType, 'service_page' | 'page'>, string> = {
  site: '_site',
  navigation: '_navigation',
  footer: '_footer',
  home: '_home',
  services_index: '_services',
  work_index: '_work',
}

export type DocumentDefinition = {
  type: DocumentType
  /** Shown in the admin list. */
  label: string
  /** The slug this document is stored under, when it is a singleton. */
  slug?: string
  /**
   * Structurally typed so every document's schema can sit in one record
   * (see `RecordSchema`). Call it through `validateRecord` for field errors.
   */
  schema: RecordSchema<Record<string, unknown>>
  fields: FieldDef[]
  required: string[]
}

export const DOCUMENTS = {
  site: {
    type: 'site',
    label: 'Site settings',
    slug: SINGLETON_DOCUMENTS.site,
    schema: siteDocSchema,
    fields: siteFields,
    required: siteRequired,
  },
  navigation: {
    type: 'navigation',
    label: 'Navigation',
    slug: SINGLETON_DOCUMENTS.navigation,
    schema: navigationDocSchema,
    fields: navigationFields,
    required: navigationRequired,
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    slug: SINGLETON_DOCUMENTS.footer,
    schema: footerDocSchema,
    fields: footerFields,
    required: footerRequired,
  },
  home: {
    type: 'home',
    label: 'Home',
    slug: SINGLETON_DOCUMENTS.home,
    schema: homeDocSchema,
    fields: homeFields,
    required: homeRequired,
  },
  services_index: {
    type: 'services_index',
    label: 'Services page',
    slug: SINGLETON_DOCUMENTS.services_index,
    schema: servicesIndexDocSchema,
    fields: servicesIndexFields,
    required: servicesIndexRequired,
  },
  work_index: {
    type: 'work_index',
    label: 'Work page',
    slug: SINGLETON_DOCUMENTS.work_index,
    schema: workIndexDocSchema,
    fields: workIndexFields,
    required: workIndexRequired,
  },
  service_page: {
    type: 'service_page',
    label: 'Service page',
    schema: servicePageDocSchema,
    fields: servicePageFields,
    required: servicePageRequired,
  },
  page: {
    type: 'page',
    label: 'Page',
    schema: pageDocSchema,
    fields: pageFields,
    required: pageRequired,
  },
} satisfies Record<DocumentType, DocumentDefinition>

export function isDocumentType(value: string): value is DocumentType {
  return Object.prototype.hasOwnProperty.call(DOCUMENTS, value)
}

// --- Slugs ------------------------------------------------------------------

/**
 * Editor-visible slug rules (spec §7): lowercase `a-z0-9-`, no leading or
 * trailing hyphen, no doubling. Immutability once published is enforced in the
 * API, not here — this is only the shape.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= 80 && SLUG_PATTERN.test(value)
}

/** Turn arbitrary text into a candidate slug (the admin's "suggest" action). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
