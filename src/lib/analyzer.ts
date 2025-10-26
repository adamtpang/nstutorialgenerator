import Anthropic from '@anthropic-ai/sdk';
import { CrawledPage } from './crawler';

export interface TutorialIdea {
  title: string;
  summary: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  estimatedCost: number;
  prerequisites: string[];
  learningObjectives: string[];
  outline: TutorialSection[];
  resources: string[];
}

export interface TutorialSection {
  title: string;
  description: string;
  topics: string[];
}

export class TutorialAnalyzer {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzePagesAndGenerateIdeas(pages: CrawledPage[]): Promise<TutorialIdea[]> {
    const allIdeas: TutorialIdea[] = [];
    const batchSize = 10;

    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize);
      const ideas = await this.analyzeBatch(batch);
      allIdeas.push(...ideas);

      // Small delay between batches
      await this.delay(1000);
    }

    return allIdeas;
  }

  private async analyzeBatch(pages: CrawledPage[]): Promise<TutorialIdea[]> {
    const prompt = this.buildAnalysisPrompt(pages);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      return this.parseResponse(responseText);
    } catch (error) {
      console.error('Error analyzing batch:', error);
      return [];
    }
  }

  private buildAnalysisPrompt(pages: CrawledPage[]): string {
    const pagesContext = pages.map((page, idx) => `
Page ${idx + 1}:
URL: ${page.url}
Title: ${page.title}
Headings: ${page.headings.join(', ')}
Content preview: ${page.content.substring(0, 500)}...
`).join('\n---\n');

    return `You are an expert technical writer and tutorial creator. Analyze the following documentation pages and identify 3-5 tutorial opportunities that would be valuable for developers.

${pagesContext}

For each tutorial idea, provide:
1. A clear, actionable title (e.g., "Building a REST API with Express.js")
2. A 2-3 sentence summary
3. Difficulty level (Beginner, Intermediate, or Advanced)
4. Estimated time to complete (e.g., "2 hours", "4 hours")
5. 3-5 prerequisites
6. 3-5 learning objectives
7. An outline with 5-8 main sections, each with:
   - Section title
   - Brief description
   - 2-4 key topics to cover
8. 2-3 relevant documentation URLs from the pages provided

Focus on practical, hands-on tutorials that teach specific skills. Avoid overly broad topics.

Return your response as a JSON array of tutorial ideas following this exact structure:

\`\`\`json
[
  {
    "title": "Tutorial Title",
    "summary": "Brief summary...",
    "difficulty": "Beginner|Intermediate|Advanced",
    "estimatedTime": "X hours",
    "prerequisites": ["prereq1", "prereq2"],
    "learningObjectives": ["objective1", "objective2"],
    "outline": [
      {
        "title": "Section 1",
        "description": "What this section covers",
        "topics": ["topic1", "topic2"]
      }
    ],
    "resources": ["url1", "url2"]
  }
]
\`\`\`

Only return the JSON array, no other text.`;
  }

  private parseResponse(responseText: string): TutorialIdea[] {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        return [];
      }

      const ideas = JSON.parse(jsonMatch[0]);

      // Add estimated costs
      return ideas.map((idea: any) => ({
        ...idea,
        estimatedCost: this.calculateCost(idea),
      }));
    } catch (error) {
      console.error('Error parsing response:', error);
      return [];
    }
  }

  private calculateCost(idea: any): number {
    // Base cost
    let cost = 200;

    // Adjust for difficulty
    const difficultyMultiplier = {
      'Beginner': 1.0,
      'Intermediate': 1.3,
      'Advanced': 1.6,
    };
    cost *= difficultyMultiplier[idea.difficulty as keyof typeof difficultyMultiplier] || 1.0;

    // Adjust for outline complexity
    const sectionCount = idea.outline?.length || 5;
    cost += (sectionCount - 5) * 20;

    // Adjust for prerequisites (more prerequisites = more setup required)
    cost += (idea.prerequisites?.length || 0) * 20;

    // Round to nearest $50
    return Math.round(cost / 50) * 50;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
