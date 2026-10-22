import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
 * Admin SPA build. Tailwind v4 via the Vite plugin (same setup as the site),
 * plus the React plugin so Fast Refresh works during UI work.
 *
 * `npm run dev` serves the SPA alone on :5174. That is enough for UI work; the
 * API and bindings need `npm run dev:cms` (wrangler pages dev) from the repo
 * root, which serves the built app and the Functions on :8788 by default.
 */
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174,
  },
})
