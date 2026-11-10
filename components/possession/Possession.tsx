"use client"

import { startTransition, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowDown, ArrowUpRight, CircleDot, List, X } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import VisitorCounter from "@/components/VisitorCounter"
import { siteConfig } from "@/content/site"
import { storyChapters, storyCopy } from "@/content/story"

// Keep WebGL out of the server render and the reduced-motion experience.
const Arena3D = dynamic(() => import("./Arena3D"), { ssr: false })

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const playPhases = [0, 0.17, 0.33, 0.48, 0.64, 0.8, 0.93, 1]

function mapToPlay(value: number, offsets: number[]) {
  let index = 0
  while (index < offsets.length - 2 && value > offsets[index + 1]) index++
  const span = offsets[index + 1] - offsets[index]
  const fraction = span > 0 ? Math.max(0, Math.min(1, (value - offsets[index]) / span)) : 0
  return playPhases[index] + (playPhases[index + 1] - playPhases[index]) * fraction
}

export default function Possession({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sceneEnabled, setSceneEnabled] = useState(false)
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reducedMotion = useReducedMotion()
  const enhanced = hydrated && !reducedMotion
  const { scrollYProgress: documentProgress } = useScroll({ target: track, offset: ["start start", "end end"] })
  const chapterOffsets = useMotionValue([0, 0.15, 0.3125, 0.475, 0.6375, 0.8, 0.9625, 1])
  const scrollYProgress = useTransform(() => mapToPlay(documentProgress.get(), chapterOffsets.get()))
  const stageOpacity = useTransform(scrollYProgress, [0, 0.56, 0.64, 0.75, 0.81, 1], [1, 1, 0.16, 0.16, 1, 1])
  const dunkOpacity = useTransform(scrollYProgress, [0.945, 0.97, 0.985, 1], [0, 1, 1, 0])
  const dunkScale = useTransform(scrollYProgress, [0.945, 0.98, 1], [0.8, 1, 1.08])
  const current = storyChapters[active]

  useEffect(() => {
    if (!enhanced || sceneEnabled) return
    const activate = () => startTransition(() => setSceneEnabled(true))
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const
    for (const event of events) window.addEventListener(event, activate, { once: true, passive: true })
    return () => { for (const event of events) window.removeEventListener(event, activate) }
  }, [enhanced, sceneEnabled])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (enhanced) {
      let next = 0
      while (next < storyChapters.length - 1 && value >= playPhases[next + 1] - 0.012) next++
      setActive(next)
    }
  })

  useEffect(() => {
    const root = track.current
    if (!root || !enhanced) return
    const measure = () => {
      const length = root.scrollHeight - window.innerHeight
      if (length <= 0) return
      const offsets = Array.from(root.querySelectorAll<HTMLElement>(".story-chapter")).map((section, index) => {
        const card = section.querySelector<HTMLElement>(".chapter-inner")
        return index === 0 ? 0 : Math.min(0.99, Math.max(0, (section.offsetTop + (card?.offsetTop ?? 0) - window.innerHeight * 0.4) / length))
      })
      chapterOffsets.set([...offsets, 1])
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    window.addEventListener("resize", measure)
    return () => { observer.disconnect(); window.removeEventListener("resize", measure) }
  }, [enhanced, chapterOffsets])

  useEffect(() => {
    const root = track.current
    if (!root) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (enhanced) entry.target.setAttribute("data-visible", String(entry.isIntersecting))
        else if (entry.isIntersecting) {
          const chapter = entry.target.closest<HTMLElement>("[data-chapter]")
          if (chapter) setActive(Number(chapter.dataset.chapter))
        }
      }
    }, { rootMargin: "-8% 0px -8% 0px", threshold: 0 })
    const cards = root.querySelectorAll(".chapter-inner")
    cards.forEach((card) => observer.observe(card))
    return () => {
      observer.disconnect()
      cards.forEach((card) => card.removeAttribute("data-visible"))
    }
  }, [enhanced])

  return (
    <div className="possession" data-current={active} data-enhanced={enhanced}>
      <header className="arena-header">
        <a href="#tip-off" className="arena-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><CircleDot size={23} strokeWidth={1.4} /></span>
          <span>{siteConfig.name}<small>THE POSSESSION / PORTFOLIO</small></span>
        </a>
        <nav className="header-links" aria-label="Main navigation"><a href="#about">About</a><a href="#work">Work</a><a href="#projects">Projects</a></nav>
        <div className="header-actions">
          <ThemeToggle />
          <a href="#the-dunk" className="header-contact">Contact <ArrowUpRight size={15} aria-hidden="true" /></a>
          <button className="chapter-menu-toggle" aria-label={menuOpen ? "Close play-by-play" : "Open play-by-play"} aria-expanded={menuOpen} aria-controls="play-by-play" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </header>

      <main id="main-content">
        <div ref={track} className="possession-track">
          <div className="possession-stage" aria-hidden="true">
            <motion.div className="arena-world" style={enhanced ? { opacity: stageOpacity } : undefined}>
              <div className="arena-poster" />
              {enhanced && sceneEnabled && <Arena3D progress={scrollYProgress} chapter={active} cameraMode="ball" />}
            </motion.div>
            <div className="arena-readability" />
            <div className="camera-readout"><span className="live-dot" />{active === 0 ? "CAM 01 / TIP-OFF" : "CAM 02 / BALL FOLLOW"}<small>SCROLL TO MOVE THE GAME</small></div>
            <motion.div className="bucket-flash" style={enhanced ? { opacity: dunkOpacity, scale: dunkScale } : { opacity: 0 }}>{storyCopy.bucket}</motion.div>
            <span className="arena-side-label">THE GAME IS IN THE DETAILS.</span>
          </div>
          <div className="story-content">{children}</div>
        </div>
      </main>

      <nav id="play-by-play" className={`play-by-play ${menuOpen ? "is-open" : ""}`} aria-label="Play-by-play chapters">
        <span className="play-by-play-label">PLAY BY PLAY</span>
        <ol>{storyChapters.map((chapter, index) => <li key={chapter.id}><a href={`#${chapter.id}`} aria-current={active === index ? "step" : undefined} onClick={() => setMenuOpen(false)}><span className="play-number">{chapter.number}</span><span className="play-name">{chapter.label}</span><span className="play-dot" aria-hidden="true" /></a></li>)}</ol>
        <span className="play-by-play-end">SCROLL TO ADVANCE <ArrowDown size={12} aria-hidden="true" /></span>
      </nav>

      <aside className="arena-scoreboard" aria-label="Illustrative possession scoreboard">
        <div className="scoreboard-caption"><span className="live-dot" /> THE POSSESSION <span className="scoreboard-live">LIVE</span></div>
        <div className="scoreboard-stats"><div className="score-player"><span>JR</span><strong>{String(current.points).padStart(2, "0")}</strong></div><div className="score-period"><span>QUARTER</span><strong>{current.quarter}</strong></div><div className="score-clock"><span>GAME CLOCK</span><strong>{current.clock}</strong></div></div>
        <div className="scoreboard-bottom"><span>{current.number} / 06</span><span>{current.label}</span></div>
      </aside>

      <footer className="arena-footer">
        <a className="footer-brand" href="#tip-off">{siteConfig.name}<span>BUILT FOR THE NEXT PLAY.</span></a>
        <div className="footer-links">{siteConfig.socials.map((social) => <a key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}>{social.label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><div className="arena-attendance"><VisitorCounter /></div><a href="#tip-off">{storyCopy.replayLabel} ↑</a></div>
      </footer>
    </div>
  )
}
