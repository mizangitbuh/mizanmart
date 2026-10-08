'use client'

import { useState } from 'react'
import { Package, Send, PhoneCall, Check, Sparkles } from 'lucide-react'

interface Props {
  productName: string
  productPrice: number
  sku?: string | null
}

export function WholesaleInquiry({ productName, productPrice, sku }: Props) {
  const [copied, setCopied] = useState(false)
  const whatsappNumber = '8801700000000' // Default store WhatsApp
  
  const inquiryMessage = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি MizanMart থেকে "${productName}" (SKU: ${sku || 'N/A'}) পণ্যটি পাইকারি / বাল্ক অর্ডারে (৫+ পিস) নিতে আগ্রহী। অনুগ্রহ করে হোলসেল রেট এবং মিনিমাম কোয়ান্টিটি জানাবেন।`
  )

  const handleCopy = () => {
    navigator.clipboard?.writeText('+880 1700-000000')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-4 sm:p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        borderColor: '#FDE68A',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Package size={16} />
          </div>
          <div>
            <h3 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
              পাইকারি ও বাল্ক অর্ডার (Wholesale)
              <Sparkles size={13} className="text-amber-600" />
            </h3>
            <p className="text-[11px] text-amber-800">
              দোকানদার ও রিসেলারদের জন্য বিশেষ চায়না ফ্যাক্টরি রেট
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
          MOQ: ৫+ পিস
        </span>
      </div>

      <p className="text-xs text-amber-900/90 mb-3 leading-relaxed">
        যেহেতু আমরা সরাসরি চায়না থেকে বড় ভলিউমে আমদানি করি, তাই ৫ পিস বা তার বেশি অর্ডারে আকর্ষণীয় পাইকারি মূল্য উপভোগ করুন।
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${inquiryMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-sm hover:shadow active:scale-95"
          style={{ background: '#25D366' }}
        >
          <Send size={13} />
          হোয়াটসঅ্যাপে রেট জানুন
        </a>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-white text-amber-900 border border-amber-300 transition-colors hover:bg-amber-50"
        >
          <PhoneCall size={12} className="text-amber-700" />
          {copied ? '✓ নম্বর কপি হয়েছে' : 'হটলাইন: ০১৭০০-০০০০০০'}
        </button>
      </div>
    </div>
  )
}
