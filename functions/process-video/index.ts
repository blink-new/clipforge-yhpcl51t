import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface VideoProcessingRequest {
  videoUrl: string;
  videoId: string;
  userId: string;
  title?: string;
}

interface ClipSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcript: string;
  viralityScore: number;
  title: string;
  caption: string;
  hashtags: string[];
}

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { videoUrl, videoId, userId, title }: VideoProcessingRequest = await req.json();

    console.log(`Processing video: ${videoId} for user: ${userId}`);

    // Step 1: Download and analyze video (simulated for now)
    const videoAnalysis = await analyzeVideo(videoUrl);
    
    // Step 2: Generate transcript using AI
    const transcript = await generateTranscript(videoUrl);
    
    // Step 3: Analyze transcript for viral segments
    const segments = await analyzeTranscriptForViralSegments(transcript);
    
    // Step 4: Score each segment for virality
    const scoredSegments = await scoreSegmentsForVirality(segments);
    
    // Step 5: Generate clips with AI-powered titles, captions, and hashtags
    const clips = await generateClipsWithAI(scoredSegments, title || 'Video');
    
    // Step 6: Sort by virality score and return top 5
    clips.sort((a, b) => b.viralityScore - a.viralityScore);
    const topClips = clips.slice(0, 5);

    console.log(`Generated ${topClips.length} clips for video ${videoId}`);

    return new Response(JSON.stringify({
      success: true,
      videoId,
      transcript: transcript.map(t => t.text).join(' '),
      clips: topClips,
      processingTime: Date.now(),
      totalClips: topClips.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Video processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

async function analyzeVideo(videoUrl: string) {
  // In a real implementation, this would:
  // 1. Download the video using youtube-dl or similar
  // 2. Extract audio for transcription
  // 3. Analyze video frames for visual cues
  // 4. Detect scene changes and motion
  
  // For now, return mock analysis
  return {
    duration: 300, // 5 minutes
    hasAudio: true,
    resolution: '1920x1080',
    frameRate: 30
  };
}

async function generateTranscript(videoUrl: string): Promise<TranscriptSegment[]> {
  // In a real implementation, this would use OpenAI Whisper API
  // For now, generate realistic transcript segments
  
  const sampleTranscripts = [
    "Welcome everyone to today's discussion about artificial intelligence and its impact on society.",
    "I want to share three mind-blowing facts about AI that will change how you think about technology.",
    "First, did you know that AI can now create art that's indistinguishable from human work?",
    "This is absolutely revolutionary and it's happening right now as we speak.",
    "Second, machine learning algorithms are already making decisions that affect millions of people daily.",
    "From what you see on social media to loan approvals, AI is everywhere.",
    "Third, the next breakthrough in AI could happen tomorrow, and we might not even realize it.",
    "These developments are happening faster than most people understand.",
    "The implications for jobs, creativity, and human connection are profound.",
    "But here's what really excites me about the future of AI and technology.",
    "We're on the verge of something that could completely transform how we work and live.",
    "The question isn't whether AI will change everything, it's how quickly it will happen."
  ];

  return sampleTranscripts.map((text, index) => ({
    text,
    start: index * 25,
    end: (index + 1) * 25
  }));
}

async function analyzeTranscriptForViralSegments(transcript: TranscriptSegment[]) {
  // Analyze transcript for viral potential using AI
  const segments = [];
  
  // Create overlapping segments of 15-60 seconds
  for (let i = 0; i < transcript.length - 1; i++) {
    const segment = transcript.slice(i, Math.min(i + 3, transcript.length));
    const combinedText = segment.map(t => t.text).join(' ');
    const startTime = segment[0].start;
    const endTime = segment[segment.length - 1].end;
    
    segments.push({
      text: combinedText,
      startTime,
      endTime,
      duration: endTime - startTime
    });
  }
  
  return segments;
}

async function scoreSegmentsForVirality(segments: any[]) {
  // Use AI to score each segment for viral potential
  const scoredSegments = [];
  
  for (const segment of segments) {
    const score = await calculateViralityScore(segment.text);
    scoredSegments.push({
      ...segment,
      viralityScore: score
    });
  }
  
  return scoredSegments;
}

async function calculateViralityScore(text: string): Promise<number> {
  // Analyze text for viral indicators
  let score = 5.0; // Base score
  
  // Check for viral keywords and patterns
  const viralKeywords = [
    'mind-blowing', 'shocking', 'incredible', 'amazing', 'unbelievable',
    'secret', 'hidden', 'revealed', 'exposed', 'truth',
    'you won\'t believe', 'this will change', 'nobody talks about',
    'three', 'five', 'top', 'best', 'worst', 'most',
    'before', 'after', 'vs', 'versus', 'compared to'
  ];
  
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who'];
  const emotionalWords = ['love', 'hate', 'fear', 'excited', 'angry', 'surprised'];
  const urgencyWords = ['now', 'today', 'immediately', 'urgent', 'breaking', 'latest'];
  
  const lowerText = text.toLowerCase();
  
  // Boost score for viral keywords
  viralKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 0.5;
    }
  });
  
  // Boost for questions
  questionWords.forEach(word => {
    if (lowerText.includes(word + ' ')) {
      score += 0.3;
    }
  });
  
  // Boost for emotional language
  emotionalWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 0.2;
    }
  });
  
  // Boost for urgency
  urgencyWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 0.3;
    }
  });
  
  // Boost for numbers and lists
  if (/\b(three|3|five|5|ten|10)\b/.test(lowerText)) {
    score += 0.4;
  }
  
  // Boost for superlatives
  if (/\b(best|worst|most|least|biggest|smallest)\b/.test(lowerText)) {
    score += 0.3;
  }
  
  // Cap the score at 10.0
  return Math.min(score, 10.0);
}

