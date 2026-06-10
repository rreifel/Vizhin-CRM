'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

export default function GlobalProvisioning() {
  const [mode, setMode] = useState<'Customer' | 'Partner'>('Customer')
  const [orgName, setOrgName] = useState('')
  const [adminName, setOrgAdminName] = useState('')
  const [adminEmail, setOrgAdminEmail] = useState('')
  const [status, setStatus] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        setCurrentUser(profile || { email: user.email, role: 'Super Admin' })
      }
    }
    getSession()
  }, [])

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault()
    const email = adminEmail.trim().toLowerCase()
    setStatus('Sending Signal...')

    try {
      // 1. Send Signal to the Database
      const { error: sigErr } = await supabase.from('provisioning_signal').upsert([{
        email: email,
        full_name: adminName || orgName,
        company_name: orgName,
        role: mode === 'Customer' ? 'System Admin' : 'Partner Admin',
        mode: mode,
        created_by: currentUser?.id 
      }], { onConflict: 'email' })
      
      if (sigErr) throw new Error("Signal failed: " + sigErr.message)

      setStatus('Provisioning Identity...')

      // 2. Create the Login with DEFAULT password
      const { error: authErr } = await supabase.auth.signUp({
        email: email,
        password: 'Welcome_Vizhin!',
      })
      
      if (authErr) throw authErr

      setStatus(`SUCCESS! ${orgName} is live. Password: Welcome_Vizhin!`);
      setOrgName(''); setOrgAdminName(''); setOrgAdminEmail('');
    } catch (err: any) {
      setStatus(`FAIL: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-xl mx-auto p-8">
        
        {/* Identity Banner */}
        <div className="mb-8 p-4 bg-slate-900 text-white rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Active Provisioner</p>
            <p className="font-bold">{currentUser?.full_name || currentUser?.email || 'Authenticating...'}</p>
          </div>
          <span className="text-[10px] bg-blue-600 px-2 py-1 rounded font-bold uppercase">{currentUser?.role || 'User'}</span>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-slate-900">Provisioning Remote</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex gap-4 mb-6">
            <button type="button" onClick={() => setMode('Customer')} className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${mode === 'Customer' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Add Customer</button>
            <button type="button" onClick={() => setMode('Partner')} className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${mode === 'Partner' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Add Partner</button>
          </div>

          <form onSubmit={handleProvision} className="space-y-4">
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Organization Name</label>
               <input required value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Acme Corp" />
            </div>
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Admin Full Name</label>
               <input required value={adminName} onChange={e => setOrgAdminName(e.target.value)} className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Sarah Jenkins" />
            </div>
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Admin Email</label>
               <input required type="email" value={adminEmail} onChange={e => setOrgAdminEmail(e.target.value)} className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="admin@acme.com" />
            </div>
            
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 cursor-pointer hover:bg-black transition-all">
              Deploy {mode}
            </button>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-xl font-bold text-center border-2 ${status.includes('FAIL') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse'}`}>
              {status}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

