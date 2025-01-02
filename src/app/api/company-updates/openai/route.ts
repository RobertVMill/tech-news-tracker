import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'] // Add these fields to get full content
  }
});

function cleanHtmlContent(html: string): string {
  // Remove HTML tags
  const textContent = html.replace(/<[^>]+>/g, ' ')
    // Replace multiple spaces/newlines with single space
    .replace(/\s+/g, ' ')
    // Remove special characters and extra whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  // Get first 300 characters for preview
  const preview = textContent.slice(0, 300);
  return preview + (textContent.length > 300 ? '...' : '');
}

export async function GET() {
  try {
    const feed = await parser.parseURL('https://community.openai.com/c/announcements.rss');
    
    const updates = feed.items.map(item => {
      // Get the full content from either content:encoded or description
      const fullContent = (item['content:encoded'] || item.description || item.content || '').toString();
      
      return {
        title: item.title || '',
        description: cleanHtmlContent(fullContent),
        url: item.link || '',
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || 'OpenAI'
      };
    });

    // Sort by date, most recent first
    const sortedUpdates = updates.sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({ updates: sortedUpdates });
  } catch (error) {
    console.error('Error fetching OpenAI updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
} 