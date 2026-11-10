import * as THREE from "three"
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js"
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js"

export const generatedAssetPaths = {
  player: "/arena/models/player.glb",
  ball: "/arena/models/basketball.glb",
  hoop: "/arena/models/hoop.glb",
  arena: "/arena/models/arena.glb",
  hardwood: "/arena/textures/hardwood.webp",
  panorama: "/arena/textures/arena.webp",
} as const

// Anchors are in metres after normalization and rotation. Model inspection can
// calibrate these values without changing the possession or camera timeline.
export const generatedModelConfig = {
  player: { height: 1.8, yaw: 0 },
  ball: { diameter: 0.44 },
  hoop: {
    width: 2.0,
    heightScale: 1.39,
    rotation: [0, 0, 0] as [number, number, number],
    // Calibrated from the generated orange rim, keeping its base on the floor.
    rimAnchor: [0.022, 0.763, 0.857] as [number, number, number],
  },
}

export type GeneratedAssetName = keyof typeof generatedAssetPaths

export type GeneratedAssetError = {
  asset: GeneratedAssetName
  url: string
  message: string
}

export type GeneratedAssetProgress = {
  asset: GeneratedAssetName
  completed: number
  total: number
  status: "loaded" | "failed"
}

export type GeneratedAssets = {
  player: GLTF | null
  ball: GLTF | null
  hoop: GLTF | null
  arena: GLTF | null
  hardwood: THREE.Texture | null
  panorama: THREE.Texture | null
  errors: GeneratedAssetError[]
  /** Detach clones and dispose their mixers before releasing shared sources. */
  dispose: () => void
}

type LoadGeneratedAssetsOptions = {
  signal?: AbortSignal
  includeArena?: boolean
  paths?: Partial<Record<GeneratedAssetName, string>>
  onProgress?: (progress: GeneratedAssetProgress) => void
}

function abortIfNeeded(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Asset loading was cancelled", "AbortError")
}

/** Source resources are shared by player clones and must be released once. */
function releaseResources(objects: THREE.Object3D[], standaloneTextures: THREE.Texture[]) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>(standaloneTextures)
  const skeletons = new Set<THREE.Skeleton>()
  const images = new Set<ImageBitmap>()

  for (const root of objects) {
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      geometries.add(object.geometry)
      if (object instanceof THREE.SkinnedMesh) skeletons.add(object.skeleton)
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of meshMaterials) {
        materials.add(material)
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value)
        }
      }
    })
  }

  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  skeletons.forEach((skeleton) => skeleton.dispose())
  textures.forEach((texture) => {
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) images.add(texture.image)
    texture.dispose()
  })
  images.forEach((image) => image.close())
}

