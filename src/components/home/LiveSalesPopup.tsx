'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, X } from 'lucide-react'

const SAMPLE_PURCHASES = [
  { name: 'তানভীর (ঢাকা)', product: 'Summer Casual Dress', time: '২ মিনিট আগে', img: 'https://picsum.photos/seed/dress/100/100', slug: 'summer-dress' },
  { name: 'আরিফ (চট্টগ্রাম)', product: 'Fast USB-C Charger 65W', time: '৫ মিনিট আগে', img: 'https://picsum.photos/seed/charger/100/100', slug: 'usb-c-charger' },
  { name: 'নুসরাত (সিলেট)', product: 'Matte Velvet Lipstick', time: '৩ মিনিট আগে', img: 'https://picsum.photos/seed/lipstick/100/100', slug: 'm' },
  { name: 'কামরুল (রাজশাহী)', product: 'Premium Cotton Panjabi', time: '৭ মিনিট আগে', img: 'https://picsum.photos/seed/panjabi/100/100', slug: 'summer-dress' },
]

export function LiveSalesPopup() {
  const [current, setCurrent] = useState<typeof SAMPLE_PURCHASES[0] | null>(null)
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (closed) return

    // Show every 20 seconds
    const interval = setInterval(() => {
      const randomPurchase = SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)]
      setCurrent(randomPurchase)
      setVisible(true)

      // Hide after 6s
      setTimeout(() => {
        setVisible(false)
      }, 6000)
    }, 18000)

    return () => clearInterval(interval)
  }, [closed])

  if (!visible || !current || closed) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-xs w-full animate-fade-in-up">
      <div
        className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] shadow-xl border relative"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={() => setClosed(true)}
          className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 p-0.5"
          aria-label="Close"
        >
          <X size={13} />
        </button>

        <div className="relative w-12 h-12 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--color-border)' }}>
          <Image src={current.img} alt={current.product} fill className="object-cover" sizes="48px" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ShoppingBag size={11} /> নতুন অর্ডার!
          </div>
          <Link
            href={`/product/${current.slug}`}
            className="text-xs font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] line-clamp-1 block leading-tight mt-0.5"
          >
            {current.product}
          </Link>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {current.name} • {current.time}
          </div>
        </div>
      </div>
    </div>
  )
}
