"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion"
import { Menu, X, FileDown } from "lucide-react"
import ThemeToggle from "./ThemeToggle"
import { siteConfig } from "@/content/site"

const links = [
  { label: "About", href: "#about", index: "01" },
  { label: "Experience", href: "#experience", index: "02" },
  { label: "Projects", href: "#projects", index: "03" },
  { label: "Skills", href: "#skills", index: "04" },
  { label: "Contact", href: "#contact", index: "05" },
]

const Nav = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClose = () => setMenuOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b-2 border-border bg-background/90 backdrop-blur-md"
          : "border-b-2 border-transparent"
      }`}
    >
      {/* Reading progress ribbon */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1 origin-left bg-accent"
        style={{ scaleX: prefersReducedMotion ? scrollYProgress : progress }}
        aria-hidden="true"
      />

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label={`${siteConfig.name} — back to top`}
          className="press inline-flex -rotate-3 items-center border-2 border-border bg-accent px-2.5 py-1 font-display text-lg font-extrabold tracking-tight text-accent-foreground shadow-hard-sm"
        >
          JR
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group px-3 py-2 font-mono text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:text-accent"
            >
              <span className="mr-1 text-[10px] text-accent">{link.index}</span>
              <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-accent">
                {link.label}
              </span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press hidden cursor-pointer items-center gap-2 border-2 border-border bg-sun px-4 py-2 font-mono text-sm font-bold uppercase text-ink shadow-hard-sm sm:inline-flex dark:text-paper"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Resume
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="press inline-flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-border bg-card text-foreground shadow-hard-sm md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t-2 border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleClose}
                className="flex items-baseline gap-3 border-2 border-transparent px-3 py-3 font-display text-2xl font-extrabold uppercase text-foreground transition-colors hover:border-border hover:bg-card"
              >
                <span className="font-mono text-xs font-bold text-accent">
                  {link.index}
                </span>
                {link.label}
              </a>
            ))}
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="press mt-3 inline-flex items-center justify-center gap-2 border-2 border-border bg-sun px-3 py-3 font-mono text-base font-bold uppercase text-ink shadow-hard dark:text-paper"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Nav
