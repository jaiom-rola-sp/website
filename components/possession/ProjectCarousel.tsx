"use client"

import { useRef } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { GitHubIcon } from "@/components/BrandIcons"
import { siteConfig } from "@/content/site"
import type { EnrichedProject } from "@/lib/github"
import "./project-carousel.css"

function repoHref(project: EnrichedProject) {
  if (project.github?.htmlUrl) return project.github.htmlUrl
  if (!project.repo) return undefined
  const slug = project.repo.includes("/") ? project.repo : `${siteConfig.githubUsername}/${project.repo}`
  return `https://github.com/${slug}`
}

export default function ProjectCarousel({ projects }: { projects: EnrichedProject[] }) {
  const track = useRef<HTMLUListElement>(null)
  // Scroll by one card; snap points do the alignment.
  const move = (dir: 1 | -1) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * (el.firstElementChild as HTMLElement).offsetWidth, behavior: "smooth" })
  }

  return (
    <div className="carousel">
      <div className="carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous project"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => move(1)} aria-label="Next project"><ChevronRight size={18} /></button>
      </div>
      <ul className="carousel-track" ref={track} aria-label="Projects" tabIndex={0}>
        {projects.map((project) => {
          const repo = repoHref(project)
          return (
            <li key={project.title} className="carousel-card">
              {project.award && <p className="carousel-award"><Trophy size={13} aria-hidden="true" />{project.award}</p>}
              <h3>{project.title}</h3>
              <p className="carousel-desc">{project.description}</p>
              {project.impact && <p className="carousel-impact">{project.impact}</p>}
              <ul className="carousel-tech" aria-label="Technologies">{project.tech.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className="carousel-links">
                {repo && <a href={repo} target="_blank" rel="noopener noreferrer"><GitHubIcon className="carousel-gh" />GitHub<ArrowUpRight size={14} aria-hidden="true" /></a>}
                {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">{project.liveLabel ?? "Live"}<ArrowUpRight size={14} aria-hidden="true" /></a>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
