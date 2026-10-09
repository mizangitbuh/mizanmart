'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'

export interface Subscriber {
  id: string
  email: string
  name: string | null
  status: 'active' | 'unsubscribed' | 'bounced'
  source: string | null
  subscribed_at: string
  unsubscribed_at: string | null
  last_email_sent_at: string | null
}

const statusVariant: Record<Subscriber['status'], 'success' | 'default' | 'danger'> = {
  active: 'success',
  unsubscribed: 'default',
  bounced: 'danger',
}

const statusLabel: Record<Subscriber['status'], string> = {
  active: 'Active',
  unsubscribed: 'Unsubscribed',
  bounced: 'Bounced',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'এখনই'
  if (mins < 60) return `${mins} মিনিট আগে`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ঘণ্টা আগে`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} দিন আগে`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toCsv(rows: Subscriber[]): string {
  const esc = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`
  const header = 'email,name,status,source,subscribed_at,unsubscribed_at'
  const lines = rows.map((r) =>
    [esc(r.email), esc(r.name), esc(r.status), esc(r.source), esc(r.subscribed_at), esc(r.unsubscribed_at)].join(',')
  )
  return [header, ...lines].join('\n')
}


export function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`"${email}" কে ডিলিট করবেন? এই action undo করা যাবে না।`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      toast.success('Subscriber ডিলিট হয়েছে')
      router.refresh()
    } catch {
      toast.error('ডিলিট করা যায়নি')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExport = () => {
    if (subscribers.length === 0) {
      toast.error('Export করার মতো data নেই')
      return
    }
    const blob = new Blob([toCsv(subscribers)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${subscribers.length} টি row export হয়েছে`)
  }

  if (subscribers.length === 0) {
    return (
      <div
        className="p-10 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
          কোনো subscriber নেই
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Footer থেকে signup করলে এখানে দেখা যাবে
        </p>
      </div>
    )
  }

  const headers = ['Email', 'Name', 'Status', 'Source', 'Subscribed', 'Actions']

  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex justify-end px-4 pt-3">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <Download size={13} style={{ color: 'var(--color-primary)' }} />
          Export CSV ({subscribers.length})
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: 'var(--color-border)' }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                <td className="px-4 py-3 font-semibold text-xs break-all" style={{ color: 'var(--color-text)' }}>
                  {s.email}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text)' }}>
                  {s.name || '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[s.status]} size="sm">
                    {statusLabel[s.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {s.source || '—'}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                  {timeAgo(s.subscribed_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(s.id, s.email)}
                    disabled={deletingId === s.id}
                    className="p-1.5 rounded hover:bg-red-50 transition disabled:opacity-50"
                    style={{ color: '#DC2626' }}
                    aria-label={`Delete ${s.email}`}
                    title="Delete"
                  >
                    {deletingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
