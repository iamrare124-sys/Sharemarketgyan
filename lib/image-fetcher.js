let pexelsCalls = 0
let pexelsReset = Date.now() + 3600000

export async function fetchCoverImage(imageConfig, title = '') {
  if (Date.now() > pexelsReset) { pexelsCalls = 0; pexelsReset = Date.now() + 3600000 }
  const keyword = imageConfig.pexels[Math.floor(Math.random() * imageConfig.pexels.length)]

  if (pexelsCalls < 180 && process.env.PEXELS_API_KEY) {
    const url = await fetchPexels(keyword)
    if (url) { pexelsCalls++; return { url, alt: keyword } }
  }
  if (process.env.UNSPLASH_ACCESS_KEY) {
    const url = await fetchUnsplash(imageConfig.unsplash[0] || keyword)
    if (url) return { url, alt: keyword }
  }
  return { url: imageConfig.fallback || '/images/stocks-default.jpg', alt: title }
}

async function fetchPexels(keyword) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=10&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const photos = data.photos || []
    if (!photos.length) return null
    const photo = photos[Math.floor(Math.random() * Math.min(5, photos.length))]
    return photo.src?.large2x || photo.src?.large || null
  } catch { return null }
}

async function fetchUnsplash(keyword) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data.results || []
    if (!results.length) return null
    return results[Math.floor(Math.random() * Math.min(3, results.length))].urls?.regular || null
  } catch { return null }
}
