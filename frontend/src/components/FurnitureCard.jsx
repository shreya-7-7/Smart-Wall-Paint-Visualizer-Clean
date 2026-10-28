import React from 'react'
import '../pages/FurnitureCatalog.css'

const FurnitureCard = ({ item, onViewDetails }) => {
  if (!item || !item.name) return null

  return (
    <div className="fcard" onClick={() => onViewDetails(item)}>
      {/* Image */}
      <div className="fcard-img-wrap">
        <img src={item.imagePath || ''} alt={item.name} className="fcard-img" />
        <span className="fcard-badge">{item.category || 'Uncategorized'}</span>
      </div>

      {/* Body */}
      <div className="fcard-body">
        <div className="fcard-top">
          <h3 className="fcard-name">{item.name}</h3>
          <span className="fcard-price">
            Rs.&nbsp;{item.price ? Number(item.price).toLocaleString() : '0'}
          </span>
        </div>

        <div className="fcard-dims">
          <span>W: {item.dimensions?.width || '—'}cm</span>
          <span>D: {item.dimensions?.depth || '—'}cm</span>
          <span>H: {item.dimensions?.height || '—'}cm</span>
        </div>

        <div className="fcard-actions">
          <button
            className="fcard-btn-primary"
            onClick={e => { e.stopPropagation(); onViewDetails(item) }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default FurnitureCard
