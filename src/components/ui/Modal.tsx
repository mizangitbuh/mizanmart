'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fullScreenMobile?: boolean
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  fullScreenMobile = false,
}: Props) {
  // Esc key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClasses[maxWidth]} rounded-[var(--radius-lg)] border overflow-hidden ${
          fullScreenMobile ? 'max-h-full md:max-h-[85vh]' : 'max-h-[90vh]'
        } flex flex-col`}
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="flex items-center justify-between p-4 md:p-5 border-b flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-black text-base md:text-lg" style={{ color: 'var(--color-text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
