'use client'

import { useState } from 'react'
import { MapPin, Truck, Check, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const DISTRICTS = [
  { name: 'ঢাকা (Dhaka)', inside: true, days: 1, cost: 60 },
  { name: 'চট্টগ্রাম (Chittagong)', inside: false, days: 2, cost: 120 },
  { name: 'সিলেট (Sylhet)', inside: false, days: 3, cost: 120 },
  { name: 'রাজশাহী (Rajshahi)', inside: false, days: 3, cost: 120 },
  { name: 'খুলনা (Khulna)', inside: false, days: 3, cost: 120 },
  { name: 'বরিশাল (Barisal)', inside: false, days: 3, cost: 120 },
  { name: 'রংপুর (Rangpur)', inside: false, days: 3, cost: 120 },
  { name: 'ময়মনসিংহ (Mymensingh)', inside: false, days: 2, cost: 120 },
  { name: 'অন্যান্য জেলা', inside: false, days: 3, cost: 120 },
]

export function DeliveryEstimator({ price }: { price: number }) {
  const [selected, setSelected] = useState(DISTRICTS[0])

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + selected.days)
  const formattedDate = targetDate.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })

  const isFree = price >= 1000
  const deliveryCharge = isFree ? 0 : selected.cost

  return (
    <div
      className="p-3.5 rounded-[var(--radius-md)] border text-xs space-y-2.5 my-3"
      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
          <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
          ডেলিভারি লোকেশন নির্বাচন:
        </span>
        <select
          value={selected.name}
          onChange={(e) => {
            const found = DISTRICTS.find((d) => d.name === e.target.value)
            if (found) setSelected(found)
          }}
          className="px-2 py-1 rounded border text-xs font-semibold bg-[var(--color-surface)] cursor-pointer focus:outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          {DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 border-t flex items-start gap-2" style={{ borderColor: 'var(--color-border)' }}>
        <Truck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-[var(--color-text)]">
            ডেলিভারি আনুমানিক সময়: <span className="text-emerald-600">{formattedDate}</span> ({selected.days === 1 ? 'আগামীকাল' : `${selected.days} দিনের মধ্যে`})
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            চার্জ: <strong className={isFree ? 'text-emerald-600' : 'text-[var(--color-primary)]'}>
              {isFree ? 'বিনামূল্যে (Free Delivery)' : formatPrice(deliveryCharge)}
            </strong>
            {price < 1000 && <span> (৳১০০০+ অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি)</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
