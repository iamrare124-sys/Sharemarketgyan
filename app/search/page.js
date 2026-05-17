'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function SearchResults() {
  const params = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!q || q.length < 2) return
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || []); setDone(true) })
      .catch(() => setDone(true))
      .finally(() => setLoading(false))
  }, [q])

  function ago(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
        {q ? `Search: "${q}"` : 'Search'}
      </h1>

      <form onSubmit={e => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) window.location.href = '/search?q=' + encodeURIComponent(v) }}>
        <div style={{ display: 'flex', border: '2px solid #1a1a1a', maxWidth: 560, marginBottom: 20, overflow: 'hidden' }}>
          <input name="q" defaultValue={q} placeholder="Search Nifty, IPO, stocks..." autoFocus
            style={{ flex: 1, padding: '10px 14px', border: 'none', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
          <button type="submit" style={{ background: '#1a1a1a', color: '#fff', padding: '10px 18px', border: 'none', cursor: 'pointer', fontWeight: 800, fontFamily: "'Barlow Condensed',sans-serif", fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #e0e0e0', borderTopColor: '#00ac4f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {!loading && done && results.length === 0 && (
        <div style={{ padding: '50px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>No results for "{q}"</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Try: "Nifty fall", "IPO 2026", "HDFC Bank"</p>
        </div>
      )}

      <div className="news-feed">
        {results.map(post => (
          <a key={post.slug} href={`/${post.slug}`} className="nfi">
            <span className="nfi-cat">{post.category?.replace(/-/g, ' ')}</span>
            <p className="nfi-title">{post.title}</p>
            {post.excerpt && <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.45, marginTop: 4 }}>{post.excerpt}</p>}
            <p className="nfi-meta">{post.author_name} · {ago(post.created_at)}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
