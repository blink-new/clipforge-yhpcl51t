import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Play,
  Pause,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { automationService, type AutomationSettings as AutomationSettingsType } from '@/services/automationService'

interface PlatformConnection {
  platform: string
  connected: boolean
  username?: string
  lastPost?: string
}

export function AutomationSettings() {
  const [settings, setSettings] = useState<AutomationSettingsType>(automationService.getSettings())

  const [platforms, setPlatforms] = useState<PlatformConnection[]>([
    { platform: 'TikTok', connected: false },
    { platform: 'Instagram', connected: false },
    { platform: 'YouTube Shorts', connected: false },
    { platform: 'Twitter', connected: false }
  ])

  const [automationStats, setAutomationStats] = useState(automationService.getStats())
  const [isRunning, setIsRunning] = useState(settings.enabled)

  useEffect(() => {
    // Update stats every 30 seconds
    const interval = setInterval(() => {
      setAutomationStats(automationService.getStats())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setIsRunning(settings.enabled)
  }, [settings.enabled])

  const saveSettings = () => {
    automationService.updateSettings(settings)
    toast.success('Automation settings saved!')
  }

  const toggleAutomation = () => {
    const newEnabled = !settings.enabled
    const newSettings = { ...settings, enabled: newEnabled }
    setSettings(newSettings)
    automationService.updateSettings(newSettings)
    setIsRunning(newEnabled)
    
    if (newEnabled) {
      toast.success('Automation started! Clips will be posted automatically.')
    } else {
      toast.info('Automation paused. No clips will be posted automatically.')
    }
  }

  const connectPlatform = (platform: string) => {
    // Simulate OAuth connection
    setPlatforms(prev => 
      prev.map(p => 
        p.platform === platform 
          ? { ...p, connected: true, username: `@user_${platform.toLowerCase()}` }
          : p
      )
    )
    toast.success(`Connected to ${platform}!`)
  }

  const disconnectPlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.platform === platform 
          ? { ...p, connected: false, username: undefined }
          : p
      )
    )
    setSettings(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p !== platform)
    }))
    toast.info(`Disconnected from ${platform}`)
  }

  const togglePlatform = (platform: string) => {
    setSettings(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const runNow = async () => {
    toast.success('Manual posting triggered! Processing queue...')
    
    try {
      // This would normally get the next best clip and post it
      // For now, we'll simulate it
      const success = await new Promise<boolean>(resolve => {
        setTimeout(() => resolve(Math.random() > 0.1), 2000)
      })
      
      if (success) {
        toast.success('Posted 1 clip to selected platforms!')
        setAutomationStats(automationService.getStats())
      } else {
        toast.error('Failed to post clip. Please try again.')
      }
    } catch (error) {
      toast.error('Error during manual posting')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automation Settings</h2>
        <p className="text-muted-foreground">
          Configure automated posting and social media connections
        </p>
      </div>

      <Tabs defaultValue="automation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          {/* Master Control */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Automation Control</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={toggleAutomation}
                  />
                  <Badge variant={settings.enabled ? "default" : "secondary"}>
                    {settings.enabled ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Master switch for automated clip posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.enabled && (
                <Alert>
                  <Play className="h-4 w-4" />
                  <AlertDescription>
                    Automation is active. Clips will be posted every {settings.postingInterval} minutes 
                    between {settings.postingHours.start} and {settings.postingHours.end}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Posting Interval</Label>
                  <Select 
                    value={settings.postingInterval.toString()} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, postingInterval: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="120">Every 2 hours</SelectItem>
                      <SelectItem value="240">Every 4 hours</SelectItem>
                      <SelectItem value="480">Every 8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Posts Per Day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxPostsPerDay}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxPostsPerDay: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Posting Hours - Start</Label>
                  <Input
                    type="time"
                    value={settings.postingHours.start}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      postingHours: { ...prev.postingHours, start: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Posting Hours - End</Label>
                  <Input
                    type="time"
                    value={settings.postingHours.end}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      postingHours: { ...prev.postingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Virality Score</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="range"
                      min="6"
                      max="10"
                      step="0.1"
                      value={settings.minViralityScore}
                      onChange={(e) => setSettings(prev => ({ ...prev, minViralityScore: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="min-w-16">
                      {settings.minViralityScore.toFixed(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only clips with scores above this threshold will be posted automatically
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.autoApprove}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApprove: checked }))}
                  />
                  <Label>Auto-approve high-scoring clips (9.0+)</Label>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={saveSettings}>
                  Save Settings
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={runNow}
                    disabled={!settings.enabled || settings.platforms.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Post Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-accent" />
                <span>Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{automationStats.postsToday}</div>
                  <p className="text-xs text-muted-foreground">Posts Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{automationStats.nextPostTime}</div>
                  <p className="text-xs text-muted-foreground">Next Post</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{typeof automationStats.queueSize === 'number' ? automationStats.queueSize : 0}</div>
                  <p className="text-xs text-muted-foreground">Queue Size</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{automationStats.successRate}%</div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Social Media Connections</span>
              </CardTitle>
              <CardDescription>
                Connect your social media accounts for automated posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platforms.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium">{platform.platform}</p>
                      {platform.connected && platform.username && (
                        <p className="text-xs text-muted-foreground">{platform.username}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {platform.connected && (
                      <Switch
                        checked={settings.platforms.includes(platform.platform)}
                        onCheckedChange={() => togglePlatform(platform.platform)}
                      />
                    )}
                    
                    {platform.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectPlatform(platform.platform)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => connectPlatform(platform.platform)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {platforms.filter(p => p.connected).length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect at least one social media platform to enable automation.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Engagement</span>
                    <span className="text-sm font-medium">8.4%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Posting Success Rate</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Virality Score</span>
                    <span className="text-sm font-medium">8.7</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-accent rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Platform Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">TikTok</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">9.2</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Instagram</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 bg-muted rounded-full">
                      <div className="h-2 bg-accent rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">8.5</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">YouTube Shorts</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 bg-muted rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">7.8</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Twitter</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 bg-muted rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '71%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">7.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}