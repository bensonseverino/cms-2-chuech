import { describe, expect, it } from 'vitest'
import {
  homeDocSchema,
  homeRequired,
  navigationDocSchema,
  navigationRequired,
  pageDocSchema,
  servicePageDocSchema,
  servicePageRequired,
  servicesIndexDocSchema,
  servicesIndexRequired,
  siteDocSchema,
  siteRequired,
  footerDocSchema,
  footerRequired,
  workIndexDocSchema,
  workIndexRequired,
} from './documents'
import {
  articleEntrySchema,
  articleEntryRequired,
  clientEntrySchema,
  clientEntryRequired,
  projectEntrySchema,
  projectEntryRequired,
  serviceEntrySchema,
  serviceEntryRequired,
  testimonialEntrySchema,
  testimonialEntryRequired,
} from './entries'
import { validateRecord, type RecordSchema } from './validate'
import {
  articlesFixture,
  clientsFixture,
  footerFixture,
  homeFixture,
  navigationFixture,
  projectsFixture,
  servicesFixture,
  servicesIndexFixture,
  siteFixture,
  testimonialsFixture,
  webDesignFixture,
  workIndexFixture,
} from './__fixtures__/site-content'

/*
 * The seed gate (spec §4 "Done when"): the schemas must parse the content that
 * is on the site TODAY. Everything asserted here comes from the fixture, which
 * is transcribed from `website/my-project/src/content`.
 */

function pathsOf(result: ReturnType<typeof validateRecord<unknown>>): string[] {
  return result.ok ? [] : result.errors.map((error) => error.path)
}

function parsesAtDraft(schema: RecordSchema<unknown>, value: unknown): boolean {
  return validateRecord(schema, [], value, 'draft').ok
}

describe('documents parse the current content (draft)', () => {
  const cases: Array<[string, RecordSchema<unknown>, unknown]> = [
    ['_site', siteDocSchema, siteFixture],
    ['_navigation', navigationDocSchema, navigationFixture],
    ['_footer', footerDocSchema, footerFixture],
    ['_home', homeDocSchema, homeFixture],
    ['_services', servicesIndexDocSchema, servicesIndexFixture],
    ['_work', workIndexDocSchema, workIndexFixture],
    ['service_page (web-design)', servicePageDocSchema, webDesignFixture],
  ]

  for (const [name, schema, value] of cases) {
    it(name, () => {
      expect(parsesAtDraft(schema, value)).toBe(true)
    })
  }

  it('a generic page', () => {
    const privacy = { title: 'Privacy Policy', body: '# Privacy\n\nWe respect your data.' }
    expect(parsesAtDraft(pageDocSchema, privacy)).toBe(true)
  })
})

describe('documents publish from the current content', () => {
  it('_site publishes', () => {
    expect(validateRecord(siteDocSchema, siteRequired, siteFixture, 'publish').ok).toBe(true)
  })

  it('_navigation publishes', () => {
    expect(validateRecord(navigationDocSchema, navigationRequired, navigationFixture, 'publish').ok).toBe(true)
  })

  it('_footer publishes', () => {
    expect(validateRecord(footerDocSchema, footerRequired, footerFixture, 'publish').ok).toBe(true)
  })

  it('_services publishes', () => {
    expect(validateRecord(servicesIndexDocSchema, servicesIndexRequired, servicesIndexFixture, 'publish').ok).toBe(
      true,
    )
  })

  it('service_page (web-design) publishes', () => {
    expect(validateRecord(servicePageDocSchema, servicePageRequired, webDesignFixture, 'publish').ok).toBe(true)
  })

  /*
   * FINDING 1 — the home hero copy and the home intro statement are composed in
   * JSX (`HeroHeadline.tsx`), not in `src/content`. Publishing home therefore
   * reports exactly those two paths. That is the seed's remaining extraction
   * work, not a schema gap; when the seed lifts the copy out of JSX this test
   * flips to `true` and should be updated deliberately.
   */
  it('_home reports exactly the two paths whose copy lives in JSX', () => {
    expect(pathsOf(validateRecord(homeDocSchema, homeRequired, homeFixture, 'publish'))).toEqual([
      'hero.description',
      'introStatement.text',
    ])
  })

  /*
   * FINDING 1 (continued) — the /work hero has the same problem: its label,
   * title, pills, image and description are in `WorkPage.tsx`.
   */
  it('_work reports the hero paths whose copy lives in JSX', () => {
    expect(pathsOf(validateRecord(workIndexDocSchema, workIndexRequired, workIndexFixture, 'publish'))).toEqual([
      'hero.title',
    ])
  })
})

describe('collections publish from the current content', () => {
  it('every service publishes', () => {
    for (const service of servicesFixture) {
      expect(pathsOf(validateRecord(serviceEntrySchema, serviceEntryRequired, service, 'publish'))).toEqual([])
    }
  })

  it('every project publishes', () => {
    for (const project of projectsFixture) {
      expect(pathsOf(validateRecord(projectEntrySchema, projectEntryRequired, project, 'publish'))).toEqual([])
    }
  })

  it('every testimonial publishes', () => {
    for (const testimonial of testimonialsFixture) {
      expect(pathsOf(validateRecord(testimonialEntrySchema, testimonialEntryRequired, testimonial, 'publish'))).toEqual(
        [],
      )
    }
  })

  it('every article publishes', () => {
    for (const article of articlesFixture) {
      expect(pathsOf(validateRecord(articleEntrySchema, articleEntryRequired, article, 'publish'))).toEqual([])
    }
  })

  /*
   * FINDING 2 — the client strip renders styled text wordmarks and there are no
   * logo files in the repo, so `logo` (required) is missing for every client.
   * Real logo assets are an owner input; publishing a client needs one.
   */
  it('no client can publish until a real logo exists', () => {
    for (const client of clientsFixture) {
      const missing = pathsOf(validateRecord(clientEntrySchema, clientEntryRequired, client, 'publish'))
      expect(missing).toEqual(['logo'])
    }
  })
})
