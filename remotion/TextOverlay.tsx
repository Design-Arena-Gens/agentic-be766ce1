import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { TextOverlay } from '@/types/project';

interface TextOverlayComponentProps {
  overlay: TextOverlay;
  sceneStartFrame: number;
  sceneDurationFrames: number;
  currentFrame: number;
  resolution: { width: number; height: number };
}

export const TextOverlayComponent: React.FC<TextOverlayComponentProps> = ({
  overlay,
  sceneStartFrame,
  sceneDurationFrames,
  currentFrame,
  resolution,
}) => {
  const relativeFrame = currentFrame - sceneStartFrame;

  // Calculate overlay timing
  const overlayStartFrame = overlay.startTime ? overlay.startTime * 30 : 0;
  const overlayDurationFrames = overlay.duration ? overlay.duration * 30 : sceneDurationFrames;
  const overlayEndFrame = overlayStartFrame + overlayDurationFrames;

  // Check if overlay should be visible
  if (relativeFrame < overlayStartFrame || relativeFrame >= overlayEndFrame) {
    return null;
  }

  const overlayProgress = (relativeFrame - overlayStartFrame) / overlayDurationFrames;

  // Animation
  let opacity = 1;
  let translateY = 0;

  if (overlay.animation === 'fade-in') {
    opacity = interpolate(overlayProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });
  } else if (overlay.animation === 'slide-in') {
    opacity = interpolate(overlayProgress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });
    translateY = interpolate(overlayProgress, [0, 0.3], [50, 0], { extrapolateRight: 'clamp' });
  }

  // Position mapping
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: '5%', left: '5%', alignItems: 'flex-start', justifyContent: 'flex-start' },
    'top-center': { top: '5%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' },
    'top-right': { top: '5%', right: '5%', alignItems: 'flex-end', justifyContent: 'flex-end' },
    'middle-left': { top: '50%', left: '5%', transform: 'translateY(-50%)', alignItems: 'flex-start' },
    'middle-center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
    'middle-right': { top: '50%', right: '5%', transform: 'translateY(-50%)', alignItems: 'flex-end' },
    'bottom-left': { bottom: '10%', left: '5%', alignItems: 'flex-start', justifyContent: 'flex-end' },
    'bottom-center': { bottom: '10%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' },
    'bottom-right': { bottom: '10%', right: '5%', alignItems: 'flex-end', justifyContent: 'flex-end' },
  };

  const positionStyle = positionStyles[overlay.position] || positionStyles['bottom-center'];

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          ...positionStyle,
          opacity,
          transform: `${positionStyle.transform || ''} translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: overlay.fontFamily,
            fontSize: overlay.fontSize,
            color: overlay.color,
            backgroundColor: overlay.backgroundColor,
            padding: overlay.backgroundColor ? '10px 20px' : '0',
            borderRadius: overlay.backgroundColor ? '8px' : '0',
            fontWeight: 'bold',
            textShadow: overlay.backgroundColor ? 'none' : '2px 2px 4px rgba(0,0,0,0.8)',
            maxWidth: '90%',
            lineHeight: 1.4,
          }}
        >
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
