'use client'
import { useEffect } from 'react'
export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Something Went Wrong</h2>
        <p style={{ color: '#888', marginBottom: 20 }}>Server did not respond. Please try again.</p>
        <button className="btn-green" onClick={reset}>Try Again</button>
      </div>
    </div>
  )
}
