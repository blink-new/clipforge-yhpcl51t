import blink from '@/blink/client';
import { videoService, type Clip } from './videoService';

export interface AutomationSettings {
  enabled: boolean;
  postingInterval: number; // minutes
  platforms: string[];
  minViralityScore: number;
  maxPostsPerDay: number;
  postingHours: {
    start: string;
    end: string;
  };
  autoApprove: boolean;
}

export interface PostingJob {
  id: string;
  clipId: string;
  platforms: string[];
  scheduledTime: string;
  status: 'pending' | 'posted' | 'failed';
  attempts: number;
  errorMessage?: string;
  createdAt: string;
}

class AutomationService {
  private settings: AutomationSettings = {
    enabled: false,
    postingInterval: 60,
    platforms: [],
    minViralityScore: 8.0,
    maxPostsPerDay: 10,
    postingHours: {
      start: '09:00',
      end: '21:00'
    },
    autoApprove: false
  };

  private postingJobs: PostingJob[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private postsToday = 0;
  private lastPostDate = '';

  constructor() {
    this.loadSettings();
    this.startAutomation();
  }

  // Settings Management
  getSettings(): AutomationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AutomationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.settings.enabled) {
      this.startAutomation();
    } else {
      this.stopAutomation();
    }
  }

  private loadSettings() {
    const saved = localStorage.getItem('clipforge-automation-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  private saveSettings() {
    localStorage.setItem('clipforge-automation-settings', JSON.stringify(this.settings));
  }

  // Automation Control
  startAutomation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (!this.settings.enabled) return;

    // Check every minute for posting opportunities
    this.intervalId = setInterval(() => {
      this.checkForPostingOpportunity();
    }, 60000); // 1 minute

    console.log('Automation started');
  }

  stopAutomation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Automation stopped');
  }

  private async checkForPostingOpportunity() {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toDateString();

    // Reset daily counter if it's a new day
    if (this.lastPostDate !== currentDate) {
      this.postsToday = 0;
      this.lastPostDate = currentDate;
    }

    // Check if we're within posting hours
    if (currentTime < this.settings.postingHours.start || currentTime > this.settings.postingHours.end) {
      return;
    }

    // Check if we've reached daily limit
    if (this.postsToday >= this.settings.maxPostsPerDay) {
      return;
    }

    // Check if enough time has passed since last post
    const lastJob = this.postingJobs
      .filter(job => job.status === 'posted')
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())[0];

    if (lastJob) {
      const timeSinceLastPost = now.getTime() - new Date(lastJob.scheduledTime).getTime();
      const intervalMs = this.settings.postingInterval * 60 * 1000;
      
      if (timeSinceLastPost < intervalMs) {
        return;
      }
    }

    // Find a clip to post
    await this.findAndPostClip();
  }

  private async findAndPostClip() {
    try {
      const clips = await videoService.getAllUserClips();
      
      // Filter clips that meet criteria
      const eligibleClips = clips.filter(clip => 
        clip.status === 'generated' &&
        clip.viralityScore >= this.settings.minViralityScore &&
        !this.postingJobs.some(job => job.clipId === clip.id && job.status === 'posted')
      );

      if (eligibleClips.length === 0) {
        console.log('No eligible clips found for posting');
        return;
      }

      // Sort by virality score and pick the best one
      eligibleClips.sort((a, b) => b.viralityScore - a.viralityScore);
      const clipToPost = eligibleClips[0];

      // Create posting job
      const job: PostingJob = {
        id: `job_${Date.now()}`,
        clipId: clipToPost.id,
        platforms: [...this.settings.platforms],
        scheduledTime: new Date().toISOString(),
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString()
      };

      this.postingJobs.push(job);
      
      // Execute the posting
      await this.executePostingJob(job, clipToPost);

    } catch (error) {
      console.error('Error in automated posting:', error);
    }
  }

  // Manual Posting
  async postClipNow(clipId: string, platforms: string[]): Promise<boolean> {
    try {
      const clips = await videoService.getAllUserClips();
      const clip = clips.find(c => c.id === clipId);
      
      if (!clip) {
        throw new Error('Clip not found');
      }

      const job: PostingJob = {
        id: `manual_${Date.now()}`,
        clipId,
        platforms,
        scheduledTime: new Date().toISOString(),
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString()
      };

      this.postingJobs.push(job);
      return await this.executePostingJob(job, clip);

    } catch (error) {
      console.error('Manual posting error:', error);
      return false;
    }
  }

  private async executePostingJob(job: PostingJob, clip: Clip): Promise<boolean> {
    try {
      job.attempts++;
      
      // Simulate posting to each platform
      const results = await Promise.all(
        job.platforms.map(platform => this.postToPlatform(clip, platform))
      );

      const allSuccessful = results.every(result => result);

      if (allSuccessful) {
        job.status = 'posted';
        this.postsToday++;
        
        // Update clip status in video service
        // This would normally update the database
        console.log(`Successfully posted clip "${clip.title}" to ${job.platforms.join(', ')}`);
        
        return true;
      } else {
        throw new Error('Some platforms failed to post');
      }

    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`Posting job ${job.id} failed:`, error);
      return false;
    }
  }

  private async postToPlatform(clip: Clip, platform: string): Promise<boolean> {
    // Simulate API calls to social media platforms
    // In a real implementation, this would use platform-specific APIs
    
    console.log(`Posting to ${platform}:`, {
      title: clip.title,
      caption: clip.caption,
      hashtags: clip.hashtags,
      duration: clip.duration,
      viralityScore: clip.viralityScore
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  // Analytics and Status
  getStats() {
    const today = new Date().toDateString();
    const todayJobs = this.postingJobs.filter(job => 
      new Date(job.scheduledTime).toDateString() === today
    );

    const successfulPosts = todayJobs.filter(job => job.status === 'posted').length;
    const failedPosts = todayJobs.filter(job => job.status === 'failed').length;
    const totalAttempts = todayJobs.length;

    const successRate = totalAttempts > 0 ? (successfulPosts / totalAttempts) * 100 : 0;

    return {
      postsToday: successfulPosts,
      failedToday: failedPosts,
      successRate: Math.round(successRate),
      queueSize: this.getQueueSize(),
      nextPostTime: this.getNextPostTime(),
      isActive: this.settings.enabled && this.intervalId !== null
    };
  }

  private async getQueueSize(): Promise<number> {
    try {
      const clips = await videoService.getAllUserClips();
      return clips.filter(clip => 
        clip.status === 'generated' &&
        clip.viralityScore >= this.settings.minViralityScore &&
        !this.postingJobs.some(job => job.clipId === clip.id && job.status === 'posted')
      ).length;
    } catch {
      return 0;
    }
  }

  private getNextPostTime(): string {
    if (!this.settings.enabled) return 'Paused';
    
    const now = new Date();
    const nextPost = new Date(now.getTime() + this.settings.postingInterval * 60 * 1000);
    
    return nextPost.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getRecentJobs(limit = 10): PostingJob[] {
    return this.postingJobs
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
      .slice(0, limit);
  }

  // Platform Management
  async testPlatformConnection(platform: string): Promise<boolean> {
    // Simulate testing platform API connection
    console.log(`Testing connection to ${platform}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 90% success rate for testing
    return Math.random() > 0.1;
  }
}

export const automationService = new AutomationService();