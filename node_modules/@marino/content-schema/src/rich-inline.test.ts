import { describe, expect, it } from 'vitest'
import { fromSegments, parseInline, parseParagraph, toPlainText } from './rich-inline'

describe('parseInline', () => {
  it('parses bold', () => {
    expect(parseParagraph('**bold**')).toEqual([{ type: 'bold', value: 'bold' }])
  })

  it('parses highlight', () => {
    expect(parseParagraph('a ==b== c')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'highlight', value: 'b' },
      { type: 'text', value: ' c' },
    ])
  })

  it('parses a link', () => {
    expect(parseParagraph('[Work](/work)')).toEqual([
      { type: 'link', value: 'Work', to: '/work' },
    ])
  })

  it('parses an external link', () => {
    expect(parseParagraph('[Site](https://example.com/x)')).toEqual([
      { type: 'link', value: 'Site', to: 'https://example.com/x' },
    ])
  })

  it('mixes markers in one paragraph', () => {
    expect(parseParagraph('[Work](/work) and **great** stuff')).toEqual([
      { type: 'link', value: 'Work', to: '/work' },
      { type: 'text', value: ' and ' },
      { type: 'bold', value: 'great' },
      { type: 'text', value: ' stuff' },
    ])
  })

  it('picks the leftmost marker', () => {
    expect(parseParagraph('**a** ==b==')).toEqual([
      { type: 'bold', value: 'a' },
      { type: 'text', value: ' ' },
      { type: 'highlight', value: 'b' },
    ])
  })

  it('splits paragraphs on blank lines', () => {
    expect(parseInline('one\n\ntwo')).toEqual([
      [{ type: 'text', value: 'one' }],
      [{ type: 'text', value: 'two' }],
    ])
  })

  it('treats a single newline as part of the paragraph', () => {
    expect(parseInline('one\ntwo')).toHaveLength(1)
  })

  it('ignores empty paragraphs', () => {
    expect(parseInline('\n\n  \n\n')).toEqual([])
  })

  it('leaves an unterminated marker as text', () => {
    expect(parseParagraph('**unterminated')).toEqual([{ type: 'text', value: '**unterminated' }])
  })

  it('leaves an empty marker as text', () => {
    expect(parseParagraph('****')).toEqual([{ type: 'text', value: '****' }])
  })

  it('merges adjacent text runs', () => {
    const nodes = parseParagraph('plain **bold**')
    expect(nodes.filter((node) => node.type === 'text')).toHaveLength(1)
  })

  it('leaves HTML as literal text (never parsed)', () => {
    expect(parseParagraph('<b>x</b>')).toEqual([{ type: 'text', value: '<b>x</b>' }])
  })
})

describe('toPlainText', () => {
  it('strips every marker', () => {
    expect(toPlainText('a **b** ==c== [d](/e)')).toBe('a b c d')
  })

  it('keeps paragraph breaks', () => {
    expect(toPlainText('one\n\ntwo')).toBe('one\n\ntwo')
  })
})

describe('fromSegments', () => {
  it('converts the site\u2019s legacy inline shape', () => {
    expect(fromSegments(['a ', { label: 'B', href: '/b' }, '.'])).toBe('a [B](/b).')
  })

  it('round-trips through the parser', () => {
    const segments = ['See ', { label: 'Work', href: '/work' }, ' for more.']
    const nodes = parseParagraph(fromSegments(segments))
    expect(nodes).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', value: 'Work', to: '/work' },
      { type: 'text', value: ' for more.' },
    ])
  })
})
