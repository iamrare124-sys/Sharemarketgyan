import Groq from 'groq-sdk'

let _groq = null
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder' })
  return _groq
}

function cleanPara(text) {
  if (!text) return ''
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/^[-*]\s+/gm, '').trim()
}

function parseSections(rawContent) {
  if (!rawContent || rawContent.length < 50) return []
  const sections = []
  if (rawContent.includes('\n## ') || rawContent.includes('\n# ')) {
    const parts = rawContent.split(/\n#{1,3}\s+/)
    parts.forEach((part, i) => {
      if (!part.trim()) return
      if (i === 0) {
        part.trim().split(/\n\n+/).filter(p => p.trim().length > 20).forEach(p => sections.push({ h2: null, body: cleanPara(p) }))
      } else {
        const lines = part.trim().split('\n')
        const h2 = lines[0]?.replace(/[*_#]/g, '').trim()
        const body = lines.slice(1).join('\n\n').trim()
        if (body.length > 20) sections.push({ h2, body: cleanPara(body) })
      }
    })
  } else {
    const paras = rawContent.split(/\n\n+/).filter(p => p.trim().length > 30)
    let current = { h2: null, body: '' }
    paras.forEach(para => {
      const bold = para.trim().match(/^\*\*([^*]+)\*\*\s*$/)
      if (bold) { if (current.body.length > 20) sections.push({ ...current }); current = { h2: bold[1].trim(), body: '' } }
      else { current.body += (current.body ? '\n\n' : '') + para.trim() }
    })
    if (current.body.length > 20) sections.push(current)
  }
  const result = sections.filter(s => s.body?.trim().length > 10)
  if (!result.length && rawContent.length > 100) {
    return rawContent.split(/\n\n+/).filter(p => p.trim().length > 30).slice(0, 8).map(p => ({ h2: null, body: cleanPara(p) }))
  }
  return result
}

function parseFAQ(raw) {
  const faqs = []
  const matches = raw.matchAll(/Q:\s*(.+?)\nA:\s*([\s\S]+?)(?=\nQ:|\n*$)/g)
  for (const m of matches) faqs.push({ question: m[1].trim(), answer: m[2].trim().replace(/\n/g, ' ').slice(0, 300) })
  return faqs.slice(0, 4)
}

export async function generateBlogPost({ newsItem, liveDataText, nicheConfig }) {
  const { ai, seo } = nicheConfig

  const systemPrompt = ai.systemPrompt
  const userPrompt = `NEWS: "${newsItem.title}"
SUMMARY: ${newsItem.description?.slice(0, 350) || newsItem.title}
PUBLISHED: ${new Date(newsItem.publishedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
LIVE DATA: ${liveDataText || 'Market data loading'}

Write an 850-word SEO article. Output exactly this format:

TITLE: [65 chars max, include "${seo.primaryKeyword}" naturally]
META_TITLE: [55-60 chars]
META_DESC: [148-158 chars with keyword]
TAGS: [tag1, tag2, tag3, tag4, tag5]
CATEGORY: [one of: ${seo.categories.map(c => c.slug).join(', ')}]

CONTENT:
[Full article. Start with fact+number. Use ## for section headings. 850 words. Mention live data in first paragraph.]

FAQ:
Q: [real Google search question]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

END`

  let attempt = 0
  while (attempt < (ai.maxRetries || 3)) {
    attempt++
    try {
      const completion = await getGroq().chat.completions.create({
        model: ai.model, max_tokens: 2200, temperature: ai.temperature || 0.85,
        top_p: ai.top_p || 0.9, frequency_penalty: ai.frequency_penalty || 0.4, presence_penalty: ai.presence_penalty || 0.3,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      })
      const raw = completion.choices[0]?.message?.content || ''
      const get = (prefix) => {
        const line = raw.split('\n').find(l => l.startsWith(prefix))
        return line ? line.replace(prefix, '').replace(/["\[\]]/g, '').trim() : ''
      }
      const contentStart = raw.indexOf('CONTENT:')
      const faqStart = raw.indexOf('\nFAQ:')
      const endMark = raw.indexOf('\nEND')
      const contentRaw = contentStart !== -1 ? raw.slice(contentStart + 8, faqStart !== -1 ? faqStart : endMark !== -1 ? endMark : undefined).trim() : ''
      const faqRaw = faqStart !== -1 ? raw.slice(faqStart + 5, endMark !== -1 ? endMark : undefined) : ''

      if (!contentRaw || contentRaw.length < 300) { console.warn(`Attempt ${attempt}: content too short`); continue }

      const sections = parseSections(contentRaw)
      const faq = parseFAQ(faqRaw)
      const metaDesc = (() => {
        const raw = get('META_DESC:') || get('Meta Description:') || ''
        if (raw.length > 20) return raw.slice(0, 160)
        return (sections[0]?.body || contentRaw).slice(0, 155)
      })()
      const tagsRaw = get('TAGS:')
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)

      const parsed = {
        title: get('TITLE:'), metaTitle: get('META_TITLE:') || get('META_DESC:')?.slice(0, 60) || '',
        metaDescription: metaDesc, tags, category: get('CATEGORY:') || seo.categories[0].slug,
        content: { hook: sections[0]?.h2 === null ? sections[0]?.body : null, sections: sections[0]?.h2 === null ? sections.slice(1) : sections, faq, rawContent: contentRaw },
        readingTime: Math.ceil(contentRaw.split(/\s+/).length / 220), wordCount: contentRaw.split(/\s+/).length,
        rawContent: contentRaw,
      }
      if (!parsed.title || !contentRaw) { console.warn(`Attempt ${attempt}: parse failed`); continue }

      // Quality check
      const banned = ['in this article', 'furthermore', 'moreover', 'it is important to note', 'in conclusion', 'delve into']
      const hasBanned = banned.some(p => contentRaw.toLowerCase().includes(p))
      if (hasBanned) { console.warn(`Attempt ${attempt}: banned phrase detected`); continue }

      parsed.aiScore = 7 + (faq.length >= 4 ? 1 : 0) + (/\d/.test(contentRaw.slice(0, 200)) ? 1 : 0) + (parsed.wordCount >= 750 ? 1 : 0)
      return parsed
    } catch (err) { console.error(`Attempt ${attempt} failed:`, err.message); if (attempt >= ai.maxRetries) throw err }
  }
  throw new Error('All attempts failed')
}

export function generateSlug(title) {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 75) + '-' + Date.now().toString(36)
}

export function generateSchema({ post, nicheConfig, url }) {
  const { site, author } = nicheConfig
  return [{
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: post.title, description: post.metaDescription, url,
    datePublished: new Date().toISOString(), dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: author.name, jobTitle: author.title, url: `https://${site.domain}/about` },
    publisher: { '@type': 'Organization', name: site.name, url: `https://${site.domain}`, logo: { '@type': 'ImageObject', url: `https://${site.domain}/logo.png` } },
    image: post.coverImage ? [{ '@type': 'ImageObject', url: post.coverImage, width: 1200, height: 630 }] : undefined,
    keywords: post.tags?.join(', '), inLanguage: 'en-IN', isAccessibleForFree: true,
  }, post.content?.faq?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: post.content.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
  } : null].filter(Boolean)
}

export async function rewritePostInLanguage(post) { return post }
