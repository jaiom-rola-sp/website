"use client"

import { useEffect, useRef } from "react"
import type { MotionValue } from "framer-motion"
import * as THREE from "three"
import { cloneRiggedPlayer, generatedModelConfig, loadGeneratedAssets, normalizeGLTF, type GeneratedAssets, type RiggedPlayer } from "./generated-assets"
import { clamp, samplePossession } from "./possession-play"
import "./arena-3d.css"

export type ArenaCameraMode = "player" | "ball" | "hybrid"

type Arena3DProps = {
  progress: MotionValue<number>
  chapter: number
  static?: boolean
  cameraMode?: ArenaCameraMode
}

const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

function addCourtMarkings(scene: THREE.Scene, material: THREE.Material) {
  const positions: number[] = []
  const stroke = (points: number[][], width = 0.045) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i]
      const [bx, bz] = points[i + 1]
      const length = Math.hypot(bx - ax, bz - az)
      if (!length) continue
      const nx = -(bz - az) / length * width / 2
      const nz = (bx - ax) / length * width / 2
      positions.push(ax + nx, 0.014, az + nz, bx + nx, 0.014, bz + nz, ax - nx, 0.014, az - nz)
      positions.push(ax - nx, 0.014, az - nz, bx + nx, 0.014, bz + nz, bx - nx, 0.014, bz - nz)
    }
  }
  const arc = (cx: number, cz: number, radius: number, start = 0, end = Math.PI * 2) => {
    const segments = Math.max(20, Math.ceil(Math.abs(end - start) * 20))
    const points = Array.from({ length: segments + 1 }, (_, i) => {
      const angle = start + (end - start) * i / segments
      return [cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius]
    })
    stroke(points)
  }
  stroke([[-7.5, -14], [7.5, -14], [7.5, 14], [-7.5, 14], [-7.5, -14]], 0.065)
  stroke([[-7.5, 0], [7.5, 0]])
  arc(0, 0, 1.8)
  for (const sign of [-1, 1]) {
    stroke([[-2.45, sign * 14], [-2.45, sign * 8.2], [2.45, sign * 8.2], [2.45, sign * 14]])
    arc(0, sign * 8.2, 1.8, sign < 0 ? 0 : Math.PI, sign < 0 ? Math.PI : Math.PI * 2)
    // The three-point arc and corner lines share the attacking basket origin.
    const center = sign * 12.15
    const radius = 6.75
    const endAngle = Math.acos(6.6 / radius)
    if (sign < 0) {
      arc(0, center, radius, endAngle, Math.PI - endAngle)
      stroke([[-6.6, -14], [-6.6, center + Math.sin(endAngle) * radius]])
      stroke([[6.6, -14], [6.6, center + Math.sin(endAngle) * radius]])
      arc(0, center, 1.25, 0, Math.PI)
    } else {
      arc(0, center, radius, Math.PI + endAngle, Math.PI * 2 - endAngle)
      stroke([[-6.6, 14], [-6.6, center - Math.sin(endAngle) * radius]])
      stroke([[6.6, 14], [6.6, center - Math.sin(endAngle) * radius]])
      arc(0, center, 1.25, Math.PI, Math.PI * 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  scene.add(new THREE.Mesh(geometry, material))
}

export default function Arena3D({ progress, chapter, static: isStatic = false, cameraMode = "ball" }: Arena3DProps) {
  const container = useRef<HTMLDivElement>(null)
  const requestFrame = useRef<(() => void) | null>(null)
  const configuration = useRef({ isStatic, cameraMode })

  useEffect(() => {
    configuration.current = { isStatic, cameraMode }
    requestFrame.current?.()
  }, [isStatic, cameraMode, chapter])

  useEffect(() => {
    const host = container.current
    if (!host) return
    const controller = new AbortController()
    const scene = new THREE.Scene()
    let renderer: THREE.WebGLRenderer | undefined
    let assets: GeneratedAssets | undefined
    let frame: number | null = null
    let firstPaint: number | null = null
    let secondPaint: number | null = null
    let idleInitialization: number | null = null
    let disposed = false
    let contextLost = false
    let shadersReady = false
    let width = Math.max(host.clientWidth, 1)
    let height = Math.max(host.clientHeight, 1)
    let mobile = width < 760
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.08, 90)
    let observer: ResizeObserver | undefined
    let themeObserver: MutationObserver | undefined
    let unsubscribe: (() => void) | undefined
    let handleContextLost: ((event: Event) => void) | undefined
    let handleContextRestored: (() => void) | undefined
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    const generatedRoots: THREE.Object3D[] = []
    const playerClones: RiggedPlayer[] = []

    const dispose = () => {
      if (disposed) return
      disposed = true
      controller.abort()
      if (frame !== null) cancelAnimationFrame(frame)
      if (firstPaint !== null) cancelAnimationFrame(firstPaint)
      if (secondPaint !== null) cancelAnimationFrame(secondPaint)
      if (idleInitialization !== null) window.cancelIdleCallback(idleInitialization)
      observer?.disconnect()
      themeObserver?.disconnect()
      unsubscribe?.()
      if (renderer) {
        if (handleContextLost) renderer.domElement.removeEventListener("webglcontextlost", handleContextLost)
        if (handleContextRestored) renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored)
      }
      // Imported clones share source geometries and maps. Detach them before
      // releasing this scene's planes/shadows, then release their bundle once.
      playerClones.forEach((player) => player.dispose())
      generatedRoots.forEach((root) => root.removeFromParent())
      scene.traverse((object) => {
        if (object instanceof THREE.DirectionalLight) object.shadow.dispose()
        if (!(object instanceof THREE.Mesh)) return
        geometries.add(object.geometry)
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
        objectMaterials.forEach((material) => materials.add(material))
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      assets?.dispose()
      renderer?.dispose()
      renderer?.forceContextLoss()
      renderer?.domElement.remove()
      requestFrame.current = null
    }

    const initialize = async () => {
      if (disposed) return
      host.dataset.status = "initializing"
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5))
        renderer.setSize(width, height)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production"
        renderer.shadowMap.enabled = !mobile
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.domElement.setAttribute("aria-hidden", "true")
        renderer.domElement.tabIndex = -1
        host.appendChild(renderer.domElement)

        host.dataset.status = "loading-assets"
        const loaded = await loadGeneratedAssets({
          signal: controller.signal,
          onProgress({ completed, total, asset, status }) {
            if (disposed) return
            host.dataset.assetProgress = `${completed}/${total}`
            host.dataset.assetLast = `${asset}:${status}`
          },
        })
        if (disposed) { loaded.dispose(); return }
        assets = loaded
        const { player: playerAsset, ball: ballAsset, hoop: hoopAsset, hardwood, panorama } = loaded
        if (!playerAsset || !ballAsset || !hoopAsset || !hardwood || !panorama) {
          host.dataset.assetErrors = JSON.stringify(loaded.errors)
          throw new Error("A generated arena asset could not be loaded")
        }
        host.dataset.assetSource = "higgsfield"
        host.dataset.playerRigged = String(playerAsset.scene.getObjectsByProperty("isSkinnedMesh", true).length > 0)
        width = Math.max(host.clientWidth, 1)
        height = Math.max(host.clientHeight, 1)
        mobile = width < 760
        camera.aspect = width / height
        renderer.setSize(width, height)

        const hemisphere = new THREE.HemisphereLight(0xf5efe0, 0x453b31, 1.8)
        scene.add(hemisphere)
        const keyLight = new THREE.DirectionalLight(0xffefdc, 2.6)
        keyLight.position.set(-4, 12, 5)
        keyLight.castShadow = !mobile
        keyLight.shadow.mapSize.set(1024, 1024)
        keyLight.shadow.camera.left = -16
        keyLight.shadow.camera.right = 16
        keyLight.shadow.camera.top = 18
        keyLight.shadow.camera.bottom = -18
        keyLight.shadow.camera.far = 40
        keyLight.shadow.normalBias = 0.04
        keyLight.shadow.bias = -0.0002
        scene.add(keyLight)
        const fillLight = new THREE.DirectionalLight(0xcbd9e6, 1.1)
        fillLight.position.set(8, 8, -12)
        scene.add(fillLight)

        hardwood.wrapS = THREE.RepeatWrapping
        hardwood.wrapT = THREE.RepeatWrapping
        hardwood.repeat.set(2, 4)
        hardwood.needsUpdate = true
        panorama.mapping = THREE.EquirectangularReflectionMapping
        panorama.needsUpdate = true
        scene.background = panorama
        scene.backgroundBlurriness = 0.025
        const floorMaterial = new THREE.MeshStandardMaterial({ map: hardwood, color: 0xe2c9ab, roughness: 0.52, metalness: 0.02 })
        const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0x342a21 })
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xf1ead5, side: THREE.DoubleSide })
        const paintMaterial = new THREE.MeshLambertMaterial({ color: 0x58503e })
        const contactShadowMaterial = new THREE.MeshBasicMaterial({ color: 0x161710, transparent: true, opacity: 0.18, depthWrite: false })
        // A uniform finish keeps the generated characters deliberately blank;
        // their smooth silhouettes and topology come from Higgsfield's model.
        const pearlMaterial = new THREE.MeshStandardMaterial({ color: 0xf2eade, roughness: 0.38, metalness: 0.025 })
        materials.add(pearlMaterial)

        const courtEdge = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.16, 28.8), edgeMaterial)
        courtEdge.position.y = -0.09
        scene.add(courtEdge)
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(15.7, 28.7), floorMaterial)
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true
        scene.add(floor)
        for (const sign of [-1, 1]) {
          const paint = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 5.8), paintMaterial)
          paint.rotation.x = -Math.PI / 2
          paint.position.set(0, 0.007, sign * 11.1)
          paint.receiveShadow = true
          scene.add(paint)
        }
        addCourtMarkings(scene, lineMaterial)

        const hoops = [-1, 1].map((sign) => {
          const model = normalizeGLTF(hoopAsset.scene.clone(true), { width: generatedModelConfig.hoop.width, ground: false })
          model.scale.y *= generatedModelConfig.hoop.heightScale
          model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            for (const material of materials) {
              if (material instanceof THREE.MeshStandardMaterial) {
                material.metalness = 0
                material.roughness = 0.65
              }
            }
          })
          const alignment = new THREE.Group()
          alignment.add(model)
          alignment.rotation.set(...generatedModelConfig.hoop.rotation)
          alignment.position.set(...generatedModelConfig.hoop.rimAnchor).multiplyScalar(-1)
          const pivot = new THREE.Group()
          pivot.position.set(0, 3.15, sign * 12.15)
          pivot.rotation.y = sign === 1 ? Math.PI : 0
          pivot.add(alignment)
          pivot.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = true })
          scene.add(pivot)
          generatedRoots.push(pivot)
          return pivot
        })

        const shadowGeometry = new THREE.CircleGeometry(0.48, 24)
        const players = samplePossession(0).players.map((pose, index) => {
          const avatar = cloneRiggedPlayer(playerAsset, { height: generatedModelConfig.player.height, phaseOffset: index * 0.17 })
          playerClones.push(avatar)
          avatar.model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.material = pearlMaterial
            }
          })
          avatar.group.rotation.y = generatedModelConfig.player.yaw
          const group = new THREE.Group()
          const shadow = new THREE.Mesh(shadowGeometry, contactShadowMaterial)
          shadow.rotation.x = -Math.PI / 2
          shadow.position.y = 0.014
          group.add(avatar.group, shadow)
          group.position.fromArray(pose.position)
          scene.add(group)
          return { group, avatar, shadow, handTarget: new THREE.Vector3() }
        })

        const ball = normalizeGLTF(ballAsset.scene.clone(true), { height: generatedModelConfig.ball.diameter, width: generatedModelConfig.ball.diameter, ground: false })
        ball.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return
          object.castShadow = true
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.metalness = 0
              material.roughness = 0.85
            }
          }
        })
        scene.add(ball)
        generatedRoots.push(ball)
        const ballShadowMaterial = contactShadowMaterial.clone()
        const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), ballShadowMaterial)
        ballShadow.rotation.x = -Math.PI / 2
        ballShadow.position.y = 0.021
        scene.add(ballShadow)

        const position = new THREE.Vector3()
        const travel = new THREE.Vector3()
        const followPosition = new THREE.Vector3()
        const followTarget = new THREE.Vector3()
        const playerPosition = new THREE.Vector3()
        const playerTarget = new THREE.Vector3()
        const overhead = new THREE.Vector3()
        const lookTarget = new THREE.Vector3()
        const origin = new THREE.Vector3()

        const render = () => {
          frame = null
          if (disposed || contextLost || !shadersReady || !renderer) return
          const config = configuration.current
          const p = config.isStatic ? 0 : clamp(progress.get())
          const play = samplePossession(p)
          position.fromArray(play.ball)
          ball.position.copy(position)
          ball.rotation.set(p * Math.PI * 18, p * Math.PI * 5, p * Math.PI * 3)
          ballShadow.position.set(position.x, 0.021, position.z)
          ballShadow.scale.setScalar(0.7 + position.y * 0.12)
          ballShadowMaterial.opacity = 0.23 / (1 + position.y * 0.4)

          players.forEach((player, index) => {
            const pose = play.players[index]
            player.group.position.fromArray(pose.position)
            player.group.rotation.y = pose.heading
            player.group.updateMatrixWorld(true)
            if (pose.reachTarget) player.handTarget.fromArray(pose.reachTarget)
            player.avatar.update({
              progress: p, gait: pose.gait, arms: pose.arms, locomotion: pose.locomotion,
              clipTime: pose.gait / 3.8,
              reachTarget: pose.reachTarget ? player.handTarget : undefined,
              reachSide: pose.reachSide, reachBlend: pose.reachBlend, reachBoth: pose.reachBoth,
            })
            player.shadow.visible = player.group.position.y < 0.15
          })

          // A generated hoop can be a single mesh, so recoil its complete model
          // around the calibrated rim instead of inventing replacement parts.
          const dunkNet = Math.sin(Math.PI * clamp((p - 0.949) / 0.04))
          hoops[0].rotation.z = Math.sin((p - 0.95) * 320) * dunkNet * 0.025

          travel.fromArray(play.cameraDirection).normalize()
          followPosition.copy(position).addScaledVector(travel, -3.35)
          followPosition.y = Math.max(1.65, position.y + 0.9)
          followTarget.copy(position).addScaledVector(travel, 0.5)
          followTarget.y += 0.13
          playerPosition.set(position.x - 0.65, 1.78, position.z + 0.8)
          playerTarget.set(position.x * 0.35, 2.05, -13.2)
          let playerBlend = config.cameraMode === "player" ? 1 : 0
          if (config.cameraMode === "hybrid") {
            playerBlend = (1 - smooth((p - 0.25) / 0.04)) * smooth((p - 0.17) / 0.04)
              + smooth((p - 0.4) / 0.04) * (1 - smooth((p - 0.53) / 0.04))
              + smooth((p - 0.72) / 0.04) * (1 - smooth((p - 0.88) / 0.04))
          }
          followPosition.lerp(playerPosition, clamp(playerBlend))
          followTarget.lerp(playerTarget, clamp(playerBlend))
          const descent = smooth((p - 0.075) / 0.115)
          overhead.set(0, mobile ? 44 : 38, 0.001)
          camera.position.lerpVectors(overhead, followPosition, descent)
          lookTarget.lerpVectors(origin, followTarget, descent)
          camera.up.set(0, descent, -(1 - descent)).normalize()
          camera.lookAt(lookTarget)
          camera.fov = THREE.MathUtils.lerp(46, mobile ? 76 : 67, descent)
          camera.setViewOffset(width, height, mobile ? 0 : -width * THREE.MathUtils.lerp(0.23, 0.18, descent), 0, width, height)
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
          host.dataset.ready = "true"
          host.dataset.status = "ready"
          host.dataset.progress = p.toFixed(4)
          host.dataset.cameraMode = config.cameraMode
          host.dataset.cameraX = camera.position.x.toFixed(3)
          host.dataset.cameraY = camera.position.y.toFixed(3)
          host.dataset.cameraZ = camera.position.z.toFixed(3)
          host.dataset.ballX = position.x.toFixed(3)
          host.dataset.ballY = position.y.toFixed(3)
          host.dataset.ballZ = position.z.toFixed(3)
          const carrier = players[play.owner ?? play.passer ?? play.receiver ?? 0]
          host.dataset.dribblerX = carrier.group.position.x.toFixed(4)
          host.dataset.dribblerZ = carrier.group.position.z.toFixed(4)
          host.dataset.dribblerHeading = (carrier.group.rotation.y + generatedModelConfig.player.yaw).toFixed(4)
          host.dataset.possession = play.owner === null ? "none" : String(play.owner)
          host.dataset.playAction = play.kind
          host.dataset.passer = play.passer === null ? "none" : String(play.passer)
          host.dataset.receiver = play.receiver === null ? "none" : String(play.receiver)
          host.dataset.players = JSON.stringify(players.map((player, index) => ({
            x: player.group.position.x, y: player.group.position.y, z: player.group.position.z,
            heading: player.group.rotation.y, reach: play.players[index].reachBlend, reachBoth: play.players[index].reachBoth,
            locomotion: play.players[index].locomotion, role: play.players[index].role,
          })))
        }

        const schedule = () => {
          if (!disposed && shadersReady && frame === null) frame = requestAnimationFrame(render)
        }
        requestFrame.current = schedule
        unsubscribe = progress.on("change", () => { if (!configuration.current.isStatic) schedule() })
        const updateTheme = () => {
          const dark = document.documentElement.classList.contains("dark")
          scene.backgroundIntensity = dark ? 0.42 : 0.9
          scene.fog = new THREE.Fog(dark ? 0x161a13 : 0xc8c9b9, 27, 67)
          hemisphere.intensity = dark ? 1.45 : 2.1
          keyLight.intensity = dark ? 2.25 : 3.0
          floorMaterial.color.set(dark ? 0xb7a48c : 0xe8d6bd)
          schedule()
        }
        themeObserver = new MutationObserver(updateTheme)
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
        observer = new ResizeObserver(() => {
          width = Math.max(host.clientWidth, 1)
          height = Math.max(host.clientHeight, 1)
          mobile = width < 760
          renderer?.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5))
          renderer?.setSize(width, height)
          camera.aspect = width / height
          schedule()
        })
        observer.observe(host)
        handleContextLost = (event) => {
          event.preventDefault()
          contextLost = true
          shadersReady = false
          host.dataset.ready = "false"
          host.dataset.status = "unavailable"
        }
        const prepareShaders = async () => {
          if (!renderer || disposed) return
          host.dataset.status = "compiling"
          try {
            await renderer.compileAsync(scene, camera)
            if (disposed || contextLost) return
            shadersReady = true
            schedule()
          } catch {
            if (!disposed) {
              host.dataset.ready = "false"
              host.dataset.status = "unavailable"
            }
          }
        }
        handleContextRestored = () => { contextLost = false; void prepareShaders() }
        renderer.domElement.addEventListener("webglcontextlost", handleContextLost)
        renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored)
        updateTheme()
        camera.position.set(0, mobile ? 44 : 38, 0.001)
        camera.up.set(0, 0, -1)
        camera.lookAt(0, 0, 0)
        void prepareShaders()
      } catch (error) {
        if (disposed) return
        host.dataset.ready = "false"
        host.dataset.status = "unavailable"
        host.dataset.error = error instanceof Error ? error.message : String(error)
        dispose()
      }
    }

    // Keep the exported overhead preview visible until generated models and
    // their shaders are ready. No procedural object silently replaces a model.
    void document.fonts.ready.then(() => {
      if (disposed) return
      firstPaint = requestAnimationFrame(() => {
        firstPaint = null
        secondPaint = requestAnimationFrame(() => {
          secondPaint = null
          if (disposed) return
          if ("requestIdleCallback" in window) {
            idleInitialization = window.requestIdleCallback(() => {
              idleInitialization = null
              void initialize()
            }, { timeout: 900 })
          } else void initialize()
        })
      })
    })
    return dispose
  }, [progress])

  return <div ref={container} className="arena-3d" data-ready="false" data-status="loading" data-chapter={chapter} aria-hidden="true" />
}
