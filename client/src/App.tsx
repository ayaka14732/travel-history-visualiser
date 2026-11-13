import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { LocaleProvider } from './contexts/LocaleContext';
import Home from './pages/Home';

const toasterStyle = {
  fontFamily: 'inherit',
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
} as React.CSSProperties;

export default function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <Toaster theme="light" style={toasterStyle} />
        <Home />
      </LocaleProvider>
    </ErrorBoundary>
  );
}
