import * as cheerio from 'cheerio';

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
  headings: string[];
}

export class DocumentationCrawler {
  private baseUrl: string;
  private visitedUrls: Set<string> = new Set();
  private maxPages: number;

  constructor(baseUrl: string, maxPages: number = 30) {
    this.baseUrl = this.normalizeUrl(baseUrl);
    this.maxPages = maxPages;
  }

  async crawl(): Promise<CrawledPage[]> {
    const pages: CrawledPage[] = [];
    const queue: string[] = [this.baseUrl];

    while (queue.length > 0 && pages.length < this.maxPages) {
      const url = queue.shift()!;

      if (this.visitedUrls.has(url)) {
        continue;
      }

      try {
        this.visitedUrls.add(url);
        const page = await this.fetchPage(url);

        if (page) {
          pages.push(page);
          const links = await this.extractLinks(url);
          queue.push(...links);
        }

        // Small delay to be respectful
        await this.delay(100);
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    return pages;
  }

  private async fetchPage(url: string): Promise<CrawledPage | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Tutorial-Generator-Bot/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and navigation elements
      $('script, style, nav, header, footer').remove();

      // Extract title
      const title = $('h1').first().text() || $('title').text() || 'Untitled';

      // Extract main content
      const mainContent = $('main, article, .content, .documentation').text() || $('body').text();
      const content = mainContent
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000); // Limit content length

      // Extract headings
      const headings: string[] = [];
      $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim();
        if (text) headings.push(text);
      });

      return {
        url,
        title: title.trim(),
        content,
        headings,
      };
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error);
      return null;
    }
  }

  private async extractLinks(currentUrl: string): Promise<string[]> {
    try {
      const response = await fetch(currentUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      const links: string[] = [];

      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = this.resolveUrl(currentUrl, href);
          if (this.isValidDocumentationUrl(absoluteUrl)) {
            links.push(absoluteUrl);
          }
        }
      });

      return [...new Set(links)]; // Remove duplicates
    } catch (error) {
      return [];
    }
  }

  private isValidDocumentationUrl(url: string): boolean {
    if (this.visitedUrls.has(url)) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.baseUrl);

      // Must be same domain or subdomain
      if (!urlObj.hostname.includes(baseUrlObj.hostname)) {
        return false;
      }

      // Exclude common non-documentation paths
      const excludePatterns = [
        /\.(pdf|zip|jpg|png|gif|css|js)$/i,
        /\/(api|login|signup|auth|admin)/i,
        /#/,
      ];

      return !excludePatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.href.replace(/\/$/, ''); // Remove trailing slash
    } catch {
      return url;
    }
  }

  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
