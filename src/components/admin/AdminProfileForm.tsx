'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Phone,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Package,
  ShoppingBag,
  Ticket,
  Image as ImageIcon,
  Tag,
  Settings as SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'

interface AuditLogItem {
  id: string
  action: string
  entity_type: string
  entity_name: string | null
  created_at: string
}

interface ProfileData {
  full_name: string
  email: string
  phone: string
  role: string
  created_at?: string
}

interface Props {
  initialProfile: ProfileData
  userEmail: string
  userId: string
  lastSignInAt?: string | null
  recentLogs: AuditLogItem[]
}

const entityIcons: Record<string, any> = {
  product: Package,
  order: ShoppingBag,
  customer: User,
  coupon: Ticket,
  banner: ImageIcon,
  category: Tag,
  settings: SettingsIcon,
  profile: User,
}

function formatActionLabel(action: string): string {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(' → ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AdminProfileForm({
  initialProfile,
  userEmail,
  userId,
  lastSignInAt,
  recentLogs,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info')

  // Profile Info state
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Format initial letter
  const userInitial = (fullName || 'A').charAt(0).toUpperCase()

  // Format join date
  const memberDate = initialProfile.created_at
    ? new Date(initialProfile.created_at).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'সম্প্রতি'

  // Profile Info Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileStatus(null)

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে')
      }

      setProfileStatus({
        type: 'success',
        message: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!',
      })
      router.refresh()
    } catch (err: any) {
      setProfileStatus({
        type: 'error',
        message: err.message || 'কিছু ভুল হয়েছে, পুনরায় চেষ্টা করুন',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  // Password Update Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!',
      })
      return
    }

    setPasswordSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw new Error(error.message)
      }

      setPasswordStatus({
        type: 'success',
        message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',
      })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordStatus({
        type: 'error',
        message: err.message || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ─── Profile Overview Header Card ─── */}
      <div
        className="p-6 md:p-8 rounded-[var(--radius-lg)] border relative overflow-hidden shadow-sm"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-md transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)',
                }}
              >
                {userInitial}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500 shadow-sm"
                title="Active Now"
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
                  {fullName || 'Admin User'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={12} />
                  Administrator
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {userEmail}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  সদস্য: {memberDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles size={13} />
                  ফুল পারমিশন অ্যাক্টিভ
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-[var(--radius-md)] border hover:bg-[var(--color-surface-hover)] transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <Activity size={14} style={{ color: 'var(--color-primary)' }} />
              অডিট লগ
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-[var(--radius-md)] border hover:bg-[var(--color-surface-hover)] transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <SettingsIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
              স্টোর সেটিংস
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Tabs Navigation ─── */}
      <div
        className="flex border-b gap-2 pb-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'info'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent hover:border-gray-300 text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <User size={16} />
          ব্যক্তিগত তথ্য (Profile Info)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent hover:border-gray-300 text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <KeyRound size={16} />
          নিরাপত্তা ও পাসওয়ার্ড (Security)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'activity'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent hover:border-gray-300 text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Activity size={16} />
          রিসেন্ট অ্যাক্টিভিটি (Activity)
        </button>
      </div>

      {/* ─── TAB 1: Profile Information ─── */}
      {activeTab === 'info' && (
        <div
          className="p-6 md:p-8 rounded-[var(--radius-lg)] border space-y-6"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              ব্যক্তিগত তথ্য আপডেট
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              এডমিন হিসেবে প্রদর্শিত আপনার নাম এবং ফোন নম্বর পরিবর্তন করুন
            </p>
          </div>

          {profileStatus && (
            <div
              className={`p-4 rounded-[var(--radius-md)] border flex items-center gap-3 ${
                profileStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {profileStatus.type === 'success' ? (
                <CheckCircle2 size={18} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{profileStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                পূর্ণ নাম (Full Name) *
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                মোবাইল নম্বর (Phone)
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  লগইন ইমেইল (Login Email)
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ভেরিফাইড
                </span>
              </div>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  value={userEmail}
                  disabled
                  className="pl-10 opacity-75 cursor-not-allowed bg-[var(--color-surface-hover)]"
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                ℹ️ নিরাপত্তার স্বার্থে লগইন ইমেইল সরাসরি এই প্যানেল থেকে পরিবর্তন করা যাবে না।
              </p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                ইউজার রোল (Role)
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  value="System Administrator (Admin)"
                  disabled
                  className="pl-10 opacity-75 cursor-not-allowed bg-[var(--color-surface-hover)] font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" loading={profileSaving} className="w-full sm:w-auto px-6">
                পরিবর্তন সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 2: Security & Password ─── */}
      {activeTab === 'security' && (
        <div
          className="p-6 md:p-8 rounded-[var(--radius-lg)] border space-y-6"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              লগইন পাসওয়ার্ড পরিবর্তন
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              অ্যাকাউন্টের সুরক্ষার জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড সেট করুন
            </p>
          </div>

          {passwordStatus && (
            <div
              className={`p-4 rounded-[var(--radius-md)] border flex items-center gap-3 ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 size={18} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{passwordStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 lg:col-span-2">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  নতুন পাসওয়ার্ড (New Password) *
                </label>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর লিখুন"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  নতুন পাসওয়ার্ড পুনরায় লিখুন (Confirm Password) *
                </label>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পাসওয়ার্ডটি আবার লিখুন"
                    required
                    className="pl-10 pr-10"
                  />
                </div>
              </div>

              {/* Match indicator */}
              {newPassword && confirmPassword && (
                <div className="text-xs font-medium">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> পাসওয়ার্ড দুটি মিলেছে
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1.5">
                      <AlertCircle size={14} /> পাসওয়ার্ড দুটি মিলছে না
                    </span>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button type="submit" loading={passwordSaving} className="w-full sm:w-auto px-6">
                  পাসওয়ার্ড আপডেট করুন
                </Button>
              </div>
            </form>

            {/* Security Tips Card */}
            <div
              className="p-5 rounded-[var(--radius-md)] border space-y-3 self-start"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
                সুরক্ষা টিপস
              </div>
              <ul className="text-xs space-y-2 list-disc list-inside" style={{ color: 'var(--color-text-muted)' }}>
                <li>কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড ব্যবহার করা সেরা।</li>
                <li>সংখ্যা (0-9) এবং বিশেষ চিহ্ন (@, #, $) যুক্ত করুন।</li>
                <li>সহজে অনুমানযোগ্য যেমন নাম বা জন্মতারিখ পরিহার করুন।</li>
                <li>অন্য কোনো ওয়েবসাইটে ব্যবহৃত পাসওয়ার্ড এখানে ব্যবহার করবেন না।</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Recent Activity ─── */}
      {activeTab === 'activity' && (
        <div
          className="p-6 md:p-8 rounded-[var(--radius-lg)] border space-y-6"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                আপনার সাম্প্রতিক কর্মকাণ্ড (Recent Activity)
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                এই এডমিন অ্যাকাউন্ট থেকে সম্পাদিত সাম্প্রতিক পরিবর্তন ও অ্যাকশনসমূহ
              </p>
            </div>

            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              সকল অডিট লগ দেখুন <ArrowRight size={14} />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
              <Activity size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">এখনো কোনো অ্যাক্টিভিটি রেকর্ড পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {recentLogs.map((log) => {
                const IconComponent = entityIcons[log.entity_type] || Activity
                const formattedTime = new Date(log.created_at).toLocaleString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--color-surface-hover)' }}
                      >
                        <IconComponent size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                          {formatActionLabel(log.action)}
                          {log.entity_name && (
                            <span className="font-normal text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                              ({log.entity_name})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {log.entity_type.toUpperCase()} • {formattedTime}
                        </div>
                      </div>
                    </div>

                    <Badge variant="info" size="sm">
                      {log.action.split('.')[1] || log.action}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
