import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Video,
  Scissors,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Users,
  Upload,
  Plus
} from 'lucide-react'
import { videoService } from '@/services/videoService'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalClips: 0,
    avgViralityScore: 0,
    postsPublished: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        videoService.getStats(),
        videoService.getRecentActivity()
      ])
      
      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Videos Processed',
      value: stats.totalVideos.toString(),
      change: '+12%',
      icon: Video,
      color: 'text-blue-500'
    },
    {
      title: 'Clips Generated',
      value: stats.totalClips.toString(),
      change: '+23%',
      icon: Scissors,
      color: 'text-green-500'
    },
    {
      title: 'Avg Virality Score',
      value: stats.avgViralityScore.toString(),
      change: '+5%',
      icon: TrendingUp,
      color: 'text-accent'
    },
    {
      title: 'Posts Published',
      value: stats.postsPublished.toString(),
      change: '+18%',
      icon: CheckCircle,
      color: 'text-primary'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your automated clipping pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Processing Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-primary" />
              <span>Current Processing</span>
            </CardTitle>
            <CardDescription>
              Active video processing pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.totalVideos === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No videos being processed</p>
                <Button onClick={() => window.location.hash = 'upload'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Video
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Queue</span>
                    <span>Ready</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    All videos processed successfully
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest processing and posting events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {activity.status === 'processing' && (
                        <Play className="h-4 w-4 text-blue-500 animate-pulse" />
                      )}
                      {activity.status === 'failed' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => window.location.hash = 'upload'}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Upload Video</p>
                <p className="text-xs text-muted-foreground">Add new content for processing</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.hash = 'queue'}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <Scissors className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">Review Clips</p>
                <p className="text-xs text-muted-foreground">Manage generated clips</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.hash = 'settings'}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Connect Accounts</p>
                <p className="text-xs text-muted-foreground">Social media setup</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {stats.totalVideos === 0 && (
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-primary" />
              <span>Get Started with ClipForge</span>
            </CardTitle>
            <CardDescription>
              Transform your first video into viral clips in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-sm">Upload or paste YouTube URL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-sm">AI processes and scores clips</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-sm">Review and post to social media</span>
              </div>
            </div>
            <Button onClick={() => window.location.hash = 'upload'} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}