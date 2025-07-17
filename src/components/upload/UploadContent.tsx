import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  Link,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function UploadContent() {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const simulateProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)
    
    const steps = [
      { name: 'Downloading video...', duration: 2000 },
      { name: 'Transcribing with Whisper...', duration: 3000 },
      { name: 'Analyzing content...', duration: 2000 },
      { name: 'Scoring virality...', duration: 1500 },
      { name: 'Generating clips...', duration: 2500 },
      { name: 'Creating subtitles...', duration: 2000 },
      { name: 'Finalizing...', duration: 1000 }
    ]
    
    let currentProgress = 0
    for (const step of steps) {
      setProcessingStep(step.name)
      await new Promise(resolve => setTimeout(resolve, step.duration))
      currentProgress += 100 / steps.length
      setProgress(currentProgress)
    }
    
    setIsProcessing(false)
    setProcessingStep('Processing complete!')
  }

  const handleSubmit = () => {
    if ((uploadMethod === 'file' && selectedFile) || (uploadMethod === 'url' && youtubeUrl)) {
      simulateProcessing()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Content</h2>
        <p className="text-muted-foreground">
          Add videos to generate viral clips automatically
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
              <CardDescription>
                Upload a video file or provide a YouTube URL
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
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-medium">Drop your video here or click to browse</p>
                        <p className="text-sm text-muted-foreground">
                          Supports MP4, MOV, AVI, and other video formats
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
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Enter a custom title for this video"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any context or notes about this video"
                    rows={3}
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
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing || (!selectedFile && !youtubeUrl)}
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
                <span>Processing Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Clip Length</Label>
                <div className="flex space-x-2">
                  <Badge variant="secondary">15-30s</Badge>
                  <Badge variant="outline">30-60s</Badge>
                  <Badge variant="outline">60-90s</Badge>
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">AI Revolution 2024</p>
                    <p className="text-xs text-muted-foreground">5 clips generated</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Tech Podcast #42</p>
                    <p className="text-xs text-muted-foreground">Processing...</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Marketing Webinar</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}