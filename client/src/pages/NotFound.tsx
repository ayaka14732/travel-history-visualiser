import { Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
      <div className="text-center px-6">
        <p className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 select-none mb-2">
          404
        </p>
        <div className="w-16 h-px bg-slate-600 mx-auto mb-6" />
        <h2 className="text-lg font-medium text-slate-300 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-10 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => setLocation('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 px-5 py-2.5 rounded-full transition-colors duration-150"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
