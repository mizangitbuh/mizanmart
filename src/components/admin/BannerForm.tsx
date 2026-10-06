'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Image as ImageIcon, Palette, Link as LinkIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BannerMediaUpload, type MediaType } from '@/components/admin/BannerMediaUpload'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  banner: any | null
}

const positions = [
  { value: 'hero', label: 'Hero (Main Homepage Banner)' },
  { value: 'promo', label: 'Promo (Promotional Section)' },
  { value: 'sidebar', label: 'Sidebar (Side Column)' },
]

const colorPresets = [
  { name: 'Deep Red', value: '#C62828' },
  { name: 'Dark Red', value: '#8E0000' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Black', value: '#171717' },
]

export function BannerForm({ isOpen, onClose, onSuccess, banner }: Props) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>('none')
  const [ctaText, setCtaText] = useState('Shop Now')
  const [ctaUrl, setCtaUrl] = useState('/products')
  const [bgColor, setBgColor] = useState('#C62828')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [position, setPosition] = useState('hero')
  const [sortOrder, setSortOrder] = useState('0')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (banner) {
        setTitle(banner.title || '')
        setSubtitle(banner.subtitle || '')
        setDescription(banner.description || '')
        // Priority: media_url > image_url (backward compat)
        setMediaUrl(banner.media_url || banner.image_url || null)
        setMediaType(banner.media_type || (banner.image_url ? 'image' : 'none'))
        setCtaText(banner.cta_text || 'Shop Now')
        setCtaUrl(banner.cta_url || '/products')
        setBgColor(banner.background_color || '#C62828')
        setTextColor(banner.text_color || '#FFFFFF')
        setPosition(banner.position || 'hero')
        setSortOrder(String(banner.sort_order || 0))
        setStartDate(banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : '')
        setEndDate(banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : '')
        setIsActive(banner.is_active !== false)
      } else {
        setTitle('')
        setSubtitle('')
        setDescription('')
        setMediaUrl(null)
        setMediaType('none')
        setCtaText('Shop Now')
        setCtaUrl('/products')
        setBgColor('#C62828')
        setTextColor('#FFFFFF')
        setPosition('hero')
        setSortOrder('0')
        setStartDate('')
        setEndDate('')
        setIsActive(true)
      }
      setError('')
    }
  }, [isOpen, banner])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload: any = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
        // Backward compat — keep image_url in sync
        image_url: mediaType === 'image' || mediaType === 'gif' ? mediaUrl : null,
        cta_text: ctaText.trim() || 'Shop Now',
        cta_url: ctaUrl.trim() || '/products',
        background_color: bgColor,
        text_color: textColor,
        position,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
      }

      if (banner) payload.id = banner.id

      const res = await fetch('/api/admin/banners', {
        method: banner ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save banner')

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl my-8 rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-light)' }}>
              <ImageIcon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
                {banner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {banner ? `Editing: ${banner.title}` : 'Add promotional content'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-hover)]" style={{ color: 'var(--color-text-muted)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ═══ Media Upload (Image/GIF/Video) ═══ */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <ImageIcon size={12} />
              Banner Media (Image / GIF / Video)
            </h3>
            <BannerMediaUpload
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              onChange={(url, type) => {
                setMediaUrl(url)
                setMediaType(type)
              }}
            />
          </div>

          {/* ═══ Content ═══ */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Content
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Shop the Latest Trends"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="NEW COLLECTION 2026"
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cosmetics · Clothing · Electronics · General"
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* ═══ CTA ═══ */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <LinkIcon size={12} />
              Call to Action
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Button Link</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/products"
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
          </div>

          {/* ═══ Appearance ═══ */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <Palette size={12} />
              Appearance
            </h3>

            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Background Color
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {colorPresets.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setBgColor(c.value)}
                    className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      background: c.value,
                      borderColor: bgColor === c.value ? 'var(--color-text)' : 'transparent',
                      boxShadow: bgColor === c.value ? '0 0 0 2px white inset' : 'none',
                    }}
                    aria-label={c.name}
                    title={c.name}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer ml-2"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 px-2 py-1.5 text-xs font-mono rounded border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
          </div>

          {/* ═══ Position & Schedule ═══ */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Position & Schedule
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                >
                  {positions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text)' }}>End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-background)' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Active</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Show on homepage</div>
              </div>
            </label>
          </div>

          {/* ═══ Live Preview ═══ */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <Eye size={12} />
              Live Preview
            </h3>

            <div
              className="rounded-[var(--radius-lg)] p-6 text-center relative overflow-hidden min-h-[180px] flex items-center justify-center"
              style={{ background: bgColor, color: textColor }}
            >
              {/* Media in preview */}
              {mediaUrl && mediaType === 'video' && (
                <video
                  src={mediaUrl}
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              )}
              {mediaUrl && (mediaType === 'image' || mediaType === 'gif') && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `url(${mediaUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              <div className="relative z-10">
                {subtitle && (
                  <div className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
                    {subtitle}
                  </div>
                )}
                <div className="text-2xl font-black mb-2">{title || 'Banner Title'}</div>
                {description && <div className="text-sm opacity-90 mb-4">{description}</div>}
                <span className="inline-block px-5 py-2 rounded-full font-bold text-sm" style={{ background: 'white', color: bgColor }}>
                  {ctaText || 'Shop Now'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-[var(--radius-md)]">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : banner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
