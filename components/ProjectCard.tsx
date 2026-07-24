import { ArrowUpRight, Star, Trophy } from "lucide-react"
import { GitHubIcon } from "./BrandIcons"
import {
  type EnrichedProject,
  formatRelativeDate,
  repoUrl,
} from "@/lib/github"

type ProjectCardProps = {
  project: EnrichedProject
  index: number
}

const stickerColors = ["bg-sun", "bg-lilac", "bg-mint"]

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const github = project.github
  const language = github?.language
  const updated = formatRelativeDate(github?.updatedAt ?? null)
  const repoHref = project.repo ? repoUrl(project.repo) : undefined
  const sticker = stickerColors[index % stickerColors.length]

  return (
    <article
      className={`group relative flex h-full flex-col border-2 border-border bg-card p-6 shadow-hard transition-transform duration-300 sm:p-7 ${
        index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
      } hover:shadow-hard-lg`}
    >
      {/* Index sticker */}
      <span
        className={`absolute -left-3 -top-4 border-2 border-border px-2.5 py-1 font-display text-sm font-extrabold text-ink shadow-hard-sm dark:text-paper ${sticker} ${
          index % 2 === 0 ? "-rotate-6" : "rotate-6"
        }`}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {project.award && (
        <span className="absolute -top-4 right-4 inline-flex rotate-2 items-center gap-1.5 border-2 border-border bg-sun px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-ink shadow-hard-sm dark:text-paper">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          {project.award}
        </span>
      )}

      <div className="flex items-start justify-between gap-3 pt-1">
        <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
          {project.title}
        </h3>
        {github && (
          <span className="inline-flex shrink-0 items-center gap-1 border-2 border-border bg-background px-2 py-0.5 font-mono text-xs font-bold text-foreground">
            <Star className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {github.stars}
          </span>
        )}
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      {project.impact && (
        <p className="mt-3 border-l-4 border-accent pl-3 text-sm leading-relaxed text-foreground/85">
          {project.impact}
        </p>
      )}

      <ul className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((tech, i) => (
          <li
            key={tech}
            className={`border-2 border-border bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground ${
              i % 3 === 0 ? "-rotate-1" : i % 3 === 2 ? "rotate-1" : ""
            }`}
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {(language || updated) && (
          <div className="mb-4 flex items-center gap-4 font-mono text-xs text-muted-foreground">
            {language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 border border-border bg-accent"
                  aria-hidden="true"
                />
                {language}
              </span>
            )}
            {updated && <span>Updated {updated}</span>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex cursor-pointer items-center gap-1.5 border-2 border-border bg-accent px-4 py-2 font-mono text-sm font-bold uppercase text-accent-foreground shadow-hard-sm"
            >
              {project.liveLabel ?? "Live"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {repoHref && (
            <a
              href={repoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex cursor-pointer items-center gap-1.5 border-2 border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase text-foreground shadow-hard-sm"
            >
              <GitHubIcon className="h-4 w-4" />
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
