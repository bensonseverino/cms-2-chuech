import { Link, useLocation } from 'react-router'

/*
 * Admin 404 (spec §5.3 `*`). The design system has no red: state is carried by
 * a black pill plus an icon and text, never by colour alone.
 */
export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <section className="rounded-panel bg-white p-[25px] shadow-soft lg:p-[var(--space-40)]">
      <div className="max-w-[760px]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-obsidian px-4 py-2 text-[13px] font-medium text-white">
          <span aria-hidden="true">!</span>
          No such screen
        </p>
        <h2 className="mb-3 text-[28px] font-bold">We could not find that page</h2>
        <p className="mb-6 text-sm text-obsidian/70">
          <code>{pathname}</code> is not an admin route.
        </p>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-button bg-primary px-6 text-sm font-medium text-obsidian transition-shadow duration-[350ms] ease-[var(--ease-standard)] hover:shadow-glow-md"
        >
          Back to the dashboard
        </Link>
      </div>
    </section>
  )
}
