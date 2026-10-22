import { Sparkles } from 'lucide-react'

/*
 * Phase 2 placeholder. Every screen in the spec §5.3 table is routed and has a
 * navigation entry already; the bodies are built in Phase 9. Naming the owning
 * phase here (rather than inventing fake data) keeps the scaffold honest and
 * makes the remaining work auditable.
 */
export default function Placeholder({
  title,
  phase,
  description,
}: {
  title: string
  phase: string
  description: string
}) {
  return (
    <section className="rounded-panel bg-white p-[25px] shadow-soft lg:p-[var(--space-40)]">
      <div className="max-w-[760px]">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-obsidian/70">
          <span className="inline-block h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
          {phase}
        </p>
        <h2 className="mb-3 text-[28px] font-bold">{title}</h2>
        <p className="mb-6 text-sm text-obsidian/70">{description}</p>
        <button
          type="button"
          disabled
          className="flex h-11 cursor-not-allowed items-center gap-2 rounded-button bg-fog px-6 text-sm font-medium text-obsidian/50"
        >
          <Sparkles size={18} strokeWidth={1.5} />
          Not built yet
        </button>
      </div>
    </section>
  )
}
