import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { SceneParser } from '@/lib/scene-parser';
import { AssetManager } from '@/lib/asset-manager';

export const maxDuration = 300; // 5 minutes timeout for video generation
export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(request: NextRequest) {
  const projectId = uuidv4();
  const logs: string[] = [];

  try {
    logs.push('Parsing request...');

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const projectJsonStr = formData.get('project') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!projectJsonStr) {
      return NextResponse.json({ error: 'No project configuration provided' }, { status: 400 });
    }

    logs.push(`Received ${files.length} files`);

    // Parse and validate project
    let project;
    try {
      const projectJson = JSON.parse(projectJsonStr);
      project = SceneParser.parse(projectJson);
      logs.push('Project configuration parsed successfully');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid project JSON', details: String(error) },
        { status: 400 }
      );
    }

    // Create asset manager
    const fileBuffers = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        buffer: Buffer.from(await file.arrayBuffer()),
      }))
    );

    const assetManager = await AssetManager.createFromFiles(projectId, fileBuffers);
    logs.push('Assets processed');

    // Validate assets
    const assetValidation = SceneParser.validateAssets(project, assetManager.getAssetPaths());
    if (!assetValidation.valid) {
      logs.push('Asset validation failed');
      return NextResponse.json(
        {
          error: 'Asset validation failed',
          missing: assetValidation.missing,
          warnings: assetValidation.warnings,
        },
        { status: 400 }
      );
    }

    if (assetValidation.warnings.length > 0) {
      logs.push('Warnings: ' + assetValidation.warnings.join(', '));
    }

    // Quality check
    const qc = SceneParser.qualityCheck(project);
    if (!qc.passed) {
      return NextResponse.json(
        { error: 'Quality check failed', errors: qc.errors, warnings: qc.warnings },
        { status: 400 }
      );
    }

    logs.push('Quality checks passed');

    // For now, return a mock response since Remotion rendering requires server-side setup
    // In production, this would render the actual video
    logs.push('Video generation complete (mock)');

    // Return success response with project info
    return NextResponse.json({
      success: true,
      message: 'Video project validated successfully. Full rendering requires server-side setup.',
      project: {
        projectName: project.projectName,
        format: project.format,
        resolution: project.resolution,
        sceneCount: project.scenes.length,
        totalDuration: SceneParser.calculateTotalDuration(project),
      },
      logs,
      note: 'This is a demo version. Full video rendering with Remotion requires additional server configuration.',
    });
  } catch (error) {
    logs.push(`Error: ${error}`);
    console.error('Video generation error:', error);

    return NextResponse.json(
      {
        error: 'Video generation failed',
        details: String(error),
        logs,
      },
      { status: 500 }
    );
  }
}
