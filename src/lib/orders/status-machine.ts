// ═══════════════════════════════════════════════
// Order Status State Machine
// ═══════════════════════════════════════════════

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export function isValidStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s)
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function getAllowedTransitions(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from] ?? []
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_EMOJI: Record<OrderStatus, string> = {
  pending:   '⏳',
  confirmed: '✅',
  shipped:   '🚚',
  delivered: '📦',
  cancelled: '❌',
}

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export function isValidPaymentStatus(s: string): s is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(s)
}

// ─── Payment Status Transitions ───
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['paid', 'failed'],
  paid: ['refunded'],
  failed: ['pending'],
  refunded: [],
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return false
  return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false
}

export function getAllowedPaymentTransitions(from: PaymentStatus): PaymentStatus[] {
  return PAYMENT_TRANSITIONS[from] ?? []
}

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const PAYMENT_EMOJI: Record<PaymentStatus, string> = {
  pending: '⏳',
  paid: '💰',
  failed: '⚠️',
  refunded: '↩️',
}
