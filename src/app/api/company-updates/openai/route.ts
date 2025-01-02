import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate', 'link', 'content:encoded']
  }
})

export async function GET() {
  try {
    // Using OpenAI's blog URL directly
    const response = await fetch('https://openai.com/blog')
    const html = await response.text()

    // Extract the latest blog posts from the HTML
    const posts = extractBlogPosts(html)

    if (posts.length === 0) {
      console.error('No blog posts found')
      return NextResponse.json({ error: 'No updates available' }, { status: 404 })
    }

    const updates = posts.map(post => ({
      title: post.title,
      content: post.description,
      source_url: `https://openai.com${post.url}`,
      published_at: post.date || new Date().toISOString(),
      author: 'OpenAI',
      type: 'blog' as const
    }))

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching OpenAI updates:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function extractBlogPosts(html: string) {
  const posts: Array<{
    title: string
    description: string
    url: string
    date?: string
  }> = []

  try {
    // Extract blog posts using regex patterns
    const blogPattern = /<article[^>]*>.*?<h2[^>]*>(.*?)<\/h2>.*?<p[^>]*>(.*?)<\/p>.*?<a[^>]*href="([^"]*)".*?<\/article>/gs
    const matches = html.matchAll(blogPattern)

    for (const match of matches) {
      const [_, title, description, url] = match
      if (title && description && url) {
        posts.push({
          title: title.replace(/<[^>]*>/g, '').trim(),
          description: description.replace(/<[^>]*>/g, '').trim(),
          url: url.trim(),
          date: new Date().toISOString() // Using current date as fallback
        })
      }
    }
  } catch (error) {
    console.error('Error parsing blog posts:', error)
  }

  return posts
} 