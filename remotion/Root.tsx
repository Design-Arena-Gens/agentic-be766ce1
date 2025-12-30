import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition, VideoCompositionProps } from './VideoComposition';
import { VideoProject } from '@/types/project';

export const RemotionRoot: React.FC = () => {
  const defaultProject: VideoProject = {
    projectName: 'Sample Project',
    format: '16:9',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    scenes: [],
    preset: 'cinematic',
    exportFormat: 'mp4',
    quality: 'high',
  };

  return (
    <>
      <Composition
        id="VideoProduction"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          project: defaultProject,
          assetUrls: {},
        }}
        calculateMetadata={({ props }) => {
          const typedProps = props as unknown as VideoCompositionProps;
          const totalDuration = typedProps.project.scenes.reduce(
            (acc: number, scene: any) => acc + (scene.duration || 3),
            0
          );
          return {
            durationInFrames: Math.ceil(totalDuration * typedProps.project.fps),
            fps: typedProps.project.fps,
            width: typedProps.project.resolution?.width || 1920,
            height: typedProps.project.resolution?.height || 1080,
          };
        }}
      />
    </>
  );
};
