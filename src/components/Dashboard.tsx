import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  Play, 
  Download, 
  Share2, 
  Clock, 
  Video, 
  Trash2,
  RefreshCw,
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface VideoGeneration {
  id: string
  userId: string
  prompt: string
  mode: 'text' | 'image'
  settings: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  thumbnailUrl?: string
  duration: number
  aspectRatio: string
  creditsUsed: number
  createdAt: string
  completedAt?: string
  errorMessage?: string
}

interface DashboardProps {
  user: {
    id: string
    email: string
    displayName?: string
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [generations, setGenerations] = useState<VideoGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  const loadGenerations = useCallback(async () => {
    try {
      const data = await blink.db.videoGenerations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      setGenerations(data)
    } catch (error) {
      console.error('Failed to load generations:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  const refreshGenerations = async () => {
    setRefreshing(true)
    await loadGenerations()
    setRefreshing(false)
  }

  const deleteGeneration = async (id: string) => {
    try {
      await blink.db.videoGenerations.delete(id)
      setGenerations(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Failed to delete generation:', error)
    }
  }

  useEffect(() => {
    loadGenerations()
  }, [user.id, loadGenerations])

  // Filter generations based on search and status
  const filteredGenerations = generations.filter(gen => {
    const matchesSearch = gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || gen.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'generating': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'generating': return 'Generating'
      case 'pending': return 'Pending'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = {
    total: generations.length,
    completed: generations.filter(g => g.status === 'completed').length,
    generating: generations.filter(g => g.status === 'generating').length,
    failed: generations.filter(g => g.status === 'failed').length,
    totalCredits: generations.reduce((sum, g) => sum + g.creditsUsed, 0)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your creations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Creations</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view your AI-generated videos
          </p>
        </div>
        <Button onClick={refreshGenerations} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Video className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Generating</p>
                <p className="text-2xl font-bold text-blue-600">{stats.generating}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Used</p>
                <p className="text-2xl font-bold">{stats.totalCredits}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-sm font-bold">C</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Generations Grid */}
      {filteredGenerations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start creating your first AI video!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((generation) => (
            <Card key={generation.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {generation.status === 'generating' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Generating...</p>
                      <Progress value={generation.progress} className="w-32 mt-2" />
                    </div>
                  </div>
                ) : generation.status === 'completed' && generation.videoUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-purple-500/20">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                ) : generation.status === 'failed' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                    <div className="text-center text-red-600">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 text-xl">!</span>
                      </div>
                      <p className="text-sm">Generation failed</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badge */}
                <Badge 
                  className={`absolute top-2 right-2 ${getStatusColor(generation.status)} text-white`}
                >
                  {getStatusText(generation.status)}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium line-clamp-2 text-sm">
                      {generation.prompt}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {generation.mode === 'text' ? 'Text to Video' : 'Image to Video'}
                      </Badge>
                      <span>{generation.duration}s</span>
                      <span>{generation.aspectRatio}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(generation.createdAt)}
                    </div>
                    <span>{generation.creditsUsed} credit{generation.creditsUsed !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {generation.errorMessage && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {generation.errorMessage}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {generation.status === 'completed' && generation.videoUrl && (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share2 className="mr-1 h-3 w-3" />
                          Share
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteGeneration(generation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}