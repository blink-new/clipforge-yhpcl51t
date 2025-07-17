import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Upload,
  List,
  Settings,
  Play,
  Activity,
  Zap
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Stats'
  },
  {
    id: 'upload',
    name: 'Upload Content',
    icon: Upload,
    description: 'Add Videos'
  },
  {
    id: 'queue',
    name: 'Review Queue',
    icon: List,
    description: 'Generated Clips',
    badge: '3'
  },
  {
    id: 'automation',
    name: 'Automation',
    icon: Zap,
    description: 'Auto-Posting'
  },
  {
    id: 'activity',
    name: 'Activity',
    icon: Activity,
    description: 'Processing Logs'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Configuration'
  }
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card/30 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto py-6">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-auto p-3 text-left',
                    isActive && 'bg-primary/10 text-primary border-primary/20'
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{item.name}</p>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              )
            })}
          </nav>
        </div>
        
        <div className="border-t border-border p-4">
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Play className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Processing</span>
            </div>
            <div className="text-xs text-muted-foreground">
              2 videos in queue
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}