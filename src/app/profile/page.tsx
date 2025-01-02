'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Article {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
}

const Profile = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [newArticle, setNewArticle] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
                    className="p-4 border border-[color:var(--border)] rounded-md hover:bg-[color:var(--hover)] transition-colors"
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
    </div>
  )
}

export default Profile 