import blink from '@/blink/client';

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  youtubeUrl?: string;
  duration?: number;
  fileSize?: number;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Clip {
  id: string;
  videoId: string;
  userId: string;
  title: string;
  caption: string;
  hashtags: string[];
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  clipUrl?: string;
  thumbnailUrl?: string;
  status: 'generated' | 'posted' | 'failed';
  postedPlatforms: string[];
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  videoId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  errorMessage?: string;
  transcript?: string;
  segments?: any[];
  createdAt: string;
  updatedAt: string;
}

class VideoService {
  private videos: Video[] = [];
  private clips: Clip[] = [];
  private processingJobs: ProcessingJob[] = [];

  // Video management
  async uploadVideo(file: File, title?: string, description?: string): Promise<Video> {
    const user = await blink.auth.me();
    
    // Upload file to storage
    const { publicUrl } = await blink.storage.upload(
      file,
      `videos/${user.id}/${Date.now()}-${file.name}`,
      { upsert: true }
    );

    const video: Video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: title || file.name,
      description,
      fileUrl: publicUrl,
      fileSize: file.size,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.videos.push(video);
    return video;
  }

  async addYouTubeVideo(url: string, title?: string, description?: string): Promise<Video> {
    const user = await blink.auth.me();

    const video: Video = {
      id: `video_${Date.now()}`,
      userId: user.id,
      title: title || 'YouTube Video',
      description,
      youtubeUrl: url,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.videos.push(video);
    return video;
  }

  async processVideo(videoId: string, onProgress?: (step: string, progress: number) => void): Promise<Clip[]> {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) throw new Error('Video not found');

    const user = await blink.auth.me();

    // Create processing job
    const job: ProcessingJob = {
      id: `job_${Date.now()}`,
      videoId,
      userId: user.id,
      status: 'processing',
      currentStep: 'Starting...',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.processingJobs.push(job);
    video.status = 'processing';

    try {
      // Simulate processing steps with progress updates
      const steps = [
        { name: 'Downloading video...', duration: 2000 },
        { name: 'Transcribing with Whisper...', duration: 3000 },
        { name: 'Analyzing content...', duration: 2000 },
        { name: 'Scoring virality...', duration: 1500 },
        { name: 'Generating clips...', duration: 2500 },
        { name: 'Creating subtitles...', duration: 2000 },
        { name: 'Finalizing...', duration: 1000 }
      ];

      let currentProgress = 0;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        job.currentStep = step.name;
        job.progress = Math.round((i / steps.length) * 100);
        
        if (onProgress) {
          onProgress(step.name, job.progress);
        }

        await new Promise(resolve => setTimeout(resolve, step.duration));
        currentProgress = job.progress;
      }

      // Call the edge function for actual processing
      const response = await fetch('https://yhpcl51t--process-video.functions.blink.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: video.fileUrl || video.youtubeUrl,
          videoId: video.id,
          userId: user.id,
          title: video.title
        })
      });

      const result = await response.json();

      if (result.success) {
        // Convert the clips from the processing result
        const generatedClips: Clip[] = result.clips.map((clip: any) => ({
          id: clip.id,
          videoId: video.id,
          userId: user.id,
          title: clip.title,
          caption: clip.caption,
          hashtags: clip.hashtags,
          startTime: clip.startTime,
          endTime: clip.endTime,
          duration: clip.duration,
          viralityScore: clip.viralityScore,
          status: 'generated' as const,
          postedPlatforms: [],
          createdAt: new Date().toISOString()
        }));

        this.clips.push(...generatedClips);
        
        job.status = 'completed';
        job.progress = 100;
        job.currentStep = 'Processing complete!';
        job.transcript = result.transcript;
        video.status = 'completed';

        if (onProgress) {
          onProgress('Processing complete!', 100);
        }

        return generatedClips;
      } else {
        throw new Error(result.error || 'Processing failed');
      }

    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      video.status = 'failed';
      throw error;
    }
  }

  // Data retrieval methods
  async getUserVideos(): Promise<Video[]> {
    const user = await blink.auth.me();
    return this.videos.filter(v => v.userId === user.id);
  }

  async getVideoClips(videoId: string): Promise<Clip[]> {
    const user = await blink.auth.me();
    return this.clips.filter(c => c.videoId === videoId && c.userId === user.id);
  }

  async getAllUserClips(): Promise<Clip[]> {
    const user = await blink.auth.me();
    return this.clips.filter(c => c.userId === user.id);
  }

  async getProcessingJob(videoId: string): Promise<ProcessingJob | undefined> {
    const user = await blink.auth.me();
    return this.processingJobs.find(j => j.videoId === videoId && j.userId === user.id);
  }

  async getRecentActivity(): Promise<any[]> {
    const user = await blink.auth.me();
    const userVideos = this.videos.filter(v => v.userId === user.id);
    const userClips = this.clips.filter(c => c.userId === user.id);
    const userJobs = this.processingJobs.filter(j => j.userId === user.id);

    const activities = [
      ...userVideos.map(v => ({
        id: v.id,
        type: 'video',
        title: `Video "${v.title}" uploaded`,
        description: `Status: ${v.status}`,
        time: this.getRelativeTime(v.createdAt),
        status: v.status
      })),
      ...userClips.map(c => ({
        id: c.id,
        type: 'clip',
        title: `Clip "${c.title}" generated`,
        description: `Virality score: ${c.viralityScore}`,
        time: this.getRelativeTime(c.createdAt),
        status: 'completed'
      })),
      ...userJobs.filter(j => j.status === 'processing').map(j => ({
        id: j.id,
        type: 'processing',
        title: j.currentStep,
        description: `Progress: ${j.progress}%`,
        time: this.getRelativeTime(j.updatedAt),
        status: j.status
      }))
    ];

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  // Statistics
  async getStats() {
    const user = await blink.auth.me();
    const userVideos = this.videos.filter(v => v.userId === user.id);
    const userClips = this.clips.filter(c => c.userId === user.id);
    
    const avgViralityScore = userClips.length > 0 
      ? userClips.reduce((sum, clip) => sum + clip.viralityScore, 0) / userClips.length 
      : 0;

    const postsPublished = userClips.reduce((sum, clip) => sum + clip.postedPlatforms.length, 0);

    return {
      totalVideos: userVideos.length,
      totalClips: userClips.length,
      avgViralityScore: Math.round(avgViralityScore * 10) / 10,
      postsPublished
    };
  }
}

export const videoService = new VideoService();