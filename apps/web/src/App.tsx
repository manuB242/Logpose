import { useEffect, useMemo, useState } from 'react';
import { getCatalog, getDashboard, getFilterOptions, getJob } from './api';
import type { Catalog, Dashboard, FilterOptions, Filters, JobCategory, JobDetail, JobSummary } from './types';

const EMPTY_FILTERS: Filters = { zones: [], sectors: [], companies: [], employmentTypes: [] };
const SECTOR_COLORS = ['#cb9345', '#c15c42', '#89b6a8', '#6f9889', '#d5c08f', '#8c8d74'];
const formatter = new Intl.NumberFormat('fr-FR');

type View = 'dashboard' | 'catalogue' | 'job';
type IconName = 'grid' | 'compass' | 'school' | 'file' | 'sliders' | 'arrow-up' | 'briefcase' | 'chevron' | 'close' | 'refresh' | 'sparkle' | 'info' | 'search' | 'arrow-left' | 'layers' | 'target';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.1 4.8-4.8 2.1 2.1-4.8 4.8-2.1Z" /></>,
    school: <><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M7 12.2V16c3 2 7 2 10 0v-3.8" /><path d="M21 10v6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    sliders: <><path d="M4 5h16M4 12h16M4 19h16" /><circle cx="9" cy="5" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="11" cy="19" r="2" fill="currentColor" /></>,
    'arrow-up': <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" /></>,
    sparkle: <><path d="m12 3-1.3 5.7L5 10l5.7 1.3L12 17l1.3-5.7L19 10l-5.7-1.3L12 3Z" /><path d="m19 16-.5 2.5L16 19l2.5.5L19 22l.5-2.5L22 19l-2.5-.5L19 16Z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    'arrow-left': <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function countFilters(filters: Filters) {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

function filterSummary(filters: Filters) {
  const values = [...filters.zones, ...filters.sectors, ...filters.companies, ...filters.employmentTypes];
  if (!values.length) return 'Toutes les données';
  if (values.length === 1) return values[0];
  return `${values.length} filtres actifs`;
}

