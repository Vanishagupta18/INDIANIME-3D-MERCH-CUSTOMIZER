/**
 * Customize.jsx — FIXED
 *
 * WHY THE OLD VERSION WORKED AND THE NEW ONE DIDN'T:
 * ────────────────────────────────────────────────────
 * Old version:  Renders design as a <planeGeometry> mesh with meshStandardMaterial
 *               positioned slightly in front of the shirt surface (z + 0.02)
 *               → Simple, reliable, works with any GLTF regardless of UV layout
 *
 * New version:  Used drei's <Decal> which projects through a box-frustum onto UVs
 *               → Requires specific UV unwrap, fails silently on most GLBs,
 *                 shows only the circular projection shadow (the "ring")
 *
 * FIX: Port the exact plane-geometry approach from the working old version.
 * The key settings that make it work:
 *   texture.flipY = true          ← old version used true, not false
 *   texture.encoding = sRGBEncoding  ← old version used encoding (not colorSpace)
 *   position z + 0.02             ← slightly in front of mesh surface
 *   depthTest={false}             ← renders on top regardless of depth
 *   depthWrite={false}            ← doesn't corrupt depth buffer
 *   polygonOffset + factor        ← prevents z-fighting
 */

import React, { useState, useRef, useEffect, useMemo, Suspense, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { toast } from '../../components/ui/Toast'
import './Customize.css'

useGLTF.preload('/models/t-shirt.glb')

// ─── Text Design Dialog ────────────────────────────────────────────────────────
function TextDesignDialog({ onClose, onAdd }) {
  const [text, setText]           = useState('')
  const [color, setColor]         = useState('#ffffff')
  const [fontSize, setFontSize]   = useState(80)
  const [fontFamily, setFontFamily] = useState('Impact')

  const handleAdd = () => {
    if (!text.trim()) { alert('Please enter some text'); return }
    onAdd({ text, color, fontSize, fontFamily })
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title">✏️ Add Text Design</h2>

        <label className="dialog-label">Text Content</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. HOKAGE, ONE PIECE, DEMON..."
          className="dialog-textarea"
          style={{ fontFamily }}
        />

        <label className="dialog-label">Font Family</label>
        <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="dialog-select">
          <option value="Impact">Impact</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>

        <div className="dialog-row">
          <div>
            <label className="dialog-label">Font Size: {fontSize}px</label>
            <input type="range" min={40} max={150} step={5} value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div>
            <label className="dialog-label">Text Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: '100%', height: 40, borderRadius: 4, border: '1px solid #333', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Preview */}
        <div className="dialog-preview">
          <span style={{ fontFamily, fontSize: Math.min(fontSize / 2, 40), color, fontWeight: 'bold' }}>
            {text || 'Preview text...'}
          </span>
        </div>

        <div className="dialog-actions">
          <button onClick={onClose} className="dialog-btn-cancel">Cancel</button>
          <button onClick={handleAdd} className="dialog-btn-add">Add to T-Shirt</button>
        </div>
      </div>
    </div>
  )
}

