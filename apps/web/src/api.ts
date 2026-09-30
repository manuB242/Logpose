import type { Catalog, Dashboard, FilterOptions, Filters, JobDetail } from './types';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('La connexion au service LogPose a échoué.');
  return response.json() as Promise<T>;
}

export function getFilterOptions() {
  return request<FilterOptions>('/api/filter-options');
}

export function getDashboard(filters: Filters, limit: number) {
  const params = new URLSearchParams({ period: '2026', limit: String(limit) });
  if (filters.zones.length) params.set('zones', filters.zones.join(','));
  if (filters.sectors.length) params.set('sectors', filters.sectors.join(','));
  if (filters.companies.length) params.set('companies', filters.companies.join(','));
  if (filters.employmentTypes.length) params.set('employmentTypes', filters.employmentTypes.join(','));
  return request<Dashboard>(`/api/dashboard?${params.toString()}`);
}

export function getCatalog() {
  return request<Catalog>('/api/metiers');
}

export function getJob(id: string) {
  return request<{ metadata: Catalog['metadata']; item: JobDetail }>(`/api/metiers/${encodeURIComponent(id)}`);
}
