import { z } from 'zod';

// Animation types
export const AnimationTypeSchema = z.enum([
  'none',
  'ken-burns-in',
  'ken-burns-out',
  'zoom-in',
  'zoom-out',
  'pan-left',
  'pan-right',
  'pan-up',
  'pan-down',
  'parallax',
]);

export const TransitionTypeSchema = z.enum([
  'cut',
  'fade',
  'crossfade',
  'wipe-left',
  'wipe-right',
  'slide-left',
  'slide-right',
]);

export const TextPositionSchema = z.enum([
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]);

// Text overlay schema
export const TextOverlaySchema = z.object({
  text: z.string(),
  position: TextPositionSchema.default('bottom-center'),
  fontSize: z.number().min(12).max(200).default(48),
  fontFamily: z.string().default('Arial'),
  color: z.string().default('#FFFFFF'),
  backgroundColor: z.string().optional(),
  startTime: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  animation: z.enum(['fade-in', 'slide-in', 'none']).default('fade-in'),
});

// Scene schema
export const SceneSchema = z.object({
  id: z.string().uuid().optional(),
  assetPath: z.string(),
  assetType: z.enum(['image', 'video']).default('image'),
  duration: z.number().min(0.1).max(30).default(3),
  animation: AnimationTypeSchema.default('ken-burns-in'),
  animationIntensity: z.number().min(0).max(1).default(0.5),
  transition: TransitionTypeSchema.default('fade'),
  transitionDuration: z.number().min(0).max(2).default(0.5),
  textOverlays: z.array(TextOverlaySchema).optional(),
  crop: z.object({
    x: z.number().min(0).max(1).default(0),
    y: z.number().min(0).max(1).default(0),
    width: z.number().min(0).max(1).default(1),
    height: z.number().min(0).max(1).default(1),
  }).optional(),
  filters: z.object({
    brightness: z.number().min(-1).max(1).default(0),
    contrast: z.number().min(-1).max(1).default(0),
    saturation: z.number().min(-1).max(1).default(0),
  }).optional(),
});

// Video project schema
export const VideoProjectSchema = z.object({
  projectName: z.string().min(1).max(200),
  format: z.enum(['16:9', '9:16', '1:1', '4:5']).default('16:9'),
  resolution: z.object({
    width: z.number().min(640).max(7680),
    height: z.number().min(480).max(4320),
  }).optional(),
  fps: z.number().min(23.976).max(60).default(30),
  scenes: z.array(SceneSchema).min(1),
  audio: z.object({
    backgroundMusic: z.string().optional(),
    musicVolume: z.number().min(0).max(1).default(0.3),
    voiceover: z.string().optional(),
    voiceoverVolume: z.number().min(0).max(1).default(1.0),
    ttsText: z.string().optional(),
    ttsVoice: z.string().default('en-US-Standard-A'),
  }).optional(),
  preset: z.enum(['cinematic', 'corporate', 'social-fast', 'custom']).default('cinematic'),
  exportFormat: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('high'),
  subtitles: z.object({
    enabled: z.boolean().default(false),
    language: z.string().default('en'),
    format: z.enum(['srt', 'vtt']).default('srt'),
  }).optional(),
});

// Type exports
export type AnimationType = z.infer<typeof AnimationTypeSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
export type TextPosition = z.infer<typeof TextPositionSchema>;
export type TextOverlay = z.infer<typeof TextOverlaySchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type VideoProject = z.infer<typeof VideoProjectSchema>;

// Asset manifest
export interface AssetManifest {
  projectId: string;
  createdAt: string;
  assets: Array<{
    id: string;
    path: string;
    type: 'image' | 'video' | 'audio';
    originalName: string;
    size: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    usedInScenes: string[];
  }>;
}

// Processing status
export interface ProcessingStatus {
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  outputUrl?: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

// Preset configurations
export const PRESETS = {
  cinematic: {
    defaultAnimation: 'ken-burns-in' as AnimationType,
    defaultTransition: 'fade' as TransitionType,
    transitionDuration: 1.0,
    sceneDuration: 4.0,
    animationIntensity: 0.7,
    filters: { brightness: -0.05, contrast: 0.1, saturation: -0.1 },
  },
  corporate: {
    defaultAnimation: 'zoom-in' as AnimationType,
    defaultTransition: 'crossfade' as TransitionType,
    transitionDuration: 0.5,
    sceneDuration: 3.0,
    animationIntensity: 0.3,
    filters: { brightness: 0.05, contrast: 0.05, saturation: 0 },
  },
  'social-fast': {
    defaultAnimation: 'zoom-in' as AnimationType,
    defaultTransition: 'cut' as TransitionType,
    transitionDuration: 0.2,
    sceneDuration: 1.5,
    animationIntensity: 0.6,
    filters: { brightness: 0, contrast: 0.15, saturation: 0.1 },
  },
  custom: {
    defaultAnimation: 'none' as AnimationType,
    defaultTransition: 'fade' as TransitionType,
    transitionDuration: 0.5,
    sceneDuration: 3.0,
    animationIntensity: 0.5,
    filters: { brightness: 0, contrast: 0, saturation: 0 },
  },
};

// Resolution presets
export const RESOLUTION_PRESETS = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
};

// Quality settings
export const QUALITY_SETTINGS = {
  low: { bitrate: '2M', crf: 28 },
  medium: { bitrate: '5M', crf: 23 },
  high: { bitrate: '10M', crf: 18 },
  ultra: { bitrate: '20M', crf: 15 },
};
