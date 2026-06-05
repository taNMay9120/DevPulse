import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore.js';
import { GitHubLogin } from './components/GitHubLogin.js';
import { Dashboard } from './components/Dashboard.js';
import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, loading, loadFromStorage, loginWithCode } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Initial localstorage check
    loadFromStorage();
    setMounted(true);

    // 2. Parse OAuth code callbacks
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // Clean url parameters to keep address bar clean
      window.history.replaceState({}, document.title, window.location.pathname);
      
      console.log('Detected OAuth callback code. Triggering backend authorization exchange...');
      loginWithCode(code);
    }
  }, []);

  if (!mounted || (loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-secondary font-medium">Validating workspace sessions...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <GitHubLogin />
  );
}

export default App;
