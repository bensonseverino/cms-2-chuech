/*
 * RichInline — the one grammar for every inline field (spec §2.3).
 *
 *   **bold**            → bold run
 *   ==highlight==       → the lavender pill
 *   [text](/path)       → internal link, or [text](https://…) for external
 *   blank line          → new paragraph
 *   anything else       → literal text (escaped by the renderer)
 *
 * No HTML is ever stored or parsed here: unknown markup stays literal, which is
 * what makes the grammar safe by construction. The SITE renders the parse tree
 * (`RichInline` component); the CMS renders a live preview with the same
 * function; the API never looks inside a string.
 *
 * The parser is deliberately tolerant: an unterminated `**` or `==` is plain
 * text rather than an error, because an editor mid-typing must never be
 * blocked by a validation message.
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'highlight'; value: string }
  | { type: 'link'; value: string; to: string }

/** One paragraph: a run of nodes. */
export type InlineParagraph = InlineNode[]

/** Matches `[text](target)` — the target must be a path or an https URL. */
const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g

/**
 * Parse one inline field into paragraphs.
 *
 * A single string is split on blank lines (one or more newlines), then each
 * paragraph is scanned for the three inline markers. Bold and highlight do not
 * nest: the outermost marker wins, which keeps the renderer trivial and the
 * stored text readable.
 */
export function parseInline(source: string): InlineParagraph[] {
  return source
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map(parseParagraph)
}

/** Parse a single paragraph (no blank-line splitting). */
export function parseParagraph(paragraph: string): InlineParagraph {
  const nodes: InlineNode[] = []
  let rest = paragraph

  while (rest.length > 0) {
    const next = findNextMarker(rest)

    if (!next) {
      nodes.push({ type: 'text', value: rest })
      break
    }

    if (next.index > 0) {
      nodes.push({ type: 'text', value: rest.slice(0, next.index) })
    }

    nodes.push(next.node)
    rest = rest.slice(next.index + next.length)
  }

  return mergeAdjacentText(nodes)
}

type Match = { index: number; length: number; node: InlineNode }

function findNextMarker(source: string): Match | null {
  const candidates: Match[] = []

  const link = findLink(source)
  if (link) candidates.push(link)

  const bold = findDelimited(source, '**', (value) => ({ type: 'bold', value }))
  if (bold) candidates.push(bold)

  const highlight = findDelimited(source, '==', (value) => ({ type: 'highlight', value }))
  if (highlight) candidates.push(highlight)

  if (candidates.length === 0) return null

  // Leftmost wins; on a tie the longer match wins so `**x**` beats a stray `*`.
  return candidates.reduce((best, current) => {
    if (current.index < best.index) return current
    if (current.index === best.index && current.length > best.length) return current
    return best
  })
}

function findLink(source: string): Match | null {
  LINK_PATTERN.lastIndex = 0
  const match = LINK_PATTERN.exec(source)
  if (!match) return null

  const [full, label, to] = match
  if (label === undefined || to === undefined || label.trim().length === 0) return null

  return {
    index: match.index,
    length: full.length,
    node: { type: 'link', value: label, to },
  }
}

function findDelimited(
  source: string,
  delimiter: string,
  build: (value: string) => InlineNode,
): Match | null {
  const start = source.indexOf(delimiter)
  if (start === -1) return null

  const contentStart = start + delimiter.length
  const end = source.indexOf(delimiter, contentStart)
  if (end === -1) return null

  const value = source.slice(contentStart, end)
  // Empty markers (`****`) are not markup — treat them as literal text.
  if (value.length === 0) return null

  return {
    index: start,
    length: delimiter.length * 2 + value.length,
    node: build(value),
  }
}

/** Collapse neighbouring text nodes so the render tree stays minimal. */
function mergeAdjacentText(nodes: InlineNode[]): InlineNode[] {
  const merged: InlineNode[] = []

  for (const node of nodes) {
    const previous = merged[merged.length - 1]
    if (node.type === 'text' && previous?.type === 'text') {
      previous.value += node.value
      continue
    }
    merged.push(node)
  }

  return merged
}

/**
 * The plain-text form of an inline field — markup stripped. Used for SEO
 * fallbacks, excerpts, search and admin list previews.
 */
export function toPlainText(source: string): string {
  return parseInline(source)
    .map((paragraph) =>
      paragraph
        .map((node) => (node.type === 'link' ? node.value : node.value))
        .join(''),
    )
    .join('\n\n')
}

/**
 * Convert a legacy `RichSegment[]` (the site's current shape: a string, or a
 * `{ label, href }` link) into RichInline source. This is what the Phase 10
 * seed uses to lift the existing content into the grammar without retyping it.
 */
export function fromSegments(segments: readonly RichSegment[]): string {
  return segments
    .map((segment) => (typeof segment === 'string' ? segment : `[${segment.label}](${segment.href})`))
    .join('')
}

/** The site's pre-CMS inline shape. */
export type RichSegment = string | { label: string; href: string }
