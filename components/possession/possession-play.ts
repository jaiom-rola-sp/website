// The play is sampled from scroll, never accumulated frame by frame. Rewinding
// restores the ball, possession, footsteps and every player's pose exactly.
export type CourtPoint = readonly [number, number, number]
export type PlayKind = "tip" | "dribble" | "gather" | "pass" | "shot" | "rebound" | "dunk" | "finish"

type Action = {
  start: number
  end: number
  kind: PlayKind
  from: CourtPoint
  to: CourtPoint
  owner?: number
  passer?: number
  receiver?: number
  arc?: number
  bounces?: number
  controls?: readonly [CourtPoint, CourtPoint]
  headings?: readonly [number, number]
}

export const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value))
const ease = (value: number) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10) }
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const heading = (from: CourtPoint, to: CourtPoint) => Math.atan2(to[0] - from[0], to[2] - from[2])
const angleMix = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t
const leftCatch: CourtPoint = [-4.6, 1.12, -1.4]
const leftRelease: CourtPoint = [-4.4, 1.12, -3.7]
const rightCatch: CourtPoint = [4.3, 1.12, -4.4]
const rollCatch: CourtPoint = [-3.6, 1.12, -6.1]
const shotSpot: CourtPoint = [4.8, 1.12, -8.7]
const rim: CourtPoint = [0, 3.15, -12.15]
const underRim: CourtPoint = [0, 1.12, -11.6]
const topOfKey: CourtPoint = [0.2, 1.12, -6.7]
const takeoff: CourtPoint = [0.65, 1.12, -10.8]
const driveControls = [[-1.7, 1.12, -6.4], [2.1, 1.12, -8.3]] as const
const finalControls = [[1.8, 1.12, -7.9], [1.4, 1.12, -9.5]] as const

export const playActions: readonly Action[] = [
  { start: 0, end: 0.07, kind: "tip", from: [0, 3, 0], to: [0, 3.65, 0] },
  { start: 0.07, end: 0.17, kind: "tip", from: [0, 3.65, 0], to: leftCatch, arc: 0.35, passer: 0, receiver: 2 },
  { start: 0.17, end: 0.245, kind: "dribble", from: leftCatch, to: leftRelease, owner: 2, bounces: 3 },
  { start: 0.245, end: 0.265, kind: "gather", from: leftRelease, to: [-4.4, 1.3, -3.7], owner: 2, headings: [heading(leftCatch, leftRelease), heading(leftRelease, rightCatch)] },
  { start: 0.265, end: 0.325, kind: "pass", from: [-4.4, 1.3, -3.7], to: rightCatch, passer: 2, receiver: 3, arc: 1.15 },
  { start: 0.325, end: 0.35, kind: "gather", from: rightCatch, to: [4.3, 1.3, -4.4], owner: 3, headings: [heading(rightCatch, leftRelease), heading(rightCatch, rollCatch)] },
  { start: 0.35, end: 0.41, kind: "pass", from: [4.3, 1.3, -4.4], to: rollCatch, passer: 3, receiver: 4, arc: 1.05 },
  { start: 0.41, end: 0.54, kind: "dribble", from: rollCatch, to: shotSpot, owner: 4, bounces: 4, controls: driveControls },
  { start: 0.54, end: 0.555, kind: "gather", from: shotSpot, to: [4.8, 1.65, -8.7], owner: 4, headings: [heading(driveControls[1], shotSpot), heading(shotSpot, rim)] },
  { start: 0.555, end: 0.645, kind: "shot", from: [4.8, 1.65, -8.7], to: rim, passer: 4, arc: 3.1 },
  { start: 0.645, end: 0.675, kind: "rebound", from: rim, to: underRim, receiver: 4 },
  { start: 0.675, end: 0.69, kind: "gather", from: underRim, to: [0, 1.3, -11.6], owner: 4, headings: [heading(underRim, topOfKey), heading(underRim, topOfKey)] },
  { start: 0.69, end: 0.74, kind: "pass", from: [0, 1.3, -11.6], to: topOfKey, passer: 4, receiver: 0, arc: 0.85 },
  { start: 0.74, end: 0.88, kind: "dribble", from: topOfKey, to: takeoff, owner: 0, bounces: 4, controls: finalControls },
  { start: 0.88, end: 0.91, kind: "gather", from: takeoff, to: [0.65, 2.1, -10.8], owner: 0, headings: [heading(finalControls[1], takeoff), heading(takeoff, rim)] },
  { start: 0.91, end: 0.95, kind: "dunk", from: [0.65, 2.1, -10.8], to: [0, 3.65, -12.15], owner: 0, headings: [heading(takeoff, rim), heading(takeoff, rim)] },
  { start: 0.95, end: 0.99, kind: "finish", from: [0, 3.65, -12.15], to: [0, 0.22, -12.15] },
  { start: 0.99, end: 1, kind: "finish", from: [0, 0.22, -12.15], to: [0, 0.22, -12.15] },
]

