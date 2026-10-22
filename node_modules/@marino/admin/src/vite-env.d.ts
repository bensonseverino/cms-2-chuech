/// <reference types="vite/client" />

/*
 * Build-time variables exposed to the admin SPA. Only PUBLIC values belong
 * here — nothing secret is ever a `VITE_*` variable (spec §9.2). The admin
 * talks to its own origin (`/api/admin/*`), so there is usually nothing to
 * configure; this exists so the shape is documented.
 */
interface ImportMetaEnv {
  /** Set only when the admin SPA is served from a different origin in dev. */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
