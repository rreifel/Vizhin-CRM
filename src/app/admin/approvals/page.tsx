'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

export default function ApprovalsLedger() {
  const [deals, setDeals] = useState<any[]>([])
  const [dealName, setDealName] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [offeredPrice, setOfferedPrice] = useState('')
  const [status, setStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadApprovalsLedger()
  }, [])

  async function loadApprovalsLedger() {
    // Fetches deals according to Row-Level Security parameters for the tenant
    const { data } = await supabase
      .from('approvals')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    if (data) setDeals(data)
  }

  async function handleNewDeal(e: React.FormEvent) {
    e.preventDefault()
    if (!dealName || !listPrice || !offeredPrice) return
    setStatus('Submitting deal structure...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setStatus('Error: User context not authenticated.')

    // Pulls user's company profile context
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()

    const { error } = await supabase.from('approvals').insert([{
      deal_name: dealName,
      list_price: parseFloat(listPrice),
      offered_price: parseFloat(offeredPrice),
      company_id: profile?.company_id,
      requester_id: user.id
    }])

    if (error) {
      setStatus(`Submission Failed: ${error.message}`)
    } else {
      setStatus('Deal logged successfully!')
      setDealName('')
      setListPrice('')
      setOfferedPrice('')
      loadApprovalsLedger()
    }
  }

  async function updateDealStatus(dealId: string, nextStatus: 'Approved' | 'Rejected') {
    const { error } = await supabase
      .from('approvals')
      .update({ status: nextStatus })
      .eq('id', dealId)

    if (error) {
      alert(`Action failed: ${error.message}`)
    } else {
      loadApprovalsLedger()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Logger Interface */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Log New Deal Structure</h2>
          <form onSubmit={handleNewDeal} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deal / Target Account</label>
              <input required type="text" value={dealName} onChange={e => setDealName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Wobo Tier 1 Renewal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">List Price ($)</label>
                <input required type="number" value={listPrice} onChange={e => setListPrice(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="10000" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offered Price ($)</label>
                <input required type="number" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="8500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all text-sm shadow-md">
              Calculate & Log Deal
            </button>
          </form>
          {status && <p className="mt-4 text-xs font-semibold text-center text-blue-600">{status}</p>}
        </div>

        {/* Dynamic Approval Inbox Queue */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Pricing Ledger Overview</h2>
          
          <div className="space-y-4">
            {deals.map(deal => {
              const discount = deal.discount_percent ? parseFloat(deal.discount_percent).toFixed(1) : '0.0'
              return (
                <div key={deal.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-base">{deal.deal_name}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${deal.status === 'Approved' ? 'bg-green-100 text-green-700' : deal.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {deal.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Submitted by: <span className="text-slate-700 font-semibold">{deal.profiles?.full_name || 'System'}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 flex gap-4 font-medium">
                      <span>List: <strong className="text-slate-800">${deal.list_price}</strong></span>
                      <span>Offered: <strong className="text-slate-800">${deal.offered_price}</strong></span>
                      <span className="text-blue-600">Discount: <strong>{discount}%</strong></span>
                    </div>
                  </div>

                  {/* Manager Control Gate Actions */}
                  {deal.status === 'Pending' && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button onClick={() => updateDealStatus(deal.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm">
                        Approve
                      </button>
                      <button onClick={() => updateDealStatus(deal.id, 'Rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs border border-red-200">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {deals.length === 0 && <p className="text-slate-400 italic text-center py-8">No deals logged in the pricing registry yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
