import { Truck, Banknote, RotateCcw, Headphones } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: '২-৫ দিনে সারাদেশে',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    description: 'পণ্য পেয়ে টাকা দাও',
  },
  {
    icon: RotateCcw,
    title: '7-Day Return',
    description: 'সহজ রিটার্ন সুবিধা',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'সবসময় পাশে আছি',
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
      <div className="container-main py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-primary-light)' }}
                >
                  <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {feature.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
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
