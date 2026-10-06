'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Video,
  Film,
  Play,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type MediaType = 'image' | 'gif' | 'video' | 'none'

interface Props {
  mediaUrl: string | null
  mediaType: MediaType
  onChange: (url: string | null, type: MediaType) => void
}

const ACCEPTED_TYPES = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export function BannerMediaUpload({ mediaUrl, mediaType, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectMediaType = (mimeType: string): MediaType => {
    if (mimeType === 'image/gif') return 'gif'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('image/')) return 'image'
    return 'none'
  }

  const handleFile = async (file: File) => {
    setError('')

    // Validate type
    if (!ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES]) {
      setError(`Unsupported format: ${file.type}. Use JPG, PNG, WebP, GIF, MP4, WebM.`)
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 25MB allowed.`)
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      const supabase = createClient()

      // Generate unique filename
      const ext = file.name.split('.').pop() || 'bin'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const fileName = `banners/${timestamp}-${random}.${ext}`

      setProgress(30)

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('banner-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      setProgress(80)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('banner-media')
        .getPublicUrl(data.path)

      setProgress(100)

      // Detect type
      const detectedType = detectMediaType(file.type)

      // Update parent
      onChange(urlData.publicUrl, detectedType)

      setTimeout(() => setProgress(0), 500)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemove = () => {
    onChange(null, 'none')
    setError('')
  }

  // ═══ Preview if media exists ═══
  if (mediaUrl) {
    return (
      <div className="space-y-2">
        <div
          className="relative rounded-[var(--radius-lg)] overflow-hidden group"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-background)' }}
        >
          {/* Media preview */}
          {mediaType === 'video' ? (
            <video
              src={mediaUrl}
              className="w-full max-h-64 object-contain bg-black"
              controls
              muted
              loop
            />
          ) : (
            <div className="relative w-full h-48">
              <Image
                src={mediaUrl}
                alt="Banner media"
                fill
                className="object-contain bg-black"
                unoptimized={mediaType === 'gif'}
              />
            </div>
          )}

          {/* Type badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            {mediaType === 'video' && <Video size={11} />}
            {mediaType === 'gif' && <Film size={11} />}
            {mediaType === 'image' && <ImageIcon size={11} />}
            {mediaType.toUpperCase()}
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            aria-label="Remove media"
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] border transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <Upload size={14} />
            Replace
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>
    )
  }

  // ═══ Upload state ═══
  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-all ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        style={{
          borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border-strong)',
          background: isDragging ? 'var(--color-primary-light)' : 'var(--color-background)',
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <>
            <Loader2
              size={40}
              className="mx-auto mb-3 animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
            <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Uploading...
            </div>
            {/* Progress bar */}
            <div
              className="max-w-xs mx-auto h-1.5 rounded-full overflow-hidden mt-3"
              style={{ background: 'var(--color-border)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {progress}%
            </div>
          </>
        ) : (
          <>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <Upload size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              ক্লিক করে ফাইল আপলোড করো
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              অথবা ফাইল টেনে এনে ছেড়ে দাও (drag & drop)
            </div>

            {/* Supported types */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
              <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <ImageIcon size={11} />
                Image (JPG, PNG, WebP)
              </div>
              <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Film size={11} />
                GIF
              </div>
              <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Play size={11} />
                Video (MP4, WebM)
              </div>
            </div>
            <div className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
              সর্বোচ্চ ২৫ MB
            </div>
          </>
        )}
      </div>

      {error && (
        <div
          className="flex items-start gap-2 text-xs p-3 rounded-[var(--radius-md)]"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
