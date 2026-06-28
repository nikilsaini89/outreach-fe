import type { Campaign, CreateCampaignRequest } from '../types/api';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCampaigns: (userId: string) =>
    request<Campaign[]>(`/campaigns?userId=${encodeURIComponent(userId)}`),

  getCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}`),

  createCampaign: (data: CreateCampaignRequest) =>
    request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),

  pauseCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/pause`, { method: 'POST' }),

  resumeCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}/resume`, { method: 'POST' }),
};
