import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-background)' }}>
        <div
          className="text-center max-w-md p-8 rounded-[var(--radius-lg)] border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            This account does not have admin access.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AdminShell
      userName={profile.full_name || user.email || 'Admin'}
      userEmail={profile.email || user.email || ''}
      userRole={profile.role || 'admin'}
      notificationCount={0}
    >
      {children}
    </AdminShell>
  )
}
