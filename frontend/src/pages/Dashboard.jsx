import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import DesignThumbnail from '../components/DesignThumbnail'
import './Dashboard.css'

const LayoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 5h5l-4 3 1.5 5-4-3-4 3 1.5-5-4-3h5z" />
  </svg>
)

const recentDesigns = [
  { id: 1, title: 'Living Room Layout', lastEdited: 'Today', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', tag: 'Living Room' },
  { id: 2, title: 'Bedroom Design', lastEdited: 'Yesterday', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80', tag: 'Bedroom' },
  { id: 3, title: 'Modern Apartment', lastEdited: '4 days ago', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80', tag: 'Apartment' },
]

const quickActions = [
  {
    icon: <PlusIcon />,
    title: 'New Layout',
    desc: 'Start designing a room from scratch',
    btn: 'Create Layout',
    primary: true,
    path: '/designer',
  },
  {
    icon: <WalletIcon />,
    title: 'Purchase History',
    desc: 'View your past orders & receipts',
    btn: 'View History',
    primary: false,
    path: '/purchase-history',
  },
  {
    icon: <FolderIcon />,
    title: 'My Designs',
    desc: 'Browse and manage saved layouts',
    btn: 'Open Designs',
    primary: false,
    path: '/my-designs',
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Guest')
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [designIdx, setDesignIdx] = useState(0)

  const fetchDesigns = React.useCallback((showLoading = true) => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      setLoading(false)
      return
    }
    try {
      const userObj = JSON.parse(storedUser)
      setUserName(userObj.name || 'User')
      const userId = userObj.id || userObj._id
      if (!userId) {
        setLoading(false)
        return
      }
      if (showLoading) setLoading(true)
      axios.get(`http://localhost:5001/api/designs/user/${userId}`)
        .then(res => {
          setDesigns(res.data || [])
        })
        .catch(err => {
          console.error("Dashboard fetch error:", err)
        })
        .finally(() => setLoading(false))
    } catch {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDesigns(true)
  }, [fetchDesigns])

  // Refetch when user returns to this tab (e.g. after saving in Designer)
  useEffect(() => {
    const onFocus = () => fetchDesigns(false)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchDesigns])

  // Refetch when a design is saved (Designer dispatches this event)
  useEffect(() => {
    const onDesignsUpdated = () => fetchDesigns(false)
    window.addEventListener('designs-updated', onDesignsUpdated)
    return () => window.removeEventListener('designs-updated', onDesignsUpdated)
  }, [fetchDesigns])

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Deduplicate designs by name to keep "Recent Designs" section diverse
  // Since designs are already sorted by lastEdited (from API), the first one we see is the newest
  const getUniqueDesigns = (list) => {
    const seen = new Set();
    return list.filter(d => {
      const name = d.name || d.title;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  };

  // Use real designs if available, otherwise fallback to placeholders
  const displayDesigns = designs.length > 0 ? getUniqueDesigns(designs) : recentDesigns
  const visibleDesigns = displayDesigns.slice(designIdx, designIdx + 2)

  // Real Stats
  const totalDesignsCount = designs.length
  const lastEditedName = designs.length > 0 ? (designs[0].name || 'Untitled') : 'None'

  return (
    <div className="db-page">
      <Navbar />

      <div className="db-content">

        {/* ── Hero Welcome ── */}
        <section className="db-hero">
          <div className="db-hero-inner">
            <div className="db-hero-text">
              <div className="db-hero-label">
                <SparkleIcon /> Your workspace
              </div>
              <h1 className="db-hero-title">Welcome back, {userName}</h1>
              <p className="db-hero-sub">
                Pick up where you left off or start something new today.
              </p>
              <button className="db-hero-btn" onClick={() => navigate('/catalog')}>
                Browse Catalog <ChevronRightIcon />
              </button>
            </div>
            <div className="db-hero-avatar">{initials}</div>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="db-section">
          <h2 className="db-section-title">Quick Actions</h2>
          <div className="db-actions-grid">
            {quickActions.map((action, i) => (
              <div key={i} className={`db-action-card${action.primary ? ' db-action-card--primary' : ''}`}>
                <div className="db-action-icon">{action.icon}</div>
                <div className="db-action-body">
                  <p className="db-action-title">{action.title}</p>
                  <p className="db-action-desc">{action.desc}</p>
                </div>
                <button
                  className={action.primary ? 'db-btn-primary' : 'db-btn-outline'}
                  onClick={() => action.path && navigate(action.path)}
                >
                  {action.btn}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent Designs ── */}
        <section className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Recent Designs</h2>
            <div className="db-nav-btns">
              <button
                className="db-nav-btn"
                disabled={designIdx === 0}
                onClick={() => setDesignIdx(i => Math.max(0, i - 1))}
                aria-label="Previous"
              >
                <ChevronLeftIcon />
              </button>
              <button
                className="db-nav-btn"
                disabled={designIdx + 2 >= displayDesigns.length}
                onClick={() => setDesignIdx(i => Math.min(displayDesigns.length - 2, i + 1))}
                aria-label="Next"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <div className="db-designs-grid">
            {visibleDesigns.map(design => {
              const isApiDesign = !!design._id
              const openInDesigner = () => {
                if (isApiDesign) {
                  navigate(`/designer?id=${design._id}`)
                } else {
                  navigate('/designer', { state: { designId: design.id } })
                }
              }
              return (
                <div
                  key={design._id || design.id}
                  className="db-design-card"
                  onClick={openInDesigner}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="db-design-img-wrap" style={{ overflow: 'hidden' }}>
                    <DesignThumbnail
                      designId={design._id || design.id}
                      designData={isApiDesign ? design : null}
                      className="db-design-img"
                    />
                    <span className="db-design-tag">{design.tag || '2D Layout'}</span>
                  </div>
                  <div className="db-design-body">
                    <p className="db-design-title">{design.name || design.title}</p>
                    <p className="db-design-meta">
                      {design.lastEdited
                        ? `Last edited: ${typeof design.lastEdited === 'number' || design.lastEdited instanceof Date ? new Date(design.lastEdited).toLocaleDateString() : design.lastEdited}`
                        : 'Last edited: —'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="db-btn-outline db-design-btn" style={{ flex: 1, padding: '8px 0' }} onClick={e => { e.stopPropagation(); openInDesigner() }}>Edit Plan</button>
                      <button
                        className="db-btn-primary db-design-btn"
                        style={{ flex: 1, padding: '8px 0', fontSize: '12px' }}
                        onClick={e => {
                          e.stopPropagation();
                          navigate('/viewer', {
                            state: {
                              roomSize: design.roomSize,
                              furniture: design.furniture || [],
                              designId: design._id || null
                            }
                          })
                        }}
                      >
                        View in 3D
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Real stats card */}
            <div className="db-stats-card">
              <div className="db-stats-row">
                <div className="db-stat">
                  <span className="db-stat-value">{totalDesignsCount}</span>
                  <span className="db-stat-label">Total Saved Designs</span>
                </div>
              </div>
              <hr className="db-stats-divider" />
              <div className="db-stats-footer">
                <LayoutIcon />
                <span>Last edited: <strong>{lastEditedName}</strong></span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Dashboard
