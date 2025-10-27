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

interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  step: string;
  message: string;
  progress: number;
  eta?: string;
  data?: any;
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

    // Create a readable stream for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (update: ProgressUpdate) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
        };

        try {
          const startTime = Date.now();

          // Step 1: Crawl documentation
          sendProgress({
            type: 'progress',
            step: 'crawling',
            message: `Starting to crawl ${url}...`,
            progress: 10,
            eta: 'Estimating time...'
          });

          console.log(`Starting crawl of ${url}...`);
          const crawler = new DocumentationCrawler(url, maxPages);

          // Estimate: ~100ms per page for crawling
          const crawlETA = Math.ceil((maxPages * 0.1) / 60 * 10) / 10; // in minutes

          sendProgress({
            type: 'progress',
            step: 'crawling',
            message: `Crawling up to ${maxPages} pages...`,
            progress: 15,
            eta: `~${crawlETA} minute${crawlETA !== 1 ? 's' : ''} for crawling`
          });

          const pages = await crawler.crawl();

          if (pages.length === 0) {
            sendProgress({
              type: 'error',
              step: 'crawling',
              message: 'No pages could be crawled from the provided URL',
              progress: 0
            });
            controller.close();
            return;
          }

          console.log(`Crawled ${pages.length} pages`);
          sendProgress({
            type: 'progress',
            step: 'crawling',
            message: `Successfully crawled ${pages.length} pages!`,
            progress: 30,
            eta: 'Moving to AI analysis...'
          });

          // Step 2: Analyze and generate tutorial ideas
          const batches = Math.ceil(pages.length / 10);
          const analysisTime = batches * 4; // ~4 seconds per batch
          const totalETA = Math.ceil(analysisTime / 60 * 10) / 10;

          sendProgress({
            type: 'progress',
            step: 'analyzing',
            message: `Analyzing documentation with AI (${batches} batch${batches !== 1 ? 'es' : ''})...`,
            progress: 35,
            eta: `~${totalETA} minute${totalETA !== 1 ? 's' : ''} for AI analysis`
          });

          console.log('Analyzing documentation and generating ideas...');
          const analyzer = new TutorialAnalyzer(apiKey);

          // Custom analyzer with progress updates
          const tutorials = [];
          const batchSize = 10;

          for (let i = 0; i < pages.length; i += batchSize) {
            const batchNum = Math.floor(i / batchSize) + 1;
            const progressPercent = 35 + Math.floor((i / pages.length) * 45);
            const remainingBatches = batches - batchNum + 1;
            const remainingTime = Math.ceil((remainingBatches * 4) / 60 * 10) / 10;

            sendProgress({
              type: 'progress',
              step: 'analyzing',
              message: `Analyzing batch ${batchNum} of ${batches}...`,
              progress: progressPercent,
              eta: remainingTime > 0 ? `~${remainingTime} minute${remainingTime !== 1 ? 's' : ''} remaining` : 'Almost done...'
            });

            const batch = pages.slice(i, i + batchSize);
            const batchResults = await analyzer.analyzePagesAndGenerateIdeas(batch);
            tutorials.push(...batchResults);

            if (i + batchSize < pages.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (tutorials.length === 0) {
            sendProgress({
              type: 'error',
              step: 'analyzing',
              message: 'No tutorial ideas could be generated',
              progress: 0
            });
            controller.close();
            return;
          }

          console.log(`Generated ${tutorials.length} tutorial ideas`);
          sendProgress({
            type: 'progress',
            step: 'analyzing',
            message: `Generated ${tutorials.length} tutorial idea${tutorials.length !== 1 ? 's' : ''}!`,
            progress: 80,
            eta: 'Creating scaffolds...'
          });

          // Step 3: Generate markdown scaffolds
          sendProgress({
            type: 'progress',
            step: 'generating',
            message: 'Creating tutorial scaffolds...',
            progress: 85,
            eta: 'Almost done...'
          });

          const markdownGenerator = new MarkdownGenerator();
          const csvGenerator = new CSVGenerator();

          const files = tutorials.map((tutorial, index) => ({
            filename: markdownGenerator.generateFilename(tutorial.title, index),
            content: markdownGenerator.generateScaffold(tutorial),
            tutorial,
          }));

          sendProgress({
            type: 'progress',
            step: 'generating',
            message: 'Generating CSV index...',
            progress: 95,
            eta: 'Finalizing...'
          });

          // Generate CSV index
          const csvContent = csvGenerator.generate(tutorials);

          const totalTime = Math.ceil((Date.now() - startTime) / 1000);
          const minutes = Math.floor(totalTime / 60);
          const seconds = totalTime % 60;
          const timeString = minutes > 0
            ? `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
            : `${seconds} second${seconds !== 1 ? 's' : ''}`;

          // Send complete
          sendProgress({
            type: 'complete',
            step: 'complete',
            message: `Complete! Generated ${tutorials.length} tutorials in ${timeString}`,
            progress: 100,
            data: {
              success: true,
              stats: {
                pagesCrawled: pages.length,
                tutorialsGenerated: tutorials.length,
                totalEstimatedCost: tutorials.reduce((sum, t) => sum + t.estimatedCost, 0),
                totalTime: totalTime
              },
              files,
              csv: csvContent,
            }
          });

          controller.close();
        } catch (error) {
          console.error('Error generating tutorials:', error);
          sendProgress({
            type: 'error',
            step: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            progress: 0
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
