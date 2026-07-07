import { Link, useLocation } from 'react-router-dom';
import type { FallbackProps } from 'react-error-boundary';

const SEGMENT_LABELS: Record<string, string> = {
  campaigns: 'Campaigns',
  new: 'New Campaign',
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = SEGMENT_LABELS[seg] ?? seg;
    return { path, label };
  });
}

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const crumbs = useBreadcrumbs();

  return (
    <>
      <header className="topbar">
        <div className="crumbs">
          {crumbs.map((crumb, i) => (
            <span key={crumb.path} style={{ display: 'contents' }}>
              {i > 0 && <span className="sep">/</span>}
              <Link to={crumb.path} onClick={resetErrorBoundary}>{crumb.label}</Link>
            </span>
          ))}
          <span className="sep">/</span>
          <span className="here">Error</span>
        </div>
      </header>
      <div className="error-fallback">
        <h2 className="error-fallback-title">Something went wrong</h2>
        <p className="error-fallback-message">
          An unexpected error occurred on this page. You can try again or go back to the dashboard.
        </p>
        <div className="error-fallback-actions">
          <button className="btn btn-primary" onClick={resetErrorBoundary}>
            Try again
          </button>
          <Link to="/campaigns" className="btn btn-secondary" onClick={resetErrorBoundary}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
