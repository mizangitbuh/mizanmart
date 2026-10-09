'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Save, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { CampaignPreview } from '@/components/admin/CampaignPreview'

type Scope = 'all' | 'new30'

export function CampaignForm({
  activeCount,
  new30Count,
}: {
  activeCount: number
  new30Count: number
}) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const recipients = scope === 'all' ? activeCount : new30Count

  const validate = () => {
    if (!subject.trim()) {
      toast.error('Subject দিন (সর্বোচ্চ ১২০ অক্ষর)')
      return false
    }
    if (!bodyText.trim()) {
      toast.error('Email body লিখুন')
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!validate() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body_text: bodyText.trim(), recipient_scope: scope }),
      })
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; id?: string; error?: string }
      if (!res.ok || !json.success || !json.id) {
        toast.error(json.error || 'Draft save করা যায়নি')
        return
      }
      toast.success('Draft saved ✓')
      router.push(`/admin/newsletter/campaigns/${json.id}`)
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা')
    } finally {
      setSaving(false)
    }

  }
  const handleSendNow = async () => {
    if (!validate() || sending) return
    setSending(true)
    try {
      const createRes = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body_text: bodyText.trim(), recipient_scope: scope }),
      })
      const created = (await createRes.json().catch(() => ({}))) as {
        success?: boolean
        id?: string
        error?: string
      }
      if (!createRes.ok || !created.success || !created.id) {
        toast.error(created.error || 'Campaign তৈরি করা যায়নি')
        return
      }
      const sendRes = await fetch(`/api/admin/newsletter/campaigns/${created.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_scope: scope, confirm: true }),
      })
      const sent = (await sendRes.json().catch(() => ({}))) as {
        success?: boolean
        sent_count?: number
        failed_count?: number
        testModeHint?: string
        error?: string
      }
      if (!sendRes.ok || !sent.success) {
        toast.error(sent.error || 'পাঠানো যায়নি')
        router.push(`/admin/newsletter/campaigns/${created.id}`)
        return
      }
      toast.success(`পাঠানো হয়েছে: ${sent.sent_count} sent, ${sent.failed_count} failed`)
      if (sent.testModeHint) toast.warning(sent.testModeHint, { duration: 8000 })
      router.push(`/admin/newsletter/campaigns/${created.id}`)
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা')
    } finally {
      setSending(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="p-4 md:p-5 rounded-[var(--radius-lg)] border space-y-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--color-text)' }}>
            Subject * <span style={{ color: 'var(--color-text-muted)' }}>({subject.length}/120)</span>
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value.slice(0, 120))}
            placeholder="যেমন: ঈদ অফার — সব পণ্যে ২০% ছাড়! 🎉"
            maxLength={120}
            className="w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--color-text)' }}>
            Body * <span style={{ color: 'var(--color-text-muted)' }}>(plain text — খালি লাইন = নতুন প্যারা)</span>
          </label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value.slice(0, 20000))}
            placeholder={'প্রিয় গ্রাহক,\n\nঈদ উপলক্ষে...\n\nশুভেচ্ছান্তে,\nটিম Martivo'}
            rows={10}
            maxLength={20000}
            className="w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none resize-y"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
          />
          <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {bodyText.length}/20000 অক্ষর
          </div>
        </div>
        <div>
          <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--color-text)' }}>
            প্রাপক (Recipients)
          </label>
          <div className="flex flex-wrap gap-2">
            <ScopeButton active={scope === 'all'} onClick={() => setScope('all')} label={`All active (${activeCount})`} />
            <ScopeButton active={scope === 'new30'} onClick={() => setScope('new30')} label={`New (last 30d, ${new30Count})`} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-surface)' }}
        >
          <Eye size={14} />
          Preview
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={saving || sending}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80 disabled:opacity-50"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Draft
        </button>
        <button
          onClick={() => {
            if (!validate()) return
            setConfirmOpen(true)
          }}
          disabled={saving || sending}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send Now → {recipients} জন
        </button>
      </div>
      <CampaignPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        subject={subject}
        bodyText={bodyText}
      />
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="নিশ্চিত করুন" maxWidth="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            এই campaign <strong>{recipients} জন</strong> subscriber-এর কাছে পাঠানো হবে।
            পাঠানোর পর undo করা যাবে না।
          </p>
          {recipients > 1 && (
            <p className="text-xs p-3 rounded-[var(--radius-md)]" style={{ background: '#FEF3C7', color: '#92400E' }}>
              ⚠️ Resend test mode-এ শুধু martivocom@gmail.com-এ মেইল যায়। Domain verify না থাকলে অন্যরা পাবে না।
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              বাতিল
            </button>
            <button
              onClick={handleSendNow}
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white disabled:opacity-50"
              style={{ background: '#DC2626' }}
            >
              {sending ? 'পাঠানো হচ্ছে...' : `হ্যাঁ, ${recipients} জনে পাঠান`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ScopeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] border transition"
      style={{
        background: active ? 'var(--color-primary)' : 'var(--color-background)',
        color: active ? 'white' : 'var(--color-text)',
        borderColor: 'var(--color-border)',
      }}
    >
      {label}
    </button>
  )
}

