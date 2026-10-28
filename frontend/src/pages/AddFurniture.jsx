import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminLayout } from '../components/AdminLayout'
import './AdminDashboard.css'

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen']

const AddFurniture = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: 'chair',
    category: 'Living Room',
    price: '',
    description: '',
    material: '',
    modelPath: '/assets/models/',
    imagePath: '/assets/images/',
    dimensions: { width: '', depth: '', height: '' },
  })

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
      const finalData = {
        ...formData,
        price: Number(formData.price),
        dimensions: {
          width: Number(formData.dimensions.width),
          depth: Number(formData.dimensions.depth),
          height: Number(formData.dimensions.height),
        },
      }
      await axios.post('http://localhost:5001/api/furniture', finalData)
      toast.success('Furniture added successfully!')
      navigate('/admin/furniture-management')
    } catch (_) {
      toast.error('Error: Check if all fields are filled correctly.')
    }
  }

  return (
    <AdminLayout title="Add New Furniture">
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
                  placeholder="e.g. Classic Armchair"
                  onChange={handleChange} required
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="category">Category</label>
                <select
                  id="category" name="category" className="admin-form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="price">Price (Rs.)</label>
                <input
                  id="price" name="price" type="number" className="admin-form-input"
                  placeholder="45000"
                  onChange={handleChange} required
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="material">Material / Finish</label>
                <input
                  id="material" name="material" className="admin-form-input"
                  placeholder="Solid Teak / Velvet"
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-field admin-form-grid-span2">
                <label className="admin-form-label" htmlFor="description">Description</label>
                <textarea
                  id="description" name="description" rows={4} className="admin-form-textarea"
                  placeholder="Describe the material, comfort, and style..."
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
                <input id="dim_width" name="dim_width" type="number" className="admin-form-input" placeholder="e.g. 80" onChange={handleChange} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="dim_depth">Depth (cm)</label>
                <input id="dim_depth" name="dim_depth" type="number" className="admin-form-input" placeholder="e.g. 70" onChange={handleChange} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" htmlFor="dim_height">Height (cm)</label>
                <input id="dim_height" name="dim_height" type="number" className="admin-form-input" placeholder="e.g. 90" onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Asset Configuration */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <p className="admin-form-card-title">Asset Configuration</p>
            <p className="admin-form-card-desc">Paths to the 3D model and preview image</p>
          </div>
          <div className="admin-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-form-field">
              <label className="admin-form-label" htmlFor="modelPath">3D Model Path (.glb)</label>
              <input
                id="modelPath" name="modelPath" className="admin-form-input mono"
                defaultValue="/assets/models/"
                onChange={handleChange} required
              />
            </div>
            <div className="admin-form-field">
              <label className="admin-form-label" htmlFor="imagePath">Image Path (.png)</label>
              <input
                id="imagePath" name="imagePath" className="admin-form-input mono"
                defaultValue="/assets/images/"
                onChange={handleChange} required
              />
            </div>
          </div>
        </div>

        <div className="admin-form-actions" style={{ paddingBottom: 8 }}>
          <button type="submit" className="admin-form-btn-primary">Publish Product</button>
          <button type="button" className="admin-form-btn-outline" onClick={() => navigate('/admin/furniture-management')}>Cancel</button>
        </div>

      </form>
    </AdminLayout>
  )
}

export default AddFurniture
