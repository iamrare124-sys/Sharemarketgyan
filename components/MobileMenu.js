'use client'
import { useState } from 'react'

export default function MobileMenu({ categories, siteName }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 600 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 320, background: '#000', zIndex: 700, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #222' }}>
              <a href="/category/market-update" style={{ background: '#00ac4f', color: '#fff', padding: '7px 14px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 2 }}>
                Latest News
              </a>
              <button onClick={() => setOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', padding: 4 }}>✕</button>
            </div>

            {[
              { label: 'LATEST NEWS', href: '/category/market-update', arrow: false },
              { label: 'MARKET UPDATE', href: '/category/market-update', arrow: false },
              { label: 'STOCK ANALYSIS', href: '/category/stock-analysis', arrow: true },
              { label: 'IPO NEWS', href: '/category/ipo-news', arrow: true },
              { label: 'MUTUAL FUNDS', href: '/category/mutual-funds', arrow: true },
              { label: 'ABOUT', href: '/about', arrow: false },
            ].map(item => (
              <a key={item.label} href={item.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 16px', borderBottom: '1px solid #1a1a1a', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#fff', letterSpacing: '0.05em', textDecoration: 'none' }}>
                {item.label}
                {item.arrow && <span style={{ color: '#444', fontSize: '1rem' }}>›</span>}
              </a>
            ))}

            <div style={{ padding: '12px 16px 4px', fontSize: '0.58rem', fontWeight: 800, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>CONNECT</div>
            <div style={{ padding: '12px 16px', display: 'flex', gap: 16 }}>
              <a href="#" style={{ color: '#666', fontSize: '1.1rem' }}>𝕏</a>
              <a href="#" style={{ color: '#666', fontSize: '1.1rem' }}>in</a>
            </div>
          </div>
        </>
      )}
    </>
  )
}
