'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Share2, MessageCircle, Send } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

const shopLinks = [
  { name: 'সব পণ্য', href: '/products' },
  { name: 'কসমেটিক্স', href: '/products?category=cosmetics' },
  { name: 'পোশাক', href: '/products?category=clothing' },
  { name: 'ইলেকট্রনিক্স', href: '/products?category=electronics' },
  { name: 'জেনারেল', href: '/products?category=general' },
  { name: '⚡ Flash Sale', href: '/products?discount=yes' },
]

const helpLinks = [
  { name: 'আমার অর্ডার', href: '/account/orders' },
  { name: 'রিটার্ন পলিসি', href: '#' },
  { name: 'শিপিং পলিসি', href: '#' },
  { name: 'FAQ', href: '#' },
  { name: 'পেমেন্ট পদ্ধতি', href: '#' },
]

const aboutLinks = [
  { name: 'আমাদের সম্পর্কে', href: '#' },
  { name: 'ব্লগ', href: '#' },
  { name: 'ক্যারিয়ার', href: '#' },
  { name: 'প্রাইভেসি পলিসি', href: '#' },
  { name: 'শর্তাবলী', href: '#' },
]

export function Footer() {
  return (
    <footer style={{ background: 'var(--color-text)', color: 'white' }}>
      {/* Main footer grid */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 16px 24px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Col 1: Brand + Contact */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Logo href={null} variant="icon" height={36} />
              <span
                className="text-2xl font-black tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', letterSpacing: '-0.03em' }}
              >
                <span style={{ color: '#D6336C' }}>M</span>
                <span style={{ color: 'white' }}>artivo</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। সেরা পণ্য, সেরা দাম, দ্রুত ডেলিভারি।
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone size={13} style={{ color: 'var(--color-primary)' }} />
                <span>01871418973</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                <span>jobmizanew@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h3 className="font-black text-sm mb-4 text-white">শপ করুন</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors hover:text-[var(--color-primary)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Help */}
          <div>
            <h3 className="font-black text-sm mb-4 text-white">সাহায্য</h3>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-black text-sm mt-6 mb-3 text-white">আমাদের সম্পর্কে</h3>
            <ul className="space-y-2">
              {aboutLinks.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter + Payment */}
          <div>
            <h3 className="font-black text-sm mb-3 text-white">নিউজলেটার সাবস্ক্রাইব করুন</h3>
            <p className="text-xs text-gray-400 mb-3">
              সর্বশেষ অফার ও ডিল সরাসরি আপনার ইনবক্সে পান
            </p>
            <form className="flex gap-2 mb-5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                className="flex-1 px-3 py-2 rounded-l text-xs text-black focus:outline-none"
                style={{ background: '#f3f4f6', color: '#171717' }}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-r text-white flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}
              >
                <Send size={13} />
              </button>
            </form>

            {/* Payment methods */}
            <h3 className="font-black text-xs mb-2 text-white">পেমেন্ট পদ্ধতি</h3>
            <div className="flex flex-wrap gap-2">
              {['bKash', 'Nagad', 'Rocket', 'COD', 'Card'].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded text-[10px] font-bold"
                  style={{ background: '#333', color: '#ddd' }}
                >
                  {method}
                </span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-4">
              {[
                { icon: Share2, href: '#', label: 'Facebook' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp' },
                { icon: Send, href: '#', label: 'Telegram' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-primary)]"
                  style={{ background: '#333' }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500"
          style={{ borderTop: '1px solid #333' }}
        >
          <div>© {new Date().getFullYear()} Martivo. সর্বস্বত্ব সংরক্ষিত।</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</Link>
            <Link href="#" className="hover:text-white transition-colors">শর্তাবলী</Link>
            <Link href="#" className="hover:text-white transition-colors">যোগাযোগ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
