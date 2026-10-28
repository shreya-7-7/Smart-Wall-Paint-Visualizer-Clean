import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import './Profile.css'

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const UserIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const MailIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

function InlineMessage({ type, message }) {
  if (!message) return null
  return (
    <div className={`profile-msg ${type}`}>
      {type === 'success' ? <CheckIcon /> : <AlertIcon />}
      {message}
    </div>
  )
}

const Profile = () => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [user, setUser] = useState({ name: '', email: '', role: '' })
  const [editedUser, setEditedUser] = useState({ name: '', email: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const role = localStorage.getItem('role')
    setUser({ ...userData, role })
    setEditedUser({ name: userData.name || '', email: userData.email || '' })
  }, [])

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleCancel = () => {
    setIsEditing(false)
    setEditedUser({ name: user.name, email: user.email })
    setProfileMsg({ type: '', text: '' })
  }

  const handleUpdate = async () => {
    if (!editedUser.name || !editedUser.email) {
      setProfileMsg({ type: 'error', text: 'Name and email are required.' })
      return
    }
    setIsLoading(true)
    setProfileMsg({ type: '', text: '' })
    try {
      await API.put('/auth/profile', editedUser)
      const updatedUser = { ...user, name: editedUser.name, email: editedUser.email }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
    } catch (error) {
      setProfileMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setIsLoading(true)
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' })
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      await API.delete('/auth/profile')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      navigate('/register')
    } catch {
      setShowDeleteConfirm(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Page Header */}
        <div className="profile-page-header">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1 className="profile-page-title">My Profile</h1>
            <p className="profile-page-sub">Manage your account settings</p>
          </div>
        </div>

        {/* Avatar Banner */}
        <div className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-banner-info">
              <p className="profile-banner-name">{user.name}</p>
              <p className="profile-banner-email">{user.email}</p>
            </div>
            <span className="profile-role-badge">{user.role}</span>
          </div>
        </div>

        {/* Profile Information */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <p className="profile-card-title">Profile Information</p>
              <p className="profile-card-desc">Update your name and email address</p>
            </div>
            {!isEditing ? (
              <button className="profile-btn-outline" onClick={() => setIsEditing(true)}>
                <PencilIcon /> Edit
              </button>
            ) : (
              <div className="profile-btn-row">
                <button className="profile-btn-primary" onClick={handleUpdate} disabled={isLoading}>
                  <SaveIcon /> {isLoading ? 'Saving…' : 'Save'}
                </button>
                <button className="profile-btn-outline" onClick={handleCancel}>
                  <XIcon /> Cancel
                </button>
              </div>
            )}
          </div>
          <hr className="profile-card-divider" />
          <div className="profile-card-body">
            {profileMsg.text && <InlineMessage type={profileMsg.type} message={profileMsg.text} />}
            <div className="profile-field">
              <label className="profile-field-label"><UserIcon /> Name</label>
              {isEditing
                ? <input className="profile-input" value={editedUser.name} onChange={e => setEditedUser({ ...editedUser, name: e.target.value })} placeholder="Your name" />
                : <p className="profile-field-value">{user.name || '—'}</p>}
            </div>
            <div className="profile-field">
              <label className="profile-field-label"><MailIcon /> Email</label>
              {isEditing
                ? <input className="profile-input" type="email" value={editedUser.email} onChange={e => setEditedUser({ ...editedUser, email: e.target.value })} placeholder="your@email.com" />
                : <p className="profile-field-value">{user.email || '—'}</p>}
            </div>
          </div>
        </div>

        {/* Security / Change Password */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <p className="profile-card-title">Security</p>
              <p className="profile-card-desc">Change your account password</p>
            </div>
            {!showPasswordForm && (
              <button className="profile-btn-outline" onClick={() => setShowPasswordForm(true)}>
                <LockIcon /> Change Password
              </button>
            )}
          </div>
          {(showPasswordForm || passwordMsg.text) && (
            <>
              <hr className="profile-card-divider" />
              <div className="profile-card-body">
                {passwordMsg.text && <InlineMessage type={passwordMsg.type} message={passwordMsg.text} />}
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="profile-form">
                    <div className="profile-field">
                      <label className="profile-field-label">Current Password</label>
                      <input className="profile-input" type="password" placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </div>
                    <div className="profile-field">
                      <label className="profile-field-label">New Password</label>
                      <input className="profile-input" type="password" placeholder="Min. 8 characters"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                    </div>
                    <div className="profile-field">
                      <label className="profile-field-label">Confirm New Password</label>
                      <input className="profile-input" type="password" placeholder="Re-enter new password"
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                    </div>
                    <div className="profile-btn-row" style={{ paddingTop: 4 }}>
                      <button type="submit" className="profile-btn-primary" disabled={isLoading}>
                        {isLoading ? 'Updating…' : 'Update Password'}
                      </button>
                      <button type="button" className="profile-btn-outline" onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                        setPasswordMsg({ type: '', text: '' })
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div className="profile-card danger">
          <div className="profile-card-header">
            <div>
              <p className="profile-danger-title"><ShieldIcon /> Danger Zone</p>
              <p className="profile-card-desc">Once you delete your account, there is no going back.</p>
            </div>
          </div>
          <hr className="profile-card-divider" />
          <div className="profile-card-body">
            {!showDeleteConfirm ? (
              <button className="profile-btn-danger" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading}>
                Delete Account
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
                <div className="profile-danger-warn">
                  Are you sure? This will permanently delete your account and all associated data.
                </div>
                <div className="profile-btn-row">
                  <button className="profile-btn-danger" onClick={handleDeleteAccount} disabled={isLoading}>
                    {isLoading ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                  <button className="profile-btn-outline" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile
