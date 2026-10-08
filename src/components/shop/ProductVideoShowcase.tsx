'use client'

import { useState } from 'react'
import { Play, Sparkles, X, CheckCircle2, ShieldCheck, Video } from 'lucide-react'

interface Props {
  productName: string
  thumbnailUrl: string
  videoUrl?: string
}

export function ProductVideoShowcase({ productName, thumbnailUrl, videoUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const videoFeatures = [
    'কারখানা থেকে ইনট্যাক্ট বক্স আনবক্সিং',
    'বাস্তব হ্যান্ডস-অন বিল্ড কোয়ালিটি ডেমো',
    'ঢাকা ওয়্যারহাউসের লাইভ টেস্ট ফুটেজ',
  ]

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-4 sm:p-5"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
            style={{ background: 'var(--color-primary)' }}
          >
            <Video size={16} />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--color-text)] flex items-center gap-1.5">
              লাইভ আনবক্সিং ও ভিডিও রিভিউ
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              পণ্য কেনার আগে সরাসরি বাস্তবের আনবক্সিং ভিডিও দেখুন
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--color-success-bg, #DCFCE7)',
            color: 'var(--color-success, #16A34A)',
          }}
        >
          ✓ 100% আসল ফুটেজ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Video Thumbnail with Play Button */}
        <div className="md:col-span-5 relative group cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-gray-200 bg-gray-900 shadow-sm">
            <img
              src={thumbnailUrl}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 active:scale-95"
                style={{ background: 'var(--color-primary)' }}
              >
                <Play size={20} className="ml-1 fill-white" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              ০১:৪৫ মিনিট ডেমো
            </div>
          </div>
        </div>

        {/* Video Highlights */}
        <div className="md:col-span-7 space-y-2.5">
          <h4 className="text-xs font-bold text-[var(--color-text)]">
            ভিডিওতে যা দেখানো হয়েছে:
          </h4>
          <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            {videoFeatures.map((feat, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--color-primary)' }}
          >
            <Play size={13} className="fill-white" />
            এখনই ভিডিওটি দেখুন
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 bg-gray-900 border-b border-gray-800 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-bold truncate max-w-sm">
                  {productName} — আনবক্সিং ও ডেমো
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Container (HTML5 or YouTube embed) */}
            <div className="aspect-video w-full bg-black flex items-center justify-center relative">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  title={productName}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center">
                    <Play size={28} className="ml-1 text-white" />
                  </div>
                  <h4 className="font-bold text-sm">অফিসিয়াল টেস্ট ফুটেজ লোড হচ্ছে</h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    আমাদের ওয়্যারহাউসে প্রতিটি পণ্য প্যাকিংয়ের আগে লাইভ ভিডিও রেকর্ড ও কোয়ালিটি টেস্ট করা হয়।
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs px-4 py-2 rounded-full font-bold bg-white text-black hover:bg-gray-200"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
