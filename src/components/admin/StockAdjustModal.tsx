'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: {
    id: string
    name: string
    sku: string | null
    stock_quantity: number
  } | null
}

const reasons = [
  { value: 'restock', label: 'New Stock Received' },
  { value: 'sale', label: 'Sold (manual)' },
  { value: 'damage', label: 'Damaged / Expired' },
  { value: 'return', label: 'Customer Return' },
  { value: 'correction', label: 'Inventory Correction' },
  { value: 'other', label: 'Other' },
]

export function StockAdjustModal({ isOpen, onClose, onSuccess, product }: Props) {
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('restock')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setMode('add')
      setQuantity('')
      setReason('restock')
      setNotes('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const currentStock = product.stock_quantity
  const qty = parseInt(quantity) || 0

  let newStock = currentStock
  if (mode === 'add') newStock = currentStock + qty
  else if (mode === 'remove') newStock = Math.max(0, currentStock - qty)
  else newStock = qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (qty <= 0 && mode !== 'set') {
      setError('Quantity must be greater than 0')
      return
    }
    if (mode === 'set' && qty < 0) {
      setError('Stock cannot be negative')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          newStock,
          reason,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update stock')

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <Package size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                Adjust Stock
              </h2>
              <div className="text-xs line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                {product.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current stock */}
          <div
            className="p-4 rounded-[var(--radius-md)] flex items-center justify-between"
            style={{ background: 'var(--color-background)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Current Stock
            </span>
            <span className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              {currentStock}
            </span>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['add', 'remove', 'set'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors"
                  style={{
                    background: mode === m ? 'var(--color-primary)' : 'var(--color-background)',
                    color: mode === m ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {m === 'add' && '+ Add'}
                  {m === 'remove' && '− Remove'}
                  {m === 'set' && '= Set To'}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={mode === 'set' ? '0' : '1'}
              required={mode !== 'set' || true}
              autoFocus
              placeholder={mode === 'set' ? 'New stock value' : 'How many?'}
              className="w-full px-4 py-3 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
            >
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-4 py-3 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Preview */}
          <div
            className="p-4 rounded-[var(--radius-md)] flex items-center justify-between"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
              New Stock
            </span>
            <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
              {newStock}
            </span>
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-[var(--radius-md)]">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
