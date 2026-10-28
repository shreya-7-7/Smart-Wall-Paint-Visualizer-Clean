import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import FurnitureViewer from '../components/FurnitureViewer'
import Navbar from '../components/Navbar'
import './ProductDetails.css'

const FINISH_COLORS = [
  { hex: '#3E2723', label: 'Dark Walnut' },
  { hex: '#795548', label: 'Medium Brown' },
  { hex: '#A1887F', label: 'Light Tan' },
  { hex: '#5D4037', label: 'Mahogany' },
  { hex: '#212121', label: 'Matte Black' },
]

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const RulerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
    <path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>
  </svg>
)

const LoadingSkeleton = () => (
  <div className="pd-page">
    <Navbar />
    <div className="pd-container" style={{ paddingTop: '80px' }}>
      <div className="pd-skeleton-line" style={{ height: 36, width: 130, marginBottom: 36 }} />
      <div className="pd-grid">
        <div className="pd-left">
          <div className="pd-skeleton-line" style={{ height: 420, borderRadius: 20 }} />
          <div className="pd-skeleton-line" style={{ height: 120, borderRadius: 16 }} />
        </div>
        <div className="pd-right">
          <div className="pd-skeleton-line" style={{ height: 22, width: 90, borderRadius: 20 }} />
          <div className="pd-skeleton-line" style={{ height: 36, width: '75%', borderRadius: 10 }} />
          <div className="pd-skeleton-line" style={{ height: 16, width: 140, borderRadius: 8 }} />
          <div className="pd-skeleton-line" style={{ height: 32, width: '50%', borderRadius: 8 }} />
          <div className="pd-skeleton-line" style={{ height: 80, borderRadius: 10 }} />
          <div className="pd-skeleton-line" style={{ height: 100, borderRadius: 14 }} />
          <div className="pd-skeleton-line" style={{ height: 48, borderRadius: 11 }} />
        </div>
      </div>
    </div>
  </div>
)

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(FINISH_COLORS[0].hex)
  const [intensity, setIntensity] = useState(0.6)
  const [environment, setEnvironment] = useState('city')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/furniture/${id}`)
        setItem(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  if (loading || !item) return <LoadingSkeleton />

  const selectedFinish = FINISH_COLORS.find(c => c.hex === selectedColor)

  return (
    <div className="pd-page">
      <Navbar />

      <div className="pd-container" style={{ paddingTop: '90px' }}>

        {/* Back */}
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Catalog
        </button>

        <div className="pd-grid">

          {/* ── Left Column ── */}
          <div className="pd-left">

            {/* 3D Viewer */}
            <div className="pd-viewer-wrap">
              <FurnitureViewer
                modelPath={item.modelPath}
                customColor={selectedColor}
                intensity={intensity}
                environment={environment}
              />
            </div>

            {/* Studio Controls */}
            <div className="pd-controls-card">
              <h4 className="pd-controls-title">
                <span className="pd-controls-dot" />
                Studio Controls
              </h4>
              <div className="pd-controls-grid">
                <div className="pd-control-group">
                  <label className="pd-control-label">
                    Light Intensity — <span>{intensity.toFixed(1)}</span>
                  </label>
                  <input
                    type="range" min="0" max="2" step="0.1"
                    value={intensity}
                    onChange={e => setIntensity(parseFloat(e.target.value))}
                    className="pd-range"
                  />
                </div>
                <div className="pd-control-group">
                  <label className="pd-control-label">Environment</label>
                  <select
                    className="pd-select"
                    value={environment}
                    onChange={e => setEnvironment(e.target.value)}
                  >
                    <option value="city">Urban City</option>
                    <option value="apartment">Modern Apartment</option>
                    <option value="studio">Photo Studio</option>
                    <option value="lobby">Hotel Lobby</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="pd-right">

            {/* Category + Title + Rating */}
            <div>
              <span className="pd-category-badge">{item.category}</span>
            </div>
            <h1 className="pd-title">{item.name}</h1>
            <div className="pd-rating">
              <div className="pd-stars">
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
              </div>
              <span className="pd-rating-text">4.8 · 124 reviews</span>
            </div>

            {/* Price + Stock */}
            <div className="pd-price-row">
              <span className="pd-price">Rs. {item.price.toLocaleString()}</span>
              <div className="pd-stock">
                <span className="pd-stock-dot" />
                In Stock
              </div>
            </div>

            <hr className="pd-divider" />

            {/* Description */}
            <div>
              <p className="pd-section-title">Description</p>
              <p className="pd-description">
                {item.description || 'Crafted with premium materials, this piece offers exceptional comfort and a modern silhouette for any contemporary space.'}
              </p>
            </div>

            {/* Finish Options */}
            <div>
              <div className="pd-finish-header">
                <p className="pd-section-title" style={{ margin: 0 }}>Finish</p>
                <span className="pd-finish-label">{selectedFinish?.label}</span>
              </div>
              <div className="pd-swatches">
                {FINISH_COLORS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    title={label}
                    className="pd-swatch"
                    onClick={() => setSelectedColor(hex)}
                    style={{
                      background: hex,
                      boxShadow: selectedColor === hex
                        ? `0 0 0 2px #fff, 0 0 0 4px ${hex}`
                        : '0 0 0 1px rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="pd-dims-box">
              <div className="pd-dims-header">
                <RulerIcon />
                Dimensions
              </div>
              <div className="pd-dims-grid">
                {[
                  { label: 'Width (cm)', value: item.dimensions?.width },
                  { label: 'Depth (cm)', value: item.dimensions?.depth },
                  { label: 'Height (cm)', value: item.dimensions?.height },
                ].map(({ label, value }) => (
                  <div key={label} className="pd-dim-item">
                    <span className="pd-dim-value">{value ?? '—'}</span>
                    <span className="pd-dim-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material */}
            {item.material && (
              <p className="pd-material">
                <span>Material: </span>{item.material}
              </p>
            )}

            {/* CTA */}
            <div className="pd-actions">
              <button
                className="pd-btn-primary"
                onClick={() => navigate(`/payment/${item._id}`, { 
                  state: { 
                    productName: item.name, 
                    price: item.price, 
                    image: item.imagePath,
                    category: item.category,
                  } 
                })}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails