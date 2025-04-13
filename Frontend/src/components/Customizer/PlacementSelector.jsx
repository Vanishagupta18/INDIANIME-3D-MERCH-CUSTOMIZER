/**
 * PlacementSelector.jsx
 *
 * WHY: A visual placement selector (not just a dropdown) is much more
 * intuitive — users can see WHERE on the shirt they're placing the design.
 * Each zone maps to a named placement key that TShirt3D uses to pick
 * the correct world-space position + rotation for the decal projector.
 */
import './PlacementSelector.css'

const PLACEMENTS = [
  {
    id: 'front',
    label: 'Front',
    icon: '👕',
    description: 'Center chest area',
    svgPath: 'M 30 10 L 70 10 L 80 25 L 20 25 Z',  // shirt front shape hint
  },
  {
    id: 'back',
    label: 'Back',
    icon: '👕',
    description: 'Full back panel',
    svgPath: 'M 30 10 L 70 10 L 80 25 L 20 25 Z',
    flipped: true,
  },
  {
    id: 'left-sleeve',
    label: 'Left Sleeve',
    icon: '💪',
    description: 'Left arm sleeve',
  },
  {
    id: 'right-sleeve',
    label: 'Right Sleeve',
    icon: '💪',
    description: 'Right arm sleeve',
    mirrored: true,
  },
]

export default function PlacementSelector({ value, onChange }) {
  return (
    <div className="placement-section">
      <label className="section-label">Design Placement</label>
      <p className="placement-hint">
        Choose where your design will appear on the shirt.
        The 3D view will rotate to face that area.
      </p>

      <div className="placement-grid">
        {PLACEMENTS.map(p => (
          <button
            key={p.id}
            className={`placement-card ${value === p.id ? 'active' : ''}`}
            onClick={() => onChange(p.id)}
          >
            {/* Shirt silhouette with highlighted zone */}
            <div className="placement-visual">
              <ShirtSilhouette zone={p.id} active={value === p.id} />
            </div>
            <span className="placement-label">{p.label}</span>
            <span className="placement-desc">{p.description}</span>
          </button>
        ))}
      </div>

      <div className="placement-info">
        <div className="info-row">
          <span className="info-icon">📐</span>
          <span>Adjust position, scale & rotation in the <strong>Design</strong> tab</span>
        </div>
        <div className="info-row">
          <span className="info-icon">🔄</span>
          <span>Drag the 3D model to inspect your placement</span>
        </div>
      </div>
    </div>
  )
}

// ── Mini SVG shirt silhouette with zone highlight ─────────────────────────────
function ShirtSilhouette({ zone, active }) {
  const highlight = active ? '#E81C0E' : '#555'
  const fill = active ? 'rgba(232,28,14,0.15)' : 'rgba(255,255,255,0.05)'

  return (
    <svg viewBox="0 0 100 80" width="80" height="64">
      {/* Shirt body */}
      <path
        d="M 20 20 L 10 35 L 20 38 L 20 70 L 80 70 L 80 38 L 90 35 L 80 20 L 65 10 Q 50 18 35 10 Z"
        fill="#2a2a2a" stroke="#444" strokeWidth="1"
      />
      {/* Collar */}
      <path
        d="M 35 10 Q 50 22 65 10"
        fill="none" stroke="#555" strokeWidth="1.5"
      />
      {/* Left sleeve */}
      <path
        d="M 20 20 L 10 35 L 20 38 L 25 25 Z"
        fill={zone === 'left-sleeve' ? fill : '#222'}
        stroke={zone === 'left-sleeve' ? highlight : '#444'}
        strokeWidth={zone === 'left-sleeve' ? 1.5 : 0.5}
      />
      {/* Right sleeve */}
      <path
        d="M 80 20 L 90 35 L 80 38 L 75 25 Z"
        fill={zone === 'right-sleeve' ? fill : '#222'}
        stroke={zone === 'right-sleeve' ? highlight : '#444'}
        strokeWidth={zone === 'right-sleeve' ? 1.5 : 0.5}
      />
      {/* Front zone */}
      {zone === 'front' && (
        <rect x="38" y="30" width="24" height="24" rx="3"
          fill={fill} stroke={highlight} strokeWidth="1.5" strokeDasharray="3 2" />
      )}
      {/* Back zone (shown as hatched overlay) */}
      {zone === 'back' && (
        <>
          <rect x="28" y="28" width="44" height="34" rx="3"
            fill={fill} stroke={highlight} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="50" y="50" textAnchor="middle" fontSize="8" fill={highlight} opacity={0.8}>
            BACK
          </text>
        </>
      )}
    </svg>
  )
}