import React from 'react';
import { AbsoluteFill, Img, interpolate } from 'remotion';
import { TransitionType } from '@/types/project';

interface TransitionProps {
  type: TransitionType;
  duration: number;
  currentSceneAsset: string;
  nextSceneAsset: string;
  transitionStartFrame: number;
  currentFrame: number;
  fps: number;
}

export const Transition: React.FC<TransitionProps> = ({
  type,
  duration,
  currentSceneAsset,
  nextSceneAsset,
  transitionStartFrame,
  currentFrame,
  fps,
}) => {
  const transitionDurationFrames = Math.floor(duration * fps);
  const relativeFrame = currentFrame - transitionStartFrame;

  // Only render during transition period
  if (relativeFrame < 0 || relativeFrame >= transitionDurationFrames) {
    return null;
  }

  const progress = relativeFrame / transitionDurationFrames;

  switch (type) {
    case 'fade':
      return (
        <AbsoluteFill style={{ backgroundColor: '#000000' }}>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: interpolate(progress, [0, 1], [1, 0]),
            }}
          />
        </AbsoluteFill>
      );

    case 'crossfade':
      return (
        <AbsoluteFill>
          <Img
            src={nextSceneAsset}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: interpolate(progress, [0, 1], [0, 1]),
            }}
          />
        </AbsoluteFill>
      );

    case 'wipe-left':
      return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <Img
            src={nextSceneAsset}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
            }}
          />
        </AbsoluteFill>
      );

    case 'wipe-right':
      return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <Img
            src={nextSceneAsset}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              clipPath: `inset(0 0 0 ${100 - progress * 100}%)`,
            }}
          />
        </AbsoluteFill>
      );

    case 'slide-left':
      return (
        <AbsoluteFill>
          <Img
            src={nextSceneAsset}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translateX(${(1 - progress) * 100}%)`,
            }}
          />
        </AbsoluteFill>
      );

    case 'slide-right':
      return (
        <AbsoluteFill>
          <Img
            src={nextSceneAsset}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translateX(-${(1 - progress) * 100}%)`,
            }}
          />
        </AbsoluteFill>
      );

    default:
      return null;
  }
};
