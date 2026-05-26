import { createClient } from '@supabase/supabase-js'

let _supabase = null
let _supabaseAdmin = null

function getSupabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co' }
function getSupabaseAnon() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon' }
function getSupabaseService() { return process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service' }

export function getSupabase() {
  if (!_supabase) _supabase = createClient(getSupabaseUrl(), getSupabaseAnon())
  return _supabase
}
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) _supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseService())
  return _supabaseAdmin
}

const POST_LIMIT = parseInt(process.env.MAX_POSTS_PER_SITE || '30')

export async function getPosts({ limit = 12, offset = 0, category } = {}) {
  try {
    const siteName = process.env.SITE_NAME || 'forexguru'
     let query = getSupabase()
      .from('posts')
      .select('...')
      .eq('site_name', siteName)   // ← yeh line add karo
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (category) query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) { console.error('getPosts error:', err.message); return [] }
}

export async function getPostBySlug(slug) {
  try {
    const { data, error } = await getSupabase()
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    if (error || !data) return null
    // Parse content JSON
    if (data.content && typeof data.content === 'string') {
      try { data.content = JSON.parse(data.content) } catch {}
    }
    // Increment views
    getSupabaseAdmin().from('posts').update({ views: (data.views || 0) + 1 }).eq('slug', slug).then(() => {})
    return data
  } catch (err) { console.error('getPostBySlug error:', err.message); return null }
}

export async function getRelatedPosts(category, currentSlug, limit = 3) {
  try {
    const { data } = await getSupabase()
      .from('posts')
      .select('slug, title, excerpt, cover_image, reading_time, created_at, category, author_name')
      .eq('category', category)
      .eq('published', true)
      .neq('slug', currentSlug)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  } catch { return [] }
}

export async function getTrendingPosts(limit = 5) {
  try {
    const { data } = await getSupabase()
      .from('posts')
      .select('id, slug, title, category, created_at, views, reading_time')
      .eq('published', true)
      .order('views', { ascending: false })
      .limit(limit)
    return data || []
  } catch { return [] }
}

export async function savePost(postData) {
  const { data, error } = await getSupabaseAdmin()
    .from('posts')
    .insert(postData)
    .select()
    .single()
  if (error) throw error
  await enforcePostLimit()
  return data
}
 const saved = await savePost({
  site_name: process.env.SITE_NAME || 'forexguru',
  slug,
  title: generated.title,
  // ... baaki fields same
})

export async function postExists(sourceUrl) {
  if (!sourceUrl) return false
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('posts')
      .select('id')
      .eq('source_url', sourceUrl)
      .maybeSingle()
    if (error) throw error
    return !!data
  } catch { return false }
}

async function enforcePostLimit() {
  try {
    const { count } = await getSupabaseAdmin().from('posts').select('id', { count: 'exact', head: true }).eq('published', true)
    if (!count || count <= POST_LIMIT) return
    const excess = count - POST_LIMIT
    const { data: oldest } = await getSupabaseAdmin()
      .from('posts').select('id').eq('published', true)
      .order('created_at', { ascending: true }).limit(excess)
    if (oldest?.length) {
      const ids = oldest.map(p => p.id)
      await getSupabaseAdmin().from('posts').delete().in('id', ids)
      console.log(`🗑️ Deleted ${ids.length} old posts`)
    }
  } catch (err) { console.error('enforcePostLimit error:', err.message) }
}
