import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Package, Heart, MapPin, User, Lock, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

const navItems = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="container-main py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
          My Account
        </h1>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside>
            {/* User card */}
            <div
              className="p-5 rounded-[var(--radius-lg)] border mb-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                    {profile?.full_name || 'User'}
                  </div>
                  <div className="text-xs line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                    {profile?.email || user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{
                      color: 'var(--color-text)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                    {item.label}
                  </Link>
                )
              })}
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)] text-left"
                  style={{ color: 'var(--color-error)' }}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </form>
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
