'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, ChevronDown, User, LogOut, Settings as SettingsIcon } from 'lucide-react'

interface Props {
  onMenuClick: () => void
  userName: string
  userEmail: string
  notificationCount?: number
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add New Product',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/inventory': 'Inventory',
  '/admin/coupons': 'Coupons',
  '/admin/banners': 'Banners',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname]

  // Match longest prefix
  const sorted = Object.keys(pageTitles).sort((a, b) => b.length - a.length)
  for (const path of sorted) {
    if (pathname.startsWith(path + '/')) {
      // Check for edit/new sub-routes
      if (pathname.includes('/products/') && pathname !== '/admin/products/new') return 'Edit Product'
      if (pathname.includes('/categories/')) return 'Edit Category'
      if (pathname.includes('/orders/')) return 'Order Details'
      return pageTitles[path]
    }
  }
  return 'Admin'
}

export function AdminHeader({ onMenuClick, userName, userEmail, notificationCount = 0 }: Props) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pageTitle = getPageTitle(pathname)
  const userInitial = (userName || 'A').charAt(0).toUpperCase()

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.location.href = `/admin/products?q=${encodeURIComponent(searchQuery)}`
  }

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text)' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg md:text-xl font-black" style={{ color: 'var(--color-text)' }}>
            {pageTitle}
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile search */}
          <Link
            href="/admin/products"
            className="md:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text)' }}
            aria-label="Search"
          >
            <Search size={20} />
          </Link>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
            style={{ color: 'var(--color-text)' }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {userInitial}
              </div>
              <span
                className="hidden md:block text-sm font-medium max-w-[120px] truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {userName}
              </span>
              <ChevronDown
                size={14}
                className="hidden md:block"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-lg)] border shadow-lg overflow-hidden z-50"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* User info */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {userName}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {userEmail}
                  </div>
                </div>

                {/* Menu */}
                <div className="p-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm hover:bg-[var(--color-surface-hover)] transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                    My Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm hover:bg-[var(--color-surface-hover)] transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <SettingsIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
                    Settings
                  </Link>
                </div>

                {/* Sign out */}
                <div
                  className="p-1 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors hover:bg-[var(--color-surface-hover)] text-left"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
