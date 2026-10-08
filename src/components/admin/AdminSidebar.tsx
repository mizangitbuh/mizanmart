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
  Star,
  Activity,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

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
    title: 'ORDERS & CUSTOMERS',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'MARKETING & SALES',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Ticket, badge: 'OFF' },
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
      { href: '/admin/reviews', label: 'Reviews', icon: Star, badge: 'REVIEWS' },
    ],
  },
  {
    title: 'ANALYTICS & SYSTEM',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
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
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-60 flex-shrink-0 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link href="/admin" className="flex items-center gap-2">
            <Logo href={null} variant="inline" height={36} />
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

        {/* Navigation items - dense */}
        <nav className="flex-1 overflow-y-auto py-2.5 space-y-3">
          {sections.map((section) => (
            <div key={section.title}>
              <div
                className="px-4 py-1 text-[9px] font-black uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="mx-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] flex items-center gap-2.5 text-xs transition-all"
                      style={{
                        background: active ? 'var(--color-primary-light)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: active ? 700 : 500,
                        borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                      }}
                    >
                      <Icon size={15} style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.2 rounded"
                          style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight size={12} />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Store Status Indicator & View Store Link */}
        <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
          {/* Store status pill */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded border text-[11px]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--color-text)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Store: <span className="text-emerald-600">LIVE</span>
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Online</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold hover:bg-[var(--color-surface)] transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            <span className="flex items-center gap-2">
              <Home size={14} style={{ color: 'var(--color-primary)' }} />
              <span>View Storefront</span>
            </span>
            <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>
      </aside>
    </>
  )
}
