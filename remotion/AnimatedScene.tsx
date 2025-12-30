import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useVideoConfig } from 'remotion';
import { Scene } from '@/types/project';
import { VideoRenderer } from '@/lib/video-renderer';

interface AnimatedSceneProps {
  scene: Scene;
  assetUrl: string;
  startFrame: number;
  durationFrames: number;
  currentFrame: number;
  resolution: { width: number; height: number };
}

export const AnimatedScene: React.FC<AnimatedSceneProps> = ({
  scene,
  assetUrl,
  startFrame,
  durationFrames,
  currentFrame,
  resolution,
}) => {
  const { fps } = useVideoConfig();
  const relativeFrame = currentFrame - startFrame;
  const progress = Math.min(1, Math.max(0, relativeFrame / durationFrames));

  // Calculate animation transforms
  const { startTransform, endTransform } = VideoRenderer.calculateAnimationKeyframes(scene, resolution);

  // Interpolate transform values
  const scale = interpolate(
    progress,
    [0, 1],
    [startTransform.scale, endTransform.scale],
    { extrapolateRight: 'clamp' }
  );

  const translateX = interpolate(
    progress,
    [0, 1],
    [startTransform.x, endTransform.x],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    progress,
    [0, 1],
    [startTransform.y, endTransform.y],
    { extrapolateRight: 'clamp' }
  );

  // Apply filters
  const filters = scene.filters || { brightness: 0, contrast: 0, saturation: 0 };
  const brightness = 100 + filters.brightness * 100;
  const contrast = 100 + filters.contrast * 100;
  const saturation = 100 + filters.saturation * 100;

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Img
        src={assetUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          filter: filterStyle,
        }}
      />
    </AbsoluteFill>
  );
};
