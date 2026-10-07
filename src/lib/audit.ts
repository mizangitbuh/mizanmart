/**
 * Audit Logging System
 * 
 * Admin actions log করার জন্য helper.
 * 
 * ব্যবহার:
 *   await logAudit({
 *     action: 'product.update',
 *     entityType: 'product',
 *     entityId: 'abc-123',
 *     entityName: 'Lipstick',
 *     changes: { price: { old: 500, new: 600 } }
 *   })
 * 
 * SSR-safe — Next.js server context-এ ব্যবহারের জন্য.
 */

import { createClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.bulk_update'
  | 'order.update'
  | 'order.refund'
  | 'review.moderate'
  | 'review.delete'
  | 'order.status_change'
  | 'order.cancel'
  | 'order.delete'
  | 'inventory.adjust'
  | 'coupon.create'
  | 'coupon.update'
  | 'coupon.delete'
  | 'banner.create'
  | 'banner.update'
  | 'banner.delete'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'settings.update'
  | 'profile.update'

export type EntityType = 'product' | 'order' | 'customer' | 'coupon' | 'banner' | 'category' | 'settings' | 'profile'

export interface AuditChange {
  old: any
  new: any
}

export interface AuditLogInput {
  action: AuditAction
  entityType: EntityType
  entityId?: string | null
  entityName?: string | null
  changes?: Record<string, AuditChange> | null
  metadata?: Record<string, any> | null
}

/**
 * Log an admin action to audit_logs table.
 * Never throws — best-effort logging.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const supabase = await createClient()

    // Get current admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('Audit: No authenticated user')
      return
    }

    // Get admin email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('id', user.id)
      .single()

    // Only log if admin
    if (profile?.role !== 'admin') {
      console.warn('Audit: Non-admin attempted to log')
      return
    }

    const { error } = await supabase.from('audit_logs').insert({
      admin_id: user.id,
      admin_email: profile.email || user.email || null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      entity_name: input.entityName || null,
      changes: input.changes || null,
      metadata: input.metadata || null,
    })

    if (error) {
      console.error('Audit log failed:', error)
    }
  } catch (err) {
    // Never fail the main operation because of audit logging
    console.error('Audit log exception:', err)
  }
}

/**
 * Compute diff between old and new objects.
 * Returns only changed fields.
 */
export function computeChanges(
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): Record<string, AuditChange> {
  const changes: Record<string, AuditChange> = {}
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])

  for (const key of allKeys) {
    const oldVal = oldObj?.[key]
    const newVal = newObj?.[key]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal }
    }
  }

  return changes
}