function actionAt(p: number) {
  return playActions.find((action) => p < action.end) ?? playActions[playActions.length - 1]
}

function actionBall(action: Action, fraction: number): CourtPoint {
  const t = clamp(fraction), u = ease(t)
  let x = mix(action.from[0], action.to[0], u)
  let z = mix(action.from[2], action.to[2], u)
  if (action.controls) {
    const [a, b] = action.controls, v = 1 - u
    x = v ** 3 * action.from[0] + 3 * v * v * u * a[0] + 3 * v * u * u * b[0] + u ** 3 * action.to[0]
    z = v ** 3 * action.from[2] + 3 * v * v * u * a[2] + 3 * v * u * u * b[2] + u ** 3 * action.to[2]
  }
  const arc = (action.arc ?? 0) * 16 * t * t * (1 - t) * (1 - t)
  const bounce = action.bounces ? Math.sin(Math.PI * action.bounces * t) ** 2 * 0.9 : 0
  return [x, Math.max(0.22, mix(action.from[1], action.to[1], u) + arc - bounce), z]
}

export function sampleBallPosition(progress: number): CourtPoint {
  const p = clamp(progress), action = actionAt(p)
  return actionBall(action, (p - action.start) / (action.end - action.start))
}

function actionHeading(action: Action, fraction: number) {
  const u = ease(fraction)
  if (action.headings) return angleMix(action.headings[0], action.headings[1], u)
  if (action.controls) {
    const [a, b] = action.controls, v = 1 - u
    return Math.atan2(3 * v * v * (a[0] - action.from[0]) + 6 * v * u * (b[0] - a[0]) + 3 * u * u * (action.to[0] - b[0]), 3 * v * v * (a[2] - action.from[2]) + 6 * v * u * (b[2] - a[2]) + 3 * u * u * (action.to[2] - b[2]))
  }
  return heading(action.from, action.to)
}

type RoutePoint = { at: number; x: number; z: number; heading: number }
function ownerPoint(action: Action, fraction: number): RoutePoint {
  const ball = actionBall(action, fraction), yaw = actionHeading(action, fraction)
  const fx = Math.sin(yaw), fz = Math.cos(yaw)
  const previousAction = playActions[playActions.indexOf(action) - 1]
  let forward = 0.3, side = 0
  if (action.kind === "dribble") {
    const settle = ease(fraction * (action.end - action.start) / 0.012)
    forward = mix(0.3, 0.4, settle)
    side = mix(0, 0.34, settle)
  } else if (action.kind === "gather" && previousAction?.kind === "dribble" && previousAction.owner === action.owner) {
    const gather = ease(fraction)
    forward = mix(0.4, 0.3, gather)
    side = mix(0.34, 0, gather)
  }
  return { at: mix(action.start, action.end, fraction), x: ball[0] - fx * forward + fz * side, z: ball[2] - fz * forward - fx * side, heading: yaw }
}

const firstOwned = (index: number) => playActions.find((action) => action.owner === index)!
const lastOwned = (index: number, before = 1) => [...playActions].reverse().find((action) => action.owner === index && action.end <= before)!
const ownedAnchor = (index: number, end = false, before = 1) => ownerPoint(end ? lastOwned(index, before) : firstOwned(index), end ? 1 : 0)
const point = (at: number, x: number, z: number, yaw = Math.PI): RoutePoint => ({ at, x, z, heading: yaw })
const hold = (at: number, anchor: RoutePoint): RoutePoint => ({ ...anchor, at })

