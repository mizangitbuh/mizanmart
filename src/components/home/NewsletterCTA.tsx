import { Mail, Send } from 'lucide-react'

export function NewsletterCTA() {
  return (
    <section className="section-pad" style={{ background: 'var(--color-surface)' }}>
      <div className="container-main">
        <div
          className="rounded-[var(--radius-xl)] p-8 md:p-12 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #B91C2C 0%, #D92D3F 100%)' }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: '#FFFFFF' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: '#FFFFFF' }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Mail size={12} />
              NEWSLETTER
            </div>

            <h2 className="text-2xl md:text-4xl font-black mb-3">
              Stay Updated
            </h2>
            <p className="text-sm md:text-base opacity-90 mb-6">
              নতুন অফার, ছাড় এবং এক্সক্লুসিভ ডিল সবার আগে পেতে সাবস্ক্রাইব করুন।
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 text-sm rounded-full focus:outline-none text-gray-900"
                style={{ background: 'white' }}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 bg-yellow-400 hover:bg-yellow-300 text-gray-900"
              >
                <Send size={16} />
                Subscribe
              </button>
            </form>

            <p className="text-xs opacity-75 mt-4">
              আমরা কখনো স্প্যাম পাঠাই না। যেকোনো সময় unsubscribe করুন।
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
