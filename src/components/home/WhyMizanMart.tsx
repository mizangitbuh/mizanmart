import { ShieldCheck, Sparkles, BadgeCheck, Wallet } from 'lucide-react'

const reasons = [
  {
    icon: BadgeCheck,
    title: '100% Authentic Products',
    description: 'সব পণ্য ১০০% আসল এবং কোয়ালিটি যাচাই করা। কোনো নকল পণ্য আমরা বিক্রি করি না।',
    color: '#10B981',
  },
  {
    icon: Wallet,
    title: 'Best Price Guarantee',
    description: 'বাজারের সেরা দামে পণ্য। আপনি খুঁজে পাবেন না অন্য কোথাও কম দামে।',
    color: '#F59E0B',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Shopping',
    description: 'আপনার তথ্য সুরক্ষিত। নিরাপদ পেমেন্ট এবং গোপনীয়তা আমাদের অঙ্গীকার।',
    color: '#3B82F6',
  },
  {
    icon: Sparkles,
    title: 'Premium Experience',
    description: 'প্রতিটি অর্ডারে যত্নসহ প্যাকিং, দ্রুত ডেলিভারি, এবং দুর্দান্ত গ্রাহক সেবা।',
    color: '#D92D3F',
  },
]

export function WhyMizanMart() {
  return (
    <section className="section-pad" style={{ background: 'var(--color-background)' }}>
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            WHY MIZANMART
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            কেন MizanMart?
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            হাজারো গ্রাহক আমাদের উপর ভরসা রাখেন — কারণ আমরা শুধু পণ্য বিক্রি করি না, সম্পর্ক তৈরি করি।
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon
            return (
              <div
                key={reason.title}
                className="p-6 rounded-[var(--radius-lg)] border text-center transition-all hover:shadow-lg hover:-translate-y-1"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: reason.color + '15' }}
                >
                  <Icon size={26} style={{ color: reason.color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  {reason.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {reason.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
