# DEPLOYMENT_GUIDE.md

## DevPulse - Deployment to Vercel

This guide provides step-by-step instructions to deploy your DevPulse dashboard to Vercel.

## Prerequisites

- GitHub account with your DevPulse repository
- Vercel account (free tier available at https://vercel.com)
- GitHub Personal Access Token or OAuth App configured

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "feat: Initial DevPulse dashboard setup"
git remote add origin https://github.com/YOUR_USERNAME/devpulse.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com and sign in/sign up
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for your `devpulse` repository and click "Import"
5. Configure project settings:
   - **Project Name:** devpulse (or your preferred name)
   - **Framework:** Vite
   - **Build Command:** npm run build (should be auto-detected)
   - **Output Directory:** dist (should be auto-detected)

### Step 3: Add Environment Variables

1. In the Vercel dashboard, go to "Settings" → "Environment Variables"
2. Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_GITHUB_CLIENT_ID` | Your GitHub App Client ID | Get from GitHub OAuth App settings |
| `VITE_GITHUB_REDIRECT_URI` | `https://your-vercel-domain.vercel.app` | Replace with your actual Vercel domain |

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your dashboard is live! Visit the provided URL

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
cd d:\Code\ Projects\DevPulse
vercel
```

Follow the interactive prompts:
- Link to existing project or create new
- Confirm project settings
- Add environment variables when prompted

### Step 3: Set Environment Variables

```bash
vercel env add VITE_GITHUB_CLIENT_ID
vercel env add VITE_GITHUB_REDIRECT_URI
```

Then redeploy:
```bash
vercel --prod
```

## Setting Up GitHub OAuth App (for Production)

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name:** DevPulse
   - **Homepage URL:** `https://your-vercel-domain.vercel.app`
   - **Authorization callback URL:** `https://your-vercel-domain.vercel.app`
4. Copy the **Client ID** and **Client Secret**
5. Add `Client ID` to Vercel environment variables as `VITE_GITHUB_CLIENT_ID`

## Post-Deployment Verification

1. **Visit your deployed site**
   ```
   https://your-vercel-domain.vercel.app
   ```

2. **Test GitHub authentication**
   - Click "Sign in with GitHub"
   - You should be redirected to GitHub
   - After approval, you should see your dashboard

3. **Verify API calls**
   - Check your browser console (F12) for any errors
   - Ensure GitHub metrics are loading

## Troubleshooting

### Blank Page or 404 Error
- Clear cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Check Vercel deployment logs: Dashboard → Deployments → View logs

### Authentication Fails
- Verify `VITE_GITHUB_CLIENT_ID` is correct
- Check `VITE_GITHUB_REDIRECT_URI` matches your Vercel domain exactly
- Ensure GitHub OAuth App is configured correctly

### Dashboard Shows "Loading..." Forever
- Check browser console (F12) for JavaScript errors
- Verify GitHub token/OAuth configuration
- Check GitHub API rate limits (5000 per hour)

### Environment Variables Not Loading
- Redeploy after adding variables: `vercel --prod`
- Verify variables are set in Vercel dashboard
- Wait a few minutes for changes to propagate

## Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration steps
4. Update `VITE_GITHUB_REDIRECT_URI` with your custom domain

## Monitoring & Logs

### View Deployment Logs
```bash
vercel logs <URL>
```

### View Runtime Logs
1. Vercel Dashboard → Deployments → click on deployment → "Logs"

## Updating Your Deployment

### Push Updates to GitHub
```bash
git add .
git commit -m "feat: Update dashboard with new features"
git push origin main
```

Vercel will automatically redeploy on every push to `main`!

### Manual Redeploy
```bash
vercel --prod
```

## Environment-Specific Configuration

### Development
- Use Personal Access Token in `.env.local`
- Test locally: `npm run dev`

### Production (Vercel)
- Use GitHub OAuth App
- Set in Vercel environment variables
- Auto-deploys on git push

## Rollback to Previous Deployment

1. Go to Vercel Dashboard → Deployments
2. Click on a previous deployment
3. Click "Promote to Production"

## Performance Tips

1. Vercel caches your build automatically
2. Enable Vercel Analytics in dashboard
3. Monitor bundle size in Vercel Analytics

## Next Steps

1. Share your dashboard URL with team members
2. Add custom domain if desired
3. Configure GitHub notifications
4. Monitor GitHub API usage

---

**🎉 Your DevPulse dashboard is now live on Vercel!**

For more help:
- Vercel Docs: https://vercel.com/docs
- GitHub API: https://docs.github.com/en/rest
- React Docs: https://react.dev
