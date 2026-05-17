export const dynamic = 'force-dynamic'
import { verifyCronSecret, apiResponse } from '@/lib/security'
import { getSupabaseAdmin } from '@/lib/supabase'
export async function GET(request) {
  if (!verifyCronSecret(request)) return apiResponse({ error: 'Unauthorized' }, 401)
  try {
    const db = getSupabaseAdmin()
    const { data: posts } = await db.from('posts').select('id,title,meta_description,content').or('excerpt.is.null,excerpt.eq.').limit(50)
    if (!posts?.length) return apiResponse({ message: 'No posts need fixing', fixed: 0 })
    let fixed = 0
    for (const post of posts) {
      let excerpt = post.meta_description?.slice(0, 200) || ''
      if (!excerpt && post.content) {
        try { const c = typeof post.content === 'string' ? JSON.parse(post.content) : post.content; excerpt = c?.hook?.slice(0, 200) || c?.sections?.[0]?.body?.slice(0, 200) || '' } catch {}
      }
      if (!excerpt) excerpt = post.title + ' — Expert stock market analysis on ShareMarketGyan.in'
      const { error } = await db.from('posts').update({ excerpt: excerpt.trim() }).eq('id', post.id)
      if (!error) fixed++
    }
    return apiResponse({ message: 'Fixed', fixed, total: posts.length })
  } catch (err) { return apiResponse({ error: err.message }, 500) }
}
