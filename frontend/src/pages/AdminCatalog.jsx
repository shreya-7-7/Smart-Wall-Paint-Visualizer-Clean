import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import './AdminDashboard.css'

const CATEGORIES = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Storage']

const AdminCatalog = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setLoading(true)
        const res = await axios.get('http://localhost:5001/api/furniture')
        setItems(res.data)
      } catch (err) {
        console.error('Error fetching furniture:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFurniture()
  }, [])

  const filtered = items
    .filter(item => {
      if (!item || !item.name) return false
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const priceA = a.price ? parseInt(String(a.price).replace(/,/g, '')) : 0
      const priceB = b.price ? parseInt(String(b.price).replace(/,/g, '')) : 0
      if (sortBy === 'priceLow') return priceA - priceB
      if (sortBy === 'priceHigh') return priceB - priceA
      return 0
    })

  return (
    <AdminLayout title="Catalog">
      {/* Controls bar */}
      <div className="admin-table-card" style={{ marginBottom: 20 }}>
        <div className="admin-table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="admin-table-title">Furniture Catalog</span>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
              {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: 10, color: '#C9A882', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="admin-table-search"
                style={{ paddingLeft: 32 }}
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Sort */}
            <select
              className="admin-form-select"
              style={{ width: 'auto', minWidth: 160, padding: '7px 12px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
            {/* Add button */}
            <button className="admin-add-btn" onClick={() => navigate('/admin/add')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Furniture
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: selectedCategory === cat ? 'none' : '1.5px solid #DDD6CE',
                background: selectedCategory === cat
                  ? 'linear-gradient(135deg, #8B7355 0%, #A0826D 100%)'
                  : '#fff',
                color: selectedCategory === cat ? '#fff' : '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>Loading products…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>No products found.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 18,
        }}>
          {filtered.map(item => (
            <div
              key={item._id}
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #F3EDE6',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(139,115,85,0.06)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,115,85,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(139,115,85,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
              onClick={() => navigate(`/product/${item._id}`)}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: 160, background: '#FAF8F5', overflow: 'hidden' }}>
                <img
                  src={item.imagePath || ''}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onError={e => { e.target.style.display = 'none' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <span style={{
                  position: 'absolute', top: 10, left: 10,
                  background: 'rgba(139,115,85,0.85)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                }}>
                  {item.category || 'Uncategorized'}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1F2937', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8B7355', marginBottom: 10 }}>
                  Rs. {item.price?.toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      width: '100%', padding: '7px 0', borderRadius: 9, border: 'none',
                      background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 100%)',
                      color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'opacity 0.2s, transform 0.2s',
                    }}
                    onClick={e => { e.stopPropagation(); navigate(`/product/${item._id}`) }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminCatalog
