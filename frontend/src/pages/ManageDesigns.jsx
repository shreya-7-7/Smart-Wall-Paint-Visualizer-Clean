import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { getDesignsList, deleteDesign, getDesignOverrides, setDesignOverrides, resetDesignOverrides } from '../data/designSamples'
import './AdminDashboard.css'

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Apartment', 'Open Plan', 'Lounge', 'Master Bedroom', 'General']

const ManageDesigns = () => {
  const navigate = useNavigate()
  const [designs, setDesigns] = useState([])
  const [search, setSearch] = useState('')
  const [editingDesign, setEditingDesign] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', tag: '' })

  const refreshDesigns = () => {
    setDesigns(getDesignsList())
  }

  useEffect(() => {
    refreshDesigns()
    const handleStorage = () => refreshDesigns()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const filtered = designs.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.tag?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (design) => {
    navigate('/designer', { state: { designId: design.id, title: design.title } })
  }

  const handleUpdate = (design) => {
    setEditingDesign(design)
    setEditForm({ title: design.title, tag: design.tag || '' })
  }

  const handleSaveUpdate = () => {
    if (!editingDesign) return
    const overrides = getDesignOverrides()
    overrides.updates[editingDesign.id] = { title: editForm.title, tag: editForm.tag }
    setDesignOverrides(overrides)
    setEditingDesign(null)
    refreshDesigns()
    window.dispatchEvent(new CustomEvent('designs-updated'))
  }

  const handleDelete = (design) => {
    if (window.confirm(`Delete "${design.title}"? This will remove it from the designs catalog.`)) {
      deleteDesign(design.id)
      refreshDesigns()
      window.dispatchEvent(new CustomEvent('designs-updated'))
    }
  }

  return (
    <AdminLayout title="Manage Designs">
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <span className="admin-table-title">Design Directory</span>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
              {filtered.length} design{filtered.length !== 1 ? 's' : ''} found
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
                placeholder="Search designs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="admin-add-btn" onClick={() => navigate('/designer')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Design
            </button>
            {(getDesignOverrides().deletedIds?.length > 0 || Object.keys(getDesignOverrides().updates || {}).length > 0 || Object.keys(getDesignOverrides().layouts || {}).length > 0) && (
              <button
                className="admin-action-btn"
                onClick={() => {
                  if (window.confirm('Reset all design changes? This will restore deleted designs and revert metadata updates.')) {
                    resetDesignOverrides()
                    refreshDesigns()
                    window.dispatchEvent(new CustomEvent('designs-updated'))
                  }
                }}
                style={{ marginLeft: 8 }}
              >
                Reset to Default
              </button>
            )}
          </div>
        </div>

        <div className="admin-table-wrap">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>No designs found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Last Edited</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((design) => (
                  <tr key={design.id}>
                    <td style={{ fontWeight: 500 }}>{design.title}</td>
                    <td>
                      <span className="admin-cat-badge">{design.tag || '—'}</span>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: 13 }}>{design.lastEdited || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="admin-action-btn edit" onClick={() => handleEdit(design)}>Edit</button>
                        <button className="admin-action-btn edit" onClick={() => handleUpdate(design)}>Update</button>
                        <button className="admin-action-btn delete" onClick={() => handleDelete(design)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Update modal */}
      {editingDesign && (
        <div className="admin-modal-overlay" onClick={() => setEditingDesign(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Update Design</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="admin-table-search"
                  style={{ width: '100%', padding: '10px 12px' }}
                  placeholder="Design title"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Category</label>
                <input
                  type="text"
                  value={editForm.tag}
                  onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))}
                  className="admin-table-search"
                  style={{ width: '100%', padding: '10px 12px' }}
                  placeholder="e.g. Living Room, Bedroom"
                  list="design-categories"
                />
                <datalist id="design-categories">
                  {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="admin-action-btn" onClick={() => setEditingDesign(null)}>Cancel</button>
              <button className="admin-add-btn" onClick={handleSaveUpdate} style={{ padding: '8px 16px' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default ManageDesigns
