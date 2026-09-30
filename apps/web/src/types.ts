export type FilterOptions = {
  zones: string[];
  sectors: string[];
  companies: string[];
  employmentTypes: string[];
};

export type Filters = {
  zones: string[];
  sectors: string[];
  companies: string[];
  employmentTypes: string[];
};

export type Dashboard = {
  metadata: {
    period: string;
    lastUpdated: string;
    dataStatus: 'demonstration';
    source: string;
  };
  appliedFilters: Filters;
  kpis: { jobsCreated: number; variationPercent: number };
  sectorDistribution: Array<{ name: string; value: number; percent: number }>;
  topJobs: Array<{ id: string | null; name: string; value: number }>;
  topCompanies: Array<{ name: string; value: number }>;
  totalRows: number;
};

export type JobCategory = {
  id: string;
  name: string;
  description: string;
  symbol: string;
  jobCount: number;
};

export type JobSummary = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  categorySymbol: string;
  sector: string;
  description: string;
  profile: string;
};

export type Training = {
  name: string;
  level: string;
  format: string;
};

export type JobDetail = JobSummary & {
  mission: string;
  skills: string[];
  trainings: Training[];
  companies: string[];
};

export type Catalog = {
  metadata: {
    dataStatus: 'demonstration';
    source: string;
  };
  categories: JobCategory[];
  items: JobSummary[];
};
