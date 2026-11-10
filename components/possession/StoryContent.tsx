import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react"
import { GitHubIcon, LinkedinIcon } from "@/components/BrandIcons"
import { siteConfig, type ExperienceItem } from "@/content/site"
import { boxScore, storyAbout, storyChapters, storyCopy, storyEducation, storySkills, workEarlier, workRecent } from "@/content/story"
import type { EnrichedProject } from "@/lib/github"
import ProjectCarousel from "./ProjectCarousel"

function ExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <article className="experience-play">
      <div className="experience-topline"><span className="company-mark" aria-hidden="true">{item.company.slice(0, 1)}</span><div><h3>{item.company}</h3><p className="experience-dates">{item.start} — {item.end} · {item.location}</p></div>{item.current && <span className="current-tag">NOW</span>}</div>
      <p className="experience-role">{item.role}</p>
      <ul className="experience-list">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
    </article>
  )
}

function ChapterHeading({ index }: { index: number }) {
  const chapter = storyChapters[index]
  return <><p className="chapter-eyebrow"><span />{chapter.eyebrow}</p><h2 id={`${chapter.id}-heading`}>{chapter.title}</h2><p className="chapter-description">{chapter.description}</p></>
}

export default function StoryContent({ projects }: { projects: EnrichedProject[] }) {
  return (
    <>
      <section id="tip-off" className="story-chapter hero-chapter" data-chapter="0" aria-labelledby="hero-name">
        <div className="chapter-inner hero-inner">
          <p className="hero-pretitle"><span className="tiny-cross" aria-hidden="true">+</span> A DEVELOPER’S GAME, PLAY BY PLAY</p>
          <h1 id="hero-name" aria-label={siteConfig.name}>{siteConfig.name.split(" ").map((part, index) => <span key={part} className={index > 0 ? "name-outline" : undefined}>{part}<span className="name-period">.</span></span>)}</h1>
          <div className="hero-bio"><span className="bio-line" aria-hidden="true" /><div><p className="hero-role">{siteConfig.role}</p><p className="hero-description">{storyCopy.intro}</p></div></div>
          <div className="hero-actions"><a href="#about" className="button-primary">About me <ArrowDown size={16} aria-hidden="true" /></a><a href={siteConfig.resumeUrl} target="_blank" rel="noopener noreferrer" className="button-text">Résumé <ArrowUpRight size={16} aria-hidden="true" /></a></div>
          <div className="tipoff-cue"><span className="scroll-track" aria-hidden="true"><span /></span><span>{storyCopy.scrollCue}<small>ONE SCROLL. THE WHOLE STORY.</small></span></div>
        </div>
        <div className="hero-edition" aria-hidden="true"><span>THE POSSESSION</span><span>VOL. 01 — PERSONAL PORTFOLIO</span></div>
      </section>

      <section id="about" className="story-chapter" data-chapter="1" aria-labelledby="about-heading"><div className="chapter-inner"><p className="chapter-eyebrow"><span />{storyChapters[1].eyebrow}</p><h2 id="about-heading">{storyChapters[1].title}</h2>{storyAbout.map((paragraph) => <p key={paragraph} className="chapter-description">{paragraph}</p>)}
        <article className="education-play"><GraduationCap size={24} aria-hidden="true" /><div><h3>{storyEducation.school}</h3><p>{storyEducation.degree}</p><span>{storyEducation.graduation} · {storyEducation.detail}</span></div></article>
      </div></section>

      <section id="work" className="story-chapter" data-chapter="2" aria-labelledby="work-heading"><div className="chapter-inner"><ChapterHeading index={2} />{workRecent.map((item) => <ExperienceCard key={`${item.company}-${item.start}`} item={item} />)}</div></section>

      <section id="work-earlier" className="story-chapter" data-chapter="3" aria-labelledby="work-earlier-heading"><div className="chapter-inner"><ChapterHeading index={3} />{workEarlier.map((item) => <ExperienceCard key={`${item.company}-${item.start}`} item={item} />)}</div></section>

      <section id="projects" className="story-chapter projects-chapter" data-chapter="4" aria-labelledby="projects-heading"><div className="chapter-inner chapter-inner-wide"><div className="projects-heading"><ChapterHeading index={4} /><span className="project-total">{String(projects.length).padStart(2, "0")}<small>PROJECTS</small></span></div><ProjectCarousel projects={projects} /></div></section>

      <section id="toolkit" className="story-chapter" data-chapter="5" aria-labelledby="toolkit-heading"><div className="chapter-inner"><ChapterHeading index={5} />
        <div className="skills-stat-line"><dl>{storySkills.map((group) => <div key={group.category}><dt>{group.category}</dt><dd>{group.items.join(" / ")}</dd></div>)}</dl></div>
      </div></section>

      <section id="the-dunk" className="story-chapter contact-chapter" data-chapter="6" aria-labelledby="the-dunk-heading"><div className="chapter-inner">
        <p className="chapter-eyebrow"><span />{storyChapters[6].eyebrow}</p><h2 id="the-dunk-heading">{storyCopy.finaleTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2><p className="chapter-description">{storyCopy.finaleDescription}</p>
        <a className="contact-email" href={`mailto:${siteConfig.email}`}>{siteConfig.email}<ArrowUpRight size={25} aria-hidden="true" /></a>
        <div className="contact-links">{siteConfig.socials.filter((social) => social.label !== "Email").map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">{social.label === "GitHub" ? <GitHubIcon className="social-icon" /> : <LinkedinIcon className="social-icon" />}{social.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}<a href={siteConfig.resumeUrl} target="_blank" rel="noopener noreferrer"><ArrowDownToLine size={16} aria-hidden="true" />Résumé<ArrowUpRight size={14} aria-hidden="true" /></a></div>
        <div className="final-box-score"><div className="box-score-heading"><span>{storyCopy.boxScoreTitle}</span><ArrowRight size={17} aria-hidden="true" /></div><dl>{boxScore.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl></div>
      </div></section>
    </>
  )
}
