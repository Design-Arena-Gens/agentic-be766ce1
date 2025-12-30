'use client';

import { useState, useRef } from 'react';
import { Upload, Play, Download, Settings, FileText, Video } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [projectJson, setProjectJson] = useState('');
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const loadExampleProject = () => {
    const example = {
      projectName: "Demo Video",
      format: "16:9",
      fps: 30,
      preset: "cinematic",
      quality: "high",
      exportFormat: "mp4",
      scenes: [
        {
          assetPath: "image1.jpg",
          duration: 4,
          animation: "ken-burns-in",
          transition: "fade",
          transitionDuration: 1,
          textOverlays: [
            {
              text: "Welcome to Video Production",
              position: "bottom-center",
              fontSize: 56,
              color: "#FFFFFF"
            }
          ]
        },
        {
          assetPath: "image2.jpg",
          duration: 3.5,
          animation: "zoom-in",
          transition: "crossfade",
          transitionDuration: 0.8,
          textOverlays: [
            {
              text: "Create Amazing Videos",
              position: "middle-center",
              fontSize: 64,
              color: "#FFFFFF"
            }
          ]
        },
        {
          assetPath: "image3.jpg",
          duration: 4,
          animation: "pan-right",
          transition: "slide-left",
          transitionDuration: 0.6
        }
      ]
    };
    setProjectJson(JSON.stringify(example, null, 2));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setStatus('Please upload images first');
      return;
    }
    if (!projectJson) {
      setStatus('Please provide project JSON');
      return;
    }

    setStatus('Generating video...');
    setLogs(['Starting video generation...']);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('project', projectJson);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      setStatus('Video generated successfully!');
      setVideoUrl(result.videoUrl);
      setLogs(prev => [...prev, 'Video generation complete!']);
    } catch (error) {
      setStatus('Error generating video');
      setLogs(prev => [...prev, `Error: ${error}`]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Video className="w-12 h-12" />
            Video Production Agent
          </h1>
          <p className="text-gray-300 text-lg">
            Transform images into professional videos with AI-powered automation
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Assets
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
            >
              Select Files
            </button>
            <div className="text-sm text-gray-300">
              {files.length > 0 ? (
                <div>
                  <p className="font-semibold mb-2">{files.length} files selected:</p>
                  <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                    {files.map((file, i) => (
                      <li key={i} className="truncate">{file.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-400">No files selected</p>
              )}
            </div>
          </div>

          {/* Project Config Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Project Configuration
            </h2>
            <button
              onClick={loadExampleProject}
              className="mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Load Example
            </button>
            <textarea
              value={projectJson}
              onChange={(e) => setProjectJson(e.target.value)}
              placeholder="Paste your project JSON here or click 'Load Example'"
              className="w-full h-96 bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={files.length === 0 || !projectJson}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            Generate Video
          </button>
          {status && (
            <p className="mt-4 text-lg font-semibold">{status}</p>
          )}
        </div>

        {/* Output Section */}
        {videoUrl && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Video className="w-6 h-6" />
              Generated Video
            </h2>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-4xl mx-auto rounded-lg mb-4"
            />
            <div className="text-center">
              <a
                href={videoUrl}
                download
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Video
              </a>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Processing Logs</h2>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="text-green-400">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">Animations</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ken Burns</li>
                <li>• Zoom In/Out</li>
                <li>• Pan (All directions)</li>
                <li>• Parallax</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-400">Transitions</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Fade</li>
                <li>• Crossfade</li>
                <li>• Wipe</li>
                <li>• Slide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-purple-400">Formats</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 16:9 (YouTube)</li>
                <li>• 9:16 (TikTok/Reels)</li>
                <li>• 1:1 (Instagram)</li>
                <li>• 4:5 (Instagram)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
