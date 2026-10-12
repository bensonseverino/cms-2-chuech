import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { NAV, titleForPath } from '../nav'

/*
 * Admin shell (spec §5.1). Black sidebar, 264px, `primary` fill on the active
 * item with `obsidian` text; transparent 72px top bar over `fog`. Below 1024px
 * the sidebar becomes a top bar with a glass drawer — the same nav, one markup
 * tree, so the two never drift.
 *
 * Scope note: this is the Phase 2 shell. Screen bodies, auth state, toasts and
 * the unsaved-changes bar arrive in Phase 9; the accessibility affordances that
 * belong to the shell (skip link, Esc-to-close, focus return, aria-current) are
 * here now because they are structural.
 */
export default function AdminShell() {
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close the drawer on navigation, and on Esc (spec §5.1).
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const title = titleForPath(pathname)

  return (
    <div className="min-h-svh bg-fog font-sans text-obsidian">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-[25px] focus:top-[25px] focus:z-50 focus:rounded-button focus:bg-obsidian focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* Sidebar — desktop only. */}
      <nav
        aria-label="Admin"
        className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col bg-black px-[25px] py-[25px] text-white lg:flex"
      >
        <SidebarContent pathname={pathname} />
      </nav>

      {/* Mobile top bar + drawer. */}
      <div className="sticky top-0 z-30 flex h-[var(--topbar-height)] items-center gap-4 bg-fog px-[25px] lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          className="flex h-11 w-11 items-center justify-center rounded-button text-obsidian transition-colors duration-[350ms] ease-[var(--ease-standard)] hover:bg-white/60"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>
        <h1 className="truncate text-[28px] font-bold">{title}</h1>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <nav
            aria-label="Admin"
            className="absolute inset-y-0 left-0 flex w-[var(--sidebar-width)] flex-col bg-black/95 px-[25px] py-[25px] text-white backdrop-blur"
          >
            <div className="mb-[25px] flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false)
                  menuButtonRef.current?.focus()
                }}
                aria-label="Close navigation"
                className="flex h-11 w-11 items-center justify-center rounded-button transition-colors duration-[350ms] ease-[var(--ease-standard)] hover:bg-white/10"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <SidebarNav pathname={pathname} />
          </nav>
        </div>
      )}

      <div className="lg:pl-[var(--sidebar-width)]">
        {/* Top bar — desktop. Transparent over fog. */}
        <div className="hidden h-[var(--topbar-height)] items-center px-[var(--space-40)] lg:flex">
          <h1 className="text-[33px] font-bold">{title}</h1>
        </div>

        <main
          id="admin-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[var(--content-max)] px-[25px] pb-[var(--space-40)] pt-[25px] focus:outline-none lg:px-[var(--space-40)] lg:pt-0"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="mb-[25px]">
        <Wordmark />
      </div>
      <SidebarNav pathname={pathname} />
    </>
  )
}

function Wordmark() {
  return (
    <span className="text-[18px] font-bold tracking-[0.18em] text-white">MARINO</span>
  )
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-1 flex-col gap-[25px] overflow-y-auto">
      {NAV.map((section, index) => (
        <div key={section.heading ?? `section-${index}`}>
          {section.heading && (
            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
              {section.heading}
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {section.items.map((item) => {
              const isActive = item.end
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`)
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    aria-current={isActive ? 'page' : undefined}
                    className={() =>
                      [
                        'flex h-11 items-center gap-3 rounded-button px-4 text-sm font-medium',
                        'transition-colors duration-[350ms] ease-[var(--ease-standard)]',
                        isActive ? 'bg-primary text-obsidian' : 'text-white hover:bg-white/10',
                      ].join(' ')
                    }
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
