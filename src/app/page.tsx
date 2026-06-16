'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function VizhinLanding() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ company: '', name: '', email: '' })
  const [status, setStatus] = useState('')
  const supabase = createClient()

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending request...')
    const { error } = await supabase.from('onboarding_requests').insert([
      { company_name: formData.company, contact_name: formData.name, contact_email: formData.email }
    ])
    if (error) {
      setStatus('Error: ' + error.message)
    } else {
      setStatus('Success! Ric Reifel will review your request shortly.')
      setFormData({ company: '', name: '', email: '' })
      setTimeout(() => {
        setModalOpen(false)
        setStatus('')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="relative flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-slate-100">
        <div className="flex items-center">
          <img src="/logo.png" alt="Vizhin Logo" className="h-11 w-auto object-contain" />
        </div>

        {/* Vizhin CRM Dropdown Button */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            Vizhin CRM
            <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu Items */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50">
              <a 
                href="https://vercel.app" 
                className="flex items-center px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                Log In
              </a>
              <button 
                onClick={() => { setModalOpen(true); setDropdownOpen(false); }} 
                className="w-full flex items-center px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-t border-slate-100 transition-colors text-left"
              >
                Request Account
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Feature Content */}
      <main className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-600 mb-6 border border-blue-100">
          <span>Enterprise Tenant Framework Active</span>
        </div>

        <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          A Better Way Forward for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-slate-900">
            Multi-Tenant Sales Operations
          </span>
        </h1>

        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Secure client sandboxes, custom role hierarchies, and dynamic pricing ledger controls mapped securely under explicit corporate tenant structures.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setModalOpen(true)} 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-0.5"
          >
            Get Started with Vizhin
          </button>
        </div>
      </main>

      {/* Request Account Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full relative">
            <button 
              onClick={() => setModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-2 text-slate-800 text-center">Request an Account</h2>
            <p className="text-sm text-slate-400 mb-6 text-center">Submit your details to create a dedicated client tenant space.</p>
            
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="e.g. Wobo, Inc." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrator Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Sarah Jenkins" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="sarah@company.com" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Submit Application
              </button>
            </form>

            {status && (
              <div className={`mt-6 p-3 rounded-lg text-sm font-medium text-center ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
                {status}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
