import Link from 'next/link'
import { Award } from 'lucide-react'

const BRANDS = [
  { name: 'Samsung', emoji: '📱', color: '#1428A0', tag: 'Official Store' },
  { name: 'Apple', emoji: '🍎', color: '#555555', tag: 'Premium Authorized' },
  { name: 'Xiaomi', emoji: '⚡', color: '#FF6900', tag: 'Flagship Store' },
  { name: "L'Oréal", emoji: '💄', color: '#E31B23', tag: '100% Genuine' },
  { name: 'Bata', emoji: '👞', color: '#D92D3F', tag: 'Original Shoes' },
  { name: 'Aarong', emoji: '✨', color: '#8B5CF6', tag: 'Fashion Store' },
  { name: 'Realme', emoji: '🟡', color: '#F4B400', tag: 'Official Gadgets' },
  { name: 'Nivea', emoji: '🧴', color: '#0032A0', tag: 'Skin Care' },
]

export function BrandShowcase() {
  return (
    <section className="py-6 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--color-text)' }}>
              Top Official Brands (শীর্ষ বিশ্বস্ত ব্র্যান্ডসমূহ)
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            সকল ব্র্যান্ড দেখুন →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              href={`/products?q=${encodeURIComponent(b.name)}`}
              className="group p-3 rounded-[var(--radius-md)] border text-center transition-all hover:shadow-md hover:-translate-y-1"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{b.emoji}</div>
              <div className="font-bold text-xs group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text)' }}>
                {b.name}
              </div>
              <span className="inline-block text-[9px] font-semibold text-gray-400 mt-0.5">
                {b.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
