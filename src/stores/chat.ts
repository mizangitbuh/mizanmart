import { create } from 'zustand'

interface ChatState {
  isOpen: boolean
  activeOrderId: string | null
  activeOrderNumber: string | null
  openChat: (orderId?: string | null, orderNumber?: string | null) => void
  closeChat: () => void
  setOrder: (orderId: string | null, orderNumber?: string | null) => void
}

/**
 * Global support-chat state.
 * Lets order pages ("Ask about this order") open the floating
 * ChatWidget with a specific orderId context.
 */
export const useChatStore = create<ChatState>()((set) => ({
  isOpen: false,
  activeOrderId: null,
  activeOrderNumber: null,
  openChat: (orderId = null, orderNumber = null) =>
    set({ isOpen: true, activeOrderId: orderId, activeOrderNumber: orderNumber }),
  closeChat: () => set({ isOpen: false }),
  setOrder: (orderId, orderNumber = null) =>
    set({ activeOrderId: orderId, activeOrderNumber: orderNumber }),
}))
