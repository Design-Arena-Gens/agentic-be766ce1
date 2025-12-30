import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoProject, Scene } from '@/types/project';
import { AnimatedScene } from './AnimatedScene';
import { TextOverlayComponent } from './TextOverlay';
import { Transition } from './Transition';

export interface VideoCompositionProps {
  project: VideoProject;
  assetUrls: Record<string, string>;
}

export const VideoComposition: React.FC<Record<string, unknown>> = (props) => {
  const { project, assetUrls } = props as unknown as VideoCompositionProps;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate timeline positions
  let currentTime = 0;
  const sceneTimings: Array<{
    scene: Scene;
    startFrame: number;
    endFrame: number;
    durationFrames: number;
  }> = [];

  project.scenes.forEach((scene) => {
    const startFrame = Math.floor(currentTime * fps);
    const durationFrames = Math.floor(scene.duration * fps);
    const endFrame = startFrame + durationFrames;

    sceneTimings.push({
      scene,
      startFrame,
      endFrame,
      durationFrames,
    });

    currentTime += scene.duration;
  });

  // Find current scene
  const currentSceneIndex = sceneTimings.findIndex(
    (timing) => frame >= timing.startFrame && frame < timing.endFrame
  );

  const currentScene = currentSceneIndex >= 0 ? sceneTimings[currentSceneIndex] : null;
  const nextScene = currentSceneIndex >= 0 && currentSceneIndex < sceneTimings.length - 1
    ? sceneTimings[currentSceneIndex + 1]
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {currentScene && (
        <>
          {/* Current scene */}
          <AnimatedScene
            scene={currentScene.scene}
            assetUrl={assetUrls[currentScene.scene.assetPath]}
            startFrame={currentScene.startFrame}
            durationFrames={currentScene.durationFrames}
            currentFrame={frame}
            resolution={project.resolution!}
          />

          {/* Text overlays */}
          {currentScene.scene.textOverlays?.map((overlay, index) => (
            <TextOverlayComponent
              key={index}
              overlay={overlay}
              sceneStartFrame={currentScene.startFrame}
              sceneDurationFrames={currentScene.durationFrames}
              currentFrame={frame}
              resolution={project.resolution!}
            />
          ))}

          {/* Transition to next scene */}
          {nextScene && currentScene.scene.transition !== 'cut' && (
            <Transition
              type={currentScene.scene.transition!}
              duration={currentScene.scene.transitionDuration || 0.5}
              currentSceneAsset={assetUrls[currentScene.scene.assetPath]}
              nextSceneAsset={assetUrls[nextScene.scene.assetPath]}
              transitionStartFrame={currentScene.endFrame - Math.floor((currentScene.scene.transitionDuration || 0.5) * fps)}
              currentFrame={frame}
              fps={fps}
            />
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
