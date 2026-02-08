import React from "react"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('roguex_session')

  if (!session) {
    redirect('/login')
  }

  // Mock user for the shell
  const user = {
    id: 'admin',
    email: 'admin@roguex.com',
    user_metadata: {
      name: 'Admin'
    }
  }

  return <DashboardShell user={user as any}>{children}</DashboardShell>
}
