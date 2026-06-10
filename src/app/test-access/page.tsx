'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Navbar from '../../components/Navbar'

export default function ScalableDirectoryDashboard() {
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [dropdownProfiles, setDropdownProfiles] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [treeStructure, setTreeStructure] = useState<any[]>([])
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [currentSessionUser, setCurrentSessionUser] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  useEffect(() => { initDashboard() }, [])

  useEffect(() => {
    if (selectedProfileId && allProfiles.length > 0) {
      const activeProf = allProfiles.find(p => p.id === selectedProfileId)
      if (activeProf) { 
        setExpandedNodes({})
        buildScalableTree(activeProf, companies, allProfiles) 
      }
    }
  }, [selectedProfileId, allProfiles, companies])

  async function initDashboard() {
    try {
      setLoading(true)
      const { data: pData } = await supabase.from('profiles').select('*')
      const { data: cData } = await supabase.from('companies').select('*')
      setAllProfiles(pData || [])
      setCompanies(cData || [])
      const { data: { user } } = await supabase.auth.getUser()
      if (user && pData) {
        const sessionProfile = pData.find(p => p.id === user.id)
        if (sessionProfile) {
          setCurrentSessionUser(sessionProfile)
          setSelectedProfileId(sessionProfile.id)
          let filtered = []
          if (sessionProfile.role === 'Super Admin') {
            filtered = pData.filter(p => ['Partner Admin', 'System Admin', 'Super Admin'].includes(p.role))
          } else if (sessionProfile.role === 'Partner Admin') {
            const pCompIds = (cData || []).filter(c => c.created_by === sessionProfile.id).map(c => c.id)
            filtered = pData.filter(p => p.id === sessionProfile.id || (p.role === 'System Admin' && pCompIds.includes(p.company_id)))
          } else { filtered = [sessionProfile] }
          
          const uniqueByEmail = Array.from(new Map(filtered.map(item => [item.email, item])).values())
          setDropdownProfiles(uniqueByEmail)
          buildScalableTree(sessionProfile, cData || [], pData)
        }
      }
    } catch (err: any) { setErrorMsg(err.message) } finally { setLoading(false) }
  }

  function handleCompanyToggle(companyNode: any) {
    const isExpanded = expandedNodes[companyNode.id]
    const updates: { [key: string]: boolean } = {}
    function extract(node: any) {
      updates[node.id] = !isExpanded
      if (node.children) node.children.forEach((c: any) => extract(c))
    }
    extract(companyNode)
    setExpandedNodes(prev => ({ ...prev, ...updates }))
  }

  function buildScalableTree(viewer: any, comps: any[], profs: any[]) {
    const role = viewer.role
    let allowed = []

    if (role === 'Super Admin') {
      allowed = comps
    } else if (role === 'Partner Admin') {
      // FIXED: Partner Admins see companies they CREATED
      allowed = comps.filter(c => c.created_by === viewer.id)
    } else {
      allowed = comps.filter(c => c.id === viewer.company_id)
    }

    setTreeStructure(allowed.map(comp => {
      const cProfs = profs.filter(p => p.company_id === comp.id)
      const children: any[] = []
      const done = new Set<string>()
      cProfs.filter(p => p.role === 'System Admin').forEach(a => children.push(buildUserSubtree(a, cProfs, done)))
      cProfs.filter(p => p.role === 'Executive' && (!p.manager_id || !cProfs.some(x => x.id === p.manager_id))).forEach(e => children.push(buildUserSubtree(e, cProfs, done)))
      cProfs.filter(p => !done.has(p.id) && (!p.manager_id || !cProfs.some(m => m.id === p.manager_id))).forEach(o => children.push(buildUserSubtree(o, cProfs, done)))
      return { id: comp.id, name: `${comp.name} (Account)`, type: 'company', children }
    }))
  }

  function buildUserSubtree(p: any, cProfs: any[], done: Set<string>): any {
    done.add(p.id)
    const subs = cProfs.filter(x => x.manager_id === p.id)
    return { id: p.id, name: `${p.full_name || p.email} (${p.role === 'System Admin' ? 'Admin' : p.role})`, type: 'user', children: subs.map(s => buildUserSubtree(s, cProfs, done)) }
  }

  function TreeComponent({ node }: { node: any }) {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes[node.id]
    return (
      <div className="ml-6 pl-4 border-l border-slate-200 mt-2 text-sm font-medium">
        <div className="flex items-center justify-between py-1.5 group pr-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setExpandedNodes(v => ({...v, [node.id]: !v[node.id]}))} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded cursor-pointer">{hasChildren ? (isExpanded ? '−' : '+') : '•'}</button>
            <span className={`px-2 py-1 rounded-lg border text-xs ${node.type === 'company' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>
              {node.type === 'company' ? '🏢' : '👤'} {node.name}
            </span>
          </div>
          {node.type === 'company' && hasChildren && (
            <button onClick={() => handleCompanyToggle(node)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer">{isExpanded ? 'Collapse All' : 'Expand All'}</button>
          )}
        </div>
        {hasChildren && isExpanded && <div className="animate-in fade-in">{node.children.map((c: any) => <TreeComponent key={c.id} node={c} />)}</div>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold">System Hierarchy</h1>
           <a href="/admin/provision" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all">+ Add Record</a>
        </div>

        {currentSessionUser && (currentSessionUser.role === 'Super Admin' || currentSessionUser.role === 'Partner Admin') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Switch Profile View</h2>
              <p className="text-xs text-slate-500">Evaluating multi-tenant data isolation.</p>
            </div>
            <select className="w-full md:w-72 p-2 border rounded-xl outline-none bg-slate-50 text-sm font-semibold" value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)}>
              {dropdownProfiles.map(p => {
                const comp = companies.find(c => c.id === p.company_id);
                const label = `${p.full_name || p.email} (${p.role === 'System Admin' ? 'Admin' : p.role})${comp ? ` - ${comp.name}` : ''}`;
                return <option key={p.id} value={p.id}>{label}</option>;
              })}
            </select>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          {loading && <p className="text-slate-400 italic text-center py-10">Syncing directories...</p>}
          {errorMsg && <p className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200 text-sm font-bold">⚠️ {errorMsg}</p>}
          {!loading && !errorMsg && treeStructure.map(node => <TreeComponent key={node.id} node={node} />)}
          {!loading && !errorMsg && treeStructure.length === 0 && <p className="text-slate-400 italic text-center py-10">No accessible accounts found.</p>}
        </div>
      </main>
    </div>
  )
}


