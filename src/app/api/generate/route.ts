import { NextRequest, NextResponse } from 'next/server';
import { DocumentationCrawler } from '@/lib/crawler';
import { TutorialAnalyzer } from '@/lib/analyzer';
import { MarkdownGenerator } from '@/lib/markdown-generator';
import { CSVGenerator } from '@/lib/csv-generator';

export const maxDuration = 300; // 5 minutes for Vercel Pro
export const dynamic = 'force-dynamic';

interface GenerateRequest {
  url: string;
  maxPages?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { url, maxPages = 30 } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Crawl documentation
    console.log(`Starting crawl of ${url}...`);
    const crawler = new DocumentationCrawler(url, maxPages);
    const pages = await crawler.crawl();

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages could be crawled from the provided URL' },
        { status: 400 }
      );
    }

    console.log(`Crawled ${pages.length} pages`);

    // Step 2: Analyze and generate tutorial ideas
    console.log('Analyzing documentation and generating ideas...');
    const analyzer = new TutorialAnalyzer(apiKey);
    const tutorials = await analyzer.analyzePagesAndGenerateIdeas(pages);

    if (tutorials.length === 0) {
      return NextResponse.json(
        { error: 'No tutorial ideas could be generated' },
        { status: 400 }
      );
    }

    console.log(`Generated ${tutorials.length} tutorial ideas`);

    // Step 3: Generate markdown scaffolds
    const markdownGenerator = new MarkdownGenerator();
    const csvGenerator = new CSVGenerator();

    const files = tutorials.map((tutorial, index) => ({
      filename: markdownGenerator.generateFilename(tutorial.title, index),
      content: markdownGenerator.generateScaffold(tutorial),
      tutorial,
    }));

    // Generate CSV index
    const csvContent = csvGenerator.generate(tutorials);

    return NextResponse.json({
      success: true,
      stats: {
        pagesCrawled: pages.length,
        tutorialsGenerated: tutorials.length,
        totalEstimatedCost: tutorials.reduce((sum, t) => sum + t.estimatedCost, 0),
      },
      files,
      csv: csvContent,
    });
  } catch (error) {
    console.error('Error generating tutorials:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate tutorials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
