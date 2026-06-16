'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchBranding() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        // Call our secure database function to bypass RLS filters
        const { data: logoXml, error } = await supabase.rpc('get_my_custom_logo')
        if (!error && logoXml) {
          setCustomLogo(logoXml)
        }
      }
    }
    fetchBranding()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    // Corrected relative path to ensure sign-out stays on your live domain mapping context
    window.location.href = '/crm/auth/login'
  }

  // The Default Vizhin Master Logo (SVG Code)
  const defaultLogo = `
    <svg xmlns="http://w3.org" viewBox="0 0 1000 320">
      <g transform="translate(40, 20)">
        <path d="M 50,55 L 90,55 L 140,205 L 100,205 Z" fill="#0D5C46" />
        <path d="M 235,55 L 195,55 L 120,235 L 160,235 Z" fill="#181C24" />
        <path d="M 295,60 L 312,60 L 312,230 L 295,230 Z" fill="#181C24" />
        <path d="M 378,60 L 460,60 L 460,76 L 396,213 L 462,213 L 462,230 L 376,230 L 376,214 L 440,77 L 378,77 Z" fill="#181C24" />
        <path d="M 528,60 L 545,60 L 545,134 L 611,134 L 611,60 L 628,60 L 628,230 L 611,230 L 611,151 L 545,151 L 545,230 L 528,230 Z" fill="#181C24" />
        <path d="M 695,60 L 712,60 L 712,230 L 695,230 Z" fill="#181C24" />
        <path d="M 780,60 L 799,60 L 859,190 L 859,60 L 876,60 L 876,230 L 858,230 L 797,98 L 797,230 L 780,230 Z" fill="#181C24" />
        <text x="465" y="295" font-family="sans-serif" font-size="44" font-weight="300" letter-spacing="14" fill="#717D8A" text-anchor="middle">a better way forward</text>
      </g>
    </svg>
  `

  return (
    <>
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all w-48 h-auto">
            <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customLogo || defaultLogo }} />
          </Link>
          
          <div className="flex gap-4">
            <Link href="/test-access" className={`text-xs font-bold uppercase tracking-widest ${pathname === '/test-access' ? 'text-blue-600' : 'text-slate-400'}`}>Hierarchy</Link>
            <Link href="/admin/provision" className={`text-xs font-bold uppercase tracking-widest ${pathname === '/admin/provision' ? 'text-blue-600' : 'text-slate-400'}`}>Provisioning</Link>
            <Link href="/settings" className={`text-xs font-bold uppercase tracking-widest ${pathname === '/settings' ? 'text-blue-600' : 'text-slate-400'}`}>Settings</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700">{userEmail}</p>
              <button onClick={handleSignOut} className="bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer">Sign Out</button>
            </div>
          )}
        </div>
      </nav>

      {/* Powered by Vizhin Footer (Only shows if a custom partner logo is active) */}
      {customLogo && (
        <div className="fixed bottom-4 right-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-full shadow-sm pointer-events-none opacity-60">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Powered by</span>
          <div className="w-12 h-auto" dangerouslySetInnerHTML={{ __html: defaultLogo }} />
        </div>
      )}
    </>
  )
}
