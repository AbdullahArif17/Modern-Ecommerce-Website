import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: any[];
  image?: any;
  slug: string | { current: string };
  description?: string;
}

interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  isCartOpen: boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item._id === product._id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity >= 5 ? 5 : item.quantity + 1 }
                  : item
              ),
              isCartOpen: true
            }
          }
          return { items: [...state.items, { ...product, quantity: 1 }], isCartOpen: true }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === productId ? { ...item, quantity: quantity > 5 ? 5 : quantity } : item
          ),
        })),

      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen }))
    }),
    {
      name: 'cart-storage',
    }
  )
)
