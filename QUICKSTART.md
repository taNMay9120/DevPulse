# QUICKSTART.md

# DevPulse - Quick Start Guide

Get your developer dashboard up and running in minutes!

## 1️⃣ Local Development (5 minutes)

### Start the Dev Server

```bash
# Navigate to project
cd d:\Code\ Projects\DevPulse

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Authenticate

Choose one of two methods:

**Method A: GitHub Personal Access Token (Easiest for Dev)**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` and `read:user`
4. Copy the token
5. Paste into DevPulse login form

**Method B: GitHub OAuth (for Production)**
1. Create GitHub OAuth App at https://github.com/settings/developers
2. Set redirect URI to `http://localhost:5173`
3. Copy Client ID to `.env.local`

## 2️⃣ Deploy to Vercel (5 minutes)

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial DevPulse setup"
git remote add origin https://github.com/YOUR_USERNAME/devpulse.git
git branch -M main
git push -u origin main
```

### Deploy

1. Visit https://vercel.com
2. Click "Add New Project"
3. Select your GitHub repository
4. Add environment variables:
   - `VITE_GITHUB_CLIENT_ID`: [Your GitHub App Client ID]
   - `VITE_GITHUB_REDIRECT_URI`: `https://your-vercel-domain.vercel.app`
5. Click "Deploy"

✅ **Done!** Your dashboard is live.

## 3️⃣ Using Your Dashboard

### Dashboard Overview

Your dashboard shows:

| Card | Shows |
|------|-------|
| **Commits This Week** | How productive you've been |
| **Pull Requests** | Open and merged PRs |
| **Most Active Repo** | Your most starred repository |
| **Top Languages** | Languages you code in most |
| **Recent Repositories** | Your top repositories |

### Tips

- **Refresh Data**: Logout and login again
- **API Limits**: GitHub allows 5000 API calls/hour
- **Dark Mode**: Default - perfect for late night coding sessions

## 4️⃣ Next Steps

1. **Share Your Dashboard**
   - Send your Vercel URL to teammates
   - (They'll need their own GitHub credentials)

2. **Customize (Optional)**
   - Edit colors in `src/App.css`
   - Modify card layout in `src/components/Dashboard.tsx`
   - Add new metrics

3. **Add GitHub Notifications**
   - Link your GitHub notifications to the dashboard

## Common Issues

### "Loading..." never completes
- Check browser console (F12)
- Verify GitHub token is valid
- Check API rate limits

### Authorization fails
- Verify redirect URI matches your deployment URL
- Check GitHub OAuth App settings
- For token method: ensure `repo` scope is selected

### No data appears
- Logout and login again
- Check GitHub API rate limits
- Wait a moment and refresh

## Environment Variables

### Development (.env.local)
```
VITE_GITHUB_CLIENT_ID=ghp_xxxxxxxxxxxx  # Your token or OAuth ID
VITE_GITHUB_REDIRECT_URI=http://localhost:5173
```

### Production (Vercel Dashboard)
```
VITE_GITHUB_CLIENT_ID=your_oauth_app_client_id
VITE_GITHUB_REDIRECT_URI=https://your-domain.vercel.app
```

## Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Check code quality

# Deployment
vercel                # Deploy via CLI
vercel --prod         # Redeploy to production
```

## File Structure

```
src/
├── App.tsx                    # Main app component
├── App.css                    # Styling
├── components/
│   ├── GitHubLogin.tsx       # Login screen
│   └── Dashboard.tsx         # Main dashboard
├── services/
│   └── github.ts             # GitHub API calls
└── store/
    └── authStore.ts          # Authentication state
```

## API Reference

### GitHub Data Fetched

- **User Info**: Name, avatar, login, public repos
- **Repositories**: Name, stars, language, description
- **Commits**: Count this week/month
- **Pull Requests**: Open/merged/closed counts
- **Languages**: Top languages from your repos

### Rate Limits

- Authenticated: 5000 requests/hour
- Dashboard uses ~4 calls per load
- Auto-refreshes on login

## Need Help?

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review [GitHub API Docs](https://docs.github.com/en/rest)
3. Check [React Docs](https://react.dev)
4. Look at console errors: F12 → Console

## What's Next?

### Phase 2 Features (Coming Soon)
- AI-powered weekly insights
- Language-specific deep dives
- Contribution trends
- Team collaboration metrics
- Export reports

### Phase 3 Features
- Custom dashboards
- Team analytics
- Integration with CI/CD
- Slack notifications

---

**Happy coding! 🚀**

Your DevPulse dashboard is ready to track your GitHub activity in real-time.
