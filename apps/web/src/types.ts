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
  topJobs: Array<{ name: string; value: number }>;
  topCompanies: Array<{ name: string; value: number }>;
  totalRows: number;
};
