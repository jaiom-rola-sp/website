// Curated project showcase. Reorder, add, or remove entries freely.
// If `repo` is set, live GitHub stats (stars, language, last-updated) are
// fetched at build time and merged into the card. See lib/github.ts.

export type Project = {
  title: string
  description: string
  // Longer impact/outcome line shown on the card.
  impact?: string
  // Award/recognition shown as a sticker on the card (e.g. hackathon win).
  award?: string
  tech: string[]
  // GitHub repo slug under the configured username (enables live stats).
  repo?: string
  // Live/demo URL (deployment, Devpost, etc.).
  liveUrl?: string
  // Optional label for the live link button (defaults to "Live").
  liveLabel?: string
  // Feature the most important projects near the top.
  featured?: boolean
}

export const projects: Project[] = [
  {
    title: "Vocalyze",
    description:
      "Gamified public-speaking platform with level-gated practice paths and live debate rooms, powered by AI voice analysis.",
    impact:
      "Won HackAI. Level-mastery progression, single-room club lobbies with random debate topics, and ElevenLabs + Gemini feedback loops.",
    award: "HackAI Winner",
    tech: ["React Native", "ElevenLabs", "Gemini", "JavaScript", "Swift"],
    repo: "Vocalyze-HackAI",
    liveUrl: "https://devpost.com/software/temp-project-cu4oln",
    liveLabel: "Devpost",
    featured: true,
  },
  {
    title: "Connection",
    description:
      "Publicly hosted, end-to-end agentic AI distributed system that helps first responders monitor and repair networks, simulating 100+ nodes with AWS IoT TwinMaker to create, detect, and fix outages in real time.",
    impact:
      "Won the AWS Hackathon. Stored and retrieved 100+ technicians' data through RDS and Lambda WebSockets; used Amazon Lex V2 and Bedrock for agentic network monitoring that calls Lambda scripts for ticketing and notifications via Amazon SNS.",
    award: "AWS Hackathon Winner",
    tech: [
      "AWS Lambda",
      "Amazon RDS",
      "Amazon S3",
      "Amazon Bedrock",
      "Amazon Lex V2",
      "Amazon SNS",
    ],
    repo: "firtconnect",
    featured: true,
  },
  {
    title: "GS Mutual Fund Calculator",
    description:
      "Mutual fund projection engine built for the Goldman Sachs Engineering Leadership Series challenge, using Monte Carlo simulations and CAPM modeling.",
    impact:
      "Placed 3rd. Halved projection error (14.2% → 7.1%) against 5-year historical backtests; Python backend validated at 3,247 peak requests/min with Locust.",
    award: "GS ELS 3rd Place",
    tech: ["Python", "FastAPI", "Angular", "Locust"],
    repo: "Goldman-Sachs-ELS-Challenge",
    featured: true,
  },
  {
    title: "LegalWhiz",
    description:
      "AI-powered SaaS that helps founders generate legal documents like NDAs and privacy policies in seconds.",
    impact:
      "Full auth, billing-ready data layer, and OpenAI document generation with a clean, secure UX.",
    tech: ["Next.js 14", "TypeScript", "Clerk", "Supabase", "OpenAI"],
    repo: "legalwhiz",
    liveUrl: "https://legalwhiz.vercel.app",
    featured: true,
  },
  {
    title: "DentalPro",
    description:
      "AI voice receptionist for dental practices — a conversational agent that handles patient calls and scheduling around the clock.",
    tech: ["React", "TypeScript", "Vite", "Tailwind"],
    repo: "Dental-pro",
    liveUrl: "https://dental-pro-opal.vercel.app",
  },
  {
    title: "Adjacent",
    description:
      "AI-agent project management platform that decomposes goals into tasks on a live board using a 3-agent NVIDIA Nemotron pipeline.",
    impact:
      "Server-side orchestration with a re-prompt retry loop and JSON validation for reliable structured LLM output. Built at HackUTD.",
    tech: ["NVIDIA Nemotron", "Next.js", "TypeScript", "Supabase", "Tailwind"],
    repo: "adjacent-hackutd",
    liveUrl: "https://devpost.com/software/adjacent-3inhew",
    liveLabel: "Devpost",
    featured: true,
  },
  {
    title: "MLB & FIFA Prediction Engine",
    description:
      "Sports prediction models that convert public stats APIs into live win probabilities for baseball and football.",
    impact:
      "Live-game ML model cut prediction error 18% vs. static odds; backtesting held a ~65% win rate across a 500-game sample.",
    tech: ["Go", "SQLite", "Next.js", "TypeScript", "MLB Stats API"],
    repo: "fifia_and_mlb",
    featured: true,
  },
  {
    title: "Checkmate",
    description:
      "Browser extension that fact-checks articles as you read them. Built at HackUTA.",
    tech: ["JavaScript", "Browser Extension"],
    repo: "Checkmate-HackUTA",
    liveUrl: "https://devpost.com/software/checkmate-rmb6zt",
    liveLabel: "Devpost",
  },
]
