import type { Campaign, CreateCampaignRequest } from '../types/api';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('ce_refreshToken');
  if (!refreshToken) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return null;
  }
  const res = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return null;
  }
  const data: { authToken: string } = await res.json();
  localStorage.setItem('ce_authToken', data.authToken);
  return data.authToken;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const json = JSON.parse(text);
    return json.message || json.error || text || `HTTP ${res.status}`;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('ce_authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${base}${path}`, { ...init, headers });

  if (res.status === 401) {
    const newToken = await refreshAuthToken();
    if (!newToken) throw new Error('Session expired. Please log in again.');
    const retryRes = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
    if (!retryRes.ok) {
      throw new Error(await extractErrorMessage(retryRes));
    }
    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  return res.json() as Promise<T>;
}

export const api = {
  listCampaigns: () => request<Campaign[]>('/campaigns'),
  getCampaign: (id: string) => request<Campaign>(`/campaigns/${id}`),
  createCampaign: (data: CreateCampaignRequest) =>
    request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  pauseCampaign: (id: string) => request<Campaign>(`/campaigns/${id}/pause`, { method: 'POST' }),
  resumeCampaign: (id: string) => request<Campaign>(`/campaigns/${id}/resume`, { method: 'POST' }),
  cancelFollowups: (id: string) => request<Campaign>(`/campaigns/${id}/cancel`, { method: 'POST' }),
};
