import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 12000,
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
})

const MAX_AGE = 48 * 60 * 60 * 1000

function clean(text) {
  if (!text) return ''
  return text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
}

function dedup(items) {
  const seen = new Set()
  return items.filter(item => {
    if (!item.title || !item.link) return false
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function fetchNewsFromRSS(urls, limit = 5) {
  const items = []
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url)
      const fresh = feed.items.filter(item => {
        const age = Date.now() - new Date(item.pubDate || item.isoDate || new Date()).getTime()
        return age < MAX_AGE && age > 0
      })
      items.push(...fresh.slice(0, limit).map(item => ({
        title: clean(item.title),
        link: item.link || item.guid,
        description: clean(item.contentSnippet || item.description || '').slice(0, 500),
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'Google News',
      })))
    } catch (err) { console.error(`RSS failed [${url.slice(0, 50)}]:`, err.message) }
  }
  return dedup(items)
}

export async function fetchAllSources(nicheConfig) {
  const { rss, reddit, seo } = nicheConfig
  const keyword = seo.primaryKeyword
  console.log('📡 Fetching from all sources...')

  const [google, bing, redditPosts, yahoo] = await Promise.allSettled([
    fetchNewsFromRSS(rss, 6),
    fetchBing([keyword, `${keyword} india`]),
    fetchReddit(reddit || []),
    fetchYahoo(),
  ])

  const all = [
    ...(google.status === 'fulfilled' ? google.value : []),
    ...(bing.status === 'fulfilled' ? bing.value : []),
    ...(redditPosts.status === 'fulfilled' ? redditPosts.value : []),
    ...(yahoo.status === 'fulfilled' ? yahoo.value : []),
  ]

  const result = dedup(all).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  console.log(`📰 Total: ${result.length} stories`)
  return result
}

async function fetchBing(queries) {
  const items = []
  for (const q of queries.slice(0, 2)) {
    try {
      const feed = await parser.parseURL(`https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setmkt=en-IN`)
      items.push(...feed.items.filter(i => Date.now() - new Date(i.pubDate || new Date()).getTime() < MAX_AGE).slice(0, 4).map(i => ({
        title: clean(i.title), link: i.link || i.guid,
        description: clean(i.contentSnippet || '').slice(0, 500),
        publishedAt: i.pubDate || new Date().toISOString(), source: 'Bing News',
      })))
    } catch {}
  }
  return items
}

async function fetchReddit(subreddits) {
  const items = []
  for (const sub of subreddits.slice(0, 2)) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8`, {
        headers: { 'User-Agent': 'ShareMarketGyan/1.0' }, next: { revalidate: 0 },
      })
      if (!res.ok) continue
      const json = await res.json()
      const posts = json?.data?.children || []
      items.push(...posts.filter(p => !p.data.stickied && Date.now() - p.data.created_utc * 1000 < 24 * 60 * 60 * 1000).slice(0, 3).map(p => ({
        title: clean(p.data.title), link: `https://reddit.com${p.data.permalink}`,
        description: clean(p.data.selftext || p.data.title).slice(0, 400),
        publishedAt: new Date(p.data.created_utc * 1000).toISOString(), source: `r/${sub}`,
      })))
    } catch {}
  }
  return items
}

async function fetchYahoo() {
  try {
    const feed = await parser.parseURL('https://finance.yahoo.com/news/rssindex')
    return feed.items.filter(i => Date.now() - new Date(i.pubDate || new Date()).getTime() < MAX_AGE).slice(0, 4).map(i => ({
      title: clean(i.title), link: i.link || i.guid,
      description: clean(i.contentSnippet || '').slice(0, 500),
      publishedAt: i.pubDate || new Date().toISOString(), source: 'Yahoo Finance',
    }))
  } catch { return [] }
}

export function selectBestStory(items, keywords = []) {
  if (!items?.length) return null
  const now = Date.now()
  return items.map(item => {
    let score = 0
    const text = `${item.title} ${item.description}`.toLowerCase()
    keywords.forEach(kw => { if (text.includes(kw.toLowerCase())) score += 3 })
    const ageH = (now - new Date(item.publishedAt).getTime()) / 3600000
    if (ageH < 2) score += 12; else if (ageH < 6) score += 8; else if (ageH < 12) score += 5; else if (ageH < 24) score += 2
    if (item.title?.length > 50) score += 2
    return { ...item, score }
  }).sort((a, b) => b.score - a.score)[0]
}
