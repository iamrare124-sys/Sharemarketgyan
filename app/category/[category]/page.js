import { notFound } from 'next/navigation'
import { nicheConfig } from '@/config/site.config'

export async function generateMetadata({ params }) {
  const cat = nicheConfig.seo.categories.find(c => c.slug === params.category)
  if (!cat) return { title: 'Not Found' }
  return { title: `${cat.name} — ${nicheConfig.site.name}`, description: cat.description }
}

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
}

export default async function CategoryPage({ params }) {
  const cat = nicheConfig.seo.categories.find(c => c.slug === params.category)
  if (!cat) notFound()

  let posts = []
  try { const { getPosts } = await import('@/lib/supabase'); posts = await getPosts({ limit: 20, category: params.category }) } catch {}

  const { author } = nicheConfig

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
      {/* Category header */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '16px 0', marginBottom: 16 }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#00ac4f', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>ShareMarketGyan</span>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', color: '#1a1a1a' }}>{cat.name}</h1>
        {cat.description && <p style={{ fontSize: '0.88rem', color: '#666', marginTop: 4 }}>{cat.description}</p>}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16 }}>
        <a href={`/category/${params.category}`} style={{ padding: '9px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#1a1a1a', borderBottom: '3px solid #1a1a1a', whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ALL</a>
        {nicheConfig.seo.categories.filter(c => c.slug !== params.category).slice(0, 4).map(c => (
          <a key={c.slug} href={`/category/${c.slug}`} style={{ padding: '9px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#888', borderBottom: '3px solid transparent', whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.name}</a>
        ))}
      </div>

      {/* News feed */}
      {posts.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📈</div>
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>No articles yet in {cat.name}</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Check back soon. Articles publish daily.</p>
        </div>
      ) : (
        <div className="news-feed">
          {posts.map((post, i) => (
            <div key={post.id}>
              <a href={`/${post.slug}`} className="nfi">
                <span className="nfi-cat">{post.category?.replace(/-/g, ' ')}</span>
                <p className="nfi-title">{post.title}</p>
                {post.excerpt && <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.45, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
                <p className="nfi-meta">{post.author_name || author.name} · {ago(post.created_at)}</p>
              </a>
              {i === 4 && <div className="ad-wrap ad-728">Advertisement</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
