import Image from 'next/image'
import Link from 'next/link'

interface Props {
  variant?: 'stacked' | 'inline' | 'icon'
  href?: string | null
  className?: string
  height?: number
}

const BRAND_PINK = '#D6336C'

export function Logo({
  variant = 'stacked',
  href = '/',
  className = '',
  height,
}: Props) {
  // Icon-only variant — for tight spaces (invoice, etc.)
  if (variant === 'icon') {
    const h = height ?? 40
    const content = (
      <Image
        src="/brand/logo-icon.png"
        alt="Martivo"
        width={Math.round(h * 0.88)}
        height={h}
        priority
        style={{ height: h, width: 'auto', objectFit: 'contain' }}
      />
    )
    if (href === null) return content
    return <Link href={href} className="inline-flex items-center">{content}</Link>
  }

  // Inline variant — icon + text side by side (for wide navbar)
  if (variant === 'inline') {
    const h = height ?? 42
    const content = (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <Image
          src="/brand/logo-icon.png"
          alt="Martivo"
          width={Math.round(h * 0.88)}
          height={h}
          priority
          style={{ height: h, width: 'auto', objectFit: 'contain' }}
        />
        <span
          className="font-black tracking-tight leading-none"
          style={{
            fontSize: h * 0.68,
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: BRAND_PINK }}>M</span>
          <span style={{ color: 'var(--color-text)' }}>artivo</span>
        </span>
      </div>
    )
    if (href === null) return content
    return <Link href={href} className="inline-flex items-center">{content}</Link>
  }

  // Default: stacked variant — icon top, text below (centered)
  const iconH = height ?? 44
  const textSize = iconH * 0.62
  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <Image
        src="/brand/logo-icon.png"
        alt="Martivo"
        width={Math.round(iconH * 0.88)}
        height={iconH}
        priority
        style={{ height: iconH, width: 'auto', objectFit: 'contain' }}
      />
      <span
        className="font-black tracking-tight leading-none mt-1"
        style={{
          fontSize: textSize,
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          letterSpacing: '-0.03em',
        }}
      >
        <span style={{ color: BRAND_PINK }}>M</span>
        <span style={{ color: 'var(--color-text)' }}>artivo</span>
      </span>
    </div>
  )

  if (href === null) return content
  return <Link href={href} className="inline-flex items-center">{content}</Link>
}
