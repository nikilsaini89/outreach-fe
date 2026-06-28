import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const IcoCheck = () => (
  <svg className="check" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 4.5 6.5 11 3 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

export function LoginPage() {
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setBusy(true);
    setError(null);
    try {
      await login();
    } catch {
      setError('Could not reach the backend. Make sure the server is running on port 8080.');
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div className="brand-name">ColdEmailer</div>
        </div>

        <div className="auth-quote">
          Send the first email.<br />
          <span>Let AI write the follow-ups, schedule them, and keep every reply in one Gmail thread.</span>
        </div>

        <div className="auth-foot">© 2026 ColdEmailer · Gmail-native outreach</div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>Sign in to ColdEmailer</h1>
          <p className="sub">Connect your Google account to send and schedule outreach from your own Gmail.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s-4)' }}>{error}</div>}

          <button className="btn-google" onClick={handleLogin} disabled={busy}>
            {busy ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <GoogleLogo />}
            {busy ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="auth-perks">
            <div className="auth-perk">
              <IcoCheck />
              We store only an encrypted refresh token — never your password.
            </div>
            <div className="auth-perk">
              <IcoCheck />
              Emails are sent from your address, in your existing threads.
            </div>
            <div className="auth-perk">
              <IcoCheck />
              Revoke access anytime from your Google account.
            </div>
          </div>

          <p className="legal">
            By continuing you agree to the Terms of Service and Privacy Policy.<br />
            ColdEmailer requests the <span className="tag-mono">gmail.send</span> scope only.
          </p>
        </div>
      </main>
    </div>
  );
}
