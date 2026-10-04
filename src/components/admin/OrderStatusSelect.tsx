'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleChange = async (newStatus: string) => {
    setSaving(true)
    setStatus(newStatus)

    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    setSaving(false)
    if (error) {
      alert('Error: ' + error.message)
      setStatus(currentStatus)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Status:</label>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s.toUpperCase()}</option>
        ))}
      </select>
      {saving && <span className="text-sm text-gray-500">Saving...</span>}
    </div>
  )
}
