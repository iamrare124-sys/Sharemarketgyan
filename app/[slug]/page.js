import { notFound } from 'next/navigation'
import { nicheConfig } from '@/config/site.config'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try { const { getPosts } = await import('@/lib/supabase'); const p = await getPosts({ limit: 50 }); return p.map(x => ({ slug: x.slug })) } catch { return [] }
}

export async function generateMetadata({ params }) {
  try {
    const { getPostBySlug } = await import('@/lib/supabase')
    const post = await getPostBySlug(params.slug)
    if (!post) return { title: 'Not Found' }
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sharemarketgyan.in'}/${post.slug}`
    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      keywords: post.tags?.join(', '),
      openGraph: { title: post.meta_title || post.title, description: post.meta_description || post.excerpt, url, type: 'article', publishedTime: post.published_at || post.created_at, images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630 }] : [{ url: '/og-image.jpg' }] },
      twitter: { card: 'summary_large_image', title: post.meta_title || post.title, description: post.meta_description || post.excerpt, images: post.cover_image ? [post.cover_image] : ['/og-image.jpg'] },
      alternates: { canonical: url },
    }
  } catch { return { title: 'Not Found' } }
}

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
}

export default async function PostPage({ params }) {
  let post, related
  try {
    const { getPostBySlug, getRelatedPosts } = await import('@/lib/supabase')
    post = await getPostBySlug(params.slug)
    if (!post) notFound()
    related = await getRelatedPosts(post.category, post.slug, 3).catch(() => [])
  } catch { notFound() }

  const { author, seo, site } = nicheConfig
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sharemarketgyan.in'
  const postUrl = `${siteUrl}/${post.slug}`
  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (post.content && typeof post.content === 'string') {
    try { post.content = JSON.parse(post.content) } catch { post.content = null }
  }

  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: post.title, description: post.meta_description || post.excerpt, url: postUrl,
    datePublished: post.published_at || post.created_at, dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Person', name: post.author_name || author.name, jobTitle: author.title, url: `${siteUrl}/about` },
    publisher: { '@type': 'Organization', name: site.name, url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } },
    image: post.cover_image ? [{ '@type': 'ImageObject', url: post.cover_image, width: 1200, height: 630 }] : undefined,
    keywords: post.tags?.join(', '), inLanguage: 'en-IN', isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: post.category?.replace(/-/g, ' '), item: `${siteUrl}/category/${post.category}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }
  const faqSchema = post.content?.faq?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: post.content.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
  } : null

  const mkt = [
    { pair: 'NIFTY 50', val: '22,487', up: true, chg: '+0.56%' },
    { pair: 'SENSEX', val: '73,921', up: true, chg: '+0.56%' },
    { pair: 'BANK NIFTY', val: '48,234', up: false, chg: '-0.18%' },
    { pair: 'USD/INR', val: '₹83.42', up: true, chg: '+0.14%' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <div className="rp" id="rpbar" style={{ width: '0%' }} />

      <div className="ad-wrap ad-728" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>Advertisement</div>

      <div className="article-wrap">
        <div className="article-inner">

          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href="/">Home</a><span className="breadcrumb-sep">›</span>
            <a href={`/category/${post.category}`} style={{ textTransform: 'capitalize' }}>{post.category?.replace(/-/g, ' ')}</a>
            <span className="breadcrumb-sep">›</span>
            <span>{post.title?.slice(0, 40)}...</span>
          </nav>

          {/* Category + Title — MarketWatch style huge */}
          <span className="article-cat">{post.category?.replace(/-/g, ' ') || 'MARKET UPDATE'}</span>
          <h1 className="article-title">{post.title}</h1>
          {post.excerpt && <p className="article-sub">{post.excerpt}</p>}

          {/* Byline */}
          <div className="byline-author">By <strong>{post.author_name || author.name}</strong></div>
          <div className="byline-date">Published: {publishDate} IST</div>

          {/* Share bar */}
          <div className="share-bar">
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + postUrl)}`} target="_blank" rel="noopener" className="sbtn sbtn-wa">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              Share
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noopener" className="sbtn sbtn-tw">𝕏 Tweet</a>
            <button className="sbtn sbtn-cp" id="copyBtn">🔗 Copy Link</button>
          </div>

          {/* Hero image */}
          {post.cover_image
            ? <img src={post.cover_image} alt={post.cover_image_alt || post.title} className="article-hero" loading="eager" />
            : <div className="article-hero-ph">📈</div>}
          {post.cover_image && <p className="article-caption"><strong>{post.title?.slice(0, 50)}</strong><br />Credit: Pexels / Unsplash</p>}

          {/* Ad */}
          <div className="ad-wrap ad-728">Advertisement</div>

          {/* Referenced symbols — MarketWatch style */}
          <div className="ref-syms">
            <span className="ref-label">Referenced Symbols</span>
            {['NIFTY50.NSE', 'SENSEX.BSE', 'BANKNIFTY.NSE'].map(sym => (
              <span key={sym} className="ref-sym rsup">↑ {sym} <span style={{ color: '#00ac4f', fontSize: '0.78rem' }}>+0.56%</span></span>
            ))}
          </div>

          {/* Article body */}
          <div className="article-body">
            {(() => {
              const c = post.content
              if (!c) return <p style={{ color: '#888' }}>Content loading...</p>
              if (typeof c === 'string') {
                return c.split('\n\n').filter(Boolean).map((p, i) => {
                  if (p.startsWith('#')) return <h2 key={i}>{p.replace(/^#+\s*/, '')}</h2>
                  return <p key={i}>{p.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
                })
              }
              return (
                <>
                  {c.hook && <p style={{ fontWeight: 600 }}>{c.hook}</p>}
                  {c.sections?.length > 0
                    ? c.sections.map((s, i) => (
                        <div key={i}>
                          {s.h2 && <h2>{s.h2}</h2>}
                          {s.body?.split('\n\n').filter(Boolean).map((p, j) => (
                            <p key={j}>{p.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
                          ))}
                          {i === 2 && <div className="ad-wrap ad-728">Advertisement</div>}
                        </div>
                      ))
                    : c.rawContent?.split('\n\n').filter(Boolean).slice(0, 12).map((p, i) => {
                        if (p.match(/^#{1,3}\s/)) return <h2 key={i}>{p.replace(/^#+\s*/, '')}</h2>
                        return <p key={i}>{p.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
                      })}
                  {c.conclusion && <p><strong>Bottom line:</strong> {c.conclusion}</p>}
                </>
              )
            })()}
          </div>

          {/* FAQ */}
          {post.content?.faq?.length > 0 && (
            <div className="faq-wrap">
              <h3 className="faq-title">Frequently Asked Questions</h3>
              {post.content.faq.map((f, i) => (
                <details key={i} className="faq-item">
                  <summary>{f.question}</summary>
                  <div className="faq-ans">{f.answer}</div>
                </details>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="article-tags">
              {post.tags.map(t => <a key={t} href={`/search?q=${encodeURIComponent(t)}`} className="atag">{t}</a>)}
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            <strong>Disclaimer:</strong> The information on ShareMarketGyan.in is for educational and informational purposes only. It does not constitute investment, financial, or trading advice. Stock market investments are subject to market risks. Please read all scheme related documents carefully and consult a SEBI registered financial advisor before investing.
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginTop: 28, borderTop: '2px solid #1a1a1a', paddingTop: 14 }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>MORE FROM SHAREMARKETGYAN</p>
              {related.map(p => (
                <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#00ac4f', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>{p.category?.replace(/-/g, ' ')}</span>
                  <a href={`/${p.slug}`} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '1rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.25, display: 'block' }}>{p.title}</a>
                  <span style={{ fontSize: '0.68rem', color: '#aaa', marginTop: 3, display: 'block' }}>By {p.author_name || author.name} · {ago(p.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        var bar=document.getElementById('rpbar');
        if(bar){window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(h>0?(window.scrollY/h*100):0)+'%';});}
        var cb=document.getElementById('copyBtn');
        if(cb){cb.addEventListener('click',function(){navigator.clipboard.writeText(window.location.href).then(function(){cb.textContent='✅ Copied!';setTimeout(function(){cb.textContent='🔗 Copy Link';},2000);});});}
      `}} />
    </>
  )
}
