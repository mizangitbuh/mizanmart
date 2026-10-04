import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [products, orders, customers] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id, total, status', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  const totalRevenue = orders.data?.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0) || 0
  const pendingOrders = orders.data?.filter((o) => o.status === 'pending').length || 0
  const recentOrders = orders.data?.slice(-5).reverse() || []

  const stats = [
    { label: 'Products', value: products.count || 0, icon: Package, color: 'text-blue-600' },
    { label: 'Orders', value: orders.count || 0, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Customers', value: customers.count || 0, icon: Users, color: 'text-green-600' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Icon size={24} className={s.color + ' mb-3'} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          )
        })}
      </div>

      {pendingOrders > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="font-medium">⚠️ {pendingOrders} pending order(s) awaiting confirmation</div>
          <Link href="/admin/orders" className="text-sm text-yellow-700 dark:text-yellow-400 hover:underline">
            View Orders →
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h2 className="font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link key={o.id} href="/admin/orders" className="flex justify-between text-sm hover:text-blue-600">
                  <span>{o.id.slice(0, 8)}...</span>
                  <span>{formatPrice(Number(o.total))}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h2 className="font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/products" className="block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
              + Add New Product
            </Link>
            <Link href="/admin/categories" className="block px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Manage Categories
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
