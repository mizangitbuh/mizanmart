'use client'

import { CheckCircle2, Circle, Clock, PackageCheck, Truck, Home, AlertCircle } from 'lucide-react'

interface Props {
  status: string
  orderNumber: string
  createdAt: string
  deliveryDate?: string
}

const STEPS = [
  { key: 'pending', title: 'অর্ডার গৃহীত হয়েছে', sub: 'অর্ডার প্লেস করা হয়েছে', icon: Clock },
  { key: 'confirmed', title: 'অর্ডার কনফার্মড', sub: 'প্যাকেজিং সম্পন্ন', icon: PackageCheck },
  { key: 'shipped', title: 'কুরিয়ারে হস্তান্তর', sub: 'ডেলিভারির পথে', icon: Truck },
  { key: 'delivered', title: 'সফলভাবে ডেলিভার্ড', sub: 'পণ্য বুঝিয়ে দেওয়া হয়েছে', icon: Home },
]

export function OrderTrackingTimeline({ status, orderNumber, createdAt, deliveryDate }: Props) {
  const isCancelled = status === 'cancelled'

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'pending': return 0
      case 'confirmed': return 1
      case 'shipped': return 2
      case 'delivered': return 3
      default: return 0
    }
  }

  const currentIndex = isCancelled ? -1 : getStepIndex(status)

  return (
    <div
      className="p-5 sm:p-6 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">লাইভ ট্র্যাকিং</span>
          <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--color-text)' }}>
            অর্ডার নং: <span className="font-mono text-[var(--color-primary)]">#{orderNumber}</span>
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">অর্ডার তারিখ:</span>
          <div className="text-xs font-bold text-[var(--color-text)]">
            {new Date(createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {isCancelled ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={24} className="flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে</div>
            <div className="text-xs text-red-600 mt-0.5">যেকোনো তথ্যের জন্য আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।</div>
          </div>
        </div>
      ) : (
        <div>
          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 relative">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isPassed = idx <= currentIndex
              const isCurrent = idx === currentIndex

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative">
                  {/* Connection Line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className="absolute top-4 left-1/2 w-full h-1 -z-0"
                      style={{
                        background: idx < currentIndex ? 'var(--color-success)' : '#e5e7eb',
                      }}
                    />
                  )}

                  {/* Icon Node */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center relative z-10 transition-all ${
                      isPassed ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Labels */}
                  <div className="mt-2.5">
                    <div
                      className={`text-[11px] sm:text-xs font-bold leading-tight ${
                        isPassed ? 'text-[var(--color-text)]' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                      {step.sub}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Status Pill */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-gray-500">বর্তমান অবস্থা:</span>
            <span className="font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● {STEPS[currentIndex]?.title || 'প্রক্রিয়াকরণ চলছে'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
