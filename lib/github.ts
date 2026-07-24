import { siteConfig } from "@/content/site"
import { projects, type Project } from "@/content/projects"

export type GitHubStats = {
  stars: number
  forks: number
  language: string | null
  updatedAt: string | null
  htmlUrl: string
}

export type EnrichedProject = Project & {
  github?: GitHubStats
}

type GitHubRepoResponse = {
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  html_url: string
}

// Revalidate GitHub stats once per day (ISR). Falls back to curated content
// if the API is unavailable or rate-limited so the build never breaks.
const REVALIDATE_SECONDS = 60 * 60 * 24

const fetchRepoStats = async (repo: string): Promise<GitHubStats | null> => {
  const url = `https://api.github.com/repos/${siteConfig.githubUsername}/${repo}`
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  // Optional token raises the unauthenticated rate limit (60/hr).
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null

    const data = (await res.json()) as GitHubRepoResponse
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? null,
      updatedAt: data.updated_at ?? null,
      htmlUrl: data.html_url,
    }
  } catch {
    return null
  }
}

// Fetch sequentially: GitHub throttles concurrent unauthenticated requests,
// so serial requests are far more reliable at build time. Any failure falls
// back to the curated card data.
export const getEnrichedProjects = async (): Promise<EnrichedProject[]> => {
  const enriched: EnrichedProject[] = []
  for (const project of projects) {
    if (!project.repo) {
      enriched.push(project)
      continue
    }
    const github = await fetchRepoStats(project.repo)
    enriched.push(github ? { ...project, github } : project)
  }
  return enriched
}

export const repoUrl = (repo: string): string =>
  `https://github.com/${siteConfig.githubUsername}/${repo}`

export const formatRelativeDate = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}
