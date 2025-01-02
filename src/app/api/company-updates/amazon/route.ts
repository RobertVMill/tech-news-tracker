import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser()

export async function GET() {
  try {
    const feed = await parser.parseURL('https://blog.aboutamazon.com/feed')
    
    const updates = feed.items.map(item => ({
      title: item.title || '',
      content: item.contentSnippet || item.content || '',
      source_url: item.link || '',
      published_at: item.pubDate || item.isoDate || new Date().toISOString(),
      author: item.creator || 'Amazon',
      type: 'blog' as const
    }))

    // Sort by date, most recent first
    updates.sort((a, b) => {
      const dateA = new Date(a.published_at || new Date())
      const dateB = new Date(b.published_at || new Date())
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching Amazon updates:', error)
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }
} 