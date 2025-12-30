import { NextRequest, NextResponse } from 'next/server';
import { SceneParser } from '@/lib/scene-parser';
import { AssetManager } from '@/lib/asset-manager';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const projectJsonStr = formData.get('project') as string;

    if (!projectJsonStr) {
      return NextResponse.json({ error: 'No project configuration provided' }, { status: 400 });
    }

    // Parse project
    let project;
    try {
      const projectJson = JSON.parse(projectJsonStr);
      project = SceneParser.parse(projectJson);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid project JSON', details: String(error) },
        { status: 400 }
      );
    }

    // If files provided, validate against them
    let assetValidation: { valid: boolean; missing: string[]; warnings: string[] } = {
      valid: true,
      missing: [],
      warnings: []
    };
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name);
      assetValidation = SceneParser.validateAssets(project, fileNames);
    }

    // Quality check
    const qc = SceneParser.qualityCheck(project);

    // Calculate timeline
    const timeline = SceneParser.generateTimeline(project);
    const totalDuration = SceneParser.calculateTotalDuration(project);

    return NextResponse.json({
      valid: assetValidation.valid && qc.passed,
      project: {
        projectName: project.projectName,
        format: project.format,
        resolution: project.resolution,
        fps: project.fps,
        sceneCount: project.scenes.length,
        totalDuration,
        preset: project.preset,
      },
      assetValidation,
      qualityCheck: qc,
      timeline: timeline.slice(0, 10), // First 10 scenes for preview
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', details: String(error) },
      { status: 500 }
    );
  }
}
