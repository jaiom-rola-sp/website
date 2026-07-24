import Section from "./Section"
import Reveal from "./Reveal"
import { skills } from "@/content/site"

const headerColors = ["bg-accent", "bg-sun", "bg-lilac", "bg-mint"]

const Skills = () => {
  return (
    <Section id="skills" index="04" eyebrow="Skills" title="My toolbox">
      <div className="grid gap-8 sm:grid-cols-2">
        {skills.map((group, index) => (
          <Reveal
            key={group.category}
            delay={Math.min(index * 0.05, 0.2)}
            className="h-full"
          >
            <div className="h-full border-2 border-border bg-card shadow-hard">
              <h3
                className={`border-b-2 border-border px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink dark:text-paper ${
                  headerColors[index % headerColors.length]
                } ${index === 0 ? "text-accent-foreground dark:text-accent-foreground" : ""}`}
              >
                {group.category}
              </h3>
              <ul className="flex flex-wrap gap-2.5 p-5">
                {group.items.map((item, i) => (
                  <li
                    key={item}
                    className={`cursor-default border-2 border-border bg-background px-3 py-1.5 font-mono text-sm font-bold text-foreground transition-transform duration-150 hover:-translate-y-0.5 hover:bg-sun hover:text-ink dark:hover:text-paper ${
                      i % 4 === 0 ? "-rotate-1" : i % 4 === 2 ? "rotate-1" : ""
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export default Skills