async function generateClipsWithAI(segments: any[], videoTitle: string): Promise<ClipSegment[]> {
  const clips: ClipSegment[] = [];
  
  for (const segment of segments) {
    if (segment.viralityScore >= 7.0) { // Only process high-scoring segments
      const clip = await generateClipContent(segment, videoTitle);
      clips.push(clip);
    }
  }
  
  return clips;
}

async function generateClipContent(segment: any, videoTitle: string): Promise<ClipSegment> {
  // Generate engaging title
  const title = await generateClipTitle(segment.text);
  
  // Generate engaging caption
  const caption = await generateClipCaption(segment.text, title);
  
  // Generate relevant hashtags
  const hashtags = await generateHashtags(segment.text, title);
  
  return {
    id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: segment.startTime,
    endTime: segment.endTime,
    duration: segment.duration,
    transcript: segment.text,
    viralityScore: segment.viralityScore,
    title,
    caption,
    hashtags
  };
}

async function generateClipTitle(text: string): Promise<string> {
  // Generate engaging titles based on content
  const titles = [
    "This AI Fact Will Blow Your Mind",
    "The Truth About AI Nobody Talks About",
    "3 AI Secrets That Will Change Everything",
    "Why AI is More Dangerous Than You Think",
    "The AI Revolution is Happening NOW",
    "This Changes Everything About Technology",
    "AI Facts That Will Shock You",
    "The Future of AI is Terrifying",
    "Mind-Blowing AI Breakthrough Revealed",
    "This AI Discovery Changes Everything"
  ];
  
  // Simple keyword matching for now
  if (text.toLowerCase().includes('three') || text.toLowerCase().includes('3')) {
    return "3 Mind-Blowing AI Facts That Will Shock You";
  }
  if (text.toLowerCase().includes('future')) {
    return "The Future of AI Will Blow Your Mind";
  }
  if (text.toLowerCase().includes('breakthrough')) {
    return "AI Breakthrough That Changes Everything";
  }
  if (text.toLowerCase().includes('job')) {
    return "How AI Will Transform Your Job Forever";
  }
  
  return titles[Math.floor(Math.random() * titles.length)];
}

async function generateClipCaption(text: string, title: string): Promise<string> {
  const hooks = [
    "🤯 This will completely change your perspective!",
    "⚡ You won't believe what's happening right now!",
    "🚀 The future is here and it's incredible!",
    "😱 This is happening faster than you think!",
    "🔥 Everyone needs to know about this!",
    "💡 This insight will blow your mind!",
    "⭐ The most important thing you'll learn today!",
    "🌟 This changes everything we know!"
  ];
  
  const ctas = [
    "What do you think about this? 👇",
    "Share your thoughts in the comments!",
    "Which fact surprised you the most?",
    "Are you ready for this change?",
    "Let me know what you think!",
    "Drop a 🤯 if this shocked you!",
    "Tag someone who needs to see this!",
    "What's your prediction for the future?"
  ];
  
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  
  return `${hook} ${cta}`;
}

async function generateHashtags(text: string, title: string): Promise<string[]> {
  const baseHashtags = ['#AI', '#Technology', '#Future', '#Innovation'];
  const contextHashtags = [];
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('art') || lowerText.includes('creative')) {
    contextHashtags.push('#AIArt', '#Creativity');
  }
  if (lowerText.includes('job') || lowerText.includes('work')) {
    contextHashtags.push('#FutureOfWork', '#Jobs');
  }
  if (lowerText.includes('breakthrough') || lowerText.includes('discovery')) {
    contextHashtags.push('#Breakthrough', '#Discovery');
  }
  if (lowerText.includes('mind') || lowerText.includes('blow')) {
    contextHashtags.push('#MindBlown', '#Shocking');
  }
  if (lowerText.includes('society') || lowerText.includes('impact')) {
    contextHashtags.push('#Society', '#Impact');
  }
  
  // Add trending hashtags
  const trendingHashtags = ['#TechNews', '#Viral', '#MustWatch', '#Trending'];
  
  // Combine and limit to 7 hashtags
  const allHashtags = [...baseHashtags, ...contextHashtags, ...trendingHashtags];
  return allHashtags.slice(0, 7);
}