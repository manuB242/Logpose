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

export type DemoMetadata = {
  dataStatus: 'demonstration';
  source: string;
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
  metadata: DemoMetadata;
  categories: JobCategory[];
  items: JobSummary[];
};

export type EducationOptions = {
  series: string[];
  fields: string[];
  jobs: string[];
};

export type EducationFilters = {
  series: string;
  field: string;
  job: string;
};

export type EstablishmentProgram = {
  id: string;
  establishmentId: string;
  establishment: string;
  city: string;
  country: string;
  field: string;
  program: string;
  duration: string;
  series: string[];
  jobs: string[];
};

export type EstablishmentResults = {
  metadata: DemoMetadata;
  appliedFilters: { series: string[]; fields: string[]; jobs: string[] };
  items: EstablishmentProgram[];
};

export type ContestOptions = {
  series: string[];
  fields: string[];
};

export type ContestFilters = {
  series: string;
  field: string;
};

export type Contest = {
  id: string;
  name: string;
  organizer: string;
  city: string;
  field: string;
  series: string[];
  description: string;
  paperCount: number;
};

export type ContestResults = {
  metadata: DemoMetadata;
  appliedFilters: { series: string[]; fields: string[] };
  items: Contest[];
};

export type Paper = {
  id: string;
  label: string;
  year: number;
  type: string;
  pages: number;
};

export type ContestPapers = {
  metadata: DemoMetadata;
  contest: Contest;
  papers: Paper[];
};
