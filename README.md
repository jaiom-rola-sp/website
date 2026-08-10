# Jaiom Rola — Personal Portfolio

A recruiter-facing developer portfolio showcasing experience, projects, and skills — paired with a serverless AWS backend for real-time visitor analytics.

## Tech Stack

**Frontend**
- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion (scroll/entrance animations)

**Cloud / Backend (AWS)**
- AWS Lambda — serverless compute for the visitor-tracking API
- Amazon API Gateway — HTTP API layer
- Amazon DynamoDB — unique-visitor storage with conditional writes
- AWS SAM (Infrastructure-as-Code) — the entire backend stack is defined and deployed via CloudFormation templates

**Integrations & Hosting**
- GitHub REST API — live stars, language, and last-updated stats pulled into the project cards at build time
- Vercel — CI/CD and hosting

## Architecture

```
Next.js (Vercel)
      │
      ▼
Amazon API Gateway
      │
      ▼
   AWS Lambda
      │
      ▼
Amazon DynamoDB
```

The frontend and backend are decoupled: the site is a statically-optimized Next.js app on Vercel, while a small AWS serverless stack (`infra/sam/`) handles unique-visitor tracking independently, provisioned entirely through code (no manual console setup).

## Project Structure

```
app/            # Next.js App Router pages, layout, global styles
components/     # UI sections (Hero, About, Experience, Projects, Skills, Contact, Footer, VisitorCounter, ...)
content/        # Structured site content (profile, experience, skills, projects)
lib/            # Build-time GitHub API integration
infra/sam/      # AWS SAM stack: API Gateway + Lambda + DynamoDB
```
