'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CompanyUpdate {
  title: string
  content: string
  source_url: string
  published_at: string
  author: string
  type: 'blog' | 'developer'
}

const TECH_COMPANIES = [
  { name: 'Google', logo: 'G' },
  { name: 'Apple', logo: 'A' },
  { name: 'Microsoft', logo: 'M' },
  { name: 'Meta', logo: 'M' },
  { name: 'Amazon', logo: 'A' },
  { name: 'OpenAI', logo: 'O' },
  { name: 'NVIDIA', logo: 'N' },
  { name: 'Tesla', logo: 'T' },
]

const CompaniesPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [updates, setUpdates] = useState<CompanyUpdate[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchCompanyUpdates()
    }
  }, [user, selectedCompany])

  const fetchCompanyUpdates = async () => {
    try {
      setIsLoading(true)

      if (selectedCompany === 'Google') {
        const response = await fetch('/api/company-updates/google')
        const data = await response.json()
        
        if (response.ok) {
          setUpdates(data.updates)
        } else {
          throw new Error(data.error || 'Failed to fetch updates')
        }
      } else {
        setUpdates([])
      }
    } catch (error) {
      console.error('Error fetching updates:', error)
      setUpdates([])
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[color:var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

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
          <h1 className="notion-like-title">Company Updates</h1>
        </div>
      </header>
      
      <main className="notion-like-container py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar with company filters */}
          <div className="col-span-3 space-y-4">
            <div className="bg-[color:var(--sidebar)] p-4 rounded-lg border border-[color:var(--border)]">
              <h2 className="font-semibold mb-4">Companies</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    !selectedCompany ? 'bg-[color:var(--hover)]' : 'hover:bg-[color:var(--hover)]'
                  }`}
                >
                  All Companies
                </button>
                {TECH_COMPANIES.map((company) => (
                  <button
                    key={company.name}
                    onClick={() => setSelectedCompany(company.name)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCompany === company.name ? 'bg-[color:var(--hover)]' : 'hover:bg-[color:var(--hover)]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-[color:var(--hover)] flex items-center justify-center text-sm">
                        {company.logo}
                      </div>
                      <span>{company.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="col-span-9">
            <div className="space-y-4">
              {updates.length === 0 ? (
                <div className="text-center py-8 bg-[color:var(--sidebar)] rounded-lg border border-[color:var(--border)]">
                  <p className="text-[color:var(--text-secondary)]">No updates available.</p>
                  <p className="text-sm text-[color:var(--text-secondary)] mt-2">
                    Select a company to see their latest updates.
                  </p>
                </div>
              ) : (
                updates.map((update, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[color:var(--sidebar)] rounded-lg border border-[color:var(--border)]"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--hover)] flex items-center justify-center text-sm">
                        G
                      </div>
                      <div>
                        <h3 className="font-medium">{update.title}</h3>
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          Google • {new Date(update.published_at).toLocaleDateString()} • {update.author}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm ml-11 mb-3">{update.content}</p>
                    {update.source_url && (
                      <div className="ml-11">
                        <a
                          href={update.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Read more →
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CompaniesPage 