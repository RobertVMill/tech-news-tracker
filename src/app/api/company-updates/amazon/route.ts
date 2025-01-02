import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate', 'link']
  }
})

export async function GET() {
  try {
    // Try Amazon's AWS News Blog instead
    const feed = await parser.parseURL('https://aws.amazon.com/blogs/aws/feed/')
    
    if (!feed || !feed.items) {
      console.error('No feed items found')
      return NextResponse.json({ error: 'No updates available' }, { status: 404 })
    }

    const updates = feed.items.map(item => {
      // Log the item structure to debug
      console.log('Processing feed item:', JSON.stringify(item, null, 2))

      return {
        title: item.title || 'Untitled',
        content: item.contentSnippet || item.description || item.content || '',
        source_url: item.link || '',
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || item.author || 'AWS',
        type: 'blog' as const
      }
    }).filter(item => item.title && item.content) // Only include items with title and content

    // Sort by date, most recent first
    updates.sort((a, b) => {
      const dateA = new Date(a.published_at || new Date())
      const dateB = new Date(b.published_at || new Date())
      return dateB.getTime() - dateA.getTime()
    })

    if (updates.length === 0) {
      console.error('No valid updates after processing')
      return NextResponse.json({ error: 'No valid updates available' }, { status: 404 })
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching Amazon updates:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 