function makeDonutGradient(items: Dashboard['sectorDistribution']) {
  let cursor = 0;
  const segments = items.map((item, index) => {
    const start = cursor;
    cursor += item.percent;
    return `${SECTOR_COLORS[index % SECTOR_COLORS.length]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${segments.join(', ') || '#24443c 0 100%'})`;
}

function MetricCard({ label, value, detail, icon, highlight }: { label: string; value: string; detail: string; icon: IconName; highlight?: boolean }) {
  return <article className={`metric-card ${highlight ? 'metric-card--accent' : ''}`}>
    <div className="metric-card__top"><span>{label}</span><span className="metric-card__icon"><Icon name={icon} size={18} /></span></div>
    <strong>{value}</strong>
    <p className={highlight ? 'positive' : ''}>{highlight && <Icon name="arrow-up" size={14} />}{detail}</p>
  </article>;
}

function FilterGroup({ label, values, selected, onToggle }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="filter-group">
    <h3>{label}</h3>
    <div className="filter-options">
      {values.map((value) => {
        const active = selected.includes(value);
        return <button className={`filter-chip ${active ? 'filter-chip--active' : ''}`} onClick={() => onToggle(value)} key={value} aria-pressed={active}>{value}</button>;
      })}
    </div>
  </section>;
}

function FilterPanel({ options, filters, onClose, onApply, onReset }: { options: FilterOptions; filters: Filters; onClose: () => void; onApply: (filters: Filters) => void; onReset: () => void }) {
  const [draft, setDraft] = useState<Filters>(filters);
  const toggle = (key: keyof Filters, value: string) => setDraft((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const reset = () => { setDraft(EMPTY_FILTERS); onReset(); };

  return <div className="filter-layer" role="presentation">
    <button className="filter-backdrop" aria-label="Fermer les filtres" onClick={onClose} />
    <aside className="filter-panel" aria-label="Filtres du marché de l'emploi">
      <div className="filter-panel__header"><div><span className="eyebrow">Affiner les résultats</span><h2>Filtres</h2></div><button className="icon-button" aria-label="Fermer les filtres" onClick={onClose}><Icon name="close" /></button></div>
      <div className="filter-panel__content">
        <FilterGroup label="Zone géographique" values={options.zones} selected={draft.zones} onToggle={(value) => toggle('zones', value)} />
        <FilterGroup label="Secteur d'activité" values={options.sectors} selected={draft.sectors} onToggle={(value) => toggle('sectors', value)} />
        <FilterGroup label="Entreprise" values={options.companies} selected={draft.companies} onToggle={(value) => toggle('companies', value)} />
        <FilterGroup label="Type d'emploi" values={options.employmentTypes} selected={draft.employmentTypes} onToggle={(value) => toggle('employmentTypes', value)} />
      </div>
      <div className="filter-panel__actions"><button className="text-button" onClick={reset}>Réinitialiser</button><button className="primary-button" onClick={() => onApply(draft)}>Appliquer les filtres <span>→</span></button></div>
    </aside>
  </div>;
}

function LoadingState({ label = 'Mise à jour du tableau de bord…' }: { label?: string }) {
  return <div className="loading-state"><span className="loading-ring" />{label}</div>;
}

function EmptyChart() {
  return <div className="empty-chart"><Icon name="info" size={20} /><span>Aucune donnée ne correspond à ces filtres.</span></div>;
}

function DashboardPage({ dashboard, isLoading, error, filters, options, limit, onSetLimit, onOpenFilters, onClearFilters, onRetry, onOpenJob }: {
  dashboard: Dashboard | null; isLoading: boolean; error: string | null; filters: Filters; options: FilterOptions | null; limit: number; onSetLimit: (limit: number) => void; onOpenFilters: () => void; onClearFilters: () => void; onRetry: () => void; onOpenJob: (id: string) => void;
}) {
  const activeFilters = countFilters(filters);
  const donutBackground = useMemo(() => dashboard ? makeDonutGradient(dashboard.sectorDistribution) : 'conic-gradient(#24443c 0 100%)', [dashboard]);
  const maxJobValue = dashboard ? Math.max(...dashboard.topJobs.map((job) => job.value), 1) : 1;

  return <>
    <section id="marche" className="hero">
      <div><p className="eyebrow">Marché de l'emploi · République du Congo</p><h1>Voir plus loin.<br /><em>Choisir juste.</em></h1><p className="hero__copy">Explorez les signaux du marché pour éclairer votre parcours d'orientation.</p></div>
      <div className="hero-compass" aria-hidden="true"><span>⌁</span><i /><b /></div>
    </section>
    <section className="dashboard-toolbar" aria-label="Paramètres du tableau de bord">
      <div className="period-control"><span className="period-control__label">Période analysée</span><div className="period-control__buttons"><button className="period-button period-button--active">2026</button><button className="period-button">2025</button></div></div>
      <button className="filter-trigger" onClick={onOpenFilters} disabled={!options}><Icon name="sliders" size={18} /><span>Filtrer</span>{activeFilters > 0 && <b>{activeFilters}</b>}</button>
    </section>
    {activeFilters > 0 && <div className="filter-summary"><span><Icon name="sliders" size={15} /> {filterSummary(filters)}</span><button onClick={onClearFilters}>Effacer</button></div>}
    {error && <section className="error-card"><Icon name="info" /><div><strong>Impossible de charger les données.</strong><span>{error}</span></div><button onClick={onRetry}><Icon name="refresh" size={17} /> Réessayer</button></section>}
    {isLoading || !dashboard ? <LoadingState /> : <>
      <section className="metrics-grid" aria-label="Indicateurs clés">
        <MetricCard label="Opportunités recensées" value={formatter.format(dashboard.kpis.jobsCreated)} detail="sur la période sélectionnée" icon="briefcase" />
        <MetricCard label="Évolution estimée" value={`+${dashboard.kpis.variationPercent} %`} detail="par rapport à la période précédente" icon="arrow-up" highlight />
        <article className="coverage-card"><span className="coverage-card__label">Périmètre filtré</span><strong>{dashboard.totalRows}</strong><span>signaux emploi analysés</span><div className="coverage-card__line"><i /></div></article>
      </section>
      <section className="insight-banner"><div className="insight-banner__icon"><Icon name="sparkle" size={19} /></div><p><strong>Le saviez-vous ?</strong> Les besoins observés évoluent selon la zone, le secteur et le type de contrat. Utilisez les filtres pour comparer votre contexte.</p></section>
      <section className="chart-grid">
        <article className="panel panel--sectors">
          <div className="panel__heading"><div><p className="eyebrow">Répartition</p><h2>Par secteur d'activité</h2></div><span className="panel-tag">2026</span></div>
          {dashboard.sectorDistribution.length ? <div className="sector-content"><div className="donut" style={{ background: donutBackground }}><div className="donut__inside"><strong>{dashboard.sectorDistribution.length}</strong><span>secteurs</span></div></div><ul className="sector-legend">{dashboard.sectorDistribution.map((sector, index) => <li key={sector.name}><i style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }} /><span>{sector.name}</span><b>{sector.percent}%</b></li>)}</ul></div> : <EmptyChart />}
        </article>
        <article className="panel panel--jobs">
          <div className="panel__heading"><div><p className="eyebrow">Métiers recherchés</p><h2>Top opportunités</h2></div><label className="top-select">Top <select value={limit} onChange={(event) => onSetLimit(Number(event.target.value))} aria-label="Nombre de métiers affichés"><option value="5">5</option><option value="8">8</option><option value="10">10</option></select></label></div>
          {dashboard.topJobs.length ? <div className="job-bars">{dashboard.topJobs.map((job, index) => job.id ? <button className="job-row job-row--button" onClick={() => onOpenJob(job.id!)} key={job.name} aria-label={`Consulter la fiche ${job.name}`}><span className="job-row__rank">0{index + 1}</span><span className="job-row__label"><span>{job.name}</span><span className="job-row__track"><i style={{ width: `${(job.value / maxJobValue) * 100}%` }} /></span></span><b>{job.value}</b></button> : <div className="job-row" key={job.name}><span className="job-row__rank">0{index + 1}</span><div className="job-row__label"><span>{job.name}</span><div className="job-row__track"><i style={{ width: `${(job.value / maxJobValue) * 100}%` }} /></div></div><b>{job.value}</b></div>)}</div> : <EmptyChart />}
        </article>
      </section>
      <section className="panel companies-panel"><div className="panel__heading"><div><p className="eyebrow">Acteurs à suivre</p><h2>Entreprises qui recrutent</h2></div><span className="panel-tag panel-tag--gold">Top 5</span></div>{dashboard.topCompanies.length ? <div className="company-grid">{dashboard.topCompanies.map((company, index) => <article className="company-card" key={company.name}><span className="company-card__number">0{index + 1}</span><div><strong>{company.name}</strong><span>{company.value} opportunités</span></div><Icon name="chevron" size={18} /></article>)}</div> : <EmptyChart />}</section>
      <footer className="data-footer"><Icon name="info" size={16} /><span><strong>Données de démonstration.</strong> Mise à jour affichée : {dashboard.metadata.lastUpdated}. Les chiffres ne représentent pas des statistiques officielles.</span></footer>
    </>}
  </>;
}

function CataloguePage({ catalog, loading, error, onRetry, onOpenJob }: { catalog: Catalog | null; loading: boolean; error: string | null; onRetry: () => void; onOpenJob: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!openCategory && catalog?.categories.length) setOpenCategory(catalog.categories[0].id);
  }, [catalog, openCategory]);

  const matchedJobs = useMemo(() => {
    if (!catalog) return [];
    const term = search.trim().toLocaleLowerCase('fr');
    return term ? catalog.items.filter((job) => `${job.name} ${job.description} ${job.sector}`.toLocaleLowerCase('fr').includes(term)) : catalog.items;
  }, [catalog, search]);

  return <section className="catalogue-page">
    <header className="catalogue-hero"><div><p className="eyebrow">Explorer son avenir</p><h1>Des métiers à<br /><em>votre mesure.</em></h1><p>Découvrez les univers professionnels, les compétences utiles et les parcours de formation associés.</p></div><div className="catalogue-hero__motif"><Icon name="layers" size={42} /><span>{catalog?.items.length || '—'}</span><small>métiers<br />à explorer</small></div></header>
    <div className="catalogue-search"><Icon name="search" size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un métier, un secteur…" aria-label="Rechercher un métier ou un secteur" />{search && <button onClick={() => setSearch('')} aria-label="Effacer la recherche"><Icon name="close" size={16} /></button>}</div>
    <div className="catalogue-context"><span><Icon name="layers" size={15} /> Catalogue de démonstration</span><span>{matchedJobs.length} métier{matchedJobs.length !== 1 ? 's' : ''} trouvé{matchedJobs.length !== 1 ? 's' : ''}</span></div>
    {loading ? <LoadingState label="Chargement des métiers…" /> : error ? <section className="error-card"><Icon name="info" /><div><strong>Impossible de charger le catalogue.</strong><span>{error}</span></div><button onClick={onRetry}><Icon name="refresh" size={17} /> Réessayer</button></section> : !catalog ? null : search ? <JobResults jobs={matchedJobs} onOpenJob={onOpenJob} /> : <div className="category-list">{catalog.categories.map((category) => <CategoryAccordion key={category.id} category={category} jobs={catalog.items.filter((job) => job.categoryId === category.id)} isOpen={openCategory === category.id} onToggle={() => setOpenCategory((current) => current === category.id ? null : category.id)} onOpenJob={onOpenJob} />)}</div>}
    {catalog && <footer className="data-footer catalogue-footer"><Icon name="info" size={16} /><span><strong>Référentiel de démonstration.</strong> Les descriptions et parcours devront être validés avec les établissements et professionnels référents.</span></footer>}
  </section>;
}

