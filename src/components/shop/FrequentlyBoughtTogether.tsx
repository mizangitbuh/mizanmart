'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ShoppingCart, Check, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'

export interface BundleItem {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  image: string
}

interface Props {
  mainProduct: BundleItem
  bundleItems: BundleItem[]
}

export function FrequentlyBoughtTogether({ mainProduct, bundleItems }: Props) {
  const allItems = [mainProduct, ...bundleItems]
  const [selectedIds, setSelectedIds] = useState<string[]>(allItems.map((i) => i.id))
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  if (bundleItems.length === 0) return null

  const toggleItem = (id: string) => {
    // Cannot uncheck main product
    if (id === mainProduct.id) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectedItems = allItems.filter((i) => selectedIds.includes(i.id))
  const totalPrice = selectedItems.reduce((s, i) => s + Number(i.price), 0)
  const compareTotal = selectedItems.reduce((s, i) => s + Number(i.compare_price || i.price), 0)
  const bundleDiscount = compareTotal > totalPrice ? compareTotal - totalPrice : Math.round(totalPrice * 0.05) // 5% bundle discount if no compare price

  const handleAddAll = () => {
    selectedItems.forEach((item) => {
      addItem({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image,
      })
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border mt-8"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} style={{ color: 'var(--color-primary)' }} />
        <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--color-text)' }}>
          Frequently Bought Together (একসাথে কিনুন ও সাশ্রয় করুন)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Images Row with Plus Signs */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
          {allItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id)
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius-md)] overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-[var(--color-primary)]' : 'border-gray-200 opacity-40'
                  }`}
                  style={{ background: 'var(--color-background)' }}
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  {item.id === mainProduct.id && (
                    <span
                      className="absolute top-1 left-1 text-[9px] font-bold text-white px-1.5 py-0.2 rounded"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      এই পণ্য
                    </span>
                  )}
                </div>

                {idx < allItems.length - 1 && (
                  <Plus size={18} className="text-gray-400 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Price & Add All CTA */}
        <div className="lg:col-span-4 p-4 rounded-lg border bg-[var(--color-background)]" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-xs text-gray-500 mb-1">
            মোট নির্বাচিত: <strong className="text-[var(--color-text)]">{selectedItems.length} টি পণ্য</strong>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(totalPrice)}
            </span>
            {compareTotal > totalPrice && (
              <span className="text-xs line-through text-gray-400">
                {formatPrice(compareTotal)}
              </span>
            )}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mb-3">
            বান্ডেল সেভিং: {formatPrice(bundleDiscount)} ছাড়!
          </div>

          <button
            onClick={handleAddAll}
            disabled={selectedItems.length === 0}
            className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-95 shadow-sm active:scale-95"
            style={{ background: added ? 'var(--color-success)' : 'var(--color-primary)' }}
          >
            <ShoppingCart size={15} />
            {added ? '✓ সব কার্টে যোগ হয়েছে!' : `সবগুলো কার্টে যোগ করুন (${selectedItems.length})`}
          </button>
        </div>
      </div>

      {/* Item Checkboxes List */}
      <div className="mt-4 pt-3 border-t space-y-2 text-xs" style={{ borderColor: 'var(--color-border)' }}>
        {allItems.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            style={{ color: selectedIds.includes(item.id) ? 'var(--color-text)' : 'var(--color-text-muted)' }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              disabled={item.id === mainProduct.id}
              onChange={() => toggleItem(item.id)}
              className="accent-[var(--color-primary)] w-4 h-4 rounded"
            />
            <span>
              {item.id === mainProduct.id ? <strong className="text-[var(--color-primary)]">[বর্তমান পণ্য] </strong> : null}
              {item.name} — <strong className="text-[var(--color-primary)]">{formatPrice(item.price)}</strong>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
