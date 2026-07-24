import { type ReactNode } from "react"
import Reveal from "./Reveal"

type SectionProps = {
  id: string
  // Zero-padded section number, e.g. "01".
  index: string
  eyebrow: string
  title: string
  children: ReactNode
  className?: string
}

const Section = ({ id, index, eyebrow, title, children, className }: SectionProps) => {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 ${className ?? ""}`}
    >
      <Reveal>
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center border-2 border-border bg-sun px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-hard-sm dark:text-paper">
              {index}
            </span>
            <p className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-accent">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
            {title}
          </h2>
        </div>
      </Reveal>
      {children}
    </section>
  )
}

export default Section
