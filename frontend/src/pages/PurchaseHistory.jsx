import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'
import './PurchaseHistory.css'

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const ShoppingBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const ReceiptIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <path d="M16 8H8"/><path d="M16 12H8"/><path d="M12 16H8"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const PurchaseHistory = () => {
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders')
        setPurchases(data)
      } catch (err) {
        setError('Failed to load your orders. Please try again.')
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const totalSpent = purchases.reduce((sum, item) => sum + (item.price || 0), 0)

  return (
    <div className="ph-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="ph-hero">
        <div className="ph-hero-inner">
          <div className="ph-hero-toprow">
            <button className="ph-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeftIcon />
            </button>
            <span className="ph-breadcrumb">Dashboard / Purchase History</span>
          </div>
          <div className="ph-hero-text">
            <div className="ph-hero-label">
              <ReceiptIcon /> Order Records
            </div>
            <h1 className="ph-hero-title">Purchase History</h1>
            <p className="ph-hero-sub">
              A complete record of all your furniture orders and transactions.
            </p>
          </div>
        </div>
      </section>

      <div className="ph-content">

        {/* ── Summary Stats ── */}
        {!loading && purchases.length > 0 && (
          <div className="ph-stats-bar">
            <div className="ph-stat">
              <div className="ph-stat-icon ph-stat-icon--brown">
                <BoxIcon />
              </div>
              <div>
                <p className="ph-stat-value">{purchases.length}</p>
                <p className="ph-stat-label">Total Orders</p>
              </div>
            </div>
            <div className="ph-stats-divider" />
            <div className="ph-stat">
              <div className="ph-stat-icon ph-stat-icon--green">
                <WalletIcon />
              </div>
              <div>
                <p className="ph-stat-value">Rs. {totalSpent.toLocaleString()}</p>
                <p className="ph-stat-label">Total Spent</p>
              </div>
            </div>
            <div className="ph-stats-divider" />
            <div className="ph-stat">
              <div className="ph-stat-icon ph-stat-icon--brown">
                <CheckCircleIcon />
              </div>
              <div>
                <p className="ph-stat-value">{purchases.length}</p>
                <p className="ph-stat-label">Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="ph-loading">
            <div className="ph-loading-spinner" />
            <p>Loading your orders…</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="ph-error">
            <p>{error}</p>
            <button className="ph-btn-primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && purchases.length === 0 && (
          <div className="ph-empty">
            <div className="ph-empty-icon">
              <ShoppingBagIcon />
            </div>
            <h3 className="ph-empty-title">No purchases yet</h3>
            <p className="ph-empty-sub">
              Your order history will appear here once you make your first purchase.
            </p>
            <button className="ph-btn-primary" onClick={() => navigate('/catalog')}>
              Browse Catalog
            </button>
          </div>
        )}

        {/* ── Purchase List ── */}
        {!loading && !error && purchases.length > 0 && (
          <>
            <p className="ph-count">
              Showing {purchases.length} order{purchases.length !== 1 ? 's' : ''}
            </p>
            <div className="ph-list">
              {purchases.map((item, index) => (
                <div key={item._id || index} className="ph-card">
                  <div className="ph-card-index">
                    <span>#{purchases.length - index}</span>
                  </div>
                  <div className="ph-card-body">
                    <p className="ph-card-name">{item.productName || 'Furniture Item'}</p>
                    <div className="ph-card-meta">
                      {item.category && (
                        <span className="ph-meta-chip">
                          <TagIcon /> {item.category}
                        </span>
                      )}
                      {item.createdAt && (
                        <span className="ph-meta-chip">
                          <CalendarIcon /> {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ph-card-right">
                    <p className="ph-card-price">Rs. {(item.price || 0).toLocaleString()}</p>
                    <span className="ph-status-badge">
                      <CheckCircleIcon /> Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PurchaseHistory
