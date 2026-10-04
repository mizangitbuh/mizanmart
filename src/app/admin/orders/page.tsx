import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders ({orders?.length || 0})</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4 hidden md:table-cell">Date</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="p-4 font-mono font-medium">{o.order_number}</td>
                <td className="p-4">
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.customer_phone}</div>
                </td>
                <td className="p-4 hidden md:table-cell text-gray-500">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold">{formatPrice(Number(o.total))}</td>
                <td className="p-4">
                  <Badge variant={statusVariants[o.status] || 'default'}>{o.status}</Badge>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                    <Eye size={14} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!orders || orders.length === 0) && (
          <div className="p-12 text-center text-gray-500">No orders yet</div>
        )}
      </div>
    </div>
  )
}
