import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import './AdminDashboard.css'

const FurnitureManagement = () => {
  const [furniture, setFurniture] = useState([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchFurniture()
  }, [])

  const fetchFurniture = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/furniture')
      setFurniture(res.data)
    } catch (err) {
      console.error('Error fetching furniture:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this item?')) return
    try {
      await axios.delete(`http://localhost:5001/api/furniture/${id}`)
      fetchFurniture()
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  const filtered = furniture.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Manage Furniture">
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <span className="admin-table-title">Furniture Items</span>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <div className="admin-table-actions">
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
            <button className="admin-add-btn" onClick={() => navigate('/admin/add')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Furniture
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>No furniture items found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, border: '1px solid #F3EDE6',
                          overflow: 'hidden', background: '#FAF8F5', flexShrink: 0
                        }}>
                          <img
                            src={item.imagePath}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</span>
                      </div>
                    </td>
                    <td><span className="admin-cat-badge">{item.category}</span></td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>Rs. {item.price?.toLocaleString()}</td>
                    <td><span className="admin-status-badge">Active</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          className="admin-action-btn"
                          style={{ color: '#8B7355', borderColor: '#DDD6CE' }}
                          onClick={() => navigate(`/admin/edit/${item._id}`)}
                        >Edit</button>
                        <button
                          className="admin-action-btn"
                          style={{ color: '#EF4444', borderColor: '#FECACA' }}
                          onClick={() => handleDelete(item._id)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default FurnitureManagement
