'use client'

import { baseEmailTemplate, BRAND_PINK } from '@/lib/email/base-template'
import { Modal } from '@/components/ui/Modal'
import { Eye } from 'lucide-react'

/** Plain text → HTML paragraphs (mirrors server textToHtml). */
export function previewTextToHtml(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px 0;font-size:15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n')
}

export function buildCampaignPreviewHtml(subject: string, bodyText: string, siteUrl: string): string {
  void subject
  return baseEmailTemplate({
    title: 'Martivo Newsletter',
    intro: '',
    body: `${previewTextToHtml(bodyText)}
      <div style="margin:28px 0 0 0;padding-top:20px;border-top:1px solid #E2E8F0;">
        <p style="margin:0;font-size:12px;color:#64748B;text-align:center;">
          এই ইমেইল পেতে চান না?
          <span style="color:${BRAND_PINK};text-decoration:underline;font-weight:600;">Unsubscribe করুন</span>
          (আসল লিংক পাঠানোর সময় যোগ হবে)
        </p>
      </div>`,
    siteUrl,
  })
}

export function CampaignPreview({
  open,
  onClose,
  subject,
  bodyText,
}: {
  open: boolean
  onClose: () => void
  subject: string
  bodyText: string
}) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://martivo.com'
  return (
    <Modal isOpen={open} onClose={onClose} title="Email Preview" maxWidth="2xl">
      <div className="p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <Eye size={14} />
          <span>
            Subject: <strong style={{ color: 'var(--color-text)' }}>{subject || '(no subject)'}</strong>
          </span>
        </div>
        <div
          className="rounded-[var(--radius-md)] border overflow-hidden max-h-[60vh] overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', background: 'white' }}
        >
          <iframe
            title="Campaign preview"
            sandbox=""
            srcDoc={buildCampaignPreviewHtml(subject, bodyText, siteUrl)}
            className="w-full"
            style={{ minHeight: '480px', border: '0' }}
          />
        </div>
      </div>
    </Modal>
  )
}
