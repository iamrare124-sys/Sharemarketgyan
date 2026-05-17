import { nicheConfig } from '@/config/site.config'
export const revalidate = 300

async function getData() {
  try {
    const { getPosts, getTrendingPosts } = await import('@/lib/supabase')
    const [p, t] = await Promise.allSettled([getPosts({ limit: 20 }), getTrendingPosts(5)])
    return { posts: p.status === 'fulfilled' ? p.value : [], trending: t.status === 'fulfilled' ? t.value : [] }
  } catch { return { posts: [], trending: [] } }
}

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
}

export default async function HomePage() {
  const { posts, trending } = await getData()
  const { seo, author } = nicheConfig

  const hero = posts[0]
  const second = posts[1]
  const stacked = posts.slice(2, 6)
  const feed = posts.slice(6, 14)
  const more = posts.slice(14, 20)

  const mkt = [
    { pair: 'NIFTY 50', val: '22,487', up: true, chg: '+0.56%' },
    { pair: 'SENSEX', val: '73,921', up: true, chg: '+0.56%' },
    { pair: 'BANK NIFTY', val: '48,234', up: false, chg: '-0.18%' },
    { pair: 'MIDCAP 100', val: '51,234', up: true, chg: '+0.42%' },
    { pair: 'USD/INR', val: '₹83.42', up: true, chg: '+0.14%' },
  ]

  if (!posts.length) return (
    <div className="home-wrap" style={{ padding: '60px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 14 }}>📈</div>
      <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>No Articles Yet</h2>
      <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 12 }}>Articles publish automatically every day at 9:30 AM IST.</p>
      <p style={{ color: '#aaa', fontSize: '0.78rem' }}>Manual trigger: <code style={{ background: '#f5f5f5', padding: '2px 8px' }}>/api/cron?secret=YOUR_SECRET</code></p>
    </div>
  )

  return (
    <div className="home-wrap">
      {/* Ad top */}
      <div className="ad-wrap ad-728" style={{ maxWidth: '100%' }}>Advertisement</div>

      {/* HERO — full width image + huge title */}
      {hero && (
        <section className="hero-sec">
          <a href={`/${hero.slug}`}>
            {hero.cover_image
              ? <img src={hero.cover_image} alt={hero.title} className="hero-img" loading="eager" />
              : <div className="hero-img-ph">📈</div>}
          </a>
          <span className="hero-cat">{hero.category?.replace(/-/g, ' ') || 'MARKET UPDATE'}</span>
          <a href={`/${hero.slug}`}><h1 className="hero-title">{hero.title}</h1></a>
          {hero.excerpt && <p className="hero-desc">{hero.excerpt}</p>}
          <p className="hero-meta">By <strong>{hero.author_name || author.name}</strong> · {ago(hero.created_at)}</p>
        </section>
      )}

      {/* MIXED GRID — image lead + stacked */}
      {second && stacked.length > 0 && (
        <div className="mixed-grid" style={{ margin: '16px 0' }}>
          {/* Left: image + title */}
          <div className="ml">
            <a href={`/${second.slug}`}>
              {second.cover_image
                ? <img src={second.cover_image} alt={second.title} className="ml-img" loading="lazy" />
                : <div className="ml-img-ph">📊</div>}
              <p className="ml-title">{second.title}</p>
            </a>
            <p className="ml-meta">By {second.author_name || author.name} · {ago(second.created_at)}</p>
          </div>
          {/* Right: stacked text-only */}
          <div className="ms">
            {stacked.map(post => (
              <a key={post.id} href={`/${post.slug}`} className="ms-item">
                <p className="ms-title">{post.title}</p>
                <p className="ms-meta">By {post.author_name || author.name} · {ago(post.created_at)}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Ad */}
      <div className="ad-wrap ad-728">Advertisement</div>

      {/* MAIN 2-col: feed + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 320px', gap: '28px', margin: '16px 0', alignItems: 'start' }}>

        {/* LEFT: news feed */}
        <div>
          {/* Category section headers */}
          {seo.categories.map(cat => {
            const catPosts = feed.filter(p => p.category === cat.slug)
            if (!catPosts.length) return null
            return (
              <div key={cat.slug} style={{ marginBottom: '20px' }}>
                <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ac4f' }}>{cat.name}</span>
                </div>
                <div className="news-feed">
                  {catPosts.slice(0, 3).map(post => (
                    <a key={post.id} href={`/${post.slug}`} className="nfi">
                      <span className="nfi-cat">{post.category?.replace(/-/g, ' ')}</span>
                      <p className="nfi-title">{post.title}</p>
                      {post.excerpt && <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.45, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
                      <p className="nfi-meta">{post.author_name || author.name} · {ago(post.created_at)}</p>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Remaining articles as plain feed */}
          {feed.length > 0 && (
            <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: 12 }}>
              <div className="news-feed">
                {feed.map(post => (
                  <a key={post.id} href={`/${post.slug}`} className="nfi">
                    <span className="nfi-cat">{post.category?.replace(/-/g, ' ')}</span>
                    <p className="nfi-title">{post.title}</p>
                    {post.excerpt && <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.45, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
                    <p className="nfi-meta">{post.author_name || author.name} · {ago(post.created_at)}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: sidebar */}
        <aside className="sidebar">
          {/* Market data */}
          <div>
            <div className="sb-head">Market Data</div>
            <table className="mkt-table">
              <thead><tr><th>Index</th><th>Value</th><th>Change</th></tr></thead>
              <tbody>
                {mkt.map(r => (
                  <tr key={r.pair}>
                    <td className="mkt-pair">{r.pair}</td>
                    <td className="mkt-val">{r.val}</td>
                    <td className={r.up ? 'mkt-up' : 'mkt-dn'}>{r.chg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.62rem', color: '#bbb', marginTop: 6 }}>* Indicative • Updated every 5 min</p>
          </div>

          <div className="ad-wrap ad-300">Advertisement</div>

          {/* Trending */}
          {trending.length > 0 && (
            <div>
              <div className="sb-head">Most Read</div>
              {trending.map((post, i) => (
                <a key={post.id} href={`/${post.slug}`} className="trend-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="trend-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="trend-title">{post.title}</p>
                    <p className="trend-meta">{ago(post.created_at)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Newsletter */}
          <div className="nl-box">
            <h4>Market Brief</h4>
            <p>Get Nifty analysis and top stock picks every morning. Free.</p>
            <input className="nl-input" type="email" placeholder="your@email.com" />
            <button className="nl-btn">Subscribe Free</button>
          </div>

          {/* Author */}
          <div className="author-box">
            <div className="author-av">{author.name.charAt(0)}</div>
            <p className="author-name">{author.name}</p>
            <p className="author-role">{author.title}</p>
            <p className="author-bio">{author.bio?.slice(0, 120)}...</p>
          </div>

          <div className="ad-wrap ad-300">Advertisement</div>
        </aside>
      </div>
    </div>
  )
}
