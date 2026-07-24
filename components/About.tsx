import { GraduationCap } from "lucide-react"
import Section from "./Section"
import Reveal from "./Reveal"
import { about, education } from "@/content/site"

const About = () => {
  return (
    <Section id="about" index="01" eyebrow="About" title="Who's this guy?">
      <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
        <Reveal className="lg:col-span-3" delay={0.05}>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {about.paragraphs.map((paragraph, i) => (
              <p key={paragraph}>
                {i === 0 ? (
                  <span className="squiggle font-bold text-foreground">
                    {paragraph.split(".")[0]}.
                  </span>
                ) : null}
                {i === 0 ? paragraph.slice(paragraph.indexOf(".") + 1) : paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.1}>
          <div className="rotate-1 border-2 border-border bg-card p-6 shadow-hard-lg transition-transform duration-300 hover:rotate-0">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 -rotate-3 items-center justify-center border-2 border-border bg-sun text-ink shadow-hard-sm dark:text-paper">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold text-foreground">
                  {education.school}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{education.degree}</p>
                <p className="mt-1 font-mono text-sm font-bold text-accent">
                  {education.detail} · {education.graduation}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t-2 border-border pt-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Relevant coursework
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {education.coursework.map((course, i) => (
                  <li
                    key={course}
                    className={`border-2 border-border bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground ${
                      i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : ""
                    }`}
                  >
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

export default About
