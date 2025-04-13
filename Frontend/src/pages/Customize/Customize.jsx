import { useState, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import TShirt3D from "../../components/Customizer/TShirt3D";
import ControlsPanel from "../../components/Customizer/ControlsPanel";
import AIDesignPanel from "../../components/Customizer/AIDesignPanel";
import './Customize.css'

// ─── WHY: Centralise all customizer state here so every sub-component
//     reads from a single source of truth, avoiding prop-drilling chaos. ───────
const DEFAULT_STATE = {
  color:      '#ffffff',
  placement:  'front',          // front | back | left-sleeve | right-sleeve
  designUrl:  null,             // uploaded image object URL
  designText: '',               // text overlay
  textColor:  '#000000',
  fontSize:   48,
  // Transform for the decal (UV-space, normalised 0-1)
  decal: { x: 0.5, y: 0.5, scale: 0.25, rotation: 0 },
}

export default function Customize() {
  const [state, setState] = useState(DEFAULT_STATE)
  const [aiOpen,   setAiOpen]   = useState(false)

  const update = useCallback((patch) =>
    setState(prev => ({ ...prev, ...patch })), [])

  const updateDecal = useCallback((patch) =>
    setState(prev => ({ ...prev, decal: { ...prev.decal, ...patch } })), [])

  // ─── WHY: createObjectURL gives a stable URL for the texture loader.
  //     We revoke previous URLs to avoid memory leaks. ─────────────────────────
  const prevUrlRef = useRef(null)
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.'); return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB.'); return
    }
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    const url = URL.createObjectURL(file)
    prevUrlRef.current = url
    update({ designUrl: url })
  }, [update])

  return (
    <div className="cust-root">

      {/* ── LEFT: 3D Viewport ─────────────────────────────────────────────── */}
      <div className="cust-viewport">
        <div className="canvas-container">
          {/* WHY: <Canvas> must have explicit dimensions — flex children
                  don't auto-size an HTML canvas element. */}
          <Canvas
            shadows
            dpr={[1, 2]}             /* WHY: DPR cap at 2 → prevents 4K overdraw on retina */
            camera={{
              position: [0, 0.5, 2.8], /* WHY: Pull camera back enough to see full shirt */
              fov: 38,                  /* WHY: Narrow FOV reduces perspective distortion */
              near: 0.1,
              far: 100,
            }}
            gl={{ preserveDrawingBuffer: true }}   /* WHY: Needed for screenshot / export */
          >
            {/* ── Lighting setup ─────────────────────────────────────────── */}
            {/* WHY: Ambient prevents pure-black shadows; directional gives depth */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-4, 3, -4]} intensity={0.4} />
            <pointLight position={[0, 5, 3]} intensity={0.3} />

            <Suspense fallback={<LoadingMesh />}>
              <TShirt3D state={state} updateDecal={updateDecal} />
              {/* WHY: Environment gives realistic PBR reflections without
                       expensive ray-tracing setup */}
              <Environment preset="studio" />
              {/* WHY: ContactShadows at y=-1 grounds the shirt visually */}
              <ContactShadows
                position={[0, -1.05, 0]}
                opacity={0.35}
                scale={4}
                blur={2.5}
                far={2}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Viewport overlays */}
        <div className="viewport-hint">
          <span>🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Shift+drag to pan</span>
        </div>

        {/* AI Button */}
        <button className="ai-fab" onClick={() => setAiOpen(true)}>
          ✨ AI Design
        </button>
      </div>

      {/* ── RIGHT: Control Panel ──────────────────────────────────────────── */}
      <ControlsPanel
        state={state}
        update={update}
        updateDecal={updateDecal}
        onUploadDesign={handleFileUpload}
        onClearDesign={() => update({ designUrl: null })}
        onOpenAI={() => setAiOpen(true)}
        onAddToCart={() => alert('Custom order placed! (connect to backend)')}
      />

      {/* AI Panel overlay */}
      {aiOpen && (
        <AIDesignPanel
          onSelect={url => { update({ designUrl: url }); setAiOpen(false) }}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  )
}

// ── Fallback while GLB loads ─────────────────────────────────────────────────
function LoadingMesh() {
  return (
    <mesh>
      <boxGeometry args={[0.8, 1, 0.1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  )
}
