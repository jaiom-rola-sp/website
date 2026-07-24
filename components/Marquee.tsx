import { type ReactNode } from "react"

type MarqueeProps = {
  children: ReactNode
  className?: string
  // Extra classes for the moving track (e.g. gap, padding).
  trackClassName?: string
}

// Infinite ticker ribbon. Renders the content twice so the -50% keyframe
// loops seamlessly; the duplicate is hidden from assistive tech.
const Marquee = ({ children, className, trackClassName }: MarqueeProps) => {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div
        className={`animate-marquee flex w-max items-center ${trackClassName ?? ""}`}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Marquee
