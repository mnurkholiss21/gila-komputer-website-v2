import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import CheckoutForm from '@/components/CheckoutForm'

export default function CheckoutPage() {
  return (
    <main className="catalog-page checkout-page">
      <nav className="site-nav page-width catalog-nav"><BrandMark /><Link href="/products" className="text-link">← Kembali belanja</Link></nav>
      <div className="page-width checkout-intro"><p className="eyebrow">Gila Komputer / checkout</p><h1>Selesaikan<br /><em>pesananmu.</em></h1><p>Isi data pengiriman dengan lengkap. Harga dan stok akan kami cek kembali saat pesanan dibuat.</p></div>
      <div className="page-width"><CheckoutForm /></div>
    </main>
  )
}
