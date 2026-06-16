'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setStatus('Creating account access profile...')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/crm/auth/callback`,
      },
    })

    setIsLoading(false)
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Success! Please check your email inbox to verify your account registration.')
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-md mx-auto pt-20 px-6 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">CREATE ACCOUNT</h1>
        <p className="text-slate-400 text-sm font-medium mb-8 uppercase tracking-widest">Enterprise Access Portal</p>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <form onSubmit={handleSignUp} className="space-y-4 text-left">
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
                required
                disabled={isLoading}
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
                required
                disabled={isLoading}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 disabled:scale-100 transition-all cursor-pointer"
            >
              Register Access Profile
            </button>
          </form>

          {status && <p className="mt-6 text-xs font-bold text-blue-600 text-center animate-pulse">{status}</p>}
        </div>
      </main>
    </div>
  )
}
