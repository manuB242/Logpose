(() => {
  'use strict';

  const app = document.getElementById('app');
  const money = new Intl.NumberFormat('fr-FR');
  const sectorColors = ['#cb9345', '#c15c42', '#89b6a8', '#6f9889', '#d5c08f', '#8c8d74'];
  const emptyFilters = () => ({ zones: [], sectors: [], companies: [], employmentTypes: [] });

  const state = {
    view: 'dashboard',
    dashboard: null,
    dashboardLoading: true,
    dashboardError: null,
    filterOptions: null,
    filters: emptyFilters(),
    draftFilters: emptyFilters(),
    filtersOpen: false,
    limit: 5,
    catalog: null,
    catalogLoading: false,
    catalogError: null,
    catalogSearch: '',
    openCategory: null,
    selectedJob: null,
    jobLoading: false,
    jobError: null,
    education: { options: null, results: null, loading: false, error: null, filters: { series: '', field: '', job: '' } },
    contests: { options: null, results: null, loading: false, error: null, filters: { series: '', field: '' } },
    selectedContest: null,
    contestLoading: false,
    contestError: null,
    orientation: { sessionId: null, question: null, history: [], results: null, loading: false, submitting: false, error: null },
    notice: null,
  };

  // Lucide est servi localement dans assets/vendor : aucun emoji ni SVG artisanal.
  const lucideNames = {
    grid: 'layout-dashboard', compass: 'compass', school: 'graduation-cap', file: 'file-text',
    sliders: 'sliders-horizontal', 'arrow-up': 'arrow-up', briefcase: 'briefcase', chevron: 'chevron-right',
    close: 'x', refresh: 'refresh-cw', sparkle: 'sparkles', info: 'circle-help', search: 'search',
    'arrow-left': 'arrow-left', 'arrow-right': 'arrow-right', 'arrow-up-right': 'arrow-up-right',
    layers: 'layers', target: 'crosshair', check: 'circle-check', 'file-check': 'file-check-2',
  };
  const categoryIcons = {
    numerique: 'code-2', btp: 'hard-hat', sante: 'heart-pulse', environnement: 'leaf', finance: 'chart-line',
  };

  function icon(name, size = 20) {
    const iconName = lucideNames[name] || name;
    return `<i class="lucide-icon" data-lucide="${iconName}" style="width:${size}px;height:${size}px" aria-hidden="true"></i>`;
  }

  function categoryIcon(categoryId, size = 20) {
    return icon(categoryIcons[categoryId] || 'briefcase', size);
  }


  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function countFilters(filters) { return Object.values(filters).reduce((total, values) => total + values.length, 0); }
  function loading(label) { return `<div class="loading-state"><span class="loading-ring"></span>${escapeHtml(label)}</div>`; }
  function emptyChart(label) { return `<div class="empty-chart">${icon('info', 20)}<span>${escapeHtml(label)}</span></div>`; }
  function errorCard(title, detail, action) { return `<section class="error-card">${icon('info')}<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div><button data-action="${action}">${icon('refresh', 17)} Réessayer</button></section>`; }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      ...options,
    });
    let data = {};
    try { data = await response.json(); } catch (_) { /* response invalid */ }
    if (!response.ok) throw new Error(data.error || 'La connexion au service LogPose a échoué.');
    return data;
  }

  function navItem(view, iconName, label, active, mobile = false) {
    const classes = mobile ? `bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}` : `side-nav__item ${active ? 'side-nav__item--active' : ''}`;
    return `<button class="${classes}" data-action="navigate" data-view="${view}">${icon(iconName)}<span>${label}</span></button>`;
  }

  function currentTitle() {
    return {
      dashboard: "Marché de l'emploi", catalogue: 'Catalogue des métiers', job: 'Fiche métier',
      orientation: 'Orientation guidée', establishments: 'Établissements', contests: 'Concours et annales', contest: 'Détail du concours',
    }[state.view] || 'LogPose';
  }

  function render() {
    const catalogActive = state.view === 'catalogue' || state.view === 'job';
    const contestActive = state.view === 'contests' || state.view === 'contest';
    app.innerHTML = `
      <aside class="sidebar">
        <button class="brand brand-button" data-action="navigate" data-view="dashboard" aria-label="LogPose, accueil"><span class="brand-mark"><span></span></span><span>log<span>pose</span></span></button>
        <nav class="side-nav" aria-label="Navigation principale">
          ${navItem('dashboard', 'grid', "Marché de l'emploi", state.view === 'dashboard')}
          ${navItem('catalogue', 'layers', 'Catalogue métiers', catalogActive)}
          ${navItem('orientation', 'compass', 'Orientation', state.view === 'orientation')}
          ${navItem('establishments', 'school', 'Établissements', state.view === 'establishments')}
          ${navItem('contests', 'file', 'Annales', contestActive)}
        </nav>
        <div class="sidebar__footer"><div class="sidebar__note">${icon('sparkle', 17)}<span>Construire son avenir, un choix à la fois.</span></div><span class="version">PHP · MySQL · MVP</span></div>
      </aside>
      <main id="top" class="main-content">
        <header class="topbar"><div class="mobile-brand"><span class="brand-mark"><span></span></span><strong>log<span>pose</span></strong></div><div class="topbar__context"><span class="status-dot"></span>${escapeHtml(currentTitle())} · données de démonstration</div><button class="profile-button" aria-label="Profil utilisateur"><span>LP</span>${icon('chevron', 16)}</button></header>
        ${content()}
      </main>
      <nav class="bottom-nav" aria-label="Navigation mobile">
        ${navItem('dashboard', 'grid', 'Marché', state.view === 'dashboard', true)}
        ${navItem('catalogue', 'layers', 'Métiers', catalogActive, true)}
        ${navItem('orientation', 'compass', 'Orienter', state.view === 'orientation', true)}
        ${navItem('establishments', 'school', 'Écoles', state.view === 'establishments', true)}
        ${navItem('contests', 'file', 'Annales', contestActive, true)}
      </nav>
      ${state.filtersOpen ? filterPanel() : ''}
      ${state.notice ? `<div class="demo-toast" role="status">${icon('info', 17)}<span>${escapeHtml(state.notice)}</span><button data-action="dismiss-notice" aria-label="Fermer">${icon('close', 15)}</button></div>` : ''}
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
    }
  }

  function content() {
    if (state.view === 'dashboard') return dashboardPage();
    if (state.view === 'catalogue') return catalogPage();
    if (state.view === 'job') return jobPage();
    if (state.view === 'orientation') return orientationPage();
    if (state.view === 'establishments') return establishmentsPage();
    if (state.view === 'contests') return contestsPage();
    return contestPage();
  }

  function dashboardPage() {
    const active = countFilters(state.filters);
    const filterSummary = active === 1 ? Object.values(state.filters).flat()[0] : `${active} filtres actifs`;
    let body = '';
    if (state.dashboardLoading) body = loading('Mise à jour du tableau de bord…');
    else if (state.dashboardError) body = errorCard('Impossible de charger les données.', state.dashboardError, 'reload-dashboard');
    else if (!state.dashboard) body = loading('Mise à jour du tableau de bord…');
    else body = dashboardResults(state.dashboard);
    return `
      <section id="marche" class="hero"><div><p class="eyebrow">Marché de l'emploi · République du Congo</p><h1>Voir plus loin.<br><em>Choisir juste.</em></h1><p class="hero__copy">Explorez les signaux du marché pour éclairer votre parcours d'orientation.</p></div><div class="hero-compass" aria-hidden="true"><div class="hero-compass__icon">${icon('compass', 54)}</div><i></i><b></b></div></section>
      <section class="dashboard-toolbar" aria-label="Paramètres du tableau de bord"><div class="period-control"><span class="period-control__label">Période analysée</span><div class="period-control__buttons"><button class="period-button period-button--active">2026</button><button class="period-button" disabled>2025</button></div></div><button class="filter-trigger" data-action="open-filters" ${state.filterOptions ? '' : 'disabled'}>${icon('sliders', 18)}<span>Filtrer</span>${active ? `<b>${active}</b>` : ''}</button></section>
      ${active ? `<div class="filter-summary"><span>${icon('sliders', 15)} ${escapeHtml(filterSummary)}</span><button data-action="clear-filters">Effacer</button></div>` : ''}
      ${body}`;
  }

  function dashboardResults(data) {
    const max = Math.max(...data.topJobs.map(job => job.value), 1);
    let cursor = 0;
    const segments = data.sectorDistribution.map((sector, index) => {
      const start = cursor; cursor += sector.percent;
      return `${sectorColors[index % sectorColors.length]} ${start}% ${cursor}%`;
    }).join(', ') || '#24443c 0 100%';
    const jobs = data.topJobs.length ? data.topJobs.map((job, index) => `
      <button class="job-row job-row--button" data-action="open-job" data-job="${escapeHtml(job.id)}"><span class="job-row__rank">0${index + 1}</span><span class="job-row__label"><span>${escapeHtml(job.name)}</span><span class="job-row__track"><i style="width:${(job.value / max) * 100}%"></i></span></span><b>${job.value}</b></button>`).join('') : emptyChart('Aucune donnée ne correspond à ces filtres.');
    const sectors = data.sectorDistribution.length ? `<div class="sector-content"><div class="donut" style="background:conic-gradient(${segments})"><div class="donut__inside"><strong>${data.sectorDistribution.length}</strong><span>secteurs</span></div></div><ul class="sector-legend">${data.sectorDistribution.map((sector, index) => `<li><i style="background-color:${sectorColors[index % sectorColors.length]}"></i><span>${escapeHtml(sector.name)}</span><b>${sector.percent}%</b></li>`).join('')}</ul></div>` : emptyChart('Aucune donnée ne correspond à ces filtres.');
    return `
      <section class="metrics-grid"><article class="metric-card"><div class="metric-card__top"><span>Opportunités recensées</span><span class="metric-card__icon">${icon('briefcase', 18)}</span></div><strong>${money.format(data.kpis.jobsCreated)}</strong><p>sur la période sélectionnée</p></article><article class="metric-card metric-card--accent"><div class="metric-card__top"><span>Évolution estimée</span><span class="metric-card__icon">${icon('arrow-up', 18)}</span></div><strong>+${data.kpis.variationPercent} %</strong><p class="positive">${icon('arrow-up', 14)}par rapport à la période précédente</p></article><article class="coverage-card"><span class="coverage-card__label">Périmètre filtré</span><strong>${data.totalRows}</strong><span>signaux emploi analysés</span><div class="coverage-card__line"><i></i></div></article></section>
      <section class="insight-banner"><div class="insight-banner__icon">${icon('sparkle', 19)}</div><p><strong>Le saviez-vous ?</strong> Les besoins observés évoluent selon la zone, le secteur et le type de contrat. Utilisez les filtres pour comparer votre contexte.</p></section>
      <section class="chart-grid"><article class="panel panel--sectors"><div class="panel__heading"><div><p class="eyebrow">Répartition</p><h2>Par secteur d'activité</h2></div><span class="panel-tag">2026</span></div>${sectors}</article><article class="panel panel--jobs"><div class="panel__heading"><div><p class="eyebrow">Métiers recherchés</p><h2>Top opportunités</h2></div><label class="top-select">Top <select data-input="limit">${[5, 8, 10].map(n => `<option value="${n}" ${state.limit === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div><div class="job-bars">${jobs}</div></article></section>
      <section class="panel companies-panel"><div class="panel__heading"><div><p class="eyebrow">Acteurs à suivre</p><h2>Entreprises qui recrutent</h2></div><span class="panel-tag panel-tag--gold">Top 5</span></div><div class="company-grid">${data.topCompanies.map((company, index) => `<article class="company-card"><span class="company-card__number">0${index + 1}</span><div><strong>${escapeHtml(company.name)}</strong><span>${company.value} opportunités</span></div>${icon('chevron', 18)}</article>`).join('')}</div></section>
      <footer class="data-footer">${icon('info', 16)}<span><strong>Données de démonstration.</strong> Mise à jour affichée : ${escapeHtml(data.metadata.lastUpdated)}. Les chiffres ne représentent pas des statistiques officielles.</span></footer>`;
  }

  function filterPanel() {
    if (!state.filterOptions) return '';
    const groups = [
      ['zones', 'Zone géographique', state.filterOptions.zones], ['sectors', "Secteur d'activité", state.filterOptions.sectors],
      ['companies', 'Entreprise', state.filterOptions.companies], ['employmentTypes', "Type d'emploi", state.filterOptions.employmentTypes],
    ];
    return `<div class="filter-layer"><button class="filter-backdrop" data-action="close-filters" aria-label="Fermer les filtres"></button><aside class="filter-panel"><div class="filter-panel__header"><div><span class="eyebrow">Affiner les résultats</span><h2>Filtres</h2></div><button class="icon-button" data-action="close-filters" aria-label="Fermer">${icon('close')}</button></div><div class="filter-panel__content">${groups.map(([key, label, values]) => `<section class="filter-group"><h3>${label}</h3><div class="filter-options">${values.map(value => `<button class="filter-chip ${state.draftFilters[key].includes(value) ? 'filter-chip--active' : ''}" data-action="toggle-filter" data-filter="${key}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join('')}</div></section>`).join('')}</div><div class="filter-panel__actions"><button class="text-button" data-action="reset-draft-filters">Réinitialiser</button><button class="primary-button" data-action="apply-filters">Appliquer les filtres ${icon('arrow-right', 16)}</button></div></aside></div>`;
  }

  function catalogPage() {
    if (state.catalogLoading) return `<section class="catalogue-page">${loading('Chargement des métiers…')}</section>`;
    if (state.catalogError) return `<section class="catalogue-page">${errorCard('Impossible de charger le catalogue.', state.catalogError, 'reload-catalog')}</section>`;
    if (!state.catalog) return `<section class="catalogue-page">${loading('Chargement des métiers…')}</section>`;
    const term = state.catalogSearch.trim().toLocaleLowerCase('fr');
    const jobs = term ? state.catalog.items.filter(job => `${job.name} ${job.description} ${job.sector}`.toLocaleLowerCase('fr').includes(term)) : state.catalog.items;
    return `<section class="catalogue-page"><header class="catalogue-hero"><div><p class="eyebrow">Explorer son avenir</p><h1>Des métiers à<br><em>votre mesure.</em></h1><p>Découvrez les univers professionnels, les compétences utiles et les parcours de formation associés.</p></div><div class="catalogue-hero__motif">${icon('layers', 42)}<span>${state.catalog.items.length}</span><small>métiers<br>à explorer</small></div></header><div class="catalogue-search">${icon('search', 19)}<input data-input="catalog-search" value="${escapeHtml(state.catalogSearch)}" placeholder="Rechercher un métier, un secteur…" aria-label="Rechercher un métier ou un secteur">${state.catalogSearch ? `<button data-action="clear-catalog-search" aria-label="Effacer">${icon('close', 16)}</button>` : ''}</div><div class="catalogue-context"><span>${icon('layers', 15)} Catalogue de démonstration</span><span>${jobs.length} métier${jobs.length !== 1 ? 's' : ''} trouvé${jobs.length !== 1 ? 's' : ''}</span></div>${term ? jobCards(jobs) : `<div class="category-list">${state.catalog.categories.map(category => categoryAccordion(category)).join('')}</div>`}<footer class="data-footer catalogue-footer">${icon('info', 16)}<span><strong>Référentiel de démonstration.</strong> Les descriptions et parcours devront être validés avec les établissements et professionnels référents.</span></footer></section>`;
  }

  function categoryAccordion(category) {
    const isOpen = state.openCategory === category.id;
    const jobs = state.catalog.items.filter(job => job.categoryId === category.id);
    return `<section class="category-accordion ${isOpen ? 'category-accordion--open' : ''}"><button class="category-accordion__header" data-action="toggle-category" data-category="${category.id}" aria-expanded="${isOpen}"><span class="category-symbol">${categoryIcon(category.id, 22)}</span><span class="category-accordion__copy"><strong>${escapeHtml(category.name)}</strong><small>${escapeHtml(category.description)}</small></span><span class="category-count">${category.jobCount}</span>${icon('chevron', 19)}</button>${isOpen ? `<div class="category-accordion__body">${jobCards(jobs)}</div>` : ''}</section>`;
  }

  function jobCards(jobs) {
    if (!jobs.length) return `<div class="catalogue-empty">${icon('search', 25)}<strong>Aucun métier trouvé</strong><span>Essayez un autre mot-clé ou explorez une catégorie.</span></div>`;
    return `<div class="job-card-grid">${jobs.map(job => `<button class="job-card" data-action="open-job" data-job="${escapeHtml(job.id)}"><span class="job-card__symbol">${categoryIcon(job.categoryId, 16)}</span><span class="job-card__content"><small>${escapeHtml(job.sector)}</small><strong>${escapeHtml(job.name)}</strong><span>${escapeHtml(job.description)}</span></span>${icon('chevron', 19)}</button>`).join('')}</div>`;
  }

  function jobPage() {
    if (state.jobLoading) return loading('Chargement de la fiche métier…');
    if (state.jobError) return `<section class="error-card job-error">${icon('info')}<div><strong>Impossible de charger cette fiche.</strong><span>${escapeHtml(state.jobError)}</span></div><button data-action="navigate" data-view="catalogue">Retour au catalogue</button></section>`;
    if (!state.selectedJob) return loading('Chargement de la fiche métier…');
    const job = state.selectedJob;
    return `<section class="job-page"><button class="back-button" data-action="navigate" data-view="catalogue">${icon('arrow-left', 18)} Retour au catalogue</button><header class="job-hero"><div class="job-hero__symbol">${categoryIcon(job.categoryId, 43)}</div><div><p class="eyebrow">${escapeHtml(job.category)} · ${escapeHtml(job.sector)}</p><h1>${escapeHtml(job.name)}</h1><p>${escapeHtml(job.description)}</p></div><div class="job-hero__profile">${icon('target', 19)}<span>Pour vous si vous…</span><strong>${escapeHtml(job.profile)}</strong></div></header><div class="job-content-grid"><article class="job-content-card job-content-card--mission"><p class="eyebrow">Le rôle</p><h2>Ce que fait ce métier</h2><p>${escapeHtml(job.mission)}</p></article><article class="job-content-card"><p class="eyebrow">Compétences clés</p><h2>Ce qu'il faut développer</h2><div class="skill-list">${job.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join('')}</div></article></div><section class="job-content-card trainings-card"><div class="panel__heading"><div><p class="eyebrow">Parcours possibles</p><h2>Formations associées</h2></div><span class="panel-tag panel-tag--gold">À vérifier</span></div><div class="training-list">${job.trainings.map(training => `<article class="training-row"><span class="training-row__mark">${icon('school', 18)}</span><div><strong>${escapeHtml(training.name)}</strong><span>${escapeHtml(training.format)}</span></div><b>${escapeHtml(training.level)}</b></article>`).join('')}</div></section><section class="job-content-card companies-detail"><p class="eyebrow">Écosystème</p><h2>Organisations associées</h2><p>Exemples indicatifs à confirmer avec les employeurs et les référentiels sectoriels.</p><div class="company-chip-list">${job.companies.map(company => `<span>${icon('briefcase', 14)}${escapeHtml(company)}</span>`).join('')}</div></section><section class="job-action"><div><span class="job-action__icon">${icon('briefcase', 20)}</span><div><strong>Envie d'aller plus loin ?</strong><span>Les offres liées seront disponibles lorsque les sources partenaires auront été intégrées.</span></div></div><button class="primary-button" data-action="notice" data-message="Les offres liées arriveront avec l’intégration des sources partenaires.">Voir les offres liées ${icon('arrow-right', 16)}</button></section></section>`;
  }

  function orientationPage() {
    const o = state.orientation;
    if (o.loading && !o.question && !o.results) return loading('Préparation de votre parcours d’orientation…');
    if (o.error && !o.question && !o.results) return `<section class="error-card orientation-error">${icon('info')}<div><strong>Impossible de démarrer l’orientation.</strong><span>${escapeHtml(o.error)}</span></div><button data-action="restart-orientation">${icon('refresh', 17)} Réessayer</button></section>`;
    if (o.results) return orientationResults(o.results);
    if (!o.question) return loading('Analyse de vos réponses…');
    const question = o.question;
    return `<section class="orientation-page"><header class="orientation-hero"><div><p class="eyebrow">Orientation guidée · moteur de règles</p><h1>Commençons par<br><em>vous écouter.</em></h1><p>Chaque question s’adapte à vos réponses précédentes pour affiner les pistes proposées.</p></div><div class="orientation-orbit">${icon('compass', 45)}<i></i><b></b></div></header><section class="orientation-card"><div class="orientation-card__head"><div><span class="eyebrow">${escapeHtml(question.eyebrow)}</span><span class="question-count">Question ${question.step} / ${question.total}</span></div><button class="orientation-restart" data-action="restart-orientation">${icon('refresh', 15)} Recommencer</button></div><div class="progress-track"><i style="width:${((question.step - 1) / question.total) * 100}%"></i></div><div class="question-content"><h2>${escapeHtml(question.prompt)}</h2><p>${escapeHtml(question.helper)}</p><div class="answer-list">${question.options.map((option, index) => `<button class="answer-card" data-action="orientation-answer" data-answer="${escapeHtml(option.value)}" ${o.submitting ? 'disabled' : ''}><span class="answer-card__index">0${index + 1}</span><span class="answer-card__copy"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.description)}</small></span>${icon('chevron', 19)}</button>`).join('')}</div></div>${o.error ? `<div class="orientation-inline-error">${icon('info', 16)}${escapeHtml(o.error)}</div>` : ''}</section>${answerHistory(o.history)}<footer class="data-footer orientation-footer">${icon('info', 16)}<span><strong>Vos choix restent sur la session de démonstration.</strong> Aucun nom, numéro ou résultat scolaire n’est demandé dans ce parcours.</span></footer></section>`;
  }

  function answerHistory(history) {
    if (!history.length) return '';
    return `<section class="answer-history"><p class="eyebrow">Vos réponses</p><div>${history.map(item => `<span><small>${escapeHtml(item.question)}</small><b>${escapeHtml(item.answer)}</b></span>`).join('')}</div></section>`;
  }

  function orientationResults(data) {
    return `<section class="orientation-page orientation-results-page"><header class="orientation-results-hero"><div><span class="result-check">${icon('check', 18)}</span><p class="eyebrow">Parcours complété</p><h1>Voici vos premières<br><em>pistes.</em></h1><p>Ces recommandations expliquent le lien entre vos réponses et les parcours disponibles dans le référentiel de démonstration.</p></div><button class="outline-button" data-action="restart-orientation">${icon('refresh', 15)} Refaire le parcours</button></header><section class="profile-summary"><div class="profile-summary__head">${icon('target', 19)}<div><p class="eyebrow">Votre profil résumé</p><strong>5 critères pris en compte</strong></div></div><div class="profile-summary__items">${data.profile.map(item => `<span><small>${escapeHtml(item.label)}</small><b>${escapeHtml(item.value)}</b></span>`).join('')}</div></section><section class="recommendations-section"><div class="recommendations-section__head"><div><p class="eyebrow">Pistes prioritaires</p><h2>Des métiers et parcours à explorer</h2></div><span>Indice indicatif</span></div><div class="recommendation-list">${data.recommendations.map(recommendation => recommendationCard(recommendation)).join('')}</div></section><section class="orientation-notice">${icon('info', 19)}<p><strong>Comment lire ce résultat ?</strong> Le pourcentage est un indice de compatibilité issu de règles simples et visibles : série, univers d’intérêt, activité préférée, zone et durée de formation. Il ne constitue ni une admission ni une garantie d’emploi.</p></section>${answerHistory(state.orientation.history)}</section>`;
  }

  function recommendationCard(item) {
    const pathway = item.pathway ? `<div class="pathway-box">${icon('school', 17)}<div><small>Parcours à explorer au Congo</small><strong>${escapeHtml(item.pathway.program)} · ${escapeHtml(item.pathway.establishment)}</strong><span>${escapeHtml(item.pathway.city)} · ${escapeHtml(item.pathway.duration)}</span></div></div>` : `<div class="pathway-box pathway-box--empty">${icon('info', 17)}<span>Parcours à compléter dans le référentiel.</span></div>`;
    return `<article class="recommendation-card"><div class="recommendation-rank">0${item.rank}</div><div class="recommendation-main"><div class="recommendation-main__title"><span>${escapeHtml(item.category)}</span><h3>${escapeHtml(item.job)}</h3></div><p>${escapeHtml(item.reason)}</p>${pathway}</div><div class="recommendation-score"><strong>${item.score}<small>%</small></strong><span>compatibilité</span><button class="outline-button" data-action="open-job" data-job="${escapeHtml(item.jobId)}">Voir le métier ${icon('chevron', 15)}</button></div></article>`;
  }

  function selectField(name, label, values, selected) {
    return `<label class="select-field"><span>${label}</span><select data-input="${name}"><option value="">Tous</option>${values.map(value => `<option value="${escapeHtml(value)}" ${selected === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}</select></label>`;
  }

  function establishmentsPage() {
    const d = state.education;
    if (d.loading && !d.results) return `<section class="directory-page">${loading('Recherche des formations…')}</section>`;
    const options = d.options || { series: [], fields: [], jobs: [] };
    let results = '';
    if (d.error) results = errorCard('Impossible de charger les établissements.', d.error, 'reload-establishments');
    else if (d.results && !d.results.items.length) results = directoryEmpty('Aucun parcours ne correspond à ces filtres.');
    else if (d.results) results = `<div class="establishment-list">${d.results.items.map(establishmentCard).join('')}</div>`;
    return `<section class="directory-page"><header class="directory-hero"><div><p class="eyebrow">Parcours de formation</p><h1>Trouver le bon<br><em>point de départ.</em></h1><p>Recherchez des parcours selon votre série du baccalauréat, la filière envisagée ou le métier qui vous attire.</p></div><div class="directory-hero__shape">${icon('school', 42)}<span>${icon('arrow-up-right', 28)}</span></div></header><section class="directory-filters"><div class="directory-filters__top"><div><p class="eyebrow">Affiner la recherche</p><h2>Établissements et formations</h2></div><button class="text-button" data-action="reset-education">Réinitialiser</button></div><div class="select-grid">${selectField('education-series', 'Série du baccalauréat', options.series, d.filters.series)}${selectField('education-field', 'Filière de formation', options.fields, d.filters.field)}${selectField('education-job', 'Métier visé', options.jobs, d.filters.job)}</div></section><div class="directory-result-label"><span>${icon('school', 15)} Référentiel de démonstration</span><span>${d.results ? d.results.items.length : 0} parcours trouvé${d.results && d.results.items.length !== 1 ? 's' : ''}</span></div>${results}<footer class="data-footer directory-footer">${icon('info', 16)}<span><strong>Données de démonstration.</strong> Les formations, conditions d’admission, frais et coordonnées doivent être vérifiés directement auprès de chaque établissement.</span></footer></section>`;
  }

  function establishmentCard(item) {
    return `<article class="establishment-card"><div class="establishment-card__badge">${escapeHtml(item.establishment.slice(0, 2).toUpperCase())}</div><div class="establishment-card__content"><div class="establishment-card__title"><div><p>${escapeHtml(item.field)}</p><h3>${escapeHtml(item.establishment)}</h3></div><span>${escapeHtml(item.city)}</span></div><strong>${escapeHtml(item.program)}</strong><div class="establishment-card__meta"><span>${escapeHtml(item.duration)}</span><i></i><span>${item.series.map(escapeHtml).join(' · ')}</span></div><div class="job-pill-list">${item.jobs.map(job => `<span>${escapeHtml(job)}</span>`).join('')}</div></div><button class="outline-button" data-action="notice" data-message="La fiche établissement complète sera ajoutée dans une prochaine itération.">Voir le parcours ${icon('chevron', 16)}</button></article>`;
  }

  function directoryEmpty(label) { return `<div class="catalogue-empty directory-empty">${icon('search', 25)}<strong>Aucun résultat</strong><span>${escapeHtml(label)}</span></div>`; }

  function contestsPage() {
    const d = state.contests;
    if (d.loading && !d.results) return `<section class="directory-page">${loading('Recherche des concours…')}</section>`;
    const options = d.options || { series: [], fields: [] };
    let results = '';
    if (d.error) results = errorCard('Impossible de charger les concours.', d.error, 'reload-contests');
    else if (d.results && !d.results.items.length) results = directoryEmpty('Aucun concours ne correspond à ces filtres.');
    else if (d.results) results = `<div class="contest-list">${d.results.items.map(contestCard).join('')}</div>`;
    return `<section class="directory-page contests-page"><header class="directory-hero contest-hero"><div><p class="eyebrow">Préparer sa candidature</p><h1>Les concours,<br><em>sans détour.</em></h1><p>Filtrez les concours par série et filière, puis retrouvez les références d'annales disponibles.</p></div><div class="directory-hero__shape">${icon('file-check', 42)}<span>${icon('file', 28)}</span></div></header><section class="directory-filters contest-filters"><div class="directory-filters__top"><div><p class="eyebrow">Votre recherche</p><h2>Concours et annales</h2></div><button class="text-button" data-action="reset-contests">Réinitialiser</button></div><div class="select-grid select-grid--two">${selectField('contest-series', 'Série du baccalauréat', options.series, d.filters.series)}${selectField('contest-field', 'Filière de formation', options.fields, d.filters.field)}</div></section><div class="directory-result-label"><span>${icon('file', 15)} Référentiel de démonstration</span><span>${d.results ? d.results.items.length : 0} concours trouvé${d.results && d.results.items.length !== 1 ? 's' : ''}</span></div>${results}<footer class="data-footer directory-footer">${icon('info', 16)}<span><strong>Référentiel de démonstration.</strong> Les calendriers, modalités et documents doivent être confirmés avec les organismes organisateurs.</span></footer></section>`;
  }

  function contestCard(contest) {
    return `<button class="contest-card" data-action="open-contest" data-contest="${escapeHtml(contest.id)}"><span class="contest-card__year">2026</span><div><p>${escapeHtml(contest.field)} · ${escapeHtml(contest.city)}</p><h3>${escapeHtml(contest.name)}</h3><span>${escapeHtml(contest.organizer)}</span><small>${escapeHtml(contest.description)}</small></div><span class="contest-card__papers">${icon('file', 16)}${contest.paperCount} annales</span>${icon('chevron', 20)}</button>`;
  }

  function contestPage() {
    if (state.contestLoading) return loading('Chargement des annales…');
    if (state.contestError) return `<section class="error-card job-error">${icon('info')}<div><strong>Impossible de charger les annales.</strong><span>${escapeHtml(state.contestError)}</span></div><button data-action="navigate" data-view="contests">Retour aux concours</button></section>`;
    if (!state.selectedContest) return loading('Chargement des annales…');
    const data = state.selectedContest;
    return `<section class="contest-detail-page"><button class="back-button" data-action="navigate" data-view="contests">${icon('arrow-left', 18)} Retour aux concours</button><header class="contest-detail-hero"><div class="contest-detail-hero__icon">${icon('file', 35)}</div><div><p class="eyebrow">${escapeHtml(data.contest.field)} · ${escapeHtml(data.contest.city)}</p><h1>${escapeHtml(data.contest.name)}</h1><p>${escapeHtml(data.contest.organizer)} · ${data.contest.series.map(escapeHtml).join(' · ')}</p></div><span class="panel-tag panel-tag--gold">${data.papers.length} références</span></header><section class="annals-intro">${icon('info', 19)}<p><strong>Références d'annales de démonstration.</strong> Les aperçus et téléchargements seront activés après vérification des droits de diffusion et ajout des fichiers sources.</p></section><section class="annals-list"><div class="annals-list__header"><p class="eyebrow">Épreuves disponibles</p><span>Format indicatif</span></div>${data.papers.map(paper => `<article class="paper-row"><span class="paper-row__file">${icon('file', 21)}</span><div class="paper-row__content"><strong>${escapeHtml(paper.label)}</strong><span>${paper.year} · ${escapeHtml(paper.type)} · ${paper.pages} pages</span></div><div class="paper-row__actions"><button data-action="notice" data-message="L’aperçu de « ${escapeHtml(paper.label)} ${paper.year} » sera disponible après ajout du document source.">Aperçu</button><button class="paper-download" data-action="notice" data-message="Le téléchargement de « ${escapeHtml(paper.label)} ${paper.year} » n’est pas encore disponible.">Télécharger</button></div></article>`).join('')}</section><footer class="data-footer directory-footer">${icon('info', 16)}<span><strong>Avant publication :</strong> LogPose devra obtenir ou vérifier les droits de diffusion de chaque sujet et corrigé.</span></footer></section>`;
  }

  async function loadDashboard() {
    state.dashboardLoading = true; state.dashboardError = null; render();
    try {
      const query = new URLSearchParams({ period: '2026', limit: String(state.limit) });
      Object.entries(state.filters).forEach(([key, values]) => { if (values.length) query.set(key, values.join(',')); });
      state.dashboard = await api(`/api/dashboard?${query}`);
    } catch (error) { state.dashboardError = error.message; }
    state.dashboardLoading = false; render();
  }

  async function loadFilterOptions() {
    if (state.filterOptions) return;
    try { state.filterOptions = await api('/api/filter-options'); } catch (error) { state.dashboardError = error.message; }
    render();
  }

  async function loadCatalog() {
    state.catalogLoading = true; state.catalogError = null; render();
    try { state.catalog = await api('/api/metiers'); state.openCategory = state.catalog.categories[0]?.id || null; } catch (error) { state.catalogError = error.message; }
    state.catalogLoading = false; render();
  }

  async function openJob(slug) {
    state.view = 'job'; state.selectedJob = null; state.jobLoading = true; state.jobError = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    try { state.selectedJob = (await api(`/api/metiers/${encodeURIComponent(slug)}`)).item; } catch (error) { state.jobError = error.message; }
    state.jobLoading = false; render();
  }

  async function loadEducation() {
    state.education.loading = true; state.education.error = null; render();
    try {
      const query = new URLSearchParams();
      if (state.education.filters.series) query.set('series', state.education.filters.series);
      if (state.education.filters.field) query.set('fields', state.education.filters.field);
      if (state.education.filters.job) query.set('jobs', state.education.filters.job);
      const [options, results] = await Promise.all([api('/api/etablissements/options'), api(`/api/etablissements${query.toString() ? `?${query}` : ''}`)]);
      state.education.options = options; state.education.results = results;
    } catch (error) { state.education.error = error.message; }
    state.education.loading = false; render();
  }

  async function loadContests() {
    state.contests.loading = true; state.contests.error = null; render();
    try {
      const query = new URLSearchParams();
      if (state.contests.filters.series) query.set('series', state.contests.filters.series);
      if (state.contests.filters.field) query.set('fields', state.contests.filters.field);
      const [options, results] = await Promise.all([api('/api/concours/options'), api(`/api/concours${query.toString() ? `?${query}` : ''}`)]);
      state.contests.options = options; state.contests.results = results;
    } catch (error) { state.contests.error = error.message; }
    state.contests.loading = false; render();
  }

  async function openContest(slug) {
    state.view = 'contest'; state.selectedContest = null; state.contestLoading = true; state.contestError = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    try { state.selectedContest = await api(`/api/concours/${encodeURIComponent(slug)}/annales`); } catch (error) { state.contestError = error.message; }
    state.contestLoading = false; render();
  }

  async function startOrientation() {
    state.orientation = { sessionId: null, question: null, history: [], results: null, loading: true, submitting: false, error: null }; render();
    try {
      const session = await api('/api/orientation/sessions', { method: 'POST' });
      state.orientation.sessionId = session.sessionId; state.orientation.question = session.question;
    } catch (error) { state.orientation.error = error.message; }
    state.orientation.loading = false; render();
  }

  async function answerOrientation(answer) {
    const o = state.orientation;
    if (!o.sessionId || !o.question || o.submitting) return;
    const selected = o.question.options.find(option => option.value === answer);
    if (!selected) return;
    o.submitting = true; o.error = null; render();
    try {
      const result = await api(`/api/orientation/sessions/${encodeURIComponent(o.sessionId)}/answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: o.question.id, answer }) });
      o.history.push({ question: o.question.prompt, answer: selected.label });
      if (result.completed) { o.question = null; o.results = await api(`/api/orientation/sessions/${encodeURIComponent(o.sessionId)}/recommandations`); }
      else o.question = result.question;
    } catch (error) { o.error = error.message; }
    o.submitting = false; render();
  }

  function navigate(view) {
    state.view = view; state.notice = null; window.scrollTo({ top: 0, behavior: 'smooth' }); render();
    if (view === 'dashboard' && !state.dashboard) loadDashboard();
    if (view === 'catalogue' && !state.catalog && !state.catalogLoading) loadCatalog();
    if (view === 'orientation') startOrientation();
    if (view === 'establishments') loadEducation();
    if (view === 'contests') loadContests();
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'navigate') navigate(target.dataset.view);
    if (action === 'open-filters') { state.draftFilters = clone(state.filters); state.filtersOpen = true; loadFilterOptions(); render(); }
    if (action === 'close-filters') { state.filtersOpen = false; render(); }
    if (action === 'toggle-filter') { const key = target.dataset.filter; const value = target.dataset.value; const list = state.draftFilters[key]; state.draftFilters[key] = list.includes(value) ? list.filter(item => item !== value) : [...list, value]; render(); }
    if (action === 'reset-draft-filters') { state.draftFilters = emptyFilters(); render(); }
    if (action === 'apply-filters') { state.filters = clone(state.draftFilters); state.filtersOpen = false; loadDashboard(); }
    if (action === 'clear-filters') { state.filters = emptyFilters(); loadDashboard(); }
    if (action === 'reload-dashboard') loadDashboard();
    if (action === 'reload-catalog') loadCatalog();
    if (action === 'toggle-category') { state.openCategory = state.openCategory === target.dataset.category ? null : target.dataset.category; render(); }
    if (action === 'clear-catalog-search') { state.catalogSearch = ''; render(); }
    if (action === 'open-job') openJob(target.dataset.job);
    if (action === 'restart-orientation') startOrientation();
    if (action === 'orientation-answer') answerOrientation(target.dataset.answer);
    if (action === 'reset-education') { state.education.filters = { series: '', field: '', job: '' }; loadEducation(); }
    if (action === 'reload-establishments') loadEducation();
    if (action === 'reset-contests') { state.contests.filters = { series: '', field: '' }; loadContests(); }
    if (action === 'reload-contests') loadContests();
    if (action === 'open-contest') openContest(target.dataset.contest);
    if (action === 'notice') { state.notice = target.dataset.message; render(); }
    if (action === 'dismiss-notice') { state.notice = null; render(); }
  });

  document.addEventListener('input', event => {
    const input = event.target;
    if (input.dataset.input === 'catalog-search') {
      const cursor = input.selectionStart;
      state.catalogSearch = input.value;
      render();
      const next = document.querySelector('[data-input="catalog-search"]');
      if (next) {
        next.focus();
        next.setSelectionRange(cursor, cursor);
      }
    }
  });

  document.addEventListener('change', event => {
    const input = event.target;
    if (input.dataset.input === 'limit') { state.limit = Number(input.value); loadDashboard(); }
    if (input.dataset.input === 'education-series') { state.education.filters.series = input.value; loadEducation(); }
    if (input.dataset.input === 'education-field') { state.education.filters.field = input.value; loadEducation(); }
    if (input.dataset.input === 'education-job') { state.education.filters.job = input.value; loadEducation(); }
    if (input.dataset.input === 'contest-series') { state.contests.filters.series = input.value; loadContests(); }
    if (input.dataset.input === 'contest-field') { state.contests.filters.field = input.value; loadContests(); }
  });

  render();
  loadDashboard();
  loadFilterOptions();
})();
