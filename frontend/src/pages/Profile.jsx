import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/users/me/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      toast.success('Password changed successfully')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setShowPasswordForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      </div>

      {/* Profile Information Card */}
      <div className="card p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-slate-900 font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-slate-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Role</label>
            <p className="text-slate-900">
              <span className={`badge ${user?.role === 'manager' ? 'bg-violet-100 text-violet-800' : user?.role === 'staff' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {user?.role}
              </span>
            </p>
          </div>
          {user?.role === 'tenant' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-slate-900">{user?.phone || '–'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-slate-900">{user?.address || '–'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Security</h3>
        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)} 
            className="btn-primary"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input 
                type="password" 
                required 
                className="input-field" 
                value={passwordForm.current_password} 
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} 
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input 
                type="password" 
                required 
                className="input-field" 
                value={passwordForm.new_password} 
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} 
                placeholder="Enter your new password (min. 6 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input 
                type="password" 
                required 
                className="input-field" 
                value={passwordForm.confirm_password} 
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} 
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowPasswordForm(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
