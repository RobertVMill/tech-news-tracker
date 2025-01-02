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
  user_email: string
}

const Home = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAllArticles()
    }
  }, [user])

  const fetchAllArticles = async () => {
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      if (articles) {
        const articlesWithEmails = articles.map(article => ({
          ...article,
          user_email: article.user_id === user?.id ? user?.email || 'Unknown User' : 'Unknown User'
        }))
        setArticles(articlesWithEmails)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
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
        <div className="flex items-center space-x-6">
          <h1 className="notion-like-title">Tech News Tracker</h1>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className={`notion-like-button ${!showUserMenu ? 'text-[color:var(--foreground)]' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => router.push('/companies')}
              className="notion-like-button"
            >
              Company Updates
            </button>
          </nav>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="notion-like-button flex items-center space-x-2"
          >
            <div className="w-6 h-6 rounded-full bg-[color:var(--hover)] flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[color:var(--background)] border border-[color:var(--border)] z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push('/profile')
                    setShowUserMenu(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--hover)]"
                >
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[color:var(--hover)]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="notion-like-container py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Latest Tech News</h2>
            <button
              onClick={() => router.push('/profile')}
              className="notion-like-button notion-like-button-primary"
            >
              Write Article
            </button>
          </div>

          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[color:var(--text-secondary)]">No articles yet.</p>
                <p className="text-sm text-[color:var(--text-secondary)] mt-2">
                  Be the first to share some tech news!
                </p>
              </div>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border border-[color:var(--border)] rounded-md hover:bg-[color:var(--hover)] transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[color:var(--hover)] flex items-center justify-center text-sm">
                      {article.user_email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-[color:var(--text-secondary)]">
                        {new Date(article.created_at).toLocaleDateString()} • {article.user_email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3 ml-11">{article.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
