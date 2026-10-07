import { getStoreSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>
              স্টোর সেটিংস (Store Settings)
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            স্টোর তথ্য, ডেলিভারি চার্জ, পেমেন্ট মেথড ও নোটিশ কনফিগার করুন
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit">
          <ShieldCheck size={16} />
          <span>Audit Logged Protection</span>
        </div>
      </div>

      {/* Settings Form */}
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
