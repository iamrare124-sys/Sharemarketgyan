export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sharemarketgyan.in'
  let posts = []
  try { const { getPosts } = await import('@/lib/supabase'); posts = await getPosts({ limit: 100 }) } catch {}
  const staticPages = ['', '/about', '/privacy-policy', '/terms', '/disclaimer', '/cookie-policy'].map(path => ({
    url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: 'weekly', priority: path === '' ? 1 : 0.5,
  }))
  const postPages = posts.map(post => ({
    url: `${siteUrl}/${post.slug}`, lastModified: new Date(post.created_at), changeFrequency: 'monthly', priority: 0.8,
  }))
  return [...staticPages, ...postPages]
}
