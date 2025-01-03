'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navigation() {
  const { user } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="notion-like-header">
      <div className="flex items-center space-x-6">
        <h1 className="notion-like-title">Tech News Tracker</h1>
        <nav className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="notion-like-button"
          >
            Home
          </button>
          <button
            onClick={() => router.push('/companies')}
            className="notion-like-button"
          >
            Company Updates
          </button>
          <button
            onClick={() => router.push('/sources')}
            className="notion-like-button"
          >
            Sources
          </button>
          <button
            onClick={() => router.push('/earnings')}
            className="notion-like-button"
          >
            Earnings Calendar
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
  )
} 