'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type CartItem = { id: string; name: string; category: string; price: number; quantity: number }
type ShippingMethod = 'regular' | 'express'

const CART_STORAGE_KEY = 'gila-komputer-cart'
const shippingOptions: Record<ShippingMethod, { label: string; description: string; fee: number }> = {
  regular: { label: 'Regular', description: '2-4 hari kerja', fee: 25000 },
  express: { label: 'Express', description: '1-2 hari kerja', fee: 50000 },
}

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function CheckoutForm() {
  const [items, setItems] = useState<CartItem[]>([])
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('regular')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '', city: '', postalCode: '' })

  useEffect(() => {
    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY)
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems) as CartItem[]
        if (Array.isArray(parsedItems)) window.setTimeout(() => setItems(parsedItems), 0)
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const shippingFee = shippingOptions[shippingMethod].fee
  const total = subtotal + shippingFee
  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, shippingMethod, items: items.map((item) => ({ productId: Number(item.id), quantity: item.quantity })) }) })
      const result = await response.json() as { order?: { orderNumber: string }; error?: string }
      if (!response.ok || !result.order) throw new Error(result.error ?? 'Order tidak dapat dibuat.')
      window.localStorage.removeItem(CART_STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('gila:cart-updated', { detail: { items: [] } }))
      setItems([])
      setOrderNumber(result.order.orderNumber)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderNumber) return <section className="checkout-success"><p className="eyebrow">Pesanan berhasil dibuat</p><h2>Terima kasih,<br /><em>pesananmu tercatat.</em></h2><p>Nomor pesananmu:</p><strong>{orderNumber}</strong><Link href="/products" className="button button-dark">Kembali belanja <span>↗</span></Link></section>

  if (!items.length) return <section className="checkout-empty"><p className="eyebrow">Keranjang kosong</p><h2>Belum ada<br /><em>yang berangkat.</em></h2><p>Tambahkan komponen ke keranjang sebelum melanjutkan ke checkout.</p><Link href="/products" className="button button-dark">Pilih komponen <span>↗</span></Link></section>

  return <form className="checkout-layout" onSubmit={submitOrder}>
    <div className="checkout-fields">
      <section className="checkout-section"><div className="checkout-section-heading"><span>01</span><div><p className="eyebrow">Data customer</p><h2>Siapa yang<br /><em>memesan?</em></h2></div></div><div className="checkout-field-grid"><label>Nama lengkap<input required value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} /></label><label>Nomor telepon<input required type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} /></label></div></section>
      <section className="checkout-section"><div className="checkout-section-heading"><span>02</span><div><p className="eyebrow">Alamat pengiriman</p><h2>Ke mana<br /><em>kami antar?</em></h2></div></div><div className="checkout-field-grid"><label className="field-wide">Alamat lengkap<textarea required rows={3} value={form.address} onChange={(event) => updateField('address', event.target.value)} /></label><label>Kota<input required value={form.city} onChange={(event) => updateField('city', event.target.value)} /></label><label>Kode pos<input required inputMode="numeric" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} /></label></div></section>
      <section className="checkout-section"><div className="checkout-section-heading"><span>03</span><div><p className="eyebrow">Metode pengiriman</p><h2>Pilih cara<br /><em>sampainya.</em></h2></div></div><div className="shipping-options">{Object.entries(shippingOptions).map(([value, option]) => <label className={shippingMethod === value ? 'shipping-option is-active' : 'shipping-option'} key={value}><input type="radio" name="shipping" value={value} checked={shippingMethod === value} onChange={() => setShippingMethod(value as ShippingMethod)} /><span><strong>{option.label}</strong><small>{option.description}</small></span><b>{formatPrice(option.fee)}</b></label>)}</div></section>
    </div>
    <aside className="checkout-summary"><p className="eyebrow">Ringkasan order</p><div className="checkout-summary-items">{items.map((item) => <div key={item.id}><span>{item.name}<small>{item.quantity} × {formatPrice(item.price)}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="checkout-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="checkout-summary-line"><span>Ongkir</span><strong>{formatPrice(shippingFee)}</strong></div><div className="checkout-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>{error && <p className="checkout-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Buat pesanan'} <span>↗</span></button></aside>
  </form>
}