function CategoryAccordion({ category, jobs, isOpen, onToggle, onOpenJob }: { category: JobCategory; jobs: JobSummary[]; isOpen: boolean; onToggle: () => void; onOpenJob: (id: string) => void }) {
  return <section className={`category-accordion ${isOpen ? 'category-accordion--open' : ''}`}>
    <button className="category-accordion__header" onClick={onToggle} aria-expanded={isOpen}><span className="category-symbol">{category.symbol}</span><span className="category-accordion__copy"><strong>{category.name}</strong><small>{category.description}</small></span><span className="category-count">{category.jobCount}</span><Icon name="chevron" size={19} /></button>
    {isOpen && <div className="category-accordion__body"><JobResults jobs={jobs} onOpenJob={onOpenJob} /></div>}
  </section>;
}

function JobResults({ jobs, onOpenJob }: { jobs: JobSummary[]; onOpenJob: (id: string) => void }) {
  if (!jobs.length) return <div className="catalogue-empty"><Icon name="search" size={25} /><strong>Aucun métier trouvé</strong><span>Essayez un autre mot-clé ou explorez une catégorie.</span></div>;
  return <div className="job-card-grid">{jobs.map((job) => <button className="job-card" key={job.id} onClick={() => onOpenJob(job.id)}><span className="job-card__symbol">{job.categorySymbol}</span><span className="job-card__content"><small>{job.sector}</small><strong>{job.name}</strong><span>{job.description}</span></span><Icon name="chevron" size={19} /></button>)}</div>;
}

function JobPage({ job, loading, error, onBack, onOpenOffers }: { job: JobDetail | null; loading: boolean; error: string | null; onBack: () => void; onOpenOffers: () => void }) {
  if (loading) return <LoadingState label="Chargement de la fiche métier…" />;
  if (error || !job) return <section className="error-card job-error"><Icon name="info" /><div><strong>Impossible de charger cette fiche.</strong><span>{error || 'Ce métier est introuvable.'}</span></div><button onClick={onBack}>Retour au catalogue</button></section>;
  return <section className="job-page">
    <button className="back-button" onClick={onBack}><Icon name="arrow-left" size={18} /> Retour au catalogue</button>
    <header className="job-hero"><div className="job-hero__symbol">{job.categorySymbol}</div><div><p className="eyebrow">{job.category} · {job.sector}</p><h1>{job.name}</h1><p>{job.description}</p></div><div className="job-hero__profile"><Icon name="target" size={19} /><span>Pour vous si vous…</span><strong>{job.profile}</strong></div></header>
    <div className="job-content-grid">
      <article className="job-content-card job-content-card--mission"><p className="eyebrow">Le rôle</p><h2>Ce que fait ce métier</h2><p>{job.mission}</p></article>
      <article className="job-content-card"><p className="eyebrow">Compétences clés</p><h2>Ce qu'il faut développer</h2><div className="skill-list">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>
    </div>
    <section className="job-content-card trainings-card"><div className="panel__heading"><div><p className="eyebrow">Parcours possibles</p><h2>Formations associées</h2></div><span className="panel-tag panel-tag--gold">À vérifier</span></div><div className="training-list">{job.trainings.map((training) => <article className="training-row" key={training.name}><span className="training-row__mark"><Icon name="school" size={18} /></span><div><strong>{training.name}</strong><span>{training.format}</span></div><b>{training.level}</b></article>)}</div></section>
    <section className="job-content-card companies-detail"><p className="eyebrow">Écosystème</p><h2>Organisations associées</h2><p>Exemples indicatifs à confirmer avec les employeurs et les référentiels sectoriels.</p><div className="company-chip-list">{job.companies.map((company) => <span key={company}><Icon name="briefcase" size={14} />{company}</span>)}</div></section>
    <section className="job-action"><div><span className="job-action__icon"><Icon name="briefcase" size={20} /></span><div><strong>Envie d'aller plus loin ?</strong><span>Les offres liées seront disponibles lorsque les sources partenaires auront été intégrées.</span></div></div><button className="primary-button" onClick={onOpenOffers}>Voir les offres liées <span>→</span></button></section>
    <footer className="data-footer"><Icon name="info" size={16} /><span><strong>Fiche de démonstration.</strong> Elle ne remplace pas les conditions d’admission ni l’information fournie par un établissement.</span></footer>
  </section>;
}

