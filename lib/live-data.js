let cache = null
let cacheExpiry = 0

export async function fetchLiveData(liveDataConfig) {
  if (cache && Date.now() < cacheExpiry) return cache
  let data = {}
  try {
    // Alpha Vantage for Nifty/stocks
    const key = process.env.ALPHA_VANTAGE_KEY
    if (key) {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NIFTY50.BSE&apikey=${key}`,
        { next: { revalidate: 300 } }
      )
      if (res.ok) {
        const d = await res.json()
        const q = d['Global Quote']
        if (q?.['05. price']) {
          data['NIFTY 50'] = { rate: parseFloat(q['05. price']), change: parseFloat(q['09. change']), changePercent: parseFloat(q['10. change percent']) }
        }
      }
    }
  } catch {}

  // Fallback static data
  if (!Object.keys(data).length) {
    data = {
      'NIFTY 50': { rate: 22487, change: 125, changePercent: 0.56 },
      'SENSEX': { rate: 73921, change: 412, changePercent: 0.56 },
      'BANK NIFTY': { rate: 48234, change: -89, changePercent: -0.18 },
    }
  }

  cache = data
  cacheExpiry = Date.now() + 300000
  return data
}

export function formatLiveDataForPost(data) {
  if (!data) return 'Nifty 50: Live data loading'
  return Object.entries(data)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v.rate?.toLocaleString('en-IN')} (${v.changePercent > 0 ? '+' : ''}${v.changePercent?.toFixed(2)}%)`)
    .join(' | ')
}
