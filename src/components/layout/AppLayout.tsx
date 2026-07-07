import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Sidebar } from './Sidebar';
import { ErrorFallback } from '../ui/ErrorFallback';

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
