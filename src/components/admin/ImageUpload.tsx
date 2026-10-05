'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 5 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      setError(`সর্বোচ্চ ${maxImages}টি image আপলোড করা যাবে`)
      return
    }

    setUploading(true)
    setError('')

    const supabase = createClient()
    const newUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} — এটা image file না`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} — 5MB এর চেয়ে বড়`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Upload failed: ${uploadError.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path)

        newUrls.push(urlData.publicUrl)
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden group"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <span
                  className="absolute bottom-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded"
                  style={{ background: 'var(--color-primary)' }}
                >
                  MAIN
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-[var(--color-surface-hover)] transition"
        style={{ borderColor: 'var(--color-border-strong)' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 size={32} className="mx-auto mb-2 animate-spin" style={{ color: 'var(--color-primary)' }} />
            <div className="text-sm font-medium text-[var(--color-text)]">আপলোড হচ্ছে...</div>
          </>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
            <div className="text-sm font-bold text-[var(--color-text)] mb-1">
              ক্লিক করে ছবি আপলোড করো
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              JPG, PNG, WebP · সর্বোচ্চ 5MB · {maxImages}টি পর্যন্ত
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <ImageIcon size={12} />
        {images.length} / {maxImages} images
      </div>
    </div>
  )
}
