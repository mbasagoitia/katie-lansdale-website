"use client"

import {useSyncExternalStore} from "react"
import {readCart, subscribeToCart, type CartProduct, writeCart} from "./cartStorage"
import styles from "./AddToCartButton.module.css"

export default function AddToCartButton({product}: {product: CartProduct}) {
  const added = useSyncExternalStore(subscribeToCart, () => readCart().some((item) => item.id === product.id), () => false)

  function addToCart() {
    const cart = readCart()
    if (!cart.some((item) => item.id === product.id)) {
      writeCart([...cart, product])
    }
  }

  return <button type="button" className={styles.button} onClick={addToCart} disabled={added}>{added ? "Added to cart" : "Add to cart"}</button>
}
