/**
 * AIDesignPanel.jsx
 *
 * WHY: AI design suggestions dramatically differentiate this from
 * generic customizers. We mock the API call structure so it's trivially
 * swappable for a real OpenAI/DALL-E or Stable Diffusion integration.
 *
 * Real integration: replace `generateMockDesigns()` with your actual API call.
 * The component contract (onSelect, onClose) stays the same.
 */
import { useState, useCallback } from 'react'
import './AIDesignPanel.css'

// ── Mock design data (replace with actual API) ────────────────────────────────
// In production, call: POST /api/ai-design { keyword, style }
// Returns: [{ id, title, description, previewUrl, fullUrl }]
const MOCK_DESIGNS = [
  {
    id: 1,
    title: 'Baryon Mode Burst',
    description: 'Naruto in golden baryon aura, ink-brush style',
    emoji: '🦊',
    bgColor: '#2a1500',
    accentColor: '#ff8c00',
    previewUrl: '/images/baryon3.jpeg',
  },
  {
    id: 2,
    title: 'Infinity Void',
    description: 'Gojo Satoru domain expansion, dark purple cosmic',
    emoji: '♾️',
    bgColor: '#150020',
    accentColor: '#8a2be2',
    previewUrl: '/images/mahagora3.jpeg',
  },
  {
    id: 3,
    title: 'Straw Hat Legend',
    description: 'Luffy Gear 5 with jolly roger, bold streetwear',
    emoji: '🏴‍☠️',
    bgColor: '#001520',
    accentColor: '#ff3333',
    previewUrl: '/images/gear3.jpeg',
  },
  {
    id: 4,
    title: 'Thunder Breathing',
    description: 'Zenitsu lightning form, electric yellow & black',
    emoji: '⚡',
    bgColor: '#1a1500',
    accentColor: '#ffe000',
    previewUrl: '/images/zoro3.jpeg',
  },
  {
    id: 5,
    title: 'King of Hell',
    description: 'Zoro three-sword style, dark samurai aesthetic',
    emoji: '⚔️',
    bgColor: '#0a0a0a',
    accentColor: '#00cc44',
    previewUrl: '/images/zoro2.jpeg',
  },
  {
    id: 6,
    title: 'Death Note Spiral',
    description: 'L and Light chess motif, gothic black & white',
    emoji: '📓',
    bgColor: '#0a0a0a',
    accentColor: '#ffffff',
    previewUrl: '/images/67681908_0 (1).jpg',
  },
]

async function generateMockDesigns(keyword, style) {
  // ── Simulate API latency ──────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 1800))

  // ── REAL INTEGRATION TEMPLATE ─────────────────────────────────────────────
  // const response = await fetch('/api/ai-design', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json',
  //              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
  //   body: JSON.stringify({ keyword, style, count: 3 })
  // })
  // if (!response.ok) throw new Error('AI service unavailable')
  // return response.json()
  // ─────────────────────────────────────────────────────────────────────────

  // Filter by keyword for demo effect
  if (!keyword) return MOCK_DESIGNS.slice(0, 3)
  const kw = keyword.toLowerCase()
  const filtered = MOCK_DESIGNS.filter(d =>
    d.title.toLowerCase().includes(kw) ||
    d.description.toLowerCase().includes(kw) ||
    kw.length < 2
  )
  return filtered.length > 0 ? filtered.slice(0, 3) : MOCK_DESIGNS.slice(0, 3)
}

const ANIME_STYLES = [
  'Shounen Bold', 'Dark Fantasy', 'Chibi Cute',
  'Ink Brush', 'Neon Cyberpunk', 'Retro 90s',
]

export default function AIDesignPanel({ onSelect, onClose }) {
  const [keyword,  setKeyword]  = useState('')
  const [style,    setStyle]    = useState(ANIME_STYLES[0])
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState([])
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState(null)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError('')
    setResults([])
    setSelected(null)
    try {
      const designs = await generateMockDesigns(keyword, style)
      setResults(designs)
    } catch (e) {
      setError('AI service unavailable. Try again shortly.')
    } finally {
      setLoading(false)
    }
  }, [keyword, style])

  const handleSelect = useCallback((design) => {
    // In production, onSelect receives the actual design URL from the API
    onSelect(design.previewUrl)
  }, [onSelect])

  return (
    <div className="ai-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ai-panel">

        <div className="ai-header">
          <div>
            <h2>✨ AI Design Generator</h2>
            <p>Describe your anime design idea and let AI create it</p>
          </div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-form">
          <div className="ai-field">
            <label>Keyword / Character</label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Naruto, Gojo, One Piece..."
              className="ai-input"
            />
          </div>

          <div className="ai-field">
            <label>Art Style</label>
            <div className="style-chips">
              {ANIME_STYLES.map(s => (
                <button
                  key={s}
                  className={`style-chip ${style === s ? 'active' : ''}`}
                  onClick={() => setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            className="ai-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <><span className="ai-spinner" /> Generating designs...</>
            ) : (
              '✨ Generate 3 Design Ideas'
            )}
          </button>

          {error && <p className="ai-error">{error}</p>}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="ai-results">
            <p className="ai-results-label">
              Choose a design to apply to your shirt:
            </p>
            <div className="ai-cards">
              {results.map(d => (
                <div
                  key={d.id}
                  className={`ai-card ${selected?.id === d.id ? 'selected' : ''}`}
                  style={{ background: d.bgColor, '--accent': d.accentColor }}
                  onClick={() => setSelected(d)}
                >
                  {d.previewUrl ? (
                    <img src={d.previewUrl} alt={d.title}
                      className="ai-card-img"
                      onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="ai-card-emoji">{d.emoji}</div>
                  )}
                  <div className="ai-card-info">
                    <h4 style={{ color: d.accentColor }}>{d.title}</h4>
                    <p>{d.description}</p>
                  </div>
                  {selected?.id === d.id && (
                    <div className="ai-card-check">✓</div>
                  )}
                </div>
              ))}
            </div>

            {selected && (
              <button className="ai-apply-btn" onClick={() => handleSelect(selected)}>
                Apply "{selected.title}" to Shirt →
              </button>
            )}
          </div>
        )}

        <p className="ai-disclaimer">
          ⚠️ Currently showing curated suggestions.
          Connect DALL-E or Stable Diffusion API for live AI generation.
        </p>
      </div>
    </div>
  )
}