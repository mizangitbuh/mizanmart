import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/account/ProfileForm'
import { User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black mb-1 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <User size={20} style={{ color: 'var(--color-primary)' }} />
          Profile Information
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Update your personal information
        </p>
      </div>

      <div
        className="p-6 rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <ProfileForm
          initial={{
            full_name: profile?.full_name || '',
            email: profile?.email || user.email || '',
            phone: profile?.phone || '',
          }}
        />
      </div>
    </div>
  )
}
