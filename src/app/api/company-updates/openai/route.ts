import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Using OpenAI's newer blog structure
    const response = await fetch('https://openai.com/blog', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract blog posts using a more specific pattern
    const posts = []
    const articlePattern = /<a[^>]*href="\/blog\/([^"]*)"[^>]*>.*?<h2[^>]*>([^<]*)<\/h2>.*?<p[^>]*>([^<]*)<\/p>/gs
    
    let match
    while ((match = articlePattern.exec(html)) !== null) {
      const [_, slug, title, description] = match
      if (slug && title && description) {
        posts.push({
          title: title.trim(),
          content: description.trim(),
          source_url: `https://openai.com/blog/${slug}`,
          published_at: new Date().toISOString(),
          author: 'OpenAI',
          type: 'blog' as const
        })
      }
    }

    if (posts.length === 0) {
      console.error('No blog posts found')
      return NextResponse.json({ error: 'No updates available' }, { status: 404 })
    }

    return NextResponse.json({ updates: posts })
  } catch (error) {
    console.error('Error fetching OpenAI updates:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 