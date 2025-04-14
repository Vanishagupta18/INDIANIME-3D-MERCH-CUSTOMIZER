import { useRef, useState } from 'react'
import PlacementSelector from './PlacementSelector'

const TABS = [
  { id: 'color', icon: '🎨', label: 'Color' },
  { id: 'design', icon: '🖼', label: 'Design' },
  { id: 'text', icon: '✏️', label: 'Text' },
  { id: 'placement', icon: '📍', label: 'Placement' },
]

const PRESET_COLORS = [
  '#ffffff', '#111111', '#cc0000', '#1a2744', '#1f3d1f',
  '#3d1a6e', '#c94a00', '#006db3', '#c0186b', '#6b6b6b',
  '#f5e6d0', '#2a4a3e', '#4a2020', '#1a1a3e', '#3d3000',
]

export default function ControlsPanel({
  state,
  update,
  updateDecal,
  onUploadDesign,
  onClearDesign,
  onOpenAI,
  onAddToCart,
}) {
  const [activeTab, setActiveTab] = useState('color')
  const fileInputRef = useRef(null)

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
            fileInputRef={fileInputRef}
            designUrl={state.designUrl}
            decal={state.decal}
            onUpload={onUploadDesign}
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
          🛒 Add Custom Shirt to Cart &nbsp; ₹1,999
        </button>
        <p className="order-note">Premium 100% cotton · Ships in 7-10 days</p>
      </div>
    </div>
  )
}

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
            onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
            className="hex-input"
            placeholder="#ffffff"
          />
        </div>
      </div>
    </div>
  )
}

function DesignTab({ fileInputRef, designUrl, decal, onUpload, onClear, onDecalChange, onOpenAI }) {
  return (
    <div className="tab-section">
      <label className="section-label">Upload Design</label>

      <div
        className="upload-zone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (!file) return
          onUpload({ target: { files: [file] } })
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onUpload}
      />

      <button className="ai-generate-btn" onClick={onOpenAI}>
        ✨ Generate with AI
      </button>

      {designUrl && (
        <>
          <button className="btn-clear" onClick={onClear}>✕ Remove design</button>
          <div className="decal-controls">
            <label className="section-label">Decal Position X</label>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.01}
              value={decal.x}
              onChange={e => onDecalChange({ x: parseFloat(e.target.value) })}
            />

            <label className="section-label">Decal Position Y</label>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.01}
              value={decal.y}
              onChange={e => onDecalChange({ y: parseFloat(e.target.value) })}
            />

            <label className="section-label">Scale</label>
            <input
              type="range"
              min={0.05}
              max={0.6}
              step={0.01}
              value={decal.scale}
              onChange={e => onDecalChange({ scale: parseFloat(e.target.value) })}
            />

            <label className="section-label">Rotation (°)</label>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={decal.rotation}
              onChange={e => onDecalChange({ rotation: parseFloat(e.target.value) })}
            />
          </div>
        </>
      )}
    </div>
  )
}

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
      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
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
        <span style={{ fontSize: 13, color: '#888' }}>{textColor}</span>
      </div>

      <label className="section-label" style={{ marginTop: 16 }}>
        Font Size: {fontSize}px
      </label>
      <input
        type="range"
        min={24}
        max={96}
        step={4}
        value={fontSize}
        onChange={e => onChange({ fontSize: parseInt(e.target.value, 10) })}
      />
    </div>
  )
}
