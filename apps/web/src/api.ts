import type { Catalog, ContestFilters, ContestOptions, ContestPapers, ContestResults, Dashboard, EducationFilters, EducationOptions, EstablishmentResults, FilterOptions, Filters, JobDetail, OrientationAnswer, OrientationRecommendations, OrientationSession } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error('La connexion au service LogPose a échoué.');
  return response.json() as Promise<T>;
}

function selectedParams(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  return params.toString();
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

export function getEducationOptions() {
  return request<EducationOptions>('/api/etablissements/options');
}

export function getEstablishments(filters: EducationFilters) {
  const query = selectedParams({ series: filters.series, fields: filters.field, jobs: filters.job });
  return request<EstablishmentResults>(`/api/etablissements${query ? `?${query}` : ''}`);
}

export function getContestOptions() {
  return request<ContestOptions>('/api/concours/options');
}

export function getContests(filters: ContestFilters) {
  const query = selectedParams({ series: filters.series, fields: filters.field });
  return request<ContestResults>(`/api/concours${query ? `?${query}` : ''}`);
}

export function getContestPapers(id: string) {
  return request<ContestPapers>(`/api/concours/${encodeURIComponent(id)}/annales`);
}

export function createOrientationSession() {
  return request<OrientationSession>('/api/orientation/sessions', { method: 'POST' });
}

export function submitOrientationAnswer(sessionId: string, questionId: string, answer: string) {
  return request<OrientationAnswer>(`/api/orientation/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, answer })
  });
}

export function getOrientationRecommendations(sessionId: string) {
  return request<OrientationRecommendations>(`/api/orientation/sessions/${encodeURIComponent(sessionId)}/recommandations`);
}
