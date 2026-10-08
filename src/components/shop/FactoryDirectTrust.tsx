'use client'

import { ShieldCheck, Plane, CheckCircle2, Award, Sparkles, RefreshCw } from 'lucide-react'

export function FactoryDirectTrust() {
  const points = [
    {
      icon: Plane,
      title: 'সরাসরি চায়না কারখানা থেকে আমদানি',
      desc: 'কোনো মধ্যস্বত্বভোগী বা থার্ড-পার্টি সেলার নেই, ফ্যাক্টরি থেকে সরাসরি গ্রাহকের হাতে।',
      badge: 'Direct Import',
    },
    {
      icon: ShieldCheck,
      title: 'ডাবল কোয়ালিটি কন্ট্রোল (Double QC)',
      desc: 'কারখানায় ১ বার এবং ঢাকা ওয়্যারহাউসে আনপ্যাকিংয়ের পর ২য় বার নিবিড় মান পরীক্ষা।',
      badge: '100% QC Passed',
    },
    {
      icon: RefreshCw,
      title: '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি',
      desc: 'পণ্য হাতে পেয়ে কোনো ডিফেক্ট বা অমিল পেলে ৭ দিনের মধ্যে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট।',
      badge: 'Replacement',
    },
    {
      icon: Award,
      title: 'অফিসিয়াল ওয়্যারহাউস শিপিং',
      desc: 'সব পণ্য আমাদের নিজস্ব সেন্ট্রাল ওয়্যারহাউসে ইন-স্টক থাকে, দ্রুততম সময়ে ডেলিভারি।',
      badge: 'Ready Stock',
    },
  ]

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-4 sm:p-5 transition-shadow hover:shadow-sm"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
            style={{ background: 'var(--color-primary)' }}
          >
            🇨🇳
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--color-text)] flex items-center gap-1.5">
              Martivo অফিসিয়াল ইমপোর্টার গ্যারান্টি
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              চীন থেকে সরাসরি আমদানিকৃত প্রিমিয়াম গ্রেড পণ্য
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider"
          style={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
            background: 'var(--color-primary-light)',
          }}
        >
          Factory-Direct
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {points.map((pt, idx) => {
          const Icon = pt.icon
          return (
            <div
              key={idx}
              className="p-3 rounded-lg flex items-start gap-3 transition-colors"
              style={{ background: 'var(--color-background)' }}
            >
              <div
                className="w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-xs text-[var(--color-text)]">
                    {pt.title}
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
