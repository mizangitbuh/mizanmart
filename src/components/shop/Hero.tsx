import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  media_url: string | null
  media_type: string | null
  cta_text: string | null
  cta_url: string | null
  background_color: string
  text_color: string
}

interface Props {
  banner: Banner | null
}

export function Hero({ banner }: Props) {
  const title = banner?.title || 'Shop the Latest Trends'
  const subtitle = banner?.subtitle || 'NEW COLLECTION 2026'
  const description = banner?.description || 'Cosmetics · Clothing · Electronics · General'
  const ctaText = banner?.cta_text || 'Shop Now'
  const ctaUrl = banner?.cta_url || '/products'
  const bgColor = banner?.background_color || '#C62828'
  const textColor = banner?.text_color || '#FFFFFF'

  // Media — priority: media_url > image_url
  const mediaUrl = banner?.media_url || banner?.image_url || null
  const mediaType = banner?.media_type || (banner?.image_url ? 'image' : 'none')

  const hasVideo = mediaUrl && mediaType === 'video'
  const hasImage = mediaUrl && (mediaType === 'image' || mediaType === 'gif')

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}DD 100%)`,
        }}
      />

      {/* Video background */}
      {hasVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Image/GIF background */}
      {hasImage && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${mediaUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Content */}
      <div className="container-main relative py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="fade-in-up" style={{ color: textColor }}>
            {subtitle && (
              <span
                className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                ✨ {subtitle}
              </span>
            )}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i >= title.split(' ').length / 2 ? 'block' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>

            {description && (
              <p className="text-base md:text-lg opacity-90 mb-8 max-w-lg whitespace-pre-line">
                {description}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105"
                style={{ background: textColor, color: bgColor }}
              >
                <ShoppingBag size={18} />
                {ctaText}
              </Link>
              <Link
                href="/products?category=cosmetics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all border-2"
                style={{ borderColor: textColor, color: textColor }}
              >
                Cosmetics
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex gap-6 mt-8 text-sm">
              <div>
                <div className="text-2xl font-black">500+</div>
                <div className="opacity-80 text-xs">Products</div>
              </div>
              <div className="border-l pl-6" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="text-2xl font-black">1000+</div>
                <div className="opacity-80 text-xs">Customers</div>
              </div>
              <div className="border-l pl-6" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="text-2xl font-black">24/7</div>
                <div className="opacity-80 text-xs">Support</div>
              </div>
            </div>
          </div>

          {/* Right: Featured image cards (only if no video) */}
          {!hasVideo && (
            <div className="hidden md:grid grid-cols-2 gap-4 relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3">
                <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>💄</div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 mt-8">
                <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>📱</div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3 -mt-8">
                <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }}>👕</div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform -rotate-3">
                <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>🛒</div>
              </div>
            </div>
          )}

          {/* Right: Video/media info (if video) */}
          {hasVideo && (
            <div className="hidden md:flex items-center justify-center">
              <div className="text-center" style={{ color: textColor }}>
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-3xl">▶</span>
                </div>
                <div className="text-sm font-bold opacity-90">Featured Video</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 leading-[0]">
        <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
          <path fill="var(--color-background)" d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  )
}
