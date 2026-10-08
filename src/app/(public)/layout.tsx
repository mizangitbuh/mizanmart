import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { FloatingSupportWidget } from '@/components/home/FloatingSupportWidget'
import { CartDrawer } from '@/components/shop/CartDrawer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      {/* Global overlays — support & cart drawer */}
      <FloatingSupportWidget />
      <CartDrawer />
    </div>
  )
}
