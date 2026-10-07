import { Truck, Banknote, RotateCcw, Headphones, ShieldCheck, Package } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'ফ্রি ডেলিভারি',
    titleEn: 'Free Delivery',
    description: '৳১০০০+ অর্ডারে',
    color: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    icon: RotateCcw,
    title: '৭ দিন রিটার্ন',
    titleEn: '7-Day Return',
    description: 'সহজ রিটার্ন সুবিধা',
    color: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    icon: ShieldCheck,
    title: '১০০% অরিজিনাল',
    titleEn: '100% Genuine',
    description: 'নিশ্চিত মানের পণ্য',
    color: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    icon: Banknote,
    title: 'নিরাপদ পেমেন্ট',
    titleEn: 'Secure Payment',
    description: 'bKash, Nagad, COD',
    color: '#F5F3FF',
    iconColor: '#7C3AED',
  },
  {
    icon: Package,
    title: 'ক্যাশ অন ডেলিভারি',
    titleEn: 'Cash on Delivery',
    description: 'পণ্য পেয়ে টাকা দাও',
    color: '#FFF1F2',
    iconColor: '#D92D3F',
  },
  {
    icon: Headphones,
    title: '২৪/৭ সাপোর্ট',
    titleEn: '24/7 Support',
    description: 'সবসময় পাশে আছি',
    color: '#F0FDF4',
    iconColor: '#16A34A',
  },
]

export function TrustStrip() {
  return (
    <section
      className="border-y"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center gap-2 py-4 px-3"
                style={{
                  borderRight: i < features.length - 1 ? '1px solid var(--color-border)' : 'none',
                  borderBottom: i < 2 ? '1px solid var(--color-border)' : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: feature.color }}
                >
                  <Icon size={18} style={{ color: feature.iconColor }} />
                </div>
                <div>
                  <div className="font-bold text-xs leading-tight" style={{ color: 'var(--color-text)' }}>
                    {feature.title}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {feature.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
