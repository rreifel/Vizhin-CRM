'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'

export default function CustomerMaster() {
  const [companyName, setCompanyName] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    const { data } = await supabase.from('companies').select('*').order('name')
    if (data) setCompanies(data)
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName) return

    setStatus('Creating company...')
    
    const { error } = await supabase
      .from('companies')
      .insert([{ name: companyName }])

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus(`Success! ${companyName} created.`)
      setCompanyName('')
      loadCompanies()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Customer Master</h1>
      
      <div className="bg-white p-6 shadow rounded-lg border border-gray-200 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Client (Tenant)</h2>
        <form onSubmit={handleCreateCompany} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. Wobo, Inc." 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="flex-1 border p-2 rounded border-gray-300 outline-none"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">
            Create Org
          </button>
        </form>
        {status && <p className="mt-4 text-blue-600 font-medium">{status}</p>}
      </div>

      <div className="bg-white p-6 shadow rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Companies</h2>
        <div className="grid gap-2">
          {companies.length === 0 ? <p className="text-gray-500 italic">No companies created yet.</p> : 
            companies.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 border rounded flex justify-between items-center">
                <span className="font-bold text-gray-700">{c.name}</span>
                <span className="text-xs text-gray-400 font-mono">{c.id}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
