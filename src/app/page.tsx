'use client';

import { useState } from 'react';
import { FileDown, Loader2, BookOpen, AlertCircle, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import JSZip from 'jszip';

interface TutorialFile {
  filename: string;
  content: string;
  tutorial: {
    title: string;
    difficulty: string;
    estimatedCost: number;
    summary: string;
  };
}

interface GenerateResponse {
  success: boolean;
  stats: {
    pagesCrawled: number;
    tutorialsGenerated: number;
    totalEstimatedCost: number;
    totalTime?: number;
  };
  files: TutorialFile[];
  csv: string;
}

interface ProgressState {
  step: string;
  message: string;
  progress: number;
  eta?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url) {
      setError('Please enter a documentation URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setProgressState({ step: 'starting', message: 'Initializing...', progress: 0 });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, maxPages }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tutorials');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setProgressState({
                  step: data.step,
                  message: data.message,
                  progress: data.progress,
                  eta: data.eta
                });
              } else if (data.type === 'complete') {
                setProgressState({
                  step: 'complete',
                  message: data.message,
                  progress: 100
                });
                setResult(data.data);
                setLoading(false);
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error('Error parsing progress:', e);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      setProgressState(null);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exampleUrls = [
    { name: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html' },
    { name: 'Next.js Docs', url: 'https://nextjs.org/docs' },
    { name: 'React Tutorial', url: 'https://react.dev/learn' },
    { name: 'Python Docs', url: 'https://docs.python.org/3/tutorial/' },
  ];

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    if (!result) return;

    const zip = new JSZip();

    // Add all markdown files
    result.files.forEach((file) => {
      zip.file(file.filename, file.content);
    });

    // Add CSV index
    zip.file('tutorial-index.csv', result.csv);

    // Add README
    const readme = `# Tutorial Scaffolds

Generated from: ${url}

## Statistics
- Pages Crawled: ${result.stats.pagesCrawled}
- Tutorials Generated: ${result.stats.tutorialsGenerated}
- Total Estimated Cost: $${result.stats.totalEstimatedCost}
${result.stats.totalTime ? `- Generation Time: ${Math.floor(result.stats.totalTime / 60)}m ${result.stats.totalTime % 60}s` : ''}

## Files
${result.files.map((f, i) => `${i + 1}. ${f.filename} - ${f.tutorial.title}`).join('\n')}

## Next Steps
1. Review the tutorial-index.csv for an overview
2. Select tutorials to develop
3. Expand each scaffold into a complete tutorial
4. Test all code examples
5. Add screenshots and diagrams
6. Publish and promote your tutorials!
`;

    zip.file('README.md', readme);

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'tutorial-scaffolds.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'crawling':
        return '🔍';
      case 'analyzing':
        return '🤖';
      case 'generating':
        return '📝';
      case 'complete':
        return '✅';
      default:
        return '⚙️';
    }
  };

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'crawling':
        return 'Crawling Documentation';
      case 'analyzing':
        return 'AI Analysis in Progress';
      case 'generating':
        return 'Generating Scaffolds';
      case 'complete':
        return 'Complete!';
      default:
        return 'Starting...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lightest via-white to-brand-light">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-brand-dark" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-brand-darkest via-brand-dark to-brand bg-clip-text text-transparent">
            Tutorial Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform documentation into actionable tutorial scaffolds using AI.
            Generate structured outlines, cost estimates, and ready-to-expand content.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
              Documentation URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the main documentation URL to start crawling
            </p>

            {/* Example URLs */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Try these examples:</p>
              <div className="grid grid-cols-2 gap-2">
                {exampleUrls.map((example) => (
                  <button
                    key={example.url}
                    onClick={() => {
                      setUrl(example.url);
                      copyToClipboard(example.url);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-400 text-sm rounded-lg transition group"
                    disabled={loading}
                  >
                    <span className="text-xs font-medium truncate">{example.name}</span>
                    {copiedUrl === example.url ? (
                      <Check className="w-3 h-3 ml-2 flex-shrink-0 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="maxPages" className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Pages to Crawl
            </label>
            <input
              id="maxPages"
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
              min="10"
              max="100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              More pages = more comprehensive analysis (10-100 pages)
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-300 to-primary-200 text-white font-semibold py-4 px-6 rounded-lg hover:from-primary-400 hover:to-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Tutorials...
              </span>
            ) : (
              'Generate Tutorial Scaffolds'
            )}
          </button>
        </div>

        {/* Progress Section */}
        {loading && progressState && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getStepIcon(progressState.step)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {getStepTitle(progressState.step)}
                    </h3>
                    <p className="text-sm text-gray-600">{progressState.message}</p>
                  </div>
                </div>
                {progressState.eta && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{progressState.eta}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-dark to-brand transition-all duration-500 ease-out"
                  style={{ width: `${progressState.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
              </div>

              {/* Progress Percentage */}
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{progressState.progress}%</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {['crawling', 'analyzing', 'generating', 'complete'].map((step, index) => {
                const isActive = progressState.step === step;
                const isComplete = ['crawling', 'analyzing', 'generating', 'complete'].indexOf(progressState.step) > index;

                return (
                  <div
                    key={step}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-brand-lightest border-2 border-brand'
                        : isComplete
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="mb-2">
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : isActive ? (
                        <Loader2 className="w-6 h-6 text-brand-dark animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center capitalize">
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Generation Complete! 🎉</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-brand-lightest rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pages Crawled</p>
                  <p className="text-3xl font-bold text-brand-dark">
                    {result.stats.pagesCrawled}
                  </p>
                </div>
                <div className="bg-brand-light rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Tutorials Generated</p>
                  <p className="text-3xl font-bold text-brand-darkest">
                    {result.stats.tutorialsGenerated}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.stats.totalEstimatedCost}
                  </p>
                </div>
              </div>

              <button
                onClick={downloadAllAsZip}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <FileDown className="w-5 h-5 mr-2" />
                  Download All as ZIP
                </span>
              </button>
            </div>

            {/* Tutorial List */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Generated Tutorial Scaffolds</h3>
              <div className="space-y-4">
                {result.files.map((file, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-100 rounded-lg p-6 hover:border-brand transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {file.tutorial.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {file.tutorial.summary}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-brand-lightest text-brand-darkest rounded-full font-medium">
                            {file.tutorial.difficulty}
                          </span>
                          <span className="text-green-600 font-semibold">
                            ${file.tutorial.estimatedCost}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file.filename, file.content)}
                        className="ml-4 p-2 text-brand-dark hover:bg-brand-lightest rounded-lg transition"
                        title="Download Markdown"
                      >
                        <FileDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm border-t border-gray-200 pt-8">
          <p className="mb-2">
            Built by{' '}
            <a
              href="https://adamtomas.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-300 hover:text-primary-200 transition underline decoration-primary-100"
            >
              adamtomas.fun
            </a>
            {' '}at{' '}
            <a
              href="https://ns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-300 hover:text-primary-200 transition underline decoration-primary-100"
            >
              ns.com
            </a>
          </p>
          <p className="text-gray-500">
            Powered by Claude AI • Next.js • Vercel
          </p>
        </div>
      </div>
    </div>
  );
}
