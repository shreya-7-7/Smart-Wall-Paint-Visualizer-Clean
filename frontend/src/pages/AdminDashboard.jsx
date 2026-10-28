import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { NAV_ITEMS } from '../components/AdminLayout'
import { SectionCards } from '@/components/section-cards'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import './AdminDashboard.css'
import './Dashboard.css'

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="1" />
    <circle cx="14" cy="7" r="1" />
    <circle cx="16" cy="14" r="1" />
    <circle cx="9" cy="16" r="1" />
  </svg>
)

const StudioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const quickActionsPaintVisualizer = [
  {
    icon: <PaletteIcon />,
    title: 'Paint Palettes',
    desc: 'Manage curated color swatches and catalog collections',
    btn: 'Manage Palettes',
    primary: true,
    path: '/admin/paint-palettes',
  },
  {
    icon: <StudioIcon />,
    title: 'Paint Studio',
    desc: 'Open room visualizer to simulate real wall colors & textures',
    btn: 'Launch Studio',
    primary: false,
    path: '/paint-visualizer',
  },
  {
    icon: <UsersIcon />,
    title: 'Manage Users',
    desc: 'Review registered accounts, customer profiles, and roles',
    btn: 'View Users',
    primary: false,
    path: '/admin/users',
  },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [userCount, setUserCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [paletteCount, setPaletteCount] = useState(0)
  const [makeovers, setMakeovers] = useState([])
  const [loading, setLoading] = useState(true)
  const [makeoverIdx, setMakeoverIdx] = useState(0)

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const isAdmin = Boolean(token && (role === 'admin' || storedUser?.role === 'admin'))

  const initials = storedUser.name
    ? storedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login', { replace: true })
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // 1. Fetch user & revenue stats
        try {
          const statsRes = await API.get('/admin/stats')
          if (statsRes.data) {
            setUserCount(statsRes.data.userCount ?? 0)
            setTotalRevenue(statsRes.data.totalRevenue ?? 0)
          }
        } catch (_) { }

        // 2. Fetch paint palettes count
        try {
          const palRes = await API.get('/paint/palettes')
          if (palRes.data?.palettes) {
            setPaletteCount(palRes.data.palettes.length)
          }
        } catch (_) { }

        // 3. Fetch saved paint makeover visualizations
        try {
          const desRes = await API.get('/paint/designs?all=true')
          if (desRes.data?.designs && Array.isArray(desRes.data.designs)) {
            setMakeovers(desRes.data.designs)
          }
        } catch (_) { }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAdmin, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    navigate('/admin-login')
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="admin-layout">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="admin-sidebar-brand">
            Admin Panel
            <span>Smart Wall Paint Visualizer</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="View Profile">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">{storedUser.name || 'Admin'}</div>
              <div className="admin-sidebar-user-email">{storedUser.email || ''}</div>
            </div>
            <button className="admin-sidebar-logout" onClick={e => { e.stopPropagation(); handleLogout() }} title="Log out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <span className="admin-topbar-title">Dashboard</span>
        </div>

        <div className="admin-content">
          {/* ── Quick Actions (Smart Wall Paint Visualizer shortcuts) ── */}
          <section className="db-section">
            <h2 className="db-section-title">Quick Actions</h2>
            <div className="db-actions-grid">
              {quickActionsPaintVisualizer.map((action, i) => (
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

          {/* ── Admin Stats ── */}
          <SectionCards userCount={userCount} paletteCount={paletteCount} totalRevenue={totalRevenue} />
          <ChartAreaInteractive />

          {/* ── Recent Paint Makeovers (Smart Wall Paint Visualizer Designs) ── */}
          <section className="db-section">
            <div className="db-section-header">
              <div>
                <h2 className="db-section-title">Recent Paint Makeovers</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B645C' }}>
                  Wall-paint visualizer room designs saved by users and studio visitors.
                </p>
              </div>
              {makeovers.length > 2 && (
                <div className="db-nav-btns">
                  <button
                    className="db-nav-btn"
                    disabled={makeoverIdx === 0}
                    onClick={() => setMakeoverIdx(i => Math.max(0, i - 1))}
                    aria-label="Previous"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    className="db-nav-btn"
                    disabled={makeoverIdx + 2 >= makeovers.length}
                    onClick={() => setMakeoverIdx(i => Math.min(makeovers.length - 2, i + 1))}
                    aria-label="Next"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>

            <div className="db-designs-grid">
              {makeovers.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -2',
                    padding: '36px 24px',
                    background: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E5E0D8',
                    textAlign: 'center',
                    color: '#6B645C',
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1F1D1A', margin: '0 0 6px' }}>
                    No Paint Makeovers Saved Yet
                  </p>
                  <p style={{ fontSize: 13, margin: '0 0 16px' }}>
                    Designs created in the Paint Studio will automatically be displayed here.
                  </p>
                  <button
                    type="button"
                    className="db-btn-primary"
                    onClick={() => navigate('/paint-visualizer')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <StudioIcon /> Open Paint Studio
                  </button>
                </div>
              ) : (
                makeovers.slice(makeoverIdx, makeoverIdx + 2).map((makeover) => (
                  <div key={makeover._id || makeover.id} className="db-design-card">
                    <div className="db-design-img-wrap" style={{ overflow: 'hidden', height: 160, position: 'relative' }}>
                      {makeover.thumbnail || makeover.roomImage ? (
                        <img
                          src={makeover.thumbnail || makeover.roomImage}
                          alt={makeover.name || 'Room Makeover'}
                          className="db-design-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#F4EFEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C827A' }}>
                          <StudioIcon />
                        </div>
                      )}
                      <span className="db-design-tag" style={{ background: makeover.primaryColor || '#FF6B53', color: '#FFFFFF' }}>
                        {makeover.primaryColorName || 'Painted'}
                      </span>
                    </div>
                    <div className="db-design-body">
                      <p className="db-design-title">{makeover.name || 'Room Makeover'}</p>
                      <p className="db-design-meta">
                        {makeover.updatedAt
                          ? `Saved: ${new Date(makeover.updatedAt).toLocaleDateString()}`
                          : makeover.finish
                          ? `Finish: ${makeover.finish}`
                          : 'Wall Paint Design'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          type="button"
                          className="db-btn-primary db-design-btn"
                          style={{ flex: 1, padding: '8px 0', fontSize: '12px' }}
                          onClick={() => navigate('/paint-visualizer')}
                        >
                          Open in Studio
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Stats Card */}
              <div className="db-stats-card">
                <div className="db-stats-row">
                  <div className="db-stat">
                    <span className="db-stat-value">{makeovers.length}</span>
                    <span className="db-stat-label">Total Saved Makeovers</span>
                  </div>
                </div>
                <hr className="db-stats-divider" />
                <div className="db-stats-footer">
                  <PaletteIcon />
                  <span>
                    Last saved:{' '}
                    <strong>
                      {makeovers.length > 0 ? (makeovers[0].name || 'Room Makeover') : 'None'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
