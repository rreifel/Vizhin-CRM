'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

export default function BrandingSettings() {
  const [xmlInput, setXmlInput] = useState('')
  const [savedXml, setSavedXml] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPartnerBranding()
  }, [])

  async function loadPartnerBranding() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No active session found.")

      // Use RPC to get branding to ensure we bypass RLS issues on read too
      const { data: logoXml } = await supabase.rpc('get_my_custom_logo')
      
      setCurrentUser({ email: user.email, id: user.id, role: 'Partner Admin' })

      if (logoXml) {
        setSavedXml(logoXml)
        setXmlInput(logoXml)
      }
    } catch (err: any) {
      setStatus(`Error loading profile: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Transmitting vector configuration block...')

    try {
      const cleanXml = xmlInput.trim() || null

      // Call our secure database function to bypass RLS filters on save
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('save_my_custom_logo', {
        p_logo_xml: cleanXml
      })

      if (rpcErr) throw rpcErr

      setSavedXml(cleanXml)
      setStatus('Success! Branding changes saved to database.')
      
      // Force a page refresh to update the global Navbar immediately
      window.location.reload()
    } catch (err: any) {
      setStatus(`FAIL: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Account Configuration</h1>
          <p className="text-sm text-slate-400 mt-1">Manage corporate profiles and visual white-labeling.</p>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 italic animate-pulse">
            Authenticating tenant secure layers...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Authenticated Scope</p>
                <p className="font-bold text-slate-800 text-lg">{currentUser?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Account ID: {currentUser?.id?.slice(0, 8)}...</p>
              </div>
              <span className="text-xs font-black tracking-wider uppercase px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-xl">
                Partner Admin
              </span>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">White-Label Vector Graphics</h2>
                <p className="text-xs text-slate-400 mt-0.5">Paste raw XML code strings to overwrite standard navigation assets with custom logos.</p>
              </div>

              {savedXml && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Logo Preview</label>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center items-center h-24 max-w-xs mx-auto">
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: savedXml }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">SVG Vector Code (XML Markup)</label>
                  <textarea
                    value={xmlInput}
                    onChange={(e) => setXmlInput(e.target.value)}
                    rows={8}
                    className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-purple-500 font-mono text-xs bg-slate-50/50 transition-colors resize-none"
                    placeholder="<svg>...</svg>"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-black transition-all cursor-pointer"
                  >
                    Commit Branding Setup
                  </button>
                </div>
              </form>

              {status && (
                <div className={`p-4 rounded-xl text-xs font-bold text-center border-2 ${
                  status.includes('FAIL') || status.includes('Error') 
                    ? 'bg-red-50 border-red-100 text-red-600' 
                    : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  {status}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
