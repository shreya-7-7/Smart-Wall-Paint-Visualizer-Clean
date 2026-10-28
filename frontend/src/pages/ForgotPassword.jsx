import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import { toast } from 'sonner'
import API from '../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email is required')
      return
    }
    setIsLoading(true)
    try {
      await API.post('/password/send-otp', { email })
      localStorage.setItem('resetEmail', email)
      toast.success('OTP sent to your email!')
      navigate('/reset-password')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="auth-brand-name">Smart Wall Paint Visualizer</span>
        </div>
        <div className="auth-panel-text">
          <h2 className="auth-panel-title">Reset your password</h2>
          <p className="auth-panel-sub">
            Enter your email address and we'll send you a verification code to reset your password securely.
          </p>
        </div>
        <div className="auth-panel-features">
          {['Room photo upload & analysis', 'Precision polygon wall outlining', 'Realistic lighting & texture blend'].map(f => (
            <div key={f} className="auth-panel-feature">
              <span className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Forgot password?</h1>
            <p className="auth-form-sub">Enter your email to receive a verification code</p>
          </div>

          <form className="auth-form" onSubmit={handleSendOtp}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email Address"
              />
            </div>

            <button className="auth-btn-primary" type="submit" disabled={!email || isLoading}>
              {isLoading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>

          <div className="auth-footer-links">
            <p className="auth-footer-text">
              Remember your password?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
