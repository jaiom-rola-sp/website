import { ArrowUpRight, FileDown, Mail } from "lucide-react"
import { GitHubIcon, LinkedinIcon } from "./BrandIcons"
import Reveal from "./Reveal"
import { siteConfig } from "@/content/site"

const iconFor = (label: string) => {
  if (label === "GitHub") return GitHubIcon
  if (label === "LinkedIn") return LinkedinIcon
  return Mail
}

// Inverted "poster" section — ink background, paper text, giant CTA.
const Contact = () => {
  return (
    <section id="contact" className="border-y-2 border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center border-2 border-background bg-accent px-2.5 py-1 font-mono text-xs font-bold text-accent-foreground">
              05
            </span>
            <p className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-accent">
              Contact
            </p>
          </div>

          <h2 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            Let&apos;s build
            <br />
            <span className="text-accent">something.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed opacity-80">
            I&apos;m open to internships and new-grad software engineering roles.
            The fastest way to reach me is email — I&apos;ll get back to you quickly.
          </p>

          <a
            href={`mailto:${siteConfig.email}`}
            className="group mt-10 inline-flex max-w-full cursor-pointer items-center gap-3 font-display text-2xl font-extrabold underline decoration-accent decoration-4 underline-offset-8 transition-colors hover:text-accent sm:text-4xl"
          >
            <span className="truncate">{siteConfig.email}</span>
            <ArrowUpRight
              className="h-7 w-7 shrink-0 text-accent transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-9 sm:w-9"
              aria-hidden="true"
            />
          </a>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 border-2 border-background bg-background px-5 py-3 font-mono text-sm font-bold uppercase text-foreground transition-transform duration-150 hover:-translate-y-0.5"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Download Resume
            </a>
            {siteConfig.socials.map((social) => {
              const Icon = iconFor(social.label)
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  className="inline-flex h-12 w-12 cursor-pointer items-center justify-center border-2 border-background text-background transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Contact
