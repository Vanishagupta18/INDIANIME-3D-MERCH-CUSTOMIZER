/**
 * ControlsPanel.jsx — FIXED
 *
 * Changes from your uploaded version:
 * 1. onUploadDesign prop now just triggers the file dialog (parent owns the ref)
 *    This fixes the ref being null because the input was rendered inside this
 *    component but the ref was created in Customize.jsx
 * 2. Removed internal fileInputRef — file input is owned by Customize.jsx
 * 3. onFileChange prop added for drag-and-drop passthrough
 * 4. AI button uses onOpenAI prop (already correct in your version)
 */

import { useState } from 'react'
import PlacementSelector from './PlacementSelector'

const TABS = [
  { id: 'color',     icon: '🎨', label: 'Color'     },
  { id: 'design',    icon: '🖼',  label: 'Design'    },
  { id: 'text',      icon: '✏️',  label: 'Text'      },
  { id: 'placement', icon: '📍', label: 'Placement' },
]

const PRESET_COLORS = [
  '#ffffff','#111111','#cc0000','#1a2744','#1f3d1f',
  '#3d1a6e','#c94a00','#006db3','#c0186b','#6b6b6b',
  '#f5e6d0','#2a4a3e','#4a2020','#1a1a3e','#3d3000',
]

export default function ControlsPanel({
  state,
  update,
  updateDecal,
  onUploadDesign,   // triggers file dialog (parent-owned input)
  onFileChange,     // handles the actual file change event (for drag-drop)
  onClearDesign,
  onOpenAI,
  onAddToCart,
}) {
  const [activeTab, setActiveTab] = useState('color')

  return (
    <div className="cust-panel">
      <div className="panel-header">
        <h2>CUSTOMIZER</h2>
        <p>Design your anime tee in 3D</p>
      </div>

      <div className="panel-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ptab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="panel-body">
        {activeTab === 'color' && (
          <ColorTab
            color={state.color}
            onChange={c => update({ color: c })}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab
            designUrl={state.designUrl}
            decal={state.decal}
            onUpload={onUploadDesign}
            onFileChange={onFileChange}
            onClear={onClearDesign}
            onDecalChange={updateDecal}
            onOpenAI={onOpenAI}
          />
        )}

        {activeTab === 'text' && (
          <TextTab
            text={state.designText}
            textColor={state.textColor}
            fontSize={state.fontSize}
            onChange={update}
          />
        )}

        {activeTab === 'placement' && (
          <PlacementSelector
            value={state.placement}
            onChange={p => update({ placement: p })}
          />
        )}
      </div>

      <div className="panel-footer">
        <button className="btn-order" onClick={onAddToCart}>
          🛒 Add Custom Shirt to Cart &nbsp;₹1,999
        </button>
        <p className="order-note">Premium 100% cotton · Ships in 7–10 days</p>
      </div>
    </div>
  )
}

// ── Color tab ─────────────────────────────────────────────────────────────────
function ColorTab({ color, onChange }) {
  return (
    <div className="tab-section">
      <label className="section-label">T-Shirt Color</label>
      <div className="color-grid">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            className={`color-dot ${color === c ? 'selected' : ''}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            title={c}
          />
        ))}
      </div>
      <div className="custom-color-row">
        <label className="section-label" style={{ marginBottom: 0 }}>Custom</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={color}
            onChange={e => onChange(e.target.value)}
            className="color-picker-input"
          />
          <input
            type="text"
            value={color}
            onChange={e =>
              /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)
            }
            className="hex-input"
            placeholder="#ffffff"
          />
        </div>
      </div>
    </div>
  )
}

// ── Design tab ────────────────────────────────────────────────────────────────
function DesignTab({
  designUrl, decal,
  onUpload,      // triggers parent-owned file input dialog
  onFileChange,  // handles drag-drop file
  onClear,
  onDecalChange,
  onOpenAI,
}) {
  return (
    <div className="tab-section">
      <label className="section-label">Upload Design</label>

      {/* Drag-and-drop zone */}
      <div
        className="upload-zone"
        onClick={onUpload}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onFileChange(file)   // pass raw File object
        }}
      >
        {designUrl ? (
          <img
            src={designUrl}
            alt="Design preview"
            style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4 }}
          />
        ) : (
          <>
            <span style={{ fontSize: 32 }}>📁</span>
            <p>Click or drag & drop</p>
            <span className="upload-hint">PNG, JPG, SVG — transparent PNG recommended</span>
          </>
        )}
      </div>

      <button className="ai-generate-btn" onClick={onOpenAI}
        style={{ width: '100%', marginTop: 8 }}>
        ✨ Generate with AI
      </button>

      {designUrl && (
        <>
          <button className="btn-clear" onClick={onClear}>✕ Remove design</button>

          <div className="decal-controls">
            <label className="section-label">
              Position X &nbsp;
              <span style={{ color: '#aaa', fontFamily: 'monospace' }}>
                {Math.round(decal.x * 100)}%
              </span>
            </label>
            <input type="range" min={0.1} max={0.9} step={0.01} value={decal.x}
              onChange={e => onDecalChange({ x: parseFloat(e.target.value) })} />

            <label className="section-label">
              Position Y &nbsp;
              <span style={{ color: '#aaa', fontFamily: 'monospace' }}>
                {Math.round(decal.y * 100)}%
              </span>
            </label>
            <input type="range" min={0.1} max={0.9} step={0.01} value={decal.y}
              onChange={e => onDecalChange({ y: parseFloat(e.target.value) })} />

            <label className="section-label">
              Scale &nbsp;
              <span style={{ color: '#aaa', fontFamily: 'monospace' }}>
                {Math.round(decal.scale * 100)}%
              </span>
            </label>
            <input type="range" min={0.05} max={0.6} step={0.01} value={decal.scale}
              onChange={e => onDecalChange({ scale: parseFloat(e.target.value) })} />

            <label className="section-label">
              Rotation &nbsp;
              <span style={{ color: '#aaa', fontFamily: 'monospace' }}>
                {decal.rotation}°
              </span>
            </label>
            <input type="range" min={-180} max={180} step={1} value={decal.rotation}
              onChange={e => onDecalChange({ rotation: parseFloat(e.target.value) })} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Text tab ──────────────────────────────────────────────────────────────────
function TextTab({ text, textColor, fontSize, onChange }) {
  return (
    <div className="tab-section">
      <label className="section-label">Your Text</label>
      <textarea
        className="text-input"
        value={text}
        onChange={e => onChange({ designText: e.target.value })}
        placeholder="e.g. HOKAGE, ONE PIECE..."
        rows={3}
        maxLength={40}
      />
      <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
        {text.length}/40 characters
      </p>

      <label className="section-label" style={{ marginTop: 16 }}>Text Color</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={textColor}
          onChange={e => onChange({ textColor: e.target.value })}
          className="color-picker-input"
        />
        <span style={{ fontSize: 13, color: '#666' }}>{textColor}</span>
      </div>

      <label className="section-label" style={{ marginTop: 16 }}>
        Font Size: {fontSize}px
      </label>
      <input
        type="range" min={24} max={96} step={4} value={fontSize}
        onChange={e => onChange({ fontSize: parseInt(e.target.value, 10) })}
      />

      {text && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: '#1a1a1a',
          border: '1px solid #333',
          textAlign: 'center',
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: Math.min(fontSize, 40),
          color: textColor,
          letterSpacing: '0.1em',
        }}>
          {text.toUpperCase()}
        </div>
      )}
    </div>
  )
}