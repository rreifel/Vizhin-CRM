'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setIsAlreadyLoggedIn(true)
    }
    checkUser()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Verifying credentials...')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      window.location.href = '/crm/test-access'
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setIsAlreadyLoggedIn(false)
    setStatus('Signed out successfully.')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-md mx-auto pt-20 px-6 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">VIZHIN LOGIN</h1>
        <p className="text-slate-400 text-sm font-medium mb-8 uppercase tracking-widest">Enterprise Access Portal</p>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          {isAlreadyLoggedIn ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-700 font-bold text-sm">You are already logged in.</p>
                <p className="text-xs text-blue-500 mt-1">Would you like to continue to your dashboard or switch accounts?</p>
              </div>
              
              <button 
                onClick={() => window.location.href = '/crm/test-access'} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg mb-2 cursor-pointer"
              >
                Go to Dashboard
              </button>
              
              <button 
                onClick={handleSignOut} 
                className="w-full py-4 bg-white text-red-500 border-2 border-red-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 cursor-pointer"
              >
                Sign Out / Switch Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="email@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" 
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              >
                Authorize Access
              </button>
            </form>
          )}

          {status && <p className="mt-6 text-xs font-bold text-blue-600 text-center animate-pulse">{status}</p>}
        </div>
      </main>
    </div>
  )
}
