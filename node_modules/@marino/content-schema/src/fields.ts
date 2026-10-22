/*
 * FieldDef — the catalog that drives the admin editor (spec §5.2).
 *
 * One list per record, written next to its zod schema. The editor renders any
 * FieldDef list without knowing which record it is editing, so adding a field
 * to a page is a config change, not a new screen.
 *
 * `required: true` is the single source of truth for two things that must never
 * disagree: the asterisk in the editor and the publish-time required check
 * (`requiredPaths` below feeds `validate`). The draft schema ignores it.
 */

export type MediaAccept = 'image' | 'video' | 'any'

export type FieldOption = { value: string; label: string }

export type CollectionName = 'services' | 'projects' | 'testimonials' | 'clients' | 'articles'

/** What a `list` field's items are. */
export type ListItemKind = 'text' | 'link' | 'media' | 'number'

/** What a `reference` (or a `list of reference`) points at. */
export type ReferenceTarget = CollectionName | 'pages'

type CommonField = {
  /** Dot path within the record, e.g. `hero.title`. */
  path: string
  /** Label shown above the control. */
  label: string
  /** Helper text under the control (13px, obsidian at 70%). */
  help?: string
  /** Required to publish (asterisk in the editor). */
  required?: boolean
}

export type TextField = CommonField & { type: 'text'; max?: number; placeholder?: string }
export type TextareaField = CommonField & { type: 'textarea'; max?: number; rows?: number }
/** Inline rich text: the RichInline grammar, with a toolbar and live preview. */
export type InlineField = CommonField & { type: 'inline'; max?: number }
export type MarkdownField = CommonField & { type: 'markdown'; max?: number }
export type NumberField = CommonField & {
  type: 'number'
  min?: number
  max?: number
  step?: number
}
export type ToggleField = CommonField & { type: 'toggle' }
export type SelectField = CommonField & { type: 'select'; options: readonly FieldOption[] }
export type MultiselectField = CommonField & {
  type: 'multiselect'
  options?: readonly FieldOption[]
  /** Populate from a collection instead of a fixed list (e.g. every service). */
  optionsFrom?: CollectionName
}
export type DateField = CommonField & { type: 'date' }
export type LinkField = CommonField & { type: 'link' }
export type MediaField = CommonField & { type: 'media'; accept?: MediaAccept }
export type ListField = CommonField & {
  type: 'list'
  of: ListItemKind | 'reference'
  collection?: ReferenceTarget
  /** Shortest valid list, when the field is present (e.g. pills are exactly 2). */
  min?: number
  max?: number
}
export type GroupField = CommonField & { type: 'group'; fields: readonly FieldDef[] }
export type RepeaterField = CommonField & {
  type: 'repeater'
  fields: readonly FieldDef[]
  /** How one row is titled in the editor, e.g. `Question`. */
  itemLabel?: string
  max?: number
}
export type ReferenceField = CommonField & { type: 'reference'; collection: ReferenceTarget }

export type FieldDef =
  | TextField
  | TextareaField
  | InlineField
  | MarkdownField
  | NumberField
  | ToggleField
  | SelectField
  | MultiselectField
  | DateField
  | LinkField
  | MediaField
  | ListField
  | GroupField
  | RepeaterField
  | ReferenceField

/**
 * Every dot path marked `required: true`, in catalog order. `prefix` is used
 * while walking nested groups.
 */
export function requiredPaths(fields: readonly FieldDef[], prefix = ''): string[] {
  const paths: string[] = []

  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.path}` : field.path

    if (field.type === 'group') {
      paths.push(...requiredPaths(field.fields, path))
      continue
    }

    if (field.type === 'repeater') {
      // A required repeater means "at least one row". Each required field
      // inside a row is emitted with a `[]` segment, so the publish check walks
      // EVERY row rather than only the first (see `validate`).
      //
      // When the repeater itself is optional (e.g. the site's social links),
      // the row requirements are conditional: an absent list is fine, but a row
      // that IS present must be complete. That is what the `[]?` marker means.
      if (field.required) paths.push(`${path}[]`)
      paths.push(...requiredPaths(field.fields, `${path}[]${field.required ? '' : '?'}`))
      continue
    }

    if (field.required) paths.push(path)
  }

  return paths
}
