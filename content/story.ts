import {
  about,
  education,
  experience,
  siteConfig,
  skills,
} from "./site"
import { projects } from "./projects"

// The narrative lives here; resume facts remain in site.ts and projects.ts.
// Work history is split in two scroll beats; every role is shown in full.
const splitAt = Math.ceil(experience.length / 2)
export const workRecent = experience.slice(0, splitAt)
export const workEarlier = experience.slice(splitAt)
export const storyAbout = about.paragraphs

export const storyEducation = education
export const storySkills = skills

// Recognition leads, followed by the editor's featured order. New projects
// join automatically; the animation never needs to know how many exist.
export const storyProjects = projects
  .map((project, index) => ({ project, index }))
  .sort(
    (a, b) =>
      Number(Boolean(b.project.award)) - Number(Boolean(a.project.award)) ||
      Number(Boolean(b.project.featured)) - Number(Boolean(a.project.featured)) ||
      a.index - b.index,
  )
  .map(({ project }) => project)

export const storyCopy = {
  title: "The Possession",
  kicker: "One possession. Every part of the journey.",
  heroLineTop: "BUILT FOR",
  heroLineBottom: "THE NEXT PLAY.",
  intro: siteConfig.tagline,
  scrollCue: "Scroll to tip off",
  finaleTitle: "LET’S WORK\nTOGETHER.",
  finaleDescription:
    "Have a problem worth solving or a product worth building? Email me.",
  contactLabel: "Get in touch",
  replayLabel: "Run it back",
  boxScoreTitle: "The final box score",
  attendanceLabel: "Attendance",
  shotChartHint: "Pick a shot. See what went in.",
  skillsTitle: "The stat line",
  madeShotLabel: "Made three · Award winner",
  layupLabel: "Layup · Project",
  bucket: "BUCKET.",
} as const

export type StoryChapter = {
  id: string
  number: string
  label: string
  eyebrow: string
  title: string
  description: string
  quarter: string
  clock: string
  points: number
}

// Quarter, clock, and points are the illustrative broadcast score, rather
// than resume statistics. All seven beats share one reversible possession.
export const storyChapters: readonly StoryChapter[] = [
  {
    id: "tip-off",
    number: "00",
    label: "Tip-off",
    eyebrow: "00 / HELLO",
    title: "I build things that ship.",
    description: siteConfig.tagline,
    quarter: "Q1",
    clock: "12:00",
    points: 0,
  },
  {
    id: "about",
    number: "01",
    label: "About me",
    eyebrow: "01 / ABOUT ME",
    title: "A little about me.",
    description: about.paragraphs[0],
    quarter: "Q1",
    clock: "09:42",
    points: 2,
  },
  {
    id: "work",
    number: "02",
    label: "Work history",
    eyebrow: "02 / WORK HISTORY",
    title: "Where I’ve worked.",
    description: "Every role, with what I actually shipped.",
    quarter: "Q2",
    clock: "08:24",
    points: 6,
  },
  {
    id: "work-earlier",
    number: "03",
    label: "Earlier roles",
    eyebrow: "03 / EARLIER ROLES",
    title: "Where it started.",
    description: "The internships that got me here.",
    quarter: "Q2",
    clock: "02:18",
    points: 9,
  },
  {
    id: "projects",
    number: "04",
    label: "Projects",
    eyebrow: "04 / PROJECTS",
    title: "Things I’ve built.",
    description:
      "Swipe through what each project is and what it does. Every one links to its code.",
    quarter: "Q3",
    clock: "06:35",
    points: 15,
  },
  {
    id: "toolkit",
    number: "05",
    label: "Toolkit",
    eyebrow: "05 / TOOLKIT",
    title: "What I work with.",
    description: "The languages, frameworks, and infrastructure I use day to day.",
    quarter: "Q4",
    clock: "00:24",
    points: 21,
  },
  {
    id: "the-dunk",
    number: "06",
    label: "Contact",
    eyebrow: "06 / CONTACT",
    title: "Let’s work together.",
    description: storyCopy.finaleDescription,
    quarter: "Q4",
    clock: "00:00",
    points: 23,
  },
] as const

const startYears = experience.map((item) => Number(item.start.match(/\d{4}/)?.[0])).filter(Number.isFinite)
const firstYear = Math.min(...startYears)
const latestYear = Math.max(...startYears)

export const boxScore = [
  { label: "Years building", value: `${latestYear - firstYear}+` },
  {
    label: "Internships",
    value: String(experience.filter((item) => /\bintern\b/i.test(item.role)).length).padStart(2, "0"),
  },
  {
    label: "Hackathon wins",
    value: String(projects.filter((project) => /winner/i.test(project.award ?? "")).length).padStart(2, "0"),
  },
  { label: "Projects", value: String(projects.length).padStart(2, "0") },
] as const
