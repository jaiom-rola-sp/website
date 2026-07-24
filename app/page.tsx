import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import About from "@/components/About"
import ExperienceTimeline from "@/components/ExperienceTimeline"
import ProjectGrid from "@/components/ProjectGrid"
import Skills from "@/components/Skills"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import { getEnrichedProjects } from "@/lib/github"
import { siteConfig } from "@/content/site"

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.role,
  email: `mailto:${siteConfig.email}`,
  url: siteConfig.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: siteConfig.location,
  },
  sameAs: siteConfig.socials
    .filter((social) => social.href.startsWith("http"))
    .map((social) => social.href),
}

export default async function Home() {
  const projects = await getEnrichedProjects()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <a
        href="#projects"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <ExperienceTimeline />
        <ProjectGrid projects={projects} />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
