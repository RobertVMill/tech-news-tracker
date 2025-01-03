import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'] // Add these fields to get full content
  }
});

function cleanHtmlContent(html: string | object | undefined): string {
  if (!html) return '';
  
  // If html is an object, try to extract text content
  if (typeof html === 'object') {
    try {
      return cleanHtmlContent(JSON.stringify(html));
    } catch {
      return '';
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
    .trim();

  // Get first 300 characters for preview
  const preview = textContent.slice(0, 300);
  return preview + (textContent.length > 300 ? '...' : '');
}

function ensureString(value: string | number | boolean | object | null | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return String(value.title || value.name || value.text || JSON.stringify(value));
    } catch {
      return '';
    }
  }
  return String(value);
}

export async function GET() {
  try {
    const feed = await parser.parseURL('https://community.openai.com/c/announcements.rss');
    
    const updates = feed.items.map(item => {
      // Get the full content from either content:encoded or description
      const fullContent = item['content:encoded'] || item.description || item.content;
      
      return {
        title: ensureString(item.title),
        description: cleanHtmlContent(fullContent),
        url: ensureString(item.link),
        published_at: ensureString(item.pubDate || item.isoDate || new Date().toISOString()),
        author: ensureString(item.creator || 'OpenAI')
      };
    }).filter(update => update.title && update.description); // Only include updates with valid title and description

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