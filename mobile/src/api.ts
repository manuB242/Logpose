import type {
  Catalog,
  ContestOptions,
  ContestPapers,
  ContestResults,
  Dashboard,
  DashboardFilters,
  EducationOptions,
  EstablishmentResults,
  FilterOptions,
  Job,
  OrientationResults,
  OrientationSession
} from './types';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export class ApiConfigurationError extends Error {
  constructor() {
    super('Définissez EXPO_PUBLIC_API_BASE_URL dans mobile/.env avec l’URL HTTPS publique de l’API PHP.');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!configuredBaseUrl) throw new ApiConfigurationError();

  const response = await fetch(`${configuredBaseUrl}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers ?? {}) }
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    // Le statut HTTP est traité ci-dessous avec un message générique.
  }
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'La connexion au service LogPose a échoué.');
  return body as T;
}

function query(values: Record<string, string | string[] | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length) params.set(key, value.join(','));
    if (typeof value === 'string' && value) params.set(key, value);
    if (typeof value === 'number') params.set(key, String(value));
  });
  return params.toString() ? `?${params}` : '';
}

export const api = {
  filterOptions: () => request<FilterOptions>('/api/filter-options'),
  dashboard: (filters: DashboardFilters, limit: number) => request<Dashboard>(`/api/dashboard${query({ period: '2026', limit, ...filters })}`),
  catalog: () => request<Catalog>('/api/metiers'),
  job: async (slug: string) => (await request<{ item: Job }>(`/api/metiers/${encodeURIComponent(slug)}`)).item,
  educationOptions: () => request<EducationOptions>('/api/etablissements/options'),
  establishments: (filters: { series: string; field: string; job: string }) => request<EstablishmentResults>(`/api/etablissements${query({ series: filters.series, fields: filters.field, jobs: filters.job })}`),
  contestOptions: () => request<ContestOptions>('/api/concours/options'),
  contests: (filters: { series: string; field: string }) => request<ContestResults>(`/api/concours${query({ series: filters.series, fields: filters.field })}`),
  contest: (slug: string) => request<ContestPapers>(`/api/concours/${encodeURIComponent(slug)}/annales`),
  startOrientation: () => request<OrientationSession>('/api/orientation/sessions', { method: 'POST' }),
  answerOrientation: (sessionId: string, questionId: string, answer: string) => request<{ completed: boolean; question: OrientationSession['question'] | null }>(`/api/orientation/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId, answer })
  }),
  orientationResults: (sessionId: string) => request<OrientationResults>(`/api/orientation/sessions/${encodeURIComponent(sessionId)}/recommandations`)
};
