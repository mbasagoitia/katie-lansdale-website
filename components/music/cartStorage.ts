export const CART_STORAGE_KEY = "katie-lansdale-cart"
export const CART_UPDATED_EVENT = "katie-lansdale-cart-updated"
export const EMPTY_CART: CartProduct[] = []

export type CartProduct = {id: string; title: string; price: number}

let cachedValue: string | null | undefined
let cachedCart: CartProduct[] = EMPTY_CART

export function readCart(): CartProduct[] {
  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY)
    if (value === cachedValue) return cachedCart
    const cart = value ? JSON.parse(value) : []
    cachedValue = value
    cachedCart = Array.isArray(cart) ? cart.filter(isCartProduct) : EMPTY_CART
    return cachedCart
  } catch {
    return EMPTY_CART
  }
}

export function writeCart(cart: CartProduct[]) {
  const value = JSON.stringify(cart)
  cachedValue = value
  cachedCart = cart
  window.localStorage.setItem(CART_STORAGE_KEY, value)
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function isCartProduct(value: unknown): value is CartProduct {
  return Boolean(value && typeof value === "object" && "id" in value && "title" in value && "price" in value)
}
