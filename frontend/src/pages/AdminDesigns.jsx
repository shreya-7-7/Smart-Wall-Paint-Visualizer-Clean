import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import DesignThumbnail from '../components/DesignThumbnail'
import { getDesignsList, getDesignLayout } from '../data/designSamples'
import './FurnitureCatalog.css'
import './Designs.css'

const CATEGORIES = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Apartment', 'Open Plan', 'Lounge', 'Master Bedroom', 'General']

const AdminDesigns = () => {
  const navigate = useNavigate()
  const [designs, setDesigns] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const refresh = () => setDesigns(getDesignsList())
    refresh()
    window.addEventListener('designs-updated', refresh)
    window.addEventListener('storage', refresh)
    const onVisibilityChange = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('designs-updated', refresh)
      window.removeEventListener('storage', refresh)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const filteredDesigns = designs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.tag && d.tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || d.tag === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <AdminLayout title="Designs">
      <div className="catalog-page" style={{ paddingTop: 0 }}>
        {/* Hero */}
        <section className="catalog-hero" style={{ paddingTop: '24px' }}>
          <h1 className="catalog-hero-title">Designs</h1>
          <p className="catalog-hero-sub">
            Browse available designs.
          </p>
        </section>

        {/* Controls */}
        <div className="catalog-controls">
          <div className="catalog-controls-inner">
            <div className="catalog-search-row">
              <div className="catalog-search-wrap">
                <svg className="catalog-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="catalog-search-input"
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="catalog-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`catalog-pill${selectedCategory === cat ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="catalog-body">
          <p className="catalog-count">
            Showing {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}
          </p>

          <div className="catalog-grid">
            {filteredDesigns.length > 0
              ? filteredDesigns.map(design => (
                  <div key={design.id} className="dcard" onClick={() => navigate('/designer', { state: { designId: design.id } })}>
                    <div className="dcard-img-wrap">
                      <DesignThumbnail designId={design.id} className="dcard-img" />
                      <span className="dcard-badge dcard-badge-2d">2D Layout</span>
                    </div>
                    <div className="dcard-body">
                      <h3 className="dcard-title">{design.title}</h3>
                      <p className="dcard-meta">Last edited: {design.lastEdited}</p>
                      <div className="dcard-actions">
                        <button
                          className="dcard-btn dcard-btn-continue"
                          onClick={e => { e.stopPropagation(); navigate('/designer', { state: { designId: design.id, title: design.title, saveToMyDesigns: true } }) }}
                        >
                          Edit Plan
                        </button>
                        <button
                          className="dcard-btn dcard-btn-3d"
                          onClick={e => {
                            e.stopPropagation();
                            const layout = getDesignLayout(design.id);
                            navigate('/viewer', { state: { roomSize: layout.roomSize, furniture: layout.furniture, designId: design.id } });
                          }}
                        >
                          View in 3D
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : (
                  <div className="catalog-empty">
                    <div className="catalog-empty-icon">🎨</div>
                    <h3>No designs found</h3>
                    <p>Try adjusting your search or filter.</p>
                    <button
                      className="catalog-empty-btn"
                      onClick={() => { setSearchTerm(''); setSelectedCategory('All') }}
                    >
                      Clear filters
                    </button>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDesigns
