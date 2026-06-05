import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { Terminal, Key, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export const GitHubLogin = () => {
  const { loginWithDemo, loginWithToken, loading, error } = useAuthStore();
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenForm, setShowTokenForm] = useState(false);

  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin;
    const scope = 'repo,read:user';

    if (!clientId) {
      alert('GitHub Client ID is not configured. Falling back to Demo Mode.');
      loginWithDemo();
      return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    try {
      await loginWithToken(tokenInput.trim());
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 border-border-card/60">
        {/* Logo and Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-accent/20">
            D
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white m-0 pt-2">DevPulse</h1>
          <p className="text-sm text-text-secondary">AI-Powered Developer Performance Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-red/10 border border-danger-red/25 flex gap-3 text-xs text-danger-red leading-normal items-start animate-slide-up">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="m-0 font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Main Action: OAuth login */}
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-950 font-bold text-sm rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-white/5"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            )}
            Sign in with GitHub
          </button>

          {/* Quick Sandbox Play */}
          <button
            onClick={() => loginWithDemo()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border-card bg-bg-card/60 hover:bg-accent-light hover:border-accent/30 disabled:opacity-50 text-white hover:text-accent-hover font-bold text-sm rounded-xl cursor-pointer transition-all shadow-inner"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Continue in Demo Mode (Sandbox)
          </button>

          <div className="flex items-center justify-between py-2">
            <span className="h-[1px] bg-border-card flex-1"></span>
            <span className="text-[10px] text-text-muted px-4 font-bold uppercase tracking-wider">or config keys</span>
            <span className="h-[1px] bg-border-card flex-1"></span>
          </div>

          {/* Token Authentication toggler */}
          {!showTokenForm ? (
            <button
              onClick={() => setShowTokenForm(true)}
              className="w-full text-center text-xs font-semibold text-text-secondary hover:text-white transition-colors py-1 cursor-pointer"
            >
              Enter GitHub Personal Access Token (PAT)
            </button>
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-3 animate-slide-up">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Paste GitHub Access Token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-bg-main border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                  required
                />
                <Key className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenForm(false)}
                  className="w-1/3 py-2 text-xs font-semibold border border-border-card rounded-xl text-text-secondary hover:text-white hover:bg-border-card/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Validating...' : 'Validate & Enter'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Small tips footer */}
        <div className="mt-8 text-center text-[10px] text-text-muted flex justify-center items-center gap-1.5 leading-none">
          <Terminal className="w-3.5 h-3.5" />
          <span>Demo Mode operates locally without external API connections.</span>
        </div>
      </div>
    </div>
  );
};
export default GitHubLogin;
