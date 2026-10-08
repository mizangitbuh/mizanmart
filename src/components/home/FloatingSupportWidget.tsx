'use client'

import { useState } from 'react'
import { MessageCircle, Phone, X, Headphones, Clock } from 'lucide-react'

export function FloatingSupportWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40">
      {/* Floating Popup Card */}
      {open && (
        <div
          className="mb-3 w-72 rounded-[var(--radius-lg)] shadow-2xl border p-4 animate-fade-in-up"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b mb-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <Headphones size={16} />
              </div>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                  Martivo কাস্টমার সাপোর্ট
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  সাপোর্ট টিম অনলাইন আছে
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* WhatsApp Link */}
            <a
              href="https://wa.me/8801871418973?text=Hello%20Martivo%20Support,%20I%20need%20help%20with%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] bg-emerald-600 text-white font-bold transition-transform hover:scale-[1.02] shadow-sm"
            >
              <MessageCircle size={17} />
              <span>হোয়াটসঅ্যাপে চ্যাট করুন (WhatsApp)</span>
            </a>

            {/* Direct Phone Call */}
            <a
              href="tel:01871418973"
              className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] border font-bold transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Phone size={15} style={{ color: 'var(--color-primary)' }} />
              <span>হটলাইনে কল করুন (01871418973)</span>
            </a>
          </div>

          <div className="mt-3 pt-2 border-t text-[10px] text-gray-400 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <span>সকাল ৯:০০ - রাত ১১:০০</span>
            <span className="font-medium text-gray-500">৭ দিন ২৪ ঘণ্টা</span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        }}
        title="সাপোর্টের সাথে কথা বলুন"
        aria-label="Customer Support"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
