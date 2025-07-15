import { useState } from 'react'
import { Button } from './ui/button'
import { Menu, X, User, Settings, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'

interface NavigationProps {
  user?: {
    email: string
    displayName?: string
  }
  onLogin: () => void
  onLogout: () => void
  currentPage?: string
  onNavigate?: (page: 'home' | 'create' | 'gallery' | 'dashboard') => void
}

export function Navigation({ user, onLogin, onLogout, currentPage = 'home', onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate?.('home')}
              className="text-2xl font-bold hover:opacity-80 transition-opacity"
            >
              <span className="text-foreground">Veo</span>
              <span className="text-accent">3</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate?.('create')}
              className={`transition-colors ${
                currentPage === 'create' 
                  ? 'text-accent font-medium' 
                  : 'text-foreground hover:text-accent'
              }`}
            >
              Create
            </button>
            <button 
              onClick={() => onNavigate?.('gallery')}
              className={`transition-colors ${
                currentPage === 'gallery' 
                  ? 'text-accent font-medium' 
                  : 'text-foreground hover:text-accent'
              }`}
            >
              Gallery
            </button>
            {user && (
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className={`transition-colors ${
                  currentPage === 'dashboard' 
                    ? 'text-accent font-medium' 
                    : 'text-foreground hover:text-accent'
                }`}
              >
                My Videos
              </button>
            )}
          </div>

          {/* User Menu / Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLogin} className="bg-accent hover:bg-accent/90">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <button
                onClick={() => {
                  onNavigate?.('create')
                  setIsMenuOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                  currentPage === 'create' 
                    ? 'text-accent font-semibold' 
                    : 'text-foreground hover:text-accent'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => {
                  onNavigate?.('gallery')
                  setIsMenuOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                  currentPage === 'gallery' 
                    ? 'text-accent font-semibold' 
                    : 'text-foreground hover:text-accent'
                }`}
              >
                Gallery
              </button>
              {user && (
                <button
                  onClick={() => {
                    onNavigate?.('dashboard')
                    setIsMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                    currentPage === 'dashboard' 
                      ? 'text-accent font-semibold' 
                      : 'text-foreground hover:text-accent'
                  }`}
                >
                  My Videos
                </button>
              )}
              <div className="pt-4 pb-3 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium">{user.displayName || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Button onClick={onLogin} className="w-full bg-accent hover:bg-accent/90">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}