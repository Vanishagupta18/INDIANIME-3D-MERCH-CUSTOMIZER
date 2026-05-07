/**
 * TShirt3D.jsx — FIXED VERSION
 *
 * ══════════════════════════════════════════════════════════════════
 * ROOT CAUSE: WHY ONLY A CIRCULAR RING APPEARED INSTEAD OF IMAGE
 * ══════════════════════════════════════════════════════════════════
 *
 * The circular ring is THREE.js's default MeshStandardMaterial being
 * projected through the Decal's box-frustum onto a curved surface.
 * When <Decal> has NO valid texture (or the texture hasn't loaded yet),
 * it renders its default white/grey material — and the box-projection
 * clipped by the curved mesh = oval / ring shape.
 *
 * SPECIFIC MISTAKES that caused this:
 *
 * 1. TEXTURE NOT PASSED TO meshStandardMaterial INSIDE <Decal>
 *    Wrong:  <Decal map={texture} />
 *    Right:  <Decal><meshStandardMaterial map={texture} /></Decal>
 *    Why:    <Decal> itself doesn't accept a map prop in most drei versions.
 *            The material must be a CHILD of <Decal>.
 *
 * 2. depthTest={true} (default)
 *    Causes decal to clip inside the mesh → invisible on curved surfaces.
 *    Fix: depthTest={false} on both <Decal> and <meshStandardMaterial>.
 *
 * 3. transparent={false} on the material
 *    PNG alpha channel is ignored → opaque white box over shirt.
 *    Fix: transparent={true} + alphaTest={0.01}
 *
 * 4. flipY not set to false
 *    GLTF UV space has Y flipped vs browser Image.
 *    Fix: tex.flipY = false immediately after TextureLoader.load()
 *
 * 5. mesh ref not passed to <Decal mesh={ref}>
 *    Without this, drei doesn't know which geometry to project onto.
 *    Result: decal renders at world origin or disappears.
 *
 * 6. texture assigned via material.map in useEffect without proper
 *    scene invalidation — Three.js doesn't re-render unless something
 *    triggers a new frame with the new map set.
 */

import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Decal } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/t-shirt.glb')

// ─── Placement world-space config ────────────────────────────────────────────
const PLACEMENT_CONFIG = {
  front:         { position: [0,   0.05,  0.52], rotation: [0,  0,           0], scale: 0.7 },
  back:          { position: [0,   0.05, -0.52], rotation: [0,  Math.PI,     0], scale: 0.7 },
  'left-sleeve': { position: [-0.55, 0.2, 0],    rotation: [0,  Math.PI/2,   0], scale: 0.4 },
  'right-sleeve':{ position: [0.55, 0.2, 0],     rotation: [0, -Math.PI/2,   0], scale: 0.4 },
}

// ─── Texture loader hook ─────────────────────────────────────────────────────
function useUploadedTexture(url) {
  const [texture, setTexture] = useState(null)
  const prevUrl = useRef(null)

  useEffect(() => {
    if (!url) {
      setTexture(prev => { prev?.dispose(); return null })
      return
    }

    if (prevUrl.current === url) return
    prevUrl.current = url

    let cancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(url, (tex) => {
      if (cancelled) { tex.dispose(); return }

      // ── CRITICAL FIXES ────────────────────────────────────────────────────
      tex.flipY      = false                        // Fix 4: GLTF UV convention
      tex.colorSpace = THREE.SRGBColorSpace          // correct gamma
      tex.wrapS      = THREE.ClampToEdgeWrapping     // no tiling
      tex.wrapT      = THREE.ClampToEdgeWrapping
      tex.minFilter  = THREE.LinearMipmapLinearFilter
      tex.magFilter  = THREE.LinearFilter
      tex.anisotropy = 16
      tex.needsUpdate = true
      // ─────────────────────────────────────────────────────────────────────

      setTexture(tex)
    })

    return () => { cancelled = true }
  }, [url])

  return texture
}

// ─── Text → canvas texture ───────────────────────────────────────────────────
function useTextTexture(text, color, size) {
  return useMemo(() => {
    if (!text?.trim()) return null
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 512
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, 1024, 512)
    ctx.font         = `bold ${size * 2}px Impact, "Bebas Neue", Arial`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle  = color === '#000000' ? '#ffffff' : '#000000'
    ctx.lineWidth    = 4
    ctx.strokeText(text.toUpperCase(), 512, 256)
    ctx.fillStyle = color
    ctx.fillText(text.toUpperCase(), 512, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.flipY      = false
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    return tex
  }, [text, color, size])
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TShirt3D({ state }) {
  const { color, placement, designUrl, designText, textColor, fontSize, decal } = state

  const { scene } = useGLTF('/models/t-shirt.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  const imageTexture = useUploadedTexture(designUrl)
  const textTexture  = useTextTexture(designText, textColor, fontSize)

  // Priority: uploaded image > text > nothing
  const activeTexture = imageTexture || textTexture

  // ── Apply shirt color ─────────────────────────────────────────────────────
  useEffect(() => {
    clonedScene.traverse(child => {
      if (!child.isMesh) return
      if (!child.material._cloned) {
        child.material = child.material.clone()
        child.material._cloned = true
      }
      child.material.color.set(color)
      child.material.needsUpdate = true
    })
  }, [color, clonedScene])

  // ── Center + auto-scale via bounding box ──────────────────────────────────
  useEffect(() => {
    const box    = new THREE.Box3().setFromObject(clonedScene)
    const center = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())

    clonedScene.position.sub(center)
    clonedScene.scale.setScalar(2.0 / Math.max(size.x, size.y, size.z))

    // Re-center after scale
    const box2 = new THREE.Box3().setFromObject(clonedScene)
    clonedScene.position.sub(box2.getCenter(new THREE.Vector3()))
  }, [clonedScene])

  // ── Resolve which mesh to project decal onto ──────────────────────────────
  const targetMeshRef = useRef(null)

  const targetMesh = useMemo(() => {
    const all = []
    clonedScene.traverse(child => {
      if (!child.isMesh) return
      const box = new THREE.Box3().setFromObject(child)
      all.push({
        mesh: child,
        name: (child.name || '').toLowerCase(),
        cx: box.getCenter(new THREE.Vector3()).x,
        cz: box.getCenter(new THREE.Vector3()).z,
        verts: child.geometry.attributes.position?.count || 0,
      })
    })
    if (!all.length) return null

    const byName = (...keys) => all.find(m => keys.some(k => m.name.includes(k)))?.mesh
    const largest = [...all].sort((a, b) => b.verts - a.verts)[0].mesh

    switch (placement) {
      case 'left-sleeve':
        return byName('leftsleeve', 'sleeve_l', 'sleevel', 'left')
          || all.filter(m => m.cx < -0.1).sort((a,b) => b.verts - a.verts)[0]?.mesh
          || largest
      case 'right-sleeve':
        return byName('rightsleeve', 'sleeve_r', 'sleever', 'right')
          || all.filter(m => m.cx > 0.1).sort((a,b) => b.verts - a.verts)[0]?.mesh
          || largest
      case 'back':
        return byName('back', 'rear')
          || all.filter(m => m.cz < -0.05).sort((a,b) => b.verts - a.verts)[0]?.mesh
          || largest
      default: // front
        return byName('front', 'body', 'torso', 'shirt')
          || all.filter(m => m.cz >= -0.05).sort((a,b) => b.verts - a.verts)[0]?.mesh
          || largest
    }
  }, [clonedScene, placement])

  useEffect(() => { targetMeshRef.current = targetMesh }, [targetMesh])

  // ── Decal transform ───────────────────────────────────────────────────────
  const cfg = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG.front

  const decalPos = useMemo(() => {
    const v = new THREE.Vector3(...cfg.position)
    v.x += (decal.x - 0.5) * cfg.scale
    v.y += (decal.y - 0.5) * cfg.scale
    return v
  }, [cfg, decal.x, decal.y])

  const decalRot = useMemo(() => new THREE.Euler(
    cfg.rotation[0],
    cfg.rotation[1],
    cfg.rotation[2] + THREE.MathUtils.degToRad(decal.rotation)
  ), [cfg.rotation, decal.rotation])

  const decalScaleVec = useMemo(
    () => new THREE.Vector3(decal.scale * 1.4, decal.scale * 1.4, decal.scale * 1.4),
    [decal.scale]
  )

  return (
    <group>
      <OrbitControls
        enableDamping
        dampingFactor={0.07}
        minDistance={1.2}
        maxDistance={6}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI - 0.3}
      />

      <primitive object={clonedScene} castShadow receiveShadow />

      {/* ══════════════════════════════════════════════════════════════════
          THE CORE FIX — correct Decal usage
          ══════════════════════════════════════════════════════════════════
          1. mesh={targetMeshRef} tells drei which surface to project onto
          2. depthTest={false} on Decal prevents clipping into curved mesh
          3. meshStandardMaterial is a CHILD — not a prop on <Decal>
          4. map={activeTexture} on the material, not on the Decal
          5. transparent={true} + alphaTest for PNG transparency
          6. depthWrite={false} prevents depth buffer corruption
          ══════════════════════════════════════════════════════════════════ */}
      {activeTexture && targetMeshRef.current && (
        <Decal
          mesh={targetMeshRef}
          position={decalPos}
          rotation={decalRot}
          scale={decalScaleVec}
          depthTest={false}
          polygonOffset
          polygonOffsetFactor={-4}
        >
          <meshStandardMaterial
            map={activeTexture}
            transparent={true}
            alphaTest={0.01}
            depthTest={false}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetFactor={-4}
            roughness={0.85}
            metalness={0.0}
            toneMapped={false}
          />
        </Decal>
      )}

      {/* Subtle guide when no design active */}
      {!activeTexture && <PlacementGuide cfg={cfg} />}
    </group>
  )
}

// ── Thin rotating guide ring ─────────────────────────────────────────────────
function PlacementGuide({ cfg }) {
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.5 })
  return (
    <mesh ref={ref} position={cfg.position} rotation={cfg.rotation}>
      <torusGeometry args={[0.14, 0.005, 8, 48]} />
      <meshBasicMaterial color="#E81C0E" transparent opacity={0.4} />
    </mesh>
  )
}