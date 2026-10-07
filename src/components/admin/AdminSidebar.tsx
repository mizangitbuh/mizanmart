'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Warehouse,
  Ticket,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Home,
  ChevronRight,
  X,
  User,
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const sections = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CATALOGUE',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Tag },
      { href: '/admin/inventory', label: 'Inventory', icon: Warehouse, badge: 'NEW' },
    ],
  },
  {
    title: 'ORDERS',
    items: [
      { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
    ],
  },
  {
    title: 'CUSTOMERS',
    items: [
      { href: '/admin/customers', label: 'All Customers', icon: Users },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Ticket, badge: 'NEW' },
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon, badge: 'NEW' },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, badge: 'NEW' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/admin/profile', label: 'My Profile', icon: User },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
      { href: '/admin/settings', label: 'Store Settings', icon: Settings },
    ],
  },
]

export function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 flex-shrink-0 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link href="/admin" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              M
            </div>
            <div>
              <div className="font-black text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                MizanMart
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                Admin
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <div
                className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="mx-2 px-3 py-2 rounded-[var(--radius-md)] flex items-center gap-3 text-sm transition-colors"
                    style={{
                      background: active ? 'var(--color-primary-light)' : 'transparent',
                      color: active ? 'var(--color-primary)' : 'var(--color-text)',
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <Icon size={16} style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--color-primary)', color: 'white' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight size={14} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — View Store */}
        <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text)' }}
          >
            <Home size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span>View Store</span>
            <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>
      </aside>
    </>
  )
}
