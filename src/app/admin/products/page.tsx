import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4 hidden md:table-cell">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4 hidden md:table-cell">Stock</th>
              <th className="text-left p-4 hidden md:table-cell">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {p.images?.[0] && (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-gray-600 dark:text-gray-400">
                  {p.category?.name || '—'}
                </td>
                <td className="p-4 font-medium">{formatPrice(Number(p.price))}</td>
                <td className="p-4 hidden md:table-cell">{p.stock_quantity}</td>
                <td className="p-4 hidden md:table-cell">
                  <Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status}</Badge>
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!products || products.length === 0) && (
          <div className="p-12 text-center text-gray-500">
            No products yet. <Link href="/admin/products/new" className="text-blue-600 hover:underline">Add your first product</Link>
          </div>
        )}
      </div>
    </div>
  )
}
