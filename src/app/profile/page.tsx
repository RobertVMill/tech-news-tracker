'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Reference {
  url: string;
  content: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  reference_list?: Reference[];
}

const Profile = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [newArticle, setNewArticle] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchArticles()
    }
  }, [user])

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('articles')
        .insert([
          {
            title: newArticle.title,
            content: newArticle.content,
            user_id: user?.id,
          },
        ])

      if (error) throw error

      setNewArticle({ title: '', content: '' })
      setShowNewArticle(false)
      fetchArticles()
    } catch (error) {
      console.error('Error creating article:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article)
  }

  if (loading) {
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
          <h1 className="notion-like-title">Profile</h1>
        </div>
      </header>
      <main className="notion-like-container py-8">
        <div className="space-y-8">
          <div className="bg-[color:var(--sidebar)] p-6 rounded-lg border border-[color:var(--border)]">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[color:var(--text-secondary)]">Email</label>
                <div className="mt-1">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm text-[color:var(--text-secondary)]">Account Created</label>
                <div className="mt-1">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--sidebar)] p-6 rounded-lg border border-[color:var(--border)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Articles</h2>
              <button
                onClick={() => setShowNewArticle(true)}
                className="notion-like-button notion-like-button-primary"
              >
                New Article
              </button>
            </div>

            {showNewArticle && (
              <form onSubmit={handleSubmitArticle} className="mb-8 space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Article Title"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    className="w-full p-2 border border-[color:var(--border)] rounded-md bg-[color:var(--background)]"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Write your article..."
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    className="w-full h-48 p-2 border border-[color:var(--border)] rounded-md bg-[color:var(--background)]"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="notion-like-button notion-like-button-primary"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewArticle(false)}
                    className="notion-like-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {articles.length === 0 ? (
                <p className="text-[color:var(--text-secondary)]">No articles yet. Create your first one!</p>
              ) : (
                articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="p-4 border border-[color:var(--border)] rounded-md hover:bg-[color:var(--hover)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--hover)] flex items-center justify-center text-sm">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-3 ml-11">{article.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[color:var(--background)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[color:var(--background)] p-6 border-b border-[color:var(--border)] flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{selectedArticle.title}</h2>
                <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                  {new Date(selectedArticle.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-[color:var(--text-secondary)] hover:text-[color:var(--text)] p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[color:var(--sidebar)] rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Article Content</h3>
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
                    </div>
                  </div>
                </div>

                {/* References Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    {selectedArticle.reference_list && selectedArticle.reference_list.length > 0 ? (
                      <div className="bg-[color:var(--sidebar)] rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <h3 className="text-lg font-medium">References</h3>
                          <span className="ml-2 px-2 py-0.5 bg-[color:var(--hover)] rounded-full text-xs">
                            {selectedArticle.reference_list.length}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {selectedArticle.reference_list.map((ref: Reference, index: number) => (
                            <div key={index} className="border border-[color:var(--border)] rounded-lg p-4">
                              {ref.url && (
                                <div className="mb-3">
                                  <label className="text-xs text-[color:var(--text-secondary)] block mb-1">URL</label>
                                  <a
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline break-all text-sm block"
                                  >
                                    {ref.url}
                                  </a>
                                </div>
                              )}
                              {ref.content && (
                                <div>
                                  <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Content</label>
                                  <div className="text-sm whitespace-pre-wrap">
                                    {ref.content}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[color:var(--sidebar)] rounded-lg p-6 text-center text-[color:var(--text-secondary)]">
                        No references available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 