import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
import { VideoGenerator } from './components/VideoGenerator'
import { Dashboard } from './components/Dashboard'
import { Gallery } from './components/Gallery'
import { SocialProof } from './components/SocialProof'
import { Footer } from './components/Footer'
import { Toaster } from './components/ui/toaster'

interface User {
  id: string
  email: string
  displayName?: string
}

type Page = 'home' | 'create' | 'gallery' | 'dashboard'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('home')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogin = () => {
    blink.auth.login()
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  const handleNavigation = (page: Page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <VideoGenerator user={user} />
      case 'gallery':
        return <Gallery />
      case 'dashboard':
        return user ? <Dashboard user={user} /> : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your dashboard and manage your video generations.
            </p>
            <button 
              onClick={handleLogin}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-medium"
            >
              Sign In
            </button>
          </div>
        )
      default:
        return (
          <>
            <HeroSection />
            <VideoGenerator user={user} />
            <SocialProof />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigation}
      />
      
      <main>
        {renderPage()}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  )
}

export default App