import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';

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
  const { userEmail, userName, logout } = useAuth();
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    const ok = await confirm({
      title: 'Sign out?',
      message: 'You will be returned to the login screen.',
      confirmLabel: 'Sign out',
      variant: 'danger',
    });
    if (ok) logout();
  }

  const onCampaigns = pathname === '/campaigns' || (pathname.startsWith('/campaigns/') && pathname !== '/campaigns/new');
  const onNew = pathname === '/campaigns/new';

  const initials = userName
    ? userName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : (userEmail ? userEmail.slice(0, 2).toUpperCase() : 'CE');
  const displayName = userName ?? 'User';

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

      <div className="user-chip" ref={chipRef}>
        {menuOpen && (
          <div className="user-menu">
            <button className="user-menu-item user-menu-item-danger" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
        <div className="avatar">{initials}</div>
        <div className="meta">
          <div className="nm">{displayName}</div>
          {userEmail && <div className="em">{userEmail}</div>}
        </div>
        <button
          className="dots-btn"
          onClick={() => setMenuOpen(o => !o)}
          title="More options"
        >
          ···
        </button>
      </div>
    </aside>
  );
}
