"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowRight, Mail, MapPin, Sparkles } from "lucide-react"
import Marquee from "./Marquee"
import { GitHubIcon, LinkedinIcon } from "./BrandIcons"
import { siteConfig } from "@/content/site"

const socialIcon = (label: string) => {
  if (label === "GitHub") return GitHubIcon
  if (label === "LinkedIn") return LinkedinIcon
  return Mail
}

const tickerItems = [
  "Full-Stack",
  "Backend",
  "Go APIs",
  "AI Products",
  "Next.js",
  "Data Pipelines",
  "Python",
  "Docker",
]

// Giant name rendered letter-by-letter so each glyph can pop on hover.
const JumpyWord = ({ word, delayOffset = 0 }: { word: string; delayOffset?: number }) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <span className="flex" aria-hidden="true">
      {word.split("").map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          className="inline-block cursor-default"
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 60, rotate: 6 }
          }
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            delay: delayOffset + i * 0.045,
            type: "spring",
            stiffness: 220,
            damping: 18,
          }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -14,
                  rotate: i % 2 === 0 ? -5 : 5,
                  color: "var(--accent)",
                  transition: { type: "spring", stiffness: 400, damping: 12 },
                }
          }
        >
          {letter}
        </motion.span>
      ))}
    </span>
  )
}

const Hero = () => {
  const prefersReducedMotion = useReducedMotion()

  const fadeUp = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="top" className="relative flex min-h-dvh flex-col overflow-hidden pt-16">
      <div className="paper-grain pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Floating doodle blocks */}
      <div
        className="pointer-events-none absolute right-[8%] top-[18%] hidden h-16 w-16 rotate-12 border-2 border-border bg-lilac shadow-hard lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[18%] top-[52%] hidden h-10 w-10 -rotate-6 border-2 border-border bg-mint shadow-hard-sm lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[12%] top-[38%] hidden lg:block"
        aria-hidden="true"
      >
        <Sparkles className="h-12 w-12 rotate-12 text-accent" strokeWidth={2.5} />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Sticker badges */}
        <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-3">
          <span className="inline-flex -rotate-2 items-center gap-2 border-2 border-border bg-sun px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-ink shadow-hard-sm dark:text-paper">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60 dark:bg-paper" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ink dark:bg-paper" />
            </span>
            Open to work
          </span>
          <span className="inline-flex rotate-1 items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground shadow-hard-sm">
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {siteConfig.location}
          </span>
          <span className="hidden -rotate-1 items-center border-2 border-border bg-lilac px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-ink shadow-hard-sm sm:inline-flex dark:text-paper">
            CS @ UT Dallas
          </span>
        </motion.div>

        {/* Giant interactive name */}
        <h1 className="mt-8 font-display font-extrabold uppercase leading-[0.85] tracking-tight text-foreground">
          <span className="sr-only">{siteConfig.name}</span>
          <span className="block text-[clamp(4rem,16vw,11rem)]">
            <JumpyWord word="JAIOM" />
          </span>
          <span className="block text-[clamp(4rem,16vw,11rem)]">
            <span className="flex items-center gap-6">
              <JumpyWord word="ROLA" delayOffset={0.25} />
              <motion.span
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 12 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 14 }}
                className="hidden shrink-0 border-2 border-border bg-accent px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-accent-foreground shadow-hard sm:inline-block"
                aria-hidden="true"
              >
                Hi!
              </motion.span>
            </span>
          </span>
        </h1>

        <motion.p
          {...fadeUp(0.5)}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          <span className="font-bold text-foreground">{siteConfig.role}.</span>{" "}
          {siteConfig.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.6)} className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="press press-lg group inline-flex cursor-pointer items-center gap-2 border-2 border-border bg-accent px-6 py-3.5 font-mono text-base font-bold uppercase tracking-wide text-accent-foreground shadow-hard-lg"
          >
            See my work
            <ArrowDown
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="press group inline-flex cursor-pointer items-center gap-2 border-2 border-border bg-card px-6 py-3.5 font-mono text-base font-bold uppercase tracking-wide text-foreground shadow-hard"
          >
            Say hello
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
          <div className="flex items-center gap-3">
            {siteConfig.socials.map((social) => {
              const Icon = socialIcon(social.label)
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  className="press inline-flex h-12 w-12 cursor-pointer items-center justify-center border-2 border-border bg-card text-foreground shadow-hard-sm hover:text-accent"
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Ticker ribbon */}
      <motion.div {...fadeUp(0.8)} className="relative">
        <Marquee className="border-y-2 border-border bg-accent py-3">
          {tickerItems.map((item) => (
            <span
              key={item}
              className="flex items-center font-display text-lg font-extrabold uppercase tracking-wide text-accent-foreground"
            >
              <span className="px-6">{item}</span>
              <span aria-hidden="true">✦</span>
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  )
}

export default Hero
