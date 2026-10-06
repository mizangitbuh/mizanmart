import type { Metadata } from 'next'
import { Inter, Noto_Sans_Bengali } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MizanMart — বাংলাদেশের সেরা অনলাইন শপ',
  description: 'Cosmetics, Clothing, Electronics, General — Quality products. Better prices. Easy delivery.',
  keywords: ['online shop', 'bangladesh', 'ecommerce', 'cosmetics', 'clothing', 'electronics'],
  openGraph: {
    title: 'MizanMart — বাংলাদেশের সেরা অনলাইন শপ',
    description: 'Quality products. Better prices. Easy delivery.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoBengali.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
