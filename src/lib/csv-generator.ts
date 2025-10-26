import { TutorialIdea } from './analyzer';

export class CSVGenerator {
  generate(tutorials: TutorialIdea[]): string {
    const headers = [
      'Number',
      'Title',
      'Difficulty',
      'Estimated Time',
      'Estimated Cost',
      'Summary',
      'Prerequisites',
      'Filename',
    ];

    const rows = tutorials.map((tutorial, index) => [
      (index + 1).toString(),
      this.escapeCSV(tutorial.title),
      tutorial.difficulty,
      tutorial.estimatedTime,
      `${tutorial.estimatedCost}`,
      this.escapeCSV(tutorial.summary),
      this.escapeCSV(tutorial.prerequisites.join('; ')),
      this.generateFilename(tutorial.title, index),
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ];

    return csvLines.join('\n');
  }

  private escapeCSV(value: string): string {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (/[,"\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private generateFilename(title: string, index: number): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `tutorial-${index + 1}-${slug}.md`;
  }
}
