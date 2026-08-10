"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

// Calls the AWS backend (API Gateway -> Lambda -> DynamoDB) that tracks
// total site visits. See infra/sam/ for the stack that provisions it.
// Renders nothing if the endpoint isn't configured or the request fails,
// so a missing/misconfigured backend never breaks the page.
const API_URL = process.env.NEXT_PUBLIC_VISITOR_API_URL

// The Lambda increments on every call, so only hit it once per tab session
// (reloads within the session just replay the cached count) rather than
// bumping the total on every page refresh.
const SESSION_CACHE_KEY = "visitorCount"

const VisitorCounter = () => {
  const [visits, setVisits] = useState<number | null>(null)

  useEffect(() => {
    if (!API_URL) return

    const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (cached) {
      setVisits(Number(cached))
      return
    }

    let cancelled = false
    fetch(API_URL, { method: "POST" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { visits?: number }) => {
        if (!cancelled && typeof data.visits === "number") {
          setVisits(data.visits)
          sessionStorage.setItem(SESSION_CACHE_KEY, String(data.visits))
        }
      })
      .catch(() => {
        // Silently ignore — the counter is a nice-to-have, not core content.
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!API_URL || visits === null) return null

  return (
    <span className="inline-flex items-center gap-1.5 border-2 border-border bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground">
      <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      {visits.toLocaleString()} visitors
    </span>
  )
}

export default VisitorCounter
