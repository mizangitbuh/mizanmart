import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-8">
        <div className="text-center max-w-md bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]">
          <h1 className="text-2xl font-black mb-2 text-[var(--color-text)]">Access Denied</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">This account does not have admin access.</p>
          <Link href="/" className="text-[var(--color-primary)] hover:underline font-bold">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: Users },
  ]

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/admin" className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
            mizan<span style={{ color: 'var(--color-text)' }}>mart</span> <span className="text-xs font-semibold text-[var(--color-text-muted)]">Admin</span>
          </Link>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: 'var(--color-text)' }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-surface-hover)]" style={{ color: 'var(--color-text-muted)' }}>
            <Home size={18} />
            View Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
