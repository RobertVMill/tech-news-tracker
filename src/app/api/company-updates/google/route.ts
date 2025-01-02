import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser({
  customFields: {
    item: ['media:description', 'dc:creator']
  }
})

// Direct RSS feed URLs
const GOOGLE_BLOG_RSS = 'https://blog.google/rss/'
const ANDROID_BLOG_RSS = 'https://android-developers.googleblog.com/feeds/posts/default'

export async function GET() {
  try {
    // Fetch both feeds in parallel
    const [googleFeed, androidFeed] = await Promise.all([
      parser.parseURL(GOOGLE_BLOG_RSS),
      parser.parseURL(ANDROID_BLOG_RSS)
    ])

    // Combine and format the updates
    const updates = [
      ...googleFeed.items.map(item => ({
        title: item.title,
        content: item.contentSnippet || item['media:description'] || '',
        source_url: item.link,
        published_at: item.isoDate || item.pubDate,
        author: item['dc:creator'] || 'Google',
        type: 'blog'
      })),
      ...androidFeed.items.map(item => ({
        title: item.title,
        content: item.contentSnippet || item['media:description'] || '',
        source_url: item.link,
        published_at: item.isoDate || item.pubDate,
        author: item['dc:creator'] || 'Android Developers',
        type: 'developer'
      }))
    ]

    // Sort by date, most recent first
    updates.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Failed to fetch Google updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}