export type DashboardFilters = {
  zones: string[];
  sectors: string[];
  companies: string[];
  employmentTypes: string[];
};

export type FilterOptions = {
  zones: string[];
  sectors: string[];
  companies: string[];
  employmentTypes: string[];
};

export type Dashboard = {
  metadata: { period: string; lastUpdated: string; dataStatus: string; source: string };
  kpis: { jobsCreated: number; variationPercent: number };
  sectorDistribution: Array<{ name: string; value: number; percent: number }>;
  topJobs: Array<{ id: string; name: string; value: number }>;
  topCompanies: Array<{ name: string; value: number }>;
  totalRows: number;
};

export type JobCategory = { id: string; name: string; description: string; symbol: string; jobCount: number };
export type JobSummary = { id: string; name: string; categoryId: string; category: string; categorySymbol: string; sector: string; description: string; profile: string };
export type Job = JobSummary & { mission: string; skills: string[]; trainings: Array<{ name: string; level: string; format: string }>; companies: string[] };
export type Catalog = { categories: JobCategory[]; items: JobSummary[] };

export type EducationOptions = { series: string[]; fields: string[]; jobs: string[] };
export type Establishment = { id: string; establishment: string; establishmentId: string; city: string; country: string; field: string; program: string; duration: string; series: string[]; jobs: string[] };
export type EstablishmentResults = { items: Establishment[] };

export type ContestOptions = { series: string[]; fields: string[] };
export type Contest = { id: string; name: string; organizer: string; city: string; field: string; series: string[]; description: string; paperCount: number };
export type ContestResults = { items: Contest[] };
export type ContestPapers = { contest: Contest; papers: Array<{ id: string; label: string; year: number; type: string; pages: number }> };

export type OrientationOption = { value: string; label: string; description: string };
export type OrientationQuestion = { id: string; step: number; total: number; eyebrow: string; prompt: string; helper: string; options: OrientationOption[] };
export type OrientationSession = { sessionId: string; question: OrientationQuestion };
export type OrientationProfile = Array<{ label: string; value: string }>;
export type OrientationResults = { profile: OrientationProfile; recommendations: Array<{ rank: number; jobId: string; job: string; category: string; score: number; reason: string; pathway: null | { establishment: string; city: string; field: string; program: string; duration: string } }> };
