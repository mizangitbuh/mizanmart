import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('shipping_address, customer_name, customer_phone')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const lastAddress = orders?.[0]?.shipping_address as any
  const hasAddress = !!(lastAddress?.address)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black mb-1 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
          Delivery Addresses
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Your saved delivery addresses
        </p>
      </div>

      {/* Info banner */}
      <div
        className="p-4 rounded-[var(--radius-lg)] border flex gap-3"
        style={{ background: 'var(--color-info-bg)', borderColor: 'var(--color-info)' }}
      >
        <Info size={18} style={{ color: 'var(--color-info)' }} className="flex-shrink-0 mt-0.5" />
        <div className="text-sm" style={{ color: 'var(--color-info)' }}>
          Address is auto-saved from your last order. Full address book coming soon.
        </div>
      </div>

      {/* Last Address */}
      {hasAddress ? (
        <div
          className="p-5 rounded-[var(--radius-lg)] border relative"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            Last Used
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                {orders?.[0]?.customer_name}
              </div>
              <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                {orders?.[0]?.customer_phone}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                {lastAddress.address}
                <br />
                {lastAddress.city}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-8 rounded-[var(--radius-lg)] border text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <MapPin size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            No addresses yet
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Your delivery address will appear here after your first order
          </div>
        </div>
      )}
    </div>
  )
}
