'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Image as ImageIcon, Eye, EyeOff, Clock, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { BannerForm } from '@/components/admin/BannerForm'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  cta_text: string | null
  cta_url: string | null
  background_color: string
  text_color: string
  position: string
  sort_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface Props {
  banners: Banner[]
}

const positionLabels: Record<string, string> = {
  hero: 'Hero',
  promo: 'Promo',
  sidebar: 'Sidebar',
}

const positionVariants: Record<string, 'success' | 'info' | 'warning'> = {
  hero: 'success',
  promo: 'info',
  sidebar: 'warning',
}

export function BannersTable({ banners }: Props) {
  const router = useRouter()
  const [editBanner, setEditBanner] = useState<Banner | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleNew = () => {
    setEditBanner(null)
    setShowForm(true)
  }

  const handleEdit = (banner: Banner) => {
    setEditBanner(banner)
    setShowForm(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  const getStatus = (banner: Banner): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } => {
    if (!banner.is_active) return { label: 'Disabled', variant: 'default' }
    const now = new Date()
    if (banner.end_date && new Date(banner.end_date) < now) return { label: 'Expired', variant: 'danger' }
    if (banner.start_date && new Date(banner.start_date) > now) return { label: 'Scheduled', variant: 'warning' }
    return { label: 'Active', variant: 'success' }
  }

  if (banners.length === 0) {
    return (
      <>
        <div
          className="p-12 rounded-[var(--radius-lg)] border text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <ImageIcon size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            No banners yet
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Create your first promotional banner
          </div>
          <button
            onClick={handleNew}
            className="inline-block px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            + Create Banner
          </button>
        </div>

        <BannerForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
          banner={editBanner}
        />
      </>
    )
  }

  // Group by position
  const grouped = banners.reduce((acc, banner) => {
    if (!acc[banner.position]) acc[banner.position] = []
    acc[banner.position].push(banner)
    return acc
  }, {} as Record<string, Banner[]>)

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([position, items]) => (
          <div key={position}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
                {positionLabels[position] || position}
              </h3>
              <Badge variant={positionVariants[position] || 'default'} size="sm">
                {items.length}
              </Badge>
            </div>

            <div
              className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--color-background)' }}>
                      <th className="w-8 px-3 py-3"></th>
                      <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        Preview
                      </th>
                      <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        Content
                      </th>
                      <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                        CTA
                      </th>
                      <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                        Schedule
                      </th>
                      <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        Status
                      </th>
                      <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((banner) => {
                      const status = getStatus(banner)
                      const isDeleting = deleting === banner.id
                      return (
                        <tr
                          key={banner.id}
                          className="border-t transition-colors hover:bg-[var(--color-surface-hover)]"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <td className="px-3 py-3">
                            <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="w-32 h-16 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden relative flex-shrink-0"
                              style={{ background: banner.background_color }}
                            >
                              {banner.image_url && (
                                <img
                                  src={banner.image_url}
                                  alt={banner.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                                />
                              )}
                              <div
                                className="relative text-[10px] font-black text-center px-2 line-clamp-2"
                                style={{ color: banner.text_color }}
                              >
                                {banner.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                              {banner.title}
                            </div>
                            {banner.subtitle && (
                              <div className="text-[10px] font-semibold uppercase tracking-wide line-clamp-1" style={{ color: 'var(--color-primary)' }}>
                                {banner.subtitle}
                              </div>
                            )}
                            {banner.description && (
                              <div className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                {banner.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                              {banner.cta_text || 'Shop Now'}
                            </div>
                            <div className="text-[10px] font-mono truncate max-w-[150px]" style={{ color: 'var(--color-text-muted)' }}>
                              {banner.cta_url || '/products'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell">
                            {banner.start_date || banner.end_date ? (
                              <div className="text-[10px] flex flex-col gap-0.5 items-center" style={{ color: 'var(--color-text-muted)' }}>
                                {banner.start_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={9} />
                                    {new Date(banner.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </div>
                                )}
                                {banner.end_date && (
                                  <div className="flex items-center gap-1">
                                    → {new Date(banner.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Always</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={status.variant} size="sm">
                              {banner.is_active ? <Eye size={9} className="inline mr-1" /> : <EyeOff size={9} className="inline mr-1" />}
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEdit(banner)}
                                className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-hover)]"
                                style={{ color: 'var(--color-primary)' }}
                                aria-label="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id, banner.title)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-error-bg)] disabled:opacity-50"
                                style={{ color: 'var(--color-error)' }}
                                aria-label="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BannerForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
        banner={editBanner}
      />
    </>
  )
}
