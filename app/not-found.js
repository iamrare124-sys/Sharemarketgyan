import { nicheConfig } from '@/config/site.config'
export const metadata = { title: '404 — Not Found | ShareMarketGyan' }
export default function NotFound() {
  return (
    <div className="nf-wrap">
      <div>
        <div className="nf-num">404</div>
        <h2>PAGE NOT FOUND</h2>
        <p>The page you are looking for has been removed or the URL is incorrect.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn-green">← Back to Home</a>
          {nicheConfig.seo.categories.slice(0, 2).map(cat => (
            <a key={cat.slug} href={`/category/${cat.slug}`} className="btn-outline">{cat.name}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
