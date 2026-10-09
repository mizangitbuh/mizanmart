'use client'

import { MessageCircle } from 'lucide-react'
import { useChatStore } from '@/stores/chat'

interface Props {
  orderId: string
  orderNumber: string
}

/**
 * Customer order page → opens the global ChatWidget
 * scoped to this order (messages sent with order_id set).
 */
export function AskAboutOrderButton({ orderId, orderNumber }: Props) {
  const openChat = useChatStore((s) => s.openChat)

  return (
    <button
      onClick={() => openChat(orderId, orderNumber)}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
      style={{
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
        background: 'transparent',
      }}
    >
      <MessageCircle size={12} />
      এই অর্ডার নিয়ে প্রশ্ন করুন
    </button>
  )
}
