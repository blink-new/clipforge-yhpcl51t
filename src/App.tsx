import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { UploadContent } from '@/components/upload/UploadContent'
import blink from '@/blink/client'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">CF</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold gradient-text">ClipForge</h1>
            <p className="text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">CF</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold gradient-text">ClipForge</h1>
            <p className="text-muted-foreground">
              Automated Social Media Clipping Service
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transform long-form videos into viral social media clips using AI transcription, 
              virality scoring, and automated posting across platforms.
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'upload':
        return <UploadContent />
      case 'queue':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Review Queue</h2>
              <p className="text-muted-foreground">
                Review and manage generated clips before posting
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Queue component coming soon...</p>
            </div>
          </div>
        )
      case 'automation':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Automation Control</h2>
              <p className="text-muted-foreground">
                Configure automated posting schedules and platform settings
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Automation panel coming soon...</p>
            </div>
          </div>
        )
      case 'activity':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
              <p className="text-muted-foreground">
                Monitor processing status and system events
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Activity log coming soon...</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Configure API keys, social media accounts, and processing preferences
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App