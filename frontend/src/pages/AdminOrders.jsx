import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import API from '../services/api'
import './AdminDashboard.css'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/admin/orders')
        setOrders(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filtered = orders.filter(
    (o) =>
      (o.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filtered.reduce((sum, o) => sum + (Number(o.price) || 0), 0)

  return (
    <AdminLayout title="Order Tracking">
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <span className="admin-table-title">Order Tracking</span>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
              {loading ? 'Loading...' : `${filtered.length} order${filtered.length !== 1 ? 's' : ''} • Total revenue: Rs. ${totalRevenue.toLocaleString()}`}
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
                placeholder="Search by product, customer, email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>Loading orders…</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#EF4444', fontSize: 14 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>No orders found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 500 }}>{order.productName || '—'}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.user?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{order.user?.email || '—'}</div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-cat-badge">{order.category || '—'}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#8B7355' }}>Rs. {(order.price || 0).toLocaleString()}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className="admin-cat-badge" style={{ background: '#D1FAE5', color: '#065F46' }}>
                        Completed
                      </span>
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

export default AdminOrders
