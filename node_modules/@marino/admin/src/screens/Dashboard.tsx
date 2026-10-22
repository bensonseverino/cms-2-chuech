/*
 * Dashboard (spec §5.3 `/`). The four cards and the two lists are laid out per
 * the design system; their data comes from the admin API in Phase 7 and is
 * wired here in Phase 9. Until then the values render as an em dash so nothing
 * on screen is invented.
 */
const CARDS = [
  { label: 'New submissions', hint: 'Unread since your last visit' },
  { label: 'Unpublished changes', hint: 'Records with a newer draft than snapshot' },
  { label: 'Drafts', hint: 'Never published' },
  { label: 'Storage used', hint: 'Media in the shared R2 bucket' },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-[25px]">
      <div className="grid gap-[25px] sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <section
            key={card.label}
            className="rounded-panel bg-white p-[25px] shadow-soft"
            aria-label={card.label}
          >
            <h2 className="text-[13px] font-semibold text-obsidian/70">{card.label}</h2>
            <p className="mt-3 text-[33px] font-bold leading-none">—</p>
            <p className="mt-3 text-[13px] text-obsidian/70">{card.hint}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-[25px] lg:grid-cols-2">
        {['Recent submissions', 'Recent activity'].map((heading) => (
          <section
            key={heading}
            className="rounded-panel bg-white p-[25px] shadow-soft lg:p-[var(--space-40)]"
            aria-label={heading}
          >
            <h2 className="mb-6 text-[18px] font-bold">{heading}</h2>
            <p className="flex items-center gap-2 text-sm text-obsidian/70">
              <span className="inline-block h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
              Nothing to show yet — this list is populated in Phase 9.
            </p>
          </section>
        ))}
      </div>

      <section
        className="rounded-panel bg-white p-[25px] shadow-soft lg:p-[var(--space-40)]"
        aria-label="System health"
      >
        <h2 className="mb-3 text-[18px] font-bold">System health</h2>
        <p className="text-sm text-obsidian/70">
          Bindings (D1, R2, KV) are checked by <code>GET /api/admin/health</code>. Run{' '}
          <code>npm run dev:cms</code> from the repo root and open that path to see the report.
        </p>
      </section>
    </div>
  )
}
