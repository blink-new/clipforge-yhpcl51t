import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Video,
  Scissors,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Users
} from 'lucide-react'

const stats = [
  {
    title: 'Total Videos Processed',
    value: '24',
    change: '+12%',
    icon: Video,
    color: 'text-blue-500'
  },
  {
    title: 'Clips Generated',
    value: '156',
    change: '+23%',
    icon: Scissors,
    color: 'text-green-500'
  },
  {
    title: 'Avg Virality Score',
    value: '8.4',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-accent'
  },
  {
    title: 'Posts Published',
    value: '89',
    change: '+18%',
    icon: CheckCircle,
    color: 'text-primary'
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'processing',
    title: 'Video "AI Revolution 2024" processed',
    description: '5 clips generated with avg score 9.2',
    time: '2 minutes ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'posting',
    title: 'Clip posted to TikTok',
    description: 'Title: "Mind-blowing AI Facts"',
    time: '15 minutes ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'processing',
    title: 'Processing "Tech Trends Podcast #42"',
    description: 'Transcription: 85% complete',
    time: '1 hour ago',
    status: 'processing'
  },
  {
    id: 4,
    type: 'error',
    title: 'Failed to post to Instagram',
    description: 'API rate limit exceeded',
    time: '2 hours ago',
    status: 'error'
  }
]

export function Dashboard() {
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
        {stats.map((stat) => {
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tech Podcast Episode #42</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Transcription in progress...
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Marketing Webinar Recording</span>
                <span>Queue</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Waiting in queue...
              </p>
            </div>
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {activity.status === 'processing' && (
                      <Play className="h-4 w-4 text-blue-500 animate-pulse" />
                    )}
                    {activity.status === 'error' && (
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
              ))}
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
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Upload Video</p>
                <p className="text-xs text-muted-foreground">Add new content</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">Connect Accounts</p>
                <p className="text-xs text-muted-foreground">Social media setup</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">Performance metrics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}