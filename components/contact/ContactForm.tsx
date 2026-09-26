"use client"

import {FormEvent, useState} from "react"
import styles from "./ContactForm.module.css"

type FormStatus = "idle" | "sending" | "success" | "error"

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle")
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setStatus("sending")
    setMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      const body = await response.json().catch(() => null) as {message?: string} | null
      if (!response.ok) throw new Error(body?.message || "We could not send your message. Please try again.")

      form.reset()
      setStatus("success")
      setMessage("Thank you—your message has been sent.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "We could not send your message. Please try again.")
    }
  }

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.fieldRow}>
      <label>Name<span aria-hidden="true">*</span><input name="name" autoComplete="name" required maxLength={120} /></label>
      <label>Email<span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    </div>
    <label>Subject<input name="subject" maxLength={180} /></label>
    <label>Message<span aria-hidden="true">*</span><textarea name="message" required rows={7} maxLength={5000} /></label>
    <label className={styles.honeypot} aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
    <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
    <p className={`${styles.status} ${status === "error" ? styles.error : ""}`} aria-live="polite">{message}</p>
  </form>
}
