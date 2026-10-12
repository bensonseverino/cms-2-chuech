import { describe, expect, it } from 'vitest'
import {
  footerDocSchema,
  footerRequired,
  homeDocSchema,
  homeRequired,
  pageDocSchema,
  pageRequired,
  siteDocSchema,
  siteRequired,
} from './documents'
import { clientEntrySchema, clientEntryRequired, serviceEntrySchema } from './entries'
import { mediaRef, slug as slugSchema } from './primitives'
import { requiredPaths, type FieldDef } from './fields'
import { validateRecord } from './validate'

/** Collapse a failure into just its paths, for readable assertions. */
function pathsOf(result: ReturnType<typeof validateRecord<unknown>>): string[] {
  return result.ok ? [] : result.errors.map((error) => error.path)
}

describe('draft level', () => {
  it('accepts an empty record — everything is optional while editing', () => {
    const result = validateRecord(homeDocSchema, homeRequired, {}, 'draft')
    expect(result.ok).toBe(true)
  })

  it('accepts a record with only some fields filled', () => {
    const result = validateRecord(footerDocSchema, footerRequired, { ctaLabel: 'Get in Touch' }, 'draft')
    expect(result.ok).toBe(true)
  })
})

describe('publish level', () => {
  it('reports every missing required path, not just the first', () => {
    const result = validateRecord(homeDocSchema, homeRequired, {}, 'publish')
    // `faq.items` is not itself required, so an absent FAQ list is allowed and
    // only the two genuinely required fields are reported.
    expect(pathsOf(result)).toEqual(['hero.description', 'introStatement.text'])
  })

  it('reports the whole list when a required list is empty', () => {
    const result = validateRecord(
      footerDocSchema,
      ['links[]', 'links[]?.label'],
      { links: [] },
      'publish',
    )
    expect(pathsOf(result)).toEqual(['links[]'])
  })

  it('passes when the required fields are present', () => {
    const result = validateRecord(
      footerDocSchema,
      footerRequired,
      {
        statement: 'Marino helps brands grow.',
        links: [{ label: 'Work', to: '/work' }],
      },
      'publish',
    )
    expect(result.ok).toBe(true)
  })

  it('reports a required field inside an optional group by its leaf path', () => {
    // `logo` is required but sits in no group, so the path is simply `logo`.
    const result = validateRecord(clientEntrySchema, clientEntryRequired, { name: 'emap' }, 'publish')
    expect(pathsOf(result)).toEqual(['logo'])
  })

  it('does not block publishing when an optional repeater is absent', () => {
    const withoutSocial = {
      companyName: 'Marino',
      email: 'hello@marino.co.uk',
      phone: '0161 660 6263',
      defaultSeo: { titleTemplate: '%s | Marino' },
    }
    expect(validateRecord(siteDocSchema, siteRequired, withoutSocial, 'publish').ok).toBe(true)
  })

  it('still requires the fields of a row that IS present in an optional repeater', () => {
    const halfARow = {
      companyName: 'Marino',
      email: 'hello@marino.co.uk',
      phone: '0161 660 6263',
      defaultSeo: { titleTemplate: '%s | Marino' },
      social: [{ label: 'LinkedIn' }],
    }
    expect(pathsOf(validateRecord(siteDocSchema, siteRequired, halfARow, 'publish'))).toEqual(['social[0].to'])
  })

  it('checks every row of a repeater', () => {
    const onlyFirstFilled = {
      statement: 'x',
      links: [{ label: 'Work', to: '/work' }, { label: '', to: '/blog' }],
    }
    const result = validateRecord(footerDocSchema, footerRequired, onlyFirstFilled, 'publish')
    // The path points at the exact row, so the editor can focus that input.
    expect(pathsOf(result)).toEqual(['links[1].label'])
  })

  it('treats a blank string as missing', () => {
    const result = validateRecord(pageDocSchema, pageRequired, { title: '   ', body: 'hi' }, 'publish')
    expect(pathsOf(result)).toEqual(['title'])
  })
})

describe('field rules', () => {
  it('rejects HTML in an inline field', () => {
    const result = validateRecord(
      footerDocSchema,
      footerRequired,
      { statement: 'Marino <script>alert(1)</script>' },
      'draft',
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0]?.path).toBe('statement')
  })

  it('rejects a mailto link target (those belong to the email/phone fields)', () => {
    const bad = { statement: 'x', links: [{ label: 'Mail', to: 'mailto:hello@marino.co.uk' }] }
    const result = validateRecord(footerDocSchema, footerRequired, bad, 'draft')
    expect(result.ok).toBe(false)
  })

  it('accepts an internal path and an https URL as link targets', () => {
    const good = {
      statement: 'x',
      links: [
        { label: 'Work', to: '/work' },
        { label: 'Site', to: 'https://marino.co.uk/work' },
      ],
    }
    expect(validateRecord(footerDocSchema, footerRequired, good, 'draft').ok).toBe(true)
  })

  it('enforces the slug shape', () => {
    expect(slugSchema.safeParse('web-design').success).toBe(true)
    expect(slugSchema.safeParse('Web Design').success).toBe(false)
    expect(slugSchema.safeParse('-leading').success).toBe(false)
    expect(slugSchema.safeParse('double--hyphen').success).toBe(false)
  })

  it('requires a well-formed media id', () => {
    expect(mediaRef.safeParse({ mediaId: 'med_01J8ZQ0000000000000000000A' }).success).toBe(true)
    expect(mediaRef.safeParse({ mediaId: '/uploads/a.jpg' }).success).toBe(false)
    expect(mediaRef.safeParse({ mediaId: 'med_short' }).success).toBe(false)
  })

  it('accepts a valid service entry slug', () => {
    expect(serviceEntrySchema.safeParse({ slug: 'web-design', title: 'Web Design' }).success).toBe(true)
  })
})

describe('requiredPaths', () => {
  it('walks groups and repeaters', () => {
    const fields: FieldDef[] = [
      { path: 'a', type: 'group', label: 'A', fields: [{ path: 'b', type: 'text', label: 'B', required: true }] },
      {
        path: 'rows',
        type: 'repeater',
        label: 'Rows',
        required: true,
        fields: [{ path: 'c', type: 'text', label: 'C', required: true }],
      },
      {
        path: 'optionalrows',
        type: 'repeater',
        label: 'Optional rows',
        fields: [{ path: 'd', type: 'text', label: 'D', required: true }],
      },
    ]

    expect(requiredPaths(fields)).toEqual(['a.b', 'rows[]', 'rows[].c', 'optionalrows[]?.d'])
  })
})