const routes: RoutePoint[][] = [
  [point(0, -0.55, 0.5, 2.3), point(0.12, -0.55, 0.5, 2.3), hold(0.59, ownedAnchor(0)), hold(0.69, ownedAnchor(0)), hold(1, ownedAnchor(0, true))],
  [point(0, 0.55, -0.5, -0.8), point(0.11, 0.55, -0.5, -0.8), point(0.3, 5.8, -0.7, -1.4), point(0.6, 5.2, -5.2, -1.8), point(1, 3.1, -9.8, -2.2)],
  [hold(0, ownedAnchor(2)), hold(0.335, ownedAnchor(2, true)), point(0.56, -4.9, -5, 1.5), point(0.82, -4.5, -8.5, 1.1), point(1, -3.5, -10.5, 1.1)],
  [hold(0, ownedAnchor(3)), hold(0.42, ownedAnchor(3, true)), point(0.61, 4.6, -7, -1.5), point(0.88, 5, -9, -1.8), point(1, 3.5, -10.5, -1.8)],
  [hold(0, ownedAnchor(4)), hold(0.595, ownerPoint(lastOwned(4, 0.56), 1)), hold(0.75, ownedAnchor(4, true)), point(0.89, -2, -11.3, 1.2), point(1, -1.2, -11.1, 1.2)],
  [point(0, 2.8, -9, -1.2), point(0.3, 2.8, -7.6, -1.2), point(0.62, -1.4, -9.4, 0.8), point(1, -1, -10.5, 0.8)],
  [point(0, -4.6, 5, 2.8), point(0.31, -4.9, -2.2, 2.5), point(0.65, -3.1, -7.9, 1.1), point(1, -2.1, -10.7, 1.1)],
  [point(0, 4.5, 6, -2.9), point(0.31, 4.8, -1.3, -2.5), point(0.61, 3.7, -6.4, -1.5), point(1, 2.4, -10.4, -1.5)],
]

// Insert the exact release/catch anchors into independent player routes. During
// flight the sender stays behind and the receiver waits at the destination.
for (let index = 0; index < routes.length; index++) {
  for (const action of playActions) if (action.owner === index) routes[index].push(ownerPoint(action, 0), ownerPoint(action, 1))
  routes[index].sort((a, b) => a.at - b.at)
}

function horizontalPlayer(index: number, p: number): RoutePoint {
  const owned = playActions.find((action) => action.owner === index && p >= action.start && p <= action.end)
  if (owned) return ownerPoint(owned, (p - owned.start) / (owned.end - owned.start))
  const route = routes[index]
  let i = 0
  while (i < route.length - 2 && p >= route[i + 1].at) i++
  const a = route[i], b = route[i + 1], u = ease((p - a.at) / Math.max(0.000001, b.at - a.at))
  return { at: p, x: mix(a.x, b.x, u), z: mix(a.z, b.z, u), heading: angleMix(a.heading, b.heading, u) }
}

const distanceSamples = 1024
const distances = routes.map((_, index) => {
  const table = new Float32Array(distanceSamples + 1)
  let previous = horizontalPlayer(index, 0)
  for (let i = 1; i <= distanceSamples; i++) {
    const next = horizontalPlayer(index, i / distanceSamples)
    table[i] = table[i - 1] + Math.hypot(next.x - previous.x, next.z - previous.z)
    previous = next
  }
  return table
})

function distanceAt(index: number, p: number) {
  const position = p * distanceSamples, i = Math.min(distanceSamples - 1, Math.floor(position))
  return mix(distances[index][i], distances[index][i + 1], position - i)
}

export type PlayerFrame = {
  position: CourtPoint
  heading: number
  gait: number
  locomotion: number
  arms: number
  reachTarget: CourtPoint | null
  reachSide: number
  reachBlend: number
  reachBoth: number
  role: "support" | "dribbler" | "passer" | "receiver" | "shooter" | "dunker"
}

function raisedArms(index: number, p: number) {
  const tip = index < 2 ? 1 - ease((p - 0.08) / 0.07) : 0
  const shot = index === 4 ? ease((p - 0.54) / 0.015) * (1 - ease((p - 0.573) / 0.045)) : 0
  const dunk = index === 0 ? ease((p - 0.88) / 0.03) * (1 - ease((p - 0.95) / 0.04)) : 0
  return Math.max(tip, shot, dunk)
}

