import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser()

export async function GET() {
  try {
    const feed = await parser.parseURL('https://openai.com/blog/rss.xml')
    
    const updates = feed.items.map(item => ({
      title: item.title || '',
      content: item.contentSnippet || item.content || '',
      source_url: item.link || '',
      published_at: item.pubDate || '',
      author: item.creator || 'OpenAI',
      type: 'blog'
    }))

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching OpenAI updates:', error)
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }
} 