import { useState, useEffect, useRef, useCallback } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { 
  Play, 
  Upload, 
  Settings, 
  Zap, 
  Clock, 
  Volume2, 
  VolumeX,
  Loader2,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface User {
  id: string
  email: string
  displayName?: string
}

interface VideoGeneratorProps {
  user?: User
}

interface GenerationProgress {
  id: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  errorMessage?: string
}

export function VideoGenerator({ user }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState<GenerationProgress | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [fastMode, setFastMode] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [duration, setDuration] = useState('8')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [credits, setCredits] = useState(42)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent generations
  const loadRecentGenerations = useCallback(async () => {
    if (!user) return
    
    try {
      const data = await blink.db.videoGenerations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 4
      })
      setRecentGenerations(data)
    } catch (error) {
      console.error('Failed to load recent generations:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadRecentGenerations()
    }
  }, [user, loadRecentGenerations])

  // Simulate progress updates for generating videos
  const simulateProgress = (generationId: string) => {
    let progress = 0
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5 // Random progress between 5-20%
      
      if (progress >= 100) {
        progress = 100
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
      
      setCurrentGeneration(prev => prev ? { ...prev, progress } : null)
    }, 1000)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate videos.",
        variant: "destructive"
      })
      return
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your video.",
        variant: "destructive"
      })
      return
    }

    if (mode === 'image' && !uploadedImage) {
      toast({
        title: "Image Required",
        description: "Please upload a reference image for image-to-video generation.",
        variant: "destructive"
      })
      return
    }
    
    setIsGenerating(true)
    
    try {
      // Create generation record in database
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const settings = JSON.stringify({
        fastMode,
        audioEnabled,
        duration: parseInt(duration),
        aspectRatio
      })

      await blink.db.videoGenerations.create({
        id: generationId,
        userId: user.id,
        prompt,
        mode,
        settings,
        status: 'generating',
        progress: 0,
        duration: parseInt(duration),
        aspectRatio,
        creditsUsed: fastMode ? 2 : 1,
        createdAt: new Date().toISOString()
      })

      setCurrentGeneration({
        id: generationId,
        status: 'generating',
        progress: 0
      })

      // Start progress simulation
      simulateProgress(generationId)

      let imageUrl = null
      if (mode === 'image' && uploadedImage) {
        try {
          // Upload image to storage first
          const { publicUrl } = await blink.storage.upload(
            uploadedImage,
            `generations/${generationId}/reference.${uploadedImage.name.split('.').pop()}`,
            { upsert: true }
          )
          imageUrl = publicUrl
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          
          await blink.db.videoGenerations.update(generationId, {
            status: 'failed',
            errorMessage: 'Image upload failed. Please try again.'
          })
          
          setCurrentGeneration({
            id: generationId,
            status: 'failed',
            progress: 0,
            errorMessage: 'Image upload failed. Please try again.'
          })

          toast({
            title: "Upload Failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive"
          })

          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          
          return
        }
      }

      // Generate video using Blink AI
      let generatedImageUrl: string

      try {
        if (mode === 'image' && imageUrl) {
          // For image-to-video, use modifyImage to transform the uploaded image
          const { data } = await blink.ai.modifyImage({
            images: [imageUrl],
            prompt: `Transform this image into a video frame: ${prompt}`,
            quality: 'high',
            n: 1
          })
          generatedImageUrl = data[0].url
        } else {
          // For text-to-video, generate an image as video placeholder
          const { data } = await blink.ai.generateImage({
            prompt: `Create a cinematic video frame for: ${prompt}`,
            size: aspectRatio === '9:16' ? '1024x1792' : aspectRatio === '1:1' ? '1024x1024' : '1792x1024',
            quality: 'high',
            n: 1
          })
          generatedImageUrl = data[0].url
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError)
        
        // Update generation record with failure
        await blink.db.videoGenerations.update(generationId, {
          status: 'failed',
          errorMessage: 'AI generation failed. Please try again.'
        })
        
        setCurrentGeneration({
          id: generationId,
          status: 'failed',
          progress: 0,
          errorMessage: 'AI generation failed. Please try again.'
        })

        toast({
          title: "Generation Failed",
          description: "AI generation failed. Please try again.",
          variant: "destructive"
        })

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        
        return
      }

      // Simulate video generation completion
      setTimeout(async () => {
        try {
          // Update generation record
          await blink.db.videoGenerations.update(generationId, {
            status: 'completed',
            progress: 100,
            videoUrl: generatedImageUrl, // In real implementation, this would be the actual video URL
            thumbnailUrl: generatedImageUrl,
            completedAt: new Date().toISOString()
          })

          setCurrentGeneration({
            id: generationId,
            status: 'completed',
            progress: 100,
            videoUrl: generatedImageUrl
          })

          setCredits(prev => prev - (fastMode ? 2 : 1))
          
          toast({
            title: "Video Generated Successfully!",
            description: "Your AI video is ready to view and download.",
          })

          // Reload recent generations
          loadRecentGenerations()

        } catch (error) {
          console.error('Failed to complete generation:', error)
          await blink.db.videoGenerations.update(generationId, {
            status: 'failed',
            errorMessage: 'Generation failed. Please try again.'
          })
          
          setCurrentGeneration({
            id: generationId,
            status: 'failed',
            progress: 0,
            errorMessage: 'Generation failed. Please try again.'
          })

          toast({
            title: "Generation Failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive"
          })
        }
      }, 8000 + Math.random() * 5000) // 8-13 seconds

    } catch (error) {
      console.error('Failed to start generation:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to start video generation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const resetGeneration = () => {
    setCurrentGeneration(null)
    setPrompt('')
    setUploadedImage(null)
    setImagePreview(null)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generation Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-accent" />
                  AI Video Generator
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {credits} credits
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'text' | 'image')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text to Video</TabsTrigger>
                  <TabsTrigger value="image">Image to Video</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="prompt">Describe your video</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A serene lake at sunset with gentle ripples, surrounded by mountains and reflecting the golden sky..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] mt-2"
                      disabled={isGenerating}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4">
                  <div>
                    <Label>Upload reference image</Label>
                    <div 
                      className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            {uploadedImage?.name}
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-prompt">Animation prompt</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="Make the water ripple gently, add floating leaves..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[80px] mt-2"
                      disabled={isGenerating}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Generation Settings */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fast-mode" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Fast Mode (2x credits)
                  </Label>
                  <Switch
                    id="fast-mode"
                    checked={fastMode}
                    onCheckedChange={setFastMode}
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio" className="flex items-center gap-2">
                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Generate Audio
                  </Label>
                  <Switch
                    id="audio"
                    checked={audioEnabled}
                    onCheckedChange={setAudioEnabled}
                    disabled={isGenerating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </Label>
                    <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 seconds</SelectItem>
                        <SelectItem value="8">8 seconds</SelectItem>
                        <SelectItem value="12">12 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4" />
                      Aspect Ratio
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating || !user}
                className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Generate Video ({fastMode ? 2 : 1} credit{fastMode ? 's' : ''})
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to generate videos
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                {currentGeneration && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetGeneration}
                    disabled={currentGeneration.status === 'generating'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Video
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {currentGeneration?.status === 'generating' ? (
                  <div className="text-center p-6">
                    <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Creating your video...</p>
                    <Progress value={currentGeneration.progress} className="w-64 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(currentGeneration.progress)}% complete
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This usually takes 30-90 seconds
                    </p>
                  </div>
                ) : currentGeneration?.status === 'completed' && currentGeneration.videoUrl ? (
                  <div className="w-full h-full relative">
                    <img 
                      src={currentGeneration.videoUrl} 
                      alt="Generated video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-4">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-white font-medium">Video Generated!</p>
                        <p className="text-white/80 text-sm">Click to play</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                ) : currentGeneration?.status === 'failed' ? (
                  <div className="text-center p-6">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Generation Failed</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentGeneration.errorMessage || 'Something went wrong. Please try again.'}
                    </p>
                    <Button onClick={resetGeneration} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Your generated video will appear here</p>
                  </div>
                )}
              </div>

              {/* Video Actions */}
              {currentGeneration?.status === 'completed' && currentGeneration.videoUrl && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Generations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Generations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentGenerations.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {recentGenerations.map((generation) => (
                    <div
                      key={generation.id}
                      className="aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors relative overflow-hidden group"
                    >
                      {generation.thumbnailUrl ? (
                        <>
                          <img 
                            src={generation.thumbnailUrl} 
                            alt="Generated video"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : generation.status === 'generating' ? (
                        <div className="text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Generating...</p>
                        </div>
                      ) : generation.status === 'failed' ? (
                        <div className="text-center">
                          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                          <p className="text-xs text-red-500">Failed</p>
                        </div>
                      ) : (
                        <Play className="h-6 w-6 text-muted-foreground" />
                      )}
                      
                      <div className="absolute bottom-1 left-1 right-1">
                        <p className="text-xs text-white bg-black/50 rounded px-1 py-0.5 truncate">
                          {generation.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Your recent videos will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}