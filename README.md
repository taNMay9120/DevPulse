# DevPulse - AI-Powered Dev Dashboard

A real-time developer productivity dashboard that aggregates your GitHub activity, visualizes code metrics, and uses an LLM to generate weekly insights and suggestions.

## Features

- **GitHub OAuth Login** - Sign in securely with your GitHub account
- **Real-time GitHub Metrics** - View commits, pull requests, and repository statistics  
- **Activity Dashboard** - Beautiful cards showing:
  - Commits this week
  - Pull requests (opened/merged)
  - Most active repository
  - Top programming languages
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI** - GitHub-inspired dark theme with smooth animations

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** Zustand
- **API Integration:** Octokit (GitHub REST API)
- **Styling:** Modern CSS with CSS Variables
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- GitHub Personal Access Token (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your GitHub credentials**
   - For development: Get a [Personal Access Token](https://github.com/settings/tokens)
     - Scopes needed: `repo`, `read:user`
   - For production: Set up GitHub OAuth app
     - Go to Settings > Developer settings > OAuth Apps
     - Create new OAuth App with redirect URI: `https://your-domain.com`

5. **Update `.env.local`**
   ```
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173  # For dev
   ```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Login** - Click "Sign in with GitHub" or enter your Personal Access Token
2. **View Dashboard** - See your GitHub activity metrics at a glance
3. **Explore Repositories** - Check out your top repositories and languages

## Deployment to Vercel

### Quick Start (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click "Add New Project"
3. Select your repository
4. Add environment variables:
   - `VITE_GITHUB_CLIENT_ID`
   - `VITE_GITHUB_REDIRECT_URI` (your Vercel domain)
5. Click "Deploy"

## API Rate Limits

GitHub has rate limits:
- Authenticated requests: 5,000 per hour
- Dashboard data refresh is optimized to minimize API calls

## Future Enhancements

- AI-powered weekly insights using Claude/GPT
- Custom commit insights
- Language-specific analytics
- Contribution trends
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
