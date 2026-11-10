import Possession from "@/components/possession/Possession"
import StoryContent from "@/components/possession/StoryContent"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#about"
        className="skip-link"
      >
        Skip to content
      </a>
      <Possession>
        <StoryContent projects={projects} />
      </Possession>
    </>
  )
}
