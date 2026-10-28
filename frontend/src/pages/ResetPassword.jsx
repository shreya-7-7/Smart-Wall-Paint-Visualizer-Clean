import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import { toast } from 'sonner'
import API from '../services/api'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otp.includes('')) {
      toast.error('Please enter the complete 6-digit code')
      return
    }
    const email = localStorage.getItem('resetEmail')
    const otpString = otp.join('')
    setIsLoading(true)
    try {
      await API.post('/password/verify-otp', { email, otp: otpString })
      navigate('/confirm-password')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
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
          <h2 className="auth-panel-title">Verify your identity</h2>
          <p className="auth-panel-sub">
            Check your email for the 6-digit verification code we just sent you. Enter it below to continue.
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
            <h1 className="auth-form-title">Enter verification code</h1>
            <p className="auth-form-sub">We sent a 6-digit code to your email</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">6-digit code</label>
              <div className="auth-otp-box">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target.value, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    className="auth-otp-input"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button className="auth-btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying…' : 'Verify'}
            </button>
          </form>

          <div className="auth-footer-links">
            <p className="auth-footer-text">
              Didn't receive the code?{' '}
              <Link to="/forgot-password" className="auth-link">Try again</Link>
            </p>
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

export default ResetPassword
