import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description']
  }
})

function cleanHtmlContent(html: string | object | undefined): string {
  if (!html) return ''
  
  // If html is an object, try to extract text content
  if (typeof html === 'object') {
    try {
      return cleanHtmlContent(JSON.stringify(html))
    } catch {
      return ''
    }
  }

  // Convert to string and clean
  const textContent = String(html)
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

  // Get first 300 characters for preview
  const preview = textContent.slice(0, 300)
  return preview + (textContent.length > 300 ? '...' : '')
}

interface StringifiableObject {
  title?: string;
  name?: string;
  text?: string;
  [key: string]: unknown;
}

function ensureString(value: string | number | boolean | object | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    try {
      const obj = value as StringifiableObject
      return String(obj.title || obj.name || obj.text || JSON.stringify(value))
    } catch {
      return ''
    }
  }
  return String(value)
}

export async function GET() {
  try {
    const [blogFeed, devFeed] = await Promise.all([
      parser.parseURL('https://blog.google/rss/'),
      parser.parseURL('https://android-developers.googleblog.com/feeds/posts/default')
    ])
    
    const updates = [
      ...blogFeed.items.map(item => {
        const fullContent = item['content:encoded'] || item.description || item.contentSnippet || item.content
        return {
          title: ensureString(item.title),
          description: cleanHtmlContent(fullContent),
          url: ensureString(item.link),
          published_at: ensureString(item.pubDate || item.isoDate || new Date().toISOString()),
          author: ensureString(item.creator || 'Google')
        }
      }),
      ...devFeed.items.map(item => {
        const fullContent = item['content:encoded'] || item.description || item.contentSnippet || item.content
        return {
          title: ensureString(item.title),
          description: cleanHtmlContent(fullContent),
          url: ensureString(item.link),
          published_at: ensureString(item.pubDate || item.isoDate || new Date().toISOString()),
          author: ensureString(item.creator || 'Google')
        }
      })
    ].filter(update => update.title && update.description) // Only include updates with valid title and description

    // Sort by date, most recent first
    const sortedUpdates = updates.sort((a, b) => {
      const dateA = new Date(a.published_at)
      const dateB = new Date(b.published_at)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({ updates: sortedUpdates })
  } catch (error) {
    console.error('Error fetching Google updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}