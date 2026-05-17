export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

import { fetchAllSources } from '@/lib/rss-fetcher'
import { fetchLiveData, formatLiveDataForPost } from '@/lib/live-data'
import { generateBlogPost, generateSlug, generateSchema } from '@/lib/blog-generator'
import { fetchCoverImage } from '@/lib/image-fetcher'
import { savePost, postExists } from '@/lib/supabase'
import { verifyCronSecret, apiResponse } from '@/lib/security'
import { nicheConfig } from '@/config/site.config'

async function publishOne(stories, liveData, liveDataText, usedLinks, skipDup) {
  const available = stories.filter(s => s.link && !usedLinks.has(s.link))
  if (!available.length) return { error: 'No unused stories available' }

  for (const story of available.slice(0, 10)) {
    usedLinks.add(story.link)
    if (!skipDup) {
      try { if (await postExists(story.link)) { console.log('⏭️ Dup:', story.title?.slice(0, 50)); continue } } catch {}
    }
    console.log('📝 Generating:', story.title?.slice(0, 70))
    try {
      const generated = await generateBlogPost({ newsItem: story, liveDataText, nicheConfig })
      if (!generated?.title || !generated?.content) continue

      const image = await fetchCoverImage(nicheConfig.images, generated.title).catch(() => ({ url: '/images/stocks-default.jpg', alt: generated.title }))
      const slug = generateSlug(generated.title)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sharemarketgyan.in'
      const url = `${siteUrl}/${slug}`
      const schema = generateSchema({ post: { ...generated, coverImage: image.url }, nicheConfig, url })

      const saved = await savePost({
        slug, title: generated.title,
        excerpt: generated.metaDescription?.length > 20 ? generated.metaDescription : (generated.content?.hook?.slice(0, 200) || generated.title),
        content: { ...generated.content, rawContent: generated.rawContent || '' },
        category: generated.category || nicheConfig.seo.categories[0].slug,
        tags: generated.tags || [],
        cover_image: image.url, cover_image_alt: image.alt || generated.title,
        author_name: nicheConfig.author.name, author_title: nicheConfig.author.title,
        meta_title: generated.metaTitle || generated.title,
        meta_description: generated.metaDescription || generated.content?.hook?.slice(0, 155) || generated.title,
        schema_json: schema, live_data: liveData,
        reading_time: generated.readingTime || 5, word_count: generated.wordCount || 800,
        ai_score: generated.aiScore || 7, published: true, tweeted: false,
        source_url: story.link, source_headline: story.title,
      })

      // IndexNow ping
      fetch(`${siteUrl}/api/indexnow`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).catch(() => {})

      console.log('✅ Published:', generated.title?.slice(0, 70))
      return { id: saved?.id, slug, title: generated.title, score: generated.aiScore, source: story.source }
    } catch (err) { console.error('❌ Failed:', err.message); continue }
  }
  return { error: 'All stories failed — check Vercel logs' }
}

export async function GET(request) {
  if (!verifyCronSecret(request)) return apiResponse({ error: 'Unauthorized' }, 401)
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '1'), 6)
  const skipDup = searchParams.get('skip_dup') === 'true'
  const start = Date.now()

  console.log(`\n🚀 CRON START — ${new Date().toISOString()} — count:${count}`)

  const liveData = await fetchLiveData(nicheConfig.liveData).catch(() => null)
  const liveDataText = formatLiveDataForPost(liveData)

  let stories = []
  try { stories = await fetchAllSources(nicheConfig); console.log(`📰 Stories: ${stories.length}`) }
  catch (err) { return apiResponse({ success: false, error: 'News fetch failed', details: err.message }, 500) }

  if (!stories.length) return apiResponse({ success: false, error: 'Zero stories from all sources' }, 500)

  const published = [], errors = [], usedLinks = new Set()
  for (let i = 0; i < count; i++) {
    try {
      const result = await publishOne(stories, liveData, liveDataText, usedLinks, skipDup)
      if (result?.id) published.push(result); else errors.push(`Post ${i+1}: ${result?.error}`)
    } catch (err) { errors.push(`Post ${i+1}: ${err.message}`) }
    if (i < count - 1) await new Promise(r => setTimeout(r, 4000))
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`===== DONE in ${duration}s — Published:${published.length} Errors:${errors.length}`)
  return apiResponse({ success: true, requested: count, published: published.length, duration_seconds: parseFloat(duration), posts: published, errors: errors.length ? errors : undefined })
}
