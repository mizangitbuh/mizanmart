'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

interface Props {
  customerId: string | null
  orderId: string
  orderNumber?: string | null
}

/**
 * Admin order page → jumps to the customer thread,
 * optionally filtered to this order via ?order= query.
 */
export function ChatWithCustomerButton({ customerId, orderId, orderNumber }: Props) {
  if (!customerId) return null

  const href = orderNumber || orderId
    ? `/admin/conversations/${customerId}?order=${orderId}`
    : `/admin/conversations/${customerId}`

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        background: 'var(--color-surface)',
      }}
    >
      <MessageSquare size={12} style={{ color: 'var(--color-primary)' }} />
      Chat with customer{orderNumber ? ` • ${orderNumber}` : ''}
    </Link>
  )
}
