import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from('profiles')
    .select('*, orders(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers ({customers?.length || 0})</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4 hidden md:table-cell">Phone</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4 hidden md:table-cell">Orders</th>
              <th className="text-left p-4 hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="p-4 font-medium">{c.full_name || '—'}</td>
                <td className="p-4">{c.email || '—'}</td>
                <td className="p-4 hidden md:table-cell">{c.phone || '—'}</td>
                <td className="p-4">
                  <Badge variant={c.role === 'admin' ? 'info' : 'default'}>{c.role}</Badge>
                </td>
                <td className="p-4 hidden md:table-cell">{c.orders?.[0]?.count || 0}</td>
                <td className="p-4 hidden md:table-cell text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!customers || customers.length === 0) && (
          <div className="p-12 text-center text-gray-500">No customers yet</div>
        )}
      </div>
    </div>
  )
}
