'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface Props {
  children: React.ReactNode
  userName: string
  userEmail: string
  userRole?: string
  notificationCount?: number
  unreadSupport?: number
}

export function AdminShell({ children, userName, userEmail, userRole, notificationCount = 0, unreadSupport = 0 }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-background)' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadSupport={unreadSupport} />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          notificationCount={notificationCount}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
