import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'
import './Payment.css'

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const TruckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userName, setUserName] = useState('User')
  const [cardType, setCardType] = useState('unknown')
  const [formData, setFormData] = useState({ name: '', cardNumber: '', expiry: '', cvv: '' })
  const orderRef = useRef(`IDS-${Math.floor(Math.random() * 90000) + 10000}`)

  const { productName, price, image, category } = location.state || {
    productName: 'Premium Furniture',
    price: 0,
    image: '',
    category: '',
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser)
        setUserName(userObj.name || 'User')
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    const num = formData.cardNumber.replace(/\s/g, '')
    if (num.startsWith('4')) setCardType('visa')
    else if (num.startsWith('5')) setCardType('mastercard')
    else setCardType('unknown')
  }, [formData.cardNumber])

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'cardNumber') {
      setFormData({ ...formData, cardNumber: formatCardNumber(value) })
    } else if (name === 'expiry') {
      setFormData({ ...formData, expiry: formatExpiry(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(async () => {
      try {
        await API.post('/orders', {
          productName,
          price,
          image: image || '',
          category: category || '',
        })
        setIsSuccess(true)
      } catch (error) {
        console.error('Failed to save order:', error)
        setIsSuccess(true)
      } finally {
        setIsProcessing(false)
      }
    }, 2500)
  }

  // ── Success Screen ──────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="pay-page">
        <Navbar />
        <div className="pay-success-wrap">
          <div className="pay-success-card">
            <div className="pay-success-icon">
              <CheckCircleIcon />
            </div>
            <div className="pay-success-badge">Payment Confirmed</div>
            <h1 className="pay-success-title">Thank you, {userName}!</h1>
            <p className="pay-success-sub">
              Your order for <strong>{productName}</strong> has been received and is now being processed.
            </p>
            <div className="pay-success-ref">
              <span className="pay-success-ref-label">Order Reference</span>
              <span className="pay-success-ref-value"># {orderRef.current}</span>
            </div>
            <hr className="pay-success-divider" />
            <div className="pay-success-actions">
              <button className="pay-btn-primary" onClick={() => navigate('/purchase-history')}>
                View Purchase History
              </button>
              <button className="pay-btn-outline" onClick={() => navigate('/catalog')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment Form ────────────────────────────────────────────────
  return (
    <div className="pay-page">
      <Navbar />

      <div className="pay-content">

        {/* Top bar: back + stepper */}
        <div className="pay-topbar">
          <button className="pay-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeftIcon /> Back
          </button>
          <div className="pay-stepper">
            <div className="pay-step pay-step--done">
              <span className="pay-step-dot" />
              <span>Browse</span>
            </div>
            <div className="pay-step-line pay-step-line--done" />
            <div className="pay-step pay-step--done">
              <span className="pay-step-dot" />
              <span>Review</span>
            </div>
            <div className="pay-step-line pay-step-line--done" />
            <div className="pay-step pay-step--active">
              <span className="pay-step-dot" />
              <span>Payment</span>
            </div>
            <div className="pay-step-line" />
            <div className="pay-step">
              <span className="pay-step-dot" />
              <span>Confirm</span>
            </div>
          </div>
        </div>

        <div className="pay-grid">

          {/* ── Left: Payment Form ── */}
          <div className="pay-form-card">

            {/* Card type header */}
            <div className="pay-form-header">
              <div>
                <p className="pay-form-title">Payment Details</p>
                <p className="pay-form-sub">All transactions are encrypted and secure</p>
              </div>
              <div className="pay-card-logos">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                  alt="Visa"
                  className={`pay-card-logo${cardType === 'visa' ? ' active' : ''}`}
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/196/196561.png"
                  alt="Mastercard"
                  className={`pay-card-logo${cardType === 'mastercard' ? ' active' : ''}`}
                />
              </div>
            </div>

            <hr className="pay-divider" />

            <form onSubmit={handlePayment} className="pay-form">

              <div className="pay-field">
                <label className="pay-label">Cardholder Name</label>
                <input
                  className="pay-input"
                  type="text"
                  name="name"
                  placeholder={userName}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="pay-field">
                <label className="pay-label">Card Number</label>
                <div className="pay-input-wrap">
                  <input
                    className="pay-input"
                    type="text"
                    name="cardNumber"
                    placeholder="4000 1234 5678 9010"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength="19"
                    required
                  />
                  <span className="pay-input-icon"><CreditCardIcon /></span>
                </div>
              </div>

              <div className="pay-row">
                <div className="pay-field">
                  <label className="pay-label">Expiry Date</label>
                  <input
                    className="pay-input"
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="pay-field">
                  <label className="pay-label">CVV</label>
                  <input
                    className="pay-input"
                    type="password"
                    name="cvv"
                    placeholder="•••"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="pay-btn-primary pay-submit" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="pay-processing">
                    <span className="pay-spinner" /> Processing…
                  </span>
                ) : (
                  <>
                    <LockIcon /> Pay Rs. {(price || 0).toLocaleString()}
                  </>
                )}
              </button>

              <div className="pay-secure-note">
                <LockIcon /> SSL encrypted &amp; 100% secure demo transaction
              </div>

            </form>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="pay-summary-card">
            <p className="pay-summary-title">Order Summary</p>
            <hr className="pay-divider" />

            {image && (
              <div className="pay-summary-img-wrap">
                <img src={image} alt={productName} className="pay-summary-img" />
              </div>
            )}

            <div className="pay-summary-rows">
              <div className="pay-summary-row">
                <span className="pay-summary-label">Item</span>
                <span className="pay-summary-value">{productName}</span>
              </div>
              {category && (
                <div className="pay-summary-row">
                  <span className="pay-summary-label">
                    <TagIcon /> Category
                  </span>
                  <span className="pay-summary-value">{category}</span>
                </div>
              )}
              <div className="pay-summary-row">
                <span className="pay-summary-label">
                  <TruckIcon /> Shipping
                </span>
                <span className="pay-summary-free">Free</span>
              </div>
            </div>

            <hr className="pay-divider" />

            <div className="pay-total-row">
              <span className="pay-total-label">Grand Total</span>
              <span className="pay-total-value">Rs. {(price || 0).toLocaleString()}</span>
            </div>

            <div className="pay-trust-badge">
              <ShieldIcon /> Verified &amp; Secure Purchase
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Payment
