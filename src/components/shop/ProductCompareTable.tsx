'use client'

import Link from 'next/link'
import { ShoppingCart, Check, Star, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'

interface CompareProduct {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  image: string
}

interface Props {
  currentProduct: CompareProduct
  similarProducts: CompareProduct[]
}

export function ProductCompareTable({ currentProduct, similarProducts }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  if (!similarProducts || similarProducts.length === 0) return null

  const allItems = [currentProduct, ...similarProducts.slice(0, 2)]

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-4 sm:p-5 overflow-x-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 pb-3 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Sparkles size={16} className="text-amber-500" />
        <h3 className="font-black text-sm text-[var(--color-text)]">
          একই ধরনের পণ্যের তুলনা (Compare with Similar Items)
        </h3>
      </div>

      <div className="min-w-[550px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <th className="py-2.5 px-3 text-left text-gray-500 font-bold w-1/4">পণ্য</th>
              {allItems.map((item, idx) => (
                <th key={item.id} className="py-2.5 px-3 text-center w-1/4">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-bold text-[11px] text-[var(--color-text)] hover:text-[var(--color-primary)] line-clamp-2 max-w-[130px]"
                    >
                      {item.name}
                    </Link>
                    {idx === 0 && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        বর্তমান পণ্য
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Price */}
            <tr>
              <td className="py-2.5 px-3 font-semibold text-gray-500">মূল্য (Price)</td>
              {allItems.map((item) => (
                <td key={item.id} className="py-2.5 px-3 text-center">
                  <span className="font-black text-sm" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(item.price)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Quality Grade */}
            <tr>
              <td className="py-2.5 px-3 font-semibold text-gray-500">কোয়ালিটি গ্রেড</td>
              {allItems.map((item) => (
                <td key={item.id} className="py-2.5 px-3 text-center font-bold text-gray-800">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                    <Check size={13} /> ফ্যাক্টরি Grade A+
                  </span>
                </td>
              ))}
            </tr>

            {/* QC Testing */}
            <tr>
              <td className="py-2.5 px-3 font-semibold text-gray-500">ল্যাব QC টেস্ট</td>
              {allItems.map((item) => (
                <td key={item.id} className="py-2.5 px-3 text-center text-gray-700 font-medium">
                  ডাবল চেকড (QC Passed)
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr>
              <td className="py-2.5 px-3 font-semibold text-gray-500">রিপ্লেসমেন্ট সুবিধা</td>
              {allItems.map((item) => (
                <td key={item.id} className="py-2.5 px-3 text-center text-gray-700 font-medium">
                  ৭ দিন
                </td>
              ))}
            </tr>

            {/* Action */}
            <tr>
              <td className="py-2.5 px-3 font-semibold text-gray-500">অ্যাকশন</td>
              {allItems.map((item) => (
                <td key={item.id} className="py-2.5 px-3 text-center">
                  <button
                    onClick={() =>
                      addItem({
                        productId: item.id,
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        image: item.image,
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <ShoppingCart size={11} />
                    কার্টে নিন
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
