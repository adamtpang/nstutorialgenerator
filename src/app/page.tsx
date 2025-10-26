'use client';

import { useState } from 'react';
import { FileDown, Loader2, BookOpen, AlertCircle } from 'lucide-react';
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
  };
  files: TutorialFile[];
  csv: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const handleGenerate = async () => {
    if (!url) {
      setError('Please enter a documentation URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, maxPages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tutorials');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
- Total Estimated Cost: ${result.stats.totalEstimatedCost}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the main documentation URL to start crawling
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="maxPages" className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Pages to Crawl
            </label>
            <input
              id="maxPages"
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value) || 30)}
              min="5"
              max="100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              More pages = more comprehensive analysis (5-100 pages)
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
            disabled={loading || !url}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
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

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Generation Complete! 🎉</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pages Crawled</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.stats.pagesCrawled}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Tutorials Generated</p>
                  <p className="text-3xl font-bold text-purple-600">
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
                    className="border-2 border-gray-100 rounded-lg p-6 hover:border-blue-200 transition"
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
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {file.tutorial.difficulty}
                          </span>
                          <span className="text-green-600 font-semibold">
                            ${file.tutorial.estimatedCost}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file.filename, file.content)}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built for the ns.com/earn challenge</p>
          <p className="mt-2">
            Powered by Claude AI • Next.js • Vercel
          </p>
        </div>
      </div>
    </div>
  );
}
