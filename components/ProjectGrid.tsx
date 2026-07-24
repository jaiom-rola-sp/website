import Section from "./Section"
import Reveal from "./Reveal"
import ProjectCard from "./ProjectCard"
import { type EnrichedProject } from "@/lib/github"

type ProjectGridProps = {
  projects: EnrichedProject[]
}

const ProjectGrid = ({ projects }: ProjectGridProps) => {
  return (
    <Section id="projects" index="03" eyebrow="Projects" title="Stuff I've built">
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10">
        {projects.map((project, index) => (
          <Reveal
            key={project.title}
            delay={Math.min(index * 0.06, 0.24)}
            className="h-full"
          >
            <ProjectCard project={project} index={index} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export default ProjectGrid
