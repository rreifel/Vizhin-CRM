'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'

export default function RequestReview() {
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [trialDays, setTrialDays] = useState(30)
  const [price, setPrice] = useState(5.00)
  const [status, setStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    const { data } = await supabase.from('onboarding_requests').select('*').eq('status', 'Pending')
    if (data) setRequests(data)
  }

  async function handleProvision(req: any) {
    setStatus(`Provisioning ${req.company_name}...`)

    // 1. Create the Company Tenant
    const { data: company, error: cError } = await supabase
      .from('companies')
      .insert([{ 
        name: req.company_name, 
        status: 'Trial',
        trial_end_date: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
        price_per_user: price
      }])
      .select().single()

    if (cError) return setStatus('Error: ' + cError.message)

    // 2. Create the Company Admin Profile (Sarah Jenkins role)
    const { error: pError } = await supabase
      .from('profiles')
      .insert([{
        email: req.contact_email,
        full_name: req.contact_name,
        role: 'System Admin',
        company_id: company.id,
        manager_id: '45600291-5b0a-4c71-af87-808ffa14e791' // Points to YOU (Super Admin)
      }])

    // 3. Mark request as Approved
    await supabase.from('onboarding_requests').update({ status: 'Approved' }).eq('id', req.id)

    setStatus(`Success! ${req.company_name} is now live on a ${trialDays}-day trial.`)
    loadRequests()
    setSelectedRequest(null)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Onboarding Queue</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* List of Requests */}
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} onClick={() => setSelectedRequest(req)} className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedRequest?.id === req.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'bg-white hover:border-slate-300'}`}>
              <div className="font-bold text-slate-800 text-lg">{req.company_name}</div>
              <div className="text-sm text-slate-500">{req.contact_name} ({req.contact_email})</div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-slate-400 italic">No pending requests.</p>}
        </div>

        {/* Provisioning Form */}
        {selectedRequest && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-4">Provisioning: {selectedRequest.company_name}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Trial Duration (Days)</label>
                <input type="number" value={trialDays} onChange={e => setTrialDays(parseInt(e.target.value))} className="w-full border p-2 rounded-lg mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Price Per User ($)</label>
                <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full border p-2 rounded-lg mt-1" />
              </div>
              <button onClick={() => handleProvision(selectedRequest)} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all">
                Approve & Create Tenant
              </button>
            </div>
          </div>
        )}
      </div>
      {status && <p className="mt-8 text-center font-bold text-blue-600">{status}</p>}
    </div>
  )
}
