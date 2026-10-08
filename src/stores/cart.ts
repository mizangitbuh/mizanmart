import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  slug: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isDrawerOpen?: boolean
  openDrawer?: () => void
  closeDrawer?: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i),
            isDrawerOpen: true,
          })
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            isDrawerOpen: true,
          })
        }
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) return get().removeItem(productId)
        set({ items: get().items.map((i) => i.productId === productId ? { ...i, quantity } : i) })
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'mizanmart-cart' }
  )
)