async function loadModel(url: string, signal?: AbortSignal) {
  abortIfNeeded(signal)
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Model request returned ${response.status}`)
  const data = await response.arrayBuffer()
  abortIfNeeded(signal)
  const resourcePath = new URL(".", new URL(url, window.location.href)).href
  const model = await new GLTFLoader().parseAsync(data, resourcePath)
  if (signal?.aborted) {
    releaseResources(model.scenes, [])
    abortIfNeeded(signal)
  }
  return model
}

async function loadTexture(url: string, signal?: AbortSignal) {
  abortIfNeeded(signal)
  // TextureLoader handles browser image decoding without a canvas copy. Its
  // request may finish after cancellation, so release that late result here.
  const texture = await new THREE.TextureLoader().loadAsync(url)
  if (signal?.aborted) {
    releaseResources([], [texture])
    abortIfNeeded(signal)
  }
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * Independent assets settle independently. Failed assets are null, with their
 * exact URL and cause retained for the owner to choose a visible fallback.
 * There is deliberately no global cache: one scene owns one resource bundle.
 */
export async function loadGeneratedAssets(options: LoadGeneratedAssetsOptions = {}): Promise<GeneratedAssets> {
  const { signal, onProgress, includeArena = false } = options
  const paths = { ...generatedAssetPaths, ...options.paths }
  const errors: GeneratedAssetError[] = []
  const total = includeArena ? 6 : 5
  let completed = 0

  async function attempt<T>(asset: GeneratedAssetName, load: () => Promise<T>): Promise<T | null> {
    let result: T | null = null
    let status: GeneratedAssetProgress["status"] = "loaded"
    try {
      result = await load()
    } catch (error) {
      status = "failed"
      errors.push({ asset, url: paths[asset], message: error instanceof Error ? error.message : String(error) })
    }
    completed++
    onProgress?.({ asset, completed, total, status })
    return result
  }

  const [player, ball, hoop, arena, hardwood, panorama] = await Promise.all([
    attempt("player", () => loadModel(paths.player, signal)),
    attempt("ball", () => loadModel(paths.ball, signal)),
    attempt("hoop", () => loadModel(paths.hoop, signal)),
    includeArena ? attempt("arena", () => loadModel(paths.arena, signal)) : Promise.resolve(null),
    attempt("hardwood", () => loadTexture(paths.hardwood, signal)),
    attempt("panorama", () => loadTexture(paths.panorama, signal)),
  ])

  let disposed = false
  return {
    player, ball, hoop, arena, hardwood, panorama, errors,
    dispose() {
      if (disposed) return
      disposed = true
      const models = [player, ball, hoop, arena].filter((model): model is GLTF => model !== null)
      const textures = [hardwood, panorama].filter((texture): texture is NonNullable<typeof texture> => texture !== null)
      releaseResources(models.flatMap((model) => model.scenes), textures)
    },
  }
}

type NormalizeOptions = {
  height?: number
  width?: number
  centerXZ?: boolean
  ground?: boolean
}

/**
 * Wrap a model to preserve imported node transforms and animation bindings.
 * ground:false centers Y too, which is useful for a ball's rotation origin.
 * When both dimensions are supplied the model fits inside those dimensions.
 */
export function normalizeGLTF(root: THREE.Object3D, {
  height, width, centerXZ = true, ground = true,
}: NormalizeOptions = {}): THREE.Group {
  const group = new THREE.Group()
  const offset = new THREE.Group()
  group.add(offset)
  offset.add(root)
  group.updateWorldMatrix(true, true)
  // SkeletonUtils clones need the SkinnedMesh override to refresh inverse bind
  // transforms before measuring. updateWorldMatrix alone skips that override.
  group.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(root, true)
  if (bounds.isEmpty()) return group

  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  const scales = [
    height && size.y > 0 ? height / size.y : undefined,
    width && size.x > 0 ? width / size.x : undefined,
  ].filter((value): value is number => value !== undefined && Number.isFinite(value) && value > 0)
  if (scales.length) group.scale.setScalar(Math.min(...scales))
  offset.position.set(centerXZ ? -center.x : 0, ground ? -bounds.min.y : -center.y, centerXZ ? -center.z : 0)
  group.updateWorldMatrix(true, true)
  group.updateMatrixWorld(true)
  return group
}

type PlayerPose = {
  progress: number
  /** Radians for an in-place fallback gait; otherwise progress supplies it. */
  gait?: number
  /** 0..1 reach above the head, overlaid on the imported animation. */
  arms?: number
  /** Optional exact clip time in seconds. */
  clipTime?: number
  /** World point one hand should follow (e.g. the dribbled ball). */
  reachTarget?: THREE.Vector3
  /** Local x sign (+1/-1) of the arm that reaches; matches the ball's side. */
  reachSide?: number
  /** 0..1 weight of the reachTarget override. */
  reachBlend?: number
  /** 0..1 involvement of the other hand while reachSide stays fixed. */
  reachBoth?: number
  /** 0..1 movement weight; planted players keep their feet still. */
  locomotion?: number
}

type ClonePlayerOptions = {
  height?: number
  phaseOffset?: number
  clipName?: string
}

export type RiggedPlayer = {
  group: THREE.Group
  model: THREE.Object3D
  mixer: THREE.AnimationMixer
  bones: Map<string, THREE.Bone>
  rigged: boolean
  update: (pose: PlayerPose) => void
  /** Releases per-clone animation/skeleton resources, never shared meshes. */
  dispose: () => void
}

const positiveModulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor
const boneKey = (name: string) => name.replace(/[^a-z]/gi, "").toLowerCase()

function findBone(bones: Map<string, THREE.Bone>, aliases: string[]) {
  for (const [name, bone] of bones) {
    const key = boneKey(name)
    if (aliases.some((alias) => key.endsWith(alias))) return bone
  }
}

function inPlaceClip(clip: THREE.AnimationClip) {
  // The possession owns world locomotion and jumping. Retain limb translations
  // but strip generated armature/hip travel so the model cannot leave the ball.
  const tracks = clip.tracks.filter((track) => {
    const binding = THREE.PropertyBinding.parseTrackName(track.name)
    if (binding.propertyName !== "position") return true
    const name = boneKey(binding.objectIndex || binding.nodeName || "")
    return !/(hips|pelvis|root|armature)$/.test(name)
  })
  return new THREE.AnimationClip(`${clip.name}-in-place`, clip.duration, tracks)
}

/**
 * SkeletonUtils creates independent bones while sharing source meshes/maps.
 * Animation time is derived from scroll, so seeking backward is exact.
 */
export function cloneRiggedPlayer(source: GLTF, {
  height = 1.8, phaseOffset = 0, clipName,
}: ClonePlayerOptions = {}): RiggedPlayer {
  const model = cloneSkeleton(source.scene)
  const group = normalizeGLTF(model, { height })
  const bones = new Map<string, THREE.Bone>()
  const skeletons = new Set<THREE.Skeleton>()
  const rest = new Map<THREE.Bone, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>()
  model.traverse((object) => {
    if (object instanceof THREE.Bone) {
      bones.set(object.name, object)
      rest.set(object, { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() })
    }
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
    if (object instanceof THREE.SkinnedMesh) {
      skeletons.add(object.skeleton)
      // Generated bind-pose bounds need not contain a raised arm or dunk pose.
      object.frustumCulled = false
    }
  })

  const mixer = new THREE.AnimationMixer(model)
  // A rig-only Meshy export contains a one-frame bind-pose clip. Treat it as
  // the rest pose so it cannot suppress the scroll-driven walking animation.
  const motionClips = source.animations.filter((clip) => clip.duration > 0.15)
  const sourceClip = (clipName ? motionClips.find((clip) => clip.name === clipName) : undefined)
    ?? motionClips.find((clip) => /walk|jog|run/i.test(clip.name))
    ?? motionClips[0]
  const clip = sourceClip ? inPlaceClip(sourceClip) : undefined
  if (clip && clip.duration > 0) mixer.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).play()

  const leftArm = findBone(bones, ["leftupperarm", "leftarm", "upperarml", "upperarmleft", "lupperarm", "arml"])
  const rightArm = findBone(bones, ["rightupperarm", "rightarm", "upperarmr", "upperarmright", "rupperarm", "armr"])
  const leftLeg = findBone(bones, ["leftupleg", "leftupperleg", "leftthigh", "thighl", "uplegl", "lthigh"])
  const rightLeg = findBone(bones, ["rightupleg", "rightupperleg", "rightthigh", "thighr", "uplegr", "rthigh"])
  const leftKnee = findBone(bones, ["leftleg", "leftlowerleg", "calfl"])
  const rightKnee = findBone(bones, ["rightleg", "rightlowerleg", "calfr"])
  const inverseParent = new THREE.Quaternion()
  const targetRotation = new THREE.Quaternion()
  const desiredDirection = new THREE.Vector3()
  const localPoint = new THREE.Vector3()
  const shoulderPoint = new THREE.Vector3()
  const elbowPoint = new THREE.Vector3()
  const wristPoint = new THREE.Vector3()
  const targetPoint = new THREE.Vector3()
  const elbowTarget = new THREE.Vector3()
  const targetDirection = new THREE.Vector3()
  const bendDirection = new THREE.Vector3()
  const actorRight = new THREE.Vector3()
  const actorOrigin = new THREE.Vector3()
  const currentDirection = new THREE.Vector3()
  const worldRotation = new THREE.Quaternion()
  const rotationDelta = new THREE.Quaternion()

  group.updateWorldMatrix(true, true)
  const arms = [leftArm, rightArm].flatMap((bone) => {
    const child = bone?.children.find((object) => object instanceof THREE.Bone)
    if (!bone || !child || child.position.lengthSq() === 0) return []
    const hand = child.children.find((object) => object instanceof THREE.Bone)
    bone.getWorldPosition(localPoint)
    group.worldToLocal(localPoint)
    return [{ bone, forearm: child as THREE.Bone, hand: hand as THREE.Bone | undefined, axis: child.position.clone().normalize(), side: Math.sign(localPoint.x) || (bone === leftArm ? 1 : -1) }]
  })

  const pointBone = (bone: THREE.Bone, child: THREE.Bone, desired: THREE.Vector3, weight: number) => {
    bone.getWorldPosition(localPoint)
    child.getWorldPosition(currentDirection)
    currentDirection.sub(localPoint).normalize()
    desiredDirection.subVectors(desired, localPoint).normalize()
    if (currentDirection.lengthSq() < 0.5 || desiredDirection.lengthSq() < 0.5) return
    bone.getWorldQuaternion(worldRotation)
    rotationDelta.setFromUnitVectors(currentDirection, desiredDirection)
    worldRotation.premultiply(rotationDelta)
    bone.parent?.getWorldQuaternion(inverseParent)
    targetRotation.copy(inverseParent).invert().multiply(worldRotation)
    bone.quaternion.slerp(targetRotation, weight)
    bone.updateWorldMatrix(false, true)
  }

  let disposed = false
  return {
    group, model, mixer, bones, rigged: skeletons.size > 0,
    update({ progress, gait = progress * 100 + phaseOffset, arms: reach = 0, clipTime, reachTarget, reachSide = 0, reachBlend = 0, reachBoth = 0, locomotion = 1 }) {
      if (disposed) return
      // Reset bind transforms first: procedural reach must not accumulate, and
      // an imported clip may not key every bone on every frame.
      for (const [bone, bind] of rest) {
        bone.position.copy(bind.position)
        bone.quaternion.copy(bind.quaternion)
        bone.scale.copy(bind.scale)
      }
      if (clip && clip.duration > 0) {
        mixer.setTime(positiveModulo(clipTime ?? progress * 12 + phaseOffset, clip.duration))
      } else {
        const movement = THREE.MathUtils.clamp(locomotion, 0, 1)
        const stride = Math.sin(gait) * 0.34 * movement
        leftLeg?.rotateX(stride)
        rightLeg?.rotateX(-stride)
        leftKnee?.rotateX(Math.max(0, -Math.sin(gait)) * 0.46 * movement)
        rightKnee?.rotateX(Math.max(0, Math.sin(gait)) * 0.46 * movement)
      }

      const blend = THREE.MathUtils.clamp(reach, 0, 1)
      if (blend > 0 || reachBlend > 0 || !clip) {
        group.updateWorldMatrix(true, true)
        group.updateMatrixWorld(true)
        group.getWorldPosition(actorOrigin)
        actorRight.set(1, 0, 0).transformDirection(group.matrixWorld)
        for (const arm of arms) {
          // Infer the limb axis from the imported skeleton rather than assume
          // a particular provider's bone orientation or naming prefix.
          const selected = reachSide === 0 || arm.side === Math.sign(reachSide)
          const armWeight = THREE.MathUtils.clamp(reachBlend, 0, 1) * (selected ? 1 : THREE.MathUtils.clamp(reachBoth, 0, 1))
          const tracking = reachTarget && armWeight > 0
          const y = THREE.MathUtils.lerp(-0.95, 0.98, blend)
          desiredDirection.set(arm.side * THREE.MathUtils.lerp(0.24, 0.22, blend), y, 0.18)
          desiredDirection.transformDirection(group.matrixWorld)
          arm.bone.parent?.getWorldQuaternion(inverseParent)
          inverseParent.invert()
          desiredDirection.applyQuaternion(inverseParent).normalize()
          targetRotation.setFromUnitVectors(arm.axis, desiredDirection)
          arm.bone.quaternion.slerp(targetRotation, clip ? blend : 1)
          arm.bone.updateWorldMatrix(false, true)

          if (tracking && arm.hand) {
            arm.bone.getWorldPosition(shoulderPoint)
            arm.forearm.getWorldPosition(elbowPoint)
            arm.hand.getWorldPosition(wristPoint)
            const upperLength = shoulderPoint.distanceTo(elbowPoint)
            const lowerLength = elbowPoint.distanceTo(wristPoint)
            if (upperLength < 0.001 || lowerLength < 0.001) continue

            targetPoint.copy(reachTarget)
            // The hand releases the bounce instead of chasing the ball onto
            // the floor. Both-hand catches meet opposite sides of the ball.
            targetPoint.y = Math.max(targetPoint.y, actorOrigin.y + 0.62)
            if (reachSide === 0 || reachBoth > 0) targetPoint.addScaledVector(actorRight, arm.side * 0.08 * (reachSide === 0 ? 1 : THREE.MathUtils.clamp(reachBoth, 0, 1)))
            targetDirection.subVectors(targetPoint, shoulderPoint)
            const distance = THREE.MathUtils.clamp(targetDirection.length(), Math.abs(upperLength - lowerLength) + 0.025, (upperLength + lowerLength) * 0.965)
            if (targetDirection.lengthSq() < 0.00001) continue
            targetDirection.normalize()
            targetPoint.copy(shoulderPoint).addScaledVector(targetDirection, distance)

            // Solve an elbow point on a stable body-relative bend plane. The
            // bend stays slightly outward/back, avoiding a locked straight arm
            // or an elbow flip when a pass crosses the shoulder's centerline.
            bendDirection.set(arm.side * 0.65, -0.3, -0.55).transformDirection(group.matrixWorld)
            bendDirection.addScaledVector(targetDirection, -bendDirection.dot(targetDirection))
            if (bendDirection.lengthSq() < 0.00001) bendDirection.copy(actorRight).multiplyScalar(arm.side)
            bendDirection.normalize()
            const along = (upperLength * upperLength - lowerLength * lowerLength + distance * distance) / (2 * distance)
            const bend = Math.sqrt(Math.max(0, upperLength * upperLength - along * along))
            elbowTarget.copy(shoulderPoint).addScaledVector(targetDirection, along).addScaledVector(bendDirection, bend)

            const eased = armWeight * armWeight * (3 - 2 * armWeight)
            pointBone(arm.bone, arm.forearm, elbowTarget, eased)
            pointBone(arm.forearm, arm.hand, targetPoint, eased)
          }
        }
      }
      model.updateMatrixWorld(true)
    },
    dispose() {
      if (disposed) return
      disposed = true
      mixer.stopAllAction()
      mixer.uncacheRoot(model)
      skeletons.forEach((skeleton) => skeleton.dispose())
      group.removeFromParent()
    },
  }
}
