import './globals.css'
import { nicheConfig } from '@/config/site.config'
import CookieBanner from '@/components/CookieBanner'
import MobileMenu from '@/components/MobileMenu'

const { site, seo, author } = nicheConfig
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sharemarketgyan.in'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  keywords: [seo.primaryKeyword, ...seo.secondaryKeywords].join(', '),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  openGraph: { type: 'website', locale: 'en_IN', siteName: site.name, title: `${site.name} — ${site.tagline}`, description: site.description, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }], url: SITE_URL },
  twitter: { card: 'summary_large_image', title: `${site.name} — ${site.tagline}`, description: site.description, images: ['/og-image.jpg'] },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || '', other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION || '' } },
}

const TICKERS = [
  { name: 'NIFTY 50', val: '22,487', pct: '+0.56%', up: true },
  { name: 'SENSEX', val: '73,921', pct: '+0.56%', up: true },
  { name: 'BANK NIFTY', val: '48,234', pct: '-0.18%', up: false },
  { name: 'USD/INR', val: '83.42', pct: '+0.14%', up: true },
  { name: 'GOLD', val: '73,420', pct: '+0.16%', up: true },
  { name: 'CRUDE OIL', val: '82.40', pct: '-0.96%', up: false },
]

export default function RootLayout({ children }) {
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_ID
  return (
    <html lang="en-IN">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,700;0,800;0,900;1,400&family=Barlow+Condensed:wght@700;800;900&display=swap" rel="stylesheet" />
        {adsense && adsense !== 'ca-pub-XXXXXXXXXX' && <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`} crossOrigin="anonymous" />}
        {ga4 && ga4 !== 'G-XXXXXXXXXX' && <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');` }} />
        </>}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <header className="site-header">
          <div className="header-inner">
            <div className="header-left">
              <MobileMenu categories={seo.categories} siteName={site.name} />
              <a href="/" className="logo"><span className="logo-text">{site.name}</span></a>
            </div>
            <div className="header-right">
              <a href="/search" className="header-icon" aria-label="Search">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </a>
              <div className="header-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>
        </header>

        <div className="ticker-bar">
          <div className="ticker-inner">
            {TICKERS.map((t, i) => (
              <div key={i} className="tc">
                <span className="tc-name">{t.name}</span>
                <span className="tc-val">{t.val}</span>
                <span className={t.up ? 'tc-up' : 'tc-dn'}>{t.up ? '▲' : '▼'} {t.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <nav className="cat-bar">
          <div className="cat-bar-inner">
            <a href="/" className="ctab">All</a>
            {seo.categories.map(cat => (
              <a key={cat.slug} href={`/category/${cat.slug}`} className="ctab">{cat.name}</a>
            ))}
          </div>
        </nav>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="footer-inner">
            <span className="footer-logo-text">{site.name}</span>
            <div className="footer-grid">
              <div>
                <p className="footer-desc">{site.description}</p>
                <p className="footer-disclaimer"><strong>Disclaimer:</strong> Content on {site.name} is for educational purposes only. Not investment advice. Stock market investments are subject to market risks. Read all scheme related documents carefully before investing.</p>
              </div>
              <div className="footer-col"><h4>News</h4><ul>{seo.categories.map(c => <li key={c.slug}><a href={`/category/${c.slug}`}>{c.name}</a></li>)}</ul></div>
              <div className="footer-col"><h4>Company</h4><ul><li><a href="/about">About Us</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
              <div className="footer-col"><h4>Legal</h4><ul><li><a href="/privacy-policy">Privacy Policy</a></li><li><a href="/terms">Terms of Use</a></li><li><a href="/disclaimer">Disclaimer</a></li><li><a href="/cookie-policy">Cookie Policy</a></li></ul></div>
            </div>
            <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.name}</span><span>Built for Indian investors 🇮🇳</span></div>
          </div>
        </footer>

        <CookieBanner />
        <button className="btt" id="btt" aria-label="Back to top">↑</button>
        <script dangerouslySetInnerHTML={{ __html: `var b=document.getElementById('btt');if(b){window.addEventListener('scroll',function(){b.classList.toggle('show',window.scrollY>400)});b.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});}` }} />
      </body>
    </html>
  )
}
