# Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy this Next.js application.

### Option 1: One-Click Deploy

1. Click the "Deploy with Vercel" button in README.md
2. Sign in to Vercel (or create an account)
3. Connect your GitHub account
4. The repository will be cloned automatically
5. Add your `ANTHROPIC_API_KEY` environment variable
6. Click "Deploy"

### Option 2: Manual Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variable in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `your_api_key_here`

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Option 3: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variable: `ANTHROPIC_API_KEY`
7. Click "Deploy"

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key from console.anthropic.com

## Post-Deployment

1. **Test the deployment**:
   - Visit your deployed URL
   - Try generating tutorials from a documentation site
   - Download the results

2. **Update README.md**:
   - Add your live demo URL
   - Update the GitHub repository URL

3. **Monitor usage**:
   - Check Vercel dashboard for function logs
   - Monitor Anthropic API usage in their console

## Troubleshooting

### Build Fails
- Check all imports are correct
- Verify environment variables are set
- Review Vercel build logs

### Function Timeout
- Default timeout is 10s (Hobby plan)
- Upgrade to Pro for 300s timeout
- Or reduce maxPages limit in the code

### API Key Issues
- Ensure key is copied correctly (no extra spaces)
- Verify key is active in Anthropic console
- Check key has sufficient credits

## Alternative Deployment Options

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

For most users, **Vercel is recommended** as it's optimized for Next.js and provides the best developer experience.
