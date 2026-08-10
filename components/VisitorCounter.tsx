"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

// Calls the AWS backend (API Gateway -> Lambda -> DynamoDB) that tracks
// unique site visitors. See infra/sam/ for the stack that provisions it.
// Renders nothing if the endpoint isn't configured or the request fails,
// so a missing/misconfigured backend never breaks the page.
const API_URL = process.env.NEXT_PUBLIC_VISITOR_API_URL

// Persisted in localStorage (survives browser restarts, unlike
// sessionStorage) so the same visitor is recognized days/weeks later. The
// Lambda only increments the total the first time it sees a given id.
const VISITOR_ID_KEY = "visitorId"

const getOrCreateVisitorId = () => {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

const VisitorCounter = () => {
  const [visits, setVisits] = useState<number | null>(null)

  useEffect(() => {
    if (!API_URL) return

    let cancelled = false
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId() }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { visits?: number }) => {
        if (!cancelled && typeof data.visits === "number") {
          setVisits(data.visits)
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
