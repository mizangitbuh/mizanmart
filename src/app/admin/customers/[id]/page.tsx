import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  Crown,
  Package,
  Calendar,
  CreditCard,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const statusEmoji: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  shipped: '🚚',
  delivered: '📦',
  cancelled: '❌',
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Fetch orders matching this customer (by user_id, email, or phone)
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .or(
      `user_id.eq.${profile.id}` +
      (profile.email ? `,customer_email.eq.${profile.email}` : '') +
      (profile.phone ? `,customer_phone.eq.${profile.phone}` : '')
    )
    .order('created_at', { ascending: false })

  const allOrders = orders || []
  const validOrders = allOrders.filter((o) => o.status !== 'cancelled')
  const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = allOrders.length
  const aov = validOrders.length > 0 ? totalSpent / validOrders.length : 0
  const lastOrder = allOrders[0]

  // Segment
  const daysSinceLast = lastOrder
    ? (Date.now() - new Date(lastOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity
  let segmentLabel = 'New'
  let segmentVariant: 'success' | 'warning' | 'info' | 'default' = 'warning'
  if (totalSpent >= 10000) {
    segmentLabel = 'VIP'
    segmentVariant = 'success'
  } else if (totalOrders >= 3) {
    segmentLabel = 'Returning'
    segmentVariant = 'info'
  } else if (totalOrders === 0) {
    segmentLabel = 'New'
    segmentVariant = 'warning'
  } else if (daysSinceLast > 90) {
    segmentLabel = 'Inactive'
    segmentVariant = 'default'
  }

  // Collect unique addresses
  const addresses = new Map<string, { name: string; phone: string; address: string; city: string }>()
  allOrders.forEach((o) => {
    const addr = o.shipping_address as any
    if (addr?.address) {
      const key = `${addr.address}|${addr.city}`
      if (!addresses.has(key)) {
        addresses.set(key, {
          name: o.customer_name,
          phone: o.customer_phone,
          address: addr.address,
          city: addr.city,
        })
      }
    }
  })

  const initial = (profile.full_name || profile.email || 'U').charAt(0).toUpperCase()

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: '#3B82F6' },
    { label: 'Total Spent', value: formatPrice(totalSpent), icon: DollarSign, color: '#10B981' },
    { label: 'Avg. Order Value', value: formatPrice(aov), icon: TrendingUp, color: '#F59E0B' },
    {
      label: 'Last Order',
      value: lastOrder
        ? new Date(lastOrder.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
          })
        : 'Never',
      icon: Clock,
      color: '#8B5CF6',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Header */}
      <div
        className="p-5 md:p-6 rounded-[var(--radius-lg)] border flex flex-wrap items-center gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              {profile.full_name || 'Unnamed Customer'}
            </h1>
            {segmentLabel === 'VIP' ? (
              <Badge variant="success">
                <Crown size={11} className="inline mr-1" />
                VIP
              </Badge>
            ) : (
              <Badge variant={segmentVariant}>{segmentLabel}</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {profile.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} />
                {profile.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              Joined{' '}
              {new Date(profile.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="p-5 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center mb-3"
                style={{ background: stat.color + '15' }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-xl md:text-2xl font-black mb-0.5" style={{ color: 'var(--color-text)' }}>
                {stat.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Order History */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-black text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Package size={16} style={{ color: 'var(--color-primary)' }} />
            Order History ({totalOrders})
          </h2>
        </div>

        {allOrders.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {allOrders.map((order) => {
              const itemCount = order.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-5 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        {order.order_number}
                      </span>
                      <Badge variant={statusVariants[order.status] || 'default'} size="sm">
                        {statusEmoji[order.status]} {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm font-black" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(Number(order.total))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={11} />
                      {order.payment_method} — {order.payment_status}
                    </span>
                    <span className="truncate max-w-[200px]">
                      {order.order_items?.[0]?.product_name}
                      {order.order_items && order.order_items.length > 1 && ` +${order.order_items.length - 1}`}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <ShoppingBag size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              No orders yet
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              This customer has not placed any orders
            </div>
          </div>
        )}
      </div>

      {/* Addresses */}
      {addresses.size > 0 && (
        <div
          className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-black text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
              Delivery Addresses ({addresses.size})
            </h2>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            {Array.from(addresses.values()).map((addr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[var(--radius-md)] border"
                style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  {addr.name}
                </div>
                <div className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <Phone size={11} />
                  {addr.phone}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {addr.address}
                  <br />
                  {addr.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
