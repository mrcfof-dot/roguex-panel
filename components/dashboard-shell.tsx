'use client'

import React from "react"

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  Key,
  Activity,
  LogOut,
  Menu,
  Monitor,
  Settings,
  X,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/sessions', label: 'Sessao', icon: Monitor },
  { href: '/dashboard/keys', label: 'Keys', icon: Key },
  { href: '/dashboard/logs', label: 'Logs', icon: Activity },
  { href: '/dashboard/bot', label: 'Bot', icon: Bot },
  { href: '/dashboard/settings', label: 'Configuraçoes', icon: Settings },
]

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
  }
}

export function DashboardShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-border px-6 hover:bg-secondary/50 transition-colors"
        >
          <img src="/logo.png" alt="Logo" className="h-10 w-auto drop-shadow-2xl" />
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`animate-slide-up flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300'
                  }`}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="animate-slide-up mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            style={{ animationDelay: `${0.1 + navItems.length * 0.05}s` }}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </nav>


        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
              {user.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm text-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 md:hidden">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300'
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-3 border-t border-border pt-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </div>
          </div>
        )}

        <main className="animate-slide-up flex-1 overflow-auto p-4 md:p-8" style={{ animationDelay: '0.4s' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
