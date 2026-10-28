import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import FurnitureCard from '../components/FurnitureCard'
import './FurnitureCatalog.css'

const CATEGORIES = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Storage']

const CardSkeleton = () => (
  <div className="catalog-skeleton-card">
    <div className="catalog-skeleton-img" />
    <div className="catalog-skeleton-body">
      <div className="catalog-skeleton-line" style={{ width: '70%' }} />
      <div className="catalog-skeleton-line" style={{ width: '40%' }} />
      <div className="catalog-skeleton-line" style={{ width: '55%', marginTop: 4 }} />
    </div>
  </div>
)

const FurnitureCatalog = () => {
  const [furnitureItems, setFurnitureItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setLoading(true)
        const res = await axios.get('http://localhost:5001/api/furniture')
        setFurnitureItems(res.data)
      } catch (err) {
        console.error('Error fetching furniture data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFurniture()
  }, [])

  const filteredAndSortedItems = furnitureItems
    .filter(item => {
      if (!item || !item.name) return false
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const priceA = a.price ? parseInt(String(a.price).replace(/,/g, '')) : 0
      const priceB = b.price ? parseInt(String(b.price).replace(/,/g, '')) : 0
      if (sortBy === 'priceLow') return priceA - priceB
      if (sortBy === 'priceHigh') return priceB - priceA
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return 0
    })

  return (
    <div className="catalog-page">
      <Navbar />

      {/* Hero */}
      <section className="catalog-hero" style={{ paddingTop: '120px' }}>
        <h1 className="catalog-hero-title">Furniture Catalog</h1>
        <p className="catalog-hero-sub">
          Explore premium 3D furniture assets crafted for your interior design projects.
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
                placeholder="Search furniture..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="catalog-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
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
          {loading
            ? 'Loading products…'
            : `Showing ${filteredAndSortedItems.length} product${filteredAndSortedItems.length !== 1 ? 's' : ''}`}
        </p>

        <div className="catalog-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : filteredAndSortedItems.length > 0
              ? filteredAndSortedItems.map(item => (
                  <FurnitureCard
                    key={item._id || item.id}
                    item={item}
                    onViewDetails={selected => navigate(`/product/${selected._id || selected.id}`)}
                  />
                ))
              : (
                <div className="catalog-empty">
                  <div className="catalog-empty-icon">🪑</div>
                  <h3>No products found</h3>
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
  )
}

export default FurnitureCatalog
