import { nicheConfig } from '@/config/site.config'
export const metadata = { title: 'About ShareMarketGyan | India Stock Market Intelligence' }
export default function AboutPage() {
  const { author, site } = nicheConfig
  return (
    <div className="static-page">
      <h1>About {site.name}</h1>
      <p className="updated">India's Stock Market Intelligence Platform</p>
      <div style={{ marginBottom: 20 }}><h2>Who We Are</h2><p>{site.name} is India's dedicated platform for stock market news, Nifty and Sensex analysis, IPO coverage, and expert equity research. We write for Indian retail investors in clear, simple English.</p></div>
      <div style={{ marginBottom: 20 }}><h2>Our Analyst</h2><p>Our lead analyst is <strong>{author.name}</strong>, {author.title}. {author.bio}</p></div>
      <div style={{ marginBottom: 20 }}><h2>Editorial Standards</h2><p>All market data is sourced from NSE, BSE, and licensed financial data providers. News articles clearly distinguish between reporting and opinion/analysis.</p></div>
      <div style={{ marginBottom: 20 }}><h2>Disclaimer</h2><p>Content on {site.name} is for educational and informational purposes only. It does not constitute investment advice. Stock market investments are subject to market risks. Please consult a SEBI registered financial advisor before investing.</p></div>
      <div><h2>Contact</h2><p>Email: <a href="mailto:hello@sharemarketgyan.in">hello@sharemarketgyan.in</a></p></div>
    </div>
  )
}
