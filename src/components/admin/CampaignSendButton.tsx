'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'

/** Draft campaign view → send with confirmation. */
export function CampaignSendButton({
  campaignId,
  activeCount,
}: {
  campaignId: string
  activeCount: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_scope: 'all', confirm: true }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean
        sent_count?: number
        failed_count?: number
        testModeHint?: string
        error?: string
      }
      if (!res.ok || !json.success) {
        toast.error(json.error || 'পাঠানো যায়নি')
        return
      }
      toast.success(`পাঠানো হয়েছে: ${json.sent_count} sent, ${json.failed_count} failed`)
      if (json.testModeHint) toast.warning(json.testModeHint, { duration: 8000 })
      router.refresh()
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা')
    } finally {
      setSending(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white transition hover:opacity-90"
        style={{ background: 'var(--color-primary)' }}
      >
        <Send size={14} />
        Send to {activeCount} subscribers
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="নিশ্চিত করুন" maxWidth="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            এই draft <strong>{activeCount} জন</strong> active subscriber-এর কাছে পাঠানো হবে।
            Undo করা যাবে না।
          </p>
          {activeCount > 1 && (
            <p className="text-xs p-3 rounded-[var(--radius-md)]" style={{ background: '#FEF3C7', color: '#92400E' }}>
              ⚠️ Resend test mode-এ শুধু martivocom@gmail.com-এ মেইল যায়।
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              বাতিল
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white disabled:opacity-50"
              style={{ background: '#DC2626' }}
            >
              {sending ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> পাঠানো হচ্ছে...
                </span>
              ) : (
                `হ্যাঁ, পাঠান`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
