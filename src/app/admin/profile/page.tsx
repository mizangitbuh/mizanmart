import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminProfileForm } from '@/components/admin/AdminProfileForm'
import { UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Profile | Martivo',
}

export default async function AdminProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
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

  // Fetch recent audit logs for this admin
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_name, created_at')
    .eq('admin_email', profile?.email || user.email)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            এডমিন প্রোফাইল (Admin Profile)
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            আপনার এডমিন অ্যাকাউন্ট তথ্য, নিরাপত্তা সেটিংস ও পাসওয়ার্ড পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit">
          <UserCheck size={16} />
          <span>Active Session</span>
        </div>
      </div>

      {/* Profile Form & Tabs */}
      <AdminProfileForm
        initialProfile={{
          full_name: profile?.full_name || '',
          email: profile?.email || user.email || '',
          phone: profile?.phone || '',
          role: profile?.role || 'admin',
          created_at: profile?.created_at || user.created_at,
        }}
        userEmail={profile?.email || user.email || ''}
        userId={user.id}
        lastSignInAt={user.last_sign_in_at}
        recentLogs={recentLogs || []}
      />
    </div>
  )
}
