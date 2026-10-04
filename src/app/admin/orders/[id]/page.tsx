import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono">{order.order_number}</h1>
          <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h2 className="font-bold mb-3">Customer</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Name:</span> {order.customer_name}</div>
            <div><span className="text-gray-500">Phone:</span> {order.customer_phone}</div>
            {order.customer_email && <div><span className="text-gray-500">Email:</span> {order.customer_email}</div>}
          </div>
        </div>

        {/* Shipping */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h2 className="font-bold mb-3">Shipping Address</h2>
          <div className="space-y-1 text-sm">
            <div>{order.shipping_address?.address}</div>
            <div>{order.shipping_address?.city}</div>
            {order.notes && <div className="text-gray-500 mt-2">Note: {order.notes}</div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="font-bold mb-4">Order Items</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left pb-3">Product</th>
              <th className="text-right pb-3">Price</th>
              <th className="text-center pb-3">Qty</th>
              <th className="text-right pb-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="py-3">{item.product_name}</td>
                <td className="py-3 text-right">{formatPrice(Number(item.price))}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right font-medium">{formatPrice(Number(item.subtotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="space-y-2 text-sm max-w-xs ml-auto">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPrice(Number(order.shipping_cost))}</span></div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-800 pt-2">
            <span>Total</span><span className="text-blue-600">{formatPrice(Number(order.total))}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-2">
            <span>Payment</span><span>{order.payment_method.toUpperCase()} — {order.payment_status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
