# Jaiom Rola — Personal Brand Site

A fast, recruiter-facing developer portfolio built with Next.js, TypeScript, and Tailwind CSS. It showcases experience, a curated project list enriched with live GitHub stats, and a downloadable resume. Design direction follows the `ui-ux-pro-max` "Motion-Driven" system (monochrome + blue accent, full light/dark mode).

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (CSS-based `@theme` tokens, class-based dark mode)
- **Framer Motion** for scroll/entrance animations (respects `prefers-reduced-motion`)
- **lucide-react** for icons

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
```

## Editing Your Content

All content lives in two files — no need to touch components:

- **`content/site.ts`** — name, role, tagline, bio, education, experience, skills, and social links. This is the single source of truth. Contact info is here too (phone is intentionally omitted from the public site for privacy; add it if you want).
- **`content/projects.ts`** — the curated project showcase. Reorder, add, or remove entries freely.

### Adding a project

Append an entry to the `projects` array in `content/projects.ts`:

```ts
{
  title: "My Project",
  description: "One or two lines on what it does.",
  impact: "Optional outcome/impact line.",
  tech: ["Next.js", "Go"],
  repo: "my-repo",                        // optional: enables live GitHub stats
  liveUrl: "https://example.com",         // optional
  liveLabel: "Live",                      // optional button label
}
```

If `repo` is set, the site fetches live **stars, primary language, and last-updated** from GitHub at build time for the account in `siteConfig.githubUsername` (currently `jaiom-rola-sp`). If the API is unavailable or rate-limited, the card gracefully falls back to the curated data.

### Updating the resume

Replace `public/resume.pdf` with your latest version (keep the filename).

## GitHub Stats & Rate Limits

Unauthenticated GitHub API calls are limited to ~60/hour. Stats are fetched at build time and revalidated once per day (ISR). To raise the limit (recommended for frequent deploys), set a token:

```bash
# .env.local  (and add the same var in your Vercel project settings)
GITHUB_TOKEN=your_personal_access_token   # a read-only, public-repo token is enough
```

## Theming

Design tokens are defined as CSS variables in `app/globals.css` for both light and `.dark` modes, then exposed to Tailwind via `@theme`. Change the accent by editing `--accent` (and its dark variant). Dark mode is class-based with a no-flash init script in `app/layout.tsx` and a toggle in the nav.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js.
3. (Optional) Add `GITHUB_TOKEN` under **Project → Settings → Environment Variables**.
4. Deploy. To use a custom domain, add it under **Settings → Domains**, then update `siteConfig.url` in `content/site.ts`.

## Project Structure

```
app/
  layout.tsx        # fonts, metadata, theme init
  page.tsx          # composes all sections (server component)
  globals.css       # design tokens + base styles
components/          # Nav, Hero, About, ExperienceTimeline, ProjectGrid/Card, Skills, Contact, Footer, Reveal, ThemeToggle, BrandIcons
content/
  site.ts           # profile, experience, skills, links
  projects.ts       # curated projects
lib/
  github.ts         # build-time GitHub stats + fallback
public/
  resume.pdf        # downloadable resume
```
