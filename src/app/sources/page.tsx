'use client'

import { useRouter } from 'next/navigation'

interface NewsSource {
  name: string
  url: string
  description: string
  category: string
}

const newsSources: NewsSource[] = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    description: 'Leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.',
    category: 'Tech News'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com',
    description: 'Covers the intersection of technology, science, art, and culture.',
    category: 'Tech News'
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: 'Social news website focusing on computer science and entrepreneurship.',
    category: 'Tech Community'
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com',
    description: 'Independent media company founded at MIT, covering the newest technologies and their commercial, social, and political impacts.',
    category: 'Tech Analysis'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com',
    description: 'In-depth coverage of current and future trends in technology.',
    category: 'Tech Culture'
  }
]

const Sources = () => {
  const router = useRouter()
  const categories = Array.from(new Set(newsSources.map(source => source.category)))

  return (
    <div className="min-h-screen">
      <header className="notion-like-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="notion-like-button"
          >
            ← Back
          </button>
          <h1 className="notion-like-title">News Sources</h1>
        </div>
      </header>

      <main className="notion-like-container py-8">
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="bg-[color:var(--sidebar)] p-6 rounded-lg border border-[color:var(--border)]">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4">
                {newsSources
                  .filter(source => source.category === category)
                  .map(source => (
                    <div
                      key={source.name}
                      className="p-4 border border-[color:var(--border)] rounded-md hover:bg-[color:var(--hover)] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{source.name}</h3>
                          <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                            {source.description}
                          </p>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="notion-like-button ml-4 flex-shrink-0"
                        >
                          Visit →
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Sources 