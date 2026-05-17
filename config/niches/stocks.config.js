const stocksConfig = {
  site: {
    name: "ShareMarketGyan",
    domain: "sharemarketgyan.in",
    tagline: "India's Stock Market Intelligence",
    description: "Live Nifty 50, Sensex updates, stock analysis, IPO news and expert market insights for Indian investors.",
    language: "en-IN",
    locale: "en_IN",
    themeColor: "#00ac4f",
    accentColor: "#ff3b30",
  },
  author: {
    name: "Priya Mehta",
    title: "Senior Market Analyst | 9 Years Experience",
    bio: "Priya Mehta has 9 years of experience analyzing Indian equity markets. Previously with HDFC Securities, she now helps retail investors make smarter decisions through ShareMarketGyan.in",
    avatar: "/authors/priya.jpg",
    twitter: "@priyamarkets",
  },
  rss: [
    "https://news.google.com/rss/search?q=nifty+sensex+stock+market+india+today&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=BSE+NSE+shares+india+market&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=indian+stock+market+analysis+today&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=IPO+india+2026+listing&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  reddit: ["IndiaInvestments", "IndianStreetBets", "personalfinanceindia"],
  liveData: {
    provider: "alphavantage",
    backup: "exchangerate",
    symbols: ["NIFTY50", "SENSEX", "BANKNIFTY"],
    widgetLabel: "Live Market Data",
    refreshEvery: 300,
    showInPost: true,
    showInSidebar: true,
  },
  images: {
    pexels: ["stock market trading india", "nse bse trading floor", "indian finance investment", "stock chart analysis", "wall street trading"],
    unsplash: ["stock market", "finance trading", "investment growth"],
    fallback: "/images/stocks-default.jpg",
  },
  ai: {
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    top_p: 0.9,
    frequency_penalty: 0.4,
    presence_penalty: 0.3,
    systemPrompt: `You are Priya Mehta, a senior equity analyst writing for ShareMarketGyan.in — India's go-to source for stock market intelligence.

ABSOLUTE BANNED LIST — never use these:
- "In this article" / "In today's article"
- "It is important to note" / "It is worth noting"
- "Furthermore" / "Moreover" / "Additionally"
- "In conclusion" / "To summarize"
- "Delve into" / "Navigate" / "Landscape"
- "Comprehensive" / "Robust" / "Shed light"

HOW TO WRITE:
1. First sentence = market move + exact number. No warmup.
   Example: "Nifty 50 crashed 450 points today — here's exactly what triggered it and what smart money is doing."
   NOT: "The Indian stock market saw significant movement today..."

2. Write like a sharp analyst texting a trader friend.
   Good: "FIIs pulled out ₹3,200 crore. That's the real story. Not the headline."
   Bad: "Foreign Institutional Investors showed significant selling pressure in the market."

3. Have ONE strong call or opinion per article.
   Example: "Everyone's panicking about the fall. I'd be buying HDFC Bank on this dip."

4. Mix sentence lengths aggressively.
   Short. Then a longer analytical sentence. Then short again.

5. India-specific always. Use real stock names, real sectors.
   - "Reliance, TCS, HDFC — the big three dragged the index"
   - "Retail investors on Zerodha and Groww were panic selling"
   - "Mid-cap IT stocks took the worst hit"

6. Numbers like a journalist: "₹3,450 crore FII outflow" not "heavy selling"

7. One insider insight per article:
   "Quick note — when Nifty breaks below 200-DMA, historically it takes 3-6 weeks to recover. We're there now."

8. End with a clear action: what should a retail investor do TODAY.
   Good: "If you're holding quality large-caps, don't panic. If you have cash, SIP entry looks attractive at these levels."`,

    postStructure: [
      { heading: null, type: "hook", words: 80 },
      { heading: "What Happened in Markets Today", type: "news", words: 180 },
      { heading: "Why Did the Market Move?", type: "analysis", words: 160 },
      { heading: "Sector-by-Sector Breakdown", type: "sectors", words: 150 },
      { heading: "What Are Experts Saying?", type: "expert", words: 130 },
      { heading: "What Should You Do Now?", type: "action", words: 120 },
    ],

    alternateStructures: [
      ["Today's Market Summary", "The Numbers That Matter", "Who's Buying, Who's Selling", "Technical Levels to Watch", "Bottom Line"],
      ["Breaking: What Just Moved", "The India Angle", "Sector Winners & Losers", "FII/DII Activity", "Your Action Plan"],
      ["Is This a Buying Opportunity?", "What the Data Says", "Key Stocks in Focus", "Expert Views", "Smart Money Moves"],
    ],

    faqCount: 4,
    faqTopics: [
      "Why did Nifty fall today?",
      "Is Indian stock market open tomorrow?",
      "Best stocks to buy in India right now",
      "How to invest in Nifty 50 index fund",
      "What is FII and DII data today",
      "Should I buy or sell in this market crash",
    ],
    qualityCheck: `Rate this article 1-10 strictly:
1. Does the first sentence have a specific market number? (2 pts)
2. Are ALL banned phrases absent? (2 pts)
3. Is there India-specific stock/sector mention? (2 pts)
4. Is there one clear opinion or market call? (2 pts)
5. Are there exactly 4 FAQs? (2 pts)
Reply with ONLY a number 1-10.`,
    minScore: 7,
    maxRetries: 3,
  },
  seo: {
    primaryKeyword: "indian stock market today",
    secondaryKeywords: [
      "nifty 50 today",
      "sensex today",
      "stock market india",
      "best stocks to buy india",
      "nse bse market update",
    ],
    schemaType: "NewsArticle",
    twitterHandle: "@ShareMarketGyan",
    categories: [
      { slug: "market-update", name: "Market Update", description: "Daily Nifty and Sensex updates and analysis" },
      { slug: "stock-analysis", name: "Stock Analysis", description: "Individual stock research and recommendations" },
      { slug: "ipo-news", name: "IPO News", description: "Upcoming IPOs, listings and GMP updates" },
      { slug: "mutual-funds", name: "Mutual Funds", description: "Mutual fund news and SIP recommendations" },
    ],
  },
  cron: {
    postsPerDay: 1,
    schedule: "0 4 * * *",
    maxPostsPerRun: 1,
  },
  twitter: {
    enabled: false,
    template: "📈 {title}\n\nNifty: {rate} | {time}\n\n{url}\n\n#Nifty #Sensex #StockMarket #IndianMarkets",
    hashtags: ["#Nifty", "#Sensex", "#StockMarket"],
  },
}

module.exports = stocksConfig
