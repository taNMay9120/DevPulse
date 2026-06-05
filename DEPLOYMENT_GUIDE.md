# DevPulse - Full-Stack Deployment Guide

Since DevPulse is now a full-stack application utilizing Express and **Socket.io (WebSockets)**, the frontend and backend need to be deployed to platforms that support their respective runtime requirements. 

- **Frontend (Vite + React)**: Best deployed to **Vercel** (static hosting + CDN).
- **Backend (Express + WebSockets)**: Best deployed to **Render**, **Railway**, or **Fly.io** (which support persistent, stateful Node.js servers needed for WebSocket connections).

---

## 1️⃣ Deploying the Backend (Render / Railway)

Because Vercel Serverless Functions have execution timeouts and do not support persistent WebSockets, you must deploy the backend server to a Node.js hosting platform. 

### Option A: Render (Free Tier)
1. Sign in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Link your GitHub repository.
4. Set the configuration options:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add the following **Environment Variables**:
   - `PORT`: `10000` (Render will override this, but standard to set)
   - `JWT_SECRET`: A long random string (e.g., `your_jwt_secret_here`)
   - `MONGO_URI`: (Optional) Your live MongoDB Atlas connection string.
   - `GITHUB_CLIENT_ID`: (Optional) Your GitHub App Client ID.
   - `GITHUB_CLIENT_SECRET`: (Optional) Your GitHub App Client Secret.
   - `AI_API_KEY`: (Optional) Your OpenAI / Gemini API key if using Live Mode insights.
6. Click **Deploy Web Service**. Render will build and run the server, giving you a URL like `https://devpulse-backend.onrender.com`.

---

## 2️⃣ Deploying the Frontend to Vercel

Once your backend is live, you can deploy the React frontend.

### Step 1: Connect Repository to Vercel
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your `DevPulse` GitHub repository.

### Step 2: Configure Project settings
In the Vercel project configuration page, set the following:
- **Framework Preset**: `Vite`
- **Root Directory**: Click "Edit" and choose **`frontend`** (Crucial: do not deploy from the root!).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables
Add the following key-value pairs in Vercel under **Environment Variables**:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend.onrender.com` | Replace with your live Render/Railway URL. |
| `VITE_GITHUB_CLIENT_ID` | `your_github_oauth_client_id` | Match the client ID in your backend. |
| `VITE_GITHUB_REDIRECT_URI` | `https://your-app-domain.vercel.app` | Replace with your actual live Vercel domain. |

### Step 4: Click Deploy
1. Click **Deploy**. Vercel will compile the React app and host the static build.
2. Once complete, copy the provided deployment URL (e.g., `https://devpulse-dashboard.vercel.app`).

---

## 3️⃣ Setting Up GitHub OAuth (Live Mode)

If running in Live Mode, update your GitHub OAuth App settings so users redirect to the correct production domain:

1. Go to **GitHub Settings** → **Developer Settings** → **OAuth Apps** → Select your App.
2. Update the fields:
   - **Homepage URL**: `https://your-app-domain.vercel.app`
   - **Authorization callback URL**: `https://your-app-domain.vercel.app`
3. Save changes.

---

## 💡 Out-of-the-Box Demo Mode Deployment

If you want to host a public preview of the **Demo Mode (Sandbox)** without configuring database or API keys:
1. Follow **Section 1** to deploy the backend on Render, leaving `MONGO_URI`, `GITHUB_CLIENT_ID`, and `AI_API_KEY` empty.
2. Follow **Section 2** to deploy the frontend on Vercel, pointing `VITE_API_URL` to your Render URL.
3. Users who visit the site can immediately log in in Sandbox Mode, trigger commits, and see WebSocket graphs update!
