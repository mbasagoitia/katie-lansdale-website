"use client"

import {useEffect, useState, useSyncExternalStore} from "react"
import {EMPTY_CART, readCart, subscribeToCart, writeCart} from "./cartStorage"
import styles from "./CartPanel.module.css"

export default function CartPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const cart = useSyncExternalStore(subscribeToCart, readCart, () => EMPTY_CART)
  const subtotal = cart.reduce((total, item) => total + item.price, 0)

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isOpen])

  function removeItem(id: string) {
    writeCart(cart.filter((item) => item.id !== id))
  }

  if (cart.length === 0) return null

  return <>
    <button type="button" className={styles.trigger} onClick={() => setIsOpen(true)} aria-label={`Open cart with ${cart.length} ${cart.length === 1 ? "item" : "items"}`} aria-expanded={isOpen}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 7H6.3" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
      <span>Cart</span>
      <b>{cart.length}</b>
    </button>

    {isOpen && <div className={styles.backdrop} role="presentation" onMouseDown={() => setIsOpen(false)}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div><p>Your selections</p><h2 id="cart-title">Cart</h2></div>
          <button type="button" className={styles.close} onClick={() => setIsOpen(false)} aria-label="Close cart">×</button>
        </header>

        {cart.length ? <>
          <ul className={styles.items}>{cart.map((item) => <li key={item.id}>
            <div><strong>{item.title}</strong><span>${item.price.toFixed(2)}</span></div>
            <button type="button" onClick={() => removeItem(item.id)}>Remove</button>
          </li>)}</ul>
          <div className={styles.total}><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <button type="button" className={styles.checkout} disabled>Checkout coming soon</button>
          <p className={styles.note}>Secure checkout will be available here soon.</p>
        </> : <p className={styles.empty}>Your cart is empty. Add an album or single to begin.</p>}
      </section>
    </div>}
  </>
}
