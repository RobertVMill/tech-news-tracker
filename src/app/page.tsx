'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const Home = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
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
        <h1 className="notion-like-title">Tech News Tracker</h1>
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
          <div className="text-[color:var(--text-secondary)]">
            Welcome back, {user?.email}
          </div>
          <div className="prose prose-sm">
            <p className="text-[color:var(--text-secondary)]">
              Your personal tech news dashboard
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
