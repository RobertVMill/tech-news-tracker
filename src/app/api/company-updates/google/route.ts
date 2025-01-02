import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser()

export async function GET() {
  try {
    const [blogFeed, devFeed] = await Promise.all([
      parser.parseURL('https://blog.google/rss/'),
      parser.parseURL('https://android-developers.googleblog.com/feeds/posts/default')
    ])
    
    const updates = [
      ...blogFeed.items.map(item => ({
        title: item.title || '',
        content: item.contentSnippet || item.content || '',
        source_url: item.link || '',
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || 'Google',
        type: 'blog' as const
      })),
      ...devFeed.items.map(item => ({
        title: item.title || '',
        content: item.contentSnippet || item.content || '',
        source_url: item.link || '',
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || 'Google',
        type: 'developer' as const
      }))
    ]

    // Sort by date, most recent first
    updates.sort((a, b) => {
      const dateA = new Date(a.published_at || new Date())
      const dateB = new Date(b.published_at || new Date())
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching Google updates:', error)
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }
}