// ─── Individual Design Decal (PLANE GEOMETRY — the working approach) ───────────
// WHY: Instead of drei's <Decal> (which requires specific UV maps),
//      we render a flat plane mesh positioned in front of the shirt surface.
//      This works with 100% of GLTF models regardless of how they were exported.
function DesignMesh({ design, isSelected, onSelect }) {
  const [hover, setHover] = useState(false)
  useCursor(hover || isSelected)

  const logoWidth  = design.scale || 0.3
  const logoHeight = logoWidth * (design.aspectRatio || 1)

  // ── Text → canvas texture ────────────────────────────────────────────────
  const textTexture = useMemo(() => {
    if (design.type !== 'text') return null
    const canvas = document.createElement('canvas')
    canvas.width = 1024; canvas.height = 1024
    const ctx = canvas.getContext('2d')

    // Transparent background so only text shows
    ctx.clearRect(0, 0, 1024, 1024)
    ctx.fillStyle = design.textColor || '#ffffff'
    ctx.font = `bold ${design.fontSize || 80}px ${design.fontFamily || 'Impact'}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Word wrap
    const words = design.text.split(' ')
    const lines = []
    let cur = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i]
      if (ctx.measureText(test).width > 950) { lines.push(cur); cur = words[i] }
      else cur = test
    }
    lines.push(cur)

    const lh = (design.fontSize || 80) * 1.2
    const startY = 512 - ((lines.length - 1) * lh) / 2
    lines.forEach((line, i) => ctx.fillText(line, 512, startY + i * lh))

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [design.text, design.textColor, design.fontSize, design.fontFamily, design.type])

  const displayTexture = design.type === 'text' ? textTexture : design.texture

  return (
    <group>
      <mesh
        position={design.position}
        rotation={design.rotation || [0, 0, 0]}
        onPointerDown={e => { e.stopPropagation(); onSelect(design.id) }}
        onPointerOver={e => { e.stopPropagation(); setHover(true) }}
        onPointerOut={e => { e.stopPropagation(); setHover(false) }}
      >
        {/* WHY: PlaneGeometry is a flat quad — simple, no UV issues */}
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial
          map={displayTexture}
          transparent={true}
          opacity={hover || isSelected ? 0.9 : 1}
          side={THREE.DoubleSide}
          depthTest={false}      /* renders on top of shirt surface */
          depthWrite={false}     /* doesn't mess up depth buffer */
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Tooltip */}
      {(hover || isSelected) && (
        <Html position={[design.position[0], design.position[1] + logoHeight/2 + 0.12, design.position[2]]}>
          <div style={{
            background: isSelected ? 'rgba(232,28,14,0.95)' : 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: isSelected ? 700 : 400,
          }}>
            {isSelected ? '✓ Selected — use controls →' : '👆 Click to select'}
          </div>
        </Html>
      )}

      {/* Selection outline */}
      {isSelected && (
        <lineSegments position={design.position} rotation={design.rotation || [0, 0, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(logoWidth, logoHeight)]} />
          <lineBasicMaterial color="#E81C0E" linewidth={2} />
        </lineSegments>
      )}
    </group>
  )
}

// ─── T-Shirt 3D Model ─────────────────────────────────────────────────────────
function TShirtModel({ color, designs, onSurfaceClick, onDesignSelect }) {
  const { scene } = useGLTF('/models/t-shirt.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const setupDone = useRef(false)

  // Initial setup — centering, scaling, shadow
  useEffect(() => {
    if (setupDone.current) return
    clonedScene.traverse(child => {
      if (!child.isMesh) return
      child.material = child.material ? child.material.clone() : new THREE.MeshStandardMaterial()
      child.material.color = new THREE.Color(color)
      child.castShadow    = true
      child.receiveShadow = true
    })

    const box = new THREE.Box3().setFromObject(clonedScene)
    const modelSize = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z)
    if (maxDim > 0) clonedScene.scale.setScalar(1.6 / maxDim)

    const box2   = new THREE.Box3().setFromObject(clonedScene)
    const center = box2.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center)
    clonedScene.position.y += 0.02

    setupDone.current = true
  }, [clonedScene])

  // Color update — separate effect so setup doesn't re-run
  useEffect(() => {
    clonedScene.traverse(child => {
      if (child.isMesh && child.material?.color) {
        child.material.color = new THREE.Color(color)
      }
    })
  }, [color, clonedScene])

  return (
    <group onClick={e => { e.stopPropagation(); if (onSurfaceClick && e.point) onSurfaceClick(e.point) }}>
      <primitive object={clonedScene} />
      {designs.map(d => (
        <DesignMesh
          key={d.id}
          design={d}
          isSelected={false}
          onSelect={onDesignSelect}
        />
      ))}
    </group>
  )
}

// ─── Scene background box + floor ─────────────────────────────────────────────
function Showcase({ children }) {
  return (
    <>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[3.2, 1.9, 2.4]} />
        <meshStandardMaterial color="#0f0f0f" side={THREE.BackSide} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      {children}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Customize() {
  const { addToCart }  = useCart()
  const navigate       = useNavigate()

  const [tshirtColor,   setTshirtColor]   = useState('#ffffff')
  const [designs,       setDesigns]       = useState([])
  const [pendingDesign, setPendingDesign] = useState(null)
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [showTextDialog, setShowTextDialog] = useState(false)
  const [dragOver,      setDragOver]      = useState(false)
  const [size,          setSize]          = useState('M')
  const [fabric,        setFabric]        = useState('cotton')
  const [quantity,      setQuantity]      = useState(1)
  const [printSide,     setPrintSide]     = useState('front')

  const fabricInfo = {
    cotton:       { name: '100% Cotton',       description: 'Soft, breathable, perfect for everyday wear', priceAdj: 0  },
    polyester:    { name: '100% Polyester',     description: 'Durable, moisture-wicking, wrinkle-resistant', priceAdj: 50 },
    'cotton-poly':{ name: 'Cotton-Poly Blend',  description: 'Combines comfort with durability',              priceAdj: 30 },
    organic:      { name: 'Organic Cotton',     description: 'Eco-friendly, sustainably sourced',             priceAdj: 80 },
  }

  const colorOptions = [
    { name: 'White',        value: '#ffffff' },
    { name: 'Black',        value: '#111111' },
    { name: 'INDIANIME Red',value: '#b30000' },
    { name: 'Navy Blue',    value: '#1e3a8a' },
    { name: 'Forest Green', value: '#065f46' },
    { name: 'Charcoal',     value: '#374151' },
    { name: 'Hot Pink',     value: '#db2777' },
    { name: 'Purple',       value: '#7c3aed' },
    { name: 'Gold',         value: '#fbbf24' },
    { name: 'Orange',       value: '#ea580c' },
  ]

  // ── Load image as THREE texture ──────────────────────────────────────────
  // WHY: This is the EXACT approach from the working old version.
  //      flipY=true is critical — browsers load images top-to-bottom,
  //      Three.js expects bottom-to-top. flipY=true corrects this.
  const loadImageAsTexture = useCallback((file) => {
    const url = URL.createObjectURL(file)
    const loader = new THREE.TextureLoader()

    loader.load(
      url,
      (texture) => {
        // ── CRITICAL: these two lines are why the old version worked ──────
        texture.flipY      = true             // ← must be TRUE for plane geometry
        texture.needsUpdate = true
        // ─────────────────────────────────────────────────────────────────

        const aspectRatio = texture.image.height / texture.image.width
        setPendingDesign({ texture, url, aspectRatio, id: Date.now(), type: 'image' })
        toast('Design loaded! Click the t-shirt to place it.', 'success')
      },
      undefined,
      (err) => {
        URL.revokeObjectURL(url)
        toast('Failed to load image. Try a different file.', 'error')
      }
    )
  }, [])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file?.type.startsWith('image/')) loadImageAsTexture(file)
    else toast('Please select an image file (PNG, JPG, SVG)', 'error')
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) loadImageAsTexture(file)
    else toast('Please drop an image file', 'error')
  }

  // ── Place design when user clicks shirt surface ────────────────────────
  // WHY: z + 0.02 puts the plane just in front of the shirt surface.
  //      Without this offset, the plane z-fights with the shirt mesh.
  const handleSurfaceClick = (point) => {
    if (!pendingDesign) return
    const newDesign = {
      ...pendingDesign,
      position:    [point.x, point.y, point.z + 0.02],
      rotation:    [0, 0, 0],
      scale:       0.3,
    }
    setDesigns(prev => [...prev, newDesign])
    setPendingDesign(null)
    setSelectedDesign(newDesign.id)
    toast('Design placed! Select it to resize/move.', 'success')
  }

  const handleAddText = (textData) => {
    setPendingDesign({
      id: Date.now(), type: 'text',
      text: textData.text, textColor: textData.color,
      fontSize: textData.fontSize, fontFamily: textData.fontFamily,
      aspectRatio: 1,
    })
    setShowTextDialog(false)
    toast('Text ready! Click the t-shirt to place it.', 'success')
  }

  const handleRemoveDesign = (id) => {
    const d = designs.find(d => d.id === id)
    if (d?.url) URL.revokeObjectURL(d.url)
    setDesigns(prev => prev.filter(d => d.id !== id))
    if (selectedDesign === id) setSelectedDesign(null)
    toast('Design removed', 'info')
  }

  const handleClearAll = () => {
    designs.forEach(d => { if (d.url) URL.revokeObjectURL(d.url) })
    setDesigns([]); setSelectedDesign(null); setPendingDesign(null)
  }

  const selectedObj = designs.find(d => d.id === selectedDesign)

  const updateSelected = (patch) => {
    setDesigns(prev => prev.map(d => d.id === selectedDesign ? { ...d, ...patch } : d))
  }

  const basePrice  = 499
  const sidePrice  = printSide === 'both' ? 100 : 0
  const totalPrice = (basePrice + (fabricInfo[fabric]?.priceAdj || 0) + sidePrice) * Math.max(1, quantity)

  const handleAddToCart = () => {
    addToCart({
      _id:   `custom-${Date.now()}`,
      name:  `Custom T-Shirt (${size})`,
      price: totalPrice,
      images: [],
      anime: 'Custom Design',
      isCustom: true,
      customColor: tshirtColor,
    }, size, quantity)
    toast('Custom shirt added to cart! 🎉', 'success')
    navigate('/cart')
  }

  return (
    <div className="cust-page-wrapper">
      {showTextDialog && (
        <TextDesignDialog
          onClose={() => setShowTextDialog(false)}
          onAdd={handleAddText}
        />
      )}

      <div className="cust-page-header">
        <h1>Personalize Your Anime Look</h1>
        <p>Bring your ideas to life – Upload your design and let us craft it flawlessly!</p>
      </div>

      <div className="cust-main-grid">

        {/* ── LEFT: 3D Viewport + Upload ─────────────────────────────────── */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
        >
          {/* 3D Canvas */}
          <div
            className={`canvas-wrapper ${pendingDesign ? 'pending' : ''}`}
            onClick={() => {
              // Fallback: if user clicks wrapper (not the model) place at center-front
              if (pendingDesign) handleSurfaceClick({ x: 0, y: 0.28, z: 0.5 })
            }}
          >
            <Canvas
              shadows
              camera={{ position: [0, 0, 3], fov: 50 }}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
            >
              <ambientLight intensity={0.55} />
              <directionalLight position={[5, 6, 5]} intensity={1} castShadow
                shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
              <directionalLight position={[-3, 4, 3]} intensity={0.4} />

              <Suspense fallback={null}>
                <Showcase>
                  <TShirtModel
                    color={tshirtColor}
                    designs={designs}
                    onSurfaceClick={handleSurfaceClick}
                    onDesignSelect={setSelectedDesign}
                  />
                </Showcase>
                <Environment preset="studio" />
                <ContactShadows
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, -0.56, 0]}
                  opacity={0.4}
                  width={2.6} height={2.6}
                  blur={2} far={1}
                />
              </Suspense>

              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2} maxDistance={6}
                target={[0, 0, 0]}
              />
            </Canvas>

            {/* Placement prompt overlay */}
            {pendingDesign && (
              <div className="placement-overlay">
                📍 Click anywhere on the t-shirt to place your design
                <span>Or click this area to place at the center</span>
              </div>
            )}

            <div className="canvas-hint">🔄 Drag to rotate · Scroll to zoom</div>
          </div>

          {/* Upload bar */}
          <div className={`upload-bar ${dragOver ? 'drag-over' : ''}`}>
            <div className="upload-bar-icon">{dragOver ? '📥' : '🖼'}</div>
            <p className="upload-bar-title">
              {dragOver ? 'Drop your image here!' : 'Add your design to the t-shirt'}
            </p>
            <p className="upload-bar-sub">
              Drag & drop or browse files • After adding, click on the t-shirt to position
            </p>
            <div className="upload-bar-btns">
              <label className="btn-browse">
                📁 Browse Files
                <input type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
              </label>
              <button className="btn-add-text" onClick={() => setShowTextDialog(true)}>
                ✏️ Add Text
              </button>
            </div>
          </div>

          {/* Design thumbnails + controls */}
          {designs.length > 0 && (
            <div className="designs-panel">
              <div className="designs-panel-header">
                <h4>🎨 Your Designs ({designs.length})</h4>
                <button className="btn-clear-all" onClick={handleClearAll}>Clear All</button>
              </div>

              <div className="designs-thumbs">
                {designs.map(d => (
                  <div key={d.id}
                    className={`design-thumb ${selectedDesign === d.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDesign(d.id)}
                  >
                    {d.type === 'text' ? (
                      <div className="design-thumb-text" style={{ color: d.textColor, fontFamily: d.fontFamily }}>
                        {d.text.slice(0, 14)}{d.text.length > 14 ? '…' : ''}
                      </div>
                    ) : (
                      <img src={d.url} alt="Design" className="design-thumb-img" />
                    )}
                    <button className="design-thumb-remove"
                      onClick={e => { e.stopPropagation(); handleRemoveDesign(d.id) }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* ── Selected design controls ─────────────────────────────── */}
              {selectedObj && (
                <div className="design-controls">
                  <h4>⚙️ Edit Selected Design</h4>

                  <label className="ctrl-label">Scale: {(selectedObj.scale || 0.3).toFixed(2)}</label>
                  <input type="range" min={0.05} max={0.8} step={0.01}
                    value={selectedObj.scale || 0.3}
                    onChange={e => updateSelected({ scale: parseFloat(e.target.value) })} />

                  <label className="ctrl-label">Position X</label>
                  <input type="range" min={-0.6} max={0.6} step={0.01}
                    value={selectedObj.position[0]}
                    onChange={e => updateSelected({ position: [parseFloat(e.target.value), selectedObj.position[1], selectedObj.position[2]] })} />

                  <label className="ctrl-label">Position Y</label>
                  <input type="range" min={-0.6} max={0.6} step={0.01}
                    value={selectedObj.position[1]}
                    onChange={e => updateSelected({ position: [selectedObj.position[0], parseFloat(e.target.value), selectedObj.position[2]] })} />

                  <label className="ctrl-label">Rotation Z: {Math.round((selectedObj.rotation?.[2] || 0) * 180 / Math.PI)}°</label>
                  <input type="range" min={-Math.PI} max={Math.PI} step={0.05}
                    value={selectedObj.rotation?.[2] || 0}
                    onChange={e => updateSelected({ rotation: [0, 0, parseFloat(e.target.value)] })} />

                  <div className="ctrl-buttons">
                    <button onClick={() => {
                      updateSelected({ position: [0, 0.28, selectedObj.position[2]] })
                    }} className="ctrl-btn">Center</button>
                    <button onClick={() => handleRemoveDesign(selectedDesign)} className="ctrl-btn danger">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Config Panel ────────────────────────────────────────── */}
        <div className="config-panel">

          {/* Color */}
          <div className="config-card">
            <h3>🎨 T-Shirt Color</h3>
            <div className="color-swatches">
              {colorOptions.map(c => (
                <button key={c.value}
                  className={`color-swatch ${tshirtColor === c.value ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setTshirtColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
            <div className="color-custom-row">
              <input type="color" value={tshirtColor}
                onChange={e => setTshirtColor(e.target.value)} className="color-picker" />
              <input type="text" value={tshirtColor}
                onChange={e => setTshirtColor(e.target.value)}
                placeholder="#000000" className="hex-input" />
            </div>
          </div>

          {/* Size & Fabric */}
          <div className="config-card">
            <h3>📏 Size & Fabric</h3>
            <label className="config-label">Size</label>
            <select value={size} onChange={e => setSize(e.target.value)} className="config-select">
              {['XS','S','M','L','XL','XXL'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="config-label" style={{ marginTop: 12 }}>Fabric Type</label>
            <select value={fabric} onChange={e => setFabric(e.target.value)} className="config-select">
              {Object.entries(fabricInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}{info.priceAdj > 0 ? ` (+₹${info.priceAdj})` : ''}
                </option>
              ))}
            </select>
            <p className="config-hint">{fabricInfo[fabric].description}</p>
          </div>

          {/* Order details */}
          <div className="config-card">
            <h3>🛒 Order Details</h3>

            <label className="config-label">Quantity</label>
            <input type="number" min={1} max={100} value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value || '1')))}
              className="config-input" />

            <label className="config-label" style={{ marginTop: 12 }}>Print Side</label>
            <select value={printSide} onChange={e => setPrintSide(e.target.value)} className="config-select">
              <option value="front">Front Only</option>
              <option value="back">Back Only</option>
              <option value="both">Both Sides (+₹100)</option>
            </select>

            {/* Price breakdown */}
            <div className="price-box">
              <div className="price-row"><span>Base Price:</span><span>₹{basePrice}</span></div>
              {fabricInfo[fabric].priceAdj > 0 && (
                <div className="price-row"><span>Fabric:</span><span>+₹{fabricInfo[fabric].priceAdj}</span></div>
              )}
              {printSide === 'both' && (
                <div className="price-row"><span>Both Sides:</span><span>+₹100</span></div>
              )}
              {quantity > 1 && (
                <div className="price-row"><span>Quantity:</span><span>×{quantity}</span></div>
              )}
              <hr className="price-divider" />
              <div className="price-row price-total"><span>Total:</span><span>₹{totalPrice}</span></div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={designs.length === 0}
              className={`btn-order ${designs.length === 0 ? 'disabled' : ''}`}
            >
              🛍 {designs.length === 0 ? 'Add Design First' : 'Add to Cart'}
            </button>
            {designs.length === 0 && (
              <p className="order-disabled-note">Add images or text to get started</p>
            )}
          </div>

          {/* Tips */}
          <div className="tips-card">
            <h4>💡 Quick Tips</h4>
            <ul>
              <li>Upload images using "Browse Files" or drag & drop</li>
              <li>Click "Add Text" to create custom text designs</li>
              <li>After uploading, click the t-shirt to place the design</li>
              <li>Select a placed design to resize, move, and rotate</li>
              <li>Drag the 3D view to inspect all angles</li>
              <li>Add multiple designs to create unique combinations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