export function App() {
  const [view, setView] = useState<View>('dashboard');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [limit, setLimit] = useState(5);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDashboard = () => {
    setDashboardLoading(true); setDashboardError(null);
    getDashboard(filters, limit).then(setDashboard).catch((requestError: Error) => setDashboardError(requestError.message)).finally(() => setDashboardLoading(false));
  };
  const loadCatalog = () => {
    setCatalogLoading(true); setCatalogError(null);
    getCatalog().then(setCatalog).catch((requestError: Error) => setCatalogError(requestError.message)).finally(() => setCatalogLoading(false));
  };

  useEffect(() => { getFilterOptions().then(setOptions).catch(() => setDashboardError('Les options de filtre sont indisponibles.')); }, []);
  useEffect(() => { loadDashboard(); }, [filters, limit]);
  useEffect(() => { if ((view === 'catalogue' || view === 'job') && !catalog && !catalogLoading) loadCatalog(); }, [view]);

  const applyFilters = (nextFilters: Filters) => { setFilters(nextFilters); setFilterOpen(false); };
  const navigate = (target: View) => { setView(target); setNotice(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openJob = (id: string) => {
    setView('job'); setSelectedJob(null); setJobError(null); setJobLoading(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    getJob(id).then((response) => setSelectedJob(response.item)).catch((requestError: Error) => setJobError(requestError.message)).finally(() => setJobLoading(false));
  };
  const showOfferNotice = () => setNotice('Les offres liées arriveront avec l’intégration des sources partenaires.');

  const title = view === 'dashboard' ? "Marché de l'emploi" : view === 'catalogue' ? 'Catalogue des métiers' : 'Fiche métier';
  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand brand-button" onClick={() => navigate('dashboard')} aria-label="LogPose, accueil"><span className="brand-mark"><span /></span><span>log<span>pose</span></span></button>
      <nav className="side-nav" aria-label="Navigation principale">
        <button className={`side-nav__item ${view === 'dashboard' ? 'side-nav__item--active' : ''}`} onClick={() => navigate('dashboard')}><Icon name="grid" /> <span>Marché de l'emploi</span></button>
        <button className={`side-nav__item ${view === 'catalogue' || view === 'job' ? 'side-nav__item--active' : ''}`} onClick={() => navigate('catalogue')}><Icon name="layers" /> <span>Catalogue métiers</span></button>
        <span className="side-nav__item side-nav__item--soon"><Icon name="compass" /> <span>Orientation</span><em>Bientôt</em></span>
        <span className="side-nav__item side-nav__item--soon"><Icon name="school" /> <span>Établissements</span></span>
        <span className="side-nav__item side-nav__item--soon"><Icon name="file" /> <span>Annales</span></span>
      </nav>
      <div className="sidebar__footer"><div className="sidebar__note"><Icon name="sparkle" size={17} /><span>Construire son avenir, un choix à la fois.</span></div><span className="version">MVP · Lots 1 & 2</span></div>
    </aside>
    <main id="top" className="main-content">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><span /></span><strong>log<span>pose</span></strong></div><div className="topbar__context"><span className="status-dot" /> {title} · données de démonstration</div><button className="profile-button" aria-label="Profil utilisateur"><span>LP</span><Icon name="chevron" size={16} /></button></header>
      {view === 'dashboard' && <DashboardPage dashboard={dashboard} isLoading={dashboardLoading} error={dashboardError} filters={filters} options={options} limit={limit} onSetLimit={setLimit} onOpenFilters={() => setFilterOpen(true)} onClearFilters={() => setFilters(EMPTY_FILTERS)} onRetry={loadDashboard} onOpenJob={openJob} />}
      {view === 'catalogue' && <CataloguePage catalog={catalog} loading={catalogLoading} error={catalogError} onRetry={loadCatalog} onOpenJob={openJob} />}
      {view === 'job' && <JobPage job={selectedJob} loading={jobLoading} error={jobError} onBack={() => navigate('catalogue')} onOpenOffers={showOfferNotice} />}
    </main>
    <nav className="bottom-nav" aria-label="Navigation mobile"><button className={`bottom-nav__item ${view === 'dashboard' ? 'bottom-nav__item--active' : ''}`} onClick={() => navigate('dashboard')}><Icon name="grid" /><span>Marché</span></button><button className={`bottom-nav__item ${view === 'catalogue' || view === 'job' ? 'bottom-nav__item--active' : ''}`} onClick={() => navigate('catalogue')}><Icon name="layers" /><span>Métiers</span></button><span className="bottom-nav__item"><Icon name="school" /><span>Écoles</span></span><span className="bottom-nav__item"><Icon name="file" /><span>Annales</span></span></nav>
    {isFilterOpen && options && <FilterPanel options={options} filters={filters} onClose={() => setFilterOpen(false)} onApply={applyFilters} onReset={() => setFilters(EMPTY_FILTERS)} />}
    {notice && <div className="demo-toast" role="status"><Icon name="info" size={17} /><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Fermer"><Icon name="close" size={15} /></button></div>}
  </div>;
}
