/*
 * Thin `import.meta.env` declaration for the drop-in client.
 *
 * In the site repo, `src/tsconfig` already sets `"types": ["vite/client"]`,
 * which provides `import.meta.env`. This file makes the CMS workspace's
 * typecheck of `site-integration/client` pass without dragging Vite in, and
 * co-exists with vite/client when synced (duplicate identical declarations are
 * allowed for interface merging; `env` is declared here as an augmentation).
 */
interface ImportMetaEnv {
  /** Same-origin by default; overridable for tests/storybook. */
  readonly VITE_CMS_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
