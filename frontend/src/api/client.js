const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(path, { method = 'GET', body, params } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : '';
  const res = await fetch(BASE + path + qs, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

export const api = {
  me: () => request('/me'),
  meta: () => request('/meta'),
  dashboard: () => request('/dashboard'),

  apps: (params) => request('/apps', { params }),
  app: (code) => request(`/apps/${code}`),
  createApp: (body) => request('/apps', { method: 'POST', body }),
  updateApp: (code, body) => request(`/apps/${code}`, { method: 'PATCH', body }),

  areas: (params) => request('/areas', { params }),
  monitor: () => request('/monitor'),

  users: (params) => request('/users', { params }),
  syncUsers: () => request('/users/sync', { method: 'POST' }),
  inviteUser: (body) => request('/users/invite', { method: 'POST', body }),
  setUserStatus: (id, status) => request(`/users/${id}/status`, { method: 'PATCH', body: { status } }),

  roles: () => request('/roles'),
  matrix: (appCode) => request(`/roles/matrix/${appCode}`),
  saveMatrix: (appCode, permissions) => request(`/roles/matrix/${appCode}`, { method: 'PUT', body: { permissions } }),

  config: (appCode, env) => request(`/config/${appCode}`, { params: { env } }),
  changeParam: (appCode, body) => request(`/config/${appCode}/params`, { method: 'POST', body }),
  toggleFlag: (appCode, flagKey, body) => request(`/config/${appCode}/flags/${encodeURIComponent(flagKey)}`, { method: 'PATCH', body }),

  approvals: (status) => request('/approvals', { params: { status } }),
  approve: (id) => request(`/approvals/${id}/approve`, { method: 'POST' }),
  reject: (id) => request(`/approvals/${id}/reject`, { method: 'POST' }),

  audit: (params) => request('/audit', { params }),
  auditExportUrl: (params) =>
    `${BASE}/audit/export?` + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString(),
};
