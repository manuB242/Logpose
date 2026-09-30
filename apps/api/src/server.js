const http = require('node:http');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 8787);

/**
 * Jeu de données temporaire pour le prototype.
 * À remplacer par des sources documentées et contractualisées avant production.
 */
const opportunities = [
  { job: 'Développeur Fullstack', sector: 'Numérique', zone: 'Brazzaville', company: 'Congo Digital', employmentType: 'CDI', jobs: 142, variation: 18 },
  { job: 'Data Analyst', sector: 'Numérique', zone: 'Brazzaville', company: 'Airtel Congo', employmentType: 'CDI', jobs: 97, variation: 11 },
  { job: 'Digital Marketer', sector: 'Numérique', zone: 'Pointe-Noire', company: 'MTN Congo', employmentType: 'CDD', jobs: 76, variation: 9 },
  { job: 'Chef de chantier', sector: 'BTP', zone: 'Brazzaville', company: 'SOREMI', employmentType: 'CDI', jobs: 128, variation: 7 },
  { job: 'Technicien électricien', sector: 'BTP', zone: 'Pointe-Noire', company: 'E2C', employmentType: 'CDD', jobs: 115, variation: 6 },
  { job: 'Conducteur de travaux', sector: 'BTP', zone: 'Dolisie', company: 'SOREMI', employmentType: 'CDI', jobs: 84, variation: 4 },
  { job: 'Infirmier diplômé d’État', sector: 'Santé', zone: 'Brazzaville', company: 'Clinique Santé Plus', employmentType: 'CDI', jobs: 136, variation: 14 },
  { job: 'Laborantin', sector: 'Santé', zone: 'Pointe-Noire', company: 'Hôpital Loandjili', employmentType: 'Stage', jobs: 61, variation: 5 },
  { job: 'Aide-soignant', sector: 'Santé', zone: 'Brazzaville', company: 'Clinique Santé Plus', employmentType: 'CDD', jobs: 88, variation: 8 },
  { job: 'Agent commercial', sector: 'Commerce', zone: 'Brazzaville', company: 'CFAO Congo', employmentType: 'CDI', jobs: 121, variation: 10 },
  { job: 'Responsable logistique', sector: 'Commerce', zone: 'Pointe-Noire', company: 'CFAO Congo', employmentType: 'CDI', jobs: 93, variation: 12 },
  { job: 'Conseiller clientèle', sector: 'Finance', zone: 'Brazzaville', company: 'BGFI Bank', employmentType: 'CDI', jobs: 102, variation: 8 },
  { job: 'Assistant comptable', sector: 'Finance', zone: 'Pointe-Noire', company: 'BGFI Bank', employmentType: 'Stage', jobs: 65, variation: 6 },
  { job: 'Technicien environnement', sector: 'Environnement', zone: 'Ouesso', company: 'CIB Olam', employmentType: 'CDI', jobs: 72, variation: 15 },
  { job: 'Animateur agricole', sector: 'Agriculture', zone: 'Nkayi', company: 'Agri Congo', employmentType: 'Alternance', jobs: 59, variation: 13 },
  { job: 'Mécanicien industriel', sector: 'Industrie', zone: 'Pointe-Noire', company: 'Pointe-Noire Industrie', employmentType: 'CDI', jobs: 109, variation: 9 }
];

const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'fr'));
const parseList = (value) => (value ? value.split(',').map(decodeURIComponent).filter(Boolean) : []);
const inFilter = (value, selected) => selected.length === 0 || selected.includes(value);
const sum = (rows) => rows.reduce((total, row) => total + row.jobs, 0);

function aggregateBy(rows, property, label) {
  const values = new Map();
  rows.forEach((row) => values.set(row[property], (values.get(row[property]) || 0) + row.jobs));
  return [...values.entries()]
    .map(([name, value]) => ({ [label]: name, value }))
    .sort((a, b) => b.value - a.value);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function getDashboard(searchParams) {
  const zones = parseList(searchParams.get('zones'));
  const sectors = parseList(searchParams.get('sectors'));
  const companies = parseList(searchParams.get('companies'));
  const employmentTypes = parseList(searchParams.get('employmentTypes'));
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 5, 1), 10);

  const rows = opportunities.filter((item) =>
    inFilter(item.zone, zones) &&
    inFilter(item.sector, sectors) &&
    inFilter(item.company, companies) &&
    inFilter(item.employmentType, employmentTypes)
  );

  const jobsCreated = sum(rows);
  const weightedVariation = jobsCreated === 0
    ? 0
    : Math.round(rows.reduce((total, row) => total + row.jobs * row.variation, 0) / jobsCreated);
  const sectorDistribution = aggregateBy(rows, 'sector', 'name').map((item) => ({
    ...item,
    percent: jobsCreated === 0 ? 0 : Math.round((item.value / jobsCreated) * 100)
  }));

  return {
    metadata: {
      period: searchParams.get('period') || '2026',
      lastUpdated: '27 septembre 2026',
      dataStatus: 'demonstration',
      source: 'Jeu de données fictif LogPose — ne pas utiliser comme statistique officielle.'
    },
    appliedFilters: { zones, sectors, companies, employmentTypes },
    kpis: { jobsCreated, variationPercent: weightedVariation },
    sectorDistribution,
    topJobs: aggregateBy(rows, 'job', 'name').slice(0, limit),
    topCompanies: aggregateBy(rows, 'company', 'name').slice(0, 5),
    totalRows: rows.length
  };
}

function requestHandler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/api/filter-options') {
    return sendJson(res, 200, {
      zones: unique(opportunities.map((item) => item.zone)),
      sectors: unique(opportunities.map((item) => item.sector)),
      companies: unique(opportunities.map((item) => item.company)),
      employmentTypes: unique(opportunities.map((item) => item.employmentType))
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    return sendJson(res, 200, getDashboard(url.searchParams));
  }

  return sendJson(res, 404, { error: 'Route introuvable.' });
}

const server = http.createServer(requestHandler);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API LogPose disponible sur http://0.0.0.0:${PORT}`);
});
