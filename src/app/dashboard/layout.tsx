'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { AppstoreOutlined, FileTextOutlined, MenuOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: AppstoreOutlined },
  { href: '/dashboard/profile', label: 'Profile', icon: UserOutlined },
  { href: '/dashboard/cv', label: 'CV library', icon: FileTextOutlined },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageOutlined },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      setMenuOpen(false)
    }
  }, [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f8fc] text-[#20243b]">
    {menuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 border-0 bg-slate-950/45 md:hidden" />}
    <aside id="dashboard-sidebar" className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(290px,84vw)] flex-col border-r border-[#ececf4] bg-white px-[17px] pb-[18px] pt-[25px] shadow-[14px_0_40px_#1e24401a] transition-transform duration-200 md:w-64 md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-2.5 px-2.5 pb-[29px] text-[17px] font-extrabold tracking-[-.5px] text-[#252944]"><span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-base font-extrabold text-white">C</span><span>CareerMate</span></div>
      <p className="mb-[11px] ml-2.5 text-[9px] font-extrabold tracking-[1.35px] text-[#a1a4b6]">WORKSPACE</p>
      <nav aria-label="Dashboard navigation" className="grid gap-[5px]">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
          const Icon = item.icon
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-xs font-semibold transition-colors ${active ? 'bg-[#f1efff] text-[#5e4cc9]' : 'text-[#6f748a] hover:bg-[#f8f7ff] hover:text-[#5e4cc9]'}`}>
            <Icon aria-hidden="true" className="w-[21px] text-base"/><span>{item.label}</span>{active && <span aria-hidden="true" className="absolute right-0 h-5 w-[3px] rounded-l bg-[#6958d6]"/>}
          </Link>
        })}
      </nav>
      <div className="mt-auto flex items-center gap-[9px] border-t border-[#f0eff6] px-[11px] pb-[3px] pt-[15px] text-[10px] text-[#9094a8]"><span className="size-[7px] rounded-full bg-[#62bf91] shadow-[0_0_0_3px_#e8f8f0]"/><span>Workspace ready</span></div>
    </aside>
    <div className="ml-0 flex h-dvh min-w-0 w-full flex-col md:ml-64 md:w-[calc(100%-16rem)]">
      <header className="z-10 flex h-[60px] shrink-0 items-center gap-2.5 border-b border-[#ececf4] bg-white px-[18px] text-sm font-extrabold text-[#252944] md:hidden"><span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-sm text-white">C</span><span>CareerMate</span><button type="button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(true)} className="ml-auto grid size-[38px] place-items-center rounded-lg bg-[#f5f4fa] text-[#565b74]"><MenuOutlined/></button></header>
      <main className="min-h-0 flex-1 overflow-auto overscroll-contain px-[18px] py-6 md:px-[clamp(22px,4vw,56px)] md:py-[34px]">{children}</main>
    </div>
  </div>
}
