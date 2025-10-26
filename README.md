# Tutorial Generator 🚀

> Transform documentation into actionable tutorial content in minutes using AI

An intelligent web application that scans documentation sites and automatically generates structured tutorial scaffolds complete with outlines, cost estimates, and quality checklists. Turn any docs site into a pipeline of high-value tutorial tasks.

## 🌐 Live Demo

**Coming Soon!** Deploy to Vercel and add your URL here.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tutorial-generator)

## 🎯 What It Does

This tool helps convert documentation into actionable tutorial tasks by:
- **Crawling documentation websites** - Automatically discovers and scrapes all pages
- **Identifying tutorial opportunities** - Uses Claude AI to find teachable topics
- **Generating structured scaffolds** - Creates Markdown files with complete outlines
- **Estimating creation costs** - Provides realistic budget estimates ($100-$500)
- **Bulk export** - Download all scaffolds as `.md` files plus a CSV index

## ✨ Features

- **Smart Documentation Crawling** - Automatically discovers and scrapes all pages under a documentation domain
- **AI-Powered Analysis** - Uses Claude Sonnet 4.5 to identify tutorial opportunities and generate outlines
- **Structured Scaffolds** - Creates Markdown files with titles, summaries, and section outlines
- **Cost Estimation** - Provides realistic budget estimates for tutorial creation
- **Beautiful UI** - Simple, intuitive web interface with real-time feedback
- **Multiple Download Options** - Individual `.md` files or complete ZIP package with CSV index

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude Sonnet 4.5
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Web Scraping**: Cheerio + Custom Crawler

## 📦 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/tutorial-generator.git
cd tutorial-generator
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tutorial-generator)

### Manual Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your `ANTHROPIC_API_KEY` environment variable in Vercel settings
4. Deploy!

## 📖 How to Use

1. **Enter Documentation URL** - Paste any documentation site URL (e.g., `https://docs.example.com`)
2. **Configure Settings** - Choose how many pages to crawl (5-100)
3. **Generate Tutorials** - Click the button and wait 2-5 minutes
4. **Download Results** - Get individual `.md` files or complete ZIP package

## 📁 Output Structure

### Markdown Scaffolds
Each generated file includes:
- **Title** - Clear, actionable tutorial name
- **Summary** - Brief overview of what the tutorial covers
- **Difficulty** - Beginner, Intermediate, or Advanced
- **Estimated Time** - Expected completion time
- **Prerequisites** - Required knowledge/tools
- **Learning Objectives** - Key takeaways
- **Outline** - Detailed section structure with TODO placeholders
- **Resources** - Links to relevant documentation

### CSV Index
Contains:
- Tutorial Number
- Title
- Difficulty Level
- Estimated Time
- Estimated Creation Cost
- Summary
- Prerequisites
- Filename

Perfect for sorting, filtering, and planning your tutorial creation roadmap.

## 💡 Use Cases

- **Documentation Teams** - Identify content gaps and create tutorial roadmaps
- **Developer Relations** - Scale tutorial creation with AI-assisted scaffolding
- **Open Source Projects** - Generate contributor-friendly tutorial tasks
- **Educational Platforms** - Build comprehensive learning paths efficiently
- **Technical Writers** - Get structured outlines for tutorial content

## 🎓 Example Output

Here's what a generated tutorial scaffold looks like:

```markdown
# Building Your First REST API with Express.js

> **Status:** Draft Scaffold
> **Difficulty:** Beginner
> **Estimated Time:** 2 hours
> **Estimated Creation Cost:** $250

## Overview
Learn how to build a production-ready REST API using Express.js...

## Prerequisites
- Basic JavaScript knowledge
- Node.js and npm installed
- Understanding of HTTP methods

## What You'll Learn
- Set up an Express.js project from scratch
- Create RESTful API endpoints
- Implement error handling and validation
...
```

## 📊 Performance

- **Speed** - Analyzes 30 pages in 2-4 minutes
- **Cost** - ~$0.06 per 30 pages (very economical)
- **Quality** - Professional tutorial scaffolds with 6-8 sections each
- **Scalability** - Handles up to 100 pages per request

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

**No tutorials generated?**
- Increase the page limit to 40-60
- Try a different documentation site
- Ensure the site isn't blocking crawlers

**Timeout errors?**
- Reduce page limit to 20-30
- Deploy to Vercel Pro for longer timeouts

**Poor quality results?**
- Target more technical documentation sections
- Increase page limit for better analysis

## 📄 Project Structure

```
tutorial-generator/
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts  # Main API endpoint
│   │   ├── page.tsx               # UI component
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Styles
│   └── lib/
│       ├── crawler.ts             # Web scraping
│       ├── analyzer.ts            # AI analysis
│       ├── markdown-generator.ts  # Scaffold creation
│       └── csv-generator.ts       # CSV creation
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built for the ns.com/earn challenge
- Powered by Anthropic's Claude AI
- Deployed on Vercel's platform

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check the troubleshooting section above
- Review the example outputs

---

**Built with ❤️ for the ns.com/earn challenge**

*Powered by Claude Sonnet 4.5 • Next.js • Vercel*
