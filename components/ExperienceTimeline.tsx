import Section from "./Section"
import Reveal from "./Reveal"
import { experience } from "@/content/site"

const ExperienceTimeline = () => {
  return (
    <Section id="experience" index="02" eyebrow="Experience" title="Places I've shipped code">
      <ol className="space-y-8">
        {experience.map((job, index) => (
          <Reveal
            as="li"
            key={`${job.company}-${job.start}`}
            delay={Math.min(index * 0.05, 0.2)}
          >
            <article
              className={`group relative border-2 border-border bg-card p-6 shadow-hard transition-transform duration-300 sm:p-8 ${
                index % 2 === 0 ? "hover:-rotate-[0.5deg]" : "hover:rotate-[0.5deg]"
              }`}
            >
              {job.current && (
                <span className="absolute -top-3.5 right-6 rotate-3 border-2 border-border bg-sun px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-ink shadow-hard-sm dark:text-paper">
                  Now
                </span>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-display text-3xl font-extrabold text-muted-foreground/40 sm:text-4xl"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
                      {job.company}
                    </h3>
                    <p className="mt-1 text-base font-bold text-accent">{job.role}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <span className="border-2 border-border bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                    {job.start} — {job.end}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {job.location}
                  </span>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 sm:pl-[4.5rem]">
                {job.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-6 text-[15px] leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.55em] before:h-2 before:w-2 before:border before:border-border before:bg-accent"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}

export default ExperienceTimeline
