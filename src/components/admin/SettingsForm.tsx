'use client'

import { useState } from 'react'
import { StoreSettings } from '@/lib/settings'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import {
  Store,
  Truck,
  CreditCard,
  Bell,
  Share2,
  AlertTriangle,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

interface Props {
  initialSettings: StoreSettings
}

type TabType = 'general' | 'shipping' | 'payments' | 'inventory' | 'announcement' | 'social'

export function SettingsForm({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [settings, setSettings] = useState<StoreSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaveStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveStatus(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      setSettings(data.settings)
      setSaveStatus({ type: 'success', message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' })
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'সেটিংস সেভ করতে সমস্যা হয়েছে' })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'স্টোর তথ্য (General)', icon: Store },
    { id: 'shipping', label: 'শিপিং ও ডেলিভারি (Shipping)', icon: Truck },
    { id: 'payments', label: 'পেমেন্ট মেথড (Payments)', icon: CreditCard },
    { id: 'inventory', label: 'স্টক অ্যালার্ট (Inventory)', icon: AlertTriangle },
    { id: 'announcement', label: 'ব্যানার ও নোটিশ (Notice)', icon: Bell },
    { id: 'social', label: 'সোশ্যাল লিংক (Social)', icon: Share2 },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner Status */}
      {saveStatus && (
        <div
          className={`p-4 rounded-[var(--radius-lg)] border flex items-center gap-3 transition-all ${
            saveStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{saveStatus.message}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: General Store Settings */}
      {activeTab === 'general' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              সাধারণ স্টোর ইনফরমেশন
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              আপনার অনলাইন শপের নাম, যোগাযোগ নম্বর এবং ঠিকানা কনফিগার করুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                স্টোরের নাম (Store Name) *
              </label>
              <Input
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                placeholder="MizanMart"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                কারেন্সি সিম্বল (Currency Symbol)
              </label>
              <Input
                value={settings.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                placeholder="৳"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                স্টোর স্লোগান / ট্যাগলাইন
              </label>
              <Input
                value={settings.store_tagline}
                onChange={(e) => handleChange('store_tagline', e.target.value)}
                placeholder="Your trusted online shopping destination"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                সাপোর্ট ফোন নম্বর (Support Phone)
              </label>
              <Input
                value={settings.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                placeholder="+8801700000000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                হোয়াটসঅ্যাপ নম্বর (WhatsApp Support)
              </label>
              <Input
                value={settings.support_whatsapp}
                onChange={(e) => handleChange('support_whatsapp', e.target.value)}
                placeholder="+8801700000000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                সাপোর্ট ইমেইল (Support Email)
              </label>
              <Input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                placeholder="support@mizanmart.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                স্টোর / শোরুমের ঠিকানা
              </label>
              <Input
                value={settings.store_address}
                onChange={(e) => handleChange('store_address', e.target.value)}
                placeholder="ঢাকা, বাংলাদেশ"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shipping & Delivery */}
      {activeTab === 'shipping' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              শিপিং ও ডেলিভারি কনফিগারেশন
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              চেকআউটে গ্রাহকের জন্য ডেলিভারি ফি এবং ফ্রি শিপিং নিয়মাবলি সেট করুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[var(--radius-md)] border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                📍 ঢাকার ভেতরে ডেলিভারি
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  ডেলিভারি চার্জ (টাকায়)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={settings.inside_dhaka_shipping}
                  onChange={(e) => handleChange('inside_dhaka_shipping', Number(e.target.value))}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  আনুমানিক সময়
                </label>
                <Input
                  value={settings.estimated_delivery_dhaka}
                  onChange={(e) => handleChange('estimated_delivery_dhaka', e.target.value)}
                  placeholder="1-2 Days"
                />
              </div>
            </div>

            <div className="p-4 rounded-[var(--radius-md)] border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                🚚 ঢাকার বাইরে ডেলিভারি
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  ডেলিভারি চার্জ (টাকায়)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={settings.outside_dhaka_shipping}
                  onChange={(e) => handleChange('outside_dhaka_shipping', Number(e.target.value))}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  আনুমানিক সময়
                </label>
                <Input
                  value={settings.estimated_delivery_outside}
                  onChange={(e) => handleChange('estimated_delivery_outside', e.target.value)}
                  placeholder="3-5 Days"
                />
              </div>
            </div>

            <div
              className="md:col-span-2 p-4 rounded-[var(--radius-md)] border space-y-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    🎁 ফ্রি শিপিং সুবিধা (Free Shipping)
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    নির্দিষ্ট অংকের বেশি কেনাকাটা করলে গ্রাহক ফ্রি ডেলিভারি পাবেন
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.free_shipping_enabled}
                    onChange={(e) => handleChange('free_shipping_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>

              {settings.free_shipping_enabled && (
                <div className="pt-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    ন্যূনতম অর্ডার পরিমাণ (টাকায়)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => handleChange('free_shipping_threshold', Number(e.target.value))}
                    placeholder="1000"
                  />
                  <p className="text-[11px] mt-1 text-[var(--color-text-muted)]">
                    গ্রাহক {settings.free_shipping_threshold} টাকার বেশি অর্ডার করলে শিপিং চার্জ ০ টাকা হবে।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Methods */}
      {activeTab === 'payments' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              পেমেন্ট মেথড সেটিংস
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              চেকআউটে গ্রাহক কোন কোন মাধ্যমে পেমেন্ট করতে পারবেন তা নির্ধারণ করুন
            </p>
          </div>

          <div className="space-y-4">
            {/* COD */}
            <div
              className="p-4 rounded-[var(--radius-md)] border flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                  💵 ক্যাশ অন ডেলিভারি (Cash on Delivery)
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cod_enabled}
                  onChange={(e) => handleChange('cod_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              </label>
            </div>

            {/* bKash */}
            <div className="p-4 rounded-[var(--radius-md)] border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#E2136E]">
                    বিকাশ পেমেন্ট (bKash)
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    বিকাশ নম্বর ও মার্চেন্ট/পার্সোনাল ইনফো
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bkash_enabled}
                    onChange={(e) => handleChange('bkash_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2136E]"></div>
                </label>
              </div>

              {settings.bkash_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      বিকাশ অ্যাকাউন্ট নম্বর
                    </label>
                    <Input
                      value={settings.bkash_number}
                      onChange={(e) => handleChange('bkash_number', e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      অ্যাকাউন্টের ধরন
                    </label>
                    <Select
                      value={settings.bkash_type}
                      onChange={(e) => handleChange('bkash_type', e.target.value as any)}
                    >
                      <option value="personal">Personal (Send Money)</option>
                      <option value="merchant">Merchant (Payment)</option>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-[var(--radius-md)] border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#F7941D]">
                    নগদ পেমেন্ট (Nagad)
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    নগদ নম্বর ও মার্চেন্ট/পার্সোনাল ইনফো
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.nagad_enabled}
                    onChange={(e) => handleChange('nagad_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7941D]"></div>
                </label>
              </div>

              {settings.nagad_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      নগদ অ্যাকাউন্ট নম্বর
                    </label>
                    <Input
                      value={settings.nagad_number}
                      onChange={(e) => handleChange('nagad_number', e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      অ্যাকাউন্টের ধরন
                    </label>
                    <Select
                      value={settings.nagad_type}
                      onChange={(e) => handleChange('nagad_type', e.target.value as any)}
                    >
                      <option value="personal">Personal (Send Money)</option>
                      <option value="merchant">Merchant (Payment)</option>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Inventory & Alerts */}
      {activeTab === 'inventory' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              ইনভেন্টরি ও স্টক সতর্কতা
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              প্রোডাক্টের স্টক কমে গেলে এডমিন ড্যাশবোর্ড ও ইনভেন্টরিতে অ্যালার্ট দেখানো হবে
            </p>
          </div>

          <div className="max-w-md space-y-3">
            <label className="block text-xs font-bold" style={{ color: 'var(--color-text)' }}>
              লো-স্টক লিমিট (Low Stock Threshold)
            </label>
            <Input
              type="number"
              min="0"
              value={settings.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', Number(e.target.value))}
              placeholder="5"
            />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              কোনো প্রোডাক্টের স্টক {settings.low_stock_threshold} পিস বা তার নিচে নামলে তা এডমিনের ইনভেন্টরি পেজে
              "Low Stock" লাল ব্যাজ আকারে হাইলাইট হবে।
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Notice & Announcement */}
      {activeTab === 'announcement' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              ওয়েবসাইট ঘোষণা ও ব্যানার নোটিশ
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              গ্রাহকদের জন্য হেডার নোটিশ ব্যানার এবং মেইনটেন্যান্স মোড নিয়ন্ত্রণ করুন
            </p>
          </div>

          <div className="space-y-4">
            {/* Top Announcement Bar */}
            <div className="p-4 rounded-[var(--radius-md)] border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    📢 হেডার নোটিশ ব্যানার (Top Announcement Bar)
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    ওয়েবসাইটের একদম উপরে গুরুত্বপূর্ণ নোটিশ বা অফার প্রদর্শন করুন
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcement_enabled}
                    onChange={(e) => handleChange('announcement_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>

              {settings.announcement_enabled && (
                <div className="pt-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    নোটিশ মেসেজ (Text)
                  </label>
                  <Textarea
                    rows={2}
                    value={settings.announcement_text}
                    onChange={(e) => handleChange('announcement_text', e.target.value)}
                    placeholder="স্বাগতম মিজানমার্ট-এ! ১০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি ডেলিভারি!"
                  />
                </div>
              )}
            </div>

            {/* Maintenance Mode */}
            <div
              className="p-4 rounded-[var(--radius-md)] border flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle size={16} />
                  মেইনটেন্যান্স মোড (Maintenance Mode)
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  চালু করলে সাধারণ গ্রাহকদের ওয়েবসাইট আপগ্রেড চলার নোটিশ দেখানো যাবে
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Social Links */}
      {activeTab === 'social' && (
        <div
          className="p-6 rounded-[var(--radius-lg)] border space-y-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              সোশ্যাল মিডিয়া ও লিংক
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              ফুটার এবং স্টোরে গ্রাহকদের যুক্ত হওয়ার লিংক সেট করুন
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Facebook পেজ URL
              </label>
              <Input
                value={settings.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/mizanmart"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Instagram প্রোফাইল URL
              </label>
              <Input
                value={settings.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/mizanmart"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-text)' }}>
                YouTube চ্যানেল URL
              </label>
              <Input
                value={settings.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@mizanmart"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div
        className="sticky bottom-4 p-4 rounded-[var(--radius-lg)] border shadow-lg flex items-center justify-between z-20 backdrop-blur-md"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="text-xs text-[var(--color-text-muted)] hidden sm:block">
          পরিবর্তনগুলো সংরক্ষিত হলে স্বয়ংক্রিয়ভাবে অডিট লগে রেকর্ড হবে
        </div>
        <Button type="submit" loading={saving} size="md" className="gap-2 ml-auto">
          <Save size={16} />
          {saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সেভ করুন (Save Settings)'}
        </Button>
      </div>
    </form>
  )
}
