'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◫' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◎' },
  { href: '/dashboard/cv', label: 'CV library', icon: '▤' },
  { href: '/dashboard/chat', label: 'Chat', icon: '◌' },
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

  return <div className="dashboard-shell">
    <button type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="dashboard-menu-button">
      <span/><span/><span/>
    </button>
    {menuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="dashboard-sidebar-backdrop" />}
    <aside id="dashboard-sidebar" className={`dashboard-sidebar${menuOpen ? ' dashboard-sidebar-open' : ''}`}>
      <div className="dashboard-sidebar-brand"><span className="dashboard-brand-mark">C</span><span>CareerMate</span></div>
      <p className="dashboard-nav-caption">WORKSPACE</p>
      <nav aria-label="Dashboard navigation" className="dashboard-nav">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`dashboard-nav-link${active ? ' dashboard-nav-link-active' : ''}`}>
            <span aria-hidden="true" className="dashboard-nav-icon">{item.icon}</span><span>{item.label}</span>{active && <span aria-hidden="true" className="dashboard-nav-indicator"/>}
          </Link>
        })}
      </nav>
      <div className="dashboard-sidebar-footer"><span className="dashboard-status-dot"/><span>Workspace ready</span></div>
    </aside>
    <div className="dashboard-main-column">
      <header className="dashboard-mobile-header"><span className="dashboard-brand-mark">C</span><span>CareerMate</span><button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="dashboard-mobile-open">☰</button></header>
      <main className="dashboard-main">{children}</main>
    </div>
  </div>
}
