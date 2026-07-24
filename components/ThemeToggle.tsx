"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

// Theme state lives on <html class="dark"> (set pre-hydration by the inline
// script in layout.tsx). Subscribe to class changes so the icon stays in sync
// without setState-in-effect.
const subscribe = (callback: () => void) => {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

const getSnapshot = () => document.documentElement.classList.contains("dark")
const getServerSnapshot = () => false

const ThemeToggle = () => {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const handleToggle = () => {
    const next = !isDark
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {}
  }

  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className="press inline-flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-border bg-card text-foreground shadow-hard-sm"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle
