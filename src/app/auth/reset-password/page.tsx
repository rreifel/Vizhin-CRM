'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')

    if (password !== confirmPassword) {
      setStatus('Error: Passwords do not match.')
      return
    }

    setLoading(true)
    // Updates the authenticated user's credentials with the new password
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Success! Your password has been updated. Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/logo.png" alt="Vizhin CRM" className="mx-auto h-12 w-auto object-contain mb-6" />
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Password</h2>
        <p className="mt-2 text-sm text-slate-500">Enter your secure new credentials below.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 rounded-2xl sm:px-10">
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
          {status && (
            <div className={`mt-5 p-3 rounded-xl text-sm font-medium text-center ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
