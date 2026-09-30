<?php

declare(strict_types=1);

namespace LogPose;

use PDO;
use PDOException;

/**
 * API REST LogPose en PHP natif.
 *
 * Les contrôleurs restent volontairement regroupés dans cette classe pour
 * conserver un projet sans framework ni couche magique. Toutes les requêtes
 * utilisent PDO et des paramètres préparés.
 */
final class Api
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function dispatch(Request $request): void
    {
        $method = $request->method;
        $path = rtrim($request->path, '/') ?: '/';

        if ($method === 'GET' && $path === '/api/health') {
            $this->pdo->query('SELECT 1');
            Response::json(['status' => 'ok', 'driver' => 'mysql']);
        }

        if ($method === 'GET' && $path === '/api/filter-options') {
            Response::json($this->filterOptions());
        }

        if ($method === 'GET' && $path === '/api/dashboard') {
            Response::json($this->dashboard($request));
        }

        if ($method === 'GET' && $path === '/api/metiers') {
            Response::json($this->catalog($request));
        }

        if ($method === 'GET' && preg_match('#^/api/metiers/([^/]+)$#', $path, $matches) === 1) {
            Response::json($this->job(rawurldecode($matches[1])));
        }

        if ($method === 'GET' && $path === '/api/etablissements/options') {
            Response::json($this->educationOptions());
        }

        if ($method === 'GET' && $path === '/api/etablissements') {
            Response::json($this->establishments($request));
        }

        if ($method === 'GET' && $path === '/api/concours/options') {
            Response::json($this->contestOptions());
        }

        if ($method === 'GET' && $path === '/api/concours') {
            Response::json($this->contests($request));
        }

        if ($method === 'GET' && preg_match('#^/api/concours/([^/]+)/annales$#', $path, $matches) === 1) {
            Response::json($this->contestPapers(rawurldecode($matches[1])));
        }

        if ($method === 'GET' && preg_match('#^/api/annales/([^/]+)/telechargement$#', $path) === 1) {
            Response::json([
                'error' => 'Aucun fichier n’est disponible pour cette référence de démonstration.',
                'code' => 'DEMO_FILE_UNAVAILABLE',
            ], 409);
        }

        if ($method === 'POST' && $path === '/api/orientation/sessions') {
            Response::json($this->createOrientationSession(), 201);
        }

        if ($method === 'POST' && preg_match('#^/api/orientation/sessions/([^/]+)/answers$#', $path, $matches) === 1) {
            Response::json($this->answerOrientation(rawurldecode($matches[1]), $request));
        }

        if ($method === 'GET' && preg_match('#^/api/orientation/sessions/([^/]+)/recommandations$#', $path, $matches) === 1) {
            Response::json($this->orientationRecommendations(rawurldecode($matches[1])));
        }

        throw new ApiException('Route introuvable.', 404);
    }

    /** @return array{dataStatus:string,source:string} */
    private function metadata(string $source): array
    {
        return ['dataStatus' => 'demonstration', 'source' => $source];
    }

    /** @param array<string, mixed> $params @return list<array<string, mixed>> */
    private function all(string $sql, array $params = []): array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    /** @param array<string, mixed> $params @return array<string, mixed>|false */
    private function one(string $sql, array $params = []): array|false
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetch();
    }

    /** @param list<string> $values @param array<string, mixed> $params */
    private function placeholders(string $prefix, array $values, array &$params): string
    {
        $keys = [];
        foreach (array_values($values) as $index => $value) {
            $key = ':' . $prefix . $index;
            $keys[] = $key;
            $params[$key] = $value;
        }

        return implode(', ', $keys);
    }

    /** @return array{zones:list<string>,sectors:list<string>,companies:list<string>,employmentTypes:list<string>} */
    private function filterOptions(): array
    {
        return [
            'zones' => array_column($this->all('SELECT name FROM zones ORDER BY name'), 'name'),
            'sectors' => array_column($this->all('SELECT name FROM sectors ORDER BY name'), 'name'),
            'companies' => array_column($this->all('SELECT name FROM companies ORDER BY name'), 'name'),
            'employmentTypes' => array_column($this->all('SELECT DISTINCT employment_type AS name FROM employment_records ORDER BY name'), 'name'),
        ];
    }

    /** @param list<string> $values @param array<string, mixed> $params @param list<string> $where */
    private function addInFilter(array $values, string $column, string $prefix, array &$params, array &$where): void
    {
        if ($values === []) {
            return;
        }

        $where[] = $column . ' IN (' . $this->placeholders($prefix, $values, $params) . ')';
    }

    /** @return array<string, mixed> */
    private function dashboard(Request $request): array
    {
        $params = [':period' => (string) ($request->query['period'] ?? '2026')];
        $where = ['er.period = :period'];
        $this->addInFilter($request->list('zones'), 'z.name', 'zone', $params, $where);
        $this->addInFilter($request->list('sectors'), 's.name', 'sector', $params, $where);
        $this->addInFilter($request->list('companies'), 'c.name', 'company', $params, $where);
        $this->addInFilter($request->list('employmentTypes'), 'er.employment_type', 'type', $params, $where);
        $whereSql = implode(' AND ', $where);
        $fromSql = ' FROM employment_records er
            INNER JOIN jobs j ON j.id = er.job_id
            INNER JOIN sectors s ON s.id = er.sector_id
            INNER JOIN zones z ON z.id = er.zone_id
            INNER JOIN companies c ON c.id = er.company_id
            WHERE ' . $whereSql;

        $kpis = $this->one('SELECT
                COALESCE(SUM(er.job_count), 0) AS jobs_created,
                COALESCE(ROUND(SUM(er.job_count * er.variation_percent) / NULLIF(SUM(er.job_count), 0)), 0) AS variation
            ' . $fromSql, $params);
        $jobsCreated = (int) ($kpis['jobs_created'] ?? 0);
        $limit = $request->integer('limit', 5, 1, 10);

        $sectorRows = $this->all('SELECT s.name, SUM(er.job_count) AS value
            ' . $fromSql . '
            GROUP BY s.id, s.name
            ORDER BY value DESC', $params);
        $sectors = array_map(static fn (array $row): array => [
            'name' => $row['name'],
            'value' => (int) $row['value'],
            'percent' => $jobsCreated === 0 ? 0 : (int) round(((int) $row['value'] / $jobsCreated) * 100),
        ], $sectorRows);

        $topJobs = $this->all('SELECT j.slug AS id, j.name, SUM(er.job_count) AS value
            ' . $fromSql . '
            GROUP BY j.id, j.slug, j.name
            ORDER BY value DESC
            LIMIT ' . $limit, $params);
        $topCompanies = $this->all('SELECT c.name, SUM(er.job_count) AS value
            ' . $fromSql . '
            GROUP BY c.id, c.name
            ORDER BY value DESC
            LIMIT 5', $params);

        return [
            'metadata' => [
                'period' => $params[':period'],
                'lastUpdated' => '27 septembre 2026',
                ...$this->metadata('Jeu de données LogPose de démonstration — ne pas utiliser comme statistique officielle.'),
            ],
            'appliedFilters' => [
                'zones' => $request->list('zones'),
                'sectors' => $request->list('sectors'),
                'companies' => $request->list('companies'),
                'employmentTypes' => $request->list('employmentTypes'),
            ],
            'kpis' => ['jobsCreated' => $jobsCreated, 'variationPercent' => (int) ($kpis['variation'] ?? 0)],
            'sectorDistribution' => $sectors,
            'topJobs' => array_map(static fn (array $row): array => ['id' => $row['id'], 'name' => $row['name'], 'value' => (int) $row['value']], $topJobs),
            'topCompanies' => array_map(static fn (array $row): array => ['name' => $row['name'], 'value' => (int) $row['value']], $topCompanies),
            'totalRows' => (int) ($this->one('SELECT COUNT(*) AS count' . $fromSql, $params)['count'] ?? 0),
        ];
    }

    /** @return array<string, mixed> */
    private function catalog(Request $request): array
    {
        $category = trim((string) ($request->query['category'] ?? ''));
        $term = trim((string) ($request->query['q'] ?? ''));
        $params = [];
        $where = [];
        if ($category !== '') {
            $where[] = 'jc.slug = :category';
            $params[':category'] = $category;
        }
        if ($term !== '') {
            $where[] = '(j.name LIKE :term OR j.description LIKE :term OR s.name LIKE :term)';
            $params[':term'] = '%' . $term . '%';
        }
        $whereSql = $where === [] ? '' : ' WHERE ' . implode(' AND ', $where);

        $categories = $this->all('SELECT jc.slug AS id, jc.name, jc.description, jc.symbol, COUNT(j.id) AS job_count
            FROM job_categories jc
            LEFT JOIN jobs j ON j.category_id = jc.id
            GROUP BY jc.id, jc.slug, jc.name, jc.description, jc.symbol
            ORDER BY jc.sort_order, jc.name');
        $items = $this->all('SELECT j.slug AS id, j.name, jc.slug AS category_id, jc.name AS category,
                jc.symbol AS category_symbol, s.name AS sector, j.description, j.profile
            FROM jobs j
            INNER JOIN job_categories jc ON jc.id = j.category_id
            INNER JOIN sectors s ON s.id = j.sector_id' . $whereSql . '
            ORDER BY jc.sort_order, j.name', $params);

        return [
            'metadata' => $this->metadata('Référentiel métiers LogPose de démonstration — contenu à faire valider avant diffusion.'),
            'categories' => array_map(static fn (array $row): array => [
                'id' => $row['id'], 'name' => $row['name'], 'description' => $row['description'],
                'symbol' => $row['symbol'], 'jobCount' => (int) $row['job_count'],
            ], $categories),
            'items' => $items,
        ];
    }

    /** @return array<string, mixed> */
    private function job(string $slug): array
    {
        $job = $this->one('SELECT j.id AS database_id, j.slug AS id, j.name, jc.slug AS category_id, jc.name AS category,
                jc.symbol AS category_symbol, s.name AS sector, j.description, j.profile, j.mission
            FROM jobs j
            INNER JOIN job_categories jc ON jc.id = j.category_id
            INNER JOIN sectors s ON s.id = j.sector_id
            WHERE j.slug = :slug', [':slug' => $slug]);
        if ($job === false) {
            throw new ApiException('Métier introuvable.', 404);
        }

        $databaseId = (int) $job['database_id'];
        unset($job['database_id']);
        $job['skills'] = array_column($this->all('SELECT name FROM skills WHERE job_id = :job ORDER BY sort_order, name', [':job' => $databaseId]), 'name');
        $job['trainings'] = $this->all('SELECT p.name, p.level, p.format
            FROM programs p
            INNER JOIN program_jobs pj ON pj.program_id = p.id
            WHERE pj.job_id = :job
            ORDER BY p.level, p.name', [':job' => $databaseId]);
        $job['companies'] = array_column($this->all('SELECT DISTINCT c.name
            FROM employment_records er
            INNER JOIN companies c ON c.id = er.company_id
            WHERE er.job_id = :job
            ORDER BY c.name', [':job' => $databaseId]), 'name');

        return ['metadata' => $this->metadata('Référentiel métiers LogPose de démonstration.'), 'item' => $job];
    }

    /** @return array{series:list<string>,fields:list<string>,jobs:list<string>} */
    private function educationOptions(): array
    {
        return [
            'series' => array_column($this->all('SELECT DISTINCT bs.name
                FROM baccalaureate_series bs
                INNER JOIN program_series ps ON ps.series_id = bs.id
                ORDER BY bs.sort_order'), 'name'),
            'fields' => array_column($this->all('SELECT DISTINCT field AS name FROM programs ORDER BY name'), 'name'),
            'jobs' => array_column($this->all('SELECT DISTINCT j.name
                FROM jobs j
                INNER JOIN program_jobs pj ON pj.job_id = j.id
                ORDER BY j.name'), 'name'),
        ];
    }

    /** @return array<string, mixed> */
    private function establishments(Request $request): array
    {
        $series = $request->list('series');
        $fields = $request->list('fields');
        $jobs = $request->list('jobs');
        $where = ['1 = 1'];
        $params = [];
        if ($series !== []) {
            $where[] = 'EXISTS (SELECT 1 FROM program_series psf INNER JOIN baccalaureate_series bsf ON bsf.id = psf.series_id WHERE psf.program_id = p.id AND bsf.name IN (' . $this->placeholders('series', $series, $params) . '))';
        }
        $this->addInFilter($fields, 'p.field', 'field', $params, $where);
        if ($jobs !== []) {
            $where[] = 'EXISTS (SELECT 1 FROM program_jobs pjf INNER JOIN jobs jf ON jf.id = pjf.job_id WHERE pjf.program_id = p.id AND jf.name IN (' . $this->placeholders('job', $jobs, $params) . '))';
        }
        $rows = $this->all('SELECT p.id, e.slug AS establishment_id, e.name AS establishment, e.city, e.country,
                p.field, p.name AS program, p.duration, p.level, p.format
            FROM programs p
            INNER JOIN establishments e ON e.id = p.establishment_id
            WHERE ' . implode(' AND ', $where) . '
            ORDER BY e.name, p.name', $params);

        return [
            'metadata' => $this->metadata('Référentiel établissements LogPose de démonstration — données à contractualiser.'),
            'appliedFilters' => ['series' => $series, 'fields' => $fields, 'jobs' => $jobs],
            'items' => array_map(fn (array $row): array => $this->programPayload($row), $rows),
        ];
    }

    /** @param array<string, mixed> $program @return array<string, mixed> */
    private function programPayload(array $program): array
    {
        $id = (int) $program['id'];
        return [
            'id' => $program['establishment_id'] . '-' . $id,
            'establishmentId' => $program['establishment_id'],
            'establishment' => $program['establishment'],
            'city' => $program['city'],
            'country' => $program['country'],
            'field' => $program['field'],
            'program' => $program['program'],
            'duration' => $program['duration'],
            'series' => array_column($this->all('SELECT bs.name FROM program_series ps INNER JOIN baccalaureate_series bs ON bs.id = ps.series_id WHERE ps.program_id = :program ORDER BY bs.sort_order', [':program' => $id]), 'name'),
            'jobs' => array_column($this->all('SELECT j.name FROM program_jobs pj INNER JOIN jobs j ON j.id = pj.job_id WHERE pj.program_id = :program ORDER BY j.name', [':program' => $id]), 'name'),
        ];
    }

    /** @return array{series:list<string>,fields:list<string>} */
    private function contestOptions(): array
    {
        return [
            'series' => array_column($this->all('SELECT DISTINCT bs.name
                FROM baccalaureate_series bs
                INNER JOIN contest_series cs ON cs.series_id = bs.id
                ORDER BY bs.sort_order'), 'name'),
            'fields' => array_column($this->all('SELECT DISTINCT field AS name FROM contests ORDER BY name'), 'name'),
        ];
    }

    /** @return array<string, mixed> */
    private function contests(Request $request): array
    {
        $series = $request->list('series');
        $fields = $request->list('fields');
        $where = ['1 = 1'];
        $params = [];
        if ($series !== []) {
            $where[] = 'EXISTS (SELECT 1 FROM contest_series csf INNER JOIN baccalaureate_series bsf ON bsf.id = csf.series_id WHERE csf.contest_id = c.id AND bsf.name IN (' . $this->placeholders('contest_series', $series, $params) . '))';
        }
        $this->addInFilter($fields, 'c.field', 'contest_field', $params, $where);
        $rows = $this->all('SELECT c.id AS database_id, c.slug AS id, c.name, c.organizer, c.city, c.field, c.description,
                COUNT(p.id) AS paper_count
            FROM contests c
            LEFT JOIN papers p ON p.contest_id = c.id
            WHERE ' . implode(' AND ', $where) . '
            GROUP BY c.id, c.slug, c.name, c.organizer, c.city, c.field, c.description
            ORDER BY c.name', $params);

        return [
            'metadata' => $this->metadata('Référentiel concours LogPose de démonstration — dates et pièces à confirmer.'),
            'appliedFilters' => ['series' => $series, 'fields' => $fields],
            'items' => array_map(fn (array $row): array => $this->contestPayload($row), $rows),
        ];
    }

    /** @param array<string, mixed> $contest @return array<string, mixed> */
    private function contestPayload(array $contest): array
    {
        $databaseId = (int) $contest['database_id'];
        return [
            'id' => $contest['id'],
            'name' => $contest['name'],
            'organizer' => $contest['organizer'],
            'city' => $contest['city'],
            'field' => $contest['field'],
            'series' => array_column($this->all('SELECT bs.name FROM contest_series cs INNER JOIN baccalaureate_series bs ON bs.id = cs.series_id WHERE cs.contest_id = :contest ORDER BY bs.sort_order', [':contest' => $databaseId]), 'name'),
            'description' => $contest['description'],
            'paperCount' => (int) $contest['paper_count'],
        ];
    }

    /** @return array<string, mixed> */
    private function contestPapers(string $slug): array
    {
        $contest = $this->one('SELECT c.id AS database_id, c.slug AS id, c.name, c.organizer, c.city, c.field, c.description,
                COUNT(p.id) AS paper_count
            FROM contests c
            LEFT JOIN papers p ON p.contest_id = c.id
            WHERE c.slug = :slug
            GROUP BY c.id, c.slug, c.name, c.organizer, c.city, c.field, c.description', [':slug' => $slug]);
        if ($contest === false) {
            throw new ApiException('Concours introuvable.', 404);
        }
        $databaseId = (int) $contest['database_id'];

        return [
            'metadata' => $this->metadata('Référentiel annales LogPose de démonstration — aucun fichier source n’est encore publié.'),
            'contest' => $this->contestPayload($contest),
            'papers' => array_map(static fn (array $row): array => [
                'id' => $row['slug'], 'label' => $row['label'], 'year' => (int) $row['year'],
                'type' => $row['document_type'], 'pages' => (int) $row['page_count'],
            ], $this->all('SELECT slug, label, year, document_type, page_count FROM papers WHERE contest_id = :contest ORDER BY year DESC, label', [':contest' => $databaseId])),
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private function interestDefinitions(): array
    {
        return [
            'numerique' => [
                'label' => 'Technologies et données',
                'description' => 'Créer des outils, analyser des informations ou piloter des produits numériques.',
                'jobs' => ['developpeur-fullstack', 'data-analyst', 'product-manager'],
                'activities' => [
                    ['value' => 'build', 'label' => 'Construire des applications', 'description' => 'Donner vie à des outils numériques.'],
                    ['value' => 'analyse', 'label' => 'Comprendre les données', 'description' => 'Faire parler les chiffres pour aider à décider.'],
                    ['value' => 'organise', 'label' => 'Coordonner un produit', 'description' => 'Relier les besoins des utilisateurs et une équipe.'],
                ],
                'activityJobs' => ['build' => 'developpeur-fullstack', 'analyse' => 'data-analyst', 'organise' => 'product-manager'],
            ],
            'sante' => [
                'label' => 'Santé et sciences du vivant',
                'description' => 'Prendre soin, observer et appliquer des protocoles précis.',
                'jobs' => ['infirmier-de', 'laborantin', 'aide-soignant'],
                'activities' => [
                    ['value' => 'soin', 'label' => 'Accompagner et soigner', 'description' => 'Être au contact des patients au quotidien.'],
                    ['value' => 'analyse', 'label' => 'Observer et analyser', 'description' => 'Travailler avec des prélèvements et protocoles.'],
                    ['value' => 'soutien', 'label' => 'Apporter un soutien concret', 'description' => 'Contribuer au confort et au bien-être des personnes.'],
                ],
                'activityJobs' => ['soin' => 'infirmier-de', 'analyse' => 'laborantin', 'soutien' => 'aide-soignant'],
            ],
            'btp' => [
                'label' => 'Bâtiment et industrie',
                'description' => 'Construire, maintenir et coordonner des réalisations sur le terrain.',
                'jobs' => ['chef-de-chantier', 'technicien-electricien', 'conducteur-de-travaux', 'mecanicien-industriel'],
                'activities' => [
                    ['value' => 'terrain', 'label' => 'Organiser un chantier', 'description' => 'Coordonner les équipes et suivre l’avancement.'],
                    ['value' => 'technique', 'label' => 'Intervenir sur des équipements', 'description' => 'Installer, entretenir et diagnostiquer.'],
                    ['value' => 'planifier', 'label' => 'Planifier des ouvrages', 'description' => 'Préparer les moyens, délais et ressources.'],
                ],
                'activityJobs' => ['terrain' => 'chef-de-chantier', 'technique' => 'technicien-electricien', 'planifier' => 'conducteur-de-travaux'],
            ],
            'environnement' => [
                'label' => 'Environnement et agriculture',
                'description' => 'Préserver les ressources et agir avec les communautés sur le terrain.',
                'jobs' => ['technicien-environnement', 'animateur-agricole'],
                'activities' => [
                    ['value' => 'mesurer', 'label' => 'Observer les milieux', 'description' => 'Collecter et suivre des données environnementales.'],
                    ['value' => 'transmettre', 'label' => 'Transmettre sur le terrain', 'description' => 'Partager des pratiques utiles avec les communautés.'],
                ],
                'activityJobs' => ['mesurer' => 'technicien-environnement', 'transmettre' => 'animateur-agricole'],
            ],
            'gestion' => [
                'label' => 'Gestion, commerce et services',
                'description' => 'Conseiller, organiser des flux ou suivre l’activité financière.',
                'jobs' => ['conseiller-clientele', 'assistant-comptable', 'responsable-logistique'],
                'activities' => [
                    ['value' => 'conseil', 'label' => 'Conseiller des clients', 'description' => 'Écouter les besoins et proposer des solutions.'],
                    ['value' => 'chiffres', 'label' => 'Travailler avec les chiffres', 'description' => 'Suivre des opérations et structurer l’information.'],
                    ['value' => 'flux', 'label' => 'Organiser les flux', 'description' => 'Faire circuler produits, stocks et informations.'],
                ],
                'activityJobs' => ['conseil' => 'conseiller-clientele', 'chiffres' => 'assistant-comptable', 'flux' => 'responsable-logistique'],
            ],
            'communication' => [
                'label' => 'Communication et développement commercial',
                'description' => 'Faire connaître une offre, créer des contenus ou développer des relations clients.',
                'jobs' => ['digital-marketer', 'agent-commercial', 'product-manager'],
                'activities' => [
                    ['value' => 'contenu', 'label' => 'Créer et faire connaître', 'description' => 'Imaginer des messages et suivre leur impact.'],
                    ['value' => 'vente', 'label' => 'Échanger et convaincre', 'description' => 'Comprendre les besoins pour développer une activité.'],
                    ['value' => 'projet', 'label' => 'Faire avancer un projet', 'description' => 'Organiser les besoins et les priorités.'],
                ],
                'activityJobs' => ['contenu' => 'digital-marketer', 'vente' => 'agent-commercial', 'projet' => 'product-manager'],
            ],
        ];
    }

    /** @param array<string, string> $answers @return array<string, mixed>|null */
    private function orientationQuestion(array $answers): ?array
    {
        if (!isset($answers['series'])) {
            return [
                'id' => 'series', 'step' => 1, 'total' => 5, 'eyebrow' => 'Votre parcours scolaire',
                'prompt' => 'Quelle série de baccalauréat préparez-vous ou avez-vous obtenue ?',
                'helper' => 'Cette réponse permet d’afficher des pistes adaptées, sans fermer les autres possibilités.',
                'options' => [
                    ['value' => 'Série C', 'label' => 'Série C', 'description' => 'Mathématiques et sciences physiques.'],
                    ['value' => 'Série D', 'label' => 'Série D', 'description' => 'Sciences de la vie et de la terre.'],
                    ['value' => 'Série A', 'label' => 'Série A', 'description' => 'Lettres, langues et sciences humaines.'],
                    ['value' => 'Série G2', 'label' => 'Série G2', 'description' => 'Comptabilité et gestion.'],
                ],
            ];
        }

        $interests = $this->interestDefinitions();
        if (!isset($answers['interest'])) {
            $keys = in_array($answers['series'], ['Série C', 'Série D'], true)
                ? ['numerique', 'sante', 'btp', 'environnement', 'gestion']
                : ($answers['series'] === 'Série G2'
                    ? ['gestion', 'communication', 'numerique', 'environnement']
                    : ['communication', 'gestion', 'numerique', 'environnement', 'sante']);
            $options = array_map(static fn (string $key): array => [
                'value' => $key, 'label' => $interests[$key]['label'], 'description' => $interests[$key]['description'],
            ], $keys);

            return [
                'id' => 'interest', 'step' => 2, 'total' => 5, 'eyebrow' => 'Après ' . $answers['series'],
                'prompt' => 'Quel univers vous attire le plus aujourd’hui ?',
                'helper' => 'Choisissez celui qui correspond le mieux à votre curiosité, même si vous hésitez encore.',
                'options' => $options,
            ];
        }

        if (!isset($answers['activity'])) {
            $interest = $interests[$answers['interest']];
            return [
                'id' => 'activity', 'step' => 3, 'total' => 5, 'eyebrow' => $interest['label'],
                'prompt' => 'Dans cet univers, qu’aimeriez-vous faire le plus souvent ?',
                'helper' => 'Votre choix affinera les métiers proposés, à l’intérieur de l’univers sélectionné.',
                'options' => $interest['activities'],
            ];
        }

        if (!isset($answers['location'])) {
            return [
                'id' => 'location', 'step' => 4, 'total' => 5, 'eyebrow' => 'Vos contraintes',
                'prompt' => 'Où souhaitez-vous envisager votre formation en priorité ?',
                'helper' => 'Nous privilégierons les parcours référencés dans la zone choisie, sans exclure les autres options.',
                'options' => [
                    ['value' => 'Brazzaville', 'label' => 'Brazzaville', 'description' => 'Prioriser les parcours référencés dans la capitale.'],
                    ['value' => 'Pointe-Noire', 'label' => 'Pointe-Noire', 'description' => 'Prioriser les parcours référencés à Pointe-Noire.'],
                    ['value' => 'Toutes les villes', 'label' => 'Je reste ouvert(e)', 'description' => 'Explorer les parcours disponibles dans plusieurs villes.'],
                ],
            ];
        }

        if (!isset($answers['duration'])) {
            return [
                'id' => 'duration', 'step' => 5, 'total' => 5, 'eyebrow' => 'Votre projet de formation',
                'prompt' => 'Quel type de parcours vous convient le mieux pour commencer ?',
                'helper' => 'Ce choix sert à prioriser les pistes ; il ne remplace pas les conditions d’admission des établissements.',
                'options' => [
                    ['value' => 'court', 'label' => 'Parcours court', 'description' => 'Privilégier une formation professionnalisante autour de 2 ans.'],
                    ['value' => 'long', 'label' => 'Parcours diplômant', 'description' => 'Privilégier une licence ou un parcours autour de 3 ans.'],
                    ['value' => 'ouvert', 'label' => 'Je compare les deux', 'description' => 'Recevoir des pistes sans préférence de durée.'],
                ],
            ];
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function createOrientationSession(): array
    {
        $id = bin2hex(random_bytes(16));
        $this->pdo->prepare('INSERT INTO orientation_sessions (id, answers, status) VALUES (:id, JSON_OBJECT(), "open")')
            ->execute([':id' => $id]);

        return ['sessionId' => $id, 'question' => $this->orientationQuestion([])];
    }

    /** @return array<string, mixed> */
    private function answerOrientation(string $sessionId, Request $request): array
    {
        $this->pdo->beginTransaction();
        try {
            $session = $this->one('SELECT id, answers, status FROM orientation_sessions WHERE id = :id FOR UPDATE', [':id' => $sessionId]);
            if ($session === false) {
                throw new ApiException('Session d’orientation introuvable.', 404);
            }
            $answers = json_decode((string) $session['answers'], true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($answers)) {
                $answers = [];
            }
            $question = $this->orientationQuestion($answers);
            if ($question === null) {
                throw new ApiException('Cette session est déjà terminée.', 409);
            }
            $questionId = $request->bodyString('questionId');
            $answer = $request->bodyString('answer');
            if ($questionId !== $question['id']) {
                throw new ApiException('La réponse ne correspond pas à la question en cours.', 400);
            }
            $valid = false;
            foreach ($question['options'] as $option) {
                if ($option['value'] === $answer) {
                    $valid = true;
                    break;
                }
            }
            if (!$valid) {
                throw new ApiException('La réponse sélectionnée est invalide pour cette question.', 422);
            }
            $answers[$questionId] = $answer;
            $nextQuestion = $this->orientationQuestion($answers);
            $this->pdo->prepare('UPDATE orientation_sessions SET answers = :answers, status = :status, completed_at = CASE WHEN :completed = 1 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = :id')
                ->execute([
                    ':answers' => json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                    ':status' => $nextQuestion === null ? 'completed' : 'open',
                    ':completed' => $nextQuestion === null ? 1 : 0,
                    ':id' => $sessionId,
                ]);
            $this->pdo->commit();

            return [
                'status' => 200,
                'sessionId' => $sessionId,
                'completed' => $nextQuestion === null,
                'question' => $nextQuestion,
                'profile' => $nextQuestion === null ? $this->orientationProfile($answers) : null,
            ];
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }
    }

    /** @param array<string, string> $answers @return list<array{label:string,value:string}> */
    private function orientationProfile(array $answers): array
    {
        $interests = $this->interestDefinitions();
        $activityLabel = '';
        if (isset($answers['interest'], $answers['activity'], $interests[$answers['interest']])) {
            foreach ($interests[$answers['interest']]['activities'] as $activity) {
                if ($activity['value'] === $answers['activity']) {
                    $activityLabel = $activity['label'];
                }
            }
        }
        $durationLabels = ['court' => 'Parcours court', 'long' => 'Parcours diplômant', 'ouvert' => 'Je compare les deux'];
        $locationLabels = ['Toutes les villes' => 'Je reste ouvert(e)'];

        return [
            ['label' => 'Série du baccalauréat', 'value' => $answers['series']],
            ['label' => 'Univers d’intérêt', 'value' => $interests[$answers['interest']]['label']],
            ['label' => 'Préférence d’activité', 'value' => $activityLabel],
            ['label' => 'Zone de formation', 'value' => $locationLabels[$answers['location']] ?? $answers['location']],
            ['label' => 'Type de parcours', 'value' => $durationLabels[$answers['duration']] ?? $answers['duration']],
        ];
    }

    /** @param array<string, string> $answers @return array<string, mixed>|null */
    private function pathwayForJob(int $jobId, array $answers): ?array
    {
        $location = $answers['location'];
        $duration = $answers['duration'];
        $row = $this->one('SELECT p.id, e.name AS establishment, e.city, p.field, p.name AS program, p.duration
            FROM programs p
            INNER JOIN establishments e ON e.id = p.establishment_id
            INNER JOIN program_jobs pj ON pj.program_id = p.id
            INNER JOIN program_series ps ON ps.program_id = p.id
            INNER JOIN baccalaureate_series bs ON bs.id = ps.series_id
            WHERE pj.job_id = :job AND bs.name = :series
            ORDER BY (e.city = :location) DESC,
                (CASE WHEN :duration = "court" THEN p.duration_months <= 24 WHEN :duration = "long" THEN p.duration_months >= 30 ELSE 0 END) DESC,
                p.name
            LIMIT 1', [':job' => $jobId, ':series' => $answers['series'], ':location' => $location, ':duration' => $duration]);
        if ($row === false) {
            return null;
        }

        return [
            'establishment' => $row['establishment'],
            'city' => $row['city'],
            'field' => $row['field'],
            'program' => $row['program'],
            'duration' => $row['duration'],
            'series' => [$answers['series']],
            'jobs' => [],
        ];
    }

    /** @return array<string, mixed> */
    private function orientationRecommendations(string $sessionId): array
    {
        $session = $this->one('SELECT answers FROM orientation_sessions WHERE id = :id', [':id' => $sessionId]);
        if ($session === false) {
            throw new ApiException('Session d’orientation introuvable.', 404);
        }
        $answers = json_decode((string) $session['answers'], true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($answers) || $this->orientationQuestion($answers) !== null) {
            throw new ApiException('Le questionnaire doit être terminé avant de générer les recommandations.', 409);
        }
        $interests = $this->interestDefinitions();
        $interest = $interests[$answers['interest']];
        $primarySlug = $interest['activityJobs'][$answers['activity']];
        $slugs = array_slice(array_values(array_unique([$primarySlug, ...$interest['jobs']])), 0, 3);
        $recommendations = [];

        foreach ($slugs as $index => $slug) {
            $job = $this->one('SELECT j.id, j.slug, j.name, jc.name AS category
                FROM jobs j INNER JOIN job_categories jc ON jc.id = j.category_id WHERE j.slug = :slug', [':slug' => $slug]);
            if ($job === false) {
                continue;
            }
            $pathway = $this->pathwayForJob((int) $job['id'], $answers);
            $score = 91 - ($index * 8);
            if ($pathway !== null && $answers['location'] !== 'Toutes les villes' && $pathway['city'] === $answers['location']) {
                $score += 3;
            }
            if ($pathway !== null && $answers['duration'] === 'court' && str_starts_with($pathway['duration'], '2')) {
                $score += 2;
            }
            if ($pathway !== null && $answers['duration'] === 'long' && str_starts_with($pathway['duration'], '3')) {
                $score += 2;
            }
            $interestLabel = function_exists('mb_strtolower')
                ? mb_strtolower($interest['label'], 'UTF-8')
                : strtolower($interest['label']);
            $recommendations[] = [
                'rank' => $index + 1,
                'jobId' => $job['slug'],
                'job' => $job['name'],
                'category' => $job['category'],
                'score' => min($score, 98),
                'reason' => $index === 0
                    ? 'Votre préférence d’activité correspond directement à cette piste.'
                    : 'Cette piste reste cohérente avec votre intérêt pour ' . $interestLabel . '.',
                'pathway' => $pathway,
            ];
        }

        return [
            'metadata' => $this->metadata('Moteur de règles LogPose — recommandations indicatives.'),
            'profile' => $this->orientationProfile($answers),
            'recommendations' => $recommendations,
        ];
    }
}
