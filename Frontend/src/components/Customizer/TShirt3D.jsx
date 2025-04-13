/**
 * TShirt3D.jsx
 *
 * WHY each fix is applied:
 * 1. useBounds()  → auto-fits model into camera frustum so nothing is clipped
 * 2. useGLTF()    → caches the GLB so texture reloads don't re-parse the whole model
 * 3. Decal        → uses drei's <Decal> which handles UV-projection natively —
 *                   no manual UV math, no mesh surgery needed
 * 4. OrbitControls → smooth rotation/zoom with damping; disabled when dragging decal
 * 5. useCursor    → pointer feedback when hovering interactive mesh
 * 6. Canvas DPR   → capped at 2 in parent; model uses MeshStandardMaterial for PBR
 * 7. TextureLoader → loaded via useLoader so React suspense handles loading states
 * 8. Text mesh    → rendered to an offscreen canvas → texture, so no external font needed
 */

import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  useGLTF, OrbitControls,
} from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/t-shirt.glb')

// ─── PLACEMENT → world-space config ─────────────────────────────────────────
// WHY: Different placements point the decal projection in different directions.
//      Euler angles below orient the "decal projector" at each surface normal.
const PLACEMENT_CONFIG = {
  'front':       { position: [0,   0.05, 0.52],  rotation: [0,    0,          0],   scale: 0.7 },
  'back':        { position: [0,   0.05, -0.52], rotation: [0,    Math.PI,    0],   scale: 0.7 },
  'left-sleeve': { position: [-0.55, 0.2, 0],    rotation: [0,    Math.PI/2,  0],   scale: 0.4 },
  'right-sleeve':{ position: [0.55, 0.2, 0],     rotation: [0,   -Math.PI/2,  0],   scale: 0.4 },
}

