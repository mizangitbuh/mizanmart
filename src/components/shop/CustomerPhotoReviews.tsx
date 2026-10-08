'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoItem {
  id: string
  url: string
  reviewer: string
  rating: number
  comment: string
}

export function CustomerPhotoReviews({ productName, seed }: { productName: string; seed: string }) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)

  const photos: PhotoItem[] = [
    {
      id: 'p1',
      url: `https://picsum.photos/seed/${seed}-review1/600/600`,
      reviewer: 'আরিফ আহমেদ',
      rating: 5,
      comment: 'খুব সুন্দর ফিনিশিং! যেমনটা ছবিতে দেখেছি হুবহু তেমনটাই পেয়েছি।',
    },
    {
      id: 'p2',
      url: `https://picsum.photos/seed/${seed}-review2/600/600`,
      reviewer: 'নাজমুন নাহার',
      rating: 5,
      comment: 'প্যাকেজিং খুব ভালো ছিল। নির্ধারিত সময়ের আগেই ডেলিভারি পেয়েছি।',
    },
    {
      id: 'p3',
      url: `https://picsum.photos/seed/${seed}-review3/600/600`,
      reviewer: 'সাব্বির হোসেন',
      rating: 4,
      comment: 'কোয়ালিটি ভালো। দামে একদম উপযুক্ত।',
    },
    {
      id: 'p4',
      url: `https://picsum.photos/seed/${seed}-review4/600/600`,
      reviewer: 'তাসনিমা আক্তার',
      rating: 5,
      comment: '১০০% অরিজিনাল পণ্য। সবাইকে নেওয়ার জন্য রিকমেন্ড করছি।',
    },
  ]

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border mt-8"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Camera size={18} style={{ color: 'var(--color-primary)' }} />
        <h2 className="text-base font-black" style={{ color: 'var(--color-text)' }}>
          Customer Photos & Real Images (কাস্টমারদের তোলা আসল ছবি)
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--radius-md)] overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] cursor-pointer flex-shrink-0 transition-all hover:scale-105 shadow-sm"
            style={{ background: 'var(--color-background)' }}
          >
            <Image src={photo.url} alt={`${productName} review photo`} fill className="object-cover" sizes="112px" />
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
              ★ {photo.rating}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-[var(--radius-lg)] overflow-hidden border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-square w-full">
              <Image src={selectedPhoto.url} alt="Review full photo" fill className="object-cover" />
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--color-text)]">{selectedPhoto.reviewer}</span>
                <span className="text-yellow-500 font-bold text-xs">{'★'.repeat(selectedPhoto.rating)}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedPhoto.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
