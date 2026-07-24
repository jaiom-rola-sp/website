// Single source of truth for personal/site content.
// Edit this file to update your bio, experience, skills, and links.

export type SocialLink = {
  label: string
  href: string
}

export type ExperienceItem = {
  company: string
  role: string
  location: string
  start: string
  end: string
  current?: boolean
  highlights: string[]
}

export type SkillGroup = {
  category: string
  items: string[]
}

export type Education = {
  school: string
  degree: string
  detail: string
  location: string
  graduation: string
  coursework: string[]
}

export const siteConfig = {
  name: "Jaiom Rola",
  role: "Full-Stack & Backend Software Engineer",
  // Update this once you point a custom domain at the deployment.
  url: "https://jaiomrola.com",
  location: "Austin, TX",
  tagline:
    "Computer Science student at UT Dallas building AI-driven products and high-performance backends.",
  description:
    "Jaiom Rola is a full-stack and backend software engineer studying Computer Science at UT Dallas, with internship experience at SailPoint, Goldman Sachs, and more. Building AI products, Go APIs, and data-driven tools.",
  // Public-facing contact. Phone intentionally omitted for privacy — add if you want.
  email: "jaiomrola@gmail.com",
  resumeUrl: "/resume.pdf",
  githubUsername: "jaiom-rola-sp",
  socials: [
    { label: "GitHub", href: "https://github.com/jaiom-rola-sp" },
    { label: "LinkedIn", href: "https://linkedin.com/in/jaiom-rola-36512a225" },
    { label: "Email", href: "mailto:jaiomrola@gmail.com" },
  ] satisfies SocialLink[],
}

export const about = {
  paragraphs: [
    "I'm a Computer Science major at The University of Texas at Dallas (Class of 2028) with a minor in Finance. I like building things that ship — from AI-powered SaaS products to low-latency Go APIs and data pipelines.",
    "Across internships at SailPoint, Goldman Sachs, Serent Capital, and Ojo Labs, I've worked the full stack: shipping features used by thousands, cutting API latency, automating security workflows, and deploying with Docker, Jenkins, and Azure.",
  ],
}

export const education: Education = {
  school: "The University of Texas at Dallas",
  degree: "B.S. in Computer Science, Minor in Finance",
  detail: "GPA: 3.45",
  location: "Richardson, TX",
  graduation: "May 2028",
  coursework: [
    "Data Structures",
    "Computer Architecture",
    "Unix",
    "Discrete Mathematics",
    "Linear Algebra",
    "Statistics",
    "Entrepreneurship",
  ],
}

export const experience: ExperienceItem[] = [
  {
    company: "SailPoint",
    role: "Full Stack Software Engineering Intern",
    location: "Austin, TX",
    start: "Jun 2026",
    end: "Present",
    current: true,
    highlights: [
      "Built an AI identity risk scoring simulator evaluating four risk dimensions across 50+ signals using time-decay scoring.",
      "Developed a Go REST API with JWT auth and JSON serialization, cutting response latency from 312ms to 278ms.",
      "Deployed the simulator to dev environments via Docker, nginx, and Jenkins, enabling 40+ engineers to run assessments.",
      "Restructured a Redis token-bucket API throttler, migrating from per-tenant isolation to global, burst-configurable limits.",
    ],
  },
  {
    company: "UTD Nebula Labs (Open Source)",
    role: "Full Stack Software Engineer",
    location: "Richardson, TX",
    start: "May 2024",
    end: "Present",
    current: true,
    highlights: [
      "Integrated Rate My Professor API data into the professor search module, surfacing 8,000+ records with review sentiment.",
      "Cut database query response times from 143ms to 97ms through query result caching and schema denormalization.",
      "Implemented Azure deployment rollbacks and CI/CD workflows, cutting failed deployment recovery time from 18 min to 4 min.",
    ],
  },
  {
    company: "Goldman Sachs",
    role: "Software Engineering Apprentice — Engineering Leadership Series",
    location: "Dallas, TX",
    start: "Dec 2025",
    end: "Apr 2026",
    highlights: [
      "Introduced a Mutual Fund Calculator using FastAPI and Angular with Monte Carlo simulations and CAPM modeling.",
      "Halved projection error (14.2% to 7.1%) by validating the model against 5-year historical backtests.",
      "Developed Python backends handling 3,247 peak requests/min; validated 300 concurrent users via Locust load testing.",
    ],
  },
  {
    company: "Serent Capital",
    role: "Cyber Security Intern",
    location: "Austin, TX",
    start: "May 2024",
    end: "Aug 2024",
    highlights: [
      "Built a Python automation tool using the Datadog API for real-time cybersecurity risk assessments and monitoring.",
      "Reduced incident response time from 47 to 34 minutes via automated anomaly detection alerts.",
      "Presented 20-slide cybersecurity findings to 4 C-suite members, translating technical risks into business impact.",
    ],
  },
  {
    company: "Ojo Labs",
    role: "Full Stack Software Engineering Intern",
    location: "Austin, TX",
    start: "May 2022",
    end: "Aug 2022",
    highlights: [
      "Developed a relationship timeline enabling 14,000+ agents to view interaction history, improving engagement tracking.",
      "Migrated 100% of active users to internal relationship tooling via a scalable MVP, handling 2,100+ peak users.",
      "Implemented API integrations with third-party services using token-based authentication and RESTful endpoints.",
    ],
  },
]

export const skills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["Python", "Go", "SQL", "C++", "Java"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["Next.js", "React", "Node.js", "FastAPI", "Pandas"],
  },
  {
    category: "Cloud & Infrastructure",
    items: ["Azure", "Jenkins", "Docker", "Redis", "nginx"],
  },
  {
    category: "Tools & Platforms",
    items: [
      "Git",
      "Supabase",
      "Firebase",
      "MongoDB",
      "PostgreSQL",
      "SQLite",
      "Unix/Linux",
    ],
  },
]
