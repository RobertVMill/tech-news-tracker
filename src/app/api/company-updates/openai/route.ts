import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Using GitHub's API to fetch OpenAI's releases and discussions
    const [releasesResponse, blogResponse] = await Promise.all([
      fetch('https://api.github.com/repos/openai/openai-python/releases'),
      fetch('https://api.github.com/repos/openai/openai-cookbook/discussions?category=announcements')
    ])

    if (!releasesResponse.ok || !blogResponse.ok) {
      throw new Error('Failed to fetch from GitHub API')
    }

    const [releases, discussions] = await Promise.all([
      releasesResponse.json(),
      blogResponse.json()
    ])

    // Combine and format the updates
    const updates = [
      ...releases.map(release => ({
        title: release.name || release.tag_name,
        content: release.body || 'No description available',
        source_url: release.html_url,
        published_at: release.published_at,
        author: release.author?.login || 'OpenAI',
        type: 'blog' as const
      })),
      ...discussions.map(discussion => ({
        title: discussion.title,
        content: discussion.body,
        source_url: discussion.html_url,
        published_at: discussion.created_at,
        author: discussion.author?.login || 'OpenAI',
        type: 'blog' as const
      }))
    ]

    // Sort by date, most recent first
    updates.sort((a, b) => {
      const dateA = new Date(a.published_at)
      const dateB = new Date(b.published_at)
      return dateB.getTime() - dateA.getTime()
    })

    if (updates.length === 0) {
      console.error('No updates found')
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