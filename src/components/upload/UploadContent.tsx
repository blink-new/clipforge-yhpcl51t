import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  Link,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  Scissors,
  TrendingUp
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { videoService, type Video, type Clip } from '@/services/videoService'
import { toast } from 'sonner'

export function UploadContent() {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [generatedClips, setGeneratedClips] = useState<Clip[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
        setError(null)
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''))
        }
      } else {
        setError('Please select a valid video file')
        toast.error('Please select a valid video file')
      }
    }
  }, [title])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError(null)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    } else {
      setError('Please drop a valid video file')
      toast.error('Please drop a valid video file')
    }
  }, [title])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setIsProcessing(true)
      setProgress(0)
      setProcessingStep('Preparing...')

      let video: Video

      if (uploadMethod === 'file' && selectedFile) {
        setProcessingStep('Uploading video...')
        video = await videoService.uploadVideo(selectedFile, title, description)
        toast.success('Video uploaded successfully!')
      } else if (uploadMethod === 'url' && youtubeUrl) {
        if (!isYouTubeUrl(youtubeUrl)) {
          throw new Error('Please enter a valid YouTube URL')
        }
        video = await videoService.addYouTubeVideo(youtubeUrl, title, description)
        toast.success('YouTube video added successfully!')
      } else {
        throw new Error('Please select a file or enter a YouTube URL')
      }

      setCurrentVideo(video)

      // Start processing
      const clips = await videoService.processVideo(
        video.id,
        (step: string, progressValue: number) => {
          setProcessingStep(step)
          setProgress(progressValue)
        }
      )

      setGeneratedClips(clips)
      toast.success(`Processing complete! Generated ${clips.length} clips`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setYoutubeUrl('')
    setTitle('')
    setDescription('')
    setCurrentVideo(null)
    setGeneratedClips([])
    setError(null)
    setProgress(0)
    setProcessingStep('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Content</h2>
        <p className="text-muted-foreground">
          Add videos to generate viral clips automatically using AI
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
              <CardDescription>
                Upload a video file or provide a YouTube URL for AI processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'file' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center space-x-2">
                    <FileVideo className="h-4 w-4" />
                    <span>File Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span>YouTube URL</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFile(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-medium">Drop your video here or click to browse</p>
                        <p className="text-sm text-muted-foreground">
                          Supports MP4, MOV, AVI, WebM and other video formats
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maximum file size: 500MB
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports YouTube videos and YouTube Shorts
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for this video"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any context or notes about this video"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="mt-6 space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-primary animate-pulse" />
                    <span className="font-medium">Processing Video</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{processingStep}</p>
                  <p className="text-xs text-muted-foreground">
                    This may take several minutes depending on video length
                  </p>
                </div>
              )}

              {generatedClips.length > 0 && (
                <div className="mt-6 space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Processing Complete!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Generated {generatedClips.length} clips with an average virality score of{' '}
                    {(generatedClips.reduce((sum, clip) => sum + clip.viralityScore, 0) / generatedClips.length).toFixed(1)}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => window.location.hash = 'queue'}>
                      View Clips
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      Process Another
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                {(currentVideo || generatedClips.length > 0) && (
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing || (!selectedFile && !youtubeUrl) || !title.trim()}
                  className="min-w-32"
                >
                  {isProcessing ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Start Processing
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Processing Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>AI Processing Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Clip Length</Label>
                <div className="flex space-x-2">
                  <Badge variant="secondary">15-30s</Badge>
                  <Badge variant="outline">30-60s</Badge>
                  <Badge variant="outline">60-90s</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimized for TikTok and Instagram Reels
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Target Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">TikTok</Badge>
                  <Badge variant="secondary">Instagram</Badge>
                  <Badge variant="outline">YouTube Shorts</Badge>
                  <Badge variant="outline">Twitter</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Minimum Virality Score</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">7.0</span>
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div className="h-2 bg-accent rounded-full" style={{ width: '70%' }} />
                  </div>
                  <span className="text-sm">10.0</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only clips above this score will be generated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Scissors className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Smart Clipping</p>
                  <p className="text-xs text-muted-foreground">AI identifies viral moments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Virality Scoring</p>
                  <p className="text-xs text-muted-foreground">Predicts engagement potential</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileVideo className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Auto Subtitles</p>
                  <p className="text-xs text-muted-foreground">Dynamic captions generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}