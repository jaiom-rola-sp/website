import Marquee from "./Marquee"
import VisitorCounter from "./VisitorCounter"
import { siteConfig } from "@/content/site"

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer>
      <Marquee className="border-b-2 border-border bg-sun py-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="flex items-center font-display text-base font-extrabold uppercase tracking-wide text-ink dark:text-paper"
          >
            <span className="px-5">{siteConfig.name}</span>
            <span aria-hidden="true">✦</span>
          </span>
        ))}
      </Marquee>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="font-mono text-sm text-muted-foreground">
          &copy; {year} {siteConfig.name} · Made with Next.js & too much coffee
        </p>
        <div className="flex items-center gap-5">
          <VisitorCounter />
          {siteConfig.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="font-mono text-sm font-bold uppercase text-muted-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
