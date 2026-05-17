export const dynamic = 'force-dynamic'
export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim()
  if (!q || q.length < 2) return Response.json({ results: [] })
  try {
    const { getSupabase } = await import('@/lib/supabase')
    const { data } = await getSupabase().from('posts').select('slug,title,excerpt,category,author_name,created_at,cover_image').eq('published', true).or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,tags.cs.{${q}}`).order('created_at', { ascending: false }).limit(10)
    return Response.json({ results: data || [] })
  } catch (err) { return Response.json({ results: [], error: err.message }) }
}
