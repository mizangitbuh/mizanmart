import Image from 'next/image'
import Link from 'next/link'

interface Props {
  /** 'full' = icon + stacked text (navbar); 'compact' = smaller; 'icon' = icon only */
  variant?: 'full' | 'compact' | 'icon'
  /** Link wrapper. Pass null inside existing <Link> to avoid double <a> */
  href?: string | null
  /** Height of the icon in px. Text scales proportionally */
  height?: number
  /** Brand name — change this when shop name changes */
  brandName?: string
  /** Text color scheme: split = "Mizan" navy + "Mart" red (default) */
  className?: string
}

export function Logo({
  variant = 'full',
  href = '/',
  height,
  brandName = 'MizanMart',
  className = '',
}: Props) {
  // Split brand name into two parts for two-tone coloring
  // e.g., "MizanMart" → ["Mizan", "Mart"]
  // For any name, split in half
  const mid = Math.ceil(brandName.length / 2)
  const part1 = brandName.slice(0, mid)
  const part2 = brandName.slice(mid)

  // Icon size scales with variant
  const iconSize = height ?? (variant === 'compact' ? 32 : 42)
  const textSize =
    variant === 'compact'
      ? Math.max(9, Math.round(iconSize * 0.34))
      : Math.max(10, Math.round(iconSize * 0.38))

  const content =
    variant === 'icon' ? (
      <Image
        src="/brand/logo-icon.png"
        alt={brandName}
        width={iconSize}
        height={iconSize}
        priority
        style={{ width: iconSize, height: iconSize, objectFit: 'contain' }}
      />
    ) : (
      <div
        className={`inline-flex flex-col items-center ${className}`}
        style={{ lineHeight: 1 }}
      >
        <Image
          src="/brand/logo-icon.png"
          alt={brandName}
          width={iconSize}
          height={iconSize}
          priority
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <span
          className="font-black tracking-tight whitespace-nowrap mt-0.5"
          style={{ fontSize: textSize, letterSpacing: '-0.02em' }}
        >
          <span style={{ color: '#1D3557' }}>{part1}</span>
          <span style={{ color: '#E63946' }}>{part2}</span>
        </span>
      </div>
    )

  if (href === null) return content

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  )
}