// Authored camera turns span the gathers instead of depending on a normalized
// near-zero ball velocity. Each turn starts and ends with zero angular velocity.
const tipHeading = heading([0, 0, 0], leftCatch)
const dribbleHeading = heading(leftCatch, leftRelease)
const firstPassHeading = heading(leftRelease, rightCatch)
const secondPassHeading = heading(rightCatch, rollCatch)
const driveHeading = heading(rollCatch, shotSpot)
const shotHeading = heading(shotSpot, rim)
const outletHeading = heading(underRim, topOfKey)
const finalHeading = heading(topOfKey, takeoff)
const cameraHeadings = [
  { at: 0, yaw: Math.PI }, { at: 0.045, yaw: Math.PI },
  { at: 0.125, yaw: tipHeading }, { at: 0.135, yaw: tipHeading },
  { at: 0.215, yaw: dribbleHeading }, { at: 0.225, yaw: dribbleHeading },
  { at: 0.305, yaw: firstPassHeading }, { at: 0.385, yaw: secondPassHeading },
  { at: 0.465, yaw: driveHeading }, { at: 0.515, yaw: driveHeading },
  { at: 0.595, yaw: shotHeading }, { at: 0.625, yaw: shotHeading },
  { at: 0.705, yaw: outletHeading }, { at: 0.805, yaw: finalHeading },
  { at: 0.85, yaw: finalHeading }, { at: 0.93, yaw: Math.PI }, { at: 1, yaw: Math.PI },
]

function cameraDirectionAt(p: number): CourtPoint {
  let i = 0
  while (i < cameraHeadings.length - 2 && p >= cameraHeadings[i + 1].at) i++
  const a = cameraHeadings[i], b = cameraHeadings[i + 1]
  const yaw = angleMix(a.yaw, b.yaw, ease((p - a.at) / (b.at - a.at)))
  return [Math.sin(yaw), 0, Math.cos(yaw)]
}

export function samplePossession(progress: number) {
  const p = clamp(progress), action = actionAt(p), t = clamp((p - action.start) / (action.end - action.start))
  const actionIndex = playActions.indexOf(action), previousAction = playActions[actionIndex - 1]
  const ball = actionBall(action, t)
  const players: PlayerFrame[] = routes.map((_, index) => {
    const pose = horizontalPlayer(index, p), before = horizontalPlayer(index, clamp(p - 0.001)), after = horizontalPlayer(index, clamp(p + 0.001))
    const speed = Math.hypot(after.x - before.x, after.z - before.z) / 0.002
    const tipJump = index < 2 ? Math.sin(Math.PI * clamp((p - 0.015) / 0.1)) ** 2 * 0.4 : 0
    const dunkJump = index === 0 ? Math.sin(Math.PI * clamp((p - 0.89) / 0.1)) ** 2 * 1.7 : 0
    const player: PlayerFrame = { position: [pose.x, tipJump + dunkJump, pose.z], heading: pose.heading, gait: distanceAt(index, p) * 3.8 + index * 0.9, locomotion: ease(speed / 12), arms: raisedArms(index, p), reachTarget: null, reachSide: -1, reachBlend: 0, reachBoth: 1, role: "support" }
    if (action.owner === index) {
      const dribbling = action.kind === "dribble"
      const bounce = dribbling ? Math.sin(Math.PI * (action.bounces ?? 1) * t) ** 2 : 0
      player.role = dribbling ? "dribbler" : action.kind === "dunk" ? "dunker" : "receiver"
      player.reachTarget = dribbling ? [ball[0], 0.82 + 0.3 * (1 - bounce), ball[2]] : ball
      player.reachBlend = 1
      if (dribbling) player.reachBoth = previousAction?.receiver === index ? 1 - ease((p - action.start) / 0.012) : 0
      else if (previousAction?.kind === "dribble" && previousAction.owner === index) player.reachBoth = ease((p - action.start) / 0.008)
    } else if (action.passer === index) {
      player.role = action.kind === "shot" ? "shooter" : "passer"
      player.reachTarget = actionBall(action, Math.min(t, 0.1))
      player.reachBlend = (action.kind === "tip" ? ease(t / 0.15) : 1) * (1 - ease(t / 0.4))
    } else if (action.receiver === index) {
      player.role = "receiver"
      player.reachTarget = action.to
      player.reachBlend = ease((t - 0.42) / 0.58)
    } else if (previousAction?.kind === "dunk" && previousAction.owner === index && p < previousAction.end + 0.04) {
      // Keep the finishing pose after release, then lower the hands smoothly.
      player.role = "dunker"
      player.reachTarget = previousAction.to
      player.reachBlend = 1 - ease((p - previousAction.end) / 0.04)
    }
    return player
  })

  const cameraDirection = cameraDirectionAt(p)
  return { ball, players, kind: action.kind, owner: action.owner ?? null, passer: action.passer ?? null, receiver: action.receiver ?? null, cameraDirection }
}
