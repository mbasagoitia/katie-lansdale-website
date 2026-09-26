"use client"

import {useSyncExternalStore} from "react"
import styles from "./AddToCartButton.module.css"

const STORAGE_KEY = "katie-lansdale-cart"

type CartProduct = {id: string; title: string; price: number}

export default function AddToCartButton({product}: {product: CartProduct}) {
  const added = useSyncExternalStore(subscribeToCart, () => readCart().some((item) => item.id === product.id), () => false)

  function addToCart() {
    const cart = readCart()
    if (!cart.some((item) => item.id === product.id)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart, product]))
      window.dispatchEvent(new CustomEvent("katie-lansdale-cart-updated"))
    }
  }

  return <button type="button" className={styles.button} onClick={addToCart} disabled={added}>{added ? "Added to cart" : "Add to cart"}</button>
}

function subscribeToCart(callback: () => void) {
  window.addEventListener("katie-lansdale-cart-updated", callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener("katie-lansdale-cart-updated", callback)
    window.removeEventListener("storage", callback)
  }
}

function readCart(): CartProduct[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    const cart = value ? JSON.parse(value) : []
    return Array.isArray(cart) ? cart.filter(isCartProduct) : []
  } catch {
    return []
  }
}

function isCartProduct(value: unknown): value is CartProduct {
  return Boolean(value && typeof value === "object" && "id" in value && "title" in value && "price" in value)
}
