import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
  banners: Banner[]
}

export function PromoBanners({ banners }: Props) {
  if (!banners || banners.length === 0) return null

  return (
    <section className="section-pad">
      <div className="container-main">
        <div className={`grid gap-4 ${banners.length === 1 ? 'grid-cols-1' : banners.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {banners.map((banner) => {
            const mediaUrl = banner.media_url || banner.image_url
            const mediaType = banner.media_type || (banner.image_url ? 'image' : 'none')
            const hasVideo = mediaUrl && mediaType === 'video'
            const hasImage = mediaUrl && (mediaType === 'image' || mediaType === 'gif')

            return (
              <Link
                key={banner.id}
                href={banner.cta_url || '/products'}
                className="rounded-[var(--radius-xl)] p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 group min-h-[200px] flex items-center"
                style={{ background: banner.background_color, color: banner.text_color }}
              >
                {hasVideo && (
                  <video
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    src={mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}

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

                <div className="relative z-10 w-full">
                  {banner.subtitle && (
                    <div
                      className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                      style={{ background: 'rgba(255,255,255,0.25)' }}
                    >
                      {banner.subtitle}
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-black mb-2 leading-tight">
                    {banner.title}
                  </h3>

                  {banner.description && (
                    <p className="text-sm opacity-90 mb-4">{banner.description}</p>
                  )}

                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-transform group-hover:scale-105"
                    style={{ background: banner.text_color, color: banner.background_color }}
                  >
                    {banner.cta_text || 'Shop Now'}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
