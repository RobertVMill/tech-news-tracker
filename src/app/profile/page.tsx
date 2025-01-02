'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Profile = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

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
        </div>
      </main>
    </div>
  )
}

export default Profile 