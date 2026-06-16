'use client'

import { createClient } from '@/utils/supabase'
import { useState } from 'react'

/**
 * Sign-Up Page Component
 * Handles user registration using Supabase Auth.
 */
export default function SignUp() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Creates the user in Supabase Auth
    // Redirects to /auth/callback for PKCE flow support
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: `${location.origin}/auth/callback` 
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created successfully! You are now logged in.')
    }
    setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-sm mx-auto bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h1>
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input 
            id="email"
            name="email"
            type="email" 
            placeholder="your@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-full p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          <input 
            id="password"
            name="password"
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors disabled:bg-blue-300"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium text-blue-600">{message}</p>}
    </div>
  )
}
