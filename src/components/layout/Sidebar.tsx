import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const IcoGrid = () => (
  <svg className="ico" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="11" y="3" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3" y="11" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="11" y="11" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IcoPlus = () => (
  <svg className="ico" viewBox="0 0 20 20" fill="none">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export function Sidebar() {
  const { pathname } = useLocation();
  const { userEmail, logout } = useAuth();

  const onCampaigns = pathname === '/campaigns' || (pathname.startsWith('/campaigns/') && pathname !== '/campaigns/new');
  const onNew = pathname === '/campaigns/new';

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'CE';
  const displayName = userEmail?.split('@')[0]?.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'User';

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div className="brand-name">ColdEmailer</div>
      </div>

      <div className="nav-label">Workspace</div>
      <Link className={`nav-item${onCampaigns ? ' active' : ''}`} to="/campaigns">
        <IcoGrid /> Campaigns
      </Link>
      <Link className={`nav-item${onNew ? ' active' : ''}`} to="/campaigns/new">
        <IcoPlus /> New campaign
      </Link>

      <div className="nav-spacer" />

      <div className="user-chip">
        <div className="avatar">{initials}</div>
        <div className="meta">
          <div className="nm">{displayName}</div>
          <div className="em">{userEmail ?? '—'}</div>
        </div>
        <button
          onClick={logout}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: '2px 4px' }}
          title="Sign out"
        >
          ↩
        </button>
      </div>
    </aside>
  );
}
