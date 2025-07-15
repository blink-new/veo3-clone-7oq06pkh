import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Play, 
  Heart, 
  Share2, 
  Clock, 
  Eye,
  Sparkles,
  Filter
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ExampleVideo {
  id: string
  title: string
  prompt: string
  category: 'nature' | 'abstract' | 'people' | 'animals' | 'architecture' | 'fantasy'
  duration: number
  views: number
  likes: number
  thumbnailUrl: string
  videoUrl: string
  aspectRatio: '16:9' | '9:16' | '1:1'
  featured: boolean
}

const exampleVideos: ExampleVideo[] = [
  {
    id: '1',
    title: 'Serene Mountain Lake',
    prompt: 'A serene mountain lake at sunset with gentle ripples, surrounded by snow-capped peaks and reflecting the golden sky',
    category: 'nature',
    duration: 8,
    views: 12500,
    likes: 892,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: true
  },
  {
    id: '2',
    title: 'Abstract Fluid Motion',
    prompt: 'Colorful abstract fluid motion with swirling patterns in purple, blue, and gold, creating mesmerizing waves',
    category: 'abstract',
    duration: 12,
    views: 8900,
    likes: 654,
    thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: true
  },
  {
    id: '3',
    title: 'Dancing in Rain',
    prompt: 'A person dancing gracefully in the rain on a city street, with neon lights reflecting on wet pavement',
    category: 'people',
    duration: 10,
    views: 15200,
    likes: 1203,
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: false
  },
  {
    id: '4',
    title: 'Majestic Eagle Flight',
    prompt: 'A majestic eagle soaring through misty mountain valleys with wings spread wide against dramatic clouds',
    category: 'animals',
    duration: 8,
    views: 9800,
    likes: 743,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: false
  },
  {
    id: '5',
    title: 'Modern Architecture',
    prompt: 'Modern glass skyscraper with geometric patterns, reflecting clouds and changing light throughout the day',
    category: 'architecture',
    duration: 6,
    views: 6700,
    likes: 445,
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: false
  },
  {
    id: '6',
    title: 'Enchanted Forest',
    prompt: 'Magical enchanted forest with glowing fireflies, mystical fog, and ancient trees with twisted branches',
    category: 'fantasy',
    duration: 15,
    views: 18900,
    likes: 1456,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=450&fit=crop',
    videoUrl: '#',
    aspectRatio: '16:9',
    featured: true
  },
  {
    id: '7',
    title: 'Ocean Waves Portrait',
    prompt: 'Powerful ocean waves crashing against rocky cliffs with dramatic spray and foam',
    category: 'nature',
    duration: 8,
    views: 11200,
    likes: 823,
    thumbnailUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=450&h=800&fit=crop',
    videoUrl: '#',
    aspectRatio: '9:16',
    featured: false
  },
  {
    id: '8',
    title: 'Geometric Patterns',
    prompt: 'Hypnotic geometric patterns morphing and rotating in perfect symmetry with vibrant colors',
    category: 'abstract',
    duration: 10,
    views: 7400,
    likes: 567,
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop',
    videoUrl: '#',
    aspectRatio: '1:1',
    featured: false
  }
]

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'nature', label: 'Nature' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'people', label: 'People' },
    { value: 'animals', label: 'Animals' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'fantasy', label: 'Fantasy' }
  ]

  const filteredVideos = exampleVideos
    .filter(video => selectedCategory === 'all' || video.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.views - a.views
        case 'popular':
          return b.views - a.views
        case 'liked':
          return b.likes - a.likes
        case 'recent':
          return parseInt(b.id) - parseInt(a.id)
        default:
          return 0
      }
    })

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      nature: 'bg-green-500',
      abstract: 'bg-purple-500',
      people: 'bg-blue-500',
      animals: 'bg-orange-500',
      architecture: 'bg-gray-500',
      fantasy: 'bg-pink-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  const getAspectRatioClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16]'
      case '1:1':
        return 'aspect-square'
      default:
        return 'aspect-video'
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          Video Gallery
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore stunning AI-generated videos created by our community. Get inspired and see what's possible with Veo3.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="liked">Most Liked</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Videos */}
      {sortBy === 'featured' && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="text-2xl font-semibold">Featured Videos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.filter(video => video.featured).slice(0, 3).map((video) => (
              <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className={`${getAspectRatioClass(video.aspectRatio)} bg-muted relative overflow-hidden`}>
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Play className="mr-2 h-5 w-5" />
                      Play Video
                    </Button>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-accent text-white">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                    <Badge className={`${getCategoryColor(video.category)} text-white`}>
                      {video.category}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Clock className="mr-1 h-3 w-3" />
                      {video.duration}s
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-1">{video.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {video.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatNumber(video.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {formatNumber(video.likes)}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className={`${getAspectRatioClass(video.aspectRatio)} bg-muted relative overflow-hidden`}>
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </Button>
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {video.featured && (
                  <Badge className="bg-accent text-white text-xs">
                    <Sparkles className="mr-1 h-2 w-2" />
                    Featured
                  </Badge>
                )}
                <Badge className={`${getCategoryColor(video.category)} text-white text-xs`}>
                  {video.category}
                </Badge>
              </div>
              
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                  <Clock className="mr-1 h-2 w-2" />
                  {video.duration}s
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-3">
              <h4 className="font-medium mb-1 line-clamp-1 text-sm">{video.title}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {video.prompt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(video.views)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(video.likes)}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more videos.
          </p>
        </div>
      )}
    </section>
  )
}