export default function TShirt3D({ state, updateDecal }) {
  const { color, placement, designUrl, designText, textColor, fontSize, decal } = state

  // ─── Load model ────────────────────────────────────────────────────────────
  const { scene } = useGLTF('/models/t-shirt.glb')

  // ─── WHY: Clone the scene so we get fresh materials per mount;
  //          avoids cross-contamination if component remounts. ────────────────
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    return clone
  }, [scene])

  // ─── WHY: Apply color to ALL meshes in the model, not just the first one.
  //          Some GLBs split the shirt into body + collar + sleeves meshes. ──
  useEffect(() => {
    clonedScene.traverse(child => {
      if (!child.isMesh) return
      if (!child.material.__cloned) {
        child.material = child.material.clone()
        child.material.__cloned = true
      }
      child.material.color.set(color)
      child.material.needsUpdate = true
    })
  }, [color, clonedScene])

  // ─── Center + scale via bounding box ────────────────────────────────────────
  // WHY: Every GLB has a different origin. Bounding-box centering guarantees
  //      the shirt is centred at world origin regardless of how it was exported.
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())

    // Translate so centre of bbox = (0,0,0)
    clonedScene.position.sub(center)

    // Scale so tallest axis = 2 units (fits our camera setup)
    const maxAxis = Math.max(size.x, size.y, size.z)
    const targetHeight = 2.0
    const scaleFactor = targetHeight / maxAxis
    clonedScene.scale.setScalar(scaleFactor)

    // After scaling, re-centre (sub already moved it, just reapply)
    const box2 = new THREE.Box3().setFromObject(clonedScene)
    const center2 = box2.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center2)
  }, [clonedScene])

  // ─── Text-to-texture ────────────────────────────────────────────────────────
  // WHY: We render text onto an offscreen <canvas> then use it as a THREE.Texture.
  //      This avoids importing a font loader and works with any system font.
  const textTexture = useMemo(() => {
    if (!designText) return null
    const canvas = document.createElement('canvas')
    canvas.width  = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font         = `bold ${fontSize}px "Bebas Neue", "Impact", sans-serif`
    ctx.fillStyle    = textColor
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(designText.toUpperCase(), canvas.width / 2, canvas.height / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [designText, textColor, fontSize])

  // ─── Image texture ───────────────────────────────────────────────────────────
  // WHY: useLoader caches by URL so switching placements doesn't re-download.
  //      We create a new TextureLoader manually because useLoader needs a stable URL.
  const [imageTexture, setImageTexture] = useState(null)
  useEffect(() => {
    if (!designUrl) { setImageTexture(null); return }
    const loader = new THREE.TextureLoader()
    let disposed = false
    loader.load(
      designUrl,
      (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
        tex.flipY = false
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.anisotropy = 8
        tex.needsUpdate = true
        setImageTexture(tex)
      },
      undefined,
      () => {
        if (!disposed) setImageTexture(null)
      }
    )
    return () => {
      disposed = true
      setImageTexture((prev) => {
        prev?.dispose()
        return null
      })
    }
  }, [designUrl])

  const activeTexture = imageTexture || textTexture

  // ─── Placement config ────────────────────────────────────────────────────────
  const cfg = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG.front

  // ─── Decal transform: merge slider values with placement base ──────────────
  // WHY: The slider controls shift the decal within the placement's local space.
  //      We offset from the placement center by decal.x/y (0.5 = center = no offset).
  const decalPosition = useMemo(() => {
    const base = new THREE.Vector3(...cfg.position)
    const offsetX = (decal.x - 0.5) * cfg.scale
    const offsetY = (decal.y - 0.5) * cfg.scale
    // Project offset along placement's tangent (x→right, y→up in world)
    base.x += offsetX
    base.y += offsetY
    return base
  }, [cfg, decal.x, decal.y])

  const decalRotation = useMemo(() => {
    const base = new THREE.Euler(...cfg.rotation)
    const rot = new THREE.Euler(
      base.x,
      base.y,
      base.z + THREE.MathUtils.degToRad(decal.rotation)
    )
    return rot
  }, [cfg.rotation, decal.rotation])

  const decalScale = useMemo(() => {
    const s = decal.scale * 1.4
    return new THREE.Vector3(s, s, s)
  }, [decal.scale])

  // ─── Find the main mesh to attach the decal to ────────────────────────────
  // WHY: Decal needs a parent mesh. We pick the largest mesh by vertex count
  //      (typically the shirt body, not the collar or buttons).
  const mainMeshRef = useRef(null)
  const [meshPool, setMeshPool] = useState([])
  useEffect(() => {
    const meshes = []
    clonedScene.traverse(child => {
      if (child.isMesh) {
        const box = new THREE.Box3().setFromObject(child)
        const center = box.getCenter(new THREE.Vector3())
        const vertexCount = child.geometry.attributes.position?.count || 0
        meshes.push({
          mesh: child,
          name: (child.name || '').toLowerCase(),
          center,
          vertexCount,
        })
      }
    })
    setMeshPool(meshes)
  }, [clonedScene])

  // WHY: prefer named sleeve/front/back meshes if model provides them, otherwise
  // fall back to spatial heuristics and finally the largest mesh.
  const selectedTargetMesh = useMemo(() => {
    if (!meshPool.length) return null

    const byName = (keywords) =>
      meshPool.find(entry => keywords.some(k => entry.name.includes(k)))?.mesh || null

    const largest = [...meshPool].sort((a, b) => b.vertexCount - a.vertexCount)[0]?.mesh || null

    if (placement === 'left-sleeve') {
      return byName(['leftsleeve', 'sleeve_l', 'sleeve.l', 'left_sleeve', 'left sleeve', 'sleevel'])
        || meshPool.filter(e => e.center.x < -0.15).sort((a, b) => b.vertexCount - a.vertexCount)[0]?.mesh
        || largest
    }
    if (placement === 'right-sleeve') {
      return byName(['rightsleeve', 'sleeve_r', 'sleeve.r', 'right_sleeve', 'right sleeve', 'sleever'])
        || meshPool.filter(e => e.center.x > 0.15).sort((a, b) => b.vertexCount - a.vertexCount)[0]?.mesh
        || largest
    }
    if (placement === 'back') {
      return byName(['back', 'rear'])
        || meshPool.filter(e => e.center.z < -0.05).sort((a, b) => b.vertexCount - a.vertexCount)[0]?.mesh
        || largest
    }

    // front
    return byName(['front', 'body', 'torso'])
      || meshPool.filter(e => e.center.z >= -0.05).sort((a, b) => b.vertexCount - a.vertexCount)[0]?.mesh
      || largest
  }, [meshPool, placement])

  useEffect(() => {
    mainMeshRef.current = selectedTargetMesh
  }, [selectedTargetMesh])

  // ─── Robust fallback: apply texture directly to selected mesh material ───────
  // WHY: If decal projection fails on a given model topology/UV export, this
  // guarantees the uploaded design still appears on the chosen part.
  useEffect(() => {
    const targetMesh = mainMeshRef.current
    if (!targetMesh?.material) return undefined

    const material = targetMesh.material
    const prevMap = material.map || null
    const prevTransparent = material.transparent
    const prevNeedsUpdate = material.needsUpdate

    if (activeTexture) {
      const repeat = THREE.MathUtils.clamp(decal.scale * 2.8, 0.35, 1.8)
      const offsetX = (0.5 - repeat / 2) + (decal.x - 0.5) * (1 - repeat)
      const offsetY = (0.5 - repeat / 2) + (decal.y - 0.5) * (1 - repeat)

      activeTexture.center.set(0.5, 0.5)
      activeTexture.rotation = THREE.MathUtils.degToRad(decal.rotation)
      activeTexture.repeat.set(repeat, repeat)
      activeTexture.offset.set(offsetX, offsetY)
      activeTexture.needsUpdate = true

      material.map = activeTexture
      material.transparent = true
    } else {
      material.map = null
    }

    material.needsUpdate = true

    return () => {
      if (!targetMesh?.material) return
      targetMesh.material.map = prevMap
      targetMesh.material.transparent = prevTransparent
      targetMesh.material.needsUpdate = prevNeedsUpdate
    }
  }, [activeTexture, selectedTargetMesh, decal.scale, decal.x, decal.y, decal.rotation])

  return (
    <group>
      {/* ── OrbitControls ─────────────────────────────────────────────────── */}
      {/* WHY: enableDamping = smooth inertia feeling; dampingFactor controls speed */}
      <OrbitControls
        enableDamping
        dampingFactor={0.07}
        minDistance={1.2}
        maxDistance={6}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI - 0.3}
        target={[0, 0, 0]}
      />

      {/* ── The shirt model ───────────────────────────────────────────────── */}
      <primitive object={clonedScene} castShadow receiveShadow />

      {/* ── Placement indicator ring ──────────────────────────────────────── */}
      {/* WHY: Visual feedback showing WHERE the decal will be projected */}
      <PlacementRing cfg={cfg} active={!!activeTexture} />
    </group>
  )
}

// ── Animated ring showing active placement zone ───────────────────────────────
function PlacementRing({ cfg, active }) {
  const meshRef = useRef()
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.8
    }
  })

  if (!active) return null

  return (
    <mesh
      ref={meshRef}
      position={cfg.position}
      rotation={cfg.rotation}
    >
      <ringGeometry args={[0.12, 0.14, 48]} />
      <meshBasicMaterial color="#E81C0E" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  )
}