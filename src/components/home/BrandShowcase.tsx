'use client'

import Link from 'next/link'
import { Plane, ShieldCheck, Warehouse, Banknote, Sparkles, ArrowRight } from 'lucide-react'

export function BrandShowcase() {
  const factoryHighlights = [
    {
      icon: Plane,
      title: 'সরাসরি চায়না আমদানি',
      subtitle: 'মাঝখানে কোনো মধ্যস্বত্বভোগী নেই, ফ্যাক্টরি থেকে সরাসরি গ্রাহকের হাতে।',
      badge: 'Factory-to-Consumer',
    },
    {
      icon: ShieldCheck,
      title: 'ডাবল QC কোয়ালিটি টেস্ট',
      subtitle: 'কারখানা ও ঢাকা ওয়্যারহাউসে প্রতিটি পণ্য ল্যাব টেস্টে উত্তীর্ণ।',
      badge: '100% Tested',
    },
    {
      icon: Warehouse,
      title: 'রেডি ওয়্যারহাউস স্টক',
      subtitle: 'সব পণ্য নিজস্ব ওয়্যারহাউসে মজুদ থাকে, কোনো প্রি-অর্ডার বিলম্ব নেই।',
      badge: 'Instant Dispatch',
    },
    {
      icon: Banknote,
      title: 'ক্যাশ অন ডেলিভারি',
      subtitle: 'ডেলিভারি ম্যানের সামনে পণ্য চেক করে মূল্য পরিশোধের পূর্ণ নিশ্চয়তা।',
      badge: 'Pay on Delivery',
    },
  ]

  const popularImportCollections = [
    { label: 'স্মার্ট গ্যাজেটস', query: 'gadget', icon: '⚡' },
    { label: 'চার্জার ও পাওয়ার', query: 'charger', icon: '🔌' },
    { label: 'হেডফোন ও অডিও', query: 'headphone', icon: '🎧' },
    { label: 'স্মার্ট ওয়াচ', query: 'watch', icon: '⌚' },
    { label: 'হোম ও কিচেন', query: 'home', icon: '🍳' },
    { label: 'নতুন চায়না স্টক', query: '', icon: '🇨🇳' },
  ]

  return (
    <section
      className="py-6 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇨🇳</span>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                MizanMart ডিরেক্ট ফ্যাক্টরি নিশ্চয়তা
                <Sparkles size={15} className="text-amber-500" />
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                চীন থেকে নিজস্ব তত্ত্বাবধানে আমদানিকৃত ১০০% আসল পণ্যের কালেকশন
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            সব পণ্য দেখুন <ArrowRight size={13} />
          </Link>
        </div>

        {/* 4 Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {factoryHighlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-3.5 rounded-[var(--radius-md)] border flex items-start gap-3 transition-all hover:shadow-md"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-[var(--color-text)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Importer Collection Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold whitespace-nowrap text-gray-500">
            জনপ্রিয় ক্যাটাগরি:
          </span>
          {popularImportCollections.map((col, i) => (
            <Link
              key={i}
              href={col.query ? `/products?q=${encodeURIComponent(col.query)}` : '/products?sort=newest'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <span>{col.icon}</span>
              <span>{col.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
