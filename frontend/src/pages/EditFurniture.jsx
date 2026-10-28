import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminLayout } from '../components/AdminLayout'
import './AdminDashboard.css'

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen']

const EditFurniture = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: 'Living Room',
    price: '',
    description: '',
    material: '',
    modelPath: '',
    imagePath: '',
    dimensions: { width: '', depth: '', height: '' },
  })

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/furniture/${id}`)
        setFormData(res.data)
      } catch (err) {
        console.error('Error fetching item:', err)
      }
    }
    fetchItem()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('dim_')) {
      const dimKey = name.split('_')[1]
      setFormData((prev) => ({ ...prev, dimensions: { ...prev.dimensions, [dimKey]: value } }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updatedData = {
        ...formData,
        price: Number(formData.price),
        dimensions: {
          width: Number(formData.dimensions?.width),
          depth: Number(formData.dimensions?.depth),
          height: Number(formData.dimensions?.height),
        },
      }
      await axios.put(`http://localhost:5001/api/furniture/${id}`, updatedData)
      toast.success('Update Successful!')
      navigate('/admin/furniture-management')
    } catch (_) {
      toast.error('Update failed. Check server logs.')
    }
  }

  return (
    <AdminLayout title="Edit Furniture">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

        {/* Product Information */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <p className="admin-form-card-title">Product Information</p>
            <p className="admin-form-card-desc">Basic details about the furniture item</p>
          </div>
          <div className="admin-form-card-body">
            <div className="admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="name">Product Name</label>
                <input
                  id="name" name="name" className="admin-form-input"
                  value={formData.name || ''}
                  onChange={handleChange} required
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="category">Category</label>
                <select
                  id="category" name="category" className="admin-form-select"
                  value={formData.category || 'Living Room'}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="price">Price (Rs.)</label>
                <input
                  id="price" name="price" type="number" className="admin-form-input"
                  value={formData.price || ''}
                  onChange={handleChange} required
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="material">Material / Finish</label>
                <input
                  id="material" name="material" className="admin-form-input"
                  value={formData.material || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-field admin-form-grid-span2">
                <label className="admin-form-label" htmlFor="description">Description</label>
                <textarea
                  id="description" name="description" rows={4} className="admin-form-textarea"
                  value={formData.description || ''}
                  onChange={handleChange} required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <p className="admin-form-card-title">Dimensions</p>
            <p className="admin-form-card-desc">Product measurements in centimeters</p>
          </div>
          <div className="admin-form-card-body">
            <div className="admin-form-grid-3">
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="dim_width">Width (cm)</label>
                <input id="dim_width" name="dim_width" type="number" className="admin-form-input" placeholder="W" value={formData.dimensions?.width || ''} onChange={handleChange} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="dim_depth">Depth (cm)</label>
                <input id="dim_depth" name="dim_depth" type="number" className="admin-form-input" placeholder="D" value={formData.dimensions?.depth || ''} onChange={handleChange} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="dim_height">Height (cm)</label>
                <input id="dim_height" name="dim_height" type="number" className="admin-form-input" placeholder="H" value={formData.dimensions?.height || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Path Configuration */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <p className="admin-form-card-title">Path Configuration</p>
            <p className="admin-form-card-desc">Paths to the 3D model and preview image</p>
          </div>
          <div className="admin-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-form-field">
              <label className="admin-form-label" htmlFor="modelPath">3D Model Path (.glb)</label>
              <input
                id="modelPath" name="modelPath" className="admin-form-input mono"
                value={formData.modelPath || ''}
                onChange={handleChange} required
              />
            </div>
            <div className="admin-form-field">
              <label className="admin-form-label" htmlFor="imagePath">Image Path (.png)</label>
              <input
                id="imagePath" name="imagePath" className="admin-form-input mono"
                value={formData.imagePath || ''}
                onChange={handleChange} required
              />
            </div>
          </div>
        </div>

        <div className="admin-form-actions" style={{ paddingBottom: 8 }}>
          <button type="submit" className="admin-form-btn-primary">Save Changes</button>
          <button type="button" className="admin-form-btn-outline" onClick={() => navigate('/admin/furniture-management')}>Cancel</button>
        </div>

      </form>
    </AdminLayout>
  )
}

export default EditFurniture
