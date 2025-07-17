import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Play,
  Edit,
  Share,
  Download,
  TrendingUp,
  Clock,
  Scissors,
  CheckCircle,
  X,
  Search,
  Filter,
  SortDesc
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { videoService, type Clip } from '@/services/videoService'
import { automationService } from '@/services/automationService'
import { toast } from 'sonner'

export function ReviewQueue() {
  const [clips, setClips] = useState<Clip[]>([])
  const [filteredClips, setFilteredClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'virality' | 'date' | 'duration'>('virality')
  const [filterStatus, setFilterStatus] = useState<'all' | 'generated' | 'posted'>('all')
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [editingClip, setEditingClip] = useState<Clip | null>(null)

  useEffect(() => {
    loadClips()
  }, [])

  useEffect(() => {
    filterAndSortClips()
  }, [clips, searchQuery, sortBy, filterStatus, filterAndSortClips])

  const loadClips = async () => {
    try {
      const userClips = await videoService.getAllUserClips()
      setClips(userClips)
    } catch (error) {
      toast.error('Failed to load clips')
      console.error('Error loading clips:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortClips = useCallback(() => {
    let filtered = clips

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(clip =>
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(clip => clip.status === filterStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'virality':
          return b.viralityScore - a.viralityScore
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'duration':
          return b.duration - a.duration
        default:
          return 0
      }
    })

    setFilteredClips(filtered)
  }, [clips, searchQuery, sortBy, filterStatus])

  const handleEditClip = (clip: Clip) => {
    setEditingClip({ ...clip })
  }

  const handleSaveEdit = () => {
    if (!editingClip) return

    // Update the clip in the local state
    setClips(prevClips =>
      prevClips.map(clip =>
        clip.id === editingClip.id ? editingClip : clip
      )
    )

    setEditingClip(null)
    toast.success('Clip updated successfully!')
  }

  const handlePostClip = async (clip: Clip, platforms: string[]) => {
    try {
      const success = await automationService.postClipNow(clip.id, platforms)
      
      if (success) {
        const updatedClip = {
          ...clip,
          status: 'posted' as const,
          postedPlatforms: platforms
        }

        setClips(prevClips =>
          prevClips.map(c => c.id === clip.id ? updatedClip : c)
        )

        toast.success(`Posted to ${platforms.join(', ')}!`)
      } else {
        toast.error('Failed to post clip to some platforms')
      }
    } catch (error) {
      toast.error('Failed to post clip')
      console.error('Error posting clip:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getViralityColor = (score: number) => {
    if (score >= 9) return 'text-green-500'
    if (score >= 8) return 'text-yellow-500'
    if (score >= 7) return 'text-orange-500'
    return 'text-red-500'
  }

  const getViralityBadge = (score: number) => {
    if (score >= 9) return 'Viral'
    if (score >= 8) return 'High'
    if (score >= 7) return 'Good'
    return 'Low'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Queue</h2>
          <p className="text-muted-foreground">Loading your generated clips...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-[9/16] bg-muted rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Review Queue</h2>
        <p className="text-muted-foreground">
          Review and manage your AI-generated clips before posting
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clips by title, caption, or hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virality">Virality Score</SelectItem>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredClips.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clips found</h3>
            <p className="text-muted-foreground mb-4">
              {clips.length === 0 
                ? "You haven't generated any clips yet. Upload a video to get started!"
                : "No clips match your current filters. Try adjusting your search or filters."
              }
            </p>
            {clips.length === 0 && (
              <Button onClick={() => window.location.hash = 'upload'}>
                Upload Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClips.map((clip) => (
            <Card key={clip.id} className="glass-card group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                {/* Video Preview Placeholder */}
                <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white/80" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className={getViralityColor(clip.viralityScore)}>
                      {getViralityBadge(clip.viralityScore)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                      {formatDuration(clip.duration)}
                    </Badge>
                  </div>
                  {clip.status === 'posted' && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Posted
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Clip Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {clip.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {clip.caption}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className={getViralityColor(clip.viralityScore)}>
                        {clip.viralityScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {clip.hashtags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {clip.hashtags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{clip.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{clip.title}</DialogTitle>
                          <DialogDescription>
                            Virality Score: {clip.viralityScore.toFixed(1)} • Duration: {formatDuration(clip.duration)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                            <Play className="h-16 w-16 text-white/80" />
                          </div>
                          <div className="space-y-2">
                            <Label>Caption</Label>
                            <p className="text-sm text-muted-foreground">{clip.caption}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Hashtags</Label>
                            <div className="flex flex-wrap gap-1">
                              {clip.hashtags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClip(clip)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>

                    {clip.status === 'generated' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1">
                            <Share className="h-3 w-3 mr-1" />
                            Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Post to Social Media</DialogTitle>
                            <DialogDescription>
                              Select platforms to post this clip
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              {['TikTok', 'Instagram', 'YouTube Shorts', 'Twitter'].map(platform => (
                                <Button
                                  key={platform}
                                  variant="outline"
                                  onClick={() => handlePostClip(clip, [platform])}
                                  className="justify-start"
                                >
                                  {platform}
                                </Button>
                              ))}
                            </div>
                            <Button
                              onClick={() => handlePostClip(clip, ['TikTok', 'Instagram'])}
                              className="w-full"
                            >
                              Post to All Platforms
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Clip Dialog */}
      {editingClip && (
        <Dialog open={!!editingClip} onOpenChange={() => setEditingClip(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Clip</DialogTitle>
              <DialogDescription>
                Customize the title, caption, and hashtags for this clip
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingClip.title}
                  onChange={(e) => setEditingClip({ ...editingClip, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={editingClip.caption}
                  onChange={(e) => setEditingClip({ ...editingClip, caption: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-hashtags">Hashtags</Label>
                <Input
                  id="edit-hashtags"
                  value={editingClip.hashtags.join(' ')}
                  onChange={(e) => setEditingClip({ 
                    ...editingClip, 
                    hashtags: e.target.value.split(' ').filter(tag => tag.trim()) 
                  })}
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingClip(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}