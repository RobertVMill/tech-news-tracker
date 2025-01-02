import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser({
  headers: {
    'Accept': 'application/rss+xml, application/xml;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1'
  }
})

export async function GET() {
  try {
    // Using OpenAI's announcements feed
    const feed = await parser.parseURL('https://community.openai.com/c/announcements.rss')
    
    const updates = feed.items.map(item => ({
      title: item.title || '',
      content: item.contentSnippet || item.content || '',
      source_url: item.link || 'https://community.openai.com/c/announcements',
      published_at: item.pubDate || item.isoDate || new Date().toISOString(),
      author: item.creator || 'OpenAI',
      type: 'blog' as const
    })).filter(item => item.title && item.content)

    // Sort by date, most recent first
    updates.sort((a, b) => {
      const dateA = new Date(a.published_at || new Date())
      const dateB = new Date(b.published_at || new Date())
      return dateB.getTime() - dateA.getTime()
    })

    if (updates.length === 0) {
      console.error('No announcements found')
      return NextResponse.json({ error: 'No updates available' }, { status: 404 })
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching OpenAI updates